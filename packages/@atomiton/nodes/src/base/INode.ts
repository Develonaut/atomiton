/**
 * Node Type Definitions
 *
 * Core types for the Node base class and related structures
 */

import type {
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from "../types";
import type { INodeLogic } from "./INodeLogic";
import type { INodeConfig } from "./INodeConfig";
import type { INodeMetadata } from "./INodeMetadata";

/**
 * Complete Node interface
 */
export type INode<TConfig = Record<string, unknown>> = {
  /**
   * Node metadata
   */
  readonly metadata: INodeMetadata;

  /**
   * Node configuration
   */
  readonly config: INodeConfig<TConfig>;

  /**
   * Node logic implementation
   */
  readonly logic: INodeLogic<TConfig>;

  /**
   * Node definition for the runtime
   */
  readonly definition: NodeDefinition;

  /**
   * Execute the node with the given context
   */
  execute(context: NodeExecutionContext): Promise<NodeExecutionResult>;

  /**
   * Get the node ID
   */
  getId(): string;

  /**
   * Get the node name
   */
  getName(): string;

  /**
   * Get the node version
   */
  getVersion(): string;

  /**
   * Check if node is experimental
   */
  isExperimental(): boolean;

  /**
   * Check if node is deprecated
   */
  isDeprecated(): boolean;

  /**
   * Validate the node structure
   */
  validate(): { valid: boolean; errors: string[] };
};
