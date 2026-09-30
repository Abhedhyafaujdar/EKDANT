import React from "react";
import { 
  ArrowRight, 
  ArrowDownCircle, 
  ShieldAlert, 
  Terminal, 
  Share2, 
  Clock3, 
  FileSearch, 
  Sparkles, 
  Activity,
  Layers,
  Database,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Cpu
} from "lucide-react";
import type { Page } from "../data";
import { Graph } from "../components/Graph";
import { activeCase } from "../data";

export function Home({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <main className="page home-page cyber-home">
      {/* Outer Architectural Framing (matches reference image & Option 1 mix) */}
      <div className="cyber-frame">
        {/* Corner Accents */}
        <span className="corner corner-tl" />
        <span className="corner corner-tr" />
        <span className="corner corner-bl" />
        <span className="corner corner-br" />

        {/* Technical Frame Status Bar (Single Topbar is in header, no duplicate nav here) */}
        <div className="cyber-frame-statusbar">
          <div className="status-kicker font-mono text-xs">
            <span className="live-dot" />
            <span className="text-cyan font-bold">SYSTEM ONLINE</span>
            <span className="divider">·</span>
            <span>CLASSIFICATION: {activeCase.classification}</span>
            <span className="divider">·</span>
            <span>STATION: CYBER-FORENSIC-01</span>
          </div>

          <div className="status-incident font-mono text-xs">
            <span className="text-muted">ACTIVE DOSSIER:</span>{" "}
            <span className="text-cyan font-bold">{activeCase.code}</span>
          </div>
        </div>

        {/* Hero Section: Left Copy + Right Prominent Luminous Graph Workstation */}
        <section className="cyber-hero">
          {/* Left Column: Bold Headline & Forensic Actions */}
          <div className="cyber-hero-copy">
            <div className="cyber-eyebrow">
              <span className="eyebrow-ping" />
              <ShieldAlert size={14} className="text-cyan" />
              <span>DIGITAL CRIME SCENE INVESTIGATOR</span>
            </div>

            <h1 className="cyber-headline">
              CYBERSECURITY
            </h1>

            <div className="cyber-subheading">
              Autonomous digital forensics & threat topology reconstruction
            </div>

            <p className="cyber-description">
              EKDANTA ingests and correlates fragmented digital evidence across logs, network PCAPs,
              and endpoint memory. Automatically connecting insider credentials with unauthorized hardware,
              mapping stealth exfiltration channels, and generating court-admissible forensic timelines.
            </p>

            <div className="cyber-hero-actions">
              <button 
                className="cyber-download-btn"
                onClick={() => navigate("new")}
                title="Initialize new digital crime scene investigation"
              >
                <div className="icon-circle">
                  <ArrowDownCircle size={20} />
                </div>
                <span>Start Investigation</span>
              </button>

              <button 
                className="cyber-ghost-btn"
                onClick={() => navigate("dashboard")}
              >
                <span>Explore Live Case</span>
                <ArrowRight size={16} />
              </button>

              <button 
                className="cyber-ghost-btn link-graph"
                onClick={() => navigate("graph")}
                title="Open fullscreen topology graph"
              >
                <Share2 size={15} />
                <span>Topology Graph</span>
              </button>
            </div>

            {/* Tactical Telemetry Strip (Option 1 Defense Style) */}
            <div className="cyber-telemetry-strip">
              <div className="telemetry-item">
                <span className="telemetry-label">ACTIVE CASE</span>
                <b className="telemetry-val text-cyan">CASE-001: Midnight Leak</b>
              </div>
              <div className="telemetry-divider" />
              <div className="telemetry-item">
                <span className="telemetry-label">THREAT LEVEL</span>
                <b className="telemetry-val text-danger">CRITICAL / INSIDER</b>
              </div>
              <div className="telemetry-divider" />
              <div className="telemetry-item">
                <span className="telemetry-label">EXFILTRATED</span>
                <b className="telemetry-val font-mono">800 MB → 203.0.113.88</b>
              </div>
              <div className="telemetry-divider" />
              <div className="telemetry-item">
                <span className="telemetry-label">INTEGRITY</span>
                <b className="telemetry-val text-green font-mono">SHA-256 OK</b>
              </div>
            </div>
          </div>

          {/* Right Column: EXPANSIVE FORENSIC GRAPH WORKSTATION */}
          <div className="cyber-graph-stage-wrapper">
            {/* Architectural Framing Brackets */}
            <span className="corner corner-tl" />
            <span className="corner corner-tr" />
            <span className="corner corner-bl" />
            <span className="corner corner-br" />

            {/* Stage Technical Topbar */}
            <div className="stage-tech-header">
              <div className="stage-coord-tag font-mono">
                <span className="radar-blip" />
                <span>RELATIONAL TOPOLOGY // D3 FORCE ENGINE</span>
              </div>
              <div className="stage-status-tag font-mono text-cyan">
                <span>400 NODES · 1,000 STRINGS</span>
              </div>
            </div>

            {/* Ambient Atmosphere Behind Graph */}
            <div className="stage-ambient-glow" />

            {/* Live Interactive Graph */}
            <div className="stage-graph-portal">
              <Graph embedded />
            </div>

            {/* Interactive Stage Footnote */}
            <div className="stage-tech-footer">
              <div className="stage-hint font-mono text-xs">
                <span>● CLICK ANY NODE TO LOCK CAMERA & OPEN DOSSIER</span>
              </div>
              <button 
                className="expand-stage-btn font-mono"
                onClick={() => navigate("graph")}
              >
                <span>OPEN FULL WORKBENCH</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Feature Capabilities Grid (Option 1 Defense OS Style) */}
      <section className="cyber-feature-grid">
        <div className="cyber-feature-card">
          <div className="card-icon-box">
            <FileSearch size={22} className="text-cyan" />
          </div>
          <h3>Fragmented Evidence Ingestion</h3>
          <p>
            Transforms disparate disk images, PCAPs, EVTX logs, and physical badge access events into a unified, cryptographically verified digital crime scene.
          </p>
        </div>

        <div className="cyber-feature-card">
          <div className="card-icon-box">
            <Share2 size={22} className="text-blue" />
          </div>
          <h3>Relational String Topology</h3>
          <p>
            Unveils stealth attack pathways by mapping strings between authorized users, spoofed sessions, rogue MACs, internal servers, and offshore C2 nodes.
          </p>
        </div>

        <div className="cyber-feature-card">
          <div className="card-icon-box">
            <Clock3 size={22} className="text-purple" />
          </div>
          <h3>Chronological Attack Reconstruction</h3>
          <p>
            Reconstructs the second-by-second attack chain with microsecond precision, identifying lateral movement windows and unauthorized credential reuse.
          </p>
        </div>

        <div className="cyber-feature-card">
          <div className="card-icon-box">
            <Sparkles size={22} className="text-green" />
          </div>
          <h3>Evidence-Grounded AI Analysis</h3>
          <p>
            Generates court-admissible forensic summaries strictly anchored to verified telemetry hashes, eliminating speculative bias or hallucination.
          </p>
        </div>
      </section>

      {/* Active Investigation Case Docket Card */}
      <section className="cyber-active-case-docket">
        <div className="active-case-header">
          <div>
            <span className="font-mono text-xs text-cyan font-bold">CASE DIRECTORY // READY FOR ANALYSIS</span>
            <h2>{activeCase.code}: {activeCase.title}</h2>
          </div>
          <button 
            className="primary-action-btn"
            onClick={() => navigate("dashboard")}
          >
            <span>ENTER COMMAND DASHBOARD</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="active-case-meta-grid">
          <div className="case-meta-cell">
            <span className="label">CLASSIFICATION</span>
            <b className="val font-mono">{activeCase.classification}</b>
          </div>
          <div className="case-meta-cell">
            <span className="label">INCIDENT WINDOW</span>
            <b className="val font-mono text-cyan">{activeCase.incidentWindow}</b>
          </div>
          <div className="case-meta-cell">
            <span className="label">PRIMARY SUSPECT</span>
            <b className="val font-mono text-danger">Rohit (Security Eng)</b>
          </div>
          <div className="case-meta-cell">
            <span className="label">EXFILTRATED ASSET</span>
            <b className="val font-mono text-yellow">PROJECT_ORION_INTERNAL_SPEC.pdf</b>
          </div>
        </div>
      </section>
    </main>
  );
}
