import { createNodeDefinition } from "#core/factories/createNodeDefinition.js";
import { createNodeMetadata } from "#core/factories/createNodeMetadata.js";
import { createNodeParameters } from "#core/factories/createNodeParameters.js";
import { createNodePort } from "#core/factories/createNodePorts.js";
import type {
  NodeDefinition,
  NodeMetadataVariant,
  NodeMetadataSource,
  NodeCategory,
  NodeIcon,
  NodeEdgeType,
  NodeType,
  NodeEdge,
  NodePort,
  NodeRuntime,
  NodeFieldsConfig,
  NodeFieldControlType
} from "#core/types/definition.js";
import yaml from "js-yaml";

// Type definitions for YAML parsing
type YamlNodeMetadata = {
  id?: string;
  name?: string;
  variant?: string;
  version?: string;
  author?: string;
  authorId?: string;
  source?: string;
  description?: string;
  category?: string;
  icon?: string;
  keywords?: string[];
  tags?: string[];
  runtime?: unknown;
  experimental?: boolean;
  deprecated?: boolean;
  documentationUrl?: string;
  examples?: unknown;
};

type YamlPort = {
  id: string;
  name: string;
  type: string;
  dataType?: string;
  required?: boolean;
  multiple?: boolean;
  description?: string;
  defaultValue?: unknown;
};

type YamlEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  hidden?: boolean;
  data?: unknown;
};

type YamlParameter = {
  default?: unknown;
  control?: string;
  type?: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: unknown[];
};

type YamlNodeDefinition = {
  id: string;
  name: string;
  type?: string;
  position?: { x: number; y: number };
  metadata?: YamlNodeMetadata;
  version?: string;
  description?: string;
  category?: string;
  parameters?: Record<string, YamlParameter>;
  inputPorts?: YamlPort[];
  outputPorts?: YamlPort[];
  nodes?: YamlNodeDefinition[];
  edges?: YamlEdge[];
  variables?: unknown;
  settings?: unknown;
  data?: unknown;
};

/**
 * Convert YAML content to NodeDefinition
 * Used for:
 * - Loading built-in templates
 * - Loading user-saved workflows from storage
 * - Importing shared workflows
 */
