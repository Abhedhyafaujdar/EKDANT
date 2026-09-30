import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from "d3-force";
import { Maximize2, Minus, Plus, RotateCcw, Search, X, ShieldAlert, ArrowRight, Layers, ExternalLink } from "lucide-react";
import type { CaseAnalysisEntity, CaseAnalysisRelationship } from "../data";
import "./Graph.css";

export type NodeType = "Suspect" | "User" | "Device" | "File" | "Server" | "ExternalIP" | "Other";
export type Relationship = "authenticates" | "accesses" | "exfiltrates" | "hosts" | "calls" | "defines";

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  role: string;
  department?: string;
  workstation?: string;
  privileges?: string;
  riskScore: number;
  threat: "Low" | "Guarded" | "Suspicious" | "High" | "Critical";
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  radius: number;
  degree: number;
  cluster: number;
  isKeyEntity?: boolean;
}

export interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  type: Relationship;
  phase: number;
  curveOffset: number;
}

type Camera = { x: number; y: number; scale: number; rotation: number };
type Network = { nodes: GraphNode[]; edges: GraphEdge[]; adjacent: Map<string, Set<string>> };

export const palette: Record<NodeType, string> = {
  Suspect: "#FF315B",    // Primary Red - Visually dominant
  User: "#168CFF",       // Blue
  Device: "#16D6A3",     // Green / Cyan
  File: "#FFB82E",       // Yellow
  Server: "#9B5CFF",     // Purple
  ExternalIP: "#FF4FA3", // Pink / Red
  Other: "#64748B"       // Gray
};

export const edgePalette: Record<Relationship, string> = {
  exfiltrates: "#FF315B",
  accesses: "#FFB82E",
  authenticates: "#00D9FF",
  hosts: "#9B5CFF",
  calls: "#168CFF",
  defines: "#16D6A3"
};

const virtualWidth = 1400;
const virtualHeight = 850;
const initialCamera: Camera = { x: 0, y: 0, scale: 1, rotation: 0 };

