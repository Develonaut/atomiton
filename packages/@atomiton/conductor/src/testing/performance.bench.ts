/**
 * Performance benchmarking tests for conductor execution
 * Measures execution time, memory usage, and scalability
 */

import { bench, describe } from "vitest";
import { TestFixtureBuilder } from "#testing/fixtures";
import { createTestConductor } from "#testing/injection";
import { MockFactory } from "#testing/mocks";
import type { NodeDefinition } from "@atomiton/nodes/definitions";

/**
 * Generate a large flow for stress testing
 */
function generateLargeFlow(nodeCount: number): NodeDefinition {
  const nodes: NodeDefinition[] = [];
  const edges = [];

  for (let i = 0; i < nodeCount; i++) {
    nodes.push(
      TestFixtureBuilder.createAtomicNode({
        id: `node-${i}`,
        parentId: "large-flow",
        parameters: { index: i },
      }),
    );

    // Create edges to form a chain
    if (i > 0) {
      edges.push({
        id: `edge-${i}`,
        source: `node-${i - 1}`,
        sourcePort: "output-1",
        target: `node-${i}`,
        targetPort: "input-1",
      });
    }
  }

  return TestFixtureBuilder.createGroupNode(nodes, {
    id: "large-flow",
    edges,
  });
}

/**
 * Generate a deeply nested flow
 */
function generateDeepFlow(depth: number): NodeDefinition {
  if (depth === 0) {
    return TestFixtureBuilder.createAtomicNode({
      id: `leaf-${depth}`,
    });
  }

  const childFlow = generateDeepFlow(depth - 1);
  return TestFixtureBuilder.createGroupNode([childFlow], {
    id: `level-${depth}`,
  });
}

/**
 * Generate a wide parallel flow
 */
function generateWideParallelFlow(width: number): NodeDefinition {
  const nodes = Array.from({ length: width }, (_, i) =>
    TestFixtureBuilder.createAtomicNode({
      id: `parallel-${i}`,
      parentId: "wide-parallel",
    }),
  );

  return TestFixtureBuilder.createParallelNode(nodes, {
    id: "wide-parallel",
  });
}

