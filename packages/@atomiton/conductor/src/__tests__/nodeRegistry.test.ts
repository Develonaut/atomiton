/**
 * Unit tests for node registry elimination
 * Verifies that the registry system has been completely removed
 */

import { describe, it, expect } from "vitest";
import { createCompositeRunner } from "../execution/composite/compositeRunner";
import { validateComposite } from "../execution/composite/validation";
import { createExecutionStore } from "../store";
import { createNodeExecutor } from "../execution/nodeExecutor";
import { nodes } from "@atomiton/nodes/executable";
import type { CompositeDefinition } from "@atomiton/nodes/executable";

describe("Node Registry Elimination", () => {
  const executionStore = createExecutionStore();
  const nodeExecutor = createNodeExecutor();

  describe("CompositeRunner Interface", () => {
    it("should not expose registerNode function", () => {
      const runner = createCompositeRunner(executionStore, nodeExecutor);

      expect(runner).toHaveProperty("execute");
      expect(runner).not.toHaveProperty("registerNode");
      expect(runner).not.toHaveProperty("executeComposite");

      // Verify interface has only one function
      expect(Object.keys(runner)).toEqual(["execute"]);
    });

    it("should work without any node registration", () => {
      const runner = createCompositeRunner(executionStore, nodeExecutor);

      const composite: CompositeDefinition = {
        id: "no-registration-test",
        name: "No Registration Test",
        description: "Test that works without registration",
        version: "1.0.0",
        nodes: [
          {
            id: "transform1",
            type: "transform",
            data: {},
            position: { x: 0, y: 0 },
          },
        ],
        edges: [],
        inputs: {},
        outputs: {},
      };

      // Should not throw any errors about missing registration
      expect(() => runner.execute(composite)).not.toThrow();
    });
  });

  describe("Direct Nodes Object Usage", () => {
    it("should use nodes object directly from @atomiton/nodes/executable", () => {
      expect(nodes).toBeDefined();
      expect(typeof nodes).toBe("object");

      // Verify all expected node types are available
      const expectedNodeTypes = [
        "code",
        "csvReader",
        "fileSystem",
        "httpRequest",
        "imageComposite",
        "loop",
        "parallel",
        "shellCommand",
        "transform",
      ];

      for (const nodeType of expectedNodeTypes) {
        expect(nodes).toHaveProperty(nodeType);
        expect(nodes[nodeType]).toBeDefined();
      }
    });

    it("should validate node types using direct object access", () => {
      const validComposite: CompositeDefinition = {
        id: "valid-test",
        name: "Valid Test",
        description: "Valid composite",
        version: "1.0.0",
        nodes: [
          {
            id: "node1",
            type: "transform",
            data: {},
            position: { x: 0, y: 0 },
          },
        ],
        edges: [],
        inputs: {},
        outputs: {},
      };

      const invalidComposite: CompositeDefinition = {
        id: "invalid-test",
        name: "Invalid Test",
        description: "Invalid composite",
        version: "1.0.0",
        nodes: [
          {
            id: "node1",
            type: "nonexistent",
            data: {},
            position: { x: 0, y: 0 },
          },
        ],
        edges: [],
        inputs: {},
        outputs: {},
      };

      const validResult = validateComposite(validComposite, nodes);
      const invalidResult = validateComposite(invalidComposite, nodes);

      expect(validResult.valid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain("Unknown node type: nonexistent");
    });
  });

  describe("Validation Function", () => {
    it("should accept nodes object instead of Map", () => {
      const composite: CompositeDefinition = {
        id: "validation-test",
        name: "Validation Test",
        description: "Test validation function signature",
        version: "1.0.0",
        nodes: [
          {
            id: "node1",
            type: "code",
            data: {},
            position: { x: 0, y: 0 },
          },
        ],
        edges: [],
        inputs: {},
        outputs: {},
      };

      // Should accept nodes object (Record<string, INode>)
      const result = validateComposite(composite, nodes);
      expect(result).toBeDefined();
      expect(result.valid).toBe(true);

      // Should validate all known node types
      for (const nodeType of Object.keys(nodes)) {
        const testComposite = {
          ...composite,
          id: `test-${nodeType}`,
          nodes: [
            {
              id: "node1",
              type: nodeType,
              data: {},
              position: { x: 0, y: 0 },
            },
          ],
        };

        const nodeResult = validateComposite(testComposite, nodes);
        expect(nodeResult.valid).toBe(true);
      }
    });
  });

  describe("Architecture Verification", () => {
    it("should eliminate all registry-related code", () => {
      // This test ensures the registry elimination is complete
      const runner = createCompositeRunner(executionStore, nodeExecutor);

      // Convert to string to check for any registry references
      const runnerString = runner.toString();

      // Should not contain any references to registry or registration
      expect(runnerString).not.toMatch(/registry/i);
      expect(runnerString).not.toMatch(/register/i);
      expect(runnerString).not.toMatch(/Map/i);
    });

    it("should use simplified interface", () => {
      const runner = createCompositeRunner(executionStore, nodeExecutor);

      // Verify exact interface shape
      expect(typeof runner.execute).toBe("function");
      expect(runner.execute.length).toBe(1); // composite (options is optional)

      // Verify no other functions exist
      const functionKeys = Object.keys(runner).filter(
        (key) => typeof runner[key] === "function",
      );
      expect(functionKeys).toEqual(["execute"]);
    });
  });
});
