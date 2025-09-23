/**
 * Validation functions for YAML deserialization
 * Extracted validation logic for type safety
 */

import type {
  NodeCategory,
  NodeEdgeType,
  NodeFieldControlType,
  NodeIcon,
  NodeMetadataSource,
  NodeMetadataVariant,
  NodeRuntime,
} from "#core/types/definition.js";

/**
 * Helper to validate and convert string to NodeMetadataVariant
 */
export function validateVariant(
  variant: string | undefined,
): NodeMetadataVariant | undefined {
  if (!variant) return undefined;
  const validVariants: NodeMetadataVariant[] = [
    "code",
    "csv-reader",
    "file-system",
    "http-request",
    "image-composite",
    "loop",
    "parallel",
    "shell-command",
    "transform",
    "workflow",
  ];
  if (validVariants.includes(variant as NodeMetadataVariant)) {
    return variant as NodeMetadataVariant;
  }
  return undefined;
}

/**
 * Helper to validate and convert string to NodeMetadataSource
 */
export function validateSource(
  source: string | undefined,
): NodeMetadataSource | undefined {
  if (!source) return undefined;
  const validSources: NodeMetadataSource[] = [
    "system",
    "user",
    "community",
    "organization",
    "marketplace",
  ];
  if (validSources.includes(source as NodeMetadataSource)) {
    return source as NodeMetadataSource;
  }
  return "user";
}

/**
 * Helper to validate and convert string to NodeCategory
 */
export function validateCategory(
  category: string | undefined,
): NodeCategory | undefined {
  if (!category) return undefined;
  const validCategories: NodeCategory[] = [
    "io",
    "data",
    "logic",
    "media",
    "system",
    "ai",
    "database",
    "analytics",
    "communication",
    "utility",
    "user",
    "composite",
  ];
  if (validCategories.includes(category as NodeCategory)) {
    return category as NodeCategory;
  }
  return "user";
}

/**
 * Helper to validate and convert string to NodeIcon
 */
export function validateIcon(icon: string | undefined): NodeIcon | undefined {
  if (!icon) return undefined;
  const validIcons: NodeIcon[] = [
    "file",
    "folder",
    "database",
    "table-2",
    "cloud",
    "globe-2",
    "mail",
    "message-square",
    "code-2",
    "terminal",
    "cpu",
    "git-branch",
    "wand-2",
    "zap",
    "layers",
    "image",
    "repeat",
    "settings",
    "filter",
    "search",
    "lock",
    "unlock",
    "user",
    "users",
    "info",
    "help-circle",
  ];
  if (validIcons.includes(icon as NodeIcon)) {
    return icon as NodeIcon;
  }
  return "file";
}

/**
 * Helper to validate and convert runtime
 */
export function validateRuntime(runtime: unknown): NodeRuntime | undefined {
  if (!runtime || typeof runtime !== "string") return undefined;

  const validRuntimes: NodeRuntime[] = [
    "typescript",
    "python",
    "rust",
    "wasm",
    "golang",
  ];

  if (validRuntimes.includes(runtime as NodeRuntime)) {
    return runtime as NodeRuntime;
  }
  return undefined;
}

/**
 * Helper to validate and convert string to NodeEdgeType
 */
export function validateEdgeType(
  type: string | undefined,
): NodeEdgeType | undefined {
  if (!type) return undefined;
  const validTypes: NodeEdgeType[] = [
    "bezier",
    "straight",
    "step",
    "smoothstep",
  ];
  if (validTypes.includes(type as NodeEdgeType)) {
    return type as NodeEdgeType;
  }
  return undefined;
}

/**
 * Helper to validate and convert string to NodeFieldControlType
 */
export function validateControlType(
  control: string | undefined,
): NodeFieldControlType | undefined {
  if (!control) return undefined;
  const validTypes: NodeFieldControlType[] = [
    "text",
    "textarea",
    "password",
    "email",
    "url",
    "number",
    "range",
    "boolean",
    "select",
    "date",
    "datetime",
    "code",
    "color",
    "file",
    "json",
  ];
  if (validTypes.includes(control as NodeFieldControlType)) {
    return control as NodeFieldControlType;
  }
  return undefined;
}
