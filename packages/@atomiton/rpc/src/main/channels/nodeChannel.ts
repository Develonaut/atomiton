import {
  createChannelServer,
  type ChannelServer,
} from "#main/channels/createChannelServer";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { generateExecutionId } from "@atomiton/utils";
import { v } from "@atomiton/validation";
import type { IpcMain } from "electron";

// Validation schemas
// For IPC transport, we use a permissive schema that validates required fields
// but allows all NodeDefinition fields to pass through during serialization
const nodeDefinitionSchema = v
  .object({
    id: v.string(),
    type: v.string(),
  })
  .passthrough(); // Allow all other NodeDefinition fields (nodes, edges, parameters, etc.)

const nodeExecuteParamsSchema = v.object({
  node: nodeDefinitionSchema,
  context: v
    .object({
      nodeId: v.string().optional(),
      executionId: v.string().optional(),
      variables: v.record(v.string(), v.unknown()).optional(),
      input: v.unknown().optional(),
      parentContext: v.any().optional(),
    })
    .optional(),
});

const nodeValidateParamsSchema = v.object({
  node: nodeDefinitionSchema,
});

// Types for node channel operations
export type NodeExecuteParams<TNode = NodeDefinition, TContext = unknown> = {
  node: TNode;
  context?: TContext;
};

export type NodeExecuteResult<TResult = unknown> = {
  executionId: string;
  status: "completed" | "failed" | "cancelled";
  result?: TResult;
  error?: unknown;
};

export type NodeValidateParams<TNode = NodeDefinition> = {
  node: TNode;
};

export type NodeValidateResult = {
  valid: boolean;
  errors: string[];
};

// Functional factory for node channel server with generic handlers
export const createNodeChannelServer = <
  TNode = NodeDefinition,
  TContext = unknown,
  TResult = unknown,
>(
  ipcMain: IpcMain,
  handlers: {
    execute: (node: TNode, context?: TContext) => Promise<TResult>;
    validate?: (node: TNode) => Promise<{ valid: boolean; errors: string[] }>;
    cancel?: (executionId: string) => Promise<void>;
  },
): ChannelServer => {
  const server = createChannelServer("node", ipcMain);
  const executions = new Map<string, AbortController>();

  // Register command handlers
  server.handle("execute", async (args: unknown): Promise<unknown> => {
    // Validate input
    const validation = nodeExecuteParamsSchema.safeParse(args);
    if (!validation.success) {
      throw new Error(`Invalid parameters: ${validation.error.message}`);
    }

    const params = validation.data;
    const executionId = generateExecutionId();
    const controller = new AbortController();

    executions.set(executionId, controller);

    try {
      console.log("[NODE] Execution started:", {
        executionId,
        nodeId: params.node.id,
        nodeType: params.node.type,
      });

      // Broadcast start event
      server.broadcast("started", {
        executionId,
        nodeId: params.node.id,
        nodeType: params.node.type,
        timestamp: Date.now(),
      });

      // Execute the node using injected handler
      const context = params.context
        ? ({
            nodeId: params.node.id,
            executionId,
            ...params.context,
          } as TContext)
        : undefined;

      const result = await handlers.execute(params.node as TNode, context);

      // Broadcast completion event
      server.broadcast("completed", {
        executionId,
        nodeId: params.node.id,
        result,
        timestamp: Date.now(),
      });

      console.log("[NODE] Execution completed:", {
        executionId,
        nodeId: params.node.id,
        success: (result as Record<string, unknown>).success,
        duration: (result as Record<string, unknown>).duration,
      });

      // Return the result directly for the browser transport
      return result;
    } catch (error) {
      console.error("[NODE] Execution failed:", {
        executionId,
        nodeId: params.node.id,
        error: error instanceof Error ? error.message : String(error),
      });

      // Broadcast error event
      server.broadcast("error", {
        executionId,
        nodeId: params.node.id,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      });

      // Return an error result for the browser transport
      return {
        success: false,
        error: {
          nodeId: params.node.id,
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
          code: "EXECUTION_FAILED",
        },
        duration: 0,
        executedNodes: [],
      };
    } finally {
      executions.delete(executionId);
    }
  });

  server.handle("cancel", async (args: unknown): Promise<unknown> => {
    const executionId = args as string;
    const controller = executions.get(executionId);

    if (controller) {
      controller.abort();
      executions.delete(executionId);

      // Use injected cancel handler if provided
      if (handlers.cancel) {
        try {
          await handlers.cancel(executionId);
        } catch (error) {
          console.warn("[NODE] Cancel handler error:", error);
        }
      }

      console.log("[NODE] Execution cancelled:", { executionId });

      // Broadcast cancellation event
      server.broadcast("cancelled", {
        executionId,
        timestamp: Date.now(),
      });

      return { success: true };
    }
    return { success: false, error: "Execution not found" };
  });

  server.handle("validate", async (args: unknown): Promise<unknown> => {
    const validation = nodeValidateParamsSchema.safeParse(args);
    if (!validation.success) {
      return {
        valid: false,
        errors: validation.error.errors.map(
          (e) => `${e.path.join(".")}: ${e.message}`,
        ),
      };
    }

    const params = validation.data;

    // Use injected validator if provided, otherwise do basic validation
    if (handlers.validate) {
      const result = await handlers.validate(params.node as TNode);
      console.log("[NODE] Validation completed (via handler):", {
        nodeId: params.node.id,
        nodeType: params.node.type,
        valid: result.valid,
        errorCount: result.errors.length,
      });
      return result;
    }

    // Basic fallback validation
    const errors: string[] = [];
    if (!params.node.id) {
      errors.push("Node must have an id");
    }
    if (!params.node.type) {
      errors.push("Node must have a type");
    }

    console.log("[NODE] Validation completed (basic):", {
      nodeId: params.node.id,
      nodeType: params.node.type,
      valid: errors.length === 0,
      errorCount: errors.length,
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  });

  server.handle("health", async (): Promise<unknown> => {
    return {
      status: "ok",
      timestamp: Date.now(),
    };
  });

  return server;
};