describe("Performance Benchmarks", () => {
  // Setup mock dependencies for benchmarking
  const setupBenchmark = () => {
    const mocks = MockFactory.createAllMocks();
    // Disable logging for benchmarks
    mocks.logger.info = () => {};
    mocks.logger.debug = () => {};
    return createTestConductor(mocks);
  };

  describe("Sequential Execution", () => {
    bench("10 sequential nodes", async () => {
      const conductor = setupBenchmark();
      const flow = generateLargeFlow(10);
      await conductor.execute(flow);
    });

    bench("50 sequential nodes", async () => {
      const conductor = setupBenchmark();
      const flow = generateLargeFlow(50);
      await conductor.execute(flow);
    });

    bench("100 sequential nodes", async () => {
      const conductor = setupBenchmark();
      const flow = generateLargeFlow(100);
      await conductor.execute(flow);
    });

    bench("500 sequential nodes", async () => {
      const conductor = setupBenchmark();
      const flow = generateLargeFlow(500);
      await conductor.execute(flow);
    });
  });

  describe("Parallel Execution", () => {
    bench("10 parallel nodes", async () => {
      const conductor = setupBenchmark();
      const flow = generateWideParallelFlow(10);
      await conductor.execute(flow);
    });

    bench("50 parallel nodes", async () => {
      const conductor = setupBenchmark();
      const flow = generateWideParallelFlow(50);
      await conductor.execute(flow);
    });

    bench("100 parallel nodes", async () => {
      const conductor = setupBenchmark();
      const flow = generateWideParallelFlow(100);
      await conductor.execute(flow);
    });

    bench("500 parallel nodes", async () => {
      const conductor = setupBenchmark();
      const flow = generateWideParallelFlow(500);
      await conductor.execute(flow);
    });
  });

  describe("Nested Execution", () => {
    bench("5 levels deep", async () => {
      const conductor = setupBenchmark();
      const flow = generateDeepFlow(5);
      await conductor.execute(flow);
    });

    bench("10 levels deep", async () => {
      const conductor = setupBenchmark();
      const flow = generateDeepFlow(10);
      await conductor.execute(flow);
    });

    bench("20 levels deep", async () => {
      const conductor = setupBenchmark();
      const flow = generateDeepFlow(20);
      await conductor.execute(flow);
    });
  });

  describe("Graph Analysis", () => {
    bench("analyze 100 node graph", async () => {
      const flow = generateLargeFlow(100);
      const conductor = setupBenchmark();
      // Just analyze, don't execute
      const deps = conductor.getDependencies();
      deps.store.initializeGraph({
        nodes: new Map(
          flow.nodes?.map((n) => [
            n.id,
            {
              id: n.id,
              name: n.name || n.id,
              type: n.type,
              weight: 1,
              level: 0,
              dependencies: [],
              dependents: [],
              status: "pending" as const,
            },
          ]) || [],
        ),
        executionOrder: [],
        criticalPath: [],
        criticalPathWeight: 0,
        totalWeight: 0,
        maxParallelism: 0,
      });
    });

    bench("analyze 500 node graph", async () => {
      const flow = generateLargeFlow(500);
      const conductor = setupBenchmark();
      const deps = conductor.getDependencies();
      deps.store.initializeGraph({
        nodes: new Map(
          flow.nodes?.map((n) => [
            n.id,
            {
              id: n.id,
              name: n.name || n.id,
              type: n.type,
              weight: 1,
              level: 0,
              dependencies: [],
              dependents: [],
              status: "pending" as const,
            },
          ]) || [],
        ),
        executionOrder: [],
        criticalPath: [],
        criticalPathWeight: 0,
        totalWeight: 0,
        maxParallelism: 0,
      });
    });

    bench("analyze 1000 node graph", async () => {
      const flow = generateLargeFlow(1000);
      const conductor = setupBenchmark();
      const deps = conductor.getDependencies();
      deps.store.initializeGraph({
        nodes: new Map(
          flow.nodes?.map((n) => [
            n.id,
            {
              id: n.id,
              name: n.name || n.id,
              type: n.type,
              weight: 1,
              level: 0,
              dependencies: [],
              dependents: [],
              status: "pending" as const,
            },
          ]) || [],
        ),
        executionOrder: [],
        criticalPath: [],
        criticalPathWeight: 0,
        totalWeight: 0,
        maxParallelism: 0,
      });
    });
  });

  describe("Progress Updates", () => {
    bench("100 progress updates", async () => {
      const conductor = setupBenchmark();
      const deps = conductor.getDependencies();
      const { progressReporter } = deps;

      for (let i = 0; i < 100; i++) {
        progressReporter.report({
          nodeId: `node-${i}`,
          status: "executing",
          progress: i,
        });
      }
    });

    bench("1000 progress updates", async () => {
      const conductor = setupBenchmark();
      const deps = conductor.getDependencies();
      const { progressReporter } = deps;

      for (let i = 0; i < 1000; i++) {
        progressReporter.report({
          nodeId: `node-${i}`,
          status: "executing",
          progress: i / 10,
        });
      }
    });

    bench("10000 progress updates", async () => {
      const conductor = setupBenchmark();
      const deps = conductor.getDependencies();
      const { progressReporter } = deps;

      for (let i = 0; i < 10000; i++) {
        progressReporter.report({
          nodeId: `node-${i}`,
          status: "executing",
          progress: i / 100,
        });
      }
    });
  });

  describe("Context Propagation", () => {
    bench("shallow context (1 level)", async () => {
      const conductor = setupBenchmark();
      const flow = TestFixtureBuilder.createAtomicNode();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context: any = {
        nodeId: "test",
        executionId: "test",
        variables: { a: 1, b: 2, c: 3 },
      };
      await conductor.execute(flow, context);
    });

    bench("deep context (10 levels)", async () => {
      const conductor = setupBenchmark();
      const flow = generateDeepFlow(10);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context: any = {
        nodeId: "test",
        executionId: "test",
        variables: Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [`var${i}`, i]),
        ),
      };
      await conductor.execute(flow, context);
    });

    bench("wide context (100 variables)", async () => {
      const conductor = setupBenchmark();
      const flow = TestFixtureBuilder.createAtomicNode();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context: any = {
        nodeId: "test",
        executionId: "test",
        variables: Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [`var${i}`, i]),
        ),
      };
      await conductor.execute(flow, context);
    });
  });

  describe("Error Handling", () => {
    bench("handle 10 errors", async () => {
      const conductor = setupBenchmark();
      const deps = conductor.getDependencies();
      deps.debugController.configure({
        slowMo: 0,
        simulateError: true,
        simulateLongRunning: false,
        errorNodeIds: Array.from({ length: 10 }, (_, i) => `node-${i}`),
        longRunningNodeIds: [],
        longRunningDuration: 0,
      });

      const flow = generateLargeFlow(10);
      await conductor.execute(flow).catch(() => {});
    });

    bench("handle 100 errors", async () => {
      const conductor = setupBenchmark();
      const deps = conductor.getDependencies();
      deps.debugController.configure({
        slowMo: 0,
        simulateError: true,
        simulateLongRunning: false,
        errorNodeIds: Array.from({ length: 100 }, (_, i) => `node-${i}`),
        longRunningNodeIds: [],
        longRunningDuration: 0,
      });

      const flow = generateLargeFlow(100);
      await conductor.execute(flow).catch(() => {});
    });
  });

  describe("Memory Usage", () => {
    bench("memory: 1000 node execution", async () => {
      const conductor = setupBenchmark();
      const flow = generateLargeFlow(1000);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const memBefore = process.memoryUsage().heapUsed;
      await conductor.execute(flow);
      const memAfter = process.memoryUsage().heapUsed;

      // Log memory usage (for analysis)
      const memUsed = (memAfter - memBefore) / 1024 / 1024; // MB
      console.log(`Memory used: ${memUsed.toFixed(2)} MB`);
    });

    bench("memory: deep nesting (30 levels)", async () => {
      const conductor = setupBenchmark();
      const flow = generateDeepFlow(30);

      if (global.gc) {
        global.gc();
      }

      const memBefore = process.memoryUsage().heapUsed;
      await conductor.execute(flow);
      const memAfter = process.memoryUsage().heapUsed;

      const memUsed = (memAfter - memBefore) / 1024 / 1024; // MB
      console.log(`Memory used: ${memUsed.toFixed(2)} MB`);
    });
  });
});

