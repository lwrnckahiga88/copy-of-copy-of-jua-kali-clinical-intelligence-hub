import type { FileChange } from "./agents/githubUpdateAgent";

/**
 * Jarvis Patch Engine
 * Generates diffs and patches based on Jarvis intents
 * 
 * This engine converts Jarvis decisions into concrete file changes
 * that can be safely applied to the repository.
 */

export interface JarvisIntent {
  type: string;
  agentId?: string;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface PatchGenerationResult {
  changes: FileChange[];
  summary: string;
  estimatedImpact: string;
  requiresApproval: boolean;
}

export class JarvisPatchEngine {
  /**
   * Generate a patch based on a Jarvis intent
   */
  static generatePatch(intent: JarvisIntent): PatchGenerationResult {
    switch (intent.type) {
      case "add-agent":
        return this.generateAddAgentPatch(intent);
      case "update-agent":
        return this.generateUpdateAgentPatch(intent);
      case "update-router":
        return this.generateUpdateRouterPatch(intent);
      case "add-hospital":
        return this.generateAddHospitalPatch(intent);
      case "update-hospital":
        return this.generateUpdateHospitalPatch(intent);
      case "update-schema":
        return this.generateUpdateSchemaPatch(intent);
      case "add-hook":
        return this.generateAddHookPatch(intent);
      default:
        return {
          changes: [],
          summary: `Unknown intent type: ${intent.type}`,
          estimatedImpact: "none",
          requiresApproval: false,
        };
    }
  }

  /**
   * Generate patch for adding a new agent
   */
  private static generateAddAgentPatch(intent: JarvisIntent): PatchGenerationResult {
    const { agentId, payload } = intent;
    const agentName = (payload.name as string) || agentId || "NewAgent";

    // Create agent definition file
    const agentDefinition = {
      id: agentId,
      name: agentName,
      description: payload.description || "",
      version: "1.0.0",
      source: {
        type: "github",
        path: `/server/agents/${agentId}`,
      },
      metadata: {
        author: "Jarvis",
        tags: payload.tags || [],
        category: payload.category || "clinical",
      },
      permissions: {
        requiredRole: "user",
        canAccessPatientData: true,
        canModifyRecords: false,
        canExecuteActions: true,
        allowedIntents: [],
      },
      lifecycle: {
        onMount: `on${this.pascalCase(agentName)}Mount`,
        onUpdate: `on${this.pascalCase(agentName)}Update`,
        onUnmount: `on${this.pascalCase(agentName)}Unmount`,
      },
    };

    // Create agent implementation file
    const agentImplementation = `
import type { AgentDefinition, AgentExecutionContext } from "@shared/agent-types";

export const ${this.pascalCase(agentName)}Agent: AgentDefinition = {
  id: "${agentId}",
  name: "${agentName}",
  description: "${payload.description || ""}",
  version: "1.0.0",
  source: {
    type: "github",
    path: "/server/agents/${agentId}",
    lastFetched: ${Date.now()},
  },
  componentGraph: {
    id: "graph-${agentId}",
    type: "root",
    props: {},
    children: [],
  },
  metadata: {
    author: "Jarvis",
    tags: ${JSON.stringify(payload.tags || [])},
    category: "${payload.category || "clinical"}",
  },
  permissions: {
    requiredRole: "user",
    canAccessPatientData: true,
    canModifyRecords: false,
    canExecuteActions: true,
    allowedIntents: [],
  },
  lifecycle: {
    onMount: "onAgentMount",
    onUpdate: "onAgentUpdate",
    onUnmount: "onAgentUnmount",
  },
};

export async function onAgentMount(ctx: AgentExecutionContext) {
  console.log(\`Agent ${agentName} mounted\`);
}

export async function onAgentUpdate(ctx: AgentExecutionContext) {
  console.log(\`Agent ${agentName} updated\`);
}

export async function onAgentUnmount(ctx: AgentExecutionContext) {
  console.log(\`Agent ${agentName} unmounted\`);
}
`;

    const changes: FileChange[] = [
      {
        path: `/server/agents/${agentId}/definition.json`,
        content: JSON.stringify(agentDefinition, null, 2),
        action: "create",
      },
      {
        path: `/server/agents/${agentId}/index.ts`,
        content: agentImplementation,
        action: "create",
      },
    ];

    return {
      changes,
      summary: `Add new agent: ${agentName}`,
      estimatedImpact: "low - new agent, no existing code modified",
      requiresApproval: false,
    };
  }

