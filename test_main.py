import io
import json
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import httpx
import pytest
from docx import Document
from fastapi.testclient import TestClient
from openai import (
    APIConnectionError,
    AuthenticationError,
    BadRequestError,
    NotFoundError,
    PermissionDeniedError,
    RateLimitError,
)

import main

client = TestClient(main.app)


SAMPLE_VALID_PAYLOAD = {
    "nodes": [
        {
            "id": "emp_rohit",
            "type": "PERSON",
            "label": "Rohit (DevOps Engineer)",
            "is_suspicious": True,
        },
        {
            "id": "ip_203_0_113_45",
            "type": "IP",
            "label": "203.0.113.45 (Unknown External IP)",
            "is_suspicious": True,
        },
        {
            "id": "file_orion",
            "type": "FILE",
            "label": "PROJECT_ORION_INTERNAL_SPEC.pdf",
            "is_suspicious": True,
        },
    ],
    "edges": [
        {
            "source_id": "ip_203_0_113_45",
            "target_id": "file_orion",
            "action": "ACCESSED",
            "timestamp": "23:52 IST",
            "evidence_text": "External IP accessed restricted specification file.",
        }
    ],
    "timeline": [
        {
            "time": "23:52 IST",
            "description": "Restricted file accessed from external IP.",
            "classification": "CRITICAL",
            "related_entities": ["ip_203_0_113_45", "file_orion"],
        }
    ],
    "report": {
        "target_asset": "PROJECT_ORION_INTERNAL_SPEC.pdf",
        "primary_lead": "Rohit's Credentials via External IP 203.0.113.45",
        "evidence_chain": [
            "External IP authenticated with rohit_admin while SC-192 was offline.",
            "Workstation D-019 power-on was a physical decoy.",
            "800 MB outbound transfer completed to 203.0.113.45.",
        ],
        "disclaimer": (
            "Evidence-Supported Suspicion — NOT Proof of Guilt. "
            "Credential usage may indicate token theft."
        ),
    },
}


def _create_docx_bytes(paragraphs: list[str]) -> bytes:
    doc = Document()
    for para in paragraphs:
        doc.add_paragraph(para)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def _mock_completion(content: str) -> SimpleNamespace:
    return SimpleNamespace(
        choices=[SimpleNamespace(message=SimpleNamespace(content=content))]
    )


def _make_httpx_response(status_code: int) -> httpx.Response:
    request = httpx.Request(
        "POST",
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    )
    return httpx.Response(status_code=status_code, request=request)


def test_read_dotenv_dict_supports_abh_env(tmp_path, monkeypatch: pytest.MonkeyPatch):
    (tmp_path / "abh.env").write_text("GEMINI_API_KEY=AQ.test-key\n", encoding="utf-8")
    monkeypatch.setattr(main, "__file__", str(tmp_path / "main.py"))
    monkeypatch.setattr(main.Path, "cwd", lambda: tmp_path)
    monkeypatch.delenv("PYTEST_CURRENT_TEST", raising=False)
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    assert main._read_dotenv_dict()["GEMINI_API_KEY"] == "AQ.test-key"


def test_health_reports_gemini_and_default_model_without_secrets(monkeypatch: pytest.MonkeyPatch):
    secret_key = "AIzaSySuperSecretTestKey1234567890"
    monkeypatch.setenv("GEMINI_API_KEY", secret_key)
    monkeypatch.delenv("GEMINI_MODEL", raising=False)

    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "ok"
    assert data["provider"] == "gemini"
    assert data["model"] == "gemini-3.8-flash"
    assert data["api_key_configured"] is True
    assert secret_key not in response.text
    assert "nvidia" not in response.text.lower()


