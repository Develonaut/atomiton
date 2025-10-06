/**
 * Strict validation schemas for Node RPC channel
 *
 * These schemas ensure type safety at RPC boundaries with complete
 * field validation (no passthrough) and proper error messages.
 */

import { v, type VInfer } from "@atomiton/validation";

/**
 * NodeDefinition schema with all required and optional fields
 * Strict validation - no unknown fields allowed
 */
export const nodeDefinitionSchema: any = v.object({
  // Required fields
  id: v.string().min(1, "Node ID is required"),
  type: v.string().min(1, "Node type is required"),

  // Optional fields
  version: v.string().optional(),
  parentId: v.string().optional(),
  name: v.string().optional(),
  position: v
    .object({
      x: v.number(),
      y: v.number(),
    })
    .optional(),

  // Metadata
  metadata: v
    .object({
      description: v.string().optional(),
      category: v.string().optional(),
      tags: v.array(v.string()).optional(),
      icon: v.string().optional(),
      color: v.string().optional(),
    })
    .optional(),

  // Parameters (node-specific configuration)
  parameters: v.record(v.string(), v.unknown()).optional(),

  // Group nodes
  nodes: v.lazy((): any => v.array(nodeDefinitionSchema)).optional(),
  edges: v
    .array(
      v.object({
        id: v.string(),
        source: v.string(),
        target: v.string(),
        sourceHandle: v.string().optional(),
        targetHandle: v.string().optional(),
      }),
    )
    .optional(),
});

/**
 * Execution context schema with debug options
 */
export const executionContextSchema = v.object({
  nodeId: v.string().optional(),
  executionId: v.string().optional(),
  variables: v.record(v.string(), v.unknown()).optional(),
  input: v.record(v.string(), v.unknown()).optional(),
  parentContext: v.any().optional(), // Recursive type
  slowMo: v.number().min(0).max(10000).optional(),
  debug: v
    .object({
      simulateError: v
        .object({
          nodeId: v.union([v.string(), v.literal("random")]),
          errorType: v.enum([
            "generic",
            "timeout",
            "network",
            "validation",
            "permission",
          ]),
          message: v.string().optional(),
          delayMs: v.number().min(0).max(60000).optional(),
        })
        .optional(),
      simulateLongRunning: v
        .object({
          nodeId: v.union([v.string(), v.literal("random")]),
          delayMs: v.number().min(0).max(60000),
        })
        .optional(),
    })
    .optional(),
});

/**
 * Node execute request schema
 */
export const nodeExecuteRequestSchema = v.object({
  node: nodeDefinitionSchema,
  context: executionContextSchema.optional(),
});

/**
 * Node validate request schema
 */
export const nodeValidateRequestSchema = v.object({
  node: nodeDefinitionSchema,
});

/**
 * Execution result schema
 */
export const executionResultSchema = v.object({
  success: v.boolean(),
  data: v.unknown().optional(),
  error: v
    .object({
      code: v.string(),
      message: v.string(),
      nodeId: v.string().optional(),
      executionId: v.string().optional(),
      timestamp: v.union([v.string(), v.date()]),
      stack: v.string().optional(),
      cause: v.unknown().optional(),
      context: v.record(v.string(), v.unknown()).optional(),
    })
    .optional(),
  duration: v.number().optional(),
  executedNodes: v.array(v.string()).optional(),
  context: executionContextSchema.optional(),
  trace: v.any().optional(), // Complex nested type
});

/**
 * Progress event schema
 */
export const progressEventSchema = v.object({
  nodeId: v.string(),
  executionId: v.string(),
  progress: v.number().min(0).max(100),
  message: v.string(),
  nodes: v.array(
    v.object({
      id: v.string(),
      name: v.string().optional(),
      type: v.string(),
      state: v.enum([
        "pending",
        "executing",
        "completed",
        "failed",
        "cancelled",
      ]),
      progress: v.number().min(0).max(100),
      startTime: v.number().optional(),
      endTime: v.number().optional(),
      duration: v.number().optional(),
      error: v.string().optional(),
    }),
  ),
  graph: v
    .object({
      executionOrder: v.array(v.string()),
      criticalPath: v.array(v.string()),
      totalWeight: v.number(),
      maxParallelism: v.number(),
      edges: v.array(
        v.object({
          source: v.string(),
          target: v.string(),
          sourceHandle: v.string().optional(),
          targetHandle: v.string().optional(),
        }),
      ),
    })
    .optional(),
});

/**
 * Type exports for use in handlers
 */
export type NodeDefinition = VInfer<typeof nodeDefinitionSchema>;
export type ExecutionContext = VInfer<typeof executionContextSchema>;
export type NodeExecuteRequest = VInfer<typeof nodeExecuteRequestSchema>;
export type NodeValidateRequest = VInfer<typeof nodeValidateRequestSchema>;
export type ExecutionResult = VInfer<typeof executionResultSchema>;
export type ProgressEvent = VInfer<typeof progressEventSchema>;
