import io
import json
import os
from pathlib import Path
import re
from typing import Annotated, List, Literal, Optional

from docx import Document
from fastapi import FastAPI, File, HTTPException, Security, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
import http
from openai import (
    APIConnectionError,
    APIError,
    APIStatusError,
    AuthenticationError,
    NotFoundError,
    OpenAI,
    PermissionDeniedError,
    RateLimitError,
)
from pydantic import BaseModel, Field, ValidationError

# =====================================================================
# 1. CONFIGURATION & FASTAPI INITIALIZATION
# =====================================================================
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
DEFAULT_GEMINI_MODEL = "gemini-3.8-flash"

_PLACEHOLDER_PATTERNS = (
    "your_actual_gemini_api_key_here",
    "your_full_key_here",
    "replace_this_with_your_real_key",
    "paste_your_full_key_here",
    "paste_your_complete_key_here",
    "<your_api_key_here>",
    "your_api_key",
    "gemini_api_key",
)

api_key_header_scheme = APIKeyHeader(
    name="X-Gemini-Api-Key",
    description="Optional: Paste your Gemini API key (AQ.Ab8R... or AIza...) here in Swagger UI to override .env / environment variables.",
    auto_error=False,
)


def _clean_env_value(val: str | None) -> str:
    """Strips whitespace, inline comments, and accidental surrounding quotes."""
    if not val:
        return ""
    cleaned = val.strip()
    if (cleaned.startswith('"') and cleaned.endswith('"')) or (
        cleaned.startswith("'") and cleaned.endswith("'")
    ):
        cleaned = cleaned[1:-1].strip()
    return cleaned.strip("\"'").strip()


def _is_placeholder_key(key: str) -> bool:
    lowered = key.lower()
    return any(pat in lowered for pat in _PLACEHOLDER_PATTERNS)


def _read_dotenv_dict() -> dict[str, str]:
    """
    Reads key-value pairs from supported env files in the current working
    directory, main.py's directory, or its parent directory.
    """
    if os.getenv("PYTEST_CURRENT_TEST"):
        return {}

    script_dir = Path(__file__).resolve().parent
    base_dirs = [Path.cwd(), script_dir, script_dir.parent]
    candidates = []
    for directory in base_dirs:
        for name in (".env", ".env.local", ".env.txt", "abh.env"):
            path = directory / name
            if path not in candidates:
                candidates.append(path)

    result: dict[str, str] = {}
    for dotenv_path in candidates:
        if not dotenv_path.is_file():
            continue
        try:
            for raw_line in dotenv_path.read_text(encoding="utf-8", errors="ignore").splitlines():
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                if line.lower().startswith("export "):
                    line = line[7:].strip()
                elif line.lower().startswith("set "):
                    line = line[4:].strip()
                elif line.lower().startswith("$env:"):
                    line = line[5:].strip()
                k, _, v = line.partition("=")
                k = k.strip()
                v = _clean_env_value(v)
                if k and v:
                    result[k] = v
        except OSError:
            continue
    return result


def get_gemini_model() -> str:
    """Returns the configured Gemini model name, defaulting to gemini-3.8-flash."""
    dotenv_vars = _read_dotenv_dict()
    env_model = _clean_env_value(os.getenv("GEMINI_MODEL"))
    dotenv_model = dotenv_vars.get("GEMINI_MODEL", "")
    return dotenv_model or env_model or DEFAULT_GEMINI_MODEL


def _get_candidate_api_keys(override_key: str | None = None) -> list[str]:
    """
    Collects all candidate Gemini API keys from Swagger UI override, .env files,
    and environment variables. Prioritizes valid 'AQ.' auth keys over stale 'AIza'
    keys when both are present on the system.
    """
    raw_candidates: list[str] = []
    if override_key:
        cleaned_override = _clean_env_value(override_key)
        if cleaned_override:
            raw_candidates.append(cleaned_override)

    dotenv_vars = _read_dotenv_dict()
    for k in ("GEMINI_API_KEY", "GOOGLE_API_KEY"):
        val = dotenv_vars.get(k, "")
        if val and val not in raw_candidates:
            raw_candidates.append(val)

    env_val = _clean_env_value(os.getenv("GEMINI_API_KEY"))
    if env_val and env_val not in raw_candidates:
        raw_candidates.append(env_val)

    valid_non_placeholders = [k for k in raw_candidates if not _is_placeholder_key(k)]
    if not valid_non_placeholders:
        return raw_candidates

    if not override_key:
        aq_keys = [k for k in valid_non_placeholders if k.startswith("AQ.")]
        other_keys = [k for k in valid_non_placeholders if not k.startswith("AQ.")]
        return aq_keys + other_keys

    return valid_non_placeholders


