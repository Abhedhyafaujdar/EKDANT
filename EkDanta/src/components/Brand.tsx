import React from "react";

export function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <div className="brand" onClick={onClick} role="button" tabIndex={0} style={{ cursor: "pointer" }}>
      <span className="brand-dot-symbol" />
      <div className="brand-text">
        <b className="brand-title">EKDANTA</b>
        <span className="brand-subtitle">CYBER FORENSIC OS</span>
      </div>
    </div>
  );
}
