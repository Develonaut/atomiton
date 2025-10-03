/**
 * Functional Conductor Implementation
 *
 * Orchestrates node execution using the simple NodeExecutable interface
 * from @atomiton/nodes, adding rich execution context and metadata.
 */

import type {
  ConductorConfig,
  ConductorExecutionContext,
  ExecutionResult,
  HealthResult,
} from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { generateExecutionId } from "@atomiton/utils";
import { createExecutionGraphStore } from "#execution/executionGraphStore";
import type { ExecutionGraphStore } from "#execution/executionGraphStore";
import { executeLocal } from "#execution/executeLocal";
import { executeGroup } from "#execution/executeGroup";

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
  const startTime = Date.now();

  // Check if it has child nodes (it's a group)
  if (node.nodes && node.nodes.length > 0) {
    return executeGroup(node, context, config, executionGraphStore, execute);
  }

  // Single node - use transport if configured, otherwise execute locally
  if (config.transport) {
    return config.transport.execute(node, context);
  }

  return executeLocal(node, context, startTime, config, executionGraphStore);
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

      // Initialize store if executing a group node
      if (node.nodes && node.nodes.length > 0) {
        try {
          const { analyzeExecutionGraph } = await import(
            "@atomiton/nodes/graph"
          );
          const graph = analyzeExecutionGraph(node);
          if (graph) {
            executionGraphStore.initializeGraph(graph);
          }
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
      }

      return execute(node, context, config, executionGraphStore);
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
    store: executionGraphStore,

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
