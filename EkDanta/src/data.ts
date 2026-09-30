export type Page =
  | "home"
  | "new"
  | "dashboard"
  | "timeline"
  | "evidence"
  | "entities"
  | "graph"
  | "poi"
  | "ai"
  | "report"
  | "settings";

export type EntityType = "person" | "user" | "device" | "server" | "file" | "ip" | "account" | "other";

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  role?: string;
  department?: string;
  workstation?: string;
  privileges?: string;
  riskScore: number;
  riskCategory: "Low" | "Guarded" | "Suspicious" | "High Risk" | "Critical";
  evidenceCount: number;
  relationshipsCount: number;
  lastSeen: string;
  ip?: string;
  hash?: string;
  metadata: Record<string, string>;
  connectedEntities?: { id: string; name: string; type: EntityType; role: string }[];
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type: "calls" | "imports" | "extends" | "defines" | "authenticates" | "exfiltrates" | "accesses" | "hosts";
  timestamp?: string;
  confidence?: number;
}

export interface EvidenceItem {
  id: string;
  time: string;
  type: "Login" | "File" | "Network" | "Physical" | "Credential" | "Privilege";
  desc: string;
  entities: string;
  source: string;
  classification: "Normal" | "Suspicious" | "Anomalous" | "Potential Attack" | "Critical";
  confidence: number;
  hash?: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  desc: string;
  entity: string;
  source: string;
  classification: "Normal" | "Suspicious" | "File Access" | "Potential Attack" | "Anomalous";
  confidence: number;
  type: "login" | "physical" | "file" | "network" | "session";
}

export interface PersonOfInterest {
  id: string;
  name: string;
  role: string;
  department: string;
  workstation: string;
  riskIndicator: number;
  connectedEvidence: number;
  relationships: number;
  contradictoryEvidence: string;
  lastActivity: string;
  suspicionStatus: "Primary Investigative Lead" | "Person of Interest" | "Witness / Normal";
  notes: string;
}

export interface InvestigationCase {
  id: string;
  code: string;
  title: string;
  status: "INVESTIGATING" | "CLOSED" | "ESCALATED";
  classification: "CONFIDENTIAL // LAW ENFORCEMENT ONLY";
  incidentWindow: string;
  summary: string;
  affectedAsset: string;
  exfiltratedData: string;
  suspectAccount: string;
  riskLevel: "HIGH RISK" | "CRITICAL";
  metrics: {
    evidenceItems: number;
    entitiesIdentified: number;
    relationshipsMapped: number;
    personsOfInterest: number;
    exfiltrationVolume: string;
    targetDestination: string;
  };
}

export interface CaseAnalysisEntity {
  id: string;
  type: "PERSON" | "DEVICE" | "FILE" | "IP" | "CREDENTIAL";
  label: string;
  is_suspicious: boolean;
}

export interface CaseAnalysisRelationship {
  source_id: string;
  target_id: string;
  action: string;
  timestamp: string;
  evidence_text: string;
}

export interface CaseAnalysisTimelineEvent {
  time: string;
  description: string;
  classification: "NORMAL" | "ANOMALOUS" | "CRITICAL";
  related_entities: string[];
}

export interface CaseAnalysisReport {
  target_asset: string;
  primary_lead: string;
  evidence_chain: string[];
  disclaimer: string;
}

export interface CaseAnalysisResponse {
  nodes: CaseAnalysisEntity[];
  edges: CaseAnalysisRelationship[];
  timeline: CaseAnalysisTimelineEvent[];
  report: CaseAnalysisReport;
}

export const activeCase: InvestigationCase = {
  id: "case-001",
  code: "CASE-001",
  title: "The Midnight Leak",
  status: "INVESTIGATING",
  classification: "CONFIDENTIAL // LAW ENFORCEMENT ONLY",
  incidentWindow: "Jan 14, 2024 · 11:42 PM – 11:52 PM UTC",
  summary: "Confidential R&D document PROJECT_ORION_INTERNAL_SPEC.pdf accessed via privileged credentials from an unknown MAC address, followed by high-speed 800 MB transfer to an uncatalogued offshore IP address.",
  affectedAsset: "Server-04 (Helios Application Server)",
  exfiltratedData: "800 MB (PROJECT_ORION_INTERNAL_SPEC.pdf + related archives)",
  suspectAccount: "Rohit (Security Engineer, SEC-02 credentials)",
  riskLevel: "HIGH RISK",
  metrics: {
    evidenceItems: 47,
    entitiesIdentified: 12,
    relationshipsMapped: 8,
    personsOfInterest: 3,
    exfiltrationVolume: "800 MB",
    targetDestination: "203.0.113.88 (Offshore Autonomous System)"
  }
};

