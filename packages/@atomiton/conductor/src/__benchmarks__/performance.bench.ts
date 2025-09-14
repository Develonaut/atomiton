/**
 * Performance Benchmarks for Conductor Package
 */

import type {
  INode,
  NodeExecutionContext,
  NodeExecutionResult,
} from "@atomiton/nodes";
import { bench, describe } from "vitest";
import { ExecutionEngine } from "../engine/executionEngine";
import type { Blueprint } from "../execution/BlueprintRunner";
import { StateManager } from "../state/stateManager";

// Mock nodes for benchmarking
function createBenchmarkNode(
  type: string,
  executionTimeMs: number = 1,
  cpuIntensive: boolean = false,
): INode {
  return {
    metadata: {
      id: type,
      name: type,
      description: `Benchmark ${type}`,
      version: "1.0.0",
      category: "benchmark",
      type,
      experimental: false,
      deprecated: false,
    },
    config: {
      getConfig: () => ({}),
      setConfig: () => {},
      validate: () => ({ valid: true, errors: [] }),
      getSchema: () => ({}),
    },
    logic: {
      execute: async () => ({ success: true, outputs: {} }),
    },
    definition: {
      id: type,
      name: type,
      category: "benchmark",
      type,
    },
    execute: async (
      _context: NodeExecutionContext,
    ): Promise<NodeExecutionResult> => {
      const startTime = Date.now();

      if (cpuIntensive) {
        // Simulate CPU-intensive work
        let _result = 0;
        const iterations = executionTimeMs * 10000;
        for (let i = 0; i < iterations; i++) {
          _result += Math.sqrt(i) * Math.random();
        }
        void _result;
      } else {
        // Simulate I/O or network delay
        await new Promise((resolve) => setTimeout(resolve, executionTimeMs));
      }

      const endTime = Date.now();

      return {
        success: true,
        outputs: {
          result: `Completed in ${endTime - startTime}ms`,
          value: Math.random(),
        },
        metadata: {
          executionTime: endTime - startTime,
        },
      };
    },
    getId: () => type,
    getName: () => type,
    getVersion: () => "1.0.0",
    isExperimental: () => false,
    isDeprecated: () => false,
    validate: () => ({ valid: true, errors: [] }),
  };
}

describe("Single Node Execution Benchmarks", () => {
  let executionEngine: ExecutionEngine;

  beforeEach(() => {
    executionEngine = new ExecutionEngine({
      enableMetrics: true,
      maxConcurrentExecutions: 8,
    });

    executionEngine.registerNode(
      "fast-node",
      createBenchmarkNode("fast-node", 1),
    );
    executionEngine.registerNode(
      "medium-node",
      createBenchmarkNode("medium-node", 10),
    );
    executionEngine.registerNode(
      "slow-node",
      createBenchmarkNode("slow-node", 50),
    );
    executionEngine.registerNode(
      "cpu-node",
      createBenchmarkNode("cpu-node", 5, true),
    );
  });

  afterEach(async () => {
    await executionEngine.shutdown();
  });

  bench("Single fast node (1ms)", async () => {
    const blueprint: Blueprint = {
      id: "single-fast",
      name: "Single Fast Node",
      nodes: [
        {
          id: "node-1",
          type: "fast-node",
          config: {},
          position: { x: 0, y: 0 },
        },
      ],
      connections: [],
    };

    await executionEngine.executeBlueprint(blueprint);
  });

  bench("Single medium node (10ms)", async () => {
    const blueprint: Blueprint = {
      id: "single-medium",
      name: "Single Medium Node",
      nodes: [
        {
          id: "node-1",
          type: "medium-node",
          config: {},
          position: { x: 0, y: 0 },
        },
      ],
      connections: [],
    };

    await executionEngine.executeBlueprint(blueprint);
  });

  bench("Single slow node (50ms)", async () => {
    const blueprint: Blueprint = {
      id: "single-slow",
      name: "Single Slow Node",
      nodes: [
        {
          id: "node-1",
          type: "slow-node",
          config: {},
          position: { x: 0, y: 0 },
        },
      ],
      connections: [],
    };

    await executionEngine.executeBlueprint(blueprint);
  });

  bench("Single CPU-intensive node", async () => {
    const blueprint: Blueprint = {
      id: "single-cpu",
      name: "Single CPU Node",
      nodes: [
        {
          id: "node-1",
          type: "cpu-node",
          config: {},
          position: { x: 0, y: 0 },
        },
      ],
      connections: [],
    };

    await executionEngine.executeBlueprint(blueprint);
  });
});

