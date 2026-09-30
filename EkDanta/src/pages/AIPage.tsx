import React, { useState } from "react";
import { 
  BrainCircuit, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  ShieldCheck, 
  Info, 
  Layers, 
  Cpu, 
  Sparkles 
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "analyst";
  timestamp: string;
  text?: string;
  evidenceChain?: { step: string; text: string; ref: string }[];
  facts?: string[];
  inferences?: string[];
  uncertainties?: string[];
  alternatives?: string[];
  limitation?: string;
}

export function AIPage() {
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-1",
      sender: "user",
      timestamp: "11:58:12 UTC",
      text: "Why is Rohit's account a high-priority investigative lead?"
    },
    {
      id: "m-2",
      sender: "analyst",
      timestamp: "11:58:14 UTC",
      evidenceChain: [
        {
          step: "01",
          text: "Credentials associated with Rohit's Kerberos principal were used to authenticate to the core domain network.",
          ref: "Evidence ID: E-015"
        },
        {
          step: "02",
          text: "Authentication originated from an uncatalogued device MAC address (D4:F5:47:9A:11:02) rather than assigned workstation SEC-02.",
          ref: "Evidence ID: E-028"
        },
        {
          step: "03",
          text: "The authenticated session opened an SSH handle directly on Server-04.",
          ref: "Evidence ID: E-033"
        },
        {
          step: "04",
          text: "Confidential defense blueprint PROJECT_ORION_INTERNAL_SPEC.pdf was accessed from Server-04 vault storage.",
          ref: "Evidence ID: E-033"
        },
        {
          step: "05",
          text: "An external high-speed 800 MB encrypted transfer occurred shortly afterward to offshore IP 203.0.113.88.",
          ref: "Evidence ID: E-034"
        }
      ],
      facts: [
        "Rohit's Kerberos TGT was used during the incident window (11:42 PM - 11:52 PM).",
        "Target file was accessed and transferred to external IP 203.0.113.88."
      ],
      inferences: [
        "The actor had administrative access or knowledge of internal server topologies."
      ],
      uncertainties: [
        "Physical badge logs place Rohit outside the facility at 18:30; operator identity at keyboard remains unverified."
      ],
      alternatives: [
        "Credential theft via infostealer malware, compromised VPN profile, or session token replay."
      ],
      limitation: "This evidence supports investigation of the account credentials, but does NOT establish who personally operated the keyboard or performed the exfiltration."
    }
  ]);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const userMsg: Message = {
      id: `m-${Date.now()}`,
      sender: "user",
      timestamp: "12:01:04 UTC",
      text: inputVal
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");

    setTimeout(() => {
      const replyMsg: Message = {
        id: `m-${Date.now() + 1}`,
        sender: "analyst",
        timestamp: "12:01:06 UTC",
        evidenceChain: [
          {
            step: "01",
            text: "Correlated Zeek connection flow records show active socket duration of 3 minutes 12 seconds.",
            ref: "Evidence ID: E-034"
          },
          {
            step: "02",
            text: "Destination IP 203.0.113.88 belongs to offshore Autonomous System AS4134 without corporate business affiliation.",
            ref: "Threat Intel Feed #AS4134"
          }
        ],
        facts: [
          "800 MB transmitted over encrypted port 4433."
        ],
        inferences: [
          "Transfer speed (38 MB/s) suggests direct fiber uplink rather than consumer broadband."
        ],
        uncertainties: [
          "Payload encryption key is unknown; specific sub-files within archive cannot be decrypted without key recovery."
        ],
        alternatives: [
          "Automated backup job misconfiguration vs intentional adversarial exfiltration."
        ],
        limitation: "Network flow records confirm bytes transferred and destination, but cannot inspect encrypted payload without SSL interception keys."
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 600);
  };

  return (
    <main className="page inner-page cyber-ai-page">
      {/* Header */}
      <div className="workstation-header">
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <span className="technical-kicker">SECURE FORENSIC REASONING TERMINAL</span>
        <h1>AI FORENSIC ANALYST</h1>
        <p>
          Evidence-grounded hypothesis generation and contradiction detection. Every conclusion cites 
          verified custodial artifacts; inferences and uncertainties are explicitly segregated.
        </p>
      </div>

      <div className="ai-analyst-layout">
        {/* Left: Terminal Conversation */}
        <section className="terminal-chat-pane">
          <div className="terminal-pane-header">
            <div className="terminal-title font-mono text-xs">
              <Terminal size={14} className="text-cyan" />
              <span>TERMINAL // SESSION_SEC_001</span>
            </div>
            <span className="status-badge guarded font-mono">[ STRICT GROUNDING: ENFORCED ]</span>
          </div>

          <div className="terminal-messages-body">
            {messages.map((m) => (
              <div key={m.id} className={`chat-bubble-row ${m.sender}`}>
                <div className="bubble-meta font-mono text-xs">
                  <span>{m.sender === "user" ? "INVESTIGATOR // ANALYST-04" : "EKDANTA FORENSIC REASONER"}</span>
                  <span className="sep">&bull;</span>
                  <span className="text-muted">{m.timestamp}</span>
                </div>

                {m.text && <div className="user-message-box">{m.text}</div>}

                {m.evidenceChain && (
                  <div className="analyst-report-box">
                    {/* Evidence Chain */}
                    <div className="report-block">
                      <span className="technical-kicker">EVIDENCE CHAIN</span>
                      <div className="chain-steps-list">
                        {m.evidenceChain.map((c) => (
                          <div key={c.step} className="chain-step-row">
                            <span className="step-num font-mono text-cyan">{c.step}</span>
                            <div className="step-body">
                              <p>{c.text}</p>
                              <span className="step-ref font-mono text-xs">{c.ref}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Taxonomy Breakdown: Facts vs Inferences vs Uncertainties */}
                    <div className="taxonomy-grid">
                      {m.facts && m.facts.length > 0 && (
                        <div className="taxonomy-card fact">
                          <span className="tax-label font-mono">FACT (VERIFIED EVIDENCE)</span>
                          <ul>
                            {m.facts.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {m.inferences && m.inferences.length > 0 && (
                        <div className="taxonomy-card inference">
                          <span className="tax-label font-mono">INFERENCE (PROBABILISTIC)</span>
                          <ul>
                            {m.inferences.map((inf, i) => (
                              <li key={i}>{inf}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {m.uncertainties && m.uncertainties.length > 0 && (
                        <div className="taxonomy-card uncertainty">
                          <span className="tax-label font-mono">UNCERTAINTY (UNRESOLVED)</span>
                          <ul>
                            {m.uncertainties.map((u, i) => (
                              <li key={i}>{u}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {m.alternatives && m.alternatives.length > 0 && (
                        <div className="taxonomy-card alternative">
                          <span className="tax-label font-mono">ALTERNATIVE EXPLANATION</span>
                          <ul>
                            {m.alternatives.map((alt, i) => (
                              <li key={i}>{alt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Section 19: Limitation Box */}
                    {m.limitation && (
                      <div className="limitation-callout-box">
                        <AlertTriangle size={15} className="text-warning flex-shrink-0" />
                        <div>
                          <b className="font-mono text-warning text-xs">LIMITATION CALLOUT</b>
                          <p>{m.limitation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Prompt Suggestions & Input */}
          <div className="terminal-input-bar">
            <div className="prompt-chips-row">
              <button onClick={() => setInputVal("Why is Rohit's account a high-priority investigative lead?")}>
                Why is Rohit's account high priority?
              </button>
              <button onClick={() => setInputVal("What contradictory physical evidence exists?")}>
                Contradictory physical evidence?
              </button>
              <button onClick={() => setInputVal("Trace exfiltration socket connection parameters.")}>
                Exfiltration socket details
              </button>
            </div>

            <div className="terminal-field">
              <span className="prompt-symbol font-mono text-cyan">&gt;</span>
              <input
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                placeholder="Query evidence chain, anomalies, or alternative hypotheses..."
                aria-label="Ask AI Analyst"
              />
              <button className="terminal-send-btn" onClick={handleSend} aria-label="Send query">
                <Send size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* Right: Section 18 Grounding Checks */}
        <aside className="grounding-checks-pane">
          <div className="inspector-card">
            <div className="inspector-head">
              <span className="technical-kicker">SAFETY & ACCURACY RIGOR</span>
              <h3>GROUNDING CHECKS</h3>
              <p className="text-muted text-xs">Continuous algorithmic adherence to court-admissible standards</p>
            </div>

            <div className="grounding-checklist">
              <div className="check-item verified">
                <CheckCircle2 size={16} className="text-green flex-shrink-0" />
                <div>
                  <b>Every conclusion linked to evidence</b>
                  <p>Inferences mandate explicit citation of verified forensic artifact IDs.</p>
                </div>
              </div>

              <div className="check-item verified">
                <CheckCircle2 size={16} className="text-green flex-shrink-0" />
                <div>
                  <b>Timeline relationships preserved</b>
                  <p>Chronological cause-and-effect strictly validated against UTC time stamps.</p>
                </div>
              </div>

              <div className="check-item verified">
                <CheckCircle2 size={16} className="text-green flex-shrink-0" />
                <div>
                  <b>Contradictory evidence considered</b>
                  <p>Mitigating factors and negative badge logs remain permanently visible.</p>
                </div>
              </div>

              <div className="check-item verified">
                <CheckCircle2 size={16} className="text-green flex-shrink-0" />
                <div>
                  <b>Alternative explanations retained</b>
                  <p>Token replay and spoofing evaluated alongside direct insider culpability.</p>
                </div>
              </div>

              <div className="check-item verified">
                <CheckCircle2 size={16} className="text-green flex-shrink-0" />
                <div>
                  <b>Uncertainty communicated</b>
                  <p>Probabilistic bounds explicitly separated from confirmed factual records.</p>
                </div>
              </div>
            </div>

            <div className="model-parameters-box font-mono text-xs">
              <div className="param-row">
                <span>TEMPERATURE</span>
                <span className="text-cyan">0.0 (DETERMINISTIC)</span>
              </div>
              <div className="param-row">
                <span>HALLUCINATION FILTER</span>
                <span className="text-green">STRICT ADMISSIBILITY</span>
              </div>
              <div className="param-row">
                <span>ACTIVE MODEL</span>
                <span className="text-purple">GEMINI-FORENSIC-V2</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
