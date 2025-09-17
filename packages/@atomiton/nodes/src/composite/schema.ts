import v from "@atomiton/validation";

const CompositePositionSchema = v.object({
  x: v.number(),
  y: v.number(),
});

const CompositeNodeDataSchema = v.record(v.unknown());

const CompositeEdgeDataSchema = v.record(v.unknown());

const CompositeMetadataSchema = v
  .object({
    created: v.string().datetime(),
    modified: v.string().datetime(),
    author: v.string().optional(),
    tags: v.array(v.string()).optional(),
  })
  .catchall(v.unknown());

const CompositeVariableSchema = v.object({
  type: v.string().min(1),
  defaultValue: v.unknown().optional(),
  description: v.string().optional(),
});

const CompositeVariablesSchema = v.record(CompositeVariableSchema);

const CompositeSettingsSchema = v.object({
  runtime: v.record(v.unknown()).optional(),
  ui: v.record(v.unknown()).optional(),
});

const CompositeNodeSpecSchema = v.object({
  id: v.string().min(1),
  type: v.string().min(1),
  position: CompositePositionSchema,
  data: CompositeNodeDataSchema.optional(),

  // Visual editor properties
  width: v.number().optional(),
  height: v.number().optional(),
  parentId: v.string().optional(),
  dragHandle: v.string().optional(),
  style: v.record(v.unknown()).optional(),
  className: v.string().optional(),
});

const CompositeEdgeSchema = v.object({
  id: v.string().min(1),
  source: v.string().min(1),
  target: v.string().min(1),
  sourceHandle: v.string().optional(),
  targetHandle: v.string().optional(),
  type: v.string().optional(),
  data: CompositeEdgeDataSchema.optional(),
  style: v.record(v.unknown()).optional(),
  // Additional React Flow properties
  animated: v.boolean().optional(),
  hidden: v.boolean().optional(),
  deletable: v.boolean().optional(),
  selectable: v.boolean().optional(),
});

const NodePortDefinitionSchema = v.object({
  id: v.string().min(1),
  name: v.string().min(1),
  type: v.string().min(1),
  dataType: v.string().min(1),
  required: v.boolean().optional(),
  multiple: v.boolean().optional(),
  description: v.string().optional(),
  defaultValue: v.unknown().optional(),
});

const NodeDefinitionSchema = v.object({
  id: v.string().min(1),
  name: v.string().min(1),
  description: v.string().optional(),
  category: v.string().min(1),
  type: v.string().min(1),
  version: v.string().optional(),
  inputPorts: v.array(NodePortDefinitionSchema).optional(),
  outputPorts: v.array(NodePortDefinitionSchema).optional(),
  icon: v.string().optional(),
  defaultConfig: v.record(v.unknown()).optional(),
  configSchema: v.record(v.unknown()).optional(),
  metadata: v.record(v.unknown()).optional(),
});

const CompositeDefinitionSchema = NodeDefinitionSchema.extend({
  nodes: v.array(CompositeNodeSpecSchema),
  edges: v.array(CompositeEdgeSchema),
  variables: CompositeVariablesSchema.optional(),
  settings: CompositeSettingsSchema.optional(),
  metadata: CompositeMetadataSchema,
}).strict();

export const COMPOSITE_SCHEMA = CompositeDefinitionSchema;
