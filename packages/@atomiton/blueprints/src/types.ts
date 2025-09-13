// Types for Blueprint definitions and related structures

/**
 * Blueprint Package Type Definitions
 *
 * This package owns the BlueprintDefinition type definition and extends
 * the NodeDefinition from @atomiton/nodes since blueprints are built
 * on top of nodes and can be used within other blueprints like nodes.
 */

// ==========================
// Core Blueprint Types
// ==========================

export type BlueprintPosition = {
  x: number;
  y: number;
};

export type BlueprintNodeData = Record<string, unknown>;

export type BlueprintEdgeData = Record<string, unknown>;

export type BlueprintMetadata = {
  created: string;
  modified: string;
  author?: string;
  tags?: string[];
  [key: string]: unknown;
};

export type BlueprintVariable = {
  type: string;
  defaultValue?: unknown;
  description?: string;
};

export type BlueprintVariables = Record<string, BlueprintVariable>;

export type BlueprintSettings = {
  runtime?: Record<string, unknown>;
  ui?: Record<string, unknown>;
};

export type BlueprintNode = {
  id: string;
  type: string;
  position: BlueprintPosition;
  data: BlueprintNodeData;
};

export type BlueprintEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  data?: BlueprintEdgeData;
};

/**
 * Main Blueprint Definition
 *
 * This is the core structure for blueprints in the Atomiton system.
 * It includes NodeDefinition properties since blueprints can be used as nodes
 * within other blueprints.
 */
export type BlueprintDefinition = {
  // Core identification fields (from NodeDefinition)
  id: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  version?: string;

  // Port definitions (from NodeDefinition)
  inputPorts?: Array<{
    id: string;
    name: string;
    type: string;
    dataType: string;
    required?: boolean;
    multiple?: boolean;
    description?: string;
    defaultValue?: unknown;
  }>;
  outputPorts?: Array<{
    id: string;
    name: string;
    type: string;
    dataType: string;
    required?: boolean;
    multiple?: boolean;
    description?: string;
    defaultValue?: unknown;
  }>;

  // Legacy compatibility (from NodeDefinition)
  inputs?: Array<{
    id: string;
    name: string;
    type: string;
    dataType: string;
    required?: boolean;
    multiple?: boolean;
    description?: string;
    defaultValue?: unknown;
  }>;
  outputs?: Array<{
    id: string;
    name: string;
    type: string;
    dataType: string;
    required?: boolean;
    multiple?: boolean;
    description?: string;
    defaultValue?: unknown;
  }>;

  // UI and configuration (from NodeDefinition)
  icon?: string;
  defaultConfig?: Record<string, unknown>;
  configSchema?: Record<string, unknown>;

  // Blueprint-specific fields
  nodes: BlueprintNode[];
  edges: BlueprintEdge[];
  variables?: BlueprintVariables;
  settings?: BlueprintSettings;

  // Required metadata for blueprints (overrides NodeDefinition's optional metadata)
  metadata: BlueprintMetadata;
};

// ==========================
// Validation and Error Types
// ==========================

export type ValidationError = {
  path: string;
  message: string;
  code: string;
  data?: unknown;
};

export type ValidationResult = {
  success: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
};

export type BlueprintValidationContext = {
  availableNodeTypes: string[];
  strictMode?: boolean;
};

// ==========================
// Schema and Configuration Types
// ==========================

export type BlueprintSchema = {
  version: string;
  type: "blueprint";
  properties: Record<string, unknown>;
  required: string[];
};

// ==========================
// Transformation Types
// ==========================

export type TransformationOptions = {
  preserveComments?: boolean;
  formatOutput?: boolean;
  validateResult?: boolean;
};

export type TransformationResult<T> = {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
  warnings?: ValidationError[];
};

// ==========================
// Storage and Runtime Types
// ==========================

/**
 * Storage format (YAML) - what's saved to files
 */
export type BlueprintStorageFormat = BlueprintDefinition;

/**
 * Runtime format (JSON) - what's used in editor and conductor
 */
export type BlueprintRuntimeFormat = BlueprintDefinition;

// ==========================
// Utility Types
// ==========================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown>
    ? DeepPartial<T[P]>
    : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// ==========================
// API Response Types
// ==========================

export type BlueprintAPIError = {
  message: string;
  code: string;
  details?: Record<string, unknown>;
};

export type BlueprintAPIResult<T> = {
  success: boolean;
  data?: T;
  error?: BlueprintAPIError;
  warnings?: BlueprintAPIError[];
};
