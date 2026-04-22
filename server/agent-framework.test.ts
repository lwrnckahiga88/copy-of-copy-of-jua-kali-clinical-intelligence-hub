import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { studioOSRegistry, getStudioOSRegistry } from "./studioOSRegistry";
import UICompiler from "./uiCompiler";
import { AgentDefinition, ComponentNode } from "@shared/agent-types";

describe("Agent Framework", () => {
  beforeEach(() => {
    studioOSRegistry.clear();
  });

  afterEach(() => {
    studioOSRegistry.clear();
  });

  describe("StudioOS Registry", () => {
    it("should register an agent", () => {
      const definition: AgentDefinition = {
        id: "test-agent",
        name: "Test Agent",
        description: "A test agent",
        version: "1.0.0",
        source: {
          type: "github",
          repository: "test/repo",
          path: "test.html",
        },
        componentGraph: {
          id: "root",
          type: "div",
          props: {},
        },
        metadata: {
          author: "test",
          tags: ["test"],
        },
        permissions: {
          requiredRole: "user",
          canAccessPatientData: false,
          canModifyRecords: false,
          canExecuteActions: true,
          allowedIntents: ["fetch_agent"],
        },
        lifecycle: {},
      };

      const entry = studioOSRegistry.registerAgent(definition);

      expect(entry.definition.id).toBe("test-agent");
      expect(entry.state.status).toBe("idle");
      expect(entry.lastSync).toBeDefined();
    });

    it("should retrieve a registered agent", () => {
      const definition: AgentDefinition = {
        id: "test-agent",
        name: "Test Agent",
        description: "A test agent",
        version: "1.0.0",
        source: { type: "github", path: "test.html" },
        componentGraph: { id: "root", type: "div", props: {} },
        metadata: {},
        permissions: {
          requiredRole: "user",
          canAccessPatientData: false,
          canModifyRecords: false,
          canExecuteActions: true,
          allowedIntents: [],
        },
        lifecycle: {},
      };

      studioOSRegistry.registerAgent(definition);
      const retrieved = studioOSRegistry.getAgent("test-agent");

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe("test-agent");
    });

    it("should update agent state", () => {
      const definition: AgentDefinition = {
        id: "test-agent",
        name: "Test Agent",
        description: "A test agent",
        version: "1.0.0",
        source: { type: "github", path: "test.html" },
        componentGraph: { id: "root", type: "div", props: {} },
        metadata: {},
        permissions: {
          requiredRole: "user",
          canAccessPatientData: false,
          canModifyRecords: false,
          canExecuteActions: true,
          allowedIntents: [],
        },
        lifecycle: {},
      };

      studioOSRegistry.registerAgent(definition);
      const updated = studioOSRegistry.updateAgentState("test-agent", {
        status: "active",
        data: { test: "value" },
      });

      expect(updated?.status).toBe("active");
      expect(updated?.data).toEqual({ test: "value" });
    });

    it("should add and retrieve agent errors", () => {
      const definition: AgentDefinition = {
        id: "test-agent",
        name: "Test Agent",
        description: "A test agent",
        version: "1.0.0",
        source: { type: "github", path: "test.html" },
        componentGraph: { id: "root", type: "div", props: {} },
        metadata: {},
        permissions: {
          requiredRole: "user",
          canAccessPatientData: false,
          canModifyRecords: false,
          canExecuteActions: true,
          allowedIntents: [],
        },
        lifecycle: {},
      };

      studioOSRegistry.registerAgent(definition);
      studioOSRegistry.addAgentError("test-agent", {
        id: "error-1",
        code: "TEST_ERROR",
        message: "Test error message",
        timestamp: Date.now(),
      });

      const state = studioOSRegistry.getAgentState("test-agent");
      expect(state?.errors).toHaveLength(1);
      expect(state?.errors[0].code).toBe("TEST_ERROR");
    });

    it("should get registry statistics", () => {
      const definition: AgentDefinition = {
        id: "test-agent",
        name: "Test Agent",
        description: "A test agent",
        version: "1.0.0",
        source: { type: "github", path: "test.html" },
        componentGraph: { id: "root", type: "div", props: {} },
        metadata: {},
        permissions: {
          requiredRole: "user",
          canAccessPatientData: false,
          canModifyRecords: false,
          canExecuteActions: true,
          allowedIntents: [],
        },
        lifecycle: {},
      };

      studioOSRegistry.registerAgent(definition);
      const stats = studioOSRegistry.getStats();

      expect(stats.totalAgents).toBe(1);
      expect(stats.activeAgents).toBe(0);
    });
  });

  describe("UI Compiler", () => {
    it("should compile simple HTML to component graph", () => {
      const html = `
        <div class="container">
          <h1>Test Title</h1>
          <p>Test content</p>
        </div>
      `;

      const result = UICompiler.compileHTML(html);

      expect(result.success).toBe(true);
      expect(result.componentGraph).toBeDefined();
      expect(result.componentGraph?.type).toBe("div");
    });

    it("should handle HTML with data attributes", () => {
      const html = `
        <div data-hooks='[{"type":"useEffect","config":{}}]'>
          <button data-actions='[{"name":"click","type":"mutation"}]'>Click me</button>
        </div>
      `;

      const result = UICompiler.compileHTML(html);

      expect(result.success).toBe(true);
      expect(result.componentGraph?.children).toBeDefined();
    });

    it("should validate component graph", () => {
      const graph: ComponentNode = {
        id: "test",
        type: "div",
        props: {},
        children: [
          {
            id: "child",
            type: "p",
            props: {},
          },
        ],
      };

      const validation = UICompiler.validate(graph);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect invalid component graph", () => {
      const graph: ComponentNode = {
        id: "",
        type: "div",
        props: {},
      };

      const validation = UICompiler.validate(graph);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it("should optimize component graph", () => {
      const graph: ComponentNode = {
        id: "test",
        type: "div",
        props: {},
        children: [
          {
            id: "empty",
            type: "span",
            props: {},
          },
          {
            id: "full",
            type: "p",
            props: { children: "content" },
          },
        ],
      };

      const optimized = UICompiler.optimize(graph);

      expect(optimized.children?.length).toBeLessThanOrEqual(
        graph.children?.length || 0
      );
    });

    it("should serialize and deserialize component graph", () => {
      const graph: ComponentNode = {
        id: "test",
        type: "div",
        props: { className: "container" },
        children: [
          {
            id: "child",
            type: "p",
            props: { children: "Hello" },
          },
        ],
      };

      const serialized = UICompiler.serialize(graph);
      const deserialized = UICompiler.deserialize(serialized);

      expect(deserialized.id).toBe(graph.id);
      expect(deserialized.type).toBe(graph.type);
      expect(deserialized.children?.length).toBe(graph.children?.length);
    });
  });

  describe("Agent Lifecycle", () => {
    it("should track agent execution count", () => {
      const definition: AgentDefinition = {
        id: "test-agent",
        name: "Test Agent",
        description: "A test agent",
        version: "1.0.0",
        source: { type: "github", path: "test.html" },
        componentGraph: { id: "root", type: "div", props: {} },
        metadata: {},
        permissions: {
          requiredRole: "user",
          canAccessPatientData: false,
          canModifyRecords: false,
          canExecuteActions: true,
          allowedIntents: [],
        },
        lifecycle: {},
      };

      studioOSRegistry.registerAgent(definition);

      let state = studioOSRegistry.getAgentState("test-agent");
      expect(state?.executionCount).toBe(0);

      studioOSRegistry.updateAgentState("test-agent", {
        executionCount: 1,
      });

      state = studioOSRegistry.getAgentState("test-agent");
      expect(state?.executionCount).toBe(1);
    });

    it("should manage agent sync status", () => {
      const definition: AgentDefinition = {
        id: "test-agent",
        name: "Test Agent",
        description: "A test agent",
        version: "1.0.0",
        source: { type: "github", path: "test.html" },
        componentGraph: { id: "root", type: "div", props: {} },
        metadata: {},
        permissions: {
          requiredRole: "user",
          canAccessPatientData: false,
          canModifyRecords: false,
          canExecuteActions: true,
          allowedIntents: [],
        },
        lifecycle: {},
      };

      studioOSRegistry.registerAgent(definition);

      const status = studioOSRegistry.getSyncStatus("test-agent");
      expect(status?.status).toBe("synced");

      studioOSRegistry.updateSyncStatus("test-agent", {
        status: "out-of-date",
      });

      const updated = studioOSRegistry.getSyncStatus("test-agent");
      expect(updated?.status).toBe("out-of-date");
    });
  });

  describe("Registry Operations", () => {
    it("should get all agents", () => {
      const def1: AgentDefinition = {
        id: "agent-1",
        name: "Agent 1",
        description: "First agent",
        version: "1.0.0",
        source: { type: "github", path: "agent1.html" },
        componentGraph: { id: "root", type: "div", props: {} },
        metadata: {},
        permissions: {
          requiredRole: "user",
          canAccessPatientData: false,
          canModifyRecords: false,
          canExecuteActions: true,
          allowedIntents: [],
        },
        lifecycle: {},
      };

      const def2: AgentDefinition = {
        id: "agent-2",
        name: "Agent 2",
        description: "Second agent",
        version: "1.0.0",
        source: { type: "github", path: "agent2.html" },
        componentGraph: { id: "root", type: "div", props: {} },
        metadata: {},
        permissions: {
          requiredRole: "user",
          canAccessPatientData: false,
          canModifyRecords: false,
          canExecuteActions: true,
          allowedIntents: [],
        },
        lifecycle: {},
      };

      studioOSRegistry.registerAgent(def1);
      studioOSRegistry.registerAgent(def2);

      const agents = studioOSRegistry.getAllAgents();
      expect(agents).toHaveLength(2);
    });

    it("should unregister an agent", () => {
      const definition: AgentDefinition = {
        id: "test-agent",
        name: "Test Agent",
        description: "A test agent",
        version: "1.0.0",
        source: { type: "github", path: "test.html" },
        componentGraph: { id: "root", type: "div", props: {} },
        metadata: {},
        permissions: {
          requiredRole: "user",
          canAccessPatientData: false,
          canModifyRecords: false,
          canExecuteActions: true,
          allowedIntents: [],
        },
        lifecycle: {},
      };

      studioOSRegistry.registerAgent(definition);
      expect(studioOSRegistry.getAgent("test-agent")).toBeDefined();

      const removed = studioOSRegistry.unregisterAgent("test-agent");
      expect(removed).toBe(true);
      expect(studioOSRegistry.getAgent("test-agent")).toBeNull();
    });
  });
});
