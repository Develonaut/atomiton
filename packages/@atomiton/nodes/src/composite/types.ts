/**
 * Composite Node Types
 *
 * These types define the structure for composite nodes (blueprints)
 * in the unified node architecture.
 *
 * Following the principle: "A node is a node is a node" - composites
 * are just nodes that contain other nodes, not special cases.
 */

import type { NodeDefinition } from "../types";
import type { CompositeEdge } from "../base/INode";

// Re-export CompositeEdge for convenience
export type { CompositeEdge } from "../base/INode";

/**
 * Position in the visual editor for child nodes
 */
export type CompositePosition = {
  x: number;
  y: number;
};

/**
 * Variable definition for composite parameterization
 */
export type CompositeVariable = {
  type: string;
  defaultValue?: unknown;
  description?: string;
};

/**
 * Composite-specific settings
 */
export type CompositeSettings = {
  runtime?: Record<string, unknown>;
  ui?: Record<string, unknown>;
};

/**
 * Child node specification within a composite
 * This is minimal - just what's needed to position and configure a child node
 */
export type CompositeNodeSpec = {
  id: string;
  type: string;
  position: CompositePosition;
  data?: Record<string, unknown>;
};

/**
 * Main Composite Definition
 *
 * Extends NodeDefinition with composite-specific fields.
 * A composite is just a node that happens to contain other nodes.
 */
export type CompositeDefinition = NodeDefinition & {
  // Composite-specific fields - the only things unique to composites
  nodes: CompositeNodeSpec[];
  edges: CompositeEdge[];
  variables?: Record<string, CompositeVariable>;
  settings?: CompositeSettings;
};

export type ValidationError = {
  path: string;
  message: string;
  code: string;
  data?: unknown;
};

export type ValidationResult<T = unknown> = {
  success: boolean;
  data?: T;
  errors: ValidationError[];
  warnings?: ValidationError[];
};

export type CompositeValidationContext = {
  availableNodeTypes: string[];
  strictMode?: boolean;
};

export type CompositeSchema = {
  version: string;
  type: "composite";
  properties: Record<string, unknown>;
  required: string[];
};

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

/**
 * Both storage (YAML) and runtime (JSON) use the same format
 * The only difference is serialization
 */
export type CompositeStorageFormat = CompositeDefinition;
export type CompositeRuntimeFormat = CompositeDefinition;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown>
    ? DeepPartial<T[P]>
    : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type CompositeAPIError = {
  message: string;
  code: string;
  details?: Record<string, unknown>;
};

export type CompositeAPIResult<T> = {
  success: boolean;
  data?: T;
  error?: CompositeAPIError;
  warnings?: CompositeAPIError[];
};

/**
 * Composite-specific execution context
 */
export type CompositeExecutionContext = {
  nodeResults: Record<string, unknown>;
  variables: Record<string, unknown>;
  settings: CompositeExecutionSettings;
};

/**
 * Settings for composite execution
 */
export type CompositeExecutionSettings = {
  timeout?: number;
  retries?: number;
  parallel?: boolean;
  maxConcurrency?: number;
  stopOnError?: boolean;
};
