import React, { useState } from "react";
import { FileSearch, Filter, ShieldCheck, Hash, ExternalLink, Download, Search } from "lucide-react";
import { evidence, EvidenceItem } from "../data";

export function EvidencePage() {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(evidence[0]);

  const filterOptions = ["ALL", "LOGIN", "FILE ACCESS", "NETWORK", "PHYSICAL", "PRIVILEGE"];

  const filtered = evidence.filter((item) => {
    const matchesFilter =
      activeFilter === "ALL" ||
      item.type.toUpperCase() === activeFilter ||
      (activeFilter === "FILE ACCESS" && item.type === "File");

    const matchesSearch =
      searchQuery === "" ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.entities.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <main className="page inner-page cyber-evidence-page">
      {/* Header */}
      <div className="workstation-header">
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <span className="technical-kicker">DIGITAL CRIME SCENE EVIDENCE REPOSITORY</span>
        <h1>EVIDENCE EXPLORER</h1>
        <p>
          Cryptographically audited forensic artifacts extracted from network captures, disk forensics, 
          and event logs. Every item maintains hash verification and custodial timestamps.
        </p>
      </div>

      {/* Toolbar & Filters */}
      <div className="evidence-toolbar">
        <div className="segmented-filter-group">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              className={`filter-btn ${activeFilter === opt ? "active" : ""}`}
              onClick={() => setActiveFilter(opt)}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="table-search-input">
          <Search size={14} className="text-muted" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by ID, description, entity..."
            aria-label="Filter evidence"
          />
        </div>
      </div>

      {/* Main Evidence Table */}
      <div className="evidence-table-container">
        <div className="table-responsive">
          <table className="forensic-table full">
            <thead>
              <tr>
                <th>ID</th>
                <th>TIME</th>
                <th>TYPE</th>
                <th>DESCRIPTION</th>
                <th>ENTITIES</th>
                <th>SOURCE</th>
                <th>CLASSIFICATION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isSelected = selectedEvidence?.id === item.id;
                return (
                  <tr
                    key={item.id}
                    className={`evidence-row ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedEvidence(item)}
                  >
                    <td className="font-mono text-cyan font-bold">{item.id}</td>
                    <td className="font-mono text-muted">{item.time}</td>
                    <td><span className="type-tag">{item.type}</span></td>
                    <td className="desc-cell">{item.desc}</td>
                    <td className="entities-cell font-mono text-xs text-secondary">{item.entities}</td>
                    <td className="text-muted text-xs">{item.source}</td>
                    <td>
                      <span className={`status-badge ${item.classification.toLowerCase().replace(" ", "-")}`}>
                        [ {item.classification.toUpperCase()} ]
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custodial Evidence Detail Drawer */}
      {selectedEvidence && (
        <div className="evidence-custody-card">
          <div className="custody-header">
            <div>
              <span className="technical-kicker">CUSTODIAL CHAIN OF CUSTODY VERIFICATION</span>
              <h3>{selectedEvidence.id} &bull; {selectedEvidence.type} Artifact</h3>
            </div>
            <span className="status-badge guarded font-mono">[ HASH INTEGRITY: 100% ]</span>
          </div>

          <div className="custody-grid font-mono">
            <div className="custody-item">
              <span className="label">SHA-256 HASH</span>
              <span className="val text-cyan">{selectedEvidence.hash || "e3b0c44298fc1c149afbf4c8996fb92427ae..."}</span>
            </div>
            <div className="custody-item">
              <span className="label">TIMESTAMP</span>
              <span className="val">{selectedEvidence.time} UTC</span>
            </div>
            <div className="custody-item">
              <span className="label">INGESTION SOURCE</span>
              <span className="val">{selectedEvidence.source}</span>
            </div>
            <div className="custody-item">
              <span className="label">CORRELATED ENTITIES</span>
              <span className="val text-secondary">{selectedEvidence.entities}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
