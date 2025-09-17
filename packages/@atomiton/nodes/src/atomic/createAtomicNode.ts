/**
 * Factory function for creating atomic nodes (runtime instances)
 */

import type { IAtomicNode } from "../interfaces/IExecutableNode";
import type { INodeParameters } from "../interfaces/INodeParameters";
import type { INodeMetadata } from "../interfaces/INodeMetadata";
import type { INodeExecutable } from "../interfaces/INodeExecutable";
import type { NodePortDefinition } from "../types";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
} from "../exports/executable/execution-types";

export type AtomicNodeInput<TConfig = unknown> = {
  metadata: INodeMetadata;
  parameters: INodeParameters;
  executable: INodeExecutable<TConfig>;
  ports?: {
    input?: NodePortDefinition[];
    output?: NodePortDefinition[];
  };
};

export function createAtomicNode<TConfig = unknown>(
  input: AtomicNodeInput<TConfig>,
): IAtomicNode {
  const nodeId = input.metadata.id;
  const nodeType = "atomic" as const;
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

        const validatedParams = input.executable.getValidatedParams(context);

        const result = await input.executable.execute(context, validatedParams);

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

    dispose(): void {},
  };
}
