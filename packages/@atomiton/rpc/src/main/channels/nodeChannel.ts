import {
  createChannelServer,
  withValidation,
  type ChannelServer,
} from "#main/channels/createChannelServer";
import { v } from "@atomiton/validation";
import type { IpcMain } from "electron";

// Local type definitions to avoid circular dependency
type NodeDefinition = {
  id: string;
  type: string;
  parameters?: Record<string, any>;
};

type ConductorExecutionContext = {
  nodeId: string;
  executionId: string;
  variables: Record<string, unknown>;
  input?: unknown;
  parentContext?: ConductorExecutionContext;
};

type ExecutionResult = {
  success: boolean;
  data?: unknown;
  error?: {
    nodeId: string;
    message: string;
    timestamp: Date;
    code?: string;
    stack?: string;
  };
  duration?: number;
  executedNodes?: string[];
  context?: ConductorExecutionContext;
};

// Validation schemas
const nodeDefinitionSchema = v.object({
  id: v.string(),
  type: v.string(),
  parameters: v.record(v.string(), v.any()).optional(),
});

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
export type NodeExecuteParams = {
  node: NodeDefinition;
  context?: Partial<ConductorExecutionContext>;
};

export type NodeExecuteResult = {
  executionId: string;
  status: "completed" | "failed" | "cancelled";
  result?: ExecutionResult;
  error?: unknown;
};

export type NodeValidateParams = {
  node: NodeDefinition;
};

export type NodeValidateResult = {
  valid: boolean;
  errors: string[];
};

// Functional factory for node channel server
export const createNodeChannelServer = (ipcMain: IpcMain): ChannelServer => {
  const server = createChannelServer("node", ipcMain);
  const executions = new Map<string, AbortController>();

  // Mock conductor for demonstration (replace with actual implementation)
  const mockConductor = {
    node: {
      async run(node: NodeDefinition): Promise<ExecutionResult> {
        // Simple mock execution
        return {
          success: true,
          data: `Mock execution result for ${node.type} node`,
          duration: 100,
          executedNodes: [node.id],
        };
      },
    },
  };

  // Register command handlers
  server.handle("execute", async (args: unknown): Promise<unknown> => {
    // Validate input
    const validation = nodeExecuteParamsSchema.safeParse(args);
    if (!validation.success) {
      throw new Error(`Invalid parameters: ${validation.error.message}`);
    }

    const params = validation.data;
    const executionId = crypto.randomUUID();
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

      // Execute the node using mock conductor
      const result = await mockConductor.node.run(params.node);

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
        success: result.success,
        duration: result.duration,
      });

      return {
        executionId,
        status: "completed",
        result,
      };
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

      return {
        executionId,
        status: "failed",
        error,
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
    const errors: string[] = [];

    // Basic validation
    if (!params.node.id) {
      errors.push("Node must have an id");
    }
    if (!params.node.type) {
      errors.push("Node must have a type");
    }

    // Additional validation could be added here
    // For example, checking if the node type is supported

    console.log("[NODE] Validation completed:", {
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
