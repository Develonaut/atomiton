/**
 * Validation functions for YAML deserialization
 * Extracted validation logic for type safety
 */

import type { NodeEdgeType } from "#core/types/edges.js";
import type {
  NodeCategory,
  NodeIcon,
  NodeMetadataSource,
  NodeMetadataType,
  NodeRuntime,
} from "#core/types/metadata.js";
import type { NodeFieldControlType } from "#core/types/parameters.js";

/**
 * Helper to validate and convert string to NodeMetadataType
 */
export function validateType(
  type: string | undefined,
): NodeMetadataType | undefined {
  if (!type) return undefined;
  const validTypes: NodeMetadataType[] = [
    "code",
    "csv-reader",
    "file-system",
    "http-request",
    "image",
    "loop",
    "parallel",
    "shell-command",
    "transform",
    "group",
  ];
  if (validTypes.includes(type as NodeMetadataType)) {
    return type as NodeMetadataType;
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
    "group",
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
