import { EventEmitter } from "events";
import { z } from "zod";

/**
 * Real-time synchronization layer for agent state updates
 * Handles WebSocket-like subscriptions and data broadcasting
 */

export interface AgentUpdate {
  agentId: string;
  timestamp: number;
  data: Record<string, unknown>;
  type: "state" | "data" | "error" | "status";
}

export interface AgentSubscription {
  agentId: string;
  callback: (update: AgentUpdate) => void;
  filters?: {
    types?: AgentUpdate["type"][];
    dataKeys?: string[];
  };
}

class AgentSyncManager extends EventEmitter {
  private subscriptions: Map<string, Set<AgentSubscription>> = new Map();
  private agentStates: Map<string, Record<string, unknown>> = new Map();
  private updateQueue: AgentUpdate[] = [];
  private isProcessing = false;

  /**
   * Subscribe to agent updates
   */
  subscribe(subscription: AgentSubscription): () => void {
    const key = subscription.agentId;
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key)!.add(subscription);

    // Return unsubscribe function
    return () => {
      this.subscriptions.get(key)?.delete(subscription);
      if (this.subscriptions.get(key)?.size === 0) {
        this.subscriptions.delete(key);
      }
    };
  }

  /**
   * Broadcast update to all subscribers
   */
  async broadcast(update: AgentUpdate): Promise<void> {
    this.updateQueue.push(update);
    await this.processQueue();
  }

  /**
   * Process queued updates
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.updateQueue.length === 0) return;

    this.isProcessing = true;
    try {
      while (this.updateQueue.length > 0) {
        const update = this.updateQueue.shift()!;

        // Update agent state
        const currentState = this.agentStates.get(update.agentId) || {};
        this.agentStates.set(update.agentId, {
          ...currentState,
          ...update.data,
          lastUpdate: update.timestamp,
        });

        // Notify subscribers
        const subscribers = this.subscriptions.get(update.agentId);
        if (subscribers) {
          for (const subscription of subscribers) {
            // Apply filters if specified
            if (
              subscription.filters?.types &&
              !subscription.filters.types.includes(update.type)
            ) {
              continue;
            }

            if (subscription.filters?.dataKeys) {
              const filteredData = Object.fromEntries(
                Object.entries(update.data).filter(([key]) =>
                  subscription.filters!.dataKeys!.includes(key)
                )
              );
              subscription.callback({
                ...update,
                data: filteredData,
              });
            } else {
              subscription.callback(update);
            }
          }
        }

        // Emit event for logging/monitoring
        this.emit("update", update);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get current agent state
   */
  getState(agentId: string): Record<string, unknown> | undefined {
    return this.agentStates.get(agentId);
  }

  /**
   * Set agent state
   */
  setState(agentId: string, state: Record<string, unknown>): void {
    this.agentStates.set(agentId, {
      ...this.agentStates.get(agentId),
      ...state,
      lastUpdate: Date.now(),
    });
  }

  /**
   * Get all subscriptions for an agent
   */
  getSubscriptions(agentId: string): number {
    return this.subscriptions.get(agentId)?.size || 0;
  }

  /**
   * Clear all subscriptions for an agent
   */
  clearSubscriptions(agentId: string): void {
    this.subscriptions.delete(agentId);
  }

  /**
   * Get sync statistics
   */
  getStats(): {
    totalAgents: number;
    totalSubscriptions: number;
    queueLength: number;
    isProcessing: boolean;
  } {
    let totalSubscriptions = 0;
    for (const subs of this.subscriptions.values()) {
      totalSubscriptions += subs.size;
    }

    return {
      totalAgents: this.agentStates.size,
      totalSubscriptions,
      queueLength: this.updateQueue.length,
      isProcessing: this.isProcessing,
    };
  }
}

// Singleton instance
export const agentSyncManager = new AgentSyncManager();

/**
 * Batch update multiple agents
 */
export async function batchUpdateAgents(
  updates: AgentUpdate[]
): Promise<void> {
  for (const update of updates) {
    await agentSyncManager.broadcast(update);
  }
}

/**
 * Create a subscription with validation
 */
export function createSubscription(
  agentId: string,
  callback: (update: AgentUpdate) => void,
  filters?: AgentSubscription["filters"]
): AgentSubscription {
  return {
    agentId,
    callback,
    filters,
  };
}

/**
 * Sync hospital availability updates
 */
export async function syncHospitalUpdate(
  hospitalId: string,
  availableBeds: number,
  totalBeds: number
): Promise<void> {
  await agentSyncManager.broadcast({
    agentId: `hospital_${hospitalId}`,
    timestamp: Date.now(),
    type: "data",
    data: {
      hospitalId,
      availableBeds,
      totalBeds,
      occupancy: ((totalBeds - availableBeds) / totalBeds) * 100,
    },
  });
}

/**
 * Sync agent status update
 */
export async function syncAgentStatus(
  agentId: string,
  status: "active" | "inactive" | "error" | "loading"
): Promise<void> {
  await agentSyncManager.broadcast({
    agentId,
    timestamp: Date.now(),
    type: "status",
    data: { status },
  });
}

/**
 * Sync agent data update
 */
export async function syncAgentData(
  agentId: string,
  data: Record<string, unknown>
): Promise<void> {
  await agentSyncManager.broadcast({
    agentId,
    timestamp: Date.now(),
    type: "data",
    data,
  });
}

/**
 * Sync agent error
 */
export async function syncAgentError(
  agentId: string,
  error: string
): Promise<void> {
  await agentSyncManager.broadcast({
    agentId,
    timestamp: Date.now(),
    type: "error",
    data: { error, errorTime: new Date().toISOString() },
  });
}
