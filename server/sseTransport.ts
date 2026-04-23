import { Response } from "express";
import { agentSyncManager, AgentUpdate } from "./agentSync";

/**
 * SSE (Server-Sent Events) transport for real-time agent updates
 * Manages client connections and broadcasts updates
 */

interface ClientConnection {
  agentId: string;
  response: Response;
  createdAt: number;
  lastHeartbeat: number;
}

class SSETransport {
  private clients: Map<string, Set<ClientConnection>> = new Map();
  private heartbeatInterval = 30000; // 30 seconds
  private heartbeatTimer: NodeJS.Timeout | null = null;

  /**
   * Register a client for SSE updates
   */
  registerClient(agentId: string, response: Response): () => void {
    const client: ClientConnection = {
      agentId,
      response,
      createdAt: Date.now(),
      lastHeartbeat: Date.now(),
    };

    if (!this.clients.has(agentId)) {
      this.clients.set(agentId, new Set());
    }
    this.clients.get(agentId)!.add(client);

    // Set up SSE headers
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    response.setHeader("Access-Control-Allow-Origin", "*");

    // Send initial connection message
    this.sendToClient(client, {
      type: "connection",
      data: { agentId, timestamp: Date.now(), message: "Connected to agent sync" },
    });

    // Start heartbeat if not already running
    if (!this.heartbeatTimer) {
      this.startHeartbeat();
    }

    // Return unsubscribe function
    return () => {
      this.clients.get(agentId)?.delete(client);
      if (this.clients.get(agentId)?.size === 0) {
        this.clients.delete(agentId);
      }
      response.end();
    };
  }

  /**
   * Broadcast update to all clients for an agent
   */
  broadcastUpdate(update: AgentUpdate): void {
    const clients = this.clients.get(update.agentId);
    if (!clients) return;

    for (const client of clients) {
      this.sendToClient(client, {
        type: "update",
        data: update,
      });
    }
  }

  /**
   * Send message to a specific client
   */
  private sendToClient(
    client: ClientConnection,
    message: { type: string; data: unknown }
  ): void {
    try {
      client.response.write(`data: ${JSON.stringify(message)}\n\n`);
      client.lastHeartbeat = Date.now();
    } catch (error) {
      // Client disconnected, remove it
      this.clients.get(client.agentId)?.delete(client);
    }
  }

  /**
   * Send heartbeat to keep connections alive
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      for (const [agentId, clients] of this.clients.entries()) {
        for (const client of clients) {
          try {
            client.response.write(": heartbeat\n\n");
            client.lastHeartbeat = Date.now();
          } catch (error) {
            // Client disconnected
            clients.delete(client);
          }
        }
        if (clients.size === 0) {
          this.clients.delete(agentId);
        }
      }

      // Stop heartbeat if no clients
      if (this.clients.size === 0) {
        this.stopHeartbeat();
      }
    }, this.heartbeatInterval);
  }

  /**
   * Stop heartbeat timer
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    totalConnections: number;
    agentConnections: Record<string, number>;
  } {
    const agentConnections: Record<string, number> = {};
    let totalConnections = 0;

    for (const [agentId, clients] of this.clients.entries()) {
      agentConnections[agentId] = clients.size;
      totalConnections += clients.size;
    }

    return {
      totalConnections,
      agentConnections,
    };
  }

  /**
   * Disconnect all clients
   */
  disconnectAll(): void {
    for (const clients of this.clients.values()) {
      for (const client of clients) {
        try {
          client.response.end();
        } catch (error) {
          // Already disconnected
        }
      }
    }
    this.clients.clear();
    this.stopHeartbeat();
  }

  /**
   * Disconnect all clients for a specific agent
   */
  disconnectAgent(agentId: string): void {
    const clients = this.clients.get(agentId);
    if (!clients) return;

    for (const client of clients) {
      try {
        client.response.end();
      } catch (error) {
        // Already disconnected
      }
    }
    this.clients.delete(agentId);
  }
}

// Singleton instance
export const sseTransport = new SSETransport();

/**
 * Middleware to set up SSE endpoint
 */
export function setupSSEEndpoint(app: any): void {
  app.get("/api/agents/:agentId/sync", (req: any, res: Response) => {
    const { agentId } = req.params;

    if (!agentId) {
      res.status(400).json({ error: "agentId is required" });
      return;
    }

    // Register client and get unsubscribe function
    const unsubscribe = sseTransport.registerClient(agentId, res);

    // Subscribe to agent updates via agentSyncManager
    const subscription = {
      agentId,
      callback: (update: AgentUpdate) => {
        sseTransport.broadcastUpdate(update);
      },
    };

    agentSyncManager.subscribe(subscription);

    // Clean up on disconnect
    req.on("close", () => {
      unsubscribe();
      agentSyncManager.clearSubscriptions(agentId);
    });

    res.on("close", () => {
      unsubscribe();
      agentSyncManager.clearSubscriptions(agentId);
    });
  });
}
