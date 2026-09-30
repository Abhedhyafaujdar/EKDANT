import React from "react";
import { FileSearch, Users, Share2, ShieldAlert } from "lucide-react";

export function StatCards() {
  const cards = [
    { num: "47", label: "EVIDENCE ITEMS", icon: FileSearch, color: "text-cyan", highlight: false },
    { num: "12", label: "ENTITIES IDENTIFIED", icon: Users, color: "text-blue", highlight: false },
    { num: "8", label: "ACTIVE RELATIONSHIPS", icon: Share2, color: "text-purple", highlight: false },
    { num: "3", label: "PERSONS OF INTEREST", icon: ShieldAlert, color: "text-danger", highlight: true },
  ];

  return (
    <div className="forensic-stat-grid">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className={`stat-tile ${c.highlight ? "alert-highlight" : ""}`}>
            <div className="stat-icon-wrapper">
              <Icon size={18} className={c.color} />
            </div>
            <div className="stat-content">
              <b className={`stat-val font-mono ${c.highlight ? "text-danger" : ""}`}>{c.num}</b>
              <span className="stat-label">{c.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