def _get_gemini_api_key(override_key: str | None = None) -> str:
    """Retrieves the highest-priority Gemini API key without logging or exposing it."""
    candidates = _get_candidate_api_keys(override_key)
    return candidates[0] if candidates else ""


def _classify_key_format(api_key: str) -> str:
    """Returns a non-sensitive label describing the detected key type for /health."""
    if not api_key:
        return "missing"
    if _is_placeholder_key(api_key):
        return "placeholder_detected"
    if api_key.startswith("AQ."):
        return "google_auth_key (AQ.*)"
    if api_key.startswith("AIza"):
        return "google_standard_key (AIza*)"
    return "custom_key"


def _sanitize_error_message(message: str, api_key: str | None = None) -> str:
    if not message:
        return "Unknown error"

    sanitized = message
    if api_key:
        sanitized = sanitized.replace(api_key, "[REDACTED]")

    sanitized = re.sub(
        r"(?i)(authorization\s*[:=]\s*)(?:bearer\s+)?[^\s,;\"']+",
        r"\1[REDACTED]",
        sanitized,
    )
    sanitized = re.sub(r"(?i)\bbearer\s+[A-Za-z0-9._\-]+", "Bearer [REDACTED]", sanitized)
    sanitized = re.sub(r"AIza[0-9A-Za-z\-_]{10,}", "[REDACTED]", sanitized)
    sanitized = re.sub(r"AQ\.[0-9A-Za-z._\-]{10,}", "[REDACTED]", sanitized)

    return sanitized


