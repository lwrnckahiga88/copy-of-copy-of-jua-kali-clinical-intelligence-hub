import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApifyOrchestrator, JarvisRouter, IntentType } from "./jarvis";

/**
 * Unit tests for Jarvis Apify integration with mocked responses
 * These tests validate the Jarvis architecture without depending on live Apify API
 */
describe("Jarvis Apify Integration (Mocked)", () => {
  beforeEach(() => {
    ApifyOrchestrator.clearCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Apify Token Configuration", () => {
    it("should have APIFY_TOKEN configured", () => {
      const token = process.env.APIFY_TOKEN;
      expect(token).toBeDefined();
      expect(token).not.toBe("");
      expect(token?.length).toBeGreaterThan(10);
    });

    it("should have valid token format", () => {
      const token = process.env.APIFY_TOKEN;
      expect(token).toMatch(/^apify_api_[a-zA-Z0-9]+$/);
    });
  });

  describe("Jarvis Repo Sync Intent", () => {
    it("should route repo sync intent successfully", async () => {
      const intent = {
        type: IntentType.REPO_SYNC,
        payload: { owner: "lwrnckahiga88", repo: "jua.manus" },
        metadata: { timestamp: Date.now(), requestId: "repo-sync-1" },
      };

      // Mock the fetch for Apify
      const mockPages = [
        {
          name: "NurseAI",
          filename: "NurseAI.html",
          path: "client/public/NurseAI.html",
          inPlatform: true,
          pageId: "nurse-ai",
        },
        {
          name: "test-page",
          filename: "test-page.html",
          path: "client/public/test-page.html",
          inPlatform: false,
          pageId: null,
        },
      ];

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockPages,
      });

      const result = await JarvisRouter.routeIntent(intent, "user", "test-token");

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
    });

    it("should handle repo sync with authentication", async () => {
      const intent = {
        type: IntentType.REPO_SYNC,
        payload: { owner: "test", repo: "test-repo" },
        metadata: { timestamp: Date.now(), requestId: "repo-2" },
      };

      const mockPages = [
        {
          name: "test",
          filename: "test.html",
          path: "client/public/test.html",
          inPlatform: false,
          pageId: null,
        },
      ];

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockPages,
      });

      const result = await JarvisRouter.routeIntent(intent, "user", "test-token");

      // Should succeed with user role
      expect(result.success).toBe(true);
    });

    it("should deny repo sync without authentication", async () => {
      const intent = {
        type: IntentType.REPO_SYNC,
        payload: { owner: "test", repo: "test-repo" },
        metadata: { timestamp: Date.now(), requestId: "repo-3" },
      };

      const result = await JarvisRouter.routeIntent(intent);

      // Should fail without user role
      expect(result.success).toBe(false);
      expect(result.error).toContain("Authentication required");
    });
  });

  describe("Jarvis Status Check", () => {
    it("should return system status", async () => {
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
  });

  describe("Apify Orchestrator Caching", () => {
    it("should cache actor results", async () => {
      const mockData = [{ name: "test", inPlatform: true }];

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        });

      const input = { owner: "test", repo: "test" };

      // First call
      const result1 = await ApifyOrchestrator.invokeActor(
        "test-actor",
        input,
        "test-token",
        false
      );

      expect(result1).toEqual(mockData);

      // Second call should use cache (fetch should only be called once)
      const result2 = await ApifyOrchestrator.invokeActor(
        "test-actor",
        input,
        "test-token",
        false
      );

      expect(result2).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("should bypass cache with forceRefresh", async () => {
      const mockData = [{ name: "test" }];

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        });

      const input = { owner: "test", repo: "test" };

      // First call
      await ApifyOrchestrator.invokeActor(
        "test-actor",
        input,
        "test-token",
        false
      );

      // Second call with forceRefresh
      await ApifyOrchestrator.invokeActor(
        "test-actor",
        input,
        "test-token",
        true
      );

      // Both calls should hit the API
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("Error Handling", () => {
    it("should handle actor invocation errors", async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(
        new Error("Network error")
      );

      const input = { owner: "test", repo: "test" };

      try {
        await ApifyOrchestrator.invokeActor(
          "test-actor",
          input,
          "test-token",
          false
        );
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect((error as Error).message).toContain("Failed to invoke actor");
      }
    });

    it("should handle API errors gracefully", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const input = { owner: "test", repo: "test" };

      try {
        await ApifyOrchestrator.invokeActor(
          "test-actor",
          input,
          "test-token",
          false
        );
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect((error as Error).message).toContain("Apify API error");
      }
    });
  });
});
