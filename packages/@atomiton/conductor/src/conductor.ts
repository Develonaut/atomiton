import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type {
  ExecutionContext,
  ExecutionResult,
  ExecutionError,
  ConductorConfig,
} from "#types";

export function isAtomic(node: NodeDefinition): boolean {
  return !node.nodes || node.nodes.length === 0;
}

export function isComposite(node: NodeDefinition): boolean {
  return !!node.nodes && node.nodes.length > 0;
}

function getTopologicalOrder(
  nodes: NodeDefinition[],
  edges: NodeDefinition["edges"] = [],
): string[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  nodes.forEach((node) => {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  });

  edges.forEach((edge) => {
    const current = inDegree.get(edge.target) || 0;
    inDegree.set(edge.target, current + 1);

    const neighbors = adjacency.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacency.set(edge.source, neighbors);
  });

  const queue: string[] = [];
  const result: string[] = [];

  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    const neighbors = adjacency.get(current) || [];
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

async function executeAtomic(
  node: NodeDefinition,
  context: ExecutionContext,
): Promise<ExecutionResult> {
  const startTime = Date.now();

  try {
    const { getNodeExecutable } = await import("@atomiton/nodes/executables");

    const executable = getNodeExecutable(node.type);

    if (!executable) {
      throw new Error(`No executable found for node type: ${node.type}`);
    }

    // Convert ExecutionContext to NodeExecutionContext
    const nodeContext = {
      nodeId: context.nodeId,
      inputs: (context.input || {}) as Record<string, unknown>,
      parameters: node.parameters.defaults || {},
      metadata: { executionId: context.executionId },
      startTime: context.startTime,
    };

    const result = await executable.execute(nodeContext, {
      parameters: node.parameters,
      inputPorts: node.inputPorts,
      outputPorts: node.outputPorts,
    });

    return {
      success: result.success,
      data: result.outputs,
      error: result.error
        ? {
            nodeId: node.id,
            message: result.error,
            timestamp: new Date(),
          }
        : undefined,
      duration: Date.now() - startTime,
      executedNodes: [node.id],
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
      executedNodes: [node.id],
    };
  }
}

async function executeComposite(
  node: NodeDefinition,
  context: ExecutionContext,
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

    const executionOrder = getTopologicalOrder(node.nodes, node.edges);

    for (const nodeId of executionOrder) {
      const childNode = node.nodes.find((n: NodeDefinition) => n.id === nodeId);

      if (!childNode) {
        throw new Error(`Node ${nodeId} not found in composite node`);
      }

      const childInput = node.edges
        ?.filter((edge) => edge.target === nodeId)
        .reduce(
          (acc: Record<string, unknown>, edge) => {
            const sourceOutput = nodeOutputs.get(edge.source);
            if (sourceOutput !== undefined) {
              return { ...acc, [edge.targetHandle || "default"]: sourceOutput };
            }
            return acc;
          },
          (context.input as Record<string, unknown>) || {},
        );

      const childContext: ExecutionContext = {
        ...context,
        nodeId: childNode.id,
        executionId: `${context.executionId}-${childNode.id}`,
        input: childInput,
        status: "running",
        startTime: new Date(),
      };

      const result = isAtomic(childNode)
        ? await executeAtomic(childNode, childContext)
        : await executeComposite(childNode, childContext);

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

    const lastNodeId = executionOrder[executionOrder.length - 1];
    const finalOutput = nodeOutputs.get(lastNodeId);

    return {
      success: true,
      data: finalOutput,
      duration: Date.now() - startTime,
      executedNodes: [node.id, ...executedNodes],
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

export function createConductor(_config?: ConductorConfig) {
  return {
    async execute(
      node: NodeDefinition,
      context?: Partial<ExecutionContext>,
    ): Promise<ExecutionResult> {
      const executionContext: ExecutionContext = {
        nodeId: node.id,
        executionId: context?.executionId || `exec-${Date.now()}`,
        variables: context?.variables || {},
        input: context?.input,
        status: "running",
        startTime: new Date(),
        ...context,
      };

      if (isAtomic(node)) {
        return executeAtomic(node, executionContext);
      } else if (isComposite(node)) {
        return executeComposite(node, executionContext);
      }

      throw new Error(`Unknown node type: ${node.type}`);
    },
  };
}