export const people: PersonOfInterest[] = [
  {
    id: "rohit",
    name: "Rohit",
    role: "Security Engineer",
    department: "SecOps / Identity",
    workstation: "SEC-02",
    riskIndicator: 85,
    connectedEvidence: 8,
    relationships: 12,
    contradictoryEvidence: "Physical badge records show badge out at 18:30; server room access badge used at 23:45 was cloned or unverified.",
    lastActivity: "Jan 14, 11:47 PM via Unknown Device",
    suspicionStatus: "Primary Investigative Lead",
    notes: "Credentials were used during incident window; however origin MAC address does not match workstation SEC-02."
  },
  {
    id: "aman",
    name: "Aman",
    role: "Software Developer",
    department: "Platform Engineering",
    workstation: "DEV-04",
    riskIndicator: 18,
    connectedEvidence: 2,
    relationships: 4,
    contradictoryEvidence: "Routine code deployment logs timestamped 22:15 correlate with scheduled sprint release.",
    lastActivity: "Jan 14, 10:20 PM via DEV-04",
    suspicionStatus: "Witness / Normal",
    notes: "No access to Server-04 secret vault detected; normal developer workstation baseline."
  },
  {
    id: "neha",
    name: "Neha",
    role: "Project Manager",
    department: "Product / R&D",
    workstation: "PM-01",
    riskIndicator: 42,
    connectedEvidence: 4,
    relationships: 6,
    contradictoryEvidence: "Legitimate file sharing permissions for PROJECT_ORION documentation for executive presentations.",
    lastActivity: "Jan 14, 05:15 PM via PM-01",
    suspicionStatus: "Person of Interest",
    notes: "Owner of document metadata; account password was reset 48 hours prior to the breach."
  }
];

export const entitiesList: Entity[] = [
  {
    id: "rohit",
    name: "Rohit",
    type: "person",
    role: "Security Engineer",
    department: "Security Operations",
    workstation: "SEC-02",
    privileges: "Elevated / Root Admin",
    riskScore: 85,
    riskCategory: "High Risk",
    evidenceCount: 8,
    relationshipsCount: 12,
    lastSeen: "Jan 14, 11:47 PM",
    metadata: {
      "Badge ID": "SEC-8819",
      "Account": "rohit.sec@corp.internal",
      "MFA Status": "Bypassed via Session Token",
      "Origin IP": "192.168.4.112 (Unknown Device)"
    },
    connectedEntities: [
      { id: "server", name: "Server-04", type: "server", role: "Helios Application Server" },
      { id: "file", name: "PROJECT_ORION_INTERNAL_SPEC.pdf", type: "file", role: "Confidential File" },
      { id: "ip", name: "203.0.113.88", type: "ip", role: "External Destination IP" },
      { id: "unknown", name: "Unknown Device", type: "device", role: "Device (Not SEC-02)" }
    ]
  },
  {
    id: "unknown",
    name: "Unknown Device",
    type: "device",
    role: "Rogue Endpoint (Not SEC-02)",
    riskScore: 92,
    riskCategory: "Critical",
    evidenceCount: 6,
    relationshipsCount: 4,
    lastSeen: "Jan 14, 11:52 PM",
    metadata: {
      "MAC Address": "D4:F5:47:9A:11:02",
      "DHCP Hostname": "DESKTOP-X992A",
      "Network Segment": "VLAN-04 (Engineering)",
      "OS Fingerprint": "Linux 6.5.0-x86_64"
    }
  },
  {
    id: "server",
    name: "Server-04",
    type: "server",
    role: "Helios Application Server",
    riskScore: 78,
    riskCategory: "Suspicious",
    evidenceCount: 14,
    relationshipsCount: 9,
    lastSeen: "Jan 14, 11:52 PM",
    metadata: {
      "Host": "helios-app-04.prod.corp",
      "IP Address": "10.0.4.14",
      "OS": "Ubuntu 22.04 LTS Hardened",
      "Database": "Vault Secret Store v4.2"
    }
  },
  {
    id: "file",
    name: "PROJECT_ORION_INTERNAL_SPEC.pdf",
    type: "file",
    role: "Confidential Defense Blueprint",
    riskScore: 95,
    riskCategory: "Critical",
    evidenceCount: 7,
    relationshipsCount: 5,
    lastSeen: "Jan 14, 11:47 PM",
    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    metadata: {
      "File Size": "84.2 MB",
      "Classification": "LEVEL 4 TOP SECRET",
      "Last Modified": "Jan 12, 2024",
      "Storage Location": "/var/data/vault/orion_spec.pdf"
    }
  },
  {
    id: "ip",
    name: "203.0.113.88",
    type: "ip",
    role: "External Exfiltration IP",
    riskScore: 98,
    riskCategory: "Critical",
    evidenceCount: 5,
    relationshipsCount: 3,
    lastSeen: "Jan 14, 11:49 PM",
    ip: "203.0.113.88",
    metadata: {
      "Autonomous System": "AS4134 Chinanet Backbone",
      "Geo Location": "Offshore Server Node",
      "Port": "4433 (Encrypted Tunnel)",
      "Payload": "800 MB Transfer"
    }
  },
  {
    id: "sec02",
    name: "SEC-02",
    type: "device",
    role: "Authorized Workstation",
    riskScore: 24,
    riskCategory: "Guarded",
    evidenceCount: 3,
    relationshipsCount: 2,
    lastSeen: "Jan 14, 06:30 PM",
    metadata: {
      "MAC Address": "00:1A:2B:3C:4D:5E",
      "Assigned User": "Rohit",
      "Status": "Locked / Idle during breach",
      "Physical Location": "Floor 3, Desk 12"
    }
  }
];

