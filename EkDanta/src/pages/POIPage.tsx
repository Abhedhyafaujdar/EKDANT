import React from "react";
import { ShieldAlert, ArrowRight, UserCheck, AlertOctagon, HelpCircle, Activity } from "lucide-react";
import { people, PersonOfInterest } from "../data";

export function POIPage() {
  return (
    <main className="page inner-page cyber-poi-page">
      {/* Header */}
      <div className="workstation-header">
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <span className="technical-kicker">NEUTRAL FORENSIC TRIAGE</span>
        <h1>PERSONS OF INTEREST</h1>
        <p>
          Prioritized investigative leads derived from objective credential telemetry, physical badge scans, 
          and anomalous privilege escalations. Entries reflect leads for further inquiry, not declarations of guilt.
        </p>
      </div>

      <div className="poi-cards-grid">
        {people.map((person) => {
          const isHighRisk = person.riskIndicator > 70;
          return (
            <div
              key={person.id}
              className={`poi-forensic-card ${isHighRisk ? "high-priority" : ""}`}
            >
              {/* Card Header */}
              <div className="poi-header-row">
                <div>
                  <span className="font-mono text-cyan text-xs uppercase">{person.suspicionStatus}</span>
                  <h2 className="poi-name font-mono">{person.name}</h2>
                  <span className="poi-role text-secondary">{person.role} &bull; {person.department}</span>
                </div>
                <div className={`poi-risk-badge font-mono ${isHighRisk ? "critical" : "normal"}`}>
                  <ShieldAlert size={14} />
                  <span>RISK {person.riskIndicator}%</span>
                </div>
              </div>

              {/* Risk Meter */}
              <div className="risk-meter-box">
                <div className="risk-meter-header">
                  <span>Risk Indicator Metric</span>
                  <b className="font-mono text-cyan">{person.riskIndicator}%</b>
                </div>
                <div className="risk-meter-bar">
                  <div
                    className="risk-meter-fill"
                    style={{
                      width: `${person.riskIndicator}%`,
                      background: isHighRisk
                        ? "linear-gradient(90deg, #FFB82E, #FF315B)"
                        : "linear-gradient(90deg, #16D6A3, #00D9FF)"
                    }}
                  />
                </div>
              </div>

              {/* Telemetry Metrics */}
              <div className="poi-metrics-grid font-mono text-xs">
                <div className="poi-metric-tile">
                  <span className="label">CONNECTED EVIDENCE</span>
                  <b className="val text-cyan">{person.connectedEvidence} ITEMS</b>
                </div>
                <div className="poi-metric-tile">
                  <span className="label">RELATIONSHIPS</span>
                  <b className="val">{person.relationships} NODES</b>
                </div>
                <div className="poi-metric-tile full">
                  <span className="label">ASSIGNED WORKSTATION</span>
                  <b className="val">{person.workstation}</b>
                </div>
              </div>

              {/* Contradictory Evidence Box */}
              <div className="contradictory-box">
                <div className="box-title">
                  <HelpCircle size={13} className="text-warning flex-shrink-0" />
                  <span className="font-mono text-xs">CONTRADICTORY EVIDENCE / MITIGATING FACTORS</span>
                </div>
                <p>{person.contradictoryEvidence}</p>
              </div>

              {/* Last Activity */}
              <div className="last-activity-row font-mono text-xs">
                <span className="text-muted">LAST LOGGED TELEMETRY:</span>
                <span className="text-secondary">{person.lastActivity}</span>
              </div>

              {/* Action Button */}
              <button className="primary-action-btn full">
                <span>VIEW INVESTIGATION</span>
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
