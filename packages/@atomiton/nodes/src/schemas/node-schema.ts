/**
 * Node Schema Validation
 *
 * Shared schema definitions for validating node structures.
 * Used by both atomic and composite nodes.
 */

import v from "@atomiton/validation";

/**
 * Node metadata schema
 */
export const NodeMetadataSchema = v
  .object({
    variant: v.string().optional(),
    created: v.string().datetime().optional(),
    modified: v.string().datetime().optional(),
    author: v.string().optional(),
    source: v
      .enum(["system", "user", "community", "organization", "marketplace"])
      .optional(),
    tags: v.array(v.string()).optional(),
    icon: v.string().optional(),
    documentationUrl: v.string().url().optional(),
    experimental: v.boolean().optional(),
    deprecated: v.boolean().optional(),
  })
  .catchall(v.unknown());

/**
 * Node port definition schema
 */
export const NodePortDefinitionSchema = v.object({
  id: v.string().min(1),
  name: v.string().min(1),
  type: v.enum(["input", "output", "trigger", "error"]),
  dataType: v.string().min(1),
  required: v.boolean().optional(),
  multiple: v.boolean().optional(),
  description: v.string().optional(),
  defaultValue: v.unknown().optional(),
});

/**
 * Node edge schema (for connecting nodes)
 */
export const NodeEdgeSchema = v.object({
  id: v.string().min(1),
  source: v.string().min(1),
  target: v.string().min(1),
  sourceHandle: v.string().optional(),
  targetHandle: v.string().optional(),
  type: v.string().optional(),
  data: v.record(v.unknown()).optional(),
  style: v.record(v.unknown()).optional(),
  // React Flow properties
  animated: v.boolean().optional(),
  hidden: v.boolean().optional(),
  deletable: v.boolean().optional(),
  selectable: v.boolean().optional(),
});

/**
 * Node position schema (for UI)
 */
export const NodePositionSchema = v.object({
  x: v.number(),
  y: v.number(),
});

/**
 * Node settings schema
 */
export const NodeSettingsSchema = v.object({
  runtime: v
    .object({
      timeout: v.number().optional(),
      retries: v.number().optional(),
      parallel: v.boolean().optional(),
    })
    .optional(),
  ui: v
    .object({
      color: v.string().optional(),
      position: NodePositionSchema.optional(),
      size: v
        .object({
          width: v.number(),
          height: v.number(),
        })
        .optional(),
    })
    .optional(),
});

/**
 * Base node schema (shared by atomic and composite)
 */
export const NodeSchema = v.object({
  id: v.string().min(1),
  name: v.string().min(1),
  description: v.string().optional(),
  category: v.string().min(1),
  type: v.enum(["atomic", "composite"]),
  version: v.string().optional(),
  metadata: NodeMetadataSchema.optional(),
  settings: NodeSettingsSchema.optional(),
});
