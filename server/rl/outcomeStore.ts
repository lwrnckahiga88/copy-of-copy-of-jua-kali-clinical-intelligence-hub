/**
 * RL Outcome Store
 * Logs clinical agent decisions and patient outcomes for policy learning
 * Audit-safe: append-only with immutable timestamps
 */

export type OutcomeResult = "improved" | "stable" | "worsened" | "critical";

export interface OutcomeRecord {
  id: string;
  timestamp: number;
  patientId: string;
  agentId: string;
  action: string;
  outcome: OutcomeResult;
  context: Record<string, unknown>;
  reward?: number;
}

class OutcomeStore {
  private records: OutcomeRecord[] = [];
  private readonly MAX_RECORDS = 10_000;

  log(record: Omit<OutcomeRecord, "id" | "timestamp">): OutcomeRecord {
    const full: OutcomeRecord = {
      id: `outcome-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      ...record,
    };

    this.records.push(full);
    if (this.records.length > this.MAX_RECORDS) {
      this.records.shift(); // rolling window
    }

    return full;
  }

  getAll(): OutcomeRecord[] {
    return [...this.records];
  }

  getByAgent(agentId: string): OutcomeRecord[] {
    return this.records.filter((r) => r.agentId === agentId);
  }

  getByOutcome(outcome: OutcomeResult): OutcomeRecord[] {
    return this.records.filter((r) => r.outcome === outcome);
  }

  getRecent(limit = 100): OutcomeRecord[] {
    return this.records.slice(-limit).reverse();
  }

  stats() {
    const total = this.records.length;
    const counts = { improved: 0, stable: 0, worsened: 0, critical: 0 };
    for (const r of this.records) counts[r.outcome]++;
    return {
      total,
      counts,
      successRate: total > 0
        ? ((counts.improved + counts.stable) / total * 100).toFixed(1) + "%"
        : "N/A",
    };
  }
}

export const outcomeStore = new OutcomeStore();
