import React from "react";
import {
  LayoutDashboard,
  UploadCloud,
  Clock3,
  FileSearch,
  Users,
  Share2,
  ScanSearch,
  BrainCircuit,
  FileText,
  Home,
  Settings,
  ShieldAlert,
  Server,
  Activity
} from "lucide-react";
import type { Page } from "../data";
import { activeCase } from "../data";

interface SidebarProps {
  active: Page;
  onNavigate: (p: Page) => void;
}

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "new", label: "New Case", icon: UploadCloud },
  { id: "timeline", label: "Timeline", icon: Clock3 },
  { id: "evidence", label: "Evidence Explorer", icon: FileSearch },
  { id: "entities", label: "Entity Explorer", icon: Users },
  { id: "graph", label: "Connection Graph", icon: Share2 },
  { id: "poi", label: "Persons of Interest", icon: ScanSearch },
  { id: "ai", label: "AI Analyst", icon: BrainCircuit },
  { id: "report", label: "Investigation Report", icon: FileText },
  { id: "settings", label: "System Settings", icon: Settings },
];

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Active Case Docket */}
      <div className="side-case-docket">
        <div className="docket-header">
          <span className="font-mono text-cyan text-xs">{activeCase.code}</span>
          <span className="case-status-badge">[ {activeCase.status} ]</span>
        </div>
        <h4 className="docket-title">{activeCase.title}</h4>
        <p className="docket-summary">{activeCase.summary.slice(0, 105)}...</p>

        <div className="docket-meta">
          <div className="docket-meta-row">
            <span className="meta-icon">◷</span>
            <span className="font-mono text-xs">{activeCase.incidentWindow.split(" · ")[1]}</span>
          </div>
          <div className="docket-meta-row">
            <span className="meta-icon"><Server size={12} /></span>
            <span className="font-mono text-xs">{activeCase.affectedAsset.split(" ")[0]}</span>
          </div>
        </div>

        <div className="docket-risk-row">
          <ShieldAlert size={14} className="text-danger" />
          <div>
            <span className="risk-label">RISK LEVEL</span>
            <b className="risk-val text-danger">{activeCase.riskLevel}</b>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="side-nav-group">
        <span className="side-nav-heading">INVESTIGATION MODULES</span>
        <div className="side-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                className={`side-link ${isActive ? "active" : ""}`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={15} className="side-link-icon" />
                <span className="side-link-label">{item.label}</span>
                {isActive && <span className="side-active-dot" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 25: Technical Status Elements */}
      <div className="side-system-telemetry">
        <div className="system-status-row">
          <span className="status-label">SYSTEM STATUS</span>
          <span className="status-indicator online">
            <span className="dot" /> ONLINE
          </span>
        </div>
        <div className="system-status-row">
          <span className="status-label">GRAPH ENGINE</span>
          <span className="status-indicator online">
            <span className="dot" /> ACTIVE
          </span>
        </div>
        <div className="system-status-row">
          <span className="status-label">EVIDENCE INDEX</span>
          <span className="status-indicator font-mono">
            47 ITEMS
          </span>
        </div>
        <div className="system-status-row">
          <span className="status-label">AI ANALYST</span>
          <span className="status-indicator online">
            <span className="dot" /> READY
          </span>
        </div>
      </div>
    </aside>
  );
}
