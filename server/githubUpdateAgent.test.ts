import { describe, it, expect, beforeEach, vi } from "vitest";
import { JarvisPatchEngine } from "./jarvisPatchEngine";
import type { JarvisIntent } from "./jarvisPatchEngine";

describe("GitHub Update Agent System", () => {
  describe("Jarvis Patch Engine", () => {
    describe("generatePatch", () => {
      it("should generate patch for adding an agent", () => {
        const intent: JarvisIntent = {
          type: "add-agent",
          agentId: "test-agent",
          payload: {
            name: "Test Agent",
            description: "A test agent",
            category: "clinical",
            tags: ["test", "clinical"],
          },
        };

        const result = JarvisPatchEngine.generatePatch(intent);

        expect(result.changes).toHaveLength(2);
        expect(result.changes[0]?.path).toBe("/server/agents/test-agent/definition.json");
        expect(result.changes[1]?.path).toBe("/server/agents/test-agent/index.ts");
        expect(result.summary).toContain("Test Agent");
        expect(result.requiresApproval).toBe(false);
      });

      it("should generate patch for updating an agent", () => {
        const intent: JarvisIntent = {
          type: "update-agent",
          agentId: "existing-agent",
          payload: {
            name: "Updated Agent",
            version: "2.0.0",
          },
        };

        const result = JarvisPatchEngine.generatePatch(intent);

        expect(result.changes).toHaveLength(1);
        expect(result.changes[0]?.path).toBe("/server/agents/existing-agent/definition.json");
        expect(result.requiresApproval).toBe(true);
      });

      it("should generate patch for updating router", () => {
        const intent: JarvisIntent = {
          type: "update-router",
          payload: {
            newCode: "export const newRouter = router({...});",
          },
        };

        const result = JarvisPatchEngine.generatePatch(intent);

        expect(result.changes).toHaveLength(1);
        expect(result.changes[0]?.path).toBe("/server/routers.ts");
        expect(result.requiresApproval).toBe(true);
        expect(result.estimatedImpact).toContain("high");
      });

      it("should generate patch for adding a hospital", () => {
        const intent: JarvisIntent = {
          type: "add-hospital",
          payload: {
            id: "hospital-001",
            name: "Test Hospital",
            specialty: "cardiology",
            capacity: 200,
          },
        };

        const result = JarvisPatchEngine.generatePatch(intent);

        expect(result.changes).toHaveLength(1);
        expect(result.changes[0]?.path).toContain("/data/hospitals/");
        expect(result.requiresApproval).toBe(false);
      });

      it("should generate patch for adding a hook", () => {
        const intent: JarvisIntent = {
          type: "add-hook",
          payload: {
            name: "usePatientData",
          },
        };

        const result = JarvisPatchEngine.generatePatch(intent);

        expect(result.changes).toHaveLength(1);
        expect(result.changes[0]?.path).toContain("usePatientData");
        expect(result.requiresApproval).toBe(false);
      });

      it("should handle unknown intent type", () => {
        const intent: JarvisIntent = {
          type: "unknown-type",
          payload: {},
        };

        const result = JarvisPatchEngine.generatePatch(intent);

        expect(result.changes).toHaveLength(0);
        expect(result.summary).toContain("Unknown");
      });
    });

    describe("Patch Safety Rules", () => {
      it("should mark critical file modifications as requiring approval", () => {
        const intent: JarvisIntent = {
          type: "update-schema",
          payload: {
            schemaCode: "export const newSchema = ...",
          },
        };

        const result = JarvisPatchEngine.generatePatch(intent);

        expect(result.requiresApproval).toBe(true);
        expect(result.estimatedImpact).toContain("critical");
      });

      it("should mark router updates as requiring approval", () => {
        const intent: JarvisIntent = {
          type: "update-router",
          payload: {
            newCode: "...",
          },
        };

        const result = JarvisPatchEngine.generatePatch(intent);

        expect(result.requiresApproval).toBe(true);
        expect(result.estimatedImpact).toContain("high");
      });

      it("should mark agent updates as requiring approval", () => {
        const intent: JarvisIntent = {
          type: "update-agent",
          agentId: "test-agent",
          payload: {
            name: "Updated",
          },
        };

        const result = JarvisPatchEngine.generatePatch(intent);

        expect(result.requiresApproval).toBe(true);
      });

      it("should not require approval for adding new agents", () => {
        const intent: JarvisIntent = {
          type: "add-agent",
          agentId: "new-agent",
          payload: {
            name: "New Agent",
          },
        };

        const result = JarvisPatchEngine.generatePatch(intent);

        expect(result.requiresApproval).toBe(false);
      });
    });

    describe("Generated Code Quality", () => {
      it("should generate valid TypeScript for new agents", () => {
        const intent: JarvisIntent = {
          type: "add-agent",
          agentId: "quality-test",
          payload: {
            name: "Quality Test Agent",
            description: "Testing code generation",
          },
        };

        const result = JarvisPatchEngine.generatePatch(intent);
        const agentCode = result.changes[1]?.content;

        expect(agentCode).toContain("import");
        expect(agentCode).toContain("export");
        expect(agentCode).toContain("async function");
        expect(agentCode).toContain("AgentDefinition");
      });

      it("should generate valid JSON for definitions", () => {
        const intent: JarvisIntent = {
          type: "add-agent",
          agentId: "json-test",
          payload: {
            name: "JSON Test",
          },
        };

        const result = JarvisPatchEngine.generatePatch(intent);
        const definition = result.changes[0]?.content;

        expect(() => JSON.parse(definition || "")).not.toThrow();
      });

      it("should include proper metadata in generated files", () => {
        const intent: JarvisIntent = {
          type: "add-agent",
          agentId: "metadata-test",
          payload: {
            name: "Metadata Test",
            tags: ["test", "metadata"],
          },
        };

        const result = JarvisPatchEngine.generatePatch(intent);
        const definition = JSON.parse(result.changes[0]?.content || "{}");

        expect(definition.id).toBe("metadata-test");
        expect(definition.name).toBe("Metadata Test");
        expect(definition.version).toBe("1.0.0");
        expect(definition.metadata.author).toBe("Jarvis");
      });
    });

    describe("Impact Assessment", () => {
      it("should assess low impact for new files", () => {
        const intent: JarvisIntent = {
          type: "add-agent",
          agentId: "low-impact",
          payload: {
            name: "Low Impact Agent",
          },
        };

        const result = JarvisPatchEngine.generatePatch(intent);

        expect(result.estimatedImpact).toContain("low");
      });

      it("should assess medium impact for agent updates", () => {
        const intent: JarvisIntent = {
          type: "update-agent",
          agentId: "medium-impact",
          payload: {
            name: "Updated",
          },
        };

        const result = JarvisPatchEngine.generatePatch(intent);

        expect(result.estimatedImpact).toContain("medium");
      });

      it("should assess high impact for router changes", () => {
        const intent: JarvisIntent = {
          type: "update-router",
          payload: {
            newCode: "...",
          },
        };

        const result = JarvisPatchEngine.generatePatch(intent);

        expect(result.estimatedImpact).toContain("high");
      });

      it("should assess critical impact for schema changes", () => {
        const intent: JarvisIntent = {
          type: "update-schema",
          payload: {
            schemaCode: "...",
          },
        };

        const result = JarvisPatchEngine.generatePatch(intent);

        expect(result.estimatedImpact).toContain("critical");
      });
    });
  });

  describe("Safety Configuration", () => {
    it("should define allowed paths", () => {
      // This test verifies the safety configuration exists
      const intent: JarvisIntent = {
        type: "add-agent",
        agentId: "safety-test",
        payload: {
          name: "Safety Test",
        },
      };

      const result = JarvisPatchEngine.generatePatch(intent);

      // Should generate changes for allowed paths
      expect(result.changes.length).toBeGreaterThan(0);
      expect(result.changes[0]?.path).toContain("/server/agents");
    });

    it("should generate summaries for all operations", () => {
      const intents: JarvisIntent[] = [
        {
          type: "add-agent",
          agentId: "test1",
          payload: { name: "Test 1" },
        },
        {
          type: "update-agent",
          agentId: "test2",
          payload: { name: "Test 2" },
        },
        {
          type: "add-hospital",
          payload: { name: "Hospital" },
        },
      ];

      intents.forEach((intent) => {
        const result = JarvisPatchEngine.generatePatch(intent);
        expect(result.summary).toBeTruthy();
        expect(result.summary.length).toBeGreaterThan(0);
      });
    });
  });
});