app = FastAPI(
    title="AI Cybercrime Investigator - Ekdanta Engine API",
    description="Autonomous AI digital forensic investigation backend powered by Google Gemini.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================================
# 2. PYDANTIC MODELS
# =====================================================================
class Entity(BaseModel):
    id: str = Field(..., description="Unique ID (e.g., 'emp_rohit', 'dev_sc192', 'file_orion')")
    type: Literal["PERSON", "DEVICE", "FILE", "IP", "CREDENTIAL"] = Field(
        ..., description="Entity category"
    )
    label: str = Field(..., description="Human-readable label (e.g., 'Rohit (DevOps Engineer)')")
    is_suspicious: bool = Field(
        ..., description="True if part of the attack chain or used as a decoy"
    )


class Relationship(BaseModel):
    source_id: str = Field(..., description="Source node ID")
    target_id: str = Field(..., description="Target node ID")
    action: str = Field(
        ..., description="Relationship action (e.g., 'AUTHENTICATED_USING', 'ACCESSED', 'ASSIGNED_TO')"
    )
    timestamp: str = Field(..., description="Time of interaction (e.g., '23:50 IST' or 'N/A')")
    evidence_text: str = Field(..., description="1-sentence concise explanation of this link")


class TimelineEvent(BaseModel):
    time: str = Field(..., description="Timestamp of the event (e.g., '23:42 IST')")
    description: str = Field(..., description="Description of what occurred")
    classification: Literal["NORMAL", "ANOMALOUS", "CRITICAL"] = Field(
        ..., description="Severity classification of the event"
    )
    related_entities: List[str] = Field(
        default_factory=list, description="Array of node IDs involved in this event"
    )


class InvestigationReport(BaseModel):
    target_asset: str = Field(..., description="Name of the compromised file/data")
    primary_lead: str = Field(..., description="The most likely compromise vector")
    evidence_chain: List[str] = Field(
        ..., description="Bullet points explaining attack logic, red herrings, and exfiltration"
    )
    disclaimer: str = Field(
        ...,
        description="Standard disclaimer: Evidence-Supported Suspicion — NOT Proof of Guilt.",
    )


class CaseAnalysisResponse(BaseModel):
    nodes: List[Entity]
    edges: List[Relationship]
    timeline: List[TimelineEvent]
    report: InvestigationReport


# =====================================================================
# 3. SYSTEM PROMPT CONFIGURATION
# =====================================================================
EKDANTA_SYSTEM_PROMPT = """# SYSTEM ROLE: EKDANTA - ELITE DIGITAL FORENSIC AGENT
You are Ekdanta, an autonomous AI digital forensic investigator. You are the core reasoning engine of the "AI Cybercrime Investigator" system. Your task is to ingest unstructured, noisy cybercrime case files (raw text dumps of logs, CCTV, HR records, network events), reason through the evidence, identify the true attack chain, and output a highly structured JSON graph payload for the frontend UI.

## CORE DIRECTIVES & REASONING PROTOCOL
You do not jump to conclusions. You operate on evidence, not assumptions. Execute your investigation using the following internal logic before generating output:

1. Entity Extraction: Identify all actors (People), hardware (Devices), assets (Files), network points (IPs), and access tokens (Credentials).
2. Timeline Alignment: Normalize all events into a chronological timeline. Cross-reference physical security logs (CCTV, Access Cards) with digital logs (VPN, Server logins).
3. Hypothesis Testing & Red Herring Rejection:
   - Attackers use decoys (e.g., waking up a vacant workstation to frame someone).
   - Cross-check workstation activity against HR attendance or leave records.
   - Crucial Rule: Credentials DO NOT equal human presence. If a credential is used from an unauthorized IP or device, suspect token hijacking or credential theft, not necessarily the employee.
4. Relationship Mapping: Connect entities based ONLY on evidence. (e.g., User -> Assigned Device, Credential -> Accessed File).

## YOUR TASK
Analyze the provided cybercrime case file thoroughly and return ONLY a raw JSON object matching the exact schema below. Do not include markdown formatting (like ```json), conversational text, or internal reasoning steps in the final output. Output ONLY the valid JSON structure.

## REQUIRED JSON SCHEMA
{
  "nodes": [
    {
      "id": "string",
      "type": "PERSON | DEVICE | FILE | IP | CREDENTIAL",
      "label": "string",
      "is_suspicious": true
    }
  ],
  "edges": [
    {
      "source_id": "string",
      "target_id": "string",
      "action": "string",
      "timestamp": "string",
      "evidence_text": "string"
    }
  ],
  "timeline": [
    {
      "time": "string",
      "description": "string",
      "classification": "NORMAL | ANOMALOUS | CRITICAL",
      "related_entities": ["string"]
    }
  ],
  "report": {
    "target_asset": "string",
    "primary_lead": "string",
    "evidence_chain": [
      "string",
      "string",
      "string"
    ],
    "disclaimer": "string"
  }
}"""


# =====================================================================
# 4. DOCX PARSER HELPER
# =====================================================================
def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        file_stream = io.BytesIO(file_bytes)
        document = Document(file_stream)

        extracted_lines: List[str] = []

        for paragraph in document.paragraphs:
            text = paragraph.text.strip()
            if text:
                extracted_lines.append(text)

        for table in document.tables:
            for row in table.rows:
                row_text = " | ".join(
                    cell.text.strip() for cell in row.cells if cell.text.strip()
                )
                if row_text:
                    extracted_lines.append(row_text)

        full_text = "\n".join(extracted_lines).strip()
        if not full_text:
            raise ValueError("The uploaded DOCX document contains no readable text.")

        return full_text
    except ValueError:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse DOCX file: {str(exc)}",
        ) from exc


# =====================================================================
# 5. LLM INTEGRATION (GOOGLE GEMINI OPENAI-COMPATIBLE API)
# =====================================================================
def _clean_json_output(raw_output: str) -> str:
    cleaned = raw_output.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()

    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        cleaned = cleaned[first_brace : last_brace + 1]

    return cleaned


_clean_json_Output = _clean_json_output


def _extract_text_from_gemini_json(data: dict) -> str:
    candidates = data.get("candidates") or []
    if candidates:
        parts = (candidates[0].get("content") or {}).get("parts") or []
        text = "".join(part.get("text", "") for part in parts if isinstance(part, dict))
        if text:
            return text

    if isinstance(data.get("output_text"), str):
        return data["output_text"]
    interaction = data.get("interaction") or {}
    if isinstance(interaction.get("outputText"), str):
        return interaction["outputText"]
    outputs = data.get("outputs") or interaction.get("outputs") or []
    for out in outputs:
        if isinstance(out, dict) and isinstance(out.get("text"), str):
            return out["text"]
    return ""


