/**
 * Functional Conductor Implementation
 *
 * Orchestrates node execution using the simple NodeExecutable interface
 * from @atomiton/nodes, adding rich execution context and metadata.
 */

import type {
  ConductorConfig,
  ConductorExecutionContext,
  ExecutionError,
  ExecutionResult,
  HealthResult,
  NodeExecutorFactory,
} from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { generateExecutionId } from "@atomiton/utils";

/**
 * Create execution context with defaults
 */
function createContext(
  node: NodeDefinition,
  context?: Partial<ConductorExecutionContext>,
): ConductorExecutionContext {
  return {
    nodeId: node.id,
    executionId: context?.executionId || generateExecutionId(),
    variables: context?.variables || {},
    input: context?.input,
    parentContext: context?.parentContext,
  };
}

/**
 * Topological sort for node execution order
 */
function topologicalSort(
  nodes: NodeDefinition[],
  edges: NodeDefinition["edges"] = [],
): NodeDefinition[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  // Initialize structures
  nodes.forEach((node) => {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  });

  // Build adjacency and in-degree
  edges.forEach((edge) => {
    const current = inDegree.get(edge.target) || 0;
    inDegree.set(edge.target, current + 1);

    const neighbors = adjacency.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacency.set(edge.source, neighbors);
  });

  // Find nodes with no dependencies
  const queue: string[] = [];
  const result: NodeDefinition[] = [];

  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  // Process nodes in topological order
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentNode = nodes.find((n) => n.id === currentId);

    if (currentNode) {
      result.push(currentNode);
    }

    const neighbors = adjacency.get(currentId) || [];
    neighbors.forEach((neighbor) => {
      const degree = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, degree);

      if (degree === 0) {
        queue.push(neighbor);
      }
    });
  }

  if (result.length !== nodes.length) {
    throw new Error("Cycle detected in node graph");
  }

  return result;
}

/**
 * Execute a single node locally using the provided executor factory
 */
async function executeLocal(
  node: NodeDefinition,
  context: ConductorExecutionContext,
  startTime: number,
  nodeExecutorFactory?: NodeExecutorFactory,
): Promise<ExecutionResult> {
  try {
    if (!nodeExecutorFactory) {
      // No local execution available without executor factory
      return {
        success: false,
        error: {
          nodeId: node.id,
          message: `No executor factory provided for local execution`,
          timestamp: new Date(),
          code: "NO_EXECUTOR_FACTORY",
        },
        duration: Date.now() - startTime,
        executedNodes: [node.id],
        context,
      };
    }

    // Get the SimpleNodeExecutable for this node type
    const nodeExecutable = nodeExecutorFactory.getNodeExecutable(node.type);

    if (!nodeExecutable) {
      return {
        success: false,
        error: {
          nodeId: node.id,
          message: `No implementation found for node type: ${node.type}`,
          timestamp: new Date(),
          code: "NODE_TYPE_NOT_FOUND",
        },
        duration: Date.now() - startTime,
        executedNodes: [node.id],
        context,
      };
    }

    // SimpleNodeExecutable is just a function that takes params and returns a result
    const params = {
      ...context,
      ...node.parameters,
    };

    console.log("[CONDUCTOR:LOCAL] Executing node:", {
      nodeId: node.id,
      nodeType: node.type,
      hasParameters: !!node.parameters,
      parameters: node.parameters,
      contextKeys: Object.keys(context),
      mergedParams: params,
    });

    const result = await nodeExecutable.execute(params);

    return {
      success: true,
      data: result,
      duration: Date.now() - startTime,
      executedNodes: [node.id],
      context,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        nodeId: node.id,
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        stack: error instanceof Error ? error.stack : undefined,
      },
      duration: Date.now() - startTime,
      executedNodes: [node.id],
      context,
    };
  }
}

/**
 * Execute a group of nodes (composite execution)
 */
