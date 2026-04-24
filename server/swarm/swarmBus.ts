/**
 * Swarm Event Bus
 * Hospital-wide intelligence coordination layer
 */

import EventEmitter from "events";

export type SwarmEvent =
  | "agent:compiled"
  | "agent:dispatched"
  | "agent:completed"
  | "agent:failed"
  | "outcome:recorded"
  | "policy:updated"
  | "node:registered"
  | "node:heartbeat"
  | "graph:reloaded";

export interface SwarmEventPayload {
  event: SwarmEvent;
  agentId?: string;
  nodeId?: string;
  data?: unknown;
  timestamp: number;
}

class JarvisSwarmBus extends EventEmitter {
  private eventLog: SwarmEventPayload[] = [];
  private readonly MAX_LOG = 500;

  emit(event: SwarmEvent, payload: Omit<SwarmEventPayload, "event" | "timestamp">): boolean {
    const full: SwarmEventPayload = {
      event,
      ...payload,
      timestamp: Date.now(),
    };

    this.eventLog.push(full);
    if (this.eventLog.length > this.MAX_LOG) {
      this.eventLog.shift();
    }

    return super.emit(event, full);
  }

  getRecentEvents(limit = 50): SwarmEventPayload[] {
    return this.eventLog.slice(-limit).reverse();
  }

  getEventsForAgent(agentId: string): SwarmEventPayload[] {
    return this.eventLog.filter((e) => e.agentId === agentId);
  }
}

export const SwarmBus = new JarvisSwarmBus();
SwarmBus.setMaxListeners(100);
