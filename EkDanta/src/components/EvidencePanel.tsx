import React, { useState } from "react";
import { evidence, EvidenceItem } from "../data";
import { Search, Hash } from "lucide-react";

export function EvidencePanel() {
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filterOptions = ["ALL", "LOGIN", "FILE", "NETWORK", "PHYSICAL", "PRIVILEGE"];

  const filtered = evidence.filter((e) => {
    const matchesFilter = filter === "ALL" || e.type.toUpperCase() === filter;
    const matchesSearch =
      searchQuery === "" ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.entities.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <section className="command-panel evidence-panel">
      <div className="panel-header">
        <div>
          <h3>EVIDENCE EXPLORER</h3>
          <p className="text-xs text-muted">Cryptographically audited events extracted from case file</p>
        </div>
        <div className="table-search-input">
          <Search size={14} className="text-muted" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search evidence..."
          />
        </div>
      </div>

      <div className="segmented-filter-group" style={{ marginBottom: 14 }}>
        {filterOptions.map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="forensic-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>TIME</th>
              <th>TYPE</th>
              <th>DESCRIPTION</th>
              <th>ENTITIES</th>
              <th>CLASSIFICATION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 10).map((e) => {
              const isCrit = e.classification === "Potential Attack" || e.classification === "Critical";
              const isSusp = e.classification === "Suspicious" || e.classification === "Anomalous";

              return (
                <tr key={e.id}>
                  <td className="font-mono text-cyan">{e.id}</td>
                  <td className="font-mono text-muted text-xs">{e.time}</td>
                  <td>
                    <span className="type-tag">{e.type}</span>
                  </td>
                  <td>{e.desc}</td>
                  <td className="font-mono text-xs text-secondary">{e.entities}</td>
                  <td>
                    <span className={`status-badge ${isCrit ? "critical" : isSusp ? "suspicious" : "normal"}`}>
                      {e.classification}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
