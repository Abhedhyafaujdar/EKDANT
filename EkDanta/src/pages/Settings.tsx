import React, { useState } from "react";
import { Settings, Shield, Sliders, Database, Cpu, Activity, Check, Monitor, Moon, Sun } from "lucide-react";

interface SettingsProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function SettingsPage({ theme, onToggleTheme }: SettingsProps) {
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [nodeDensity, setNodeDensity] = useState("Standard (120 Nodes)");
  const [connectionDensity, setConnectionDensity] = useState("High (320 Edges)");
  const [timelinePrecision, setTimelinePrecision] = useState("Millisecond (UTC)");
  const [aiGroundingStrictness, setAiGroundingStrictness] = useState("Deterministic (Strict)");

  return (
    <main className="page inner-page cyber-settings-page">
      {/* Header */}
      <div className="workstation-header">
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <span className="technical-kicker">OS CONFIGURATION & SYSTEM PARAMETERS</span>
        <h1>SYSTEM SETTINGS</h1>
        <p>
          Configure rendering performance, forensic precision standards, AI safety thresholds, 
          and monitor subsystem connectivity for the EKDANTA workstation.
        </p>
      </div>

      <div className="settings-sections-grid">
        {/* 1. INTERFACE SETTINGS */}
        <section className="command-panel settings-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <Monitor size={16} className="text-cyan" />
              <h3>INTERFACE & GRAPH CONFIGURATION</h3>
            </div>
            <span className="font-mono text-xs text-muted">RENDERING & CONTROLS</span>
          </div>

          <div className="settings-rows">
            <div className="setting-row">
              <div>
                <b>Theme Environment</b>
                <p>Toggle high-contrast Dark Forensics or Light Courtroom palette.</p>
              </div>
              <button className="theme-switch-btn" onClick={onToggleTheme}>
                {theme === "dark" ? (
                  <>
                    <Moon size={14} className="text-cyan" />
                    <span>DARK OS MODE</span>
                  </>
                ) : (
                  <>
                    <Sun size={14} className="text-warning" />
                    <span>LIGHT COURTROOM</span>
                  </>
                )}
              </button>
            </div>

            <div className="setting-row">
              <div>
                <b>Particle & Link Animation</b>
                <p>Enable live glowing data pulses along relationship paths.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={animationEnabled}
                  onChange={(e) => setAnimationEnabled(e.target.checked)}
                />
                <span className="slider" />
              </label>
            </div>

            <div className="setting-row">
              <div>
                <b>Node Density</b>
                <p>Telemetry nodes loaded into memory for force simulation.</p>
              </div>
              <select
                className="cyber-select font-mono text-xs"
                value={nodeDensity}
                onChange={(e) => setNodeDensity(e.target.value)}
              >
                <option>Compact (60 Nodes)</option>
                <option>Standard (120 Nodes)</option>
                <option>Dense (400 Nodes)</option>
              </select>
            </div>

            <div className="setting-row">
              <div>
                <b>Connection Density</b>
                <p>Calculated multi-hop adjacency relationships.</p>
              </div>
              <select
                className="cyber-select font-mono text-xs"
                value={connectionDensity}
                onChange={(e) => setConnectionDensity(e.target.value)}
              >
                <option>Primary Attack Chain Only</option>
                <option>High (320 Edges)</option>
                <option>Max (1,000 Edges)</option>
              </select>
            </div>
          </div>
        </section>

        {/* 2. INVESTIGATION STANDARDS */}
        <section className="command-panel settings-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <Sliders size={16} className="text-purple" />
              <h3>INVESTIGATION & FORENSIC STANDARDS</h3>
            </div>
            <span className="font-mono text-xs text-muted">EVIDENCE RIGOR</span>
          </div>

          <div className="settings-rows">
            <div className="setting-row">
              <div>
                <b>Evidence Display Mode</b>
                <p>Include raw cryptographic SHA-256 hashes alongside descriptors.</p>
              </div>
              <span className="status-badge guarded font-mono">[ SHA-256 ALWAYS ON ]</span>
            </div>

            <div className="setting-row">
              <div>
                <b>Timeline Precision</b>
                <p>Clock synchronization standard across varied audit sources.</p>
              </div>
              <select
                className="cyber-select font-mono text-xs"
                value={timelinePrecision}
                onChange={(e) => setTimelinePrecision(e.target.value)}
              >
                <option>Minute Level (HH:MM)</option>
                <option>Second Level (HH:MM:SS)</option>
                <option>Millisecond (UTC)</option>
              </select>
            </div>

            <div className="setting-row">
              <div>
                <b>AI Evidence Grounding</b>
                <p>Strictness of required citation proofs before generating inferences.</p>
              </div>
              <select
                className="cyber-select font-mono text-xs"
                value={aiGroundingStrictness}
                onChange={(e) => setAiGroundingStrictness(e.target.value)}
              >
                <option>Deterministic (Strict)</option>
                <option>Exploratory Hypothesis</option>
              </select>
            </div>
          </div>
        </section>

        {/* 3. SYSTEM SUBSYSTEMS & HEALTH */}
        <section className="command-panel settings-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <Activity size={16} className="text-green" />
              <h3>SYSTEM TELEMETRY & SUBSYSTEM STATUS</h3>
            </div>
            <span className="font-mono text-xs text-muted">CORE SERVICES</span>
          </div>

          <div className="system-health-grid font-mono text-xs">
            <div className="health-tile">
              <span className="service-name">FORENSIC INGESTION API</span>
              <span className="service-status online">
                <span className="dot" /> ONLINE
              </span>
              <small className="latency text-muted">LATENCY: 14ms &bull; HTTP/2 TLS</small>
            </div>

            <div className="health-tile">
              <span className="service-name">GEMINI REASONING MODEL</span>
              <span className="service-status online">
                <span className="dot" /> ONLINE
              </span>
              <small className="latency text-muted">ENDPOINT: READY &bull; TEMP=0.0</small>
            </div>

            <div className="health-tile">
              <span className="service-name">RELATION GRAPH DATABASE</span>
              <span className="service-status online">
                <span className="dot" /> ONLINE
              </span>
              <small className="latency text-muted">IN-MEMORY D3 &bull; 0 DELAY</small>
            </div>

            <div className="health-tile">
              <span className="service-name">CUSTODIAL VAULT STORE</span>
              <span className="service-status online">
                <span className="dot" /> ONLINE
              </span>
              <small className="latency text-muted">ENCRYPTION: AES-256-GCM</small>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
