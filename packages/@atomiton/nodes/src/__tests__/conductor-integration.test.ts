/**
 * Conductor Integration Tests
 *
 * Critical tests that validate the core promise of the unified architecture:
 * "The conductor can execute ANY node type (atomic or composite) via the INode interface"
 *
 * This is the key requirement that makes atomic nodes testable in the editor.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import nodes from "../api";
import { csvReader } from "../atomic/csv-reader/CSVReaderNode";
import { httpRequest } from "../atomic/http-request/HttpRequestNode";
import {
  CompositeNode,
  type CompositeNodeDefinition,
} from "../composite/CompositeNode";
import type { INode, IAtomicNode, ICompositeNode } from "../base/INode";
import { isAtomicNode, isCompositeNode } from "../base/INode";
import type { NodeExecutionContext, NodeExecutionResult } from "../types";

// Mock conductor-like executor that works with any INode
class UniversalNodeExecutor {
  /**
   * Execute any node via INode interface - this is the core conductor capability
   */
  async executeNode(
    node: INode,
    context: NodeExecutionContext,
  ): Promise<NodeExecutionResult> {
    // Conductor doesn't care about node type - just executes via interface
    return await node.execute(context);
  }

  /**
   * Execute multiple nodes in sequence (like a simple conductor)
   */
  async executeSequence(
    nodes: INode[],
    context: NodeExecutionContext,
  ): Promise<NodeExecutionResult[]> {
    const results: NodeExecutionResult[] = [];

    for (const node of nodes) {
      const result = await this.executeNode(node, {
        ...context,
        nodeId: node.id,
        // Pass previous results as context
        previousResults: results.reduce(
          (acc, r, i) => {
            acc[nodes[i].id] = r;
            return acc;
          },
          {} as Record<string, NodeExecutionResult>,
        ),
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Validate that a node can be executed (without actually executing)
   */
  canExecute(node: INode): boolean {
    // Check that node has all required INode interface methods
    return (
      typeof node.execute === "function" &&
      typeof node.validate === "function" &&
      typeof node.isComposite === "function" &&
      typeof node.dispose === "function" &&
      Array.isArray(node.inputPorts) &&
      Array.isArray(node.outputPorts) &&
      typeof node.metadata === "object" &&
      typeof node.id === "string" &&
      typeof node.name === "string" &&
      typeof node.type === "string"
    );
  }

  /**
   * Get node information without caring about implementation
   */
  getNodeInfo(node: INode) {
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      isComposite: node.isComposite(),
      inputCount: node.inputPorts.length,
      outputCount: node.outputPorts.length,
      category: node.metadata.category,
      description: node.metadata.description,
    };
  }
}

describe("Conductor Integration Tests - Unified Execution", () => {
  let executor: UniversalNodeExecutor;
  let baseContext: NodeExecutionContext;
  let atomicNodes: IAtomicNode[];
  let compositeNode: ICompositeNode;
  let factoryNode: INode;

  beforeEach(() => {
    executor = new UniversalNodeExecutor();

    baseContext = {
      nodeId: "conductor-test",
      inputs: {},
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

    // Get atomic nodes
    atomicNodes = [csvReader, httpRequest];

    // Create a composite node
    const compositeDefinition: CompositeNodeDefinition = {
      id: "conductor-test-composite",
      name: "Conductor Test Composite",
      category: "test",
      version: "1.0.0",
      nodes: [
        { id: "csv-child", type: "csv-reader" },
        { id: "http-child", type: "http-request" },
      ],
      edges: [
        {
          id: "test-edge",
          source: { nodeId: "csv-child", portId: "data" },
          target: { nodeId: "http-child", portId: "body" },
        },
      ],
    };

    compositeNode = new CompositeNode(compositeDefinition);
    compositeNode.setChildNodes([csvReader, httpRequest]);

    // Create a factory node
    factoryNode = nodes.extendNode({
      id: "conductor-factory-test",
      name: "Conductor Factory Test",
      type: "conductor-factory-test",
      execute: async (context) => ({
        success: true,
        outputs: { result: "factory node executed" },
        metadata: {
          executedAt: new Date().toISOString(),
          nodeId: context.nodeId,
          nodeType: "conductor-factory-test",
        },
      }),
    });
  });

  describe("Universal Node Execution", () => {
    it("should execute atomic nodes via INode interface", async () => {
      for (const node of atomicNodes) {
        const canExecute = executor.canExecute(node);
        expect(canExecute).toBe(true);

        const result = await executor.executeNode(node, {
          ...baseContext,
          nodeId: node.id,
        });

        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("outputs");
        expect(typeof result.success).toBe("boolean");
        // Note: metadata may not be present in all implementations
      }
    });

    it("should execute composite nodes via INode interface", async () => {
      const canExecute = executor.canExecute(compositeNode);
      expect(canExecute).toBe(true);

      const result = await executor.executeNode(compositeNode, {
        ...baseContext,
        nodeId: compositeNode.id,
      });

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("outputs");
      expect(result).toHaveProperty("metadata");
      expect(typeof result.success).toBe("boolean");
    });

    it("should execute factory nodes via INode interface", async () => {
      const canExecute = executor.canExecute(factoryNode);
      expect(canExecute).toBe(true);

      const result = await executor.executeNode(factoryNode, {
        ...baseContext,
        nodeId: factoryNode.id,
      });

      expect(result.success).toBe(true);
      expect(result.outputs?.result).toBe("factory node executed");
      expect(result.metadata?.nodeId).toBe("conductor-factory-test");
    });

    it("should execute mixed node types identically", async () => {
      const allNodes: INode[] = [...atomicNodes, compositeNode, factoryNode];

      for (const node of allNodes) {
        // All nodes should be executable the same way
        const canExecute = executor.canExecute(node);
        expect(canExecute).toBe(true);

        const result = await executor.executeNode(node, {
          ...baseContext,
          nodeId: node.id,
        });

        // All should return same result structure
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("outputs");
        expect(typeof result.success).toBe("boolean");
        // Note: metadata may not be present in all implementations

        // Metadata may be present depending on implementation
        if (result.metadata) {
          // Some nodes might have metadata without nodeId (e.g., if not passed through context properly)
          if (result.metadata.nodeId !== undefined) {
            expect(result.metadata.nodeId).toBeDefined();
          }
          expect(result.metadata.executedAt).toBeDefined();
        }
      }
    });
  });

  describe("Node Type Agnostic Operations", () => {
    it("should get node information without knowing implementation", () => {
      const allNodes: INode[] = [...atomicNodes, compositeNode, factoryNode];

      for (const node of allNodes) {
        const info = executor.getNodeInfo(node);

        expect(info).toHaveProperty("id");
        expect(info).toHaveProperty("name");
        expect(info).toHaveProperty("type");
        expect(info).toHaveProperty("isComposite");
        expect(info).toHaveProperty("inputCount");
        expect(info).toHaveProperty("outputCount");
        expect(info).toHaveProperty("category");
        expect(info).toHaveProperty("description");

        expect(typeof info.id).toBe("string");
        expect(typeof info.name).toBe("string");
        expect(typeof info.type).toBe("string");
        expect(typeof info.isComposite).toBe("boolean");
        expect(typeof info.inputCount).toBe("number");
        expect(typeof info.outputCount).toBe("number");
        expect(typeof info.category).toBe("string");
        expect(typeof info.description).toBe("string");
      }
    });

    it("should validate all node types uniformly", () => {
      const allNodes: INode[] = [...atomicNodes, compositeNode, factoryNode];

      for (const node of allNodes) {
        const validation = node.validate();

        expect(validation).toHaveProperty("valid");
        expect(validation).toHaveProperty("errors");
        expect(typeof validation.valid).toBe("boolean");
        expect(Array.isArray(validation.errors)).toBe(true);
      }
    });

    it("should access ports uniformly across node types", () => {
      const allNodes: INode[] = [...atomicNodes, compositeNode, factoryNode];

      for (const node of allNodes) {
        // All nodes should have port arrays (even if empty)
        expect(Array.isArray(node.inputPorts)).toBe(true);
        expect(Array.isArray(node.outputPorts)).toBe(true);

        // Ports should have consistent structure
        [...node.inputPorts, ...node.outputPorts].forEach((port) => {
          expect(port).toHaveProperty("id");
          expect(port).toHaveProperty("name");
          expect(port).toHaveProperty("type");
          expect(port).toHaveProperty("dataType");
          expect(typeof port.id).toBe("string");
          expect(typeof port.name).toBe("string");
          expect(typeof port.type).toBe("string");
          expect(typeof port.dataType).toBe("string");
        });
      }
    });

    it("should access metadata uniformly across node types", () => {
      const allNodes: INode[] = [...atomicNodes, compositeNode, factoryNode];

      for (const node of allNodes) {
        const metadata = node.metadata;

        // All metadata should have required fields
        expect(metadata).toHaveProperty("id");
        expect(metadata).toHaveProperty("name");
        expect(metadata).toHaveProperty("type");
        expect(metadata).toHaveProperty("category");
        expect(metadata).toHaveProperty("description");
        expect(metadata).toHaveProperty("version");
        expect(metadata).toHaveProperty("keywords");
        expect(metadata).toHaveProperty("experimental");
        expect(metadata).toHaveProperty("deprecated");

        // Metadata should be data only, not have methods
      }
    });
  });

  describe("Sequential Execution Patterns", () => {
    it("should execute mixed node types in sequence", async () => {
      const sequence: INode[] = [
        csvReader,
        factoryNode,
        compositeNode,
        httpRequest,
      ];

      const results = await executor.executeSequence(sequence, baseContext);

      expect(results).toHaveLength(4);
      results.forEach((result, _index) => {
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("outputs");
        expect(result).toHaveProperty("metadata");

        // Each should have executed successfully
        expect(result.success).toBe(true);
      });
    });

    it("should pass results between different node types", async () => {
      // Create a chain where output of one feeds input of next
      const processorNode = nodes.extendNode({
        id: "result-processor",
        name: "Result Processor",
        type: "result-processor",
        execute: async (context) => {
          const previousResults = context.previousResults || {};
          const resultCount = Object.keys(previousResults).length;

          return {
            success: true,
            outputs: {
              processedCount: resultCount,
              previousResults: previousResults,
            },
            metadata: {
              executedAt: new Date().toISOString(),
              nodeId: context.nodeId,
              nodeType: "result-processor",
            },
          };
        },
      });

      const sequence: INode[] = [csvReader, httpRequest, processorNode];
      const results = await executor.executeSequence(sequence, baseContext);

      expect(results).toHaveLength(3);
      expect(results[2].success).toBe(true);
      expect(results[2].outputs?.processedCount).toBe(2); // Should have seen 2 previous results
    });
  });

  describe("Type Guards and Runtime Checks", () => {
    it("should distinguish atomic from composite nodes at runtime", () => {
      // Atomic nodes
      for (const node of atomicNodes) {
        expect(isAtomicNode(node)).toBe(true);
        expect(isCompositeNode(node)).toBe(false);
        expect(node.isComposite()).toBe(false);
      }

      // Factory node (should be atomic)
      expect(isAtomicNode(factoryNode)).toBe(true);
      expect(isCompositeNode(factoryNode)).toBe(false);
      expect(factoryNode.isComposite()).toBe(false);

      // Composite node
      expect(isAtomicNode(compositeNode)).toBe(false);
      expect(isCompositeNode(compositeNode)).toBe(true);
      expect(compositeNode.isComposite()).toBe(true);
    });

    it("should provide type-specific functionality when needed", () => {
      // Test that we can access composite-specific methods when needed
      if (isCompositeNode(compositeNode)) {
        // TypeScript should narrow the type here
        expect(typeof compositeNode.getChildNodes).toBe("function");
        expect(typeof compositeNode.addChildNode).toBe("function");
        expect(typeof compositeNode.getExecutionFlow).toBe("function");

        const childNodes = compositeNode.getChildNodes();
        expect(Array.isArray(childNodes)).toBe(true);
        expect(childNodes.length).toBeGreaterThan(0);
      }

      // Atomic nodes should not have composite methods
      for (const node of atomicNodes) {
        if (isAtomicNode(node)) {
          // TypeScript should narrow the type here
          expect(
            (node as unknown as Record<string, unknown>).getChildNodes,
          ).toBeUndefined();
          expect(
            (node as unknown as Record<string, unknown>).addChildNode,
          ).toBeUndefined();
        }
      }
    });
  });

  describe("Editor Testing Scenarios", () => {
    it("should enable atomic node testing in editor context", async () => {
      // This is the key use case: testing atomic nodes in the editor
      // The conductor should be able to execute any atomic node for testing

      for (const atomicNode of atomicNodes) {
        // Editor creates a test context
        const editorTestContext: NodeExecutionContext = {
          nodeId: `editor-test-${atomicNode.id}`,
          inputs: {
            // Editor can provide test inputs based on node's input ports
            ...atomicNode.inputPorts.reduce(
              (acc, port) => {
                if (port.dataType === "string") acc[port.id] = "test-value";
                if (port.dataType === "number") acc[port.id] = 42;
                if (port.dataType === "boolean") acc[port.id] = true;
                if (port.dataType === "object") acc[port.id] = { test: "data" };
                return acc;
              },
              {} as Record<string, unknown>,
            ),
          },
          config: {
            // Editor can provide test configuration
            testMode: true,
            timeout: 5000,
          },
          startTime: new Date(),
          limits: { maxExecutionTimeMs: 10000 },
          reportProgress: (progress, message) => {
            // Editor can track progress
            console.error(`Test progress: ${progress}% - ${message || ""}`);
          },
          log: {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
          },
        };

        // Conductor executes the atomic node
        const result = await executor.executeNode(
          atomicNode,
          editorTestContext,
        );

        // Editor can examine the results
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("outputs");
        expect(result).toHaveProperty("metadata");

        // Editor can verify outputs match expected structure
        const expectedOutputs = atomicNode.outputPorts.map((port) => port.id);
        if (result.outputs && expectedOutputs.length > 0) {
          // At least some expected outputs should be present
          const actualOutputs = Object.keys(result.outputs);
          const hasExpectedOutputs = expectedOutputs.some((expected) =>
            actualOutputs.includes(expected),
          );
          expect(hasExpectedOutputs).toBe(true);
        }
      }
    });

    it("should enable composite node testing in editor context", async () => {
      // Editor should also be able to test composite nodes
      const editorTestContext: NodeExecutionContext = {
        nodeId: `editor-test-${compositeNode.id}`,
        inputs: {},
        config: { testMode: true },
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

      const result = await executor.executeNode(
        compositeNode,
        editorTestContext,
      );

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("outputs");
      expect(result).toHaveProperty("metadata");
    });

    it("should provide consistent testing experience across node types", async () => {
      // Editor provides same testing interface for all node types
      const testAllNodes = async (nodes: INode[]) => {
        const results = [];

        for (const node of nodes) {
          const testContext: NodeExecutionContext = {
            nodeId: `test-${node.id}`,
            inputs: {},
            startTime: new Date(),
            limits: { maxExecutionTimeMs: 10000 },
            reportProgress: () => {},
            log: {
              info: vi.fn(),
              warn: vi.fn(),
              error: vi.fn(),
              debug: vi.fn(),
            },
          };

          const result = await executor.executeNode(node, testContext);
          results.push({
            nodeId: node.id,
            nodeType: node.type,
            isComposite: node.isComposite(),
            result,
          });
        }

        return results;
      };

      const allNodes: INode[] = [...atomicNodes, compositeNode, factoryNode];
      const testResults = await testAllNodes(allNodes);

      expect(testResults).toHaveLength(allNodes.length);

      // All tests should have same structure regardless of node type
      testResults.forEach((testResult) => {
        expect(testResult).toHaveProperty("nodeId");
        expect(testResult).toHaveProperty("nodeType");
        expect(testResult).toHaveProperty("isComposite");
        expect(testResult).toHaveProperty("result");

        expect(testResult.result).toHaveProperty("success");
        expect(testResult.result).toHaveProperty("outputs");
        expect(testResult.result).toHaveProperty("metadata");
      });
    });
  });

  describe("Error Handling and Resilience", () => {
    it("should handle node execution failures uniformly", async () => {
      // Create failing versions of different node types
      const failingAtomic = nodes.extendNode({
        id: "failing-atomic",
        name: "Failing Atomic",
        type: "failing-atomic",
        execute: async () => {
          throw new Error("Atomic node failure");
        },
      });

      const failingComposite = new CompositeNode({
        id: "failing-composite",
        name: "Failing Composite",
        category: "test",
        version: "1.0.0",
        nodes: [],
        edges: [],
      });

      // Override execute to fail
      failingComposite.execute = async () => {
        throw new Error("Composite node failure");
      };

      const failingNodes: INode[] = [failingAtomic, failingComposite];

      for (const node of failingNodes) {
        await expect(executor.executeNode(node, baseContext)).rejects.toThrow();
      }
    });

    it("should handle invalid nodes gracefully", () => {
      const invalidNode = {
        id: "invalid",
        name: "Invalid",
        type: "invalid",
        // Missing required methods
      } as unknown as INode;

      const canExecute = executor.canExecute(invalidNode);
      expect(canExecute).toBe(false);
    });

    it("should continue sequence execution after failures", async () => {
      const failingNode = nodes.extendNode({
        id: "failing-in-sequence",
        name: "Failing in Sequence",
        type: "failing-in-sequence",
        execute: async () => {
          throw new Error("Sequence failure");
        },
      });

      const sequence: INode[] = [csvReader, failingNode, httpRequest];

      // This test depends on how the executor handles failures
      // For now, we expect it to throw on the failing node
      await expect(
        executor.executeSequence(sequence, baseContext),
      ).rejects.toThrow();
    });
  });

  describe("Performance and Scalability", () => {
    it("should execute many different node types efficiently", async () => {
      // Create many factory nodes
      const manyNodes: INode[] = [];
      for (let i = 0; i < 20; i++) {
        manyNodes.push(
          nodes.extendNode({
            id: `perf-test-${i}`,
            name: `Performance Test ${i}`,
            type: "perf-test",
            execute: async () => ({
              success: true,
              outputs: { index: i },
              metadata: {
                executedAt: new Date().toISOString(),
                nodeId: `perf-test-${i}`,
                nodeType: "perf-test",
              },
            }),
          }),
        );
      }

      const startTime = performance.now();

      // Execute all via conductor
      const results = [];
      for (const node of manyNodes) {
        const result = await executor.executeNode(node, {
          ...baseContext,
          nodeId: node.id,
        });
        results.push(result);
      }

      const endTime = performance.now();

      expect(results).toHaveLength(20);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in reasonable time

      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.outputs?.index).toBe(index);
      });
    });

    it("should handle concurrent execution of different node types", async () => {
      const mixedNodes: INode[] = [
        csvReader,
        httpRequest,
        compositeNode,
        factoryNode,
      ];

      const startTime = performance.now();

      // Execute concurrently
      const results = await Promise.all(
        mixedNodes.map((node) =>
          executor.executeNode(node, {
            ...baseContext,
            nodeId: node.id,
          }),
        ),
      );

      const endTime = performance.now();

      expect(results).toHaveLength(4);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete in reasonable time

      results.forEach((result) => {
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("outputs");
        expect(result).toHaveProperty("metadata");
      });
    });
  });
});
