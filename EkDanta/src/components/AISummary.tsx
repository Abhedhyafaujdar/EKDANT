import React, { useState } from "react";
import { BrainCircuit, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";

export function AISummary() {
  const [tab, setTab] = useState<"summary" | "findings" | "contradictions">("summary");

  return (
    <section className="command-panel ai-summary-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <BrainCircuit size={18} className="text-cyan" />
          <div>
            <h3>AI INVESTIGATION INSIGHTS</h3>
            <p className="text-xs text-muted">Evidence-grounded hypothesis & attack chain analysis</p>
          </div>
        </div>
      </div>

      <div className="segmented-filter-group" style={{ marginBottom: 14 }}>
        <button
          className={`filter-btn ${tab === "summary" ? "active" : ""}`}
          onClick={() => setTab("summary")}
        >
          Summary
        </button>
        <button
          className={`filter-btn ${tab === "findings" ? "active" : ""}`}
          onClick={() => setTab("findings")}
        >
          Key Findings
        </button>
        <button
          className={`filter-btn ${tab === "contradictions" ? "active" : ""}`}
          onClick={() => setTab("contradictions")}
        >
          Contradictions
        </button>
      </div>

      <div className="ai-insight-content">
        {tab === "summary" && (
          <div>
            <h4>INCIDENT SUMMARY // CASE-001</h4>
            <p>
              Classified defense document <b>PROJECT_ORION_INTERNAL_SPEC.pdf</b> was accessed and exfiltrated to offshore IP <b>203.0.113.88</b> at 11:49 PM.
              The attack session originated from unauthorized hardware via spoofed Kerberos tickets tied to engineer Rohit's elevated credentials.
            </p>
            <div className="grounding-callout">
              <ShieldAlert size={16} className="text-yellow" style={{ flexShrink: 0 }} />
              <div>
                <b>CUSTODIAL INTEGRITY NOTE:</b>
                <p>
                  Telemetry establishes account credential usage. Physical badge logs confirm workstation SEC-02 was locked during the incident window. Credential compromise or relay attack remains an active working hypothesis.
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "findings" && (
          <div>
            <h4>VERIFIED TELEMETRY FINDINGS</h4>
            <div className="ai-evidence-chain-mini">
              {[
                "Rohit's Kerberos TGT authenticated from rogue MAC D4:F5:47:9A:11:02.",
                "Direct read handle opened on Helios Server-04 vault at 11:47:12 PM.",
                "800 MB encrypted TLS stream routed to 203.0.113.88 on port 4433 at 11:49:05 PM.",
                "Workstation SEC-02 remained idle and locked during the entire breach.",
                "Offshore destination ASN matches known bulletproof hosting provider."
              ].map((text, i) => (
                <div key={i} className="chain-step">
                  <CheckCircle2 size={13} className="text-cyan" style={{ flexShrink: 0 }} />
                  <span className="text-xs">{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "contradictions" && (
          <div>
            <h4>EVIDENTIARY CONTRADICTIONS</h4>
            <p>
              Badge telemetry shows Rohit swiped out of the building perimeter at 6:42 PM. No subsequent physical entries recorded. All breach activity occurred remotely over unauthorized internal VLAN-04 hardware.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
