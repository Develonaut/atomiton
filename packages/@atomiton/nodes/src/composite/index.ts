/**
 * Composite Node Package
 *
 * This module contains the composite node functionality - what users
 * know as "Blueprints" in the UI, but are "Composite Nodes" in code.
 *
 * Key exports:
 * - CompositeNode: The main composite node implementation
 * - CompositeExecutor: Orchestrates composite execution
 * - Types and interfaces for composite functionality
 */

// Core composite functionality
export { CompositeExecutor } from "./CompositeExecutor";
export type {
  CompositeExecutionResult,
  CompositeExecutionSettings,
} from "./CompositeExecutor";
export { CompositeNode } from "./CompositeNode";
export type {
  CompositeChildNode,
  CompositeNodeDefinition,
} from "./CompositeNode";

// Serialization between UI format and composite nodes
export { CompositeSerializer } from "./serializer";

// Main composite API (replaces @atomiton/blueprints functionality)
export { CompositeAPI, composites } from "./api";
export type {
  CompositeDefinition,
  CompositeMetadata,
  CompositeNodeSpec,
} from "./types";
export type { CompositeEdge } from "../base/INode";

// Utilities
export {
  calculateComplexityMetrics,
  compositeToDefinition,
  createCompositeFromDefinition,
  extractCompositeMetadata,
  findNodesByType,
  isCompositeType,
  validateCompositeDeep,
} from "./utils";
