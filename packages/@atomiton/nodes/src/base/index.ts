/**
 * Base Node Package Exports
 *
 * Provides the foundational types and classes for creating node packages
 * with clean separation between logic and configuration.
 */

// Main Node base class and types
export { Node } from "./Node";
export type { INode } from "./INode";

// Logic base class and types
export { NodeLogic } from "./NodeLogic";
export type { INodeLogic } from "./INodeLogic";

// Configuration class and types
export { NodeConfig } from "./NodeConfig";
export type { NodeConfigBase } from "./NodeConfig";
export type { INodeConfig } from "./INodeConfig";

// Metadata class and types
export { NodeMetadata } from "./NodeMetadata";
export type { INodeMetadata } from "./INodeMetadata";
