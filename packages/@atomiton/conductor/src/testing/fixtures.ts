/**
 * Test fixtures for conductor testing
 * Provides reusable node definitions and execution scenarios
 */

import {
  createNodeDefinition,
  type NodeDefinition,
} from "@atomiton/nodes/definitions";
import type { ConductorExecutionContext } from "#types/execution";
import type { ExecutionId, NodeId } from "#types/branded";

/**
 * Test fixture builder for creating node definitions with common patterns
 */
export class TestFixtureBuilder {
  /**
   * Create a simple atomic node (no children)
   */
  static createAtomicNode(
    overrides: Partial<NodeDefinition> = {},
  ): NodeDefinition {
    return createNodeDefinition({
      id: "test-atomic-1",
      type: "processor",
      version: "1.0.0",
      name: "Test Processor",
      position: { x: 0, y: 0 },
      metadata: {
        id: "test-processor",
        name: "Test Processor",
        author: "Test Suite",
        description: "Atomic test node",
        category: "utility",
        icon: "code-2",
      },
      parameters: {
        testParam: "test-value",
      },
      inputPorts: [
        {
          id: "input-1",
          name: "Input",
          dataType: "any",
        },
      ],
      outputPorts: [
        {
          id: "output-1",
          name: "Output",
          dataType: "any",
        },
      ],
      ...overrides,
    });
  }

  /**
   * Create a simple group node with children
   */
  static createGroupNode(
    children: NodeDefinition[] = [],
    overrides: Partial<NodeDefinition> = {},
  ): NodeDefinition {
    const defaultChildren = children.length
      ? children
      : [
          this.createAtomicNode({ id: "child-1", parentId: "test-group-1" }),
          this.createAtomicNode({ id: "child-2", parentId: "test-group-1" }),
        ];

    return createNodeDefinition({
      id: "test-group-1",
      type: "group",
      version: "1.0.0",
      name: "Test Group",
      position: { x: 0, y: 0 },
      metadata: {
        id: "test-group",
        name: "Test Group",
        author: "Test Suite",
        description: "Group test node",
        category: "group",
        icon: "folder",
      },
      parameters: {},
      inputPorts: [],
      outputPorts: [],
      nodes: defaultChildren,
      edges: [
        {
          id: "edge-1",
          source: "child-1",
          sourceHandle: "output-1",
          target: "child-2",
          targetHandle: "input-1",
        },
      ],
      ...overrides,
    });
  }

  /**
   * Create a parallel execution node
   */
  static createParallelNode(
    children: NodeDefinition[] = [],
    overrides: Partial<NodeDefinition> = {},
  ): NodeDefinition {
    const defaultChildren = children.length
      ? children
      : [
          this.createAtomicNode({
            id: "parallel-child-1",
            parentId: "test-parallel-1",
          }),
          this.createAtomicNode({
            id: "parallel-child-2",
            parentId: "test-parallel-1",
          }),
          this.createAtomicNode({
            id: "parallel-child-3",
            parentId: "test-parallel-1",
          }),
        ];

    return createNodeDefinition({
      id: "test-parallel-1",
      type: "parallel",
      version: "1.0.0",
      name: "Test Parallel",
      position: { x: 0, y: 0 },
      metadata: {
        id: "test-parallel",
        name: "Test Parallel",
        author: "Test Suite",
        description: "Parallel test node",
        category: "group",
        icon: "git-branch",
      },
      parameters: {},
      inputPorts: [],
      outputPorts: [],
      nodes: defaultChildren,
      edges: [], // No edges in parallel execution
      ...overrides,
    });
  }

  /**
   * Create a node that will error during execution
   */
  static createErrorNode(
    errorMessage = "Test error",
    overrides: Partial<NodeDefinition> = {},
  ): NodeDefinition {
    return createNodeDefinition({
      id: "test-error-1",
      type: "error-simulator",
      version: "1.0.0",
      name: "Error Node",
      position: { x: 0, y: 0 },
      metadata: {
        id: "test-error",
        name: "Error Node",
        author: "Test Suite",
        description: "Node that throws an error",
        category: "utility",
        icon: "alert-triangle",
      },
      parameters: {
        errorMessage,
        shouldError: true,
      },
      inputPorts: [],
      outputPorts: [],
      ...overrides,
    });
  }

  /**
   * Create a node with cyclic dependencies (for testing cycle detection)
   */
  static createCyclicGraph(): NodeDefinition {
    const child1 = this.createAtomicNode({
      id: "cyclic-1",
      parentId: "test-cyclic-graph",
    });
    const child2 = this.createAtomicNode({
      id: "cyclic-2",
      parentId: "test-cyclic-graph",
    });
    const child3 = this.createAtomicNode({
      id: "cyclic-3",
      parentId: "test-cyclic-graph",
    });

    return createNodeDefinition({
      id: "test-cyclic-graph",
      type: "group",
      version: "1.0.0",
      name: "Cyclic Graph",
      position: { x: 0, y: 0 },
      metadata: {
        id: "test-cyclic",
        name: "Cyclic Graph",
        author: "Test Suite",
        description: "Graph with cyclic dependencies",
        category: "utility",
        icon: "repeat",
      },
      parameters: {},
      inputPorts: [],
      outputPorts: [],
      nodes: [child1, child2, child3],
      edges: [
        {
          id: "edge-1",
          source: "cyclic-1",
          sourceHandle: "output-1",
          target: "cyclic-2",
          targetHandle: "input-1",
        },
        {
          id: "edge-2",
          source: "cyclic-2",
          sourceHandle: "output-1",
          target: "cyclic-3",
          targetHandle: "input-1",
        },
        {
          id: "edge-3",
          source: "cyclic-3",
          sourceHandle: "output-1",
          target: "cyclic-1",
          targetHandle: "input-1", // Creates a cycle
        },
      ],
    });
  }

