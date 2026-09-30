import React from "react";
import { 
  Download, 
  Share2, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Server, 
  Clock3, 
  FileCheck, 
  ExternalLink 
} from "lucide-react";
import { activeCase, timeline, evidence, people } from "../data";

export function Report() {
  const [exported, setExported] = React.useState(false);

  return (
    <main className="page report-page cyber-report-page">
      {/* Action Header */}
      <div className="report-action-bar">
        <div>
          <span className="technical-kicker">OFFICIAL FORENSIC DOSSIER // LAW ENFORCEMENT COMPLIANT</span>
          <h1>INVESTIGATION REPORT &bull; {activeCase.code}</h1>
          <p className="font-mono text-cyan text-xs">{activeCase.title.toUpperCase()} &bull; {activeCase.classification}</p>
        </div>

        <div className="report-header-buttons">
          <button className="cyber-btn secondary" onClick={() => window.print()}>
            <Download size={14} />
            <span>DOWNLOAD PDF</span>
          </button>
          <button 
            className="primary-action-btn" 
            onClick={() => {
              setExported(true);
              setTimeout(() => setExported(false), 4000);
            }}
          >
            <Share2 size={14} />
            <span>{exported ? "MANIFEST EXPORTED ✓" : "EXPORT BUNDLE"}</span>
          </button>
        </div>
      </div>

      {exported && (
        <div className="export-notification-toast">
          <CheckCircle2 size={16} className="text-green" />
          <span>Forensic bundle successfully exported with cryptographic SHA-256 manifest and custodial logs.</span>
        </div>
      )}

      {/* Main Technical Report Document */}
      <div className="report-document-sheet">
        <span className="corner corner-tl" />
        <span className="corner corner-tr" />
        <span className="corner corner-bl" />
        <span className="corner corner-br" />

        {/* Report Cover Block */}
        <div className="report-dossier-banner">
          <div className="dossier-seal">
            <ShieldAlert size={28} className="text-cyan" />
          </div>
          <div>
            <span className="font-mono text-cyan text-xs tracking-wider">EKDANTA FORENSIC OPERATING SYSTEM</span>
            <h2 className="dossier-heading">DIGITAL CRIME SCENE INCIDENT RECONSTRUCTION</h2>
            <span className="font-mono text-muted text-xs">
              CASE: {activeCase.code} &bull; TIMESTAMP: {activeCase.incidentWindow}
            </span>
          </div>
          <div className="dossier-classification-stamp font-mono">
            [ CONFIDENTIAL ]
          </div>
        </div>

        {/* 1. EXECUTIVE SUMMARY */}
        <section className="report-doc-section">
          <h3 className="section-label font-mono">01. EXECUTIVE SUMMARY</h3>
          <p className="doc-paragraph">
            On January 14, 2024, during a 10-minute window between 11:42 PM and 11:52 PM UTC, an unauthorized exfiltration 
            incident occurred targeting classified defense blueprint <strong>PROJECT_ORION_INTERNAL_SPEC.pdf</strong>. 
            The intruder utilized authenticated credentials associated with Security Engineer <strong>Rohit</strong>, 
            originating from an uncatalogued rogue endpoint (MAC: <code>D4:F5:47:9A:11:02</code>). A volume of approximately 
            <strong>800 MB</strong> was transmitted via TLS-encrypted tunnel to offshore destination <strong>203.0.113.88</strong>.
          </p>
        </section>

        {/* 2. INCIDENT OVERVIEW */}
        <section className="report-doc-section">
          <h3 className="section-label font-mono">02. INCIDENT OVERVIEW</h3>
          <div className="report-stat-strip font-mono text-xs">
            <div className="report-stat-box">
              <span className="label">INCIDENT WINDOW</span>
              <b className="val text-cyan">11:42 PM – 11:52 PM</b>
            </div>
            <div className="report-stat-box">
              <span className="label">ATTACK VECTOR</span>
              <b className="val">Rogue Device Credential Relay</b>
            </div>
            <div className="report-stat-box">
              <span className="label">PAYLOAD SIZE</span>
              <b className="val text-danger">800 MB EXFILTRATED</b>
            </div>
            <div className="report-stat-box">
              <span className="label">THREAT SEVERITY</span>
              <b className="val text-danger">HIGH RISK // CRITICAL</b>
            </div>
          </div>
        </section>

        {/* 3. AFFECTED ASSETS */}
        <section className="report-doc-section">
          <h3 className="section-label font-mono">03. AFFECTED ASSETS</h3>
          <div className="assets-table-box font-mono text-xs">
            <div className="asset-entry">
              <span className="asset-type text-cyan">PRIMARY TARGET</span>
              <b>PROJECT_ORION_INTERNAL_SPEC.pdf</b>
              <span className="text-muted">SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae...</span>
            </div>
            <div className="asset-entry">
              <span className="asset-type text-purple">HOST SERVER</span>
              <b>Server-04 (Helios Application Node & Secret Vault)</b>
              <span className="text-muted">IP: 10.0.4.14 &bull; VLAN-04 Core Subnet</span>
            </div>
            <div className="asset-entry">
              <span className="asset-type text-danger">COMPROMISED ACCOUNT</span>
              <b>Rohit (Security Operations / SEC-02)</b>
              <span className="text-muted">Kerberos Principal: rohit.sec@corp.internal</span>
            </div>
          </div>
        </section>

        {/* 4. RECONSTRUCTED TIMELINE */}
        <section className="report-doc-section">
          <h3 className="section-label font-mono">04. RECONSTRUCTED TIMELINE</h3>
          <div className="report-timeline-table">
            {timeline.map((evt) => (
              <div key={evt.id} className="report-timeline-row font-mono text-xs">
                <span className="col-time text-cyan font-bold">{evt.time}</span>
                <span className="col-title text-text font-bold">{evt.title}</span>
                <span className="col-desc text-secondary">{evt.desc}</span>
                <span className={`status-badge ${evt.classification.toLowerCase().replace(" ", "-")}`}>
                  {evt.classification}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 5. EVIDENCE CONNECTIONS */}
        <section className="report-doc-section">
          <h3 className="section-label font-mono">05. EVIDENCE CONNECTIONS</h3>
          <div className="chain-flow-diagram font-mono text-xs">
            <div className="chain-node">Rohit's Credentials</div>
            <div className="chain-arrow">&rarr;</div>
            <div className="chain-node rogue">Unknown Device (D4:F5:47)</div>
            <div className="chain-arrow">&rarr;</div>
            <div className="chain-node">Server-04 (Vault)</div>
            <div className="chain-arrow">&rarr;</div>
            <div className="chain-node target">ORION PDF</div>
            <div className="chain-arrow">&rarr;</div>
            <div className="chain-node exfil">External IP (203.0.113.88)</div>
          </div>
        </section>

        {/* 6. PERSONS OF INTEREST */}
        <section className="report-doc-section">
          <h3 className="section-label font-mono">06. PERSONS OF INTEREST &bull; INVESTIGATIVE LEADS</h3>
          <div className="report-people-grid">
            {people.map((p) => (
              <div key={p.id} className={`report-person-card ${p.riskIndicator > 70 ? "priority" : ""}`}>
                <div className="card-top">
                  <b>{p.name}</b>
                  <span className="status-badge guarded font-mono text-xs">RISK {p.riskIndicator}%</span>
                </div>
                <span className="role font-mono text-xs text-muted">{p.role} &bull; {p.workstation}</span>
                <p className="text-secondary text-xs">{p.notes}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. ALTERNATIVE EXPLANATIONS */}
        <section className="report-doc-section">
          <h3 className="section-label font-mono">07. ALTERNATIVE EXPLANATIONS</h3>
          <div className="alternative-box font-mono text-xs">
            <p>
              <strong>HYPOTHESIS A (Credential Theft / Token Replay):</strong> Rohit's password or session cookies were harvested 
              via an external spear-phishing attack or infostealer payload, allowing the rogue device to inject Kerberos tickets remotely.
            </p>
            <p>
              <strong>HYPOTHESIS B (Rogue Insider Hardware):</strong> An insider physical intrusion planted a rogue Wi-Fi/Ethernet bridge 
              within the Server Room to siphon high-privilege credentials passively over the local wire.
            </p>
          </div>
        </section>

        {/* 8. AI ANALYSIS */}
        <section className="report-doc-section">
          <h3 className="section-label font-mono">08. AI ANALYSIS & HYPOTHESIS CORRELATION</h3>
          <p className="doc-paragraph">
            EKDANTA automated correlation assigns an 88.4% probability to an unauthorized credential relay. 
            The timing anomaly—access originating during off-hours while physical access controls lack corresponding entry records 
            for Rohit—strongly corroborates unauthorized session hijacking over voluntary insider sabotage.
          </p>
        </section>

        {/* 9. EVIDENCE GROUNDING */}
        <section className="report-doc-section">
          <h3 className="section-label font-mono">09. EVIDENCE GROUNDING</h3>
          <div className="grounding-audit-strip font-mono text-xs">
            <div className="item"><CheckCircle2 size={14} className="text-green" /> 100% of conclusions cite cryptographic evidence IDs</div>
            <div className="item"><CheckCircle2 size={14} className="text-green" /> Chronological cause-and-effect preserved</div>
            <div className="item"><CheckCircle2 size={14} className="text-green" /> Contradictory badge data retained in permanent record</div>
          </div>
        </section>

        {/* 10. LIMITATIONS */}
        <section className="report-doc-section last">
          <h3 className="section-label font-mono text-warning">10. LIMITATIONS</h3>
          <div className="limitation-callout-box">
            <AlertTriangle size={16} className="text-warning flex-shrink-0" />
            <p className="text-xs">
              <strong>CRITICAL FORENSIC LIMITATION:</strong> Current telemetry confirms the use of Rohit's account credentials, 
              but does not establish identity of the physical keyboard operator. Legal proceedings require forensic memory acquisition 
              of the rogue endpoint and physical surveillance cross-referencing.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
