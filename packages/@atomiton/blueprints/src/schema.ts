import { z } from "zod";

/**
 * Zod schemas for Blueprint validation
 *
 * These schemas define the structure and validation rules for blueprints,
 * providing runtime type safety and validation capabilities.
 */

// ==========================
// Primitive Schemas
// ==========================

export const BlueprintPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const BlueprintNodeDataSchema = z.record(z.unknown());

export const BlueprintEdgeDataSchema = z.record(z.unknown());

// ==========================
// Metadata Schema
// ==========================

export const BlueprintMetadataSchema = z
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

export const BlueprintVariableSchema = z.object({
  type: z.string().min(1),
  defaultValue: z.unknown().optional(),
  description: z.string().optional(),
});

export const BlueprintVariablesSchema = z.record(BlueprintVariableSchema);

// ==========================
// Settings Schema
// ==========================

export const BlueprintSettingsSchema = z.object({
  runtime: z.record(z.unknown()).optional(),
  ui: z.record(z.unknown()).optional(),
});

// ==========================
// Node and Edge Schemas
// ==========================

export const BlueprintNodeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  position: BlueprintPositionSchema,
  data: BlueprintNodeDataSchema,
});

export const BlueprintEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  data: BlueprintEdgeDataSchema.optional(),
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
// Node Definition Schema (base for BlueprintDefinition)
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
  inputs: z.array(NodePortDefinitionSchema).optional(), // Legacy compatibility
  outputs: z.array(NodePortDefinitionSchema).optional(), // Legacy compatibility
  icon: z.string().optional(),
  defaultConfig: z.record(z.unknown()).optional(),
  configSchema: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ==========================
// Main Blueprint Definition Schema
// ==========================

export const BlueprintDefinitionSchema = z
  .object({
    // Core identification fields (from NodeDefinition)
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    category: z.string().min(1),
    type: z.string().min(1),
    version: z.string().optional(),

    // Port definitions (from NodeDefinition)
    inputPorts: z.array(NodePortDefinitionSchema).optional(),
    outputPorts: z.array(NodePortDefinitionSchema).optional(),

    // Legacy compatibility (from NodeDefinition)
    inputs: z.array(NodePortDefinitionSchema).optional(),
    outputs: z.array(NodePortDefinitionSchema).optional(),

    // UI and configuration (from NodeDefinition)
    icon: z.string().optional(),
    defaultConfig: z.record(z.unknown()).optional(),
    configSchema: z.record(z.unknown()).optional(),

    // Blueprint-specific fields
    nodes: z.array(BlueprintNodeSchema),
    edges: z.array(BlueprintEdgeSchema),
    variables: BlueprintVariablesSchema.optional(),
    settings: BlueprintSettingsSchema.optional(),

    // Required metadata for blueprints
    metadata: BlueprintMetadataSchema,
  })
  .strict();

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

export const BlueprintValidationContextSchema = z.object({
  availableNodeTypes: z.array(z.string()),
  strictMode: z.boolean().optional(),
});

// ==========================
// Schema Configuration
// ==========================

export const BlueprintSchemaDefinition = z.object({
  version: z.string(),
  type: z.literal("blueprint"),
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

export const BlueprintAPIErrorSchema = z.object({
  message: z.string(),
  code: z.string(),
  details: z.record(z.unknown()).optional(),
});

export const BlueprintAPIResultSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: BlueprintAPIErrorSchema.optional(),
  warnings: z.array(BlueprintAPIErrorSchema).optional(),
});

// ==========================
// Schema Export
// ==========================

/**
 * Main schema for validating complete blueprint definitions
 */
export const BLUEPRINT_SCHEMA = BlueprintDefinitionSchema;

/**
 * Schema version for tracking breaking changes
 */
export const SCHEMA_VERSION = "1.0.0";

/**
 * Required fields for a valid blueprint
 */
export const REQUIRED_BLUEPRINT_FIELDS = [
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
export const OPTIONAL_BLUEPRINT_FIELDS = [
  "description",
  "version",
  "variables",
  "settings",
  "inputPorts",
  "outputPorts",
  "inputs", // Legacy
  "outputs", // Legacy
  "icon",
  "defaultConfig",
  "configSchema",
] as const;

// ==========================
// Type Inference
// ==========================

// Infer TypeScript types from Zod schemas for consistency
export type InferredBlueprintDefinition = z.infer<
  typeof BlueprintDefinitionSchema
>;
export type InferredBlueprintNode = z.infer<typeof BlueprintNodeSchema>;
export type InferredBlueprintEdge = z.infer<typeof BlueprintEdgeSchema>;
export type InferredBlueprintMetadata = z.infer<typeof BlueprintMetadataSchema>;
export type InferredValidationResult = z.infer<typeof ValidationResultSchema>;
export type InferredValidationError = z.infer<typeof ValidationErrorSchema>;
