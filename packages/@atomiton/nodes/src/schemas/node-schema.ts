/**
 * Node Schema Validation
 *
 * Shared schema definitions for validating node structures.
 * Used by both atomic and composite nodes.
 */

import { z } from "zod";

/**
 * Node metadata schema
 */
export const NodeMetadataSchema = z
  .object({
    variant: z.string().optional(),
    created: z.string().datetime().optional(),
    modified: z.string().datetime().optional(),
    author: z.string().optional(),
    source: z
      .enum(["system", "user", "community", "organization", "marketplace"])
      .optional(),
    tags: z.array(z.string()).optional(),
    icon: z.string().optional(),
    documentationUrl: z.string().url().optional(),
    experimental: z.boolean().optional(),
    deprecated: z.boolean().optional(),
  })
  .catchall(z.unknown());

/**
 * Node port definition schema
 */
export const NodePortDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["input", "output", "trigger", "error"]),
  dataType: z.string().min(1),
  required: z.boolean().optional(),
  multiple: z.boolean().optional(),
  description: z.string().optional(),
  defaultValue: z.unknown().optional(),
});

/**
 * Node edge schema (for connecting nodes)
 */
export const NodeEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  type: z.string().optional(),
  data: z.record(z.unknown()).optional(),
  style: z.record(z.unknown()).optional(),
  // React Flow properties
  animated: z.boolean().optional(),
  hidden: z.boolean().optional(),
  deletable: z.boolean().optional(),
  selectable: z.boolean().optional(),
});

/**
 * Node position schema (for UI)
 */
export const NodePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

/**
 * Node settings schema
 */
export const NodeSettingsSchema = z.object({
  runtime: z
    .object({
      timeout: z.number().optional(),
      retries: z.number().optional(),
      parallel: z.boolean().optional(),
    })
    .optional(),
  ui: z
    .object({
      color: z.string().optional(),
      position: NodePositionSchema.optional(),
      size: z
        .object({
          width: z.number(),
          height: z.number(),
        })
        .optional(),
    })
    .optional(),
});

/**
 * Base node schema (shared by atomic and composite)
 */
export const NodeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  type: z.enum(["atomic", "composite"]),
  version: z.string().optional(),
  metadata: NodeMetadataSchema.optional(),
  settings: NodeSettingsSchema.optional(),
});
