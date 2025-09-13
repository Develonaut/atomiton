/**
 * Composite Node Types
 *
 * These types define the structure for composite nodes (blueprints)
 * in the unified node architecture.
 */

// Types for Composite node definitions and related structures

import type { NodeDefinition } from "../types";
import type { CompositeEdge } from "../base/INode";

/**
 * Composite Node Type Definitions
 *
 * This defines the structure for composite nodes (what the UI calls "blueprints").
 * Composite nodes are nodes that contain and orchestrate other nodes.
 */

// ==========================
// Core Composite Types
// ==========================

export type CompositePosition = {
  x: number;
  y: number;
};

export type CompositeNodeData = Record<string, unknown>;

export type CompositeEdgeData = Record<string, unknown>;

export type CompositeMetadata = {
  created: string;
  modified: string;
  author?: string;
  tags?: string[];
  [key: string]: unknown;
};

export type CompositeVariable = {
  type: string;
  defaultValue?: unknown;
  description?: string;
};

export type CompositeVariables = Record<string, CompositeVariable>;

export type CompositeSettings = {
  runtime?: Record<string, unknown>;
  ui?: Record<string, unknown>;
};

export type CompositeNodeSpec = {
  id: string;
  type: string;
  position: CompositePosition;
  data: CompositeNodeData;
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
  variables?: CompositeVariables;
  settings?: CompositeSettings;

  // Override metadata to be required and use composite-specific type
  metadata: CompositeMetadata;
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

// ==========================
// Schema and Configuration Types
// ==========================

export type CompositeSchema = {
  version: string;
  type: "composite";
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
export type CompositeStorageFormat = CompositeDefinition;

/**
 * Runtime format (JSON) - what's used in editor and conductor
 */
export type CompositeRuntimeFormat = CompositeDefinition;

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