/**
 * Performance test utilities
 */
export class PerformanceTestUtils {
  /**
   * Measure execution time
   */
  static async measureTime<T>(
    fn: () => Promise<T>,
  ): Promise<{ result: T; time: number }> {
    const start = performance.now();
    const result = await fn();
    const time = performance.now() - start;
    return { result, time };
  }

  /**
   * Measure memory usage
   */
  static async measureMemory<T>(
    fn: () => Promise<T>,
  ): Promise<{ result: T; memory: number }> {
    if (global.gc) {
      global.gc();
    }
    const memBefore = process.memoryUsage().heapUsed;
    const result = await fn();
    const memAfter = process.memoryUsage().heapUsed;
    const memory = memAfter - memBefore;
    return { result, memory };
  }

  /**
   * Run multiple iterations and calculate statistics
   */
  static async benchmark<T>(
    fn: () => Promise<T>,
    iterations = 100,
  ): Promise<{
    mean: number;
    median: number;
    min: number;
    max: number;
    stdDev: number;
  }> {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const { time } = await this.measureTime(fn);
      times.push(time);
    }

    times.sort((a, b) => a - b);

    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    const median = times[Math.floor(times.length / 2)];
    const min = times[0];
    const max = times[times.length - 1];

    const variance =
      times.reduce((acc, time) => acc + Math.pow(time - mean, 2), 0) /
      times.length;
    const stdDev = Math.sqrt(variance);

    return { mean, median, min, max, stdDev };
  }
}
