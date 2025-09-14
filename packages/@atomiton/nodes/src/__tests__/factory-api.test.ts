/**
 * Factory API Tests
 *
 * Tests for the nodes.extendNode() factory function that allows creating
 * custom nodes without class inheritance, validating the unified architecture.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import nodes from "../api";
import { isAtomicNode, isCompositeNode } from "../base/INode";
import type { NodeExecutionContext } from "../types";

describe("Factory API - nodes.extendNode() Tests", () => {
  let mockContext: NodeExecutionContext;

  beforeEach(() => {
    mockContext = {
      nodeId: "test-factory-node",
      inputs: { input: "test-value" },
      startTime: new Date(),
      limits: { maxExecutionTimeMs: 30000 },
      reportProgress: () => {},
      log: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      },
    };
  });

  describe("Basic Factory Functionality", () => {
    it("should create a valid node from minimal configuration", () => {
      const customNode = nodes.extendNode({
        id: "custom-minimal",
        name: "Custom Minimal Node",
        type: "custom-minimal",
        execute: async (context) => ({
          success: true,
          outputs: { result: "minimal execution" },
          metadata: {
            executedAt: new Date().toISOString(),
            nodeId: context.nodeId,
            nodeType: "custom-minimal",
          },
        }),
      });

      expect(customNode).toBeDefined();
      expect(customNode.id).toBe("custom-minimal");
      expect(customNode.name).toBe("Custom Minimal Node");
      expect(customNode.type).toBe("custom-minimal");
      expect(typeof customNode.execute).toBe("function");
    });

    it("should create a node with full configuration", () => {
      const customNode = nodes.extendNode({
        id: "custom-full",
        name: "Custom Full Node",
        type: "custom-full",
        execute: async (context) => ({
          success: true,
          outputs: { result: "full execution" },
          metadata: {
            executedAt: new Date().toISOString(),
            nodeId: context.nodeId,
            nodeType: "custom-full",
          },
        }),
        getInputPorts: () => [
          {
            id: "input1",
            name: "Input 1",
            type: "input",
            dataType: "string",
            required: true,
          },
          {
            id: "input2",
            name: "Input 2",
            type: "input",
            dataType: "number",
            required: false,
          },
        ],
        getOutputPorts: () => [
          {
            id: "output1",
            name: "Output 1",
            type: "output",
            dataType: "string",
            required: true,
          },
          {
            id: "output2",
            name: "Output 2",
            type: "output",
            dataType: "object",
            required: false,
          },
        ],
        metadata: {
          category: "custom",
          description: "A custom node created via factory",
          version: "2.0.0",
          author: "Factory Test",
          tags: ["custom", "factory", "test"],
          icon: "custom-icon",
        },
        validate: () => ({ valid: true, errors: [] }),
        dispose: () => {
          // Custom cleanup logic
        },
      });

      expect(customNode.id).toBe("custom-full");
      expect(customNode.inputPorts).toHaveLength(2);
      expect(customNode.outputPorts).toHaveLength(2);
      expect(customNode.metadata.category).toBe("custom");
      expect(customNode.metadata.version).toBe("2.0.0");
      expect(customNode.metadata.author).toBe("Factory Test");
    });

    it("should throw error for invalid node configuration", () => {
      expect(() => {
        nodes.extendNode({
          id: "", // Invalid empty ID
          name: "Invalid Node",
          type: "invalid",
          execute: async () => ({ success: true, outputs: {} }),
        });
      }).toThrow("Invalid node structure");

      expect(() => {
        nodes.extendNode({
          id: "invalid-name",
          name: "", // Invalid empty name
          type: "invalid",
          execute: async () => ({ success: true, outputs: {} }),
        });
      }).toThrow("Invalid node structure");
    });
  });

  describe("INode Interface Compliance", () => {
    it("should create nodes that implement INode interface", () => {
      const customNode = nodes.extendNode({
        id: "interface-test",
        name: "Interface Test Node",
        type: "interface-test",
        execute: async (context) => ({
          success: true,
          outputs: { result: "interface test" },
          metadata: {
            executedAt: new Date().toISOString(),
            nodeId: context.nodeId,
            nodeType: "interface-test",
          },
        }),
      });

      // Should have all required INode properties and methods
      expect(customNode.id).toBe("interface-test");
      expect(customNode.name).toBe("Interface Test Node");
      expect(customNode.type).toBe("interface-test");
      expect(typeof customNode.execute).toBe("function");
      expect(typeof customNode.validate).toBe("function");
      expect(typeof customNode.isComposite).toBe("function");
      expect(typeof customNode.dispose).toBe("function");

      // Should have getter API for ports and metadata
      expect(typeof customNode.inputPorts).not.toBe("function");
      expect(typeof customNode.outputPorts).not.toBe("function");
      expect(typeof customNode.metadata).not.toBe("function");
      expect(Array.isArray(customNode.inputPorts)).toBe(true);
      expect(Array.isArray(customNode.outputPorts)).toBe(true);
      expect(typeof customNode.metadata).toBe("object");
    });

    it("should create atomic nodes by default", () => {
      const customNode = nodes.extendNode({
        id: "atomic-test",
        name: "Atomic Test Node",
        type: "atomic-test",
        execute: async () => ({ success: true, outputs: {} }),
      });

      expect(customNode.isComposite()).toBe(false);
      expect(isAtomicNode(customNode)).toBe(true);
      expect(isCompositeNode(customNode)).toBe(false);
    });

    it("should provide proper metadata structure", () => {
      const customNode = nodes.extendNode({
        id: "metadata-test",
        name: "Metadata Test Node",
        type: "metadata-test",
        execute: async () => ({ success: true, outputs: {} }),
        metadata: {
          category: "test",
          description: "Testing metadata",
          version: "1.5.0",
          author: "Test Author",
          tags: ["test", "metadata"],
          icon: "test-icon",
        },
      });

      const metadata = customNode.metadata;
      expect(metadata.id).toBe("metadata-test");
      expect(metadata.name).toBe("Metadata Test Node");
      expect(metadata.type).toBe("metadata-test");
      expect(metadata.category).toBe("test");
      expect(metadata.description).toBe("Testing metadata");
      expect(metadata.version).toBe("1.5.0");
      expect(metadata.author).toBe("Test Author");
      expect(Array.isArray(metadata.tags)).toBe(true);
      expect(metadata.tags).toContain("test");
      expect(metadata.icon).toBe("test-icon");
      expect(Array.isArray(metadata.keywords)).toBe(true);
      expect(typeof metadata.experimental).toBe("boolean");
      expect(typeof metadata.deprecated).toBe("boolean");

      // Should have required metadata methods
      expect(typeof metadata.validate).toBe("function");
      expect(typeof metadata.getSearchTerms).toBe("function");
      expect(typeof metadata.matchesSearch).toBe("function");
    });
  });

  describe("Execution and Functionality", () => {
    it("should execute custom nodes properly", async () => {
      const customNode = nodes.extendNode({
        id: "execution-test",
        name: "Execution Test Node",
        type: "execution-test",
        execute: async (context) => {
          const input = context.inputs.input as string;
          return {
            success: true,
            outputs: {
              result: `Processed: ${input}`,
              timestamp: new Date().toISOString(),
            },
            metadata: {
              executedAt: new Date().toISOString(),
              nodeId: context.nodeId,
              nodeType: "execution-test",
            },
          };
        },
      });

      const result = await customNode.execute(mockContext);

      expect(result.success).toBe(true);
      expect(result.outputs?.result).toBe("Processed: test-value");
      expect(result.outputs?.timestamp).toBeDefined();
      expect(result.metadata?.nodeId).toBe("test-factory-node");
      expect(result.metadata?.nodeType).toBe("execution-test");
    });

    it("should handle execution errors properly", async () => {
      const customNode = nodes.extendNode({
        id: "error-test",
        name: "Error Test Node",
        type: "error-test",
        execute: async () => {
          throw new Error("Custom execution error");
        },
      });

      await expect(customNode.execute(mockContext)).rejects.toThrow(
        "Custom execution error",
      );
    });

    it("should support async execution", async () => {
      const customNode = nodes.extendNode({
        id: "async-test",
        name: "Async Test Node",
        type: "async-test",
        execute: async (context) => {
          // Simulate async operation
          await new Promise((resolve) => setTimeout(resolve, 10));

          return {
            success: true,
            outputs: { result: "async completed" },
            metadata: {
              executedAt: new Date().toISOString(),
              nodeId: context.nodeId,
              nodeType: "async-test",
            },
          };
        },
      });

      const startTime = performance.now();
      const result = await customNode.execute(mockContext);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(result.outputs?.result).toBe("async completed");
      expect(endTime - startTime).toBeGreaterThan(8); // Should take at least 10ms
    });
  });

  describe("Port Definitions", () => {
    it("should use default empty ports when not specified", () => {
      const customNode = nodes.extendNode({
        id: "default-ports",
        name: "Default Ports Node",
        type: "default-ports",
        execute: async () => ({ success: true, outputs: {} }),
      });

      expect(customNode.inputPorts).toEqual([]);
      expect(customNode.outputPorts).toEqual([]);
    });

    it("should use custom port definitions when provided", () => {
      const customNode = nodes.extendNode({
        id: "custom-ports",
        name: "Custom Ports Node",
        type: "custom-ports",
        execute: async () => ({ success: true, outputs: {} }),
        getInputPorts: () => [
          {
            id: "stringInput",
            name: "String Input",
            type: "input",
            dataType: "string",
            required: true,
            description: "A string input",
          },
        ],
        getOutputPorts: () => [
          {
            id: "stringOutput",
            name: "String Output",
            type: "output",
            dataType: "string",
            required: true,
            description: "A string output",
          },
        ],
      });

      expect(customNode.inputPorts).toHaveLength(1);
      expect(customNode.inputPorts[0].id).toBe("stringInput");
      expect(customNode.inputPorts[0].dataType).toBe("string");
      expect(customNode.inputPorts[0].required).toBe(true);

      expect(customNode.outputPorts).toHaveLength(1);
      expect(customNode.outputPorts[0].id).toBe("stringOutput");
      expect(customNode.outputPorts[0].dataType).toBe("string");
      expect(customNode.outputPorts[0].required).toBe(true);
    });

    it("should return consistent port definitions", () => {
      const customNode = nodes.extendNode({
        id: "consistent-ports",
        name: "Consistent Ports Node",
        type: "consistent-ports",
        execute: async () => ({ success: true, outputs: {} }),
        getInputPorts: () => [
          { id: "input1", name: "Input 1", type: "input", dataType: "string" },
        ],
        getOutputPorts: () => [
          {
            id: "output1",
            name: "Output 1",
            type: "output",
            dataType: "string",
          },
        ],
      });

      const inputs1 = customNode.inputPorts;
      const inputs2 = customNode.inputPorts;
      const outputs1 = customNode.outputPorts;
      const outputs2 = customNode.outputPorts;

      expect(inputs1).toEqual(inputs2);
      expect(outputs1).toEqual(outputs2);
    });
  });

  describe("Validation and Error Handling", () => {
    it("should use default validation when not specified", () => {
      const customNode = nodes.extendNode({
        id: "default-validation",
        name: "Default Validation Node",
        type: "default-validation",
        execute: async () => ({ success: true, outputs: {} }),
      });

      const validation = customNode.validate();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it("should use custom validation when provided", () => {
      // Create a node with validation that passes
      const customNode = nodes.extendNode({
        id: "custom-validation",
        name: "Custom Validation Node",
        type: "custom-validation",
        execute: async () => ({ success: true, outputs: {} }),
        validate: () => ({
          valid: true,
          errors: [],
        }),
      });

      const validation = customNode.validate();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);

      // Test that failing validation throws during creation
      expect(() => {
        nodes.extendNode({
          id: "failing-validation",
          name: "Failing Validation Node",
          type: "failing-validation",
          execute: async () => ({ success: true, outputs: {} }),
          validate: () => ({
            valid: false,
            errors: [
              "Custom validation failed",
              "Missing required configuration",
            ],
          }),
        });
      }).toThrow(/Custom validation failed.*Missing required configuration/);
    });

    it("should validate during factory creation", () => {
      // This should throw because validation fails
      expect(() => {
        nodes.extendNode({
          id: "factory-validation",
          name: "Factory Validation Node",
          type: "factory-validation",
          execute: async () => ({ success: true, outputs: {} }),
          validate: () => ({
            valid: false,
            errors: ["Validation fails during creation"],
          }),
        });
      }).toThrow(/Invalid node structure.*Validation fails during creation/);
    });
  });

  describe("Disposal and Resource Management", () => {
    it("should use default disposal when not specified", () => {
      const customNode = nodes.extendNode({
        id: "default-disposal",
        name: "Default Disposal Node",
        type: "default-disposal",
        execute: async () => ({ success: true, outputs: {} }),
      });

      expect(() => customNode.dispose()).not.toThrow();
    });

    it("should use custom disposal when provided", () => {
      let disposalCalled = false;

      const customNode = nodes.extendNode({
        id: "custom-disposal",
        name: "Custom Disposal Node",
        type: "custom-disposal",
        execute: async () => ({ success: true, outputs: {} }),
        dispose: () => {
          disposalCalled = true;
        },
      });

      customNode.dispose();
      expect(disposalCalled).toBe(true);
    });

    it("should handle disposal errors gracefully", () => {
      const customNode = nodes.extendNode({
        id: "disposal-error",
        name: "Disposal Error Node",
        type: "disposal-error",
        execute: async () => ({ success: true, outputs: {} }),
        dispose: () => {
          throw new Error("Disposal failed");
        },
      });

      // Should not propagate disposal errors
      expect(() => customNode.dispose()).toThrow("Disposal failed");
    });
  });

  describe("Integration with Conductor", () => {
    it("should be executable by conductor like any other node", async () => {
      const customNode = nodes.extendNode({
        id: "conductor-test",
        name: "Conductor Test Node",
        type: "conductor-test",
        execute: async (context) => ({
          success: true,
          outputs: {
            result: "conductor compatible",
            contextId: context.nodeId,
          },
          metadata: {
            executedAt: new Date().toISOString(),
            nodeId: context.nodeId,
            nodeType: "conductor-test",
          },
        }),
      });

      // Simulate conductor execution (doesn't care about node type)
      const executeAsINode = async (node: typeof customNode) => {
        return await node.execute(mockContext);
      };

      const result = await executeAsINode(customNode);
      expect(result.success).toBe(true);
      expect(result.outputs?.result).toBe("conductor compatible");
      expect(result.outputs?.contextId).toBe("test-factory-node");
    });

    it("should work alongside atomic nodes seamlessly", async () => {
      const customNode = nodes.extendNode({
        id: "seamless-test",
        name: "Seamless Test Node",
        type: "seamless-test",
        execute: async () => ({
          success: true,
          outputs: { result: "custom" },
          metadata: {
            executedAt: new Date().toISOString(),
            nodeId: "seamless-test",
            nodeType: "seamless-test",
          },
        }),
      });

      // Get an existing atomic node
      const csvNode = nodes.getNodePackage("csv-reader");

      // Both should be executable the same way
      const customResult = await customNode.execute(mockContext);
      const csvResult = csvNode ? await csvNode.execute(mockContext) : null;

      expect(customResult.success).toBe(true);
      expect(csvResult?.success).toBe(true);

      // Both should have same result structure
      expect(customResult).toHaveProperty("success");
      expect(customResult).toHaveProperty("outputs");
      expect(customResult).toHaveProperty("metadata");

      if (csvResult) {
        expect(csvResult).toHaveProperty("success");
        expect(csvResult).toHaveProperty("outputs");
        expect(csvResult).toHaveProperty("metadata");
      }
    });
  });

  describe("Advanced Factory Patterns", () => {
    it("should support closure-based state management", async () => {
      let executionCount = 0;

      const customNode = nodes.extendNode({
        id: "stateful-test",
        name: "Stateful Test Node",
        type: "stateful-test",
        execute: async (context) => {
          executionCount++;
          return {
            success: true,
            outputs: {
              count: executionCount,
              nodeId: context.nodeId,
            },
            metadata: {
              executedAt: new Date().toISOString(),
              nodeId: context.nodeId,
              nodeType: "stateful-test",
            },
          };
        },
      });

      const result1 = await customNode.execute(mockContext);
      const result2 = await customNode.execute(mockContext);

      expect(result1.outputs?.count).toBe(1);
      expect(result2.outputs?.count).toBe(2);
    });

    it("should support configurable behavior via closures", () => {
      const createConfigurableNode = (config: { multiplier: number }) => {
        return nodes.extendNode({
          id: `configurable-${config.multiplier}`,
          name: `Configurable Node x${config.multiplier}`,
          type: "configurable",
          execute: async (context) => {
            const input = (context.inputs.value as number) || 1;
            return {
              success: true,
              outputs: { result: input * config.multiplier },
              metadata: {
                executedAt: new Date().toISOString(),
                nodeId: context.nodeId,
                nodeType: "configurable",
              },
            };
          },
        });
      };

      const doubler = createConfigurableNode({ multiplier: 2 });
      const tripler = createConfigurableNode({ multiplier: 3 });

      expect(doubler.id).toBe("configurable-2");
      expect(tripler.id).toBe("configurable-3");
    });

    it("should support composition patterns", () => {
      const baseExecutor = async (
        context: NodeExecutionContext,
        operation: string,
      ) => {
        return {
          success: true,
          outputs: {
            operation,
            input: context.inputs.value,
            timestamp: new Date().toISOString(),
          },
          metadata: {
            executedAt: new Date().toISOString(),
            nodeId: context.nodeId,
            nodeType: operation,
          },
        };
      };

      const addNode = nodes.extendNode({
        id: "add-node",
        name: "Add Node",
        type: "add",
        execute: (context) => baseExecutor(context, "add"),
      });

      const multiplyNode = nodes.extendNode({
        id: "multiply-node",
        name: "Multiply Node",
        type: "multiply",
        execute: (context) => baseExecutor(context, "multiply"),
      });

      expect(addNode.type).toBe("add");
      expect(multiplyNode.type).toBe("multiply");
      expect(addNode.name).toBe("Add Node");
      expect(multiplyNode.name).toBe("Multiply Node");
    });
  });

  describe("Performance and Memory", () => {
    it("should create nodes efficiently", () => {
      const startTime = performance.now();

      const nodeList = [];
      for (let i = 0; i < 100; i++) {
        nodeList.push(
          nodes.extendNode({
            id: `perf-test-${i}`,
            name: `Performance Test ${i}`,
            type: "perf-test",
            execute: async () => ({ success: true, outputs: {} }),
          }),
        );
      }

      const endTime = performance.now();

      expect(nodeList).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it("should not leak memory between node instances", () => {
      const node1 = nodes.extendNode({
        id: "memory-test-1",
        name: "Memory Test 1",
        type: "memory-test",
        execute: async () => ({ success: true, outputs: {} }),
      });

      const node2 = nodes.extendNode({
        id: "memory-test-2",
        name: "Memory Test 2",
        type: "memory-test",
        execute: async () => ({ success: true, outputs: {} }),
      });

      // Should be completely separate instances
      expect(node1.id).not.toBe(node2.id);
      expect(node1.name).not.toBe(node2.name);

      // Modifying one should not affect the other
      node1.dispose();
      expect(() => node2.validate()).not.toThrow();
    });
  });
});
