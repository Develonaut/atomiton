import { v, type VInfer } from "@atomiton/validation";

// Connection schema
export const ConnectionSchema = v.object({
  id: v.string(),
  source: v.object({
    nodeId: v.string(),
    portId: v.string(),
  }),
  target: v.object({
    nodeId: v.string(),
    portId: v.string(),
  }),
  metadata: v.record(v.any()).optional(),
});

// Node metadata schema (no version here)
export const NodeMetadataSchema = v.object({
  label: v.string().optional(),
  description: v.string().optional(),
  category: v.string().optional(),
  deprecated: v.boolean().optional(),
});

// Node definition schema with flat structure
export const NodeDefinitionSchema = v.object({
  id: v.string(),
  type: v.string(),
  version: v.string(), // At top level
  parentId: v.string().optional(), // Flat structure
  metadata: NodeMetadataSchema.optional(),
  ports: v
    .object({
      inputs: v
        .array(
          v.object({
            id: v.string(),
            name: v.string(),
            type: v.string(),
            required: v.boolean().optional(),
          }),
        )
        .optional(),
      outputs: v
        .array(
          v.object({
            id: v.string(),
            name: v.string(),
            type: v.string(),
          }),
        )
        .optional(),
    })
    .optional(),
  config: v.record(v.any()).optional(),
});

// Executable base schema
export const ExecutableSchema = v.object({
  id: v.string(),
  type: v.string(),
  version: v.string().optional(),
});

// Flow node schema (nodes within a flow)
export const FlowNodeSchema = ExecutableSchema.extend({
  position: v.object({
    x: v.number(),
    y: v.number(),
  }),
  config: v.record(v.any()),
  label: v.string().optional(),
  parentId: v.string().optional(), // Nodes can have parents in flows
});

// Flow schema
export const FlowSchema = ExecutableSchema.extend({
  type: v.literal("flow"),
  name: v.string(),
  nodes: v.array(FlowNodeSchema), // Flat array
  connections: v.array(ConnectionSchema),
  metadata: v
    .object({
      createdAt: v.date().optional(),
      updatedAt: v.date().optional(),
      description: v.string().optional(),
      tags: v.array(v.string()).optional(),
    })
    .optional(),
});

// Execution context schema
export const ExecutionContextSchema = v.object({
  variables: v.record(v.any()).optional(),
  environment: v.record(v.string()).optional(),
  timeout: v.number().optional(),
});

// Execution result schema
export const ExecutionResultSchema = v.object({
  id: v.string(),
  status: v.enum(["pending", "running", "completed", "failed", "cancelled"]),
  result: v.any().optional(),
  error: v
    .object({
      message: v.string(),
      stack: v.string().optional(),
      code: v.string().optional(),
    })
    .optional(),
  startTime: v.date(),
  endTime: v.date().optional(),
  logs: v
    .array(
      v.object({
        timestamp: v.date(),
        level: v.enum(["debug", "info", "warn", "error"]),
        message: v.string(),
        data: v.any().optional(),
      }),
    )
    .optional(),
});

// Storage item schema
export const StorageItemSchema = v.object({
  id: v.string(),
  type: v.enum(["flow", "template", "component"]),
  name: v.string(),
  data: FlowSchema,
  metadata: v.object({
    createdAt: v.date(),
    updatedAt: v.date(),
    lastOpenedAt: v.date().optional(),
    tags: v.array(v.string()).optional(),
    description: v.string().optional(),
  }),
});

// Type exports
export type NodeDefinition = VInfer<typeof NodeDefinitionSchema>;
export type NodeMetadata = VInfer<typeof NodeMetadataSchema>;
export type Executable = VInfer<typeof ExecutableSchema>;
export type FlowNode = VInfer<typeof FlowNodeSchema>;
export type Flow = VInfer<typeof FlowSchema>;
export type Connection = VInfer<typeof ConnectionSchema>;
export type ExecutionContext = VInfer<typeof ExecutionContextSchema>;
export type ExecutionResult = VInfer<typeof ExecutionResultSchema>;
export type StorageItem = VInfer<typeof StorageItemSchema>;
