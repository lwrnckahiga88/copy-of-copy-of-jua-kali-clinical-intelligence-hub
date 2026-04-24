/**
 * Jarvis Patch Engine
 * Generates safe repo patches from structured intents
 * Only produces registry/ and agent-core/ changes — never touches live server code
 */

import type { RepoPatch } from "../agents/githubUpdateAgent";
import type { AgentNode } from "../agent-core/compiler";
import { generateRLRegistryPatch } from "../rl/feedbackLoop";
import { policyMemory } from "../rl/rewardEngine";
import { outcomeStore } from "../rl/outcomeStore";

export type PatchIntent =
  | { type: "add-agent"; agentId: string; payload: Partial<AgentNode> }
  | { type: "update-agent"; agentId: string; payload: Partial<AgentNode> }
  | { type: "sync-agent-registry"; agents: AgentNode[] }
  | { type: "write-rl-suggestions" }
  | { type: "write-outcome-log" };

export function generatePatch(intent: PatchIntent): RepoPatch[] {
  switch (intent.type) {
    case "add-agent":
    case "update-agent": {
      const node: Partial<AgentNode> = {
        id: intent.agentId,
        type: "ui-agent",
        source: "compiled-from-html",
        ...intent.payload,
        metadata: {
          compiledAt: Date.now(),
          contentHash: "manual",
          ...(intent.payload.metadata ?? {}),
        },
      };
      return [
        {
          path: `registry/agents/${intent.agentId}.json`,
          content: JSON.stringify(node, null, 2),
        },
      ];
    }

    case "sync-agent-registry": {
      const index = intent.agents.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        capabilities: a.capabilities,
        htmlUrl: a.htmlUrl,
      }));
      return [
        {
          path: "registry/agents.json",
          content: JSON.stringify(
            {
              generatedAt: new Date().toISOString(),
              total: intent.agents.length,
              agents: index,
            },
            null,
            2
          ),
        },
      ];
    }

    case "write-rl-suggestions": {
      const suggestions = policyMemory.getSuggestions();
      return [generateRLRegistryPatch(suggestions)];
    }

    case "write-outcome-log": {
      return [
        {
          path: "registry/outcome-log.json",
          content: JSON.stringify(
            {
              exportedAt: new Date().toISOString(),
              stats: outcomeStore.stats(),
              recent: outcomeStore.getRecent(200),
            },
            null,
            2
          ),
        },
      ];
    }

    default:
      return [];
  }
}