  /**
   * Generate patch for updating an agent
   */
  private static generateUpdateAgentPatch(intent: JarvisIntent): PatchGenerationResult {
    const { agentId, payload } = intent;

    const changes: FileChange[] = [
      {
        path: `/server/agents/${agentId}/definition.json`,
        content: JSON.stringify(payload, null, 2),
        action: "update",
      },
    ];

    return {
      changes,
      summary: `Update agent: ${agentId}`,
      estimatedImpact: "medium - agent behavior may change",
      requiresApproval: true,
    };
  }

  /**
   * Generate patch for updating router
   */
  private static generateUpdateRouterPatch(intent: JarvisIntent): PatchGenerationResult {
    const { payload } = intent;

    const changes: FileChange[] = [
      {
        path: "/server/routers.ts",
        content: (payload.newCode as string) || "",
        action: "update",
      },
    ];

    return {
      changes,
      summary: "Update Jarvis router",
      estimatedImpact: "high - routing logic changes",
      requiresApproval: true,
    };
  }

  /**
   * Generate patch for adding a hospital
   */
  private static generateAddHospitalPatch(intent: JarvisIntent): PatchGenerationResult {
    const { payload } = intent;

    const hospitalData = {
      id: payload.id || `hospital-${Date.now()}`,
      name: payload.name || "New Hospital",
      location: payload.location || { lat: 0, lon: 0 },
      specialty: payload.specialty || "general",
      capacity: payload.capacity || 100,
      availableBeds: payload.availableBeds || 50,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    const changes: FileChange[] = [
      {
        path: `/data/hospitals/${hospitalData.id}.json`,
        content: JSON.stringify(hospitalData, null, 2),
        action: "create",
      },
    ];

    return {
      changes,
      summary: `Add hospital: ${hospitalData.name}`,
      estimatedImpact: "low - new hospital data",
      requiresApproval: false,
    };
  }

  /**
   * Generate patch for updating a hospital
   */
  private static generateUpdateHospitalPatch(intent: JarvisIntent): PatchGenerationResult {
    const { payload } = intent;
    const hospitalId = payload.id as string;

    const changes: FileChange[] = [
      {
        path: `/data/hospitals/${hospitalId}.json`,
        content: JSON.stringify(payload, null, 2),
        action: "update",
      },
    ];

    return {
      changes,
      summary: `Update hospital: ${hospitalId}`,
      estimatedImpact: "low - hospital data update",
      requiresApproval: false,
    };
  }

  /**
   * Generate patch for updating database schema
   */
  private static generateUpdateSchemaPatch(intent: JarvisIntent): PatchGenerationResult {
    const { payload } = intent;

    const changes: FileChange[] = [
      {
        path: "/drizzle/schema.ts",
        content: (payload.schemaCode as string) || "",
        action: "update",
      },
    ];

    return {
      changes,
      summary: "Update database schema",
      estimatedImpact: "critical - database structure change",
      requiresApproval: true,
    };
  }

  /**
   * Generate patch for adding a hook
   */
  private static generateAddHookPatch(intent: JarvisIntent): PatchGenerationResult {
    const { payload } = intent;
    const hookName = payload.name as string;

    const hookCode = `
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

/**
 * Auto-generated hook by Jarvis
 * Generated: ${new Date().toISOString()}
 */

export function use${this.pascalCase(hookName)}() {
  return trpc.${hookName}.useQuery();
}

export function use${this.pascalCase(hookName)}Mutation() {
  return trpc.${hookName}.useMutation();
}
`;

    const changes: FileChange[] = [
      {
        path: `/client/src/hooks/use${this.pascalCase(hookName)}.ts`,
        content: hookCode,
        action: "create",
      },
    ];

    return {
      changes,
      summary: `Add hook: use${this.pascalCase(hookName)}`,
      estimatedImpact: "low - new hook, no existing code modified",
      requiresApproval: false,
    };
  }

  /**
   * Convert string to PascalCase
   */
  private static pascalCase(str: string): string {
    return str
      .split(/[\s-_]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  }
}
