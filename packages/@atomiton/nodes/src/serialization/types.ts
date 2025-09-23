/**
 * Type definitions for YAML parsing
 */

// Type definitions for YAML parsing
export type YamlNodeMetadata = {
  id?: string;
  name?: string;
  type?: string;
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

export type YamlPort = {
  id: string;
  name: string;
  type: string;
  dataType?: string;
  required?: boolean;
  multiple?: boolean;
  description?: string;
  defaultValue?: unknown;
};

export type YamlEdge = {
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

export type YamlParameter = {
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

export type YamlNodeDefinition = {
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
