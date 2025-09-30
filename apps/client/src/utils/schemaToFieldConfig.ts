import type {
  NodeFieldsConfig,
  NodeFieldConfig,
  NodeFieldControlType,
} from "@atomiton/nodes/definitions";

/**
 * Convert validation schema to field configurations
 * Extracts metadata from schema definitions to generate UI field configs
 */
export function schemaToFieldConfig(
  schema: Record<string, any>,
): NodeFieldsConfig {
  const fields: NodeFieldsConfig = {};

  // Base fields that should be skipped
  const BASE_FIELDS = [
    "id",
    "type",
    "version",
    "name",
    "description",
    "metadata",
    "nodes",
  ];

  for (const [key, schemaField] of Object.entries(schema)) {
    // Skip base fields
    if (BASE_FIELDS.includes(key)) continue;

    const field = schemaField as any;
    const def = field._def || {};

    const config: NodeFieldConfig = {
      label: formatFieldLabel(key),
      controlType: inferControlType(field, def),
    };

    // Add description as help text
    if (def.description) {
      config.helpText = def.description;
    }

    // Add default as placeholder
    if (def.defaultValue !== undefined) {
      config.placeholder = `Default: ${def.defaultValue}`;
    }

    // Add constraints from checks
    if (def.checks && Array.isArray(def.checks)) {
      for (const check of def.checks) {
        if (check.kind === "min") {
          config.min = check.value;
        }
        if (check.kind === "max") {
          config.max = check.value;
        }
      }
    }

    // Add enum options for select fields
    if (def.values) {
      const values = Array.isArray(def.values)
        ? def.values
        : Object.values(def.values);
      config.options = values.map((value: any) => ({
        value: String(value),
        label: formatFieldLabel(String(value)),
      }));
      config.controlType = "select";
    }

    // Mark required (fields that are not optional)
    // Check for optional flag
    const typeName = def.typeName;
    config.required = typeName !== "VOptional" && !def.isOptional;

    fields[key] = config;
  }

  return fields;
}

/**
 * Infer the appropriate control type from the validation schema field
 */
function inferControlType(field: any, def: any): NodeFieldControlType {
  const typeName = def.typeName;

  // Handle optional types by unwrapping
  if (typeName === "VOptional" && def.innerType) {
    return inferControlType(field, def.innerType._def || def.innerType);
  }

  // Map validation types to control types
  if (typeName === "VString") {
    // Check for specific string patterns
    if (def.checks && Array.isArray(def.checks)) {
      for (const check of def.checks) {
        if (check.kind === "email") return "email";
        if (check.kind === "url") return "url";
      }
    }
    return "text";
  }

  if (typeName === "VNumber") return "number";
  if (typeName === "VBoolean") return "boolean";
  if (typeName === "VEnum") return "select";
  if (typeName === "VObject") return "json";
  if (typeName === "VArray") return "json";
  if (typeName === "VDate") return "date";

  return "text"; // fallback
}

/**
 * Format field key to human-readable label
 */
function formatFieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, " ")
    .trim();
}
