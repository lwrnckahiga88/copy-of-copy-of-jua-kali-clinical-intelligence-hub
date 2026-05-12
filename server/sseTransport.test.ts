import { describe, it, expect, beforeEach, vi } from "vitest";
import { sseTransport } from "./sseTransport";
import type { Response } from "express";

describe("SSE Transport", () => {
  beforeEach(() => {
    // Clear all clients before each test
    sseTransport.disconnectAll();
  });

  describe("Client Registration", () => {
    it("should register a client", () => {
      const mockResponse = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      const unsubscribe = sseTransport.registerClient("test-agent", mockResponse);

      const stats = sseTransport.getStats();
      expect(stats.totalConnections).toBeGreaterThanOrEqual(1);
      expect(stats.agentConnections["test-agent"]).toBeGreaterThanOrEqual(1);

      unsubscribe();
    });

    it("should set correct SSE headers", () => {
      const mockResponse = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      sseTransport.registerClient("test-agent", mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "text/event-stream"
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith("Cache-Control", "no-cache");
      expect(mockResponse.setHeader).toHaveBeenCalledWith("Connection", "keep-alive");
    });

    it("should send initial connection message", () => {
      const mockResponse = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      sseTransport.registerClient("test-agent", mockResponse);

      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining("connection")
      );
    });

    it("should handle multiple clients for same agent", () => {
      const mockResponse1 = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      const mockResponse2 = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      sseTransport.registerClient("test-agent", mockResponse1);
      sseTransport.registerClient("test-agent", mockResponse2);

      const stats = sseTransport.getStats();
      expect(stats.totalConnections).toBeGreaterThanOrEqual(2);
      expect(stats.agentConnections["test-agent"]).toBeGreaterThanOrEqual(2);
    });

    it("should handle multiple agents", () => {
      const mockResponse1 = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      const mockResponse2 = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      sseTransport.registerClient("agent-1", mockResponse1);
      sseTransport.registerClient("agent-2", mockResponse2);

      const stats = sseTransport.getStats();
      expect(stats.totalConnections).toBeGreaterThanOrEqual(2);
      expect(stats.agentConnections["agent-1"]).toBeGreaterThanOrEqual(1);
      expect(stats.agentConnections["agent-2"]).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Broadcasting", () => {
    it("should broadcast updates to connected clients", () => {
      const mockResponse = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      sseTransport.registerClient("test-agent", mockResponse);

      sseTransport.broadcastUpdate({
        agentId: "test-agent",
        timestamp: Date.now(),
        type: "data",
        data: { test: "value" },
      });

      // Should have been called for initial connection + broadcast
      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining("test")
      );
    });

    it("should not broadcast to wrong agent", () => {
      const mockResponse1 = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      const mockResponse2 = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      sseTransport.registerClient("agent-1", mockResponse1);
      sseTransport.registerClient("agent-2", mockResponse2);

      const initialCalls1 = (mockResponse1.write as any).mock?.callCount || 0;
      const initialCalls2 = (mockResponse2.write as any).mock?.callCount || 0;

      sseTransport.broadcastUpdate({
        agentId: "agent-1",
        timestamp: Date.now(),
        type: "data",
        data: { test: "value" },
      });

      // Agent-1 should have received the update
      const finalCalls1 = (mockResponse1.write as any).mock?.callCount || 0;
      expect(finalCalls1).toBeGreaterThan(initialCalls1);

      // Agent-2 should not have received it (only initial connection)
      const finalCalls2 = (mockResponse2.write as any).mock?.callCount || 0;
      expect(finalCalls2).toBe(initialCalls2);
    });
  });

  describe("Disconnection", () => {
    it("should disconnect a specific client", () => {
      const mockResponse = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      const unsubscribe = sseTransport.registerClient("test-agent", mockResponse);
      unsubscribe();

      const stats = sseTransport.getStats();
      expect(stats.totalConnections).toBe(0);
    });

    it("should disconnect all clients for an agent", () => {
      const mockResponse1 = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      const mockResponse2 = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      sseTransport.registerClient("test-agent", mockResponse1);
      sseTransport.registerClient("test-agent", mockResponse2);

      sseTransport.disconnectAgent("test-agent");

      const stats = sseTransport.getStats();
      expect(stats.totalConnections).toBe(0);
      expect(stats.agentConnections["test-agent"]).toBeUndefined();
    });

    it("should disconnect all clients", () => {
      const mockResponse1 = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      const mockResponse2 = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      sseTransport.registerClient("agent-1", mockResponse1);
      sseTransport.registerClient("agent-2", mockResponse2);

      sseTransport.disconnectAll();

      const stats = sseTransport.getStats();
      expect(stats.totalConnections).toBe(0);
      expect(Object.keys(stats.agentConnections)).toHaveLength(0);
    });
  });

  describe("Statistics", () => {
    it("should return correct statistics", () => {
      const mockResponse1 = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      const mockResponse2 = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      const mockResponse3 = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      sseTransport.registerClient("agent-1", mockResponse1);
      sseTransport.registerClient("agent-1", mockResponse2);
      sseTransport.registerClient("agent-2", mockResponse3);

      const stats = sseTransport.getStats();

      expect(stats.totalConnections).toBeGreaterThanOrEqual(3);
      expect(stats.agentConnections["agent-1"]).toBeGreaterThanOrEqual(2);
      expect(stats.agentConnections["agent-2"]).toBeGreaterThanOrEqual(1);
    });

    it("should return empty statistics when no clients", () => {
      const stats = sseTransport.getStats();

      expect(stats.totalConnections).toBe(0);
      expect(Object.keys(stats.agentConnections)).toHaveLength(0);
    });
  });
});