export const timeline: TimelineEvent[] = [
  {
    id: "t-1",
    time: "11:42 PM",
    title: "USER LOGIN",
    desc: "Rohit's credentials were used to authenticate to the core network.",
    entity: "Rohit",
    source: "ActiveDirectory / Kerberos Log #4624",
    classification: "Normal",
    confidence: 99.4,
    type: "login"
  },
  {
    id: "t-2",
    time: "11:45 PM",
    title: "PHYSICAL ACCESS",
    desc: "An unidentified individual entered Server Room B with an overridden badge pass.",
    entity: "Server Room B",
    source: "Lenel OnGuard Door Access #SR-02",
    classification: "Suspicious",
    confidence: 88.2,
    type: "physical"
  },
  {
    id: "t-3",
    time: "11:47 PM",
    title: "FILE ACCESS",
    desc: "PROJECT_ORION_INTERNAL_SPEC.pdf read handle opened by session UID 1004.",
    entity: "Server-04",
    source: "Linux Auditd Syscall #sys_openat",
    classification: "File Access",
    confidence: 97.8,
    type: "file"
  },
  {
    id: "t-4",
    time: "11:49 PM",
    title: "DATA TRANSFER",
    desc: "800 MB encrypted outbound stream established to external IP 203.0.113.88.",
    entity: "203.0.113.88",
    source: "Zeek Network Flow ID #conn_88192",
    classification: "Potential Attack",
    confidence: 99.1,
    type: "network"
  },
  {
    id: "t-5",
    time: "11:52 PM",
    title: "SESSION END",
    desc: "SSH tunnel abruptly severed; bash history scrub command detected.",
    entity: "Server-04",
    source: "OpenSSH Daemon #sshd-pid-4912",
    classification: "Anomalous",
    confidence: 94.6,
    type: "session"
  }
];

export const evidence: EvidenceItem[] = [
  {
    id: "E-034",
    time: "11:49 PM",
    type: "Network",
    desc: "800 MB exfiltrated via TLS 1.3 socket to remote external IP 203.0.113.88",
    entities: "Server-04, 203.0.113.88",
    source: "Core Gateway Palo Alto FW-01",
    classification: "Potential Attack",
    confidence: 99.2,
    hash: "6a8b7c2d1e0f349a..."
  },
  {
    id: "E-033",
    time: "11:47 PM",
    type: "File",
    desc: "Direct disk read on confidential spec PROJECT_ORION_INTERNAL_SPEC.pdf",
    entities: "Server-04, Rohit",
    source: "Ext4 Inode Auditing",
    classification: "Suspicious",
    confidence: 96.5,
    hash: "e3b0c44298fc1c14..."
  },
  {
    id: "E-028",
    time: "11:47 PM",
    type: "Credential",
    desc: "Session authenticated with Rohit's Kerberos TGT from unauthorized MAC D4:F5:47:9A:11:02",
    entities: "Rohit, Unknown Device",
    source: "CrowdStrike Falcon Sensor",
    classification: "Anomalous",
    confidence: 98.7,
    hash: "3c891a27de45ef..."
  },
  {
    id: "E-021",
    time: "11:45 PM",
    type: "Physical",
    desc: "Physical badge bypass recorded at Server Room Door 02 during incident window",
    entities: "Server Room B",
    source: "Honeywell CCTV / Lenel Access",
    classification: "Suspicious",
    confidence: 84.1,
    hash: "f41a87e23190ab..."
  },
  {
    id: "E-015",
    time: "11:42 PM",
    type: "Login",
    desc: "Initial VPN tunnel handshake accepted via external IP gateway",
    entities: "Rohit, Gateway-VPN",
    source: "Cisco AnyConnect ASA",
    classification: "Normal",
    confidence: 95.0,
    hash: "192847abfe34..."
  }
];

export const navItems = [
  ["home", "Home"],
  ["new", "New Case"],
  ["dashboard", "Dashboard"],
  ["timeline", "Timeline"],
  ["evidence", "Evidence"],
  ["entities", "Entities"],
  ["graph", "Graph"],
  ["poi", "Persons of Interest"],
  ["ai", "AI Analyst"],
  ["report", "Report"],
  ["settings", "Settings"]
] as const;
