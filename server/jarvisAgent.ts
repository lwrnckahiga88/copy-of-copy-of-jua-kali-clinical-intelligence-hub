/**
 * Jarvis Agent Orchestration Layer
 * Enhanced Jarvis router with agent-based intent routing and Apify integration
 */

import { z } from "zod";
import {
  AgentIntent,
  AgentIntentResponse,
  AgentDefinition,
  ComponentNode,
  UICompilationResult,
} from "@shared/agent-types";
import { studioOSRegistry } from "./studioOSRegistry";
import UICompilerLib from "./uiCompiler";
import { ApifyOrchestrator, IntentRequestSchema } from "./jarvis";

/**
 * Agent Intent Schema
 */
export const AgentIntentSchema = z.object({
  id: z.string(),
  type: z.string(),
  agentId: z.string(),
  payload: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Jarvis Agent Router
 * Routes intents to agents through the Apify → StudioOS pipeline
 */
export class JarvisAgentRouter {
  private apifyToken: string;
  private uiCache: Map<string, { graph: ComponentNode; timestamp: number }> =
    new Map();
  private cacheTTL = 3600000; // 1 hour

  constructor(apifyToken: string) {
    this.apifyToken = apifyToken;
  }

  /**
   * Route an intent to an agent
   */
  async routeIntent(intent: AgentIntent): Promise<AgentIntentResponse> {
    const startTime = Date.now();

    try {
      // Validate intent
      const validated = AgentIntentSchema.parse(intent);

      // Get agent from registry
      const agent = studioOSRegistry.getAgent(validated.agentId);
      if (!agent) {
        throw new Error(`Agent not found: ${validated.agentId}`);
      }

      // Route based on intent type
      let result: unknown;
      switch (validated.type) {
        case "fetch_agent":
          result = await this.fetchAgent(validated.agentId, validated.payload || {});
          break;
        case "execute_action":
          result = await this.executeAgentAction(
            validated.agentId,
            validated.payload || {}
          );
          break;
        case "sync_agent":
          result = await this.syncAgent(validated.agentId);
          break;
        case "get_state":
          result = this.getAgentState(validated.agentId);
          break;
        default:
          throw new Error(`Unknown intent type: ${validated.type}`);
      }

      return {
        id: `response-${Date.now()}`,
        intentId: validated.id,
        agentId: validated.agentId,
        status: "success",
        data: result as Record<string, unknown>,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        id: `response-${Date.now()}`,
        intentId: intent.id,
        agentId: intent.agentId,
        status: "error",
        error: {
          id: `error-${Date.now()}`,
          code: "INTENT_EXECUTION_ERROR",
          message: error instanceof Error ? error.message : String(error),
          timestamp: Date.now(),
        },
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Fetch agent definition and component graph from GitHub via Apify
   */
  async fetchAgent(
    agentId: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {
    const repository = (payload.repository as string) || "lwrnckahiga88/jua.kali";
    const pagePath = (payload.pagePath as string) || `${agentId}.html`;

    // Check cache first
    const cacheKey = `${repository}/${pagePath}`;
    const cached = this.uiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return {
        source: "cache",
        componentGraph: cached.graph,
        timestamp: cached.timestamp,
      };
    }

    // Fetch from GitHub via Apify (using existing actor)
    const result = await ApifyOrchestrator.invokeActor(
      "oCJIoxpyBQwNGYe0W",
      {
        owner: repository.split("/")[0],
        repo: repository.split("/")[1],
        branch: "HEAD",
      },
      this.apifyToken
    );

    if (!result || typeof result !== "object") {
      throw new Error(`Failed to fetch page: ${pagePath}`);
    }

    // Extract page content from result
    const pageContent = (result as Record<string, unknown>).content as string;
    if (!pageContent) {
      throw new Error(`No content in page: ${pagePath}`);
    }

    // Compile HTML to component graph
    const compilationResult = UICompilerLib.compileHTML(pageContent, { agentId });
    if (!compilationResult.success) {
      throw new Error(
        `UI compilation failed: ${compilationResult.errors?.map((e) => e.message).join(", ")}`
      );
    }

    const componentGraph = compilationResult.componentGraph;
    if (!componentGraph) {
      throw new Error("No component graph generated");
    }

    // Optimize the graph
    const optimized = UICompilerLib.optimize(componentGraph);

    // Cache the result
    this.uiCache.set(cacheKey, {
      graph: optimized,
      timestamp: Date.now(),
    });

    // Update agent sync status
    studioOSRegistry.updateSyncStatus(agentId, {
      status: "synced",
      version: `${Date.now()}`,
    });

    return {
      source: "github",
      componentGraph: optimized,
      timestamp: Date.now(),
    };
  }

  /**
   * Execute an action within an agent
   */
  async executeAgentAction(
    agentId: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {
    const agent = studioOSRegistry.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const actionName = payload.actionName as string;
    const actionParams = (payload.params as Record<string, unknown>) || {};

    // Update agent state
    const state = studioOSRegistry.getAgentState(agentId);
    if (state) {
      studioOSRegistry.updateAgentState(agentId, {
        status: "loading",
        executionCount: (state.executionCount || 0) + 1,
      });
    }

    try {
      // Execute action (this would be extended with actual action handlers)
      const result = {
        actionName,
        params: actionParams,
        executedAt: Date.now(),
        status: "completed",
      };

      // Update agent state to active
      studioOSRegistry.updateAgentState(agentId, {
        status: "active",
        data: {
          ...state?.data,
          lastActionResult: result,
        },
      });

      return result;
    } catch (error) {
      studioOSRegistry.updateAgentState(agentId, {
        status: "error",
      });
      throw error;
    }
  }

  /**
   * Sync agent with GitHub
   */
  async syncAgent(agentId: string): Promise<unknown> {
    const agent = studioOSRegistry.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Update sync status
    studioOSRegistry.updateSyncStatus(agentId, {
      status: "syncing",
    });

    try {
      // Fetch latest agent definition from GitHub
      const repository = agent.source.repository || "lwrnckahiga88/jua.kali";
      const pagePath = agent.source.path;

      const result = await ApifyOrchestrator.invokeActor(
        "oCJIoxpyBQwNGYe0W",
        {
          owner: repository.split("/")[0],
          repo: repository.split("/")[1],
          branch: "HEAD",
        },
        this.apifyToken
      );

      if (!result || typeof result !== "object") {
        throw new Error(`Failed to fetch page: ${pagePath}`);
      }

      const pageContent = (result as Record<string, unknown>).content as string;
      if (!pageContent) {
        throw new Error(`No content in page: ${pagePath}`);
      }

      // Compile and cache
      const compilationResult = UICompilerLib.compileHTML(pageContent, { agentId });
      if (compilationResult.success && compilationResult.componentGraph) {
        const cacheKey = `${repository}/${pagePath}`;
        this.uiCache.set(cacheKey, {
          graph: compilationResult.componentGraph,
          timestamp: Date.now(),
        });
      }

      // Update sync status
      studioOSRegistry.updateSyncStatus(agentId, {
        status: "synced",
        version: `${Date.now()}`,
      });

      return {
        agentId,
        status: "synced",
        timestamp: Date.now(),
      };
    } catch (error) {
      studioOSRegistry.updateSyncStatus(agentId, {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get agent state
   */
  getAgentState(agentId: string): unknown {
    const state = studioOSRegistry.getAgentState(agentId);
    const syncStatus = studioOSRegistry.getSyncStatus(agentId);

    return {
      agentId,
      state,
      syncStatus,
      timestamp: Date.now(),
    };
  }

  /**
   * Discover and register agents from GitHub
   */
  async discoverAgents(
    repository: string = "lwrnckahiga88/jua.kali"
  ): Promise<AgentDefinition[]> {
    // Fetch list of HTML pages from GitHub via Apify
    const result = await ApifyOrchestrator.invokeActor(
      "oCJIoxpyBQwNGYe0W",
      {
        owner: repository.split("/")[0],
        repo: repository.split("/")[1],
        branch: "HEAD",
      },
      this.apifyToken
    );

    const pages = (Array.isArray(result) ? result : []) as Array<{
      name: string;
      path: string;
    }>;

    const agents: AgentDefinition[] = [];

    for (const page of pages) {
      if (!page.name.endsWith(".html")) continue;

      const agentId = page.name.replace(".html", "");

      // Create agent definition
      const definition: AgentDefinition = {
        id: agentId,
        name: agentId,
        description: `Agent for ${agentId}`,
        version: "1.0.0",
        source: {
          type: "github",
          repository,
          path: page.path,
          lastFetched: Date.now(),
        },
        componentGraph: {
          id: `${agentId}-root`,
          type: "div",
          props: {},
        },
        metadata: {
          author: "jua.kali",
          tags: ["agent", "clinical"],
          category: "clinical",
        },
        permissions: {
          requiredRole: "user",
          canAccessPatientData: true,
          canModifyRecords: false,
          canExecuteActions: true,
          allowedIntents: ["fetch_agent", "execute_action", "sync_agent", "get_state"],
        },
        lifecycle: {
          onMount: "initialize",
          onUpdate: "update",
          onUnmount: "cleanup",
        },
      };

      // Register agent
      studioOSRegistry.registerAgent(definition);
      agents.push(definition);
    }

    return agents;
  }

  /**
   * Clear UI cache
   */
  clearCache(): void {
    this.uiCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.uiCache.size,
      entries: Array.from(this.uiCache.keys()),
    };
  }
}

/**
 * Create Jarvis Agent Router instance
 */
export function createJarvisAgentRouter(apifyToken: string): JarvisAgentRouter {
  return new JarvisAgentRouter(apifyToken);
}