def test_health_respects_custom_gemini_model_and_missing_key(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_MODEL", "gemini-2.5-flash")

    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()

    assert data["provider"] == "gemini"
    assert data["model"] == "gemini-2.5-flash"
    assert data["api_key_configured"] is False


@patch("main.OpenAI")
def test_run_ekdanta_investigation_uses_gemini_endpoint_and_default_model(
    mock_openai_cls: MagicMock, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.setenv("GEMINI_API_KEY", "test-gemini-key")
    monkeypatch.delenv("GEMINI_MODEL", raising=False)

    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.chat.completions.create.return_value = _mock_completion(
        f"```json\n{json.dumps(SAMPLE_VALID_PAYLOAD)}\n```"
    )

    result = main.run_ekdanta_investigation("Sample case log")

    mock_openai_cls.assert_called_once_with(
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        api_key="test-gemini-key",
    )
    call_kwargs = mock_client.chat.completions.create.call_args.kwargs
    assert call_kwargs["model"] == "gemini-3.8-flash"
    assert call_kwargs["response_format"] == {"type": "json_object"}
    assert result["report"]["target_asset"] == "PROJECT_ORION_INTERNAL_SPEC.pdf"


@patch("main.OpenAI")
def test_run_ekdanta_investigation_missing_key_raises_500(
    mock_openai_cls: MagicMock, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    # Even if legacy variables are set, they must not be used
    monkeypatch.setenv("NVIDIA_API_KEY", "legacy-key")

    with pytest.raises(main.HTTPException) as exc_info:
        main.run_ekdanta_investigation("Sample case log")

    assert exc_info.value.status_code == 500
    assert "GEMINI_API_KEY" in str(exc_info.value.detail)
    assert "NVIDIA" not in str(exc_info.value.detail)
    mock_openai_cls.assert_not_called()


@patch("main.OpenAI")
def test_authentication_error_handling_does_not_leak_key(
    mock_openai_cls: MagicMock, monkeypatch: pytest.MonkeyPatch
):
    secret_key = "AIzaSySecretKeyShouldNeverAppearInErrors"
    monkeypatch.setenv("GEMINI_API_KEY", secret_key)

    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.chat.completions.create.side_effect = AuthenticationError(
        message=f"Invalid API key provided: {secret_key}",
        response=_make_httpx_response(401),
        body={"error": {"message": f"Bad key {secret_key}"}},
    )

    with pytest.raises(main.HTTPException) as exc_info:
        main.run_ekdanta_investigation("Sample case log")

    assert exc_info.value.status_code == 401
    assert "authentication" in str(exc_info.value.detail).lower()
    assert secret_key not in str(exc_info.value.detail)


@patch("main.OpenAI")
def test_google_400_invalid_api_key_maps_to_401_and_strips_quotes(
    mock_openai_cls: MagicMock, monkeypatch: pytest.MonkeyPatch
):
    secret_key = "AIzaSyQuotedKey1234567890"
    monkeypatch.setenv("GEMINI_API_KEY", f'"{secret_key}"')

    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.chat.completions.create.side_effect = BadRequestError(
        message="Error code: 400 - [{'error': {'code': 400, 'message': 'Please pass a valid API key', 'status': 'INVALID_ARGUMENT'}}]",
        response=_make_httpx_response(400),
        body=[{"error": {"code": 400, "message": "Please pass a valid API key", "status": "INVALID_ARGUMENT"}}],
    )

    with pytest.raises(main.HTTPException) as exc_info:
        main.run_ekdanta_investigation("Sample case log")

    # Verify quotes were stripped when initializing OpenAI client
    mock_openai_cls.assert_called_once_with(
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        api_key=secret_key,
    )
    assert exc_info.value.status_code == 401
    assert "authentication failed" in str(exc_info.value.detail).lower()
    assert secret_key not in str(exc_info.value.detail)


@patch("main.OpenAI")
def test_permission_denied_error_handling(
    mock_openai_cls: MagicMock, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-3.8-flash")

    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.chat.completions.create.side_effect = PermissionDeniedError(
        message="Permission denied",
        response=_make_httpx_response(403),
        body=None,
    )

    with pytest.raises(main.HTTPException) as exc_info:
        main.run_ekdanta_investigation("Sample case log")

    assert exc_info.value.status_code == 403
    assert "gemini-3.8-flash" in str(exc_info.value.detail)


@patch("main.OpenAI")
def test_rate_limit_error_handling(
    mock_openai_cls: MagicMock, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.chat.completions.create.side_effect = RateLimitError(
        message="Resource has been exhausted (e.g. check quota).",
        response=_make_httpx_response(429),
        body=None,
    )

    with pytest.raises(main.HTTPException) as exc_info:
        main.run_ekdanta_investigation("Sample case log")

    assert exc_info.value.status_code == 429
    assert "quota" in str(exc_info.value.detail).lower() or "rate limit" in str(exc_info.value.detail).lower()


@patch("main.OpenAI")
def test_not_found_model_error_handling(
    mock_openai_cls: MagicMock, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("GEMINI_MODEL", "retired-model-name")

    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.chat.completions.create.side_effect = NotFoundError(
        message="Model not found",
        response=_make_httpx_response(404),
        body=None,
    )

    with pytest.raises(main.HTTPException) as exc_info:
        main.run_ekdanta_investigation("Sample case log")

    assert exc_info.value.status_code == 502
    assert "retired-model-name" in str(exc_info.value.detail)


@patch("main.OpenAI")
def test_generic_error_redacts_secrets_and_bearer_tokens(
    mock_openai_cls: MagicMock, monkeypatch: pytest.MonkeyPatch
):
    secret_key = "AIzaSySecretTokenValue999999999"
    monkeypatch.setenv("GEMINI_API_KEY", secret_key)

    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.chat.completions.create.side_effect = APIConnectionError(
        message=f"Connection failed with Authorization: Bearer {secret_key}",
        request=httpx.Request("POST", main.GEMINI_BASE_URL),
    )

    with pytest.raises(main.HTTPException) as exc_info:
        main.run_ekdanta_investigation("Sample case log")

    assert exc_info.value.status_code == 502
    detail = str(exc_info.value.detail)
    assert secret_key not in detail
    assert "[REDACTED]" in detail


@patch("main.OpenAI")
def test_invalid_json_from_model_returns_500(
    mock_openai_cls: MagicMock, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.chat.completions.create.return_value = _mock_completion(
        "This is not valid JSON {broken:"
    )

    with pytest.raises(main.HTTPException) as exc_info:
        main.run_ekdanta_investigation("Sample case log")

    assert exc_info.value.status_code == 500
    assert "valid JSON" in str(exc_info.value.detail)


@patch("main.OpenAI")
def test_analyze_case_endpoint_success(
    mock_openai_cls: MagicMock, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.delenv("GEMINI_MODEL", raising=False)

    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.chat.completions.create.return_value = _mock_completion(
        json.dumps(SAMPLE_VALID_PAYLOAD)
    )

    docx_bytes = _create_docx_bytes(
        ["INCIDENT ID: 884-ALPHA", "23:50 IST - rohit_admin login from 203.0.113.45"]
    )

    response = client.post(
        "/api/v1/analyze-case",
        files={
            "file": (
                "case_884.docx",
                docx_bytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["report"]["target_asset"] == "PROJECT_ORION_INTERNAL_SPEC.pdf"
    assert len(body["nodes"]) == 3
    assert len(body["edges"]) == 1
    assert len(body["timeline"]) == 1


@patch("main.OpenAI")
def test_analyze_case_endpoint_schema_validation_error_returns_422(
    mock_openai_cls: MagicMock, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    # Return valid JSON that is missing required CaseAnalysisResponse fields
    mock_client.chat.completions.create.return_value = _mock_completion(
        json.dumps({"nodes": [{"id": "bad", "type": "INVALID_TYPE"}]})
    )

    docx_bytes = _create_docx_bytes(["INCIDENT ID: 884-ALPHA"])

    response = client.post(
        "/api/v1/analyze-case",
        files={
            "file": (
                "case_884.docx",
                docx_bytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
        },
    )

    assert response.status_code == 422
    assert "CaseAnalysisResponse schema" in response.json()["detail"]["message"]
