import yaml from 'js-yaml';
import type { NodeDefinition, NodePort, NodeEdge } from '../core/types/definition.js';

// YAML serialization types
type YamlStructure = {
  id: string;
  name: string;
  type: string;
  version: string;
  description: string;
  category: string;
  metadata: Record<string, unknown>;
  nodes?: SerializedNode[];
  edges?: SerializedEdge[];
  inputPorts?: SerializedPort[];
  outputPorts?: SerializedPort[];
  parameters?: Record<string, unknown>;
  [key: string]: unknown;
};

type SerializedNode = {
  id: string;
  type: string;
  name: string;
  category?: string;
  version?: string;
  position?: { x: number; y: number };
  data?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  [key: string]: unknown;
};

type SerializedPort = {
  id: string;
  name: string;
  type: string;
  dataType: string;
  required?: boolean;
  multiple?: boolean;
  description?: string;
  defaultValue?: unknown;
};

type SerializedEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  hidden?: boolean;
  data?: Record<string, unknown>;
};

export function toYaml(definition: NodeDefinition): string {
  try {
    // Build YAML-friendly structure
    const yamlStructure: YamlStructure = {
      // Core identification
      id: definition.id,
      name: definition.name,
      type: definition.type,
      version: definition.metadata?.version || '1.0.0',

      // Description at top level for readability
      description: definition.metadata?.description || '',
      category: definition.metadata?.category || 'general',

      // Full metadata
      metadata: {
        ...definition.metadata,
      },
    };

    // Add nodes if composite
    if (definition.children && definition.children.length > 0) {
      yamlStructure.nodes = definition.children.map(serializeNode);
    }

    // Add edges if present
    if (definition.edges && definition.edges.length > 0) {
      yamlStructure.edges = definition.edges.map(serializeEdge);
    }

    // Add ports if defined
    if (definition.inputPorts && definition.inputPorts.length > 0) {
      yamlStructure.inputPorts = definition.inputPorts.map(serializePort);
    }
    if (definition.outputPorts && definition.outputPorts.length > 0) {
      yamlStructure.outputPorts = definition.outputPorts.map(serializePort);
    }

    // Add parameters if present
    if (definition.parameters) {
      yamlStructure.parameters = serializeParameters(definition.parameters);
    }

    // Add any additional fields
    const additionalFields = ['variables', 'settings', 'data'];
    for (const field of additionalFields) {
      if (field in definition && (definition as Record<string, unknown>)[field]) {
        yamlStructure[field] = (definition as Record<string, unknown>)[field];
      }
    }

    // Convert to YAML with nice formatting
    return yaml.dump(yamlStructure, {
      indent: 2,
      lineWidth: -1, // Don't wrap lines
      sortKeys: false, // Preserve our order
      noRefs: true, // Don't use YAML references
      quotingType: '"', // Use double quotes
      forceQuotes: false, // Only quote when necessary
    });

  } catch (error) {
    throw new Error(`Failed to serialize to YAML: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function serializeNode(node: NodeDefinition): SerializedNode {
  const serialized: SerializedNode = {
    id: node.id,
    type: node.metadata?.variant || node.type,
    name: node.name,
    category: node.metadata?.category,
    version: node.metadata?.version,
  };

  // Add metadata if it has custom values
  if (node.metadata) {
    serialized.metadata = {
      ...node.metadata,
    };
  }

  // Add ports
  if (node.inputPorts?.length) {
    serialized.inputPorts = node.inputPorts.map(serializePort);
  }
  if (node.outputPorts?.length) {
    serialized.outputPorts = node.outputPorts.map(serializePort);
  }

  // Add parameters
  if (node.parameters) {
    serialized.parameters = serializeParameters(node.parameters);
  }

  // Add position
  if (node.position) {
    serialized.position = node.position;
  }

  // Add data field if present
  if ('data' in node && (node as Record<string, unknown>).data) {
    serialized.data = (node as Record<string, unknown>).data as Record<string, unknown>;
  }

  // Add settings if present
  if ('settings' in node && (node as Record<string, unknown>).settings) {
    serialized.settings = (node as Record<string, unknown>).settings as Record<string, unknown>;
  }

  return serialized;
}

function serializePort(port: NodePort): SerializedPort {
  return {
    id: port.id,
    name: port.name,
    type: port.type,
    dataType: port.dataType,
    required: port.required || undefined,
    multiple: port.multiple || undefined,
    description: port.description || undefined,
    defaultValue: port.defaultValue,
  };
}

function serializeEdge(edge: NodeEdge): SerializedEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle || undefined,
    targetHandle: edge.targetHandle || undefined,
    type: edge.type || undefined,
    animated: edge.animated || undefined,
    hidden: edge.hidden || undefined,
    data: edge.data || undefined,
  };
}

function serializeParameters(parameters: NodeDefinition['parameters']): Record<string, unknown> {
  const serialized: Record<string, unknown> = {};

  // Extract from fields and defaults
  if (parameters.fields) {
    for (const [key, field] of Object.entries(parameters.fields)) {
      serialized[key] = {
        type: field.controlType === 'number' ? 'number' :
              field.controlType === 'boolean' ? 'boolean' : 'string',
        default: parameters.defaults[key],
        control: field.controlType,
        required: field.required,
        label: field.label !== key ? field.label : undefined,
        placeholder: field.placeholder,
        helpText: field.helpText,
        options: field.options?.map(o => o.value),
        min: field.min,
        max: field.max,
        step: field.step,
      };

      // Remove undefined values for cleaner YAML
      const paramObj = serialized[key] as Record<string, unknown>;
      Object.keys(paramObj).forEach(k => {
        if (paramObj[k] === undefined) {
          delete paramObj[k];
        }
      });
    }
  }

  return serialized;
}