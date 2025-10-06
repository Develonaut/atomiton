/**
 * Functional Conductor Implementation
 *
 * Orchestrates node execution using a unified graph-based execution path.
 * All nodes (single and groups) are analyzed as execution graphs and routed
 * through executeGraph for consistent progress tracking and execution flow.
 */

import { executeGraph } from "#execution/executeGraph";
import type {
  ExecutionGraphStore,
  ExecutionGraphState,
} from "#execution/executionGraphStore";
import { createExecutionGraphStore } from "#execution/executionGraphStore";
import type {
  ConductorConfig,
  ConductorExecutionContext,
  ExecutionResult,
  HealthResult,
} from "#types";
import {
  createExecutionId,
  toNodeId,
  ErrorCode,
  createExecutionError,
} from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { analyzeExecutionGraph } from "@atomiton/nodes/graph";
import { createConductorEventEmitter } from "#events";
import { createDebugController, type DebugController } from "#debug";
import { analyzeExecutionGraphAsync } from "#utils/asyncGraphAnalyzer";

/**
 * Create execution context with defaults
 */
function createContext(
  node: NodeDefinition,
  context?: Partial<ConductorExecutionContext>,
  debugController?: DebugController,
): ConductorExecutionContext {
  const ctx: ConductorExecutionContext = {
    nodeId: toNodeId(node.id),
    executionId: context?.executionId || createExecutionId(),
    variables: context?.variables || {},
    input: context?.input,
    parentContext: context?.parentContext,
    slowMo: context?.slowMo,
    debug: context?.debug,
  };

  // If debug options or slowMo are provided, configure the controller
  if ((ctx.debug || ctx.slowMo) && debugController) {
    debugController.configure({
      simulateError: ctx.debug?.simulateError,
      simulateLongRunning: ctx.debug?.simulateLongRunning,
      slowMo: ctx.slowMo,
    });
  }

  return ctx;
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

  // Create event emitter for decoupled event handling
  const events = createConductorEventEmitter();

  // Create or use provided debug controller
  const debugController = config.debugController || createDebugController();

  // Wire up store changes to emit events
  executionGraphStore.subscribe((state: ExecutionGraphState) => {
    events.emitProgress(state);
  });

  const nodeAPI = {
    /**
     * Execute a node definition
     */
    async run(
      node: NodeDefinition,
      contextOverrides?: Partial<ConductorExecutionContext>,
    ): Promise<ExecutionResult> {
      const context = createContext(node, contextOverrides, debugController);
      const startTime = Date.now();

      // Emit started event
      events.emitStarted(context.executionId, toNodeId(node.id));

      // ALWAYS initialize graph store (handles single nodes as 1-node graphs)
      try {
        // Use async analysis for large graphs (>= 50 nodes)
        const nodeCount = node.nodes?.length || 1;
        const graph =
          nodeCount >= 50
            ? await analyzeExecutionGraphAsync(node, {
                onProgress: (_progress) => {
                  // Could emit graph analysis progress events if needed
                  // console.debug(`[Graph Analysis] ${phase}: ${percent}% - ${message}`);
                },
              })
            : analyzeExecutionGraph(node);

        executionGraphStore.initializeGraph(graph);
      } catch (error) {
        // Graph analysis failed (e.g., cycle detected)
        const executionError = createExecutionError(
          ErrorCode.CIRCULAR_DEPENDENCY,
          error instanceof Error ? error.message : String(error),
          {
            nodeId: toNodeId(node.id),
            executionId: context.executionId,
            stack: error instanceof Error ? error.stack : undefined,
          },
        );
        const result: ExecutionResult = {
          success: false,
          error: executionError,
          duration: Date.now() - startTime,
          executedNodes: [toNodeId(node.id)],
          context,
        };

        // Emit error event
        events.emitError(
          context.executionId,
          new Error(executionError.message),
        );

        return result;
      }

      // Include debugController in the config for execution
      const executionConfig = { ...config, debugController };
      const result = await execute(
        node,
        context,
        executionConfig,
        executionGraphStore,
      );

      // Flush any pending progress updates before emitting completion
      events.flushProgress();

      // Emit appropriate event based on result
      if (result.success) {
        events.emitCompleted(context.executionId, result);
      } else if (result.error) {
        events.emitError(context.executionId, new Error(result.error.message));
      }

      return result;
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
    events, // Expose event emitter for external subscriptions

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