def _call_gemini_native_fallback(raw_text: str, model_name: str, api_key: str) -> str:
    generate_payload = {
        "systemInstruction": {"parts": [{"text": EKDANTA_SYSTEM_PROMPT}]},
        "contents": [
            {
                "role": "user",
                "parts": [{"text": f"CASE FILE DATA:\n\n{raw_text}"}],
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json",
        },
    }

    interactions_payload = {
        "model": model_name,
        "input": f"{EKDANTA_SYSTEM_PROMPT}\n\nCASE FILE DATA:\n\n{raw_text}",
    }

    endpoints = [
        (
            f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent",
            generate_payload,
        ),
        (
            "https://generativelanguage.googleapis.com/v1beta/interactions",
            interactions_payload,
        ),
        (
            f"https://aiplatform.googleapis.com/v1beta1/publishers/google/models/{model_name}:generateContent",
            generate_payload,
        ),
    ]

    last_response: httpx.Response | None = None
    for url, payload in endpoints:
        try:
            response = httpx.post(
                url,
                headers={
                    "x-goog-api-key": api_key,
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=60.0,
            )
        except Exception as exc:
            sanitized = _sanitize_error_message(str(exc), api_key)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gemini API request failed: {sanitized}",
            ) from exc

        last_response = response
        if response.status_code == status.HTTP_200_OK:
            return _extract_text_from_gemini_json(response.json())

        if response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    "Gemini API quota or rate limit exceeded. The Gemini free tier has strict "
                    "usage limits; please wait before retrying or check your Google AI Studio quota."
                ),
            )

        if response.status_code in (400, 401, 403, 404):
            continue

    if last_response is None:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini API fallback request failed with no response.",
        )

    if last_response.status_code in (
        status.HTTP_400_BAD_REQUEST,
        status.HTTP_401_UNAUTHORIZED,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Gemini API authentication failed: Google rejected your AQ.* key across "
                "OpenAI-compatible, native generateContent, and Vertex endpoints. "
                "Verify that the full key was copied from Google AI Studio and that the "
                "Generative Language API is enabled on your Google Cloud project."
            ),
        )
    if last_response.status_code == status.HTTP_403_FORBIDDEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"Gemini API access denied for model '{model_name}'. "
                "Verify your GEMINI_API_KEY permissions and model availability."
            ),
        )
    if last_response.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                f"Configured Gemini model '{model_name}' was not found. "
                "Check the GEMINI_MODEL setting (for example, try GEMINI_MODEL=gemini-3.8-flash)."
            ),
        )

    sanitized = _sanitize_error_message(last_response.text, api_key)
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=f"Gemini API error (HTTP {last_response.status_code}): {sanitized}",
    )


