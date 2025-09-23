import yaml from 'js-yaml';
import type { NodeDefinition } from '../core/types/definition.js';

/**
 * Convert YAML content to NodeDefinition
 * Used for:
 * - Loading built-in templates
 * - Loading user-saved workflows from storage
 * - Importing shared workflows
 */
export function fromYaml(yamlContent: string): NodeDefinition {
  try {
    const parsed = yaml.load(yamlContent) as any;

    // Handle both file path and content
    if (typeof parsed === 'string') {
      throw new Error('Invalid YAML: appears to be a string, not an object');
    }

    return parseYamlToDefinition(parsed);
  } catch (error) {
    throw new Error(`Failed to parse YAML: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Load definitions from storage - for now returns built-in templates
 * TODO: Replace with actual storage service when available
 */
export async function loadDefinitionFromStorage(): Promise<NodeDefinition[]> {
  // For now, return the built-in templates as parsed definitions
  // This will be replaced with actual storage integration later
  const templates = [
    // Built-in templates would be loaded here
    // For now returning empty array until storage is implemented
  ];
  return templates;
}

/**
 * Internal function to convert parsed YAML object to NodeDefinition
 */
function parseYamlToDefinition(parsed: any): NodeDefinition {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid YAML content: must be an object');
  }

  // Validate required fields
  if (!parsed.id || !parsed.name) {
    throw new Error('YAML must contain id and name fields');
  }

  // Convert YAML structure to NodeDefinition
  const definition: NodeDefinition = {
    id: parsed.id,
    name: parsed.name,
    type: parsed.type || 'composite',
    position: parsed.position || { x: 0, y: 0 },

    metadata: {
      id: parsed.metadata?.id || parsed.id,
      name: parsed.metadata?.name || parsed.name,
      variant: parsed.metadata?.variant || getVariantFromType(parsed.type),
      version: parsed.metadata?.version || parsed.version || '1.0.0',
      author: parsed.metadata?.author || 'Unknown',
      authorId: parsed.metadata?.authorId,
      source: parsed.metadata?.source || 'user',
      description: parsed.metadata?.description || parsed.description || '',
      category: parsed.metadata?.category || parsed.category || 'composite',
      icon: parsed.metadata?.icon || getDefaultIcon(parsed.category),
      keywords: parsed.metadata?.keywords || [],
      tags: parsed.metadata?.tags || [],
      runtime: parsed.metadata?.runtime,
      experimental: parsed.metadata?.experimental || false,
      deprecated: parsed.metadata?.deprecated || false,
      documentationUrl: parsed.metadata?.documentationUrl,
      examples: parsed.metadata?.examples,
    },

    parameters: parseParameters(parsed.parameters),

    inputPorts: (parsed.inputPorts || []).map(parsePort),
    outputPorts: (parsed.outputPorts || []).map(parsePort),

    // Composite-specific fields
    children: parsed.nodes ? parsed.nodes.map(parseChildNode) : [],
    edges: (parsed.edges || []).map(parseEdge),
  };

  // Add any additional fields from YAML
  const additionalFields = ['variables', 'settings', 'data'];
  for (const field of additionalFields) {
    if (parsed[field]) {
      (definition as any)[field] = parsed[field];
    }
  }

  return definition;
}

/**
 * Parse a child node from YAML
 */
function parseChildNode(nodeYaml: any): NodeDefinition {
  return {
    id: nodeYaml.id,
    name: nodeYaml.name,
    type: nodeYaml.type || 'atomic',
    position: nodeYaml.position || { x: 0, y: 0 },

    metadata: {
      id: nodeYaml.metadata?.id || nodeYaml.id,
      name: nodeYaml.metadata?.name || nodeYaml.name,
      variant: nodeYaml.metadata?.variant || nodeYaml.type || 'atomic',
      version: nodeYaml.metadata?.version || nodeYaml.version || '1.0.0',
      author: nodeYaml.metadata?.author || 'Unknown',
      authorId: nodeYaml.metadata?.authorId,
      source: nodeYaml.metadata?.source || 'user',
      description: nodeYaml.metadata?.description || '',
      category: nodeYaml.metadata?.category || nodeYaml.category || 'general',
      icon: nodeYaml.metadata?.icon || getDefaultIcon(nodeYaml.category),
      keywords: nodeYaml.metadata?.keywords || [],
      tags: nodeYaml.metadata?.tags || [],
      runtime: nodeYaml.metadata?.runtime,
      experimental: nodeYaml.metadata?.experimental || false,
      deprecated: nodeYaml.metadata?.deprecated || false,
      documentationUrl: nodeYaml.metadata?.documentationUrl,
      examples: nodeYaml.metadata?.examples,
    },

    parameters: parseParameters(nodeYaml.parameters),
    inputPorts: (nodeYaml.inputPorts || []).map(parsePort),
    outputPorts: (nodeYaml.outputPorts || []).map(parsePort),

    // Add data and settings if present
    ...(nodeYaml.data && { data: nodeYaml.data }),
    ...(nodeYaml.settings && { settings: nodeYaml.settings }),
  };
}

/**
 * Parse parameters from YAML structure
 */
function parseParameters(parametersYaml: any): NodeDefinition['parameters'] {
  if (!parametersYaml) {
    return {
      schema: {} as any,
      defaults: {},
      fields: {},
      parse: (params: unknown) => params as any,
      safeParse: (params: unknown) => ({ success: true, data: params as any }),
      isValid: () => true,
      withDefaults: (params?: any) => params || {}
    };
  }

  const defaults: Record<string, any> = {};
  const fields: Record<string, any> = {};

  // Extract from YAML parameter structure
  for (const [key, param] of Object.entries(parametersYaml)) {
    const paramObj = param as any;

    defaults[key] = paramObj.default;

    fields[key] = {
      controlType: paramObj.control || getControlTypeFromType(paramObj.type),
      label: paramObj.label || key,
      placeholder: paramObj.placeholder,
      helpText: paramObj.helpText,
      required: paramObj.required || false,
      min: paramObj.min,
      max: paramObj.max,
      step: paramObj.step,
      options: paramObj.options?.map((value: any) => ({ value, label: value })),
    };
  }

  return {
    schema: {} as any,
    defaults,
    fields,
    parse: (params: unknown) => params as any,
    safeParse: (params: unknown) => ({ success: true, data: params as any }),
    isValid: () => true,
    withDefaults: (params?: any) => ({ ...defaults, ...params })
  };
}

/**
 * Parse port from YAML structure
 */
function parsePort(portYaml: any): any {
  return {
    id: portYaml.id,
    name: portYaml.name,
    type: portYaml.type,
    dataType: portYaml.dataType,
    required: portYaml.required || false,
    multiple: portYaml.multiple || false,
    description: portYaml.description,
    defaultValue: portYaml.defaultValue,
  };
}

/**
 * Parse edge from YAML structure
 */
function parseEdge(edgeYaml: any): any {
  return {
    id: edgeYaml.id,
    source: edgeYaml.source,
    target: edgeYaml.target,
    sourceHandle: edgeYaml.sourceHandle,
    targetHandle: edgeYaml.targetHandle,
    type: edgeYaml.type,
    animated: edgeYaml.animated,
    hidden: edgeYaml.hidden,
    data: edgeYaml.data,
  };
}

/**
 * Helper to get variant from type
 */
function getVariantFromType(type: string): string {
  return type === 'composite' ? 'composite' : 'test';
}

/**
 * Helper to get default icon for category
 */
function getDefaultIcon(category: string): string {
  const iconMap: Record<string, string> = {
    io: 'file',
    data: 'wand-2',
    logic: 'code-2',
    media: 'image',
    system: 'terminal',
    ai: 'cpu',
    database: 'database',
    analytics: 'bar-chart',
    communication: 'message-square',
    utility: 'settings',
    user: 'user',
    composite: 'layers',
  };
  return iconMap[category] || 'zap';
}

/**
 * Helper to get control type from parameter type
 */
function getControlTypeFromType(type: string): string {
  const controlMap: Record<string, string> = {
    string: 'text',
    number: 'number',
    boolean: 'boolean',
    object: 'json',
    array: 'json',
  };
  return controlMap[type] || 'text';
}