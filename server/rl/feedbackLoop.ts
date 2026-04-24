/**
 * RL Feedback Loop
 * Connects outcome recording → reward computation → policy update → suggestions
 * Emits swarm events for audit trail
 */

import { outcomeStore, type OutcomeResult } from "./outcomeStore";
import { policyMemory } from "./rewardEngine";
import { SwarmBus } from "../swarm/swarmBus";

export interface FeedbackEvent {
  patientId: string;
  agentId: string;
  action: string;
  outcome: OutcomeResult;
  context?: Record<string, unknown>;
}

/**
 * Main entry point: record an outcome and update policy
 * Called after a clinical decision resolves
 */
export function processOutcome(event: FeedbackEvent): {
  outcomeId: string;
  newScore: number;
  suggestions: ReturnType<typeof policyMemory.getSuggestions>;
} {
  // 1. Log immutable outcome record
  const record = outcomeStore.log({
    patientId: event.patientId,
    agentId: event.agentId,
    action: event.action,
    outcome: event.outcome,
    context: event.context ?? {},
  });

  // 2. Update policy score
  const newScore = policyMemory.update(event.agentId, event.action, event.outcome);

  // 3. Emit to swarm bus for real-time audit
  SwarmBus.emit("outcome:recorded", {
    agentId: event.agentId,
    data: { outcome: event.outcome, newScore, outcomeId: record.id },
  });

  SwarmBus.emit("policy:updated", {
    agentId: event.agentId,
    data: { action: event.action, score: newScore },
  });

  // 4. Generate suggestions for weak policies
  const suggestions = policyMemory.getSuggestions();

  return {
    outcomeId: record.id,
    newScore,
    suggestions,
  };
}

/**
 * Generate GitHub registry patch content from RL suggestions
 * Writes to /registry/optimization-suggestions.json (NOT live code)
 */
export function generateRLRegistryPatch(suggestions: ReturnType<typeof policyMemory.getSuggestions>): {
  path: string;
  content: string;
} {
  return {
    path: "registry/optimization-suggestions.json",
    content: JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalPolicies: policyMemory.size(),
        outcomeStats: outcomeStore.stats(),
        suggestions,
        safetyNote:
          "These are advisory suggestions only. No live code was modified. Human review required before applying.",
      },
      null,
      2
    ),
  };
}
