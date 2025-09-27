/**
 * YAML to NodeDefinition converter
 * Handles parsing and conversion of YAML content to strongly-typed node definitions
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition.js";
import { createNodeMetadata } from "#core/factories/createNodeMetadata.js";
import { createNodeParameters } from "#core/factories/createNodeParameters.js";
import { createNodePort } from "#core/factories/createNodePorts.js";
import type {
  NodeDefinition,
  NodeEdge,
  NodeFieldsConfig,
  NodePort,
  NodeRuntime,
} from "#core/types/definition.js";
import yaml from "js-yaml";
import type {
  YamlEdge,
  YamlNodeDefinition,
  YamlParameter,
  YamlPort,
} from "#serialization/types";
import {
  validateCategory,
  validateControlType,
  validateEdgeType,
  validateIcon,
  validateRuntime,
  validateSource,
} from "#serialization/validators";

/**
 * Convert YAML content to NodeDefinition
 * Used for:
 * - Loading node templates
 * - Importing node definitions
 * - Parsing serialized Flows
 */
export function fromYaml(yamlContent: string): NodeDefinition {
  try {
    const data = yaml.load(yamlContent) as YamlNodeDefinition;

    if (!data || typeof data !== "object") {
      throw new Error("Invalid YAML structure");
    }

    if (!data.id || !data.name) {
      throw new Error("Node definition must have id and name");
    }

    return parseNodeDefinition(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to parse YAML: ${message}`);
  }
}

/**
 * Parse a node definition from YAML data
 */
function parseNodeDefinition(data: YamlNodeDefinition): NodeDefinition {
  // Extract type and version from either top-level or metadata
  const type = data.type || data.metadata?.type || "transform";
  const version = data.version || data.metadata?.version || "1.0.0";

  // Parse metadata (without type and version)
  const metadata = parseMetadata(data);

  // Parse parameters
  const parameters = parseParameters(data.parameters);

  // Parse ports
  const inputPorts = parsePorts(data.inputPorts || []);
  const outputPorts = parsePorts(data.outputPorts || []);

  // Parse child nodes if group
  const nodes = data.nodes ? data.nodes.map(parseNodeDefinition) : undefined;

  // Parse edges
  const edges = data.edges ? parseEdges(data.edges) : undefined;

  // Create the node definition with type and version at top level
  return createNodeDefinition({
    id: data.id,
    type,
    version,
    name: data.name,
    position: data.position || { x: 0, y: 0 },
    metadata,
    parameters,
    inputPorts,
    outputPorts,
    nodes,
    edges,
  });
}

/**
 * Parse metadata from YAML data
 */
function parseMetadata(data: YamlNodeDefinition) {
  const yamlMeta = data.metadata || {};

  return createNodeMetadata({
    id: yamlMeta.id || data.id,
    name: yamlMeta.name || data.name,
    author: yamlMeta.author,
    authorId: yamlMeta.authorId,
    source: validateSource(yamlMeta.source),
    description: yamlMeta.description || data.description,
    category: validateCategory(yamlMeta.category || data.category),
    icon: validateIcon(yamlMeta.icon),
    keywords: yamlMeta.keywords || [],
    tags: yamlMeta.tags || [],
    runtime: yamlMeta.runtime
      ? { language: validateRuntime(yamlMeta.runtime) as NodeRuntime }
      : undefined,
    experimental: yamlMeta.experimental || false,
    deprecated: yamlMeta.deprecated || false,
    documentationUrl: yamlMeta.documentationUrl,
    examples: yamlMeta.examples as
      | Array<{
          name: string;
          description: string;
          config: Record<string, unknown>;
        }>
      | undefined,
  });
}

/**
 * Parse parameters from YAML data
 */
function parseParameters(params?: Record<string, YamlParameter>) {
  if (!params) {
    // Return a minimal parameters object with empty defaults and fields
    return createNodeParameters({}, {});
  }

  const defaults: Record<string, unknown> = {};
  const fields: NodeFieldsConfig = {};

  Object.entries(params).forEach(([key, param]) => {
    // Store default value
    if (param.default !== undefined) {
      defaults[key] = param.default;
    }

    // Create field configuration
    if (param.control) {
      fields[key] = {
        controlType: validateControlType(param.control) || "text",
        label: param.label || key,
        placeholder: param.placeholder,
        helpText: param.helpText,
        required: param.required,
        min: param.min,
        max: param.max,
        step: param.step,
        options:
          (param.options as Array<{ value: string; label: string }>) || [],
      };
    }
  });

  return createNodeParameters(defaults, fields);
}

/**
 * Parse ports from YAML data
 */
function parsePorts(ports: YamlPort[]): NodePort[] {
  return ports.map((port) => {
    const portType = port.type as "input" | "output" | "trigger" | "error";
    return createNodePort(portType, {
      id: port.id,
      name: port.name,
      dataType: (port.dataType || "any") as
        | "string"
        | "number"
        | "boolean"
        | "object"
        | "array"
        | "any",
      required: port.required || false,
      multiple: port.multiple || false,
      description: port.description,
      defaultValue: port.defaultValue,
    });
  });
}

/**
 * Parse edges from YAML data
 */
function parseEdges(edges: YamlEdge[]): NodeEdge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: validateEdgeType(edge.type),
    animated: edge.animated || false,
    hidden: edge.hidden || false,
    data: edge.data as Record<string, unknown>,
  }));
}

/**
 * Parse multiple YAML documents
 * Used for template files that contain multiple node definitions
 */
export function fromYamlDocuments(yamlContent: string): NodeDefinition[] {
  try {
    const documents = yaml.loadAll(yamlContent) as YamlNodeDefinition[];
    return documents.map((doc) => {
      if (!doc || typeof doc !== "object") {
        throw new Error("Invalid YAML document structure");
      }
      if (!doc.id || !doc.name) {
        throw new Error("Each document must have id and name");
      }
      return parseNodeDefinition(doc);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to parse YAML documents: ${message}`);
  }
}

export default fromYaml;
