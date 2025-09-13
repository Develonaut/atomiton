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

export type { CompositeEdge } from "../base/INode.js";
export type {
  CompositeChildNode,
  CompositeNodeDefinition,
} from "./CompositeNode.js";
export type { JsonCompositeDefinition } from "./serializer/index.js";
export type {
  CompositeDefinition,
  CompositeNodeSpec,
  CompositePosition,
  CompositeSettings,
  CompositeVariable,
} from "./types.js";

import { composite } from "./api.js";

export default composite;