describe("Multi-Node Sequential Execution Benchmarks", () => {
  let executionEngine: ExecutionEngine;

  beforeEach(() => {
    executionEngine = new ExecutionEngine({
      enableMetrics: true,
      enableParallelExecution: false, // Force sequential
    });

    executionEngine.registerNode(
      "fast-node",
      createBenchmarkNode("fast-node", 1),
    );
    executionEngine.registerNode(
      "medium-node",
      createBenchmarkNode("medium-node", 5),
    );
  });

  afterEach(async () => {
    await executionEngine.shutdown();
  });

  bench("5 fast nodes sequential", async () => {
    const nodes = Array.from({ length: 5 }, (_, i) => ({
      id: `node-${i}`,
      type: "fast-node",
      config: {},
      position: { x: i * 100, y: 0 },
    }));

    const connections = Array.from({ length: 4 }, (_, i) => ({
      id: `conn-${i}`,
      sourceNodeId: `node-${i}`,
      sourcePort: "result",
      targetNodeId: `node-${i + 1}`,
      targetPort: "input",
    }));

    const blueprint: Blueprint = {
      id: "sequential-5",
      name: "5 Sequential Fast Nodes",
      nodes,
      connections,
    };

    await executionEngine.executeBlueprint(blueprint);
  });

  bench("10 fast nodes sequential", async () => {
    const nodes = Array.from({ length: 10 }, (_, i) => ({
      id: `node-${i}`,
      type: "fast-node",
      config: {},
      position: { x: i * 100, y: 0 },
    }));

    const connections = Array.from({ length: 9 }, (_, i) => ({
      id: `conn-${i}`,
      sourceNodeId: `node-${i}`,
      sourcePort: "result",
      targetNodeId: `node-${i + 1}`,
      targetPort: "input",
    }));

    const blueprint: Blueprint = {
      id: "sequential-10",
      name: "10 Sequential Fast Nodes",
      nodes,
      connections,
    };

    await executionEngine.executeBlueprint(blueprint);
  });

  bench("20 fast nodes sequential", async () => {
    const nodes = Array.from({ length: 20 }, (_, i) => ({
      id: `node-${i}`,
      type: "fast-node",
      config: {},
      position: { x: i * 100, y: 0 },
    }));

    const connections = Array.from({ length: 19 }, (_, i) => ({
      id: `conn-${i}`,
      sourceNodeId: `node-${i}`,
      sourcePort: "result",
      targetNodeId: `node-${i + 1}`,
      targetPort: "input",
    }));

    const blueprint: Blueprint = {
      id: "sequential-20",
      name: "20 Sequential Fast Nodes",
      nodes,
      connections,
    };

    await executionEngine.executeBlueprint(blueprint);
  });
});

describe("Multi-Node Parallel Execution Benchmarks", () => {
  let executionEngine: ExecutionEngine;

  beforeEach(() => {
    executionEngine = new ExecutionEngine({
      enableMetrics: true,
      enableParallelExecution: true,
      maxConcurrentExecutions: 10,
    });

    executionEngine.registerNode(
      "medium-node",
      createBenchmarkNode("medium-node", 10),
    );
    executionEngine.registerNode(
      "slow-node",
      createBenchmarkNode("slow-node", 25),
    );
  });

  afterEach(async () => {
    await executionEngine.shutdown();
  });

  bench("5 medium nodes parallel", async () => {
    const nodes = Array.from({ length: 5 }, (_, i) => ({
      id: `node-${i}`,
      type: "medium-node",
      config: {},
      position: { x: i * 100, y: 0 },
    }));

    const blueprint: Blueprint = {
      id: "parallel-5",
      name: "5 Parallel Medium Nodes",
      nodes,
      connections: [], // No connections = parallel execution
    };

    await executionEngine.executeBlueprint(blueprint);
  });

  bench("10 medium nodes parallel", async () => {
    const nodes = Array.from({ length: 10 }, (_, i) => ({
      id: `node-${i}`,
      type: "medium-node",
      config: {},
      position: { x: i * 100, y: 0 },
    }));

    const blueprint: Blueprint = {
      id: "parallel-10",
      name: "10 Parallel Medium Nodes",
      nodes,
      connections: [],
    };

    await executionEngine.executeBlueprint(blueprint);
  });

  bench("20 slow nodes parallel", async () => {
    const nodes = Array.from({ length: 20 }, (_, i) => ({
      id: `node-${i}`,
      type: "slow-node",
      config: {},
      position: { x: i * 100, y: 0 },
    }));

    const blueprint: Blueprint = {
      id: "parallel-20",
      name: "20 Parallel Slow Nodes",
      nodes,
      connections: [],
    };

    await executionEngine.executeBlueprint(blueprint);
  });
});