  /**
   * Create a complex nested flow for integration testing
   */
  static createComplexFlow(): NodeDefinition {
    const subGroup = this.createGroupNode(undefined, {
      id: "sub-group-1",
      parentId: "complex-flow",
    });

    const parallelNode = this.createParallelNode(undefined, {
      id: "parallel-group-1",
      parentId: "complex-flow",
    });

    return createNodeDefinition({
      id: "complex-flow",
      type: "flow",
      version: "1.0.0",
      name: "Complex Test Flow",
      position: { x: 0, y: 0 },
      metadata: {
        id: "test-complex-flow",
        name: "Complex Flow",
        author: "Test Suite",
        description: "Complex nested flow for integration testing",
        category: "utility",
        icon: "layers",
      },
      parameters: {
        flowParam: "test-flow-value",
      },
      inputPorts: [],
      outputPorts: [],
      nodes: [
        this.createAtomicNode({ id: "start-node", parentId: "complex-flow" }),
        subGroup,
        parallelNode,
        this.createAtomicNode({ id: "end-node", parentId: "complex-flow" }),
      ],
      edges: [
        {
          id: "edge-1",
          source: "start-node",
          sourceHandle: "output-1",
          target: "sub-group-1",
          targetHandle: "input-1",
        },
        {
          id: "edge-2",
          source: "sub-group-1",
          sourceHandle: "output-1",
          target: "parallel-group-1",
          targetHandle: "input-1",
        },
        {
          id: "edge-3",
          source: "parallel-group-1",
          sourceHandle: "output-1",
          target: "end-node",
          targetHandle: "input-1",
        },
      ],
    });
  }
}

/**
 * Test context builder for creating execution contexts
 */
export class TestContextBuilder {
  /**
   * Create a basic execution context
   */
  static createBasicContext(
    overrides: Partial<ConductorExecutionContext> = {},
  ): ConductorExecutionContext {
    return {
      nodeId: "test-node-1" as NodeId,
      executionId: "test-execution-1" as ExecutionId,
      variables: {},
      input: undefined,
      parentContext: undefined,
      ...overrides,
    };
  }

  /**
   * Create a context with debug options
   */
  static createDebugContext(
    debugOptions: Partial<ConductorExecutionContext["debug"]> = {},
  ): ConductorExecutionContext {
    return this.createBasicContext({
      debug: debugOptions as ConductorExecutionContext["debug"],
    });
  }

  /**
   * Create a nested context (with parent)
   */
  static createNestedContext(
    parentContext: ConductorExecutionContext,
    nodeId: string,
    overrides: Partial<ConductorExecutionContext> = {},
  ): ConductorExecutionContext {
    return {
      nodeId: nodeId as NodeId,
      executionId: parentContext.executionId,
      variables: { ...parentContext.variables },
      input: undefined,
      parentContext,
      debug: parentContext.debug,
      ...overrides,
    };
  }
}

/**
 * Common test flows for reuse across test suites
 */
export const TestFlows = {
  // Simple single node
  simple: TestFixtureBuilder.createAtomicNode(),

  // Group with sequential execution
  sequential: TestFixtureBuilder.createGroupNode(),

  // Parallel execution
  parallel: TestFixtureBuilder.createParallelNode(),

  // Node that errors
  withError: TestFixtureBuilder.createErrorNode(),

  // Cyclic graph
  cyclic: TestFixtureBuilder.createCyclicGraph(),

  // Complex nested flow
  complex: TestFixtureBuilder.createComplexFlow(),

  // Long running simulation
  longRunning: TestFixtureBuilder.createAtomicNode({
    id: "long-running-node",
    parameters: {
      simulateLongRunning: true,
      duration: 5000,
    },
  }),

  // Empty flow
  empty: TestFixtureBuilder.createGroupNode([], {
    nodes: [],
    edges: [],
  }),
} as const;

/**
 * Common test contexts
 */
export const TestContexts = {
  // Basic context
  basic: TestContextBuilder.createBasicContext(),

  // Debug with slow-mo
  slowMo: TestContextBuilder.createDebugContext({
    simulateError: undefined,
    simulateLongRunning: undefined,
  }),

  // Debug with error simulation
  withError: TestContextBuilder.createDebugContext({
    simulateError: {
      nodeId: "test-error-1",
      errorType: "generic" as const,
    },
    simulateLongRunning: undefined,
  }),

  // Debug with long running
  longRunning: TestContextBuilder.createDebugContext({
    simulateError: undefined,
    simulateLongRunning: {
      nodeId: "long-running-node",
      delayMs: 5000,
    },
  }),

  // Context with variables
  withVariables: TestContextBuilder.createBasicContext({
    variables: {
      testVar1: "value1",
      testVar2: 42,
      testVar3: true,
    },
  }),

  // Context with input data
  withInput: TestContextBuilder.createBasicContext({
    input: {
      data: "test-input-data",
      metadata: { source: "test" },
    },
  }),
} as const;
