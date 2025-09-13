import { z } from "zod";

/**
 * Zod schemas for Composite validation
 *
 * These schemas define the structure and validation rules for composites,
 * providing runtime type safety and validation capabilities.
 */

// ==========================
// Primitive Schemas
// ==========================

export const CompositePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const CompositeNodeDataSchema = z.record(z.unknown());

export const CompositeEdgeDataSchema = z.record(z.unknown());

// ==========================
// Metadata Schema
// ==========================

export const CompositeMetadataSchema = z
  .object({
    created: z.string().datetime(),
    modified: z.string().datetime(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  .catchall(z.unknown());

// ==========================
// Variable Schema
// ==========================

export const CompositeVariableSchema = z.object({
  type: z.string().min(1),
  defaultValue: z.unknown().optional(),
  description: z.string().optional(),
});

export const CompositeVariablesSchema = z.record(CompositeVariableSchema);

// ==========================
// Settings Schema
// ==========================

export const CompositeSettingsSchema = z.object({
  runtime: z.record(z.unknown()).optional(),
  ui: z.record(z.unknown()).optional(),
});

// ==========================
// Node and Edge Schemas
// ==========================

export const CompositeNodeSpecSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  position: CompositePositionSchema,
  data: CompositeNodeDataSchema,
});

export const CompositeEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  data: CompositeEdgeDataSchema.optional(),
});

// ==========================
// Port Definition Schema (from NodeDefinition)
// ==========================

export const NodePortDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  dataType: z.string().min(1),
  required: z.boolean().optional(),
  multiple: z.boolean().optional(),
  description: z.string().optional(),
  defaultValue: z.unknown().optional(),
});

// ==========================
// Node Definition Schema (base for CompositeDefinition)
// ==========================

export const NodeDefinitionSchema = z.object({
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

// ==========================
// Main Composite Definition Schema
// ==========================

export const CompositeDefinitionSchema = NodeDefinitionSchema.extend({
  // Composite-specific fields - the only things unique to composites
  nodes: z.array(CompositeNodeSpecSchema),
  edges: z.array(CompositeEdgeSchema),
  variables: CompositeVariablesSchema.optional(),
  settings: CompositeSettingsSchema.optional(),

  // Override metadata to be required and use composite-specific type
  metadata: CompositeMetadataSchema,
}).strict();

// ==========================
// Validation Schemas
// ==========================

export const ValidationErrorSchema = z.object({
  path: z.string(),
  message: z.string(),
  code: z.string(),
  data: z.unknown().optional(),
});

export const ValidationResultSchema = z.object({
  success: z.boolean(),
  errors: z.array(ValidationErrorSchema),
  warnings: z.array(ValidationErrorSchema).optional(),
});

export const CompositeValidationContextSchema = z.object({
  availableNodeTypes: z.array(z.string()),
  strictMode: z.boolean().optional(),
});

// ==========================
// Schema Configuration
// ==========================

export const CompositeSchemaDefinition = z.object({
  version: z.string(),
  type: z.literal("composite"),
  properties: z.record(z.unknown()),
  required: z.array(z.string()),
});

// ==========================
// Transformation Schemas
// ==========================

export const TransformationOptionsSchema = z.object({
  preserveComments: z.boolean().optional(),
  formatOutput: z.boolean().optional(),
  validateResult: z.boolean().optional(),
});

export const TransformationResultSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  errors: z.array(ValidationErrorSchema).optional(),
  warnings: z.array(ValidationErrorSchema).optional(),
});

// ==========================
// API Schemas
// ==========================

export const CompositeAPIErrorSchema = z.object({
  message: z.string(),
  code: z.string(),
  details: z.record(z.unknown()).optional(),
});

export const CompositeAPIResultSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: CompositeAPIErrorSchema.optional(),
  warnings: z.array(CompositeAPIErrorSchema).optional(),
});

// ==========================
// Schema Export
// ==========================

/**
 * Main schema for validating complete composite definitions
 */
export const COMPOSITE_SCHEMA = CompositeDefinitionSchema;

/**
 * Schema version for tracking breaking changes
 */
export const SCHEMA_VERSION = "1.0.0";

/**
 * Required fields for a valid composite
 */
export const REQUIRED_COMPOSITE_FIELDS = [
  "id",
  "name",
  "category",
  "type",
  "metadata",
  "nodes",
  "edges",
] as const;

/**
 * Optional fields that can be omitted
 */
export const OPTIONAL_COMPOSITE_FIELDS = [
  "description",
  "version",
  "variables",
  "settings",
  "inputPorts",
  "outputPorts",
  "icon",
  "defaultConfig",
  "configSchema",
] as const;

// ==========================
// Type Inference
// ==========================

// Infer TypeScript types from Zod schemas for consistency
export type InferredCompositeDefinition = z.infer<
  typeof CompositeDefinitionSchema
>;
export type InferredCompositeNodeSpec = z.infer<typeof CompositeNodeSpecSchema>;
export type InferredCompositeEdge = z.infer<typeof CompositeEdgeSchema>;
export type InferredCompositeMetadata = z.infer<typeof CompositeMetadataSchema>;
export type InferredValidationResult = z.infer<typeof ValidationResultSchema>;
export type InferredValidationError = z.infer<typeof ValidationErrorSchema>;
