import React, { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  Search, 
  Settings, 
  Menu, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink 
} from "lucide-react";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import type { Page } from "../data";

interface TopbarProps {
  theme: "dark" | "light";
  activePage: Page;
  onToggle: () => void;
  onNavigate: (p: Page) => void;
}

export function Topbar({
  theme,
  activePage,
  onToggle,
  onNavigate,
}: TopbarProps) {
  const [searchVal, setSearchVal] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const navLinks: { id: Page; label: string }[] = [
    { id: "dashboard", label: "DASHBOARD" },
    { id: "new", label: "NEW CASE" },
    { id: "evidence", label: "EVIDENCE" },
    { id: "timeline", label: "TIMELINE" },
    { id: "graph", label: "GRAPH" },
    { id: "ai", label: "AI ANALYST" },
    { id: "report", label: "REPORT" },
  ];

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    // Route to evidence or entities based on query
    onNavigate("evidence");
  };

  const handleNavClick = (pageId: Page) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  const notifications = [
    {
      id: "N-1",
      title: "Rogue MAC Address Detected",
      desc: "D4:F5:47:9A:11:02 requested Kerberos TGT ticket on VLAN-04",
      time: "11:47 PM",
      level: "critical"
    },
    {
      id: "N-2",
      title: "Classified File Read Handle",
      desc: "PROJECT_ORION_INTERNAL_SPEC.pdf accessed on Server-04",
      time: "11:47 PM",
      level: "critical"
    },
    {
      id: "N-3",
      title: "Encrypted Exfiltration Stream",
      desc: "800 MB routed to external C2 address 203.0.113.88:4433",
      time: "11:49 PM",
      level: "high"
    }
  ];

  return (
    <header className="topbar">
      <div className="topbar-inner">
        {/* Left: Brand Lockup */}
        <div className="topbar-left">
          <Brand onClick={() => handleNavClick("home")} />
        </div>

        {/* Center: Search Field */}
        <form className="top-search" onSubmit={handleSearchSubmit}>
          <Search size={14} className="search-icon" />
          <input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search entities, files, IPs, devices..."
            aria-label="Search forensic data"
          />
          {searchVal ? (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchVal("")}
              aria-label="Clear search"
            >
              &times;
            </button>
          ) : (
            <span className="search-kbd font-mono">⌘K</span>
          )}
        </form>

        {/* Desktop Primary Navigation */}
        <nav className="top-nav" aria-label="Main Navigation">
          {navLinks.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                className={`top-nav-btn ${isActive ? "active" : ""}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span>{item.label}</span>
                {isActive && <span className="nav-glow-line" />}
              </button>
            );
          })}
        </nav>

        {/* Right System Actions */}
        <div className="top-actions">
          {/* Settings */}
          <button
            className={`top-action-btn ${activePage === "settings" ? "active" : ""}`}
            onClick={() => handleNavClick("settings")}
            title="System Configuration"
            aria-label="Settings"
          >
            <Settings size={15} />
          </button>

          {/* Theme Switcher */}
          <ThemeToggle theme={theme} onToggle={onToggle} />

          {/* Notifications Trigger & Popover */}
          <div className="notification-wrapper" ref={notifRef}>
            <button
              className={`top-action-btn ${notificationsOpen ? "active" : ""}`}
              onClick={() => setNotificationsOpen((v) => !v)}
              title="Incident Alerts (3)"
              aria-label="Incident Alerts"
            >
              <Bell size={15} className="top-muted" />
              <span className="alert-ping" />
            </button>

            {notificationsOpen && (
              <div className="notifications-popover">
                <div className="notif-header">
                  <div className="notif-title-group">
                    <ShieldAlert size={14} className="text-danger" />
                    <span className="font-bold text-xs">CRITICAL INCIDENT ALERTS</span>
                  </div>
                  <span className="notif-count-badge font-mono">3 NEW</span>
                </div>

                <div className="notif-list">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className="notif-item"
                      onClick={() => {
                        setNotificationsOpen(false);
                        onNavigate("timeline");
                      }}
                    >
                      <div className="notif-top">
                        <span className={`notif-dot ${n.level}`} />
                        <b>{n.title}</b>
                        <span className="notif-time font-mono">{n.time}</span>
                      </div>
                      <p>{n.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="notif-footer">
                  <button 
                    className="view-all-alerts-btn font-mono"
                    onClick={() => {
                      setNotificationsOpen(false);
                      onNavigate("timeline");
                    }}
                  >
                    <span>VIEW FULL ATTACK TIMELINE</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Analyst Status Badge */}
          <div className="analyst-badge" title="Active Investigator Session: Analyst-04">
            <span className="analyst-status" />
            <span className="font-mono text-xs">ANALYST-04</span>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-links">
            {navLinks.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  className={`mobile-nav-btn ${isActive ? "active" : ""}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="mobile-active-dot" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
