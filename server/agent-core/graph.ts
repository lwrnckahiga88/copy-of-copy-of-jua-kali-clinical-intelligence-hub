/**
 * Agent Graph Store
 * In-memory graph with compile/query/update operations
 */

import type { AgentNode, AgentCapability } from "./compiler";

class AgentGraph {
  private nodes = new Map<string, AgentNode>();
  private compiledAt: number | null = null;

  load(nodes: AgentNode[]): void {
    this.nodes.clear();
    for (const node of nodes) {
      this.nodes.set(node.id, node);
    }
    this.compiledAt = Date.now();
  }

  all(): AgentNode[] {
    return Array.from(this.nodes.values());
  }

  get(id: string): AgentNode | undefined {
    return this.nodes.get(id);
  }

  findByCapability(cap: AgentCapability): AgentNode[] {
    return this.all().filter((n) => n.capabilities.includes(cap));
  }

  findBestMatch(capabilities: AgentCapability[]): AgentNode | null {
    let best: AgentNode | null = null;
    let bestScore = 0;

    for (const node of this.nodes.values()) {
      const score = capabilities.filter((c) =>
        node.capabilities.includes(c)
      ).length;
      if (score > bestScore) {
        bestScore = score;
        best = node;
      }
    }
    return best;
  }

  stats() {
    return {
      total: this.nodes.size,
      compiledAt: this.compiledAt,
      byType: {
        "ui-agent": this.all().filter((n) => n.type === "ui-agent").length,
        "compute-agent": this.all().filter((n) => n.type === "compute-agent").length,
        "swarm-agent": this.all().filter((n) => n.type === "swarm-agent").length,
      },
    };
  }
}

// Singleton in-memory graph instance
export const agentGraph = new AgentGraph();
