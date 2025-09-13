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

// Core composite types
export type {
  CompositeChildNode,
  CompositeNodeDefinition,
} from "./CompositeNode.js";

// Main unified composite API - single interface for all composite interactions
export { composite } from "./api.js";
export type {
  CompositeDefinition,
  CompositeNodeSpec,
  CompositePosition,
  CompositeVariable,
  CompositeSettings,
} from "./types.js";
export type { CompositeEdge } from "../base/INode.js";
export type { JsonCompositeDefinition } from "./serializer/index.js";
