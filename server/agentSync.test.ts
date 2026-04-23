import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  agentSyncManager,
  createSubscription,
  syncHospitalUpdate,
  syncAgentStatus,
  syncAgentData,
  syncAgentError,
  batchUpdateAgents,
} from "./agentSync";

describe("Agent Synchronization Manager", () => {
  beforeEach(() => {
    // Clear state before each test
    agentSyncManager.clearSubscriptions("test-agent");
  });

  describe("Subscription Management", () => {
    it("should subscribe to agent updates", () => {
      const callback = vi.fn();
      const subscription = createSubscription("test-agent", callback);

      const unsubscribe = agentSyncManager.subscribe(subscription);

      expect(agentSyncManager.getSubscriptions("test-agent")).toBe(1);
      unsubscribe();
      expect(agentSyncManager.getSubscriptions("test-agent")).toBe(0);
    });

    it("should handle multiple subscriptions", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const sub1 = createSubscription("test-agent", callback1);
      const sub2 = createSubscription("test-agent", callback2);

      agentSyncManager.subscribe(sub1);
      agentSyncManager.subscribe(sub2);

      expect(agentSyncManager.getSubscriptions("test-agent")).toBe(2);
    });

    it("should filter updates by type", async () => {
      const callback = vi.fn();
      const subscription = createSubscription("test-agent", callback, {
        types: ["status"],
      });

      agentSyncManager.subscribe(subscription);

      await agentSyncManager.broadcast({
        agentId: "test-agent",
        timestamp: Date.now(),
        type: "data",
        data: { test: "data" },
      });

      expect(callback).not.toHaveBeenCalled();

      await agentSyncManager.broadcast({
        agentId: "test-agent",
        timestamp: Date.now(),
        type: "status",
        data: { status: "active" },
      });

      expect(callback).toHaveBeenCalled();
    });

    it("should filter updates by data keys", async () => {
      const callback = vi.fn();
      const subscription = createSubscription("test-agent", callback, {
        dataKeys: ["status"],
      });

      agentSyncManager.subscribe(subscription);

      await agentSyncManager.broadcast({
        agentId: "test-agent",
        timestamp: Date.now(),
        type: "data",
        data: { status: "active", other: "value" },
      });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: "active" },
        })
      );
    });
  });

  describe("State Management", () => {
    it("should set and get agent state", () => {
      agentSyncManager.setState("test-agent", { count: 1, name: "test" });

      const state = agentSyncManager.getState("test-agent");
      expect(state?.count).toBe(1);
      expect(state?.name).toBe("test");
      expect(state?.lastUpdate).toBeDefined();
    });

    it("should merge state updates", () => {
      agentSyncManager.setState("test-agent", { count: 1 });
      agentSyncManager.setState("test-agent", { name: "test" });

      const state = agentSyncManager.getState("test-agent");
      expect(state?.count).toBe(1);
      expect(state?.name).toBe("test");
    });

    it("should return undefined for non-existent agent", () => {
      const state = agentSyncManager.getState("non-existent");
      expect(state).toBeUndefined();
    });
  });

  describe("Broadcasting", () => {
    it("should broadcast updates to subscribers", async () => {
      const callback = vi.fn();
      const subscription = createSubscription("test-agent", callback);

      agentSyncManager.subscribe(subscription);

      await agentSyncManager.broadcast({
        agentId: "test-agent",
        timestamp: Date.now(),
        type: "data",
        data: { test: "value" },
      });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: "test-agent",
          type: "data",
          data: { test: "value" },
        })
      );
    });

    it("should update agent state on broadcast", async () => {
      await agentSyncManager.broadcast({
        agentId: "test-agent",
        timestamp: Date.now(),
        type: "data",
        data: { count: 5 },
      });

      const state = agentSyncManager.getState("test-agent");
      expect(state?.count).toBe(5);
    });

    it("should handle batch updates", async () => {
      const updates = [
        {
          agentId: "agent-1",
          timestamp: Date.now(),
          type: "data" as const,
          data: { value: 1 },
        },
        {
          agentId: "agent-2",
          timestamp: Date.now(),
          type: "data" as const,
          data: { value: 2 },
        },
      ];

      await batchUpdateAgents(updates);

      expect(agentSyncManager.getState("agent-1")?.value).toBe(1);
      expect(agentSyncManager.getState("agent-2")?.value).toBe(2);
    });
  });

  describe("Helper Functions", () => {
    it("should sync hospital updates", async () => {
      const callback = vi.fn();
      const subscription = createSubscription(
        "hospital_hospital-001",
        callback
      );

      agentSyncManager.subscribe(subscription);

      await syncHospitalUpdate("hospital-001", 50, 100);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            hospitalId: "hospital-001",
            availableBeds: 50,
            totalBeds: 100,
            occupancy: 50,
          }),
        })
      );
    });

    it("should sync agent status", async () => {
      const callback = vi.fn();
      const subscription = createSubscription("test-agent", callback, {
        types: ["status"],
      });

      agentSyncManager.subscribe(subscription);

      await syncAgentStatus("test-agent", "active");

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "status",
          data: { status: "active" },
        })
      );
    });

    it("should sync agent data", async () => {
      const callback = vi.fn();
      const subscription = createSubscription("test-agent", callback);

      agentSyncManager.subscribe(subscription);

      await syncAgentData("test-agent", { metric: 42 });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "data",
          data: { metric: 42 },
        })
      );
    });

    it("should sync agent errors", async () => {
      const callback = vi.fn();
      const subscription = createSubscription("test-agent", callback, {
        types: ["error"],
      });

      agentSyncManager.subscribe(subscription);

      await syncAgentError("test-agent", "Something went wrong");

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          data: expect.objectContaining({
            error: "Something went wrong",
          }),
        })
      );
    });
  });

  describe("Statistics", () => {
    it("should return sync statistics", () => {
      const callback = vi.fn();
      const sub1 = createSubscription("agent-1", callback);
      const sub2 = createSubscription("agent-2", callback);

      agentSyncManager.subscribe(sub1);
      agentSyncManager.subscribe(sub2);

      agentSyncManager.setState("agent-1", { data: "test" });

      const stats = agentSyncManager.getStats();

      expect(stats.totalAgents).toBeGreaterThanOrEqual(1);
      expect(stats.totalSubscriptions).toBe(2);
      expect(stats.queueLength).toBeGreaterThanOrEqual(0);
      expect(stats.isProcessing).toBe(false);
    });
  });
});
