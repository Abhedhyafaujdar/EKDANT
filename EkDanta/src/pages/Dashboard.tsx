import React, { useEffect, useState } from "react";
import { 
  FileSearch, 
  Users, 
  Share2, 
  ShieldAlert, 
  Download, 
  Clock3, 
  BrainCircuit, 
  AlertTriangle
} from "lucide-react";
import type { CaseAnalysisResponse } from "../data";
import { Graph } from "../components/Graph";

export function Dashboard() {
  const [caseData, setCaseData] = useState<CaseAnalysisResponse | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem("ekdanta_real_data");
    if (!storedData) return;

    try {
      setCaseData(JSON.parse(storedData) as CaseAnalysisResponse);
    } catch (error) {
      console.error("Could not read saved case analysis:", error);
    }
  }, []);

  if (!caseData) {
    return (
      <main className="page dashboard-page cyber-dashboard">
        <section className="command-panel">
          <h1>NO CASE ANALYSIS AVAILABLE</h1>
          <p>Upload and analyze an evidence file to populate this dashboard.</p>
        </section>
      </main>
    );
  }

  const suspiciousEntities = caseData.nodes.filter((node) => node.is_suspicious).length;
  const incidentWindow = caseData.timeline.length > 0
    ? `${caseData.timeline[0].time} - ${caseData.timeline[caseData.timeline.length - 1].time}`
    : "No timeline events";

  return (
    <main className="page dashboard-page cyber-dashboard">
      {/* Top Command Center Header */}
      <div className="case-command-header">
        <div className="command-title-group">
          <div className="command-kicker-row">
            <span className="font-mono text-cyan font-bold">CASE ANALYSIS</span>
            <span className="divider">/</span>
            <span className="case-status-badge">[ COMPLETE ]</span>
            <span className="divider">/</span>
            <span className="font-mono text-muted text-xs">AI-GENERATED INVESTIGATION</span>
          </div>
          <h1>{caseData.report.target_asset}</h1>
          <p className="case-desc">{caseData.report.primary_lead}</p>
        </div>

        <div className="command-actions">
          <button className="cyber-btn secondary" onClick={() => window.print()}>
            <Download size={14} />
            <span>EXPORT DOSSIER</span>
          </button>
          <div className="case-incident-window font-mono">
            <span>WINDOW:</span> {incidentWindow}
          </div>
        </div>
      </div>

      {/* KPI Forensic Stat Strip */}
      <div className="forensic-stat-grid">
        <div className="stat-tile">
          <div className="stat-icon-wrapper">
            <FileSearch size={18} className="text-cyan" />
          </div>
          <div className="stat-content">
            <b className="stat-val font-mono">{caseData.timeline.length}</b>
            <span className="stat-label">EVIDENCE ITEMS</span>
          </div>
        </div>

        <div className="stat-tile">
          <div className="stat-icon-wrapper">
            <Users size={18} className="text-blue" />
          </div>
          <div className="stat-content">
            <b className="stat-val font-mono">{caseData.nodes.length}</b>
            <span className="stat-label">ENTITIES</span>
          </div>
        </div>

        <div className="stat-tile">
          <div className="stat-icon-wrapper">
            <Share2 size={18} className="text-purple" />
          </div>
          <div className="stat-content">
            <b className="stat-val font-mono">{caseData.edges.length}</b>
            <span className="stat-label">RELATIONSHIPS</span>
          </div>
        </div>

        <div className="stat-tile alert-highlight">
          <div className="stat-icon-wrapper">
            <ShieldAlert size={18} className="text-danger" />
          </div>
          <div className="stat-content">
            <b className="stat-val font-mono text-danger">{suspiciousEntities}</b>
            <span className="stat-label">PERSONS OF INTEREST</span>
          </div>
        </div>
      </div>

      {/* Main Area: Connection Graph with Corner Frame */}
      <div className="dashboard-graph-wrapper">
        <span className="corner corner-tl" />
        <span className="corner corner-tr" />
        <span className="corner corner-bl" />
        <span className="corner corner-br" />
        <Graph caseNodes={caseData.nodes} caseEdges={caseData.edges} />
      </div>

      {/* Bottom Forensic Panels Grid */}
      <div className="dashboard-bottom-grid">
        {/* Incident Timeline */}
        <section className="command-panel timeline-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <Clock3 size={15} className="text-cyan" />
              <h3>INCIDENT TIMELINE</h3>
            </div>
            <span className="font-mono text-muted text-xs">CHRONOLOGICAL EVENT CHAIN</span>
          </div>

          <div className="vertical-timeline-list">
            {caseData.timeline.slice(0, 5).map((evt, index) => (
              <div key={`${evt.time}-${index}`} className="timeline-node-item">
                <div className="node-time font-mono">{evt.time}</div>
                <div className="node-axis">
                  <span className={`node-marker ${evt.classification.toLowerCase()}`} />
                  <span className="node-stem" />
                </div>
                <div className="node-details">
                  <div className="node-title-row">
                    <b>{evt.description}</b>
                    <span className={`status-badge ${evt.classification.toLowerCase()}`}>
                      [ {evt.classification.toUpperCase()} ]
                    </span>
                  </div>
                  <div className="node-metadata font-mono text-xs">
                    <span>ENTITIES: {evt.related_entities.join(", ") || "None linked"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Evidence Explorer & AI Insights Split */}
        <div className="dashboard-right-stack">
          {/* AI Investigation Insights */}
          <section className="command-panel ai-insights-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <BrainCircuit size={15} className="text-purple" />
                <h3>AI INVESTIGATION INSIGHTS</h3>
              </div>
              <span className="status-badge guarded font-mono">[ EVIDENCE-GROUNDED ]</span>
            </div>

            <div className="ai-insight-content">
              <h4>PRIMARY LEAD: {caseData.report.primary_lead}</h4>

              <div className="ai-evidence-chain-mini">
                {caseData.report.evidence_chain.map((item, index) => (
                  <div className="chain-step" key={`${index}-${item}`}>
                    <span className="font-mono text-cyan">{String(index + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="grounding-callout">
                <AlertTriangle size={14} className="text-warning flex-shrink-0" />
                <span><strong>DISCLAIMER:</strong> {caseData.report.disclaimer}</span>
              </div>
            </div>
          </section>

          {/* Compact Evidence Ledger */}
          <section className="command-panel evidence-summary-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <FileSearch size={15} className="text-cyan" />
                <h3>EVIDENCE EXPLORER</h3>
              </div>
              <span className="font-mono text-muted text-xs">CORRELATED RELATIONSHIPS</span>
            </div>

            <div className="table-responsive">
              <table className="forensic-table compact">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>TIME</th>
                    <th>TYPE</th>
                    <th>DESCRIPTION</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {caseData.edges.slice(0, 4).map((item, index) => (
                    <tr key={`${item.source_id}-${item.target_id}-${index}`}>
                      <td className="font-mono text-cyan">{String(index + 1).padStart(2, "0")}</td>
                      <td className="font-mono">{item.timestamp}</td>
                      <td><span className="type-tag">{item.action}</span></td>
                      <td className="text-truncate">{item.evidence_text}</td>
                      <td>
                        <span className="status-badge guarded">[ MAPPED ]</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