def run_ekdanta_investigation(raw_text: str, api_key_override: str | None = None) -> dict:
    api_key = _get_gemini_api_key(api_key_override)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Missing API key. Set the GEMINI_API_KEY environment variable or click "
                "'Authorize' in Swagger UI (/docs) to enter your key."
            ),
        )

    if _is_placeholder_key(api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "GEMINI_API_KEY is still set to a placeholder value. "
                "Click the green 'Authorize' button at the top right of /docs and paste "
                "your real AQ.Ab8R... key, or update your .env file."
            ),
        )

    model_name = get_gemini_model()

    client = OpenAI(
        base_url=GEMINI_BASE_URL,
        api_key=api_key,
    )

    raw_response = ""
    try:
        completion = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": EKDANTA_SYSTEM_PROMPT},
                {"role": "user", "content": f"CASE FILE DATA:\n\n{raw_text}"},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        choices = getattr(completion, "choices", None) or []
        raw_response = (choices[0].message.content if choices and choices[0].message else "") or ""
    except AuthenticationError as exc:
        if api_key.startswith("AQ."):
            raw_response = _call_gemini_native_fallback(raw_text, model_name, api_key)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Gemini API authentication failed. Verify that GEMINI_API_KEY is valid.",
            ) from exc
    except PermissionDeniedError as exc:
        if api_key.startswith("AQ."):
            raw_response = _call_gemini_native_fallback(raw_text, model_name, api_key)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Gemini API access denied for model '{model_name}'. "
                    "Verify your GEMINI_API_KEY permissions and model availability."
                ),
            ) from exc
    except RateLimitError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                "Gemini API quota or rate limit exceeded. The Gemini free tier has strict "
                "usage limits; please wait before retrying or check your Google AI Studio quota."
            ),
        ) from exc
    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                f"Configured Gemini model '{model_name}' was not found at the Gemini "
                "OpenAI-compatible endpoint. Check the GEMINI_MODEL setting."
            ),
        ) from exc
    except APIStatusError as exc:
        err_text = str(exc)
        is_key_rejection = exc.status_code == status.HTTP_401_UNAUTHORIZED or (
            exc.status_code == status.HTTP_400_BAD_REQUEST
            and (
                "valid api key" in err_text.lower()
                or "api_key_invalid" in err_text.lower()
                or "multiple authentication credentials" in err_text.lower()
                or "invalid_argument" in err_text.lower()
            )
        )
        if is_key_rejection and api_key.startswith("AQ."):
            raw_response = _call_gemini_native_fallback(raw_text, model_name, api_key)
        elif is_key_rejection:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=(
                    f"Gemini API authentication failed (active key type: {_classify_key_format(api_key)}). "
                    "Click the green 'Authorize' button in Swagger UI (/docs) and paste your "
                    "AQ.Ab8R... key directly, or set GEMINI_API_KEY in .env."
                ),
            ) from exc
        elif exc.status_code == status.HTTP_403_FORBIDDEN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Gemini API access denied for model '{model_name}'. "
                    "Verify your GEMINI_API_KEY permissions and model availability."
                ),
            ) from exc
        elif exc.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    "Gemini API quota or rate limit exceeded. The Gemini free tier has strict "
                    "usage limits; please wait before retrying or check your Google AI Studio quota."
                ),
            ) from exc
        else:
            sanitized = _sanitize_error_message(str(exc), api_key)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gemini API error (HTTP {exc.status_code}): {sanitized}",
            ) from exc
    except (APIConnectionError, APIError) as exc:
        sanitized = _sanitize_error_message(str(exc), api_key)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini API request failed: {sanitized}",
        ) from exc
    except Exception as exc:
        sanitized = _sanitize_error_message(str(exc), api_key)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini API call failed: {sanitized}",
        ) from exc

    if not raw_response.strip():
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini API returned an empty response.",
        )

    cleaned_json_str = _clean_json_output(raw_response)

    try:
        return json.loads(cleaned_json_str)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse Gemini output as valid JSON: {str(exc)}",
        ) from exc


# =====================================================================
# 6. API ENDPOINTS
# =====================================================================
@app.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Service health and LLM provider status",
)
async def health_check() -> dict:
    api_key = _get_gemini_api_key()
    return {
        "status": "ok",
        "provider": "gemini",
        "model": get_gemini_model(),
        "api_key_configured": bool(api_key) and not _is_placeholder_key(api_key),
        "api_key_type": _classify_key_format(api_key),
    }


@app.post(
    "/api/v1/analyze-case",
    response_model=CaseAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze a cybercrime case file (.docx)",
    openapi_extra={
        "requestBody": {
            "content": {
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "file": {
                                "type": "string",
                                "format": "binary",
                                "description": "Upload the cybercrime case file (.docx)",
                            }
                        },
                        "required": ["file"],
                    }
                }
            },
            "required": True,
        }
    },
)
async def analyze_case(
    file: Annotated[UploadFile, File(description="Upload the cybercrime case file (.docx)")],
    header_api_key: Annotated[Optional[str], Security(api_key_header_scheme)] = None,
) -> CaseAnalysisResponse:
    if not file.filename or not file.filename.lower().endswith(".docx"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a .docx file.",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    try:
        raw_case_text = extract_text_from_docx(file_bytes)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    investigation_dict = run_ekdanta_investigation(
        raw_case_text, api_key_override=header_api_key
    )

    try:
        validated_response = CaseAnalysisResponse.model_validate(investigation_dict)
        return validated_response
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": "LLM output did not match the required CaseAnalysisResponse schema.",
                "errors": exc.errors(),
            },
        ) from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)