describe("Complex Workflow Pattern Benchmarks", () => {
  let executionEngine: ExecutionEngine;

  beforeEach(() => {
    executionEngine = new ExecutionEngine({
      enableMetrics: true,
      enableParallelExecution: true,
      maxConcurrentExecutions: 8,
    });

    executionEngine.registerNode(
      "fast-node",
      createBenchmarkNode("fast-node", 2),
    );
    executionEngine.registerNode(
      "medium-node",
      createBenchmarkNode("medium-node", 8),
    );
  });

  afterEach(async () => {
    await executionEngine.shutdown();
  });

  bench("Fan-out fan-in pattern (1→5→1)", async () => {
    const blueprint: Blueprint = {
      id: "fan-out-in",
      name: "Fan Out Fan In",
      nodes: [
        {
          id: "source",
          type: "fast-node",
          config: {},
          position: { x: 0, y: 100 },
        },
        {
          id: "worker-1",
          type: "medium-node",
          config: {},
          position: { x: 200, y: 0 },
        },
        {
          id: "worker-2",
          type: "medium-node",
          config: {},
          position: { x: 200, y: 50 },
        },
        {
          id: "worker-3",
          type: "medium-node",
          config: {},
          position: { x: 200, y: 100 },
        },
        {
          id: "worker-4",
          type: "medium-node",
          config: {},
          position: { x: 200, y: 150 },
        },
        {
          id: "worker-5",
          type: "medium-node",
          config: {},
          position: { x: 200, y: 200 },
        },
        {
          id: "sink",
          type: "fast-node",
          config: {},
          position: { x: 400, y: 100 },
        },
      ],
      connections: [
        // Fan out
        {
          id: "out-1",
          sourceNodeId: "source",
          sourcePort: "result",
          targetNodeId: "worker-1",
          targetPort: "input",
        },
        {
          id: "out-2",
          sourceNodeId: "source",
          sourcePort: "result",
          targetNodeId: "worker-2",
          targetPort: "input",
        },
        {
          id: "out-3",
          sourceNodeId: "source",
          sourcePort: "result",
          targetNodeId: "worker-3",
          targetPort: "input",
        },
        {
          id: "out-4",
          sourceNodeId: "source",
          sourcePort: "result",
          targetNodeId: "worker-4",
          targetPort: "input",
        },
        {
          id: "out-5",
          sourceNodeId: "source",
          sourcePort: "result",
          targetNodeId: "worker-5",
          targetPort: "input",
        },
        // Fan in
        {
          id: "in-1",
          sourceNodeId: "worker-1",
          sourcePort: "result",
          targetNodeId: "sink",
          targetPort: "input1",
        },
        {
          id: "in-2",
          sourceNodeId: "worker-2",
          sourcePort: "result",
          targetNodeId: "sink",
          targetPort: "input2",
        },
        {
          id: "in-3",
          sourceNodeId: "worker-3",
          sourcePort: "result",
          targetNodeId: "sink",
          targetPort: "input3",
        },
        {
          id: "in-4",
          sourceNodeId: "worker-4",
          sourcePort: "result",
          targetNodeId: "sink",
          targetPort: "input4",
        },
        {
          id: "in-5",
          sourceNodeId: "worker-5",
          sourcePort: "result",
          targetNodeId: "sink",
          targetPort: "input5",
        },
      ],
    };

    await executionEngine.executeBlueprint(blueprint);
  });

  bench("Diamond dependency pattern", async () => {
    const blueprint: Blueprint = {
      id: "diamond",
      name: "Diamond Pattern",
      nodes: [
        {
          id: "start",
          type: "fast-node",
          config: {},
          position: { x: 0, y: 100 },
        },
        {
          id: "left",
          type: "medium-node",
          config: {},
          position: { x: 100, y: 50 },
        },
        {
          id: "right",
          type: "medium-node",
          config: {},
          position: { x: 100, y: 150 },
        },
        {
          id: "end",
          type: "fast-node",
          config: {},
          position: { x: 200, y: 100 },
        },
      ],
      connections: [
        {
          id: "start-left",
          sourceNodeId: "start",
          sourcePort: "result",
          targetNodeId: "left",
          targetPort: "input",
        },
        {
          id: "start-right",
          sourceNodeId: "start",
          sourcePort: "result",
          targetNodeId: "right",
          targetPort: "input",
        },
        {
          id: "left-end",
          sourceNodeId: "left",
          sourcePort: "result",
          targetNodeId: "end",
          targetPort: "input1",
        },
        {
          id: "right-end",
          sourceNodeId: "right",
          sourcePort: "result",
          targetNodeId: "end",
          targetPort: "input2",
        },
      ],
    };

    await executionEngine.executeBlueprint(blueprint);
  });

  bench("Wide parallel processing (50 nodes)", async () => {
    const nodes = Array.from({ length: 50 }, (_, i) => ({
      id: `parallel-${i}`,
      type: "fast-node",
      config: {},
      position: { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 },
    }));

    const blueprint: Blueprint = {
      id: "wide-parallel",
      name: "50 Parallel Fast Nodes",
      nodes,
      connections: [],
    };

    await executionEngine.executeBlueprint(blueprint);
  });
});

