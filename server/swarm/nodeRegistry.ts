/**
 * Hospital Node Registry
 * Tracks active hospital nodes in the Jarvis swarm
 */

import { SwarmBus } from "./swarmBus";

export interface HospitalNode {
  id: string;
  name: string;
  region: string;
  country: string;
  lat?: number;
  lng?: number;
  status: "online" | "offline" | "degraded";
  lastSeen: number;
  activeAgents: string[];
  capabilities: string[];
}

class NodeRegistry {
  private nodes = new Map<string, HospitalNode>();

  register(node: Omit<HospitalNode, "lastSeen" | "status">): HospitalNode {
    const full: HospitalNode = {
      ...node,
      status: "online",
      lastSeen: Date.now(),
    };
    this.nodes.set(node.id, full);
    SwarmBus.emit("node:registered", { nodeId: node.id, data: full });
    return full;
  }

  heartbeat(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.lastSeen = Date.now();
      node.status = "online";
      SwarmBus.emit("node:heartbeat", { nodeId });
    }
  }

  getNode(id: string): HospitalNode | undefined {
    return this.nodes.get(id);
  }

  getOnlineNodes(): HospitalNode[] {
    const cutoff = Date.now() - 60_000; // 60s timeout
    return Array.from(this.nodes.values()).filter(
      (n) => n.lastSeen > cutoff
    );
  }

  getAllNodes(): HospitalNode[] {
    return Array.from(this.nodes.values());
  }

  markOffline(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) node.status = "offline";
  }
}

export const nodeRegistry = new NodeRegistry();

// Seed with demo Kenyan hospital nodes
nodeRegistry.register({
  id: "knh-nairobi",
  name: "Kenyatta National Hospital",
  region: "Nairobi",
  country: "KE",
  lat: -1.3009,
  lng: 36.8073,
  activeAgents: ["nurseAI", "oncoAI"],
  capabilities: ["triage", "oncology", "emergency"],
});

nodeRegistry.register({
  id: "moi-eldoret",
  name: "Moi Teaching & Referral Hospital",
  region: "Eldoret",
  country: "KE",
  lat: 0.5143,
  lng: 35.2698,
  activeAgents: ["nurseAI"],
  capabilities: ["triage", "patient-routing"],
});

nodeRegistry.register({
  id: "coast-mombasa",
  name: "Coast General Teaching & Referral Hospital",
  region: "Mombasa",
  country: "KE",
  lat: -4.0435,
  lng: 39.6682,
  activeAgents: ["nurseAI", "pandemicAI"],
  capabilities: ["triage", "outbreak", "epidemic-analysis"],
});
