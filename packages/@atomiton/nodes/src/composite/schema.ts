import { z } from "zod";

const CompositePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const CompositeNodeDataSchema = z.record(z.unknown());

const CompositeEdgeDataSchema = z.record(z.unknown());

const CompositeMetadataSchema = z
  .object({
    created: z.string().datetime(),
    modified: z.string().datetime(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  .catchall(z.unknown());

const CompositeVariableSchema = z.object({
  type: z.string().min(1),
  defaultValue: z.unknown().optional(),
  description: z.string().optional(),
});

const CompositeVariablesSchema = z.record(CompositeVariableSchema);

const CompositeSettingsSchema = z.object({
  runtime: z.record(z.unknown()).optional(),
  ui: z.record(z.unknown()).optional(),
});

const CompositeNodeSpecSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  position: CompositePositionSchema,
  data: CompositeNodeDataSchema,
});

const CompositeEdgePortSchema = z.object({
  nodeId: z.string().min(1),
  portId: z.string().min(1),
});

const CompositeEdgeSchema = z.object({
  id: z.string().min(1),
  source: CompositeEdgePortSchema,
  target: CompositeEdgePortSchema,
  data: CompositeEdgeDataSchema.optional(),
});

const NodePortDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  dataType: z.string().min(1),
  required: z.boolean().optional(),
  multiple: z.boolean().optional(),
  description: z.string().optional(),
  defaultValue: z.unknown().optional(),
});

const NodeDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  type: z.string().min(1),
  version: z.string().optional(),
  inputPorts: z.array(NodePortDefinitionSchema).optional(),
  outputPorts: z.array(NodePortDefinitionSchema).optional(),
  icon: z.string().optional(),
  defaultConfig: z.record(z.unknown()).optional(),
  configSchema: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const CompositeDefinitionSchema = NodeDefinitionSchema.extend({
  nodes: z.array(CompositeNodeSpecSchema),
  edges: z.array(CompositeEdgeSchema),
  variables: CompositeVariablesSchema.optional(),
  settings: CompositeSettingsSchema.optional(),
  metadata: CompositeMetadataSchema,
}).strict();

export const COMPOSITE_SCHEMA = CompositeDefinitionSchema;
