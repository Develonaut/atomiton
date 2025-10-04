import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import type {
  ExecutionGraphState,
  NodeExecutionState,
} from "#execution/executionGraphStore.js";

/**
 * Test fixtures factory for creating mock data
 * Following TEST_SUITE_OPTIMIZATION_STRATEGY.md recommendation to reduce code duplication
 */

export type MockNodeOptions = {
  id?: string;
  name?: string;
  type?: string;
  weight?: number;
  dependencies?: string[];
  dependents?: string[];
  level?: number;
  state?: NodeExecutionState;
  startTime?: number;
  endTime?: number;
  error?: string;
};

export type MockGraphStateOptions = {
  nodes?: Map<string, ReturnType<typeof createMockNode>>;
  edges?: Array<{ from: string; to: string }>;
  executionOrder?: string[][];
  criticalPath?: string[];
  totalWeight?: number;
  maxParallelism?: number;
  isExecuting?: boolean;
  startTime?: number;
  endTime?: number | null;
};

/**
 * Create a mock node with sensible defaults
 */
export const createMockNode = (options: MockNodeOptions = {}) => ({
  id: options.id || "mock-node",
  name: options.name || "Mock Node",
  type: options.type || "test",
  weight: options.weight ?? 100,
  dependencies: options.dependencies || [],
  dependents: options.dependents || [],
  level: options.level ?? 0,
  state: options.state || "pending",
  startTime: options.startTime,
  endTime: options.endTime,
  error: options.error,
});

/**
 * Create a mock execution graph state with sensible defaults
 */
export const createMockGraphState = (
  options: MockGraphStateOptions = {},
): ExecutionGraphState => ({
  nodes: options.nodes || new Map(),
  edges: options.edges || [],
  executionOrder: options.executionOrder || [],
  criticalPath: options.criticalPath || [],
  totalWeight: options.totalWeight ?? 0,
  maxParallelism: options.maxParallelism ?? 1,
  isExecuting: options.isExecuting ?? false,
  startTime: options.startTime ?? Date.now(),
  endTime: options.endTime ?? null,
  cachedProgress: 0,
});

/**
 * Create a simple two-node graph for testing
 */
export const createSimpleTwoNodeGraph = (): ExecutionGraphState => {
  const node1 = createMockNode({
    id: "node-1",
    name: "Node 1",
    state: "completed",
    startTime: Date.now() - 1000,
    endTime: Date.now(),
  });

  const node2 = createMockNode({
    id: "node-2",
    name: "Node 2",
    dependencies: ["node-1"],
    dependents: [],
    level: 1,
    state: "executing",
    startTime: Date.now(),
  });

  return createMockGraphState({
    nodes: new Map([
      ["node-1", node1],
      ["node-2", node2],
    ]),
    edges: [{ from: "node-1", to: "node-2" }],
    executionOrder: [["node-1"], ["node-2"]],
    criticalPath: ["node-1", "node-2"],
    totalWeight: 200,
    maxParallelism: 1,
    isExecuting: true,
  });
};

/**
 * Create a complex parallel graph for testing
 */
export const createComplexParallelGraph = (): ExecutionGraphState => {
  const n1 = createMockNode({
    id: "n1",
    name: "Node 1",
    dependents: ["n2", "n3"],
    state: "completed",
    startTime: Date.now() - 2000,
    endTime: Date.now() - 1500,
  });

  const n2 = createMockNode({
    id: "n2",
    name: "Node 2",
    dependencies: ["n1"],
    dependents: ["n4"],
    level: 1,
    state: "completed",
    startTime: Date.now() - 1500,
    endTime: Date.now() - 1000,
  });

  const n3 = createMockNode({
    id: "n3",
    name: "Node 3",
    dependencies: ["n1"],
    dependents: ["n4"],
    level: 1,
    state: "executing",
    startTime: Date.now() - 1000,
  });

  const n4 = createMockNode({
    id: "n4",
    name: "Node 4",
    dependencies: ["n2", "n3"],
    level: 2,
    state: "pending",
  });

  return createMockGraphState({
    nodes: new Map([
      ["n1", n1],
      ["n2", n2],
      ["n3", n3],
      ["n4", n4],
    ]),
    edges: [
      { from: "n1", to: "n2" },
      { from: "n1", to: "n3" },
      { from: "n2", to: "n4" },
      { from: "n3", to: "n4" },
    ],
    executionOrder: [["n1"], ["n2", "n3"], ["n4"]],
    criticalPath: ["n1", "n2", "n4"],
    totalWeight: 400,
    maxParallelism: 2,
    isExecuting: true,
  });
};

/**
 * Create atomic node graph (single node, trivial graph)
 */
export const createAtomicNodeGraph = (): ExecutionGraphState => {
  const node = createMockNode({
    id: "atomic-1",
    name: "Atomic Operation",
    state: "executing",
    startTime: Date.now(),
  });

  return createMockGraphState({
    nodes: new Map([["atomic-1", node]]),
    edges: [],
    executionOrder: [["atomic-1"]],
    criticalPath: ["atomic-1"],
    totalWeight: 100,
    maxParallelism: 1,
    isExecuting: true,
  });
};

/**
 * Create a NodeDefinition for testing
 */
export const createTestNodeDefinition = (
  options: Partial<NodeDefinition> = {},
): NodeDefinition => {
  return createNodeDefinition({
    id: "test-node",
    type: "test",
    ...options,
  });
};

/**
 * Create a group NodeDefinition with children
 */
export const createTestGroupNode = (childCount: number = 2): NodeDefinition => {
  const children = Array.from({ length: childCount }, (_, i) =>
    createTestNodeDefinition({ id: `child-${i + 1}`, type: "test" }),
  );

  return createNodeDefinition({
    id: "group-node",
    type: "group",
    nodes: children,
  });
};
