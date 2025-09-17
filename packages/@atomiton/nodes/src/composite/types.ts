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
 * Compatible with visual editor node format
 */
export type CompositeNodeSpec = {
  id: string;
  type: string;
  position: CompositePosition;
  data?: Record<string, unknown>;

  // Visual editor properties
  width?: number;
  height?: number;
  parentId?: string;
  dragHandle?: string;
  style?: Record<string, unknown>;
  className?: string;
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

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown>
    ? DeepPartial<T[P]>
    : T[P];
};

export type CompositeAPIError = {
  message: string;
  code: string;
  details?: Record<string, unknown>;
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