function createNetwork(caseNodes?: CaseAnalysisEntity[], caseEdges?: CaseAnalysisRelationship[]): Network {
  if (caseNodes && caseEdges) {
    const nodes: GraphNode[] = caseNodes.map((entity, index) => {
      const type: NodeType = entity.type === "PERSON"
        ? entity.is_suspicious ? "Suspect" : "User"
        : entity.type === "DEVICE" ? "Device"
        : entity.type === "FILE" ? "File"
        : entity.type === "IP" ? "ExternalIP"
        : "Other";

      return {
        id: entity.id,
        label: entity.label,
        type,
        role: entity.type,
        riskScore: entity.is_suspicious ? 90 : 20,
        threat: entity.is_suspicious ? "Critical" : "Low",
        radius: entity.is_suspicious ? 28 : 20,
        degree: 0,
        cluster: index % 8
      };
    });
    const nodesById = new Map(nodes.map((node) => [node.id, node]));
    const relationshipType = (action: string): Relationship => {
      const normalized = action.toLowerCase();
      if (normalized.includes("auth")) return "authenticates";
      if (normalized.includes("access") || normalized.includes("read")) return "accesses";
      if (normalized.includes("exfil") || normalized.includes("transfer")) return "exfiltrates";
      if (normalized.includes("host")) return "hosts";
      if (normalized.includes("defin") || normalized.includes("assign")) return "defines";
      return "calls";
    };
    const edges: GraphEdge[] = caseEdges.flatMap((edge, index) => {
      if (!nodesById.has(edge.source_id) || !nodesById.has(edge.target_id)) return [];
      const source = nodesById.get(edge.source_id)!;
      const target = nodesById.get(edge.target_id)!;
      source.degree++;
      target.degree++;
      return [{
        source: edge.source_id,
        target: edge.target_id,
        type: relationshipType(edge.action),
        phase: (index % 10) / 10,
        curveOffset: (index % 5 - 2) * 8
      }];
    });
    const adjacent = new Map(nodes.map((node) => [node.id, new Set<string>()]));
    for (const edge of edges) {
      const sourceId = typeof edge.source === "string" ? edge.source : edge.source.id;
      const targetId = typeof edge.target === "string" ? edge.target : edge.target.id;
      adjacent.get(sourceId)?.add(targetId);
      adjacent.get(targetId)?.add(sourceId);
    }
    return { nodes, edges, adjacent };
  }

  let randomState = 54321;
  const random = () => {
    randomState = (randomState * 16807) % 2147483647;
    return (randomState - 1) / 2147483646;
  };

  const nodes: GraphNode[] = [
    // PRIMARY INVESTIGATION ENTITIES (Visually dominant)
    {
      id: "rohit",
      label: "Rohit",
      type: "Suspect",
      role: "Security Engineer",
      department: "Security Operations",
      workstation: "SEC-02",
      privileges: "Elevated / Root Admin",
      riskScore: 85,
      threat: "Critical",
      radius: 36,
      degree: 0,
      cluster: 0,
      isKeyEntity: true,
      x: virtualWidth * 0.48,
      y: virtualHeight * 0.44
    },
    {
      id: "server-04",
      label: "Server-04",
      type: "Server",
      role: "Helios Application Server",
      department: "Infrastructure",
      workstation: "Rack-B14",
      privileges: "Production Vault",
      riskScore: 78,
      threat: "High",
      radius: 30,
      degree: 0,
      cluster: 1,
      isKeyEntity: true,
      x: virtualWidth * 0.62,
      y: virtualHeight * 0.48
    },
    {
      id: "file-orion",
      label: "PROJECT_ORION_INTERNAL_SPEC.pdf",
      type: "File",
      role: "Confidential Defense Spec",
      department: "R&D Defense",
      workstation: "Server-04 Vault",
      privileges: "Level 4 Classified",
      riskScore: 95,
      threat: "Critical",
      radius: 28,
      degree: 0,
      cluster: 2,
      isKeyEntity: true,
      x: virtualWidth * 0.54,
      y: virtualHeight * 0.65
    },
    {
      id: "ip-exfil",
      label: "203.0.113.88",
      type: "ExternalIP",
      role: "External Exfiltration Node",
      department: "Offshore AS4134",
      workstation: "External",
      privileges: "Encrypted Port 4433",
      riskScore: 98,
      threat: "Critical",
      radius: 30,
      degree: 0,
      cluster: 3,
      isKeyEntity: true,
      x: virtualWidth * 0.72,
      y: virtualHeight * 0.68
    },
    {
      id: "unknown-device",
      label: "Unknown Device",
      type: "Device",
      role: "Rogue MAC D4:F5:47:9A:11:02",
      department: "Unverified VLAN-04",
      workstation: "Rogue Hardware",
      privileges: "Spoofed TGT Session",
      riskScore: 92,
      threat: "Critical",
      radius: 26,
      degree: 0,
      cluster: 4,
      isKeyEntity: true,
      x: virtualWidth * 0.38,
      y: virtualHeight * 0.55
    },
    {
      id: "sec-02",
      label: "Workstation SEC-02",
      type: "Device",
      role: "Authorized Desk Hardware",
      department: "Floor 3 Desk 12",
      workstation: "SEC-02",
      privileges: "Locked during breach",
      riskScore: 24,
      threat: "Guarded",
      radius: 22,
      degree: 0,
      cluster: 5,
      isKeyEntity: true,
      x: virtualWidth * 0.34,
      y: virtualHeight * 0.32
    },
    {
      id: "neha",
      label: "Neha",
      type: "User",
      role: "Project Manager",
      department: "Product / R&D",
      workstation: "PM-01",
      privileges: "Standard User",
      riskScore: 42,
      threat: "Suspicious",
      radius: 22,
      degree: 0,
      cluster: 6,
      isKeyEntity: true,
      x: virtualWidth * 0.65,
      y: virtualHeight * 0.28
    },
    {
      id: "aman",
      label: "Aman",
      type: "User",
      role: "Software Developer",
      department: "Platform Engineering",
      workstation: "DEV-04",
      privileges: "Developer / CI",
      riskScore: 18,
      threat: "Low",
      radius: 20,
      degree: 0,
      cluster: 7,
      isKeyEntity: true,
      x: virtualWidth * 0.24,
      y: virtualHeight * 0.48
    }
  ];

  // Secondary sub-network dots to provide rich technical density (Section 8 & 9)
  const secondaryCounts: Record<NodeType, number> = {
    Suspect: 0,
    User: 28,
    Device: 32,
    File: 24,
    Server: 22,
    ExternalIP: 16,
    Other: 40
  };

  const prefixes: Record<NodeType, string[]> = {
    Suspect: [],
    User: ["analyst", "operator", "admin", "service-act", "auditor", "contractor"],
    Device: ["vlan-gw", "switch", "router", "endpoint", "badge-reader", "camera-sr2"],
    File: ["syslog.gz", "kerberos.keytab", "audit.db", "pcap.dump", "credentials.bak"],
    Server: ["dns-auth", "kerberos-dc", "vpn-gw01", "vault-replica", "backup-srv"],
    ExternalIP: ["cdn-proxy", "vpn-exit", "tor-hop", "c2-relay", "satellite-uplink"],
    Other: ["packet", "session-token", "socket", "inode", "flow-id", "sig-hash"]
  };

  (Object.keys(secondaryCounts) as NodeType[]).forEach((type) => {
    const count = secondaryCounts[type];
    const prefixList = prefixes[type];
    for (let i = 0; i < count; i++) {
      const p = prefixList[i % prefixList.length];
      const suffix = String(i + 1).padStart(3, "0");
      const radius = 6 + Math.floor(random() * 6); // small dots 6-12px
      nodes.push({
        id: `${type.toLowerCase()}-${suffix}`,
        label: `${p}.${suffix}`,
        type,
        role: `Forensic telemetry entity (${type})`,
        department: "Enterprise Network",
        privileges: "Standard telemetry",
        riskScore: Math.floor(random() * 40) + 10,
        threat: "Low",
        radius,
        degree: 0,
        cluster: Math.floor(random() * 8),
        x: random() * virtualWidth,
        y: random() * virtualHeight
      });
    }
  });

  const nodesById = new Map(nodes.map((n) => [n.id, n]));
  const links: GraphEdge[] = [];
  const edgeKeys = new Set<string>();

  const addEdge = (sourceId: string, targetId: string, type: Relationship) => {
    if (sourceId === targetId) return false;
    const key = `${sourceId}>${targetId}`;
    if (edgeKeys.has(key)) return false;
    edgeKeys.add(key);
    links.push({
      source: sourceId,
      target: targetId,
      type,
      phase: random(),
      curveOffset: (random() - 0.5) * 40
    });
    const s = nodesById.get(sourceId);
    const t = nodesById.get(targetId);
    if (s) s.degree++;
    if (t) t.degree++;
    return true;
  };

  // Critical Case Connections (Core Attack Chain)
  addEdge("rohit", "unknown-device", "authenticates");
  addEdge("unknown-device", "server-04", "authenticates");
  addEdge("rohit", "server-04", "accesses");
  addEdge("server-04", "file-orion", "hosts");
  addEdge("rohit", "file-orion", "accesses");
  addEdge("unknown-device", "file-orion", "accesses");
  addEdge("server-04", "ip-exfil", "exfiltrates");
  addEdge("file-orion", "ip-exfil", "exfiltrates");
  addEdge("rohit", "sec-02", "defines");
  addEdge("neha", "file-orion", "accesses");
  addEdge("neha", "server-04", "calls");
  addEdge("aman", "server-04", "calls");

  // Connect background telemetry nodes to clusters
  for (let i = 8; i < nodes.length; i++) {
    const node = nodes[i];
    const clusterPeers = nodes.filter((n) => n.cluster === node.cluster && n.id !== node.id);
    if (clusterPeers.length > 0) {
      const peer = clusterPeers[Math.floor(random() * clusterPeers.length)];
      addEdge(node.id, peer.id, "calls");
    }
    if (random() > 0.4 && nodes[node.cluster]) {
      addEdge(node.id, nodes[node.cluster].id, "defines");
    }
  }

  // Cross-network connections to reach approximately 320 dense relations
  while (links.length < 320) {
    const s = nodes[Math.floor(random() * nodes.length)];
    const t = nodes[Math.floor(random() * nodes.length)];
    addEdge(s.id, t.id, "calls");
  }

  const adjacent = new Map(nodes.map((node) => [node.id, new Set<string>()]));
  for (const edge of links) {
    const sId = typeof edge.source === "string" ? edge.source : edge.source.id;
    const tId = typeof edge.target === "string" ? edge.target : edge.target.id;
    adjacent.get(sId)?.add(tId);
    adjacent.get(tId)?.add(sId);
  }

  return { nodes, edges: links, adjacent };
}

