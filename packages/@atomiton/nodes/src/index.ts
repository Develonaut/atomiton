/**
 * @atomiton/nodes - Main Package Exports
 *
 * Clean API surface - all functionality accessed through nodes singleton
 */

// Main API export (follows core package pattern with api.ts)
export { nodes } from "./api";

// Types consumers need
export type { NodesAPI } from "./api";
export type {
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
  NodeItem,
  NodePortDefinition,
  NodeType,
} from "./types";

// Configuration system types
export type {
  FormConfig,
  UIControlType,
  UIFieldMetadata,
} from "./base/NodeConfig";
