/**
 * Factory function for creating type-safe nodes
 */

import type { INode } from "./INode";
import type { INodeParameters } from "./INodeParameters";
import type { INodeMetadata } from "./INodeMetadata";
import type { INodeLogic } from "./INodeLogic";
import type { NodePortDefinition } from "../types";
import type { NodeExecutionContext, NodeExecutionResult } from "../types";

export type NodeInput<TConfig = unknown> = {
  metadata: INodeMetadata;
  parameters: INodeParameters;
  logic: INodeLogic<TConfig>;
  ports?: {
    input?: NodePortDefinition[];
    output?: NodePortDefinition[];
  };
};

export function createNode<TConfig = unknown>(
  input: NodeInput<TConfig>,
): INode {
  const nodeId = input.metadata.id;
  const nodeType = input.metadata.type;
  const nodeName = input.metadata.name;

  // Built-in helper functions removed - unused

  const createErrorResult = (error: Error | string): NodeExecutionResult => {
    const errorMessage = error instanceof Error ? error.message : error;
    return {
      success: false,
      outputs: undefined,
      error: errorMessage,
      metadata: {
        executedAt: new Date().toISOString(),
        nodeId,
        nodeType,
      },
    };
  };

  const logExecution = (
    context: NodeExecutionContext,
    level: "info" | "warn" | "error",
    message: string,
    data?: unknown,
  ): void => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      nodeId,
      nodeType,
      message,
      data,
    };

    if (context.log && context.log[level]) {
      context.log[level]!(message, data as Record<string, unknown>);
    } else if (level === "error") {
      console.error(`[ERROR]`, logEntry);
    } else if (level === "warn") {
      console.warn(`[WARN]`, logEntry);
    } else {
      console.error(`[INFO]`, logEntry);
    }
  };

  return {
    id: nodeId,
    name: nodeName,
    type: nodeType,
    metadata: input.metadata,
    parameters: input.parameters,

    get inputPorts(): NodePortDefinition[] {
      return input.ports?.input || [];
    },

    get outputPorts(): NodePortDefinition[] {
      return input.ports?.output || [];
    },

    async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
      try {
        logExecution(context, "info", `Executing ${nodeName} node`, {
          nodeId,
          inputs: Object.keys(context.inputs),
        });

        const validatedParams = input.logic.getValidatedParams(context);

        const result = await input.logic.execute(context, validatedParams);

        logExecution(context, "info", `${nodeName} execution completed`, {
          success: result.success,
        });

        return result;
      } catch (error) {
        logExecution(context, "error", `${nodeName} execution failed`, {
          error,
        });
        return createErrorResult(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    },

    validate(): { valid: boolean; errors: string[] } {
      const errors: string[] = [];

      if (!nodeId || nodeId.trim() === "") {
        errors.push("Node ID is required");
      }
      if (!nodeName || nodeName.trim() === "") {
        errors.push("Node name is required");
      }
      if (!nodeType || nodeType.trim() === "") {
        errors.push("Node type is required");
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },

    isComposite: false,

    dispose(): void {},
  };
}