async function executeGroup(
  node: NodeDefinition,
  context: ConductorExecutionContext,
  config: ConductorConfig,
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const executedNodes: string[] = [];
  const nodeOutputs = new Map<string, unknown>();

  try {
    if (!node.nodes || node.nodes.length === 0) {
      return {
        success: true,
        data: {},
        duration: Date.now() - startTime,
        executedNodes: [node.id],
      };
    }

    const sorted = topologicalSort(node.nodes, node.edges);

    for (const childNode of sorted) {
      // Build input from edges
      const childInput = node.edges
        ?.filter((edge) => edge.target === childNode.id)
        .reduce(
          (acc: Record<string, unknown>, edge) => {
            const sourceOutput = nodeOutputs.get(edge.source);
            if (sourceOutput !== undefined) {
              const key = edge.targetHandle || "default";
              return { ...acc, [key]: sourceOutput };
            }
            return acc;
          },
          (context.input as Record<string, unknown>) || {},
        );

      const childContext: ConductorExecutionContext = {
        nodeId: childNode.id,
        executionId: generateExecutionId(`child_${childNode.id}`),
        variables: context.variables,
        input: childInput,
        parentContext: context,
      };

      const result = await execute(childNode, childContext, config);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          duration: Date.now() - startTime,
          executedNodes: [...executedNodes, ...(result.executedNodes || [])],
        };
      }

      nodeOutputs.set(childNode.id, result.data);
      executedNodes.push(...(result.executedNodes || []));
    }

    // Return the output of the last node
    const lastNodeId = sorted[sorted.length - 1]?.id;
    const finalOutput = lastNodeId ? nodeOutputs.get(lastNodeId) : undefined;

    return {
      success: true,
      data: finalOutput,
      duration: Date.now() - startTime,
      executedNodes: [node.id, ...executedNodes],
      context,
    };
  } catch (error) {
    const executionError: ExecutionError = {
      nodeId: node.id,
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date(),
      stack: error instanceof Error ? error.stack : undefined,
    };

    return {
      success: false,
      error: executionError,
      duration: Date.now() - startTime,
      executedNodes: [node.id, ...executedNodes],
    };
  }
}

/**
 * Main execution function
 */
async function execute(
  node: NodeDefinition,
  context: ConductorExecutionContext,
  config: ConductorConfig,
): Promise<ExecutionResult> {
  const startTime = Date.now();

  // Check if it has child nodes (it's a group)
  if (node.nodes && node.nodes.length > 0) {
    return executeGroup(node, context, config);
  }

  // Single node - use transport if configured, otherwise execute locally
  if (config.transport) {
    return config.transport.execute(node, context);
  }

  return executeLocal(node, context, startTime, config.nodeExecutorFactory);
}

/**
 * Create a conductor with structured API: conductor.node.* and conductor.system.*
 *
 * @param config - Conductor configuration
 * @returns Conductor with node and system APIs
 *
 * @example
 * ```typescript
 * const conductor = createConductor();
 * const result = await conductor.node.run(node);
 * const health = await conductor.system.health();
 * ```
 */
export function createConductor(config: ConductorConfig = {}) {
  const nodeAPI = {
    /**
     * Execute a node definition
     */
    async run(
      node: NodeDefinition,
      contextOverrides?: Partial<ConductorExecutionContext>,
    ): Promise<ExecutionResult> {
      const context = createContext(node, contextOverrides);
      return execute(node, context, config);
    },
  };

  const systemAPI = {
    /**
     * Check system health
     */
    async health(): Promise<HealthResult> {
      // If transport is available, use its health check
      if (config.transport?.health) {
        return config.transport.health();
      }

      // Otherwise, perform a basic local health check
      return {
        status: "ok",
        timestamp: Date.now(),
        message: "Local conductor operational",
      };
    },
  };

  return {
    node: nodeAPI,
    system: systemAPI,

    // Backward compatibility - legacy execute method
    async execute(
      node: NodeDefinition,
      contextOverrides?: Partial<ConductorExecutionContext>,
    ): Promise<ExecutionResult> {
      console.warn(
        "[Conductor] execute() is deprecated, use conductor.node.run() instead",
      );
      return nodeAPI.run(node, contextOverrides);
    },

    // Backward compatibility - legacy health method
    async health(): Promise<HealthResult> {
      console.warn(
        "[Conductor] health() is deprecated, use conductor.system.health() instead",
      );
      return systemAPI.health();
    },
  };
}
