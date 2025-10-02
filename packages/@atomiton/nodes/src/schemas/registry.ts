/**
 * Node Schema Registry
 * Central registry for all node schemas (runtime validation)
 */

import type { VInfer, VObject, VRawShape } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

// Import all node schema shapes
import httpRequestSchemaShape from "#schemas/http-request";
import editFieldsSchemaShape from "#schemas/edit-fields";
import fileSystemSchemaShape from "#schemas/file-system";
import groupSchemaShape from "#schemas/group";
import imageSchemaShape from "#schemas/image";
import loopSchemaShape from "#schemas/loop";
import parallelSchemaShape from "#schemas/parallel";
import shellCommandSchemaShape from "#schemas/shell-command";
import spreadsheetSchemaShape from "#schemas/spreadsheet";
import transformSchemaShape from "#schemas/transform";

/**
 * Node schema entry containing the validation schema and derived functions
 */
export type NodeSchemaEntry<T extends VRawShape = VRawShape> = {
  /** The raw validation schema shape for node-specific parameters */
  schema: T;

  /** The full schema including base parameters */
  fullSchema: VObject<T & typeof baseSchema.shape>;

  /** Parse and validate a parameters object */
  parse(params: unknown): VInfer<VObject<T & typeof baseSchema.shape>>;

  /** Safely parse a parameters object */
  safeParse(
    params: unknown,
  ): ReturnType<VObject<T & typeof baseSchema.shape>["safeParse"]>;

  /** Check if a parameters object is valid */
  isValid(params: unknown): boolean;

  /** Merge partial parameters with defaults */
  withDefaults(
    defaults: VInfer<VObject<T & typeof baseSchema.shape>>,
    partialParams?: Partial<VInfer<VObject<T & typeof baseSchema.shape>>>,
  ): VInfer<VObject<T & typeof baseSchema.shape>>;
};

/**
 * Registry of all available node schemas
 * Schemas are registered separately in register-all.ts
 */
export const nodeSchemaRegistry = new Map<string, NodeSchemaEntry>();

/**
 * Register a node schema
 * Called by register-all.ts for each node type
 */
export function registerNodeSchema<T extends VRawShape>(
  nodeType: string,
  schema: T,
): void {
  const fullSchema = baseSchema.extend(schema);

  const entry = {
    schema,
    fullSchema,

    parse(params: unknown) {
      return fullSchema.parse(params);
    },

    safeParse(params: unknown) {
      return fullSchema.safeParse(params);
    },

    isValid(params: unknown): boolean {
      return fullSchema.safeParse(params).success;
    },

    withDefaults(
      defaults: Record<string, unknown>,
      partialParams?: Record<string, unknown>,
    ) {
      return {
        ...defaults,
        ...partialParams,
      };
    },
  } as NodeSchemaEntry;

  nodeSchemaRegistry.set(nodeType, entry);
}

/**
 * Get a node schema by node type
 */
export function getNodeSchema(nodeType: string): NodeSchemaEntry | undefined {
  return nodeSchemaRegistry.get(nodeType);
}

/**
 * Get all node schemas
 */
export function getAllNodeSchemas(): Map<string, NodeSchemaEntry> {
  return nodeSchemaRegistry;
}

/**
 * Check if a node schema exists
 */
export function hasNodeSchema(nodeType: string): boolean {
  return nodeSchemaRegistry.has(nodeType);
}

/**
 * Get all registered node types
 */
export function getNodeSchemaTypes(): string[] {
  return Array.from(nodeSchemaRegistry.keys());
}

/**
 * Clear all registered schemas
 * Useful for testing
 */
export function clearSchemaRegistry(): void {
  nodeSchemaRegistry.clear();
}

/**
 * Register all node schemas
 * This is called once at application startup
 */
export function registerAllNodeSchemas(): void {
  // Register each node type's schema
  registerNodeSchema("http-request", httpRequestSchemaShape);
  registerNodeSchema("edit-fields", editFieldsSchemaShape);
  registerNodeSchema("file-system", fileSystemSchemaShape);
  registerNodeSchema("group", groupSchemaShape);
  registerNodeSchema("image", imageSchemaShape);
  registerNodeSchema("loop", loopSchemaShape);
  registerNodeSchema("parallel", parallelSchemaShape);
  registerNodeSchema("shell-command", shellCommandSchemaShape);
  registerNodeSchema("spreadsheet", spreadsheetSchemaShape);
  registerNodeSchema("transform", transformSchemaShape);
}

// Auto-register on module import for Node.js environments
if (typeof process !== "undefined" && process.versions?.node) {
  registerAllNodeSchemas();
}
