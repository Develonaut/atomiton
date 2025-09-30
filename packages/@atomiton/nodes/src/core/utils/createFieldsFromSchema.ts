/**
 * Field Config Auto-Derivation Utility
 * Creates UI field configurations from Zod schemas with selective overrides
 */

import type {
  NodeFieldConfig,
  NodeFieldControlType,
  NodeFieldsConfig,
} from "#core/types/parameters";
import { titleCase } from "@atomiton/utils";
import type { ZodObject, ZodRawShape, ZodTypeAny } from "@atomiton/validation";

/**
 * Override configuration for field configs (all properties optional)
 */
type FieldConfigOverrides = Record<string, Partial<NodeFieldConfig>>;

/**
 * Create UI field configurations from Zod schema with selective overrides
 *
 * Auto-derives control types, labels, help text, constraints, and options from
 * the schema, allowing selective overrides for UI-specific concerns.
 *
 * @example
 * ```typescript
 * const fields = createFieldsFromSchema(mySchema, {
 *   // Only override special cases
 *   code: {
 *     controlType: "code",
 *     rows: 10
 *   }
 * });
 * ```
 */
export function createFieldsFromSchema<T extends ZodObject<ZodRawShape>>(
  schema: T,
  overrides?: FieldConfigOverrides,
): NodeFieldsConfig {
  const derived: NodeFieldsConfig = {};
  const shape = schema.shape;

  for (const [key, zodType] of Object.entries(shape)) {
    // Start with auto-derived config
    const config = deriveFieldConfig(key, zodType as ZodTypeAny);

    // Apply overrides
    derived[key] = {
      ...config,
      ...overrides?.[key],
    };
  }

  return derived;
}

/**
 * Derive a complete field configuration from a Zod type
 */
function deriveFieldConfig(key: string, zodType: ZodTypeAny): NodeFieldConfig {
  const def = zodType._def;

  const config: NodeFieldConfig = {
    controlType: inferControlType(zodType, def),
    label: formatFieldLabel(key),
  };

  // Extract metadata from Zod schema
  if (def.description) {
    config.helpText = def.description;
  }

  // Extract required flag (unwrap optional)
  const isOptional = def.typeName === "ZodOptional";
  config.required = !isOptional;

  // Unwrap optional and default wrappers to get to the base type
  let innerType = zodType;
  let innerDef = def;

  // Unwrap optional
  if (innerDef.typeName === "ZodOptional") {
    innerType = innerDef.innerType;
    innerDef = innerType._def;
  }

  // Unwrap default (after optional)
  if (innerDef.typeName === "ZodDefault") {
    innerType = innerDef.innerType;
    innerDef = innerType._def;
  }

  // Extract constraints from checks
  if (innerDef.checks && Array.isArray(innerDef.checks)) {
    for (const check of innerDef.checks) {
      if (check.kind === "min") {
        // Handle inclusive vs exclusive (positive() creates min with inclusive: false)
        config.min = check.inclusive === false ? check.value + 1 : check.value;
      }
      if (check.kind === "max") {
        config.max = check.inclusive === false ? check.value - 1 : check.value;
      }
    }
  }

  // Auto-generate select options from enum
  if (innerDef.typeName === "ZodEnum" && innerDef.values) {
    config.options = innerDef.values.map((value: string) => ({
      value,
      label: formatFieldLabel(value),
    }));
  }

  // Use default value as placeholder hint (check original def, not unwrapped)
  // Default can be at the top level or after optional
  let checkDef = def;
  if (def.typeName === "ZodOptional") {
    checkDef = def.innerType._def;
  }

  if (checkDef.typeName === "ZodDefault") {
    const defaultValue = checkDef.defaultValue();
    if (defaultValue !== undefined && defaultValue !== null) {
      // Format default value for display
      const displayValue =
        typeof defaultValue === "object"
          ? JSON.stringify(defaultValue)
          : String(defaultValue);
      config.placeholder = `Default: ${displayValue}`;
    }
  }

  return config;
}

/**
 * Infer UI control type from Zod schema type
 */
function inferControlType(
  zodType: ZodTypeAny,
  def: ZodTypeAny["_def"],
): NodeFieldControlType {
  const typeName = def.typeName;

  // Unwrap optional
  if (typeName === "ZodOptional" && def.innerType) {
    return inferControlType(def.innerType, def.innerType._def);
  }

  // Unwrap default
  if (typeName === "ZodDefault" && def.innerType) {
    return inferControlType(def.innerType, def.innerType._def);
  }

  // Map Zod types to UI control types
  if (typeName === "ZodString") {
    // Check for specific string validations
    if (def.checks && Array.isArray(def.checks)) {
      for (const check of def.checks) {
        if (check.kind === "email") return "email";
        if (check.kind === "url") return "url";
      }
    }
    return "text";
  }

  if (typeName === "ZodNumber") return "number";
  if (typeName === "ZodBoolean") return "boolean";
  if (typeName === "ZodEnum") return "select";
  if (typeName === "ZodObject") return "json";
  if (typeName === "ZodArray") return "json";
  if (typeName === "ZodRecord") return "json";
  if (typeName === "ZodDate") return "date";

  return "text"; // fallback
}

/**
 * Format field key to human-readable label
 * "maxIterations" → "Max Iterations"
 * "http_timeout" → "Http Timeout"
 */
function formatFieldLabel(key: string): string {
  // Insert space before capital letters (handle camelCase)
  const spacedKey = key.replace(/([A-Z])/g, " $1");
  // Use titleCase from @atomiton/utils to handle snake_case, kebab-case, and capitalize
  return titleCase(spacedKey);
}
