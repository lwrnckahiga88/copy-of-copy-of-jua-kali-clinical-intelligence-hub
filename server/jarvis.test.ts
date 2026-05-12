import { describe, it, expect, beforeEach } from "vitest";
import { UICompiler, ApifyOrchestrator, JarvisRouter, IntentType } from "./jarvis";

describe("Jarvis Intent Routing Engine", () => {
  beforeEach(() => {
    ApifyOrchestrator.clearCache();
  });

  describe("UICompiler", () => {
    it("should allow public access to status check", () => {
      const result = UICompiler.validateAccess(IntentType.STATUS_CHECK);
      expect(result.valid).toBe(true);
    });

    it("should allow authenticated access to repo sync", () => {
      const result = UICompiler.validateAccess(IntentType.REPO_SYNC, "user");
      expect(result.valid).toBe(true);
    });

    it("should deny unauthenticated access to repo sync", () => {
      const result = UICompiler.validateAccess(IntentType.REPO_SYNC);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Authentication required");
    });

    it("should deny non-admin access to actor run", () => {
      const result = UICompiler.validateAccess(IntentType.ACTOR_RUN, "user");
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Admin access required");
    });

    it("should allow admin access to actor run", () => {
      const result = UICompiler.validateAccess(IntentType.ACTOR_RUN, "admin");
      expect(result.valid).toBe(true);
    });

    it("should compile repo sync intent correctly", () => {
      const intent = {
        type: IntentType.REPO_SYNC,
        payload: { owner: "test", repo: "test-repo" },
        metadata: { timestamp: Date.now(), requestId: "test-1" },
      };
      const compiled = UICompiler.compileIntent(intent);
      expect(compiled.owner).toBe("test");
      expect(compiled.repo).toBe("test-repo");
      expect(compiled.branch).toBe("HEAD");
    });

    it("should use defaults for repo sync intent", () => {
      const intent = {
        type: IntentType.REPO_SYNC,
        metadata: { timestamp: Date.now(), requestId: "test-2" },
      };
      const compiled = UICompiler.compileIntent(intent);
      expect(compiled.owner).toBe("lwrnckahiga88");
      expect(compiled.repo).toBe("jua.manus");
    });
  });

  describe("JarvisRouter", () => {
    it("should handle status check intent", async () => {
      const intent = {
        type: IntentType.STATUS_CHECK,
        metadata: { timestamp: Date.now(), requestId: "status-1" },
      };
      const result = await JarvisRouter.routeIntent(intent);
      expect(result.success).toBe(true);
      expect((result.data as any)?.jarvis).toBe("online");
      expect((result.data as any)?.studioOS).toBe("operational");
      expect((result.data as any)?.apify).toBe("connected");
    });

    it("should deny access to protected intents without auth", async () => {
      const intent = {
        type: IntentType.REPO_SYNC,
        metadata: { timestamp: Date.now(), requestId: "repo-1" },
      };
      const result = await JarvisRouter.routeIntent(intent);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Authentication required");
    });

    it("should deny admin intents without admin role", async () => {
      const intent = {
        type: IntentType.ACTOR_RUN,
        payload: { actorId: "test-actor" },
        metadata: { timestamp: Date.now(), requestId: "actor-1" },
      };
      const result = await JarvisRouter.routeIntent(intent, "user");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Admin access required");
    });

    it("should measure execution time", async () => {
      const intent = {
        type: IntentType.STATUS_CHECK,
        metadata: { timestamp: Date.now(), requestId: "perf-1" },
      };
      const result = await JarvisRouter.routeIntent(intent);
      expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.executedAt).toBeGreaterThan(0);
    });
  });

  describe("Apify Token Validation", () => {
    it("should validate that APIFY_TOKEN is available", () => {
      const token = process.env.APIFY_TOKEN;
      expect(token).toBeDefined();
      expect(token).not.toBe("");
      expect(token?.length).toBeGreaterThan(10); // Apify tokens are typically long
    });

    it("should have valid token format", () => {
      const token = process.env.APIFY_TOKEN;
      // Apify tokens typically start with 'apify_' or are long alphanumeric strings
      expect(token).toMatch(/^[a-zA-Z0-9_]+$/);
    });
  });
});
