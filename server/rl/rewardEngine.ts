/**
 * RL Reward Engine + Policy Memory
 * Computes rewards and updates agent action policies
 * Safety: shadow learning only — no direct code mutation
 */

import type { OutcomeResult } from "./outcomeStore";

const LEARNING_RATE = 0.1;
const DECAY_FACTOR = 0.95; // older rewards matter less over time

export function computeReward(outcome: OutcomeResult): number {
  switch (outcome) {
    case "improved": return +1.0;
    case "stable":   return +0.2;
    case "worsened": return -1.0;
    case "critical": return -2.0;
    default:         return 0;
  }
}

class PolicyMemory {
  // key: `${agentId}:${action}` → weighted reward score
  private memory = new Map<string, number>();
  // track update counts per key
  private counts = new Map<string, number>();

  update(agentId: string, action: string, outcome: OutcomeResult): number {
    const reward = computeReward(outcome);
    const key = `${agentId}:${action}`;
    const prev = this.memory.get(key) ?? 0;
    const count = (this.counts.get(key) ?? 0) + 1;

    // Decaying weighted update
    const updated = prev * DECAY_FACTOR + reward * LEARNING_RATE;
    this.memory.set(key, updated);
    this.counts.set(key, count);

    return updated;
  }

  getScore(agentId: string, action: string): number {
    return this.memory.get(`${agentId}:${action}`) ?? 0;
  }

  selectBestAction(agentId: string, actions: string[]): string {
    let best = actions[0];
    let bestScore = -Infinity;

    for (const action of actions) {
      const score = this.getScore(agentId, action);
      if (score > bestScore) {
        bestScore = score;
        best = action;
      }
    }
    return best;
  }

  /**
   * Returns weak policies (score < threshold) as improvement suggestions
   * These are written to the repo registry — NOT to live code
   */
  getSuggestions(threshold = -0.3): Array<{
    agentId: string;
    action: string;
    score: number;
    issue: string;
    updateCount: number;
  }> {
    const suggestions = [];
    for (const [key, score] of this.memory.entries()) {
      if (score < threshold) {
        const [agentId, ...actionParts] = key.split(":");
        const action = actionParts.join(":");
        suggestions.push({
          agentId,
          action,
          score: parseFloat(score.toFixed(4)),
          issue: score < -1.0 ? "critically underperforming" : "low performance detected",
          updateCount: this.counts.get(key) ?? 0,
        });
      }
    }
    return suggestions.sort((a, b) => a.score - b.score);
  }

  snapshot(): Record<string, number> {
    return Object.fromEntries(this.memory.entries());
  }

  size(): number {
    return this.memory.size;
  }
}

export const policyMemory = new PolicyMemory();
