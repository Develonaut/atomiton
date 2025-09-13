/**
 * Benchmark for composite node execution performance
 */

import { describe, bench } from "vitest";
import { CompositeNode } from "../composite/CompositeNode";
import type { CompositeNodeDefinition } from "../composite/CompositeNode";
import type { NodeExecutionContext } from "../types";

// Helper to create test composites of varying sizes
function createTestComposite(nodeCount: number): CompositeNodeDefinition {
  const nodes = [];
  const edges = [];

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: `node-${i}`,
      type: "transform",
      position: { x: i * 100, y: 0 },
      config: {
        script: `return { output: input * 2 };`,
      },
    });

    // Create chain of nodes
    if (i > 0) {
      edges.push({
        id: `edge-${i}`,
        source: { nodeId: `node-${i - 1}`, portId: "output" },
        target: { nodeId: `node-${i}`, portId: "input" },
      });
    }
  }

  return {
    id: `composite-${nodeCount}`,
    name: `Test Composite ${nodeCount}`,
    category: "test",
    description: `Test composite with ${nodeCount} nodes`,
    version: "1.0.0",
    metadata: {
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
    nodes,
    edges,
  };
}

describe("Composite Execution Performance", () => {
  const mockContext: NodeExecutionContext = {
    nodeId: "test-composite",
    inputs: { input: 1 },
    config: {},
    startTime: new Date(),
    limits: { maxExecutionTimeMs: 30000 },
    reportProgress: () => {},
    log: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    },
  };

  bench("Execute composite with 10 nodes", async () => {
    const composite = new CompositeNode(createTestComposite(10));
    await composite.execute(mockContext);
  });

  bench("Execute composite with 50 nodes", async () => {
    const composite = new CompositeNode(createTestComposite(50));
    await composite.execute(mockContext);
  });

  bench("Execute composite with 100 nodes", async () => {
    const composite = new CompositeNode(createTestComposite(100));
    await composite.execute(mockContext);
  });

  bench("Validate composite with 10 nodes", () => {
    const composite = new CompositeNode(createTestComposite(10));
    composite.validate();
  });

  bench("Validate composite with 100 nodes", () => {
    const composite = new CompositeNode(createTestComposite(100));
    composite.validate();
  });

  bench("Edge traversal with 100 nodes", () => {
    const definition = createTestComposite(100);
    const edges = definition.edges;

    // Simulate edge traversal
    const adjacencyList = new Map<string, string[]>();
    for (const edge of edges) {
      const source = edge.source.nodeId;
      const target = edge.target.nodeId;
      if (!adjacencyList.has(source)) {
        adjacencyList.set(source, []);
      }
      adjacencyList.get(source)!.push(target);
    }

    // Don't return value from bench function
  });
});
