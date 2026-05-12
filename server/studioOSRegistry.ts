/**
 * StudioOS Registry
 * Central registry for agent definitions and runtime management
 */

import {
  AgentDefinition,
  AgentRegistryEntry,
  AgentState,
  AgentError,
  AgentSyncStatus,
} from "@shared/agent-types";

class StudioOSRegistry {
  private registry: Map<string, AgentRegistryEntry> = new Map();
  private agentStates: Map<string, AgentState> = new Map();
  private syncStatuses: Map<string, AgentSyncStatus> = new Map();

  /**
   * Register an agent in the registry
   */
  registerAgent(definition: AgentDefinition): AgentRegistryEntry {
    const entry: AgentRegistryEntry = {
      id: definition.id,
      definition,
      state: {
        agentId: definition.id,
        instanceId: `${definition.id}-${Date.now()}`,
        status: "idle",
        data: {},
        errors: [],
        lastUpdated: Date.now(),
        executionCount: 0,
      },
      lastSync: Date.now(),
      cached: false,
    };

    this.registry.set(definition.id, entry);
    this.agentStates.set(definition.id, entry.state);
    this.syncStatuses.set(definition.id, {
      agentId: definition.id,
      status: "synced",
      lastSync: Date.now(),
      nextSync: Date.now() + 3600000, // 1 hour
      version: definition.version,
    });

    return entry;
  }

  /**
   * Get an agent definition from the registry
   */
  getAgent(agentId: string): AgentDefinition | null {
    const entry = this.registry.get(agentId);
    return entry?.definition || null;
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): AgentDefinition[] {
    return Array.from(this.registry.values()).map((entry) => entry.definition);
  }

  /**
   * Update agent state
   */
  updateAgentState(agentId: string, updates: Partial<AgentState>): AgentState | null {
    const state = this.agentStates.get(agentId);
    if (!state) return null;

    const updated = {
      ...state,
      ...updates,
      lastUpdated: Date.now(),
    };

    this.agentStates.set(agentId, updated);

    // Update registry entry
    const entry = this.registry.get(agentId);
    if (entry) {
      entry.state = updated;
    }

    return updated;
  }

  /**
   * Get agent state
   */
  getAgentState(agentId: string): AgentState | null {
    return this.agentStates.get(agentId) || null;
  }

  /**
   * Add error to agent state
   */
  addAgentError(agentId: string, error: AgentError): void {
    const state = this.agentStates.get(agentId);
    if (state) {
      state.errors.push(error);
      // Keep only last 10 errors
      if (state.errors.length > 10) {
        state.errors = state.errors.slice(-10);
      }
      state.lastUpdated = Date.now();
    }
  }

  /**
   * Clear agent errors
   */
  clearAgentErrors(agentId: string): void {
    const state = this.agentStates.get(agentId);
    if (state) {
      state.errors = [];
      state.lastUpdated = Date.now();
    }
  }

  /**
   * Update agent sync status
   */
  updateSyncStatus(agentId: string, status: Partial<AgentSyncStatus>): AgentSyncStatus | null {
    const current = this.syncStatuses.get(agentId);
    if (!current) return null;

    const updated = {
      ...current,
      ...status,
      lastSync: status.status === "synced" ? Date.now() : current.lastSync,
    };

    this.syncStatuses.set(agentId, updated);
    return updated;
  }

  /**
   * Get agent sync status
   */
  getSyncStatus(agentId: string): AgentSyncStatus | null {
    return this.syncStatuses.get(agentId) || null;
  }

  /**
   * Get all sync statuses
   */
  getAllSyncStatuses(): AgentSyncStatus[] {
    return Array.from(this.syncStatuses.values());
  }

  /**
   * Check if agent needs sync
   */
  needsSync(agentId: string): boolean {
    const status = this.syncStatuses.get(agentId);
    if (!status) return false;

    return (
      status.status === "out-of-date" ||
      status.status === "error" ||
      Date.now() > status.nextSync
    );
  }

  /**
   * Get agents that need sync
   */
  getAgentsNeedingSync(): string[] {
    return Array.from(this.syncStatuses.values())
      .filter((status) => this.needsSync(status.agentId))
      .map((status) => status.agentId);
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId: string): boolean {
    const removed = this.registry.delete(agentId);
    this.agentStates.delete(agentId);
    this.syncStatuses.delete(agentId);
    return removed;
  }

  /**
   * Clear all agents
   */
  clear(): void {
    this.registry.clear();
    this.agentStates.clear();
    this.syncStatuses.clear();
  }

  /**
   * Get registry statistics
   */
  getStats() {
    return {
      totalAgents: this.registry.size,
      activeAgents: Array.from(this.agentStates.values()).filter(
        (s) => s.status === "active"
      ).length,
      agentsWithErrors: Array.from(this.agentStates.values()).filter(
        (s) => s.errors.length > 0
      ).length,
      needingSyncCount: this.getAgentsNeedingSync().length,
    };
  }
}

// Singleton instance
export const studioOSRegistry = new StudioOSRegistry();

/**
 * Initialize StudioOS with default agents
 */
export async function initializeStudioOS(): Promise<void> {
  // This will be populated with actual agent definitions
  // when Apify fetches them from GitHub
  console.log("[StudioOS] Registry initialized");
}

/**
 * Get or create agent registry
 */
export function getStudioOSRegistry(): StudioOSRegistry {
  return studioOSRegistry;
}
