import React, { useState } from "react";
import { Clock3, Filter, ShieldAlert, CheckCircle2, AlertTriangle, Flame, Terminal, FileText } from "lucide-react";
import { timeline, TimelineEvent } from "../data";

export function TimelinePage() {
  const [filter, setFilter] = useState<string>("ALL");
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(timeline[3]);

  const filtered = timeline.filter((item) => {
    if (filter === "ALL") return true;
    if (filter === "ATTACK") return item.classification === "Potential Attack";
    if (filter === "SUSPICIOUS") return item.classification === "Suspicious" || item.classification === "Anomalous";
    if (filter === "NORMAL") return item.classification === "Normal" || item.classification === "File Access";
    return true;
  });

  return (
    <main className="page inner-page cyber-timeline-page">
      {/* Header */}
      <div className="workstation-header">
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <span className="technical-kicker">INCIDENT RECONSTRUCTION ENGINE</span>
        <h1>INCIDENT TIMELINE</h1>
        <p>
          Chronological second-by-second attack sequence reconstructed from normalized syslog timestamps,
          firewall flow records, Kerberos authentications, and physical security telemetry.
        </p>
      </div>

      {/* Filter Tabs & Telemetry */}
      <div className="timeline-toolbar">
        <div className="segmented-filter-group">
          {["ALL", "ATTACK", "SUSPICIOUS", "NORMAL"].map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${filter === cat ? "active" : ""}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="font-mono text-xs text-muted">
          <span>CORRELATED EVENTS: </span>
          <b className="text-cyan">{filtered.length} of {timeline.length}</b>
        </div>
      </div>

      <div className="timeline-layout-grid">
        {/* Main Vertical Glowing Timeline */}
        <div className="timeline-flow-container">
          <div className="vertical-timeline-flow">
            {filtered.map((item) => {
              const isSelected = selectedEvent?.id === item.id;
              const markerClass =
                item.classification === "Potential Attack"
                  ? "marker-attack"
                  : item.classification === "Suspicious" || item.classification === "Anomalous"
                  ? "marker-suspicious"
                  : "marker-normal";

              return (
                <div
                  key={item.id}
                  className={`timeline-flow-card ${markerClass} ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedEvent(item)}
                >
                  {/* Glowing Node Marker */}
                  <div className="timeline-axis-line">
                    <span className="glowing-node-dot" />
                    <span className="glowing-line-stem" />
                  </div>

                  <div className="timeline-card-content">
                    <div className="card-top-row">
                      <span className="event-time-badge font-mono">{item.time}</span>
                      <span className={`status-badge ${item.classification.toLowerCase().replace(" ", "-")}`}>
                        [ {item.classification.toUpperCase()} ]
                      </span>
                      <span className="confidence-pill font-mono text-xs">
                        CONFIDENCE: {item.confidence}%
                      </span>
                    </div>

                    <h3 className="event-title">{item.title}</h3>
                    <p className="event-desc">{item.desc}</p>

                    <div className="event-meta-tags font-mono text-xs">
                      <span><strong>ENTITY:</strong> {item.entity}</span>
                      <span className="sep">&bull;</span>
                      <span><strong>SOURCE:</strong> {item.source}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Event Forensic Inspector */}
        <aside className="timeline-event-inspector">
          {selectedEvent ? (
            <div className="inspector-card">
              <div className="inspector-head">
                <span className="technical-kicker">EVENT FORENSIC INSPECTOR</span>
                <h3>{selectedEvent.title}</h3>
                <span className="font-mono text-cyan text-xs">{selectedEvent.time} UTC</span>
              </div>

              <div className="inspector-dl">
                <div className="inspector-row">
                  <span>Classification</span>
                  <b className={`status-badge ${selectedEvent.classification.toLowerCase().replace(" ", "-")}`}>
                    {selectedEvent.classification}
                  </b>
                </div>
                <div className="inspector-row">
                  <span>Confidence Score</span>
                  <b className="font-mono text-cyan">{selectedEvent.confidence}% VERIFIED</b>
                </div>
                <div className="inspector-row">
                  <span>Target Entity</span>
                  <b className="font-mono">{selectedEvent.entity}</b>
                </div>
                <div className="inspector-row">
                  <span>Telemetry Origin</span>
                  <b className="text-secondary">{selectedEvent.source}</b>
                </div>
              </div>

              {/* Raw Log Excerpt */}
              <div className="raw-log-box">
                <div className="raw-log-title font-mono text-xs">RAW FORENSIC TELEMETRY</div>
                <pre className="raw-log-pre font-mono">
                  {`[2024-01-14T23:${selectedEvent.time.split(":")[1].split(" ")[0]}:00.104Z] SYSLOG-REC
HOST=${selectedEvent.entity} EVENT=${selectedEvent.title}
SOURCE="${selectedEvent.source}"
SEC_AUDIT: UID=1004 PID=4912 INTEGRITY=VERIFIED
HASH=9a8b1c4e2f5d7e0a12...`}
                </pre>
              </div>

              <div className="inspector-actions">
                <button className="primary-action-btn full">
                  <span>CROSS-REFERENCE WITH GRAPH</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-inspector">
              <Clock3 size={32} className="text-muted" />
              <p>Select any event in the timeline to inspect custodial logs.</p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
