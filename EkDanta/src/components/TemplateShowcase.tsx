import React from "react";
import { Shield, Flame, Terminal, Check, Sparkles, ExternalLink, X, ArrowRight, Eye } from "lucide-react";

export type UIVariant = "defense" | "falcon" | "minimalist";

interface TemplateShowcaseProps {
  currentVariant: UIVariant;
  onSelectVariant: (variant: UIVariant) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateShowcase({
  currentVariant,
  onSelectVariant,
  isOpen,
  onClose,
}: TemplateShowcaseProps) {
  if (!isOpen) return null;

  const templates: {
    id: UIVariant;
    name: string;
    subtitle: string;
    badge: string;
    icon: React.ElementType;
    primaryColor: string;
    bgColor: string;
    surfaceColor: string;
    borderColor: string;
    features: string[];
    visualMockup: {
      headerBg: string;
      accentBg: string;
      pillText: string;
      metrics: { label: string; val: string }[];
      rowAccent: string;
    };
  }[] = [
    {
      id: "defense",
      name: "Option 1: Defense Intelligence OS",
      subtitle: "Palantir Gotham & Anduril Style",
      badge: "RECOMMENDED",
      icon: Shield,
      primaryColor: "#00e5ff",
      bgColor: "#030712",
      surfaceColor: "#07111e",
      borderColor: "#183352",
      features: [
        "Tactical operations deck with deep midnight slate (#07111e)",
        "Phosphor cyan (#00e5ff) telemetry & link highlights",
        "High-density forensic tables with cryptographic status tags",
        "Surgical typography: 13-14px body with JetBrains Mono hashes/IPs",
        "Graph view remains 100% untouched and fully interactive"
      ],
      visualMockup: {
        headerBg: "linear-gradient(90deg, #07111e 0%, #0d1e34 100%)",
        accentBg: "#00e5ff",
        pillText: "CASE-001 // CLASSIFIED",
        metrics: [
          { label: "EVIDENCE", val: "47 items" },
          { label: "THREAT", val: "CRITICAL" },
          { label: "IP TRACE", val: "203.0.113.88" }
        ],
        rowAccent: "#00e5ff44"
      }
    },
    {
      id: "falcon",
      name: "Option 2: Falcon Incident Response",
      subtitle: "CrowdStrike & EDR Command Style",
      badge: "ALERT-CENTRIC",
      icon: Flame,
      primaryColor: "#f59e0b",
      bgColor: "#080c14",
      surfaceColor: "#0e1422",
      borderColor: "#22314a",
      features: [
        "Alert-driven command room with amber (#f59e0b) & crimson alerts",
        "High-impact KPI telemetry strip for breach metrics",
        "Fast-triage event timeline with severity indicators",
        "Glassmorphic card surfaces with subtle tactical glow",
        "Graph view remains 100% untouched and fully interactive"
      ],
      visualMockup: {
        headerBg: "linear-gradient(90deg, #0e1422 0%, #172033 100%)",
        accentBg: "#f59e0b",
        pillText: "MITRE ATT&CK: T1078.004",
        metrics: [
          { label: "PAYLOAD", val: "800 MB" },
          { label: "STATUS", val: "ACTIVE BREACH" },
          { label: "TIME-WINDOW", val: "10m 00s" }
        ],
        rowAccent: "#ff335f44"
      }
    },
    {
      id: "minimalist",
      name: "Option 3: Cyber Minimalist Sleuth",
      subtitle: "Linear & Modern Dark Forensics Style",
      badge: "DISTRACTION-FREE",
      icon: Terminal,
      primaryColor: "#38bdf8",
      bgColor: "#000000",
      surfaceColor: "#0a0a0d",
      borderColor: "#1e1e26",
      features: [
        "Obsidian pure black canvas (#000000) with hairline zinc borders",
        "Ice blue (#38bdf8) precision focus states and quiet typography",
        "Zero-pill unboxed metadata discipline with typographic dots (·)",
        "Spacious, distraction-free forensic dossier view",
        "Graph view remains 100% untouched and fully interactive"
      ],
      visualMockup: {
        headerBg: "linear-gradient(90deg, #0a0a0d 0%, #141418 100%)",
        accentBg: "#38bdf8",
        pillText: "SHA-256 · VERIFIED HASH",
        metrics: [
          { label: "ENTITIES", val: "12 nodes" },
          { label: "CONFIDENCE", val: "94.2%" },
          { label: "CUSTODY", val: "CHAIN VALID" }
        ],
        rowAccent: "#38bdf833"
      }
    }
  ];

  return (
    <div className="template-modal-overlay" onClick={onClose}>
      <div className="template-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="template-modal-header">
          <div>
            <div className="template-kicker">
              <Sparkles size={14} /> DESIGN TEMPLATE SHOWCASE
            </div>
            <h2>Compare Visual Styles for EKDANTA</h2>
            <p>
              Preview how each theme styles the dashboard, tables, timeline, and controls.
              The connection graph physics and visual styling are <strong>100% preserved</strong> across all options.
            </p>
          </div>
          <button className="template-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="template-cards-grid">
          {templates.map((tpl) => {
            const Icon = tpl.icon;
            const isSelected = currentVariant === tpl.id;

            return (
              <div
                key={tpl.id}
                className={`template-card ${isSelected ? "selected" : ""}`}
                style={{
                  borderColor: isSelected ? tpl.primaryColor : undefined,
                  boxShadow: isSelected ? `0 0 24px ${tpl.primaryColor}33` : undefined,
                }}
              >
                <div className="template-card-top">
                  <div className="template-icon-wrapper" style={{ color: tpl.primaryColor, borderColor: `${tpl.primaryColor}55`, background: `${tpl.primaryColor}18` }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <span className="template-badge" style={{ color: tpl.primaryColor, borderColor: `${tpl.primaryColor}44`, background: `${tpl.primaryColor}14` }}>
                      {tpl.badge}
                    </span>
                    <h3>{tpl.name}</h3>
                    <small>{tpl.subtitle}</small>
                  </div>
                </div>

                {/* Visual Mockup Card */}
                <div
                  className="template-preview-frame"
                  style={{
                    backgroundColor: tpl.bgColor,
                    borderColor: tpl.borderColor,
                  }}
                >
                  {/* Mock Window Bar */}
                  <div
                    className="mock-topbar"
                    style={{
                      background: tpl.visualMockup.headerBg,
                      borderColor: tpl.borderColor,
                    }}
                  >
                    <div className="mock-dots">
                      <span style={{ background: "#ff5f56" }} />
                      <span style={{ background: "#ffbd2e" }} />
                      <span style={{ background: "#27c93f" }} />
                    </div>
                    <span className="mock-case-tag" style={{ color: tpl.primaryColor, borderColor: `${tpl.primaryColor}44` }}>
                      {tpl.visualMockup.pillText}
                    </span>
                  </div>

                  {/* Mock Content */}
                  <div className="mock-body" style={{ background: tpl.surfaceColor }}>
                    <div className="mock-metrics">
                      {tpl.visualMockup.metrics.map((m, i) => (
                        <div key={i} className="mock-metric-item" style={{ borderColor: tpl.borderColor }}>
                          <span className="mock-metric-label">{m.label}</span>
                          <span className="mock-metric-val" style={{ color: i === 1 ? tpl.primaryColor : undefined }}>
                            {m.val}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mock-row" style={{ borderColor: tpl.borderColor, borderLeftColor: tpl.primaryColor }}>
                      <div className="mock-line-title">
                        <span style={{ color: tpl.primaryColor }}>●</span> 11:49 PM · Server-04 Exfiltration
                      </div>
                      <div className="mock-line-sub">800 MB routed to remote target · Session compromised</div>
                    </div>

                    <div className="mock-graph-indicator" style={{ borderColor: tpl.borderColor }}>
                      <span className="mock-graph-node" style={{ background: tpl.primaryColor, boxShadow: `0 0 10px ${tpl.primaryColor}` }} />
                      <span className="mock-graph-link" style={{ background: tpl.visualMockup.rowAccent }} />
                      <span className="mock-graph-node secondary" />
                      <span className="mock-graph-label">Connection Graph Intact</span>
                    </div>
                  </div>
                </div>

                {/* Feature Bullet Points */}
                <ul className="template-features">
                  {tpl.features.map((feat, idx) => (
                    <li key={idx}>
                      <Check size={14} style={{ color: tpl.primaryColor, flexShrink: 0 }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* Select / Activate Button */}
                <button
                  className={`template-apply-btn ${isSelected ? "active" : ""}`}
                  style={{
                    background: isSelected ? tpl.primaryColor : undefined,
                    color: isSelected ? "#030712" : undefined,
                    borderColor: tpl.primaryColor,
                  }}
                  onClick={() => {
                    onSelectVariant(tpl.id);
                  }}
                >
                  {isSelected ? (
                    <>
                      <Check size={16} /> Currently Active
                    </>
                  ) : (
                    <>
                      <Eye size={16} /> Apply This Style
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="template-modal-footer">
          <p>
            💡 You can switch themes at any time using the quick selector in the top bar. All case data, investigator state, and graph physics remain fully preserved.
          </p>
          <button className="template-done-btn" onClick={onClose}>
            Done Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
