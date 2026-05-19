import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { parse } from "url";
import { getDb } from "./db";

export interface WebSocketMessage {
  type: "agent_update" | "genomics_result" | "imaging_result" | "dispatch_update" | "consensus_score";
  agentId: string;
  userId: string;
  data: Record<string, unknown>;
  timestamp: number;
}

interface ClientConnection {
  ws: WebSocket;
  userId: string;
  agentId?: string;
  subscriptions: Set<string>;
}

const clients = new Map<string, ClientConnection>();
const agentChannels = new Map<string, Set<string>>();

export function initializeWebSocket(server: any): WebSocketServer {
  const wss = new WebSocketServer({ 
    server,
    path: "/api/ws",
    perMessageDeflate: false,
  });

  wss.on("connection", (ws: WebSocket, req: any) => {
    const url = parse(req.url || "", true);
    const userId = url.query.userId as string;
    const agentId = url.query.agentId as string;

    if (!userId) {
      ws.close(1008, "Missing userId");
      return;
    }

    const clientId = `${userId}-${Date.now()}-${Math.random()}`;
    const connection: ClientConnection = {
      ws,
      userId,
      agentId,
      subscriptions: new Set(),
    };

    clients.set(clientId, connection);

    // Subscribe to agent channel if agentId provided
    if (agentId) {
      if (!agentChannels.has(agentId)) {
        agentChannels.set(agentId, new Set());
      }
      agentChannels.get(agentId)!.add(clientId);
      connection.subscriptions.add(agentId);
    }

    console.log(`[WebSocket] Client connected: ${clientId} (user: ${userId}, agent: ${agentId})`);

    ws.on("message", async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        await handleMessage(clientId, message);
      } catch (error) {
        console.error("[WebSocket] Error processing message:", error);
        ws.send(JSON.stringify({ error: "Invalid message format" }));
      }
    });

    ws.on("close", () => {
      // Unsubscribe from all channels
      connection.subscriptions.forEach((channel) => {
        const subscribers = agentChannels.get(channel);
        if (subscribers) {
          subscribers.delete(clientId);
        }
      });
      clients.delete(clientId);
      console.log(`[WebSocket] Client disconnected: ${clientId}`);
    });

    wss.on("error", (error: any) => {
      console.error(`[WebSocket] Error on client ${clientId}:`, error);
    });

    // Send connection confirmation
    ws.send(JSON.stringify({
      type: "connection_established",
      clientId,
      timestamp: Date.now(),
    }));
  });

  return wss;
}

async function handleMessage(clientId: string, message: WebSocketMessage) {
  const connection = clients.get(clientId);
  if (!connection) return;

  console.log(`[WebSocket] Message from ${clientId}:`, message.type);

  switch (message.type) {
    case "agent_update":
      await broadcastToAgent(message.agentId, message);
      break;
    case "genomics_result":
      await broadcastToAccessibleAgents("genomics", message);
      break;
    case "imaging_result":
      await broadcastToAccessibleAgents("imaging", message);
      break;
    case "dispatch_update":
      await broadcastToAccessibleAgents("dispatch", message);
      break;
    case "consensus_score":
      await broadcastToAccessibleAgents("consensus", message);
      break;
  }
}

export async function broadcastToAgent(agentId: string, message: WebSocketMessage) {
  const subscribers = agentChannels.get(agentId);
  if (!subscribers) return;

  const messageStr = JSON.stringify(message);
  subscribers.forEach((clientId) => {
    const connection = clients.get(clientId);
    if (connection && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(messageStr);
    }
  });
}

export async function broadcastToAccessibleAgents(
  analysisType: string,
  message: WebSocketMessage
) {
  // Define which agents can access each analysis type
  const accessibleAgents: Record<string, string[]> = {
    genomics: ["medos", "clinicalvalidator", "nurseai", "quorumdee"],
    imaging: ["medos", "clinicalvalidator", "oncoai"],
    dispatch: ["medos", "nurseai", "kemci"],
    consensus: ["medos", "clinicalvalidator", "nurseai", "quorumdee"],
  };

  const agents = accessibleAgents[analysisType] || [];
  for (const agentId of agents) {
    await broadcastToAgent(agentId, message);
  }
}

export function getConnectedClients(): number {
  return clients.size;
}

export function getAgentSubscribers(agentId: string): number {
  return agentChannels.get(agentId)?.size || 0;
}

export async function sendToUser(userId: string, message: WebSocketMessage) {
  clients.forEach((connection) => {
    if (connection.userId === userId && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(message));
    }
  });
}

export async function closeUserConnections(userId: string) {
  const clientsToClose: string[] = [];
  clients.forEach((connection, clientId) => {
    if (connection.userId === userId) {
      clientsToClose.push(clientId);
    }
  });

  clientsToClose.forEach((clientId) => {
    const connection = clients.get(clientId);
    if (connection) {
      connection.ws.close(1000, "User logged out");
      clients.delete(clientId);
    }
  });
}
