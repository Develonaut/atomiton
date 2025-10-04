/**
 * Functional Conductor Implementation
 *
 * Orchestrates node execution using a unified graph-based execution path.
 * All nodes (single and groups) are analyzed as execution graphs and routed
 * through executeGraph for consistent progress tracking and execution flow.
 */

import { executeGraph } from "#execution/executeGraph";
import type { ExecutionGraphStore } from "#execution/executionGraphStore";
import { createExecutionGraphStore } from "#execution/executionGraphStore";
import type {
  ConductorConfig,
  ConductorExecutionContext,
  ExecutionResult,
  HealthResult,
} from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { analyzeExecutionGraph } from "@atomiton/nodes/graph";
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
 * Main execution function
 */
async function execute(
  node: NodeDefinition,
  context: ConductorExecutionContext,
  config: ConductorConfig,
  executionGraphStore?: ExecutionGraphStore,
): Promise<ExecutionResult> {
  // ALWAYS use graph-based execution path
  return executeGraph(node, context, config, executionGraphStore, execute);
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
  // Create execution graph store internally
  const executionGraphStore = createExecutionGraphStore();

  const nodeAPI = {
    /**
     * Execute a node definition
     */
    async run(
      node: NodeDefinition,
      contextOverrides?: Partial<ConductorExecutionContext>,
    ): Promise<ExecutionResult> {
      const context = createContext(node, contextOverrides);
      const startTime = Date.now();

      // ALWAYS initialize graph store (handles single nodes as 1-node graphs)
      try {
        const graph = analyzeExecutionGraph(node);
        executionGraphStore.initializeGraph(graph);
      } catch (error) {
        // Graph analysis failed (e.g., cycle detected)
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

      return execute(node, context, config, executionGraphStore);
    },

    /**
     * Execution graph store for tracking node execution state
     */
    store: executionGraphStore,
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

    // Backward compatibility - legacy top-level store accessor
    get store() {
      console.warn(
        "Deprecated: conductor.store is deprecated. Use conductor.node.store instead.",
      );
      return executionGraphStore;
    },

    // Backward compatibility - legacy execute method
    async execute(
      node: NodeDefinition,
      contextOverrides?: Partial<ConductorExecutionContext>,
    ): Promise<ExecutionResult> {
      return nodeAPI.run(node, contextOverrides);
    },

    // Backward compatibility - legacy health method
    async health(): Promise<HealthResult> {
      return systemAPI.health();
    },
  };
}
