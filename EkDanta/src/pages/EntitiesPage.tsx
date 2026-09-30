import React, { useState } from "react";
import { 
  Users, 
  Monitor, 
  Server, 
  FileText, 
  Globe, 
  Key, 
  ShieldAlert, 
  ArrowRight, 
  ExternalLink 
} from "lucide-react";
import { entitiesList, Entity, EntityType } from "../data";

export function EntitiesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedEntity, setSelectedEntity] = useState<Entity>(entitiesList[0]);

  const categories: { id: string; label: string; icon: React.ElementType }[] = [
    { id: "ALL", label: "ALL ENTITIES", icon: Users },
    { id: "person", label: "PEOPLE", icon: Users },
    { id: "device", label: "DEVICES", icon: Monitor },
    { id: "server", label: "SERVERS", icon: Server },
    { id: "file", label: "FILES", icon: FileText },
    { id: "ip", label: "NETWORK / IPs", icon: Globe },
    { id: "account", label: "ACCOUNTS", icon: Key }
  ];

  const filtered = entitiesList.filter((e) => {
    if (selectedCategory === "ALL") return true;
    return e.type === selectedCategory;
  });

  return (
    <main className="page inner-page cyber-entities-page">
      {/* Header */}
      <div className="workstation-header">
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <span className="technical-kicker">INCIDENT ENTITY REGISTRY</span>
        <h1>ENTITY EXPLORER</h1>
        <p>
          Catalogued personas, rogue hardware, victim servers, defense files, and external destination addresses 
          correlated during automated forensic triage.
        </p>
      </div>

      {/* Category Pills */}
      <div className="category-toolbar">
        <div className="segmented-filter-group">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                className={`filter-btn ${selectedCategory === cat.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <Icon size={13} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="entity-workstation-grid">
        {/* Left: Cards Grid */}
        <div className="entity-cards-container">
          <div className="forensic-entity-grid">
            {filtered.map((item) => {
              const isSelected = selectedEntity.id === item.id;
              return (
                <div
                  key={item.id}
                  className={`forensic-entity-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedEntity(item)}
                >
                  <div className="entity-card-header">
                    <span className="font-mono text-cyan text-xs uppercase">{item.type}</span>
                    <span className={`status-badge ${item.riskCategory.toLowerCase().replace(" ", "-")}`}>
                      [ RISK {item.riskScore}% ]
                    </span>
                  </div>

                  <h3 className="entity-card-name font-mono">{item.name}</h3>
                  <p className="entity-card-role">{item.role}</p>

                  <div className="entity-card-metrics font-mono text-xs">
                    <div>
                      <span className="metric-label">RELATIONS:</span>
                      <b>{item.relationshipsCount}</b>
                    </div>
                    <div>
                      <span className="metric-label">EVIDENCE:</span>
                      <b>{item.evidenceCount}</b>
                    </div>
                    <div>
                      <span className="metric-label">LAST SEEN:</span>
                      <b className="text-secondary">{item.lastSeen.split(", ")[1] || item.lastSeen}</b>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Entity Forensic Inspector */}
        <aside className="entity-detail-aside">
          <div className="inspector-card">
            <div className="inspector-head">
              <span className="technical-kicker">SELECTED ENTITY METADATA</span>
              <h2>{selectedEntity.name}</h2>
              <span className="entity-role text-secondary">{selectedEntity.role}</span>
            </div>

            {/* Risk Indicator Meter */}
            <div className="risk-meter-box">
              <div className="risk-meter-header">
                <span>Threat Index Score</span>
                <b className="font-mono text-cyan">{selectedEntity.riskScore}% &bull; {selectedEntity.riskCategory}</b>
              </div>
              <div className="risk-meter-bar">
                <div
                  className="risk-meter-fill"
                  style={{
                    width: `${selectedEntity.riskScore}%`,
                    background: selectedEntity.riskScore > 75 ? "linear-gradient(90deg, #FFB82E, #FF315B)" : "linear-gradient(90deg, #16D6A3, #00D9FF)"
                  }}
                />
              </div>
            </div>

            {/* Key Metadata Table */}
            <div className="entity-meta-list font-mono text-xs">
              {Object.entries(selectedEntity.metadata).map(([k, v]) => (
                <div key={k} className="entity-meta-row">
                  <span className="text-muted">{k}</span>
                  <span className="text-cyan font-bold">{v}</span>
                </div>
              ))}
            </div>

            {/* Connected Relations */}
            {selectedEntity.connectedEntities && selectedEntity.connectedEntities.length > 0 && (
              <div className="entity-relations-box">
                <h4>CORRELATED NETWORK ADJACENCIES</h4>
                <ul className="connected-list">
                  {selectedEntity.connectedEntities.map((peer) => (
                    <li key={peer.id}>
                      <span className="peer-type-dot" style={{ background: "#00D9FF" }} />
                      <div className="peer-info">
                        <b>{peer.name}</b>
                        <small>{peer.role}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button className="primary-action-btn full">
              <span>EXPLORE ON RELATION GRAPH</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