describe("State Management Benchmarks", () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  afterEach(() => {
    stateManager.cleanup();
  });

  bench("Create 1000 execution contexts", () => {
    for (let i = 0; i < 1000; i++) {
      stateManager.createContext(`exec-${i}`, `blueprint-${i}`);
    }
  });

  bench("Update 1000 node states", () => {
    const executionId = "bench-exec";
    stateManager.createContext(executionId, "bench-blueprint");

    for (let i = 0; i < 1000; i++) {
      stateManager.updateNodeState(executionId, `node-${i}`, {
        state: "running",
        progress: Math.random() * 100,
        inputs: { data: `test-${i}` },
      });
    }
  });

  bench("Query active executions from 10k contexts", () => {
    // Setup: create 10k contexts with mixed states
    for (let i = 0; i < 10000; i++) {
      const executionId = `exec-${i}`;
      stateManager.createContext(executionId, `blueprint-${i}`);

      // Randomly set states
      const states = ["pending", "running", "completed", "failed"];
      const state = states[i % states.length];
      stateManager.updateContext(executionId, { state: state as unknown });
    }

    // Benchmark: query active executions
    stateManager.getActiveExecutions();
  });

  bench("Notify 100 listeners", () => {
    const executionId = "notification-test";
    stateManager.createContext(executionId, "test-blueprint");

    // Setup 100 listeners
    const listeners = Array.from({ length: 100 }, () => () => {});
    listeners.forEach((listener) => {
      stateManager.subscribe(executionId, listener);
    });

    // Benchmark: trigger notification
    stateManager.updateContext(executionId, { state: "running" });
  });
});

describe("Memory Usage Benchmarks", () => {
  let executionEngine: ExecutionEngine;

  beforeEach(() => {
    executionEngine = new ExecutionEngine({
      enableMetrics: true,
    });

    executionEngine.registerNode(
      "memory-node",
      createBenchmarkNode("memory-node", 1),
    );
  });

  afterEach(async () => {
    await executionEngine.shutdown();
  });

  bench("Memory efficiency: 100 sequential executions", async () => {
    const blueprint: Blueprint = {
      id: "memory-test",
      name: "Memory Test",
      nodes: [
        {
          id: "node-1",
          type: "memory-node",
          config: {},
          position: { x: 0, y: 0 },
        },
      ],
      connections: [],
    };

    for (let i = 0; i < 100; i++) {
      await executionEngine.executeBlueprint(blueprint);
    }
  });

  bench("Memory with large data payloads", async () => {
    // Create node that produces large output
    const largeDataNode = createBenchmarkNode("large-data", 1);
    largeDataNode.execute = async () => ({
      success: true,
      outputs: {
        data: Array.from({ length: 10000 }, (_, i) => ({
          id: i,
          value: Math.random(),
        })),
      },
    });

    executionEngine.registerNode("large-data", largeDataNode);

    const blueprint: Blueprint = {
      id: "large-data-test",
      name: "Large Data Test",
      nodes: [
        {
          id: "node-1",
          type: "large-data",
          config: {},
          position: { x: 0, y: 0 },
        },
      ],
      connections: [],
    };

    await executionEngine.executeBlueprint(blueprint);
  });
});

describe("Throughput Benchmarks", () => {
  let executionEngine: ExecutionEngine;

  beforeEach(() => {
    executionEngine = new ExecutionEngine({
      enableMetrics: true,
      maxConcurrentExecutions: 20,
    });

    executionEngine.registerNode(
      "throughput-node",
      createBenchmarkNode("throughput-node", 5),
    );
  });

  afterEach(async () => {
    await executionEngine.shutdown();
  });

  bench("High throughput: 50 concurrent simple blueprints", async () => {
    const blueprint: Blueprint = {
      id: "throughput-test",
      name: "Throughput Test",
      nodes: [
        {
          id: "node-1",
          type: "throughput-node",
          config: {},
          position: { x: 0, y: 0 },
        },
      ],
      connections: [],
    };

    const promises = Array.from({ length: 50 }, () =>
      executionEngine.executeBlueprint(blueprint),
    );

    await Promise.all(promises);
  });
});
