import React, { useState } from "react";
import { timeline } from "../data";
import { LogIn, UserRoundSearch, FileText, ArrowUpRight, MonitorCheck } from "lucide-react";

const icons: Record<string, React.ComponentType<{ size?: number }>> = {
  login: LogIn,
  physical: UserRoundSearch,
  file: FileText,
  network: ArrowUpRight,
  session: MonitorCheck
};

export function TimelinePanel({ compact = false }: { compact?: boolean }) {
  const [filter, setFilter] = useState("all");

  const filtered = timeline.filter((e) => {
    if (filter === "suspicious") {
      return e.classification === "Suspicious" || e.classification === "Potential Attack" || e.classification === "Anomalous";
    }
    return true;
  });

  return (
    <section className="panel timeline-panel">
      <div className="panel-header">
        <div>
          <h3>INCIDENT TIMELINE</h3>
          <p className="text-xs text-muted">Reconstructed chronological event sequence</p>
        </div>
        <select
          className="cyber-select text-xs"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Events ({timeline.length})</option>
          <option value="suspicious">Suspicious Only</option>
        </select>
      </div>

      <div className="vertical-timeline-list">
        {filtered.slice(0, compact ? 5 : 10).map((e) => {
          const Icon = icons[e.type] || LogIn;
          const isCritical = e.classification === "Potential Attack";
          const isSuspicious = e.classification === "Suspicious" || e.classification === "Anomalous";

          return (
            <div className="timeline-node-item" key={e.id}>
              <span className="node-time font-mono">{e.time}</span>
              <div className="node-axis">
                <span className={`node-marker ${e.type}`} />
                <span className="node-stem" />
              </div>
              <div className="node-details">
                <div className="node-title-row">
                  <b>{e.title}</b>
                  <span
                    className={`status-badge ${
                      isCritical ? "critical" : isSuspicious ? "suspicious" : "normal"
                    }`}
                  >
                    {e.classification}
                  </span>
                </div>
                <p>{e.desc}</p>
                <div className="node-metadata font-mono text-xs">
                  <span>{e.entity}</span> &bull; <span>{e.source}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