function getEndpoint(endpoint: string | GraphNode, nodesById: Map<string, GraphNode>): GraphNode {
  return typeof endpoint === "string" ? nodesById.get(endpoint)! : endpoint;
}

function bezierEase(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface GraphProps {
  embedded?: boolean;
  onSelectEntity?: (entityId: string) => void;
  caseNodes?: CaseAnalysisEntity[];
  caseEdges?: CaseAnalysisRelationship[];
}

export function Graph({ embedded = false, onSelectEntity, caseNodes, caseEdges }: GraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<Camera>({ ...initialCamera });
  const targetCameraRef = useRef<Camera>({ ...initialCamera });
  const transitionRef = useRef<{ from: Camera; to: Camera; start: number | null; duration: number } | null>(null);
  const selectedRef = useRef<GraphNode | null>(null);

  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "evidence" | "relationships">("overview");
  const [query, setQuery] = useState("");

  const network = useMemo(() => createNetwork(caseNodes, caseEdges), [caseNodes, caseEdges]);
  const nodesById = useMemo(() => new Map(network.nodes.map((node) => [node.id, node])), [network]);

  const moveCamera = useCallback((target: Camera, duration = 500) => {
    transitionRef.current = {
      from: { ...cameraRef.current },
      to: target,
      start: null,
      duration
    };
    targetCameraRef.current = target;
  }, []);

  const focusNode = useCallback(
    (node: GraphNode, canvas: HTMLCanvasElement) => {
      selectedRef.current = node;
      setSelected(node);
      if (onSelectEntity) onSelectEntity(node.id);

      const bounds = canvas.getBoundingClientRect();
      const fit = Math.min(bounds.width / virtualWidth, bounds.height / virtualHeight);
      const scale = 1.85;
      const rotation = (3 * Math.PI) / 180;
      const targetX = bounds.width * 0.22 - bounds.width / 2;
      const targetY = -bounds.height * 0.16;

      const offsetX = node.x! - virtualWidth / 2;
      const offsetY = node.y! - virtualHeight / 2;
      const rotatedX = Math.cos(rotation) * offsetX - Math.sin(rotation) * offsetY;
      const rotatedY = Math.sin(rotation) * offsetX + Math.cos(rotation) * offsetY;

      moveCamera(
        {
          x: targetX - scale * fit * rotatedX,
          y: targetY - scale * fit * rotatedY,
          scale,
          rotation
        },
        550
      );
    },
    [moveCamera, onSelectEntity]
  );

  const resetGraph = useCallback(() => {
    selectedRef.current = null;
    setSelected(null);
    moveCamera({ ...initialCamera }, 450);
  }, [moveCamera]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const initialFit = Math.min(stage.clientWidth / virtualWidth, stage.clientHeight / virtualHeight) || 1;

    const sim = forceSimulation<GraphNode>(network.nodes)
      .force(
        "link",
        forceLink<GraphNode, GraphEdge>(network.edges)
          .id((node) => node.id)
          .distance((edge) => (edge.type === "exfiltrates" ? 140 : edge.type === "accesses" ? 110 : 85))
          .strength(0.24)
      )
      .force("charge", forceManyBody<GraphNode>().strength(-70).distanceMax(360))
      .force("collide", forceCollide<GraphNode>().radius((node) => (node.radius + 12) / initialFit).iterations(2))
      .force("center", forceCenter<GraphNode>(virtualWidth / 2, virtualHeight / 2))
      .force("cluster-x", forceX<GraphNode>((node) => virtualWidth / 2 + Math.cos((node.cluster / 8) * Math.PI * 2) * 320).strength(0.08))
      .force("cluster-y", forceY<GraphNode>((node) => virtualHeight / 2 + Math.sin((node.cluster / 8) * Math.PI * 2) * 240).strength(0.08))
      .stop();

    for (let i = 0; i < 220; i++) sim.tick();

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    resize();

    let animationFrame: number;

    const draw = (time: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const transition = transitionRef.current;
      if (transition) {
        if (transition.start === null) transition.start = time;
        const progress = Math.min(1, (time - transition.start) / transition.duration);
        const eased = bezierEase(progress);
        cameraRef.current = {
          x: transition.from.x + (transition.to.x - transition.from.x) * eased,
          y: transition.from.y + (transition.to.y - transition.from.y) * eased,
          scale: transition.from.scale + (transition.to.scale - transition.from.scale) * eased,
          rotation: transition.from.rotation + (transition.to.rotation - transition.from.rotation) * eased
        };
        if (progress === 1) transitionRef.current = null;
      }

      const camera = cameraRef.current;
      const fit = Math.min(width / virtualWidth, height / virtualHeight);
      const centerX = width / 2;
      const centerY = height / 2;
      const selectedNode = selectedRef.current;
      const adjacent = selectedNode ? network.adjacent.get(selectedNode.id)! : null;
      const screenScale = fit * camera.scale;

      context.save();
      context.translate(centerX + camera.x, centerY + camera.y);
      context.rotate(camera.rotation);
      context.scale(fit * camera.scale, fit * camera.scale);
      context.translate(-virtualWidth / 2, -virtualHeight / 2);

      // 1. DRAW EDGES
      for (let i = 0; i < network.edges.length; i++) {
        const edge = network.edges[i];
        const source = getEndpoint(edge.source, nodesById);
        const target = getEndpoint(edge.target, nodesById);

        const dx = target.x! - source.x!;
        const dy = target.y! - source.y!;
        const dist = Math.hypot(dx, dy) || 1;
        const ux = dx / dist;
        const uy = dy / dist;

        const sourceRadius = (source.radius / fit) * (source === selectedNode ? 1.4 : 1);
        const targetRadius = (target.radius / fit) * (target === selectedNode ? 1.4 : 1);

        const startX = source.x! + ux * sourceRadius;
        const startY = source.y! + uy * sourceRadius;
        const endX = target.x! - ux * targetRadius;
        const endY = target.y! - uy * targetRadius;

        const emphasized = source === selectedNode || target === selectedNode;
        const isRelated = !selectedNode || emphasized;

        const midX = (startX + endX) / 2 - uy * edge.curveOffset;
        const midY = (startY + endY) / 2 + ux * edge.curveOffset;

        context.globalAlpha = selectedNode && !isRelated ? 0.08 : emphasized ? 0.95 : 0.45;
        context.strokeStyle = edgePalette[edge.type] || "#00D9FF";
        context.lineWidth = (emphasized ? 2.8 : 1.25) / screenScale;
        context.beginPath();
        context.moveTo(startX, startY);
        context.quadraticCurveTo(midX, midY, endX, endY);
        context.stroke();

        // Moving glowing data particles along connection paths
        if (i % 2 === 0 || emphasized) {
          const tPos = (time * 0.00075 + edge.phase) % 1;
          const p1x = (1 - tPos) * startX + tPos * midX;
          const p1y = (1 - tPos) * startY + tPos * midY;
          const p2x = (1 - tPos) * midX + tPos * endX;
          const p2y = (1 - tPos) * midY + tPos * endY;
          const px = (1 - tPos) * p1x + tPos * p2x;
          const py = (1 - tPos) * p1y + tPos * p2y;

          context.globalAlpha = selectedNode && !isRelated ? 0.08 : emphasized ? 1 : 0.85;
          context.fillStyle = "#EAF6FF";
          context.shadowColor = edgePalette[edge.type] || "#00D9FF";
          context.shadowBlur = (emphasized ? 16 : 8) / screenScale;
          context.beginPath();
          context.arc(px, py, (emphasized ? 2.8 : 1.9) / screenScale, 0, Math.PI * 2);
          context.fill();
          context.shadowBlur = 0;
        }
      }

      // 2. DRAW NODES
      context.textBaseline = "middle";
      for (const node of network.nodes) {
        const active = !selectedNode || node === selectedNode || adjacent!.has(node.id);
        const isSelected = node === selectedNode;
        const radius = (node.radius / fit) * (isSelected ? 1.45 : 1);

        context.globalAlpha = selectedNode && !active ? 0.1 : 0.95;

        if (isSelected || node.type === "Suspect" || node.isKeyEntity) {
          const glowMultiplier = isSelected ? 4.2 : node.type === "Suspect" ? 3.0 : 2.0;
          const grad = context.createRadialGradient(node.x!, node.y!, radius * 0.5, node.x!, node.y!, radius * glowMultiplier);
          const colorHex = palette[node.type];
          grad.addColorStop(0, `${colorHex}99`);
          grad.addColorStop(0.5, `${colorHex}33`);
          grad.addColorStop(1, `${colorHex}00`);
          context.fillStyle = grad;
          context.beginPath();
          context.arc(node.x!, node.y!, radius * glowMultiplier, 0, Math.PI * 2);
          context.fill();
        }

        context.fillStyle = palette[node.type];
        context.beginPath();
        context.arc(node.x!, node.y!, radius, 0, Math.PI * 2);
        context.fill();

        if (node.isKeyEntity || isSelected) {
          context.font = `bold ${Math.max(10, Math.round(12 / screenScale))}px Inter, sans-serif`;
          context.fillStyle = isSelected ? "#00D9FF" : "#EAF6FF";
          context.textAlign = "center";
          context.fillText(node.label, node.x!, node.y! + radius + 12 / screenScale);
        }
      }

      context.restore();
      animationFrame = requestAnimationFrame(draw);
    };

    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [network, nodesById, focusNode]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const fit = Math.min(width / virtualWidth, height / virtualHeight);
    const camera = cameraRef.current;

    const centerX = width / 2;
    const centerY = height / 2;
    const transX = mouseX - (centerX + camera.x);
    const transY = mouseY - (centerY + camera.y);

    const cosR = Math.cos(-camera.rotation);
    const sinR = Math.sin(-camera.rotation);
    const rotX = cosR * transX - sinR * transY;
    const rotY = sinR * transX + cosR * transY;

    const virtX = rotX / (fit * camera.scale) + virtualWidth / 2;
    const virtY = rotY / (fit * camera.scale) + virtualHeight / 2;

    let clickedNode: GraphNode | null = null;
    for (const node of network.nodes) {
      const d = Math.hypot(node.x! - virtX, node.y! - virtY);
      if (d <= node.radius + 10) {
        clickedNode = node;
        break;
      }
    }

    if (clickedNode) {
      focusNode(clickedNode, canvas);
    } else {
      resetGraph();
    }
  };

  const filteredNodes = useMemo(() => {
    if (!query) return [];
    return network.nodes.filter((n) => n.label.toLowerCase().includes(query.toLowerCase()));
  }, [network.nodes, query]);

  const connectedList = useMemo(() => {
    if (!selected) return [];
    const adj = network.adjacent.get(selected.id) || new Set();
    return Array.from(adj)
      .map((id) => nodesById.get(id)!)
      .filter(Boolean);
  }, [selected, network.adjacent, nodesById]);

  return (
    <section className={`graph-section ${embedded ? "embedded" : ""}`}>
      {!embedded && (
        <div className="graph-head">
          <div className="graph-title-block">
            <span className="technical-kicker">RELATIONAL TOPOLOGY WORKBENCH</span>
            <h2>Forensic Network Topology</h2>
            <p>Interactive interconnected entity graph (400 nodes &bull; 1,000 relationships)</p>
          </div>

          <div className="graph-head-right">
            <div className="graph-legend">
              <span className="legend-chip"><i style={{ background: palette.Suspect }} /> Suspect</span>
              <span className="legend-chip"><i style={{ background: palette.Server }} /> Server</span>
              <span className="legend-chip"><i style={{ background: palette.File }} /> File</span>
              <span className="legend-chip"><i style={{ background: palette.ExternalIP }} /> Exfil IP</span>
              <span className="legend-chip"><i style={{ background: palette.Device }} /> Device</span>
              <span className="legend-chip"><i style={{ background: palette.User }} /> User</span>
            </div>

            <div className="mini-search">
              <Search size={14} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find node..."
              />
              {query && <button onClick={() => setQuery("")}>&times;</button>}
            </div>
          </div>
        </div>
      )}

      <div className="graph-stage" ref={stageRef}>
        <canvas
          ref={canvasRef}
          className="network-canvas"
          onPointerDown={handlePointerDown}
        />

        <div className="graph-controls">
          <button
            onClick={() => {
              const c = cameraRef.current;
              moveCamera({ ...c, scale: Math.min(3, c.scale + 0.3) }, 250);
            }}
            title="Zoom In"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => {
              const c = cameraRef.current;
              moveCamera({ ...c, scale: Math.max(0.5, c.scale - 0.3) }, 250);
            }}
            title="Zoom Out"
          >
            <Minus size={16} />
          </button>
          <button onClick={resetGraph} title="Reset Camera">
            <RotateCcw size={14} />
          </button>
        </div>

        {query && filteredNodes.length > 0 && (
          <div className="graph-search-popover">
            {filteredNodes.slice(0, 6).map((node) => (
              <button
                key={node.id}
                className="search-item"
                onClick={() => {
                  const canvas = canvasRef.current;
                  if (canvas) focusNode(node, canvas);
                  setQuery("");
                }}
              >
                <span className="dot" style={{ background: palette[node.type] }} />
                <div className="search-meta">
                  <b>{node.label}</b>
                  <small>{node.type}</small>
                </div>
              </button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selected && (
            <motion.aside
              className="entity-details-panel"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.25 }}
            >
              <div className="entity-panel-header">
                <div>
                  <span className="entity-kicker">ENTITY DOSSIER</span>
                  <div className="entity-title-row">
                    <span
                      className="entity-status-dot"
                      style={{ background: palette[selected.type] }}
                    />
                    <h3>{selected.label}</h3>
                  </div>
                  <span className="entity-role">{selected.role}</span>
                </div>

                <button className="entity-close-btn" onClick={() => setSelected(null)}>
                  <X size={16} />
                </button>
              </div>

              <div className="entity-badge-row">
                <span
                  className={`status-badge ${
                    selected.threat === "Critical"
                      ? "critical"
                      : selected.threat === "High"
                      ? "high"
                      : selected.threat === "Suspicious"
                      ? "suspicious"
                      : "guarded"
                  }`}
                >
                  {selected.threat.toUpperCase()} THREAT
                </span>
                <span className="font-mono text-cyan text-xs">
                  ID: #{selected.id.toUpperCase()}
                </span>
              </div>

              <div className="risk-meter-box">
                <div className="risk-meter-header">
                  <span>Risk Score</span>
                  <b className="font-mono">{selected.riskScore}/100</b>
                </div>
                <div className="risk-meter-bar">
                  <div
                    className="risk-meter-fill"
                    style={{
                      width: `${selected.riskScore}%`,
                      background: selected.riskScore > 75 ? "#FF315B" : "#00D9FF"
                    }}
                  />
                </div>
              </div>

              <div className="entity-tabs">
                <button
                  className={activeTab === "overview" ? "active" : ""}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                  className={activeTab === "evidence" ? "active" : ""}
                  onClick={() => setActiveTab("evidence")}
                >
                  Evidence ({selected.degree > 4 ? 8 : 3})
                </button>
                <button
                  className={activeTab === "relationships" ? "active" : ""}
                  onClick={() => setActiveTab("relationships")}
                >
                  Relationships ({connectedList.length})
                </button>
              </div>

              {activeTab === "overview" && (
                <div className="entity-tab-body">
                  <div className="meta-grid">
                    <div className="meta-item">
                      <span className="meta-label">Entity Type</span>
                      <b className="meta-val font-mono">{selected.type}</b>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Department</span>
                      <b className="meta-val">{selected.department || "Security"}</b>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Workstation</span>
                      <b className="meta-val font-mono">{selected.workstation || "SEC-02"}</b>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Privileges</span>
                      <b className="meta-val text-cyan">{selected.privileges || "Elevated"}</b>
                    </div>
                  </div>

                  <div className="connected-entities-section">
                    <h4>CONNECTED ENTITIES</h4>
                    <ul className="connected-list">
                      {connectedList.slice(0, 5).map((peer) => (
                        <li
                          key={peer.id}
                          onClick={() => {
                            const canvas = canvasRef.current;
                            if (canvas) focusNode(peer, canvas);
                          }}
                        >
                          <span className="peer-type-dot" style={{ background: palette[peer.type] }} />
                          <div className="peer-info">
                            <b>{peer.label}</b>
                            <small>{peer.role}</small>
                          </div>
                          <ArrowRight size={13} className="peer-arrow" />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="view-all-rel-btn">
                    <span>VIEW ALL RELATIONSHIPS</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              )}

              {activeTab === "evidence" && (
                <div className="entity-tab-body">
                  <div className="evidence-mini-list">
                    <div className="evidence-mini-item">
                      <span className="font-mono text-cyan text-xs">E-028 &bull; 11:47 PM</span>
                      <p>Credentials authenticated from unauthorized MAC address</p>
                    </div>
                    <div className="evidence-mini-item">
                      <span className="font-mono text-cyan text-xs">E-033 &bull; 11:47 PM</span>
                      <p>Active read handle on PROJECT_ORION_INTERNAL_SPEC.pdf</p>
                    </div>
                    <div className="evidence-mini-item">
                      <span className="font-mono text-cyan text-xs">E-034 &bull; 11:49 PM</span>
                      <p>Associated session routed 800 MB stream to external destination</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "relationships" && (
                <div className="entity-tab-body">
                  <ul className="connected-list full">
                    {connectedList.map((peer) => (
                      <li
                        key={peer.id}
                        onClick={() => {
                          const canvas = canvasRef.current;
                          if (canvas) focusNode(peer, canvas);
                        }}
                      >
                        <span className="peer-type-dot" style={{ background: palette[peer.type] }} />
                        <div className="peer-info">
                          <b>{peer.label}</b>
                          <small>{peer.role} &bull; Risk {peer.riskScore}%</small>
                        </div>
                        <span className="text-cyan font-mono text-xs">{peer.type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="graph-footer-strip">
          <span className="node-stat-pill font-mono">
            400 NODES &bull; 1,000 RELATIONSHIPS
          </span>
          <span className="footer-dot-sep">&bull;</span>
          <span className="matrix-label">
            LIVE RELATION MATRIX &bull; INTERACTIVE GRAPH
          </span>
        </div>
      </div>
    </section>
  );
}