export function fromYaml(yamlContent: string): NodeDefinition {
  try {
    const parsed = yaml.load(yamlContent);

    // Handle both file path and content
    if (typeof parsed === "string") {
      throw new Error("Invalid YAML: appears to be a string, not an object");
    }

    return parseYamlToDefinition(parsed as YamlNodeDefinition);
  } catch (error) {
    throw new Error(
      `Failed to parse YAML: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Load definitions from storage - for now returns built-in templates
 * TODO: Replace with actual storage service when available
 */
export async function loadDefinitionFromStorage(): Promise<NodeDefinition[]> {
  // For now, return the built-in templates as parsed definitions
  // This will be replaced with actual storage integration later
  const templates: NodeDefinition[] = [
    // Built-in templates would be loaded here
    // For now returning empty array until storage is implemented
  ];
  return templates;
}

/**
 * Internal function to convert parsed YAML object to NodeDefinition
 */
function parseYamlToDefinition(parsed: YamlNodeDefinition): NodeDefinition {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid YAML content: must be an object");
  }

  // Validate required fields
  if (!parsed.id || !parsed.name) {
    throw new Error("YAML must contain id and name fields");
  }

  // Use factories to create the NodeDefinition
  const metadata = createNodeMetadata({
    id: parsed.metadata?.id || parsed.id,
    name: parsed.metadata?.name || parsed.name,
    variant: validateVariant(parsed.metadata?.variant) || getVariantFromType(parsed.type),
    version: parsed.metadata?.version || parsed.version || "1.0.0",
    author: parsed.metadata?.author || "Unknown",
    authorId: parsed.metadata?.authorId,
    source: validateSource(parsed.metadata?.source),
    description: parsed.metadata?.description || parsed.description || "",
    category: validateCategory(parsed.metadata?.category || parsed.category),
    icon: validateIcon(parsed.metadata?.icon) || "layers",
    keywords: parsed.metadata?.keywords,
    tags: parsed.metadata?.tags,
    runtime: typeof parsed.metadata?.runtime === 'object' && parsed.metadata?.runtime ? parsed.metadata.runtime as { language: NodeRuntime } : undefined,
    experimental: parsed.metadata?.experimental,
    deprecated: parsed.metadata?.deprecated,
    documentationUrl: parsed.metadata?.documentationUrl,
    examples: Array.isArray(parsed.metadata?.examples) ? parsed.metadata.examples as Array<{name: string; description: string; config: Record<string, unknown>}> : undefined,
  });

  const parameters = parseParameters(parsed.parameters);

  const inputPorts = (parsed.inputPorts || []).map((port) =>
    createNodePort("input", parsePort(port))
  );

  const outputPorts = (parsed.outputPorts || []).map((port) =>
    createNodePort("output", parsePort(port))
  );

  // Use createNodeDefinition factory
  const definition = createNodeDefinition({
    id: parsed.id,
    name: parsed.name,
    type: validateNodeType(parsed.type),
    position: parsed.position || { x: 0, y: 0 },
    metadata,
    parameters,
    inputPorts,
    outputPorts,
    // Composite-specific fields
    children: parsed.nodes ? parsed.nodes.map(parseChildNode) : [],
    edges: (parsed.edges || []).map(parseEdge),
  });

  // Add any additional fields from YAML
  const result: NodeDefinition & {
    variables?: unknown;
    settings?: unknown;
    data?: unknown;
  } = definition;

  if (parsed.variables) result.variables = parsed.variables;
  if (parsed.settings) result.settings = parsed.settings;
  if (parsed.data) result.data = parsed.data;

  return result;
}

/**
 * Parse a child node from YAML
 */
function parseChildNode(nodeYaml: YamlNodeDefinition): NodeDefinition {
  const metadata = createNodeMetadata({
    id: nodeYaml.metadata?.id || nodeYaml.id,
    name: nodeYaml.metadata?.name || nodeYaml.name,
    variant: validateVariant(nodeYaml.metadata?.variant || nodeYaml.type),
    version: nodeYaml.metadata?.version || nodeYaml.version || "1.0.0",
    author: nodeYaml.metadata?.author || "Unknown",
    authorId: nodeYaml.metadata?.authorId,
    source: validateSource(nodeYaml.metadata?.source),
    description: nodeYaml.metadata?.description || "",
    category: validateCategory(nodeYaml.metadata?.category || nodeYaml.category),
    icon: validateIcon(nodeYaml.metadata?.icon) || "layers",
    keywords: nodeYaml.metadata?.keywords,
    tags: nodeYaml.metadata?.tags,
    runtime: typeof nodeYaml.metadata?.runtime === 'object' && nodeYaml.metadata?.runtime ? nodeYaml.metadata.runtime as { language: NodeRuntime } : undefined,
    experimental: nodeYaml.metadata?.experimental,
    deprecated: nodeYaml.metadata?.deprecated,
    documentationUrl: nodeYaml.metadata?.documentationUrl,
    examples: Array.isArray(nodeYaml.metadata?.examples) ? nodeYaml.metadata.examples as Array<{name: string; description: string; config: Record<string, unknown>}> : undefined,
  });

  const parameters = parseParameters(nodeYaml.parameters);

  const inputPorts = (nodeYaml.inputPorts || []).map((port) =>
    createNodePort("input", parsePort(port))
  );

  const outputPorts = (nodeYaml.outputPorts || []).map((port) =>
    createNodePort("output", parsePort(port))
  );

  const baseDefinition = createNodeDefinition({
    id: nodeYaml.id,
    name: nodeYaml.name,
    type: validateNodeType(nodeYaml.type),
    position: nodeYaml.position || { x: 0, y: 0 },
    metadata,
    parameters,
    inputPorts,
    outputPorts,
  });

  // Add data and settings if present
  const result: NodeDefinition & {
    data?: unknown;
    settings?: unknown;
  } = baseDefinition;

  if (nodeYaml.data && typeof nodeYaml.data === 'object') {
    result.data = nodeYaml.data;
  }
  if (nodeYaml.settings && typeof nodeYaml.settings === 'object') {
    result.settings = nodeYaml.settings;
  }

  return result;
}

/**
 * Parse parameters from YAML structure
 */
function parseParameters(
  parametersYaml: Record<string, YamlParameter> | undefined
): NodeDefinition["parameters"] {
  if (!parametersYaml) {
    // Return minimal parameters using factory
    return createNodeParameters({}, {}, {});
  }

  const defaults: Record<string, unknown> = {};
  const fields: NodeFieldsConfig = {};

  // Extract from YAML parameter structure
  for (const [key, paramObj] of Object.entries(parametersYaml)) {
    defaults[key] = paramObj.default;

    fields[key] = {
      controlType: validateControlType(paramObj.control) || getControlTypeFromType(paramObj.type),
      label: paramObj.label || key,
      placeholder: paramObj.placeholder,
      helpText: paramObj.helpText,
      required: paramObj.required || false,
      min: paramObj.min,
      max: paramObj.max,
      step: paramObj.step,
      options: paramObj.options?.map((value) => ({
        value: String(value),
        label: String(value),
      })),
    };
  }

  // Use factory to create parameters with proper validation
  // Note: Schema would need to be reconstructed from YAML for full validation
  // Using empty schema since YAML doesn't provide validation rules
  return createNodeParameters({}, defaults, fields);
}

/**
 * Parse port from YAML structure
 */
function parsePort(portYaml: YamlPort): Omit<NodePort, 'type'> {
  return {
    id: portYaml.id,
    name: portYaml.name,
    dataType: (portYaml.dataType || "any") as NodePort['dataType'],
    required: portYaml.required || false,
    multiple: portYaml.multiple || false,
    description: portYaml.description,
    defaultValue: portYaml.defaultValue,
  };
}

/**
 * Parse edge from YAML structure
 */
function parseEdge(edgeYaml: YamlEdge): NodeEdge {
  return {
    id: edgeYaml.id,
    source: edgeYaml.source,
    target: edgeYaml.target,
    sourceHandle: edgeYaml.sourceHandle,
    targetHandle: edgeYaml.targetHandle,
    type: validateEdgeType(edgeYaml.type),
    animated: edgeYaml.animated,
    hidden: edgeYaml.hidden,
    data: edgeYaml.data && typeof edgeYaml.data === 'object' ? edgeYaml.data as Record<string, unknown> : undefined,
  };
}

/**
 * Helper to get variant from type
 */
function getVariantFromType(type: string | undefined): NodeMetadataVariant {
  if (type === "composite") return "template";
  return "test";
}

// Icon defaults are now handled by the createNodeMetadata factory

/**
 * Helper to validate control type
 */
function validateControlType(control: string | undefined): NodeFieldControlType | undefined {
  if (!control) return undefined;
  const validTypes: NodeFieldControlType[] = [
    "text", "textarea", "password", "email", "url",
    "number", "range", "boolean", "select",
    "date", "datetime", "file", "color",
    "json", "code", "markdown", "rich-text"
  ];
  if (validTypes.includes(control as NodeFieldControlType)) {
    return control as NodeFieldControlType;
  }
  return undefined;
}

/**
 * Helper to get control type from parameter type
 */
function getControlTypeFromType(type: string | undefined): NodeFieldControlType {
  if (!type) return "text";
  const controlMap: Record<string, NodeFieldControlType> = {
    string: "text",
    number: "number",
    boolean: "boolean",
    object: "json",
    array: "json",
  };
  return controlMap[type] || "text";
}

/**
 * Helper to validate and convert string to NodeMetadataVariant
 */
function validateVariant(variant: string | undefined): NodeMetadataVariant {
  const validVariants: NodeMetadataVariant[] = [
    "code", "csv-reader", "file-system", "http-request", "image-composite",
    "loop", "parallel", "shell-command", "transform", "workflow",
    "pipeline", "orchestrator", "template", "test"
  ];

  if (variant && validVariants.includes(variant as NodeMetadataVariant)) {
    return variant as NodeMetadataVariant;
  }
  return "test";
}

/**
 * Helper to validate and convert string to NodeMetadataSource
 */
function validateSource(source: string | undefined): NodeMetadataSource | undefined {
  if (!source) return undefined;
  const validSources: NodeMetadataSource[] = [
    "system", "user", "community", "organization", "marketplace"
  ];
  if (validSources.includes(source as NodeMetadataSource)) {
    return source as NodeMetadataSource;
  }
  return "user";
}

/**
 * Helper to validate and convert string to NodeCategory
 */
function validateCategory(category: string | undefined): NodeCategory {
  const validCategories: NodeCategory[] = [
    "io", "data", "logic", "media", "system", "ai", "database",
    "analytics", "communication", "utility", "user", "composite"
  ];

  if (category && validCategories.includes(category as NodeCategory)) {
    return category as NodeCategory;
  }
  return "composite";
}

/**
 * Helper to validate and convert string to NodeIcon
 */
function validateIcon(icon: string | undefined): NodeIcon | undefined {
  if (!icon) return undefined;

  const validIcons: NodeIcon[] = [
    "file", "folder", "database", "table-2", "cloud", "globe-2", "mail",
    "message-square", "code-2", "terminal", "cpu", "git-branch", "wand-2",
    "zap", "filter", "search", "transform", "repeat", "image", "layers",
    "activity", "bar-chart", "lock", "unlock", "shield", "user", "users",
    "settings", "plus", "minus", "check", "x", "alert-triangle", "info", "help-circle"
  ];

  if (validIcons.includes(icon as NodeIcon)) {
    return icon as NodeIcon;
  }
  return undefined;
}

/**
 * Helper to validate and convert string to NodeEdgeType
 */
function validateEdgeType(type: string | undefined): NodeEdgeType | undefined {
  if (!type) return undefined;
  const validTypes: NodeEdgeType[] = ["bezier", "straight", "step", "smoothstep"];
  if (validTypes.includes(type as NodeEdgeType)) {
    return type as NodeEdgeType;
  }
  return undefined;
}

/**
 * Helper to validate and convert string to NodeType
 */
function validateNodeType(type: string | undefined): NodeType {
  if (type === "atomic" || type === "composite") {
    return type;
  }
  return "composite";
}
