/**
 * Composite Node Executable
 * Node.js implementation with composite workflow execution logic
 */

import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult
} from '../../core/types/executable';
import { createNodeExecutable } from '../../core/factories/createNodeExecutable';
import type { CompositeParameters } from '../../definitions/composite';

// Types for composite execution
type ExecutableNode = {
  id: string;
  name: string;
  execute: (context: NodeExecutionContext) => Promise<NodeExecutionResult>;
};

type NodeEdge = {
  id: string;
  source: string;
  target: string;
  sourcePort?: string;
  targetPort?: string;
};

type CompositeGraph = {
  nodes: ExecutableNode[];
  edges: NodeEdge[];
};

export type CompositeOutput = {
  result: unknown;
  metadata: {
    executedAt: string;
    nodeId: string;
    nodeType: string;
    childNodesExecuted: number;
    totalExecutionTime: number;
    failedNode?: string;
  };
};

/**
 * Execute a node with retry logic
 */
async function executeWithRetries(
  node: ExecutableNode,
  context: NodeExecutionContext,
  retries: number,
  timeout: number
): Promise<NodeExecutionResult> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Node execution timed out after ${timeout}ms`)), timeout)
      );

      // Execute with timeout
      const result = await Promise.race([
        node.execute(context),
        timeoutPromise
      ]);

      if (result.success) {
        return result;
      }

      // If this is the last attempt, return the failed result
      if (attempt === retries) {
        return result;
      }

      // Log retry attempt
      context.log?.warn?.(`Node ${node.name} failed, retrying (attempt ${attempt + 1}/${retries})`, {
        error: result.error,
        nodeId: node.id,
      });

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this is the last attempt, throw the error
      if (attempt === retries) {
        throw lastError;
      }

      // Log retry attempt
      context.log?.warn?.(
        `Node ${node.name} threw error, retrying (attempt ${attempt + 1}/${retries})`,
        {
          error: lastError.message,
          nodeId: node.id,
        }
      );
    }

    // Wait before retry (exponential backoff)
    if (attempt < retries) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Unknown error during node execution');
}

/**
 * Execute nodes in sequence
 */
async function executeSequential(
  graph: CompositeGraph,
  context: NodeExecutionContext,
  params: CompositeParameters
): Promise<NodeExecutionResult> {
  let previousResult: NodeExecutionResult | undefined;
  let totalExecutionTime = 0;

  for (const node of graph.nodes) {
    const startTime = Date.now();

    // Prepare context for child node
    const childContext: NodeExecutionContext = {
      ...context,
      nodeId: node.id,
      inputs: previousResult?.outputs || context.inputs || {},
    };

    try {
      // Execute with retries and timeout
      const result = await executeWithRetries(node, childContext, params.retries as number, params.timeout as number);

      totalExecutionTime += Date.now() - startTime;

      if (!result.success) {
        return {
          success: false,
          error: `Child node ${node.name} failed: ${result.error}`,
          outputs: {
            result: undefined,
            metadata: {
              executedAt: new Date().toISOString(),
              nodeId: context.nodeId || "composite",
              nodeType: "composite",
              childNodesExecuted: graph.nodes.indexOf(node),
              totalExecutionTime,
              failedNode: node.id,
            },
          },
        };
      }

      previousResult = result;
    } catch (error) {
      totalExecutionTime += Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        error: `Child node ${node.name} threw error: ${errorMessage}`,
        outputs: {
          result: undefined,
          metadata: {
            executedAt: new Date().toISOString(),
            nodeId: context.nodeId || "composite",
            nodeType: "composite",
            childNodesExecuted: graph.nodes.indexOf(node),
            totalExecutionTime,
            failedNode: node.id,
          },
        },
      };
    }
  }

  return {
    success: true,
    outputs: {
      result: previousResult?.outputs || {},
      metadata: {
        executedAt: new Date().toISOString(),
        nodeId: context.nodeId || "composite",
        nodeType: "composite",
        childNodesExecuted: graph.nodes.length,
        totalExecutionTime,
      },
    },
  };
}

/**
 * Execute nodes in parallel
 */
async function executeParallel(
  graph: CompositeGraph,
  context: NodeExecutionContext,
  params: CompositeParameters
): Promise<NodeExecutionResult> {
  const startTime = Date.now();

  try {
    // Execute all nodes in parallel
    const promises = graph.nodes.map(async (node) => {
      const childContext: NodeExecutionContext = {
        ...context,
        nodeId: node.id,
        inputs: context.inputs || {},
      };

      return executeWithRetries(node, childContext, params.retries as number, params.timeout as number);
    });

    const results = await Promise.allSettled(promises);
    const totalExecutionTime = Date.now() - startTime;

    // Check for failures
    const failures = results
      .map((result, index) => ({ result, node: graph.nodes[index] }))
      .filter(({ result }) => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success));

    if (failures.length > 0) {
      const firstFailure = failures[0];
      const errorMessage = firstFailure.result.status === 'rejected'
        ? firstFailure.result.reason.message || String(firstFailure.result.reason)
        : firstFailure.result.value.error;

      return {
        success: false,
        error: `Parallel execution failed in node ${firstFailure.node.name}: ${errorMessage}`,
        outputs: {
          result: undefined,
          metadata: {
            executedAt: new Date().toISOString(),
            nodeId: context.nodeId || "composite",
            nodeType: "composite",
            childNodesExecuted: results.length - failures.length,
            totalExecutionTime,
            failedNode: firstFailure.node.id,
          },
        },
      };
    }

    // Collect successful results
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<NodeExecutionResult> =>
        result.status === 'fulfilled' && result.value.success
      )
      .map(result => result.value.outputs);

    return {
      success: true,
      outputs: {
        result: successfulResults,
        metadata: {
          executedAt: new Date().toISOString(),
          nodeId: context.nodeId || "composite",
          nodeType: "composite",
          childNodesExecuted: graph.nodes.length,
          totalExecutionTime,
        },
      },
    };
  } catch (error) {
    const totalExecutionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      error: `Parallel execution error: ${errorMessage}`,
      outputs: {
        result: undefined,
        metadata: {
          executedAt: new Date().toISOString(),
          nodeId: context.nodeId || "composite",
          nodeType: "composite",
          childNodesExecuted: 0,
          totalExecutionTime,
        },
      },
    };
  }
}

/**
 * Composite node executable
 */
export const compositeExecutable: NodeExecutable<CompositeParameters> = createNodeExecutable({
  async execute(
    context: NodeExecutionContext,
    config: CompositeParameters,
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();

    try {
      // Get composite graph from context metadata
      const graph = context.metadata?.graph as CompositeGraph | undefined;

      if (!graph || !graph.nodes || graph.nodes.length === 0) {
        context.log?.info?.('Composite node has no child nodes to execute');

        return {
          success: true,
          outputs: {
            result: context.inputs,
            metadata: {
              executedAt: new Date().toISOString(),
              nodeId: context.nodeId || "composite",
              nodeType: "composite",
              childNodesExecuted: 0,
              totalExecutionTime: Date.now() - startTime,
            },
          },
        };
      }

      context.log?.info?.(`Executing composite with ${graph.nodes.length} child nodes`, {
        parallel: config.parallel,
        timeout: config.timeout,
        retries: config.retries,
      });

      // Execute based on parallel setting
      if (config.parallel) {
        return await executeParallel(graph, context, config);
      } else {
        return await executeSequential(graph, context, config);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      context.log?.error?.('Composite execution failed', {
        error: errorMessage,
        config,
      });

      return {
        success: false,
        error: errorMessage,
        outputs: {
          result: undefined,
          metadata: {
            executedAt: new Date().toISOString(),
            nodeId: context.nodeId || "composite",
            nodeType: "composite",
            childNodesExecuted: 0,
            totalExecutionTime: Date.now() - startTime,
          },
        },
      };
    }
  },

  validateConfig(config: unknown): CompositeParameters {
    // In a real implementation, this would validate using the schema
    // For now, just cast it
    return config as CompositeParameters;
  },
});

export default compositeExecutable;