/**
 * ExtendedNode - A concrete Node class that can be instantiated with configuration
 */

import { Node } from "../base/Node";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
} from "../types";

/**
 * Configuration for creating an extended node
 */
export type ExtendedNodeConfig = {
  id: string;
  name: string;
  type: string;
  execute: (context: NodeExecutionContext) => Promise<NodeExecutionResult>;
  getInputPorts?: () => NodePortDefinition[];
  getOutputPorts?: () => NodePortDefinition[];
  metadata?: {
    category: string;
    description: string;
    version: string;
    author?: string;
    tags?: string[];
    icon?: string;
  };
  validate?: () => { valid: boolean; errors: string[] };
  dispose?: () => void;
};

/**
 * ExtendedNode class that can be instantiated with a configuration object
 * This is the primary way to create custom nodes without writing a full class
 *
 * @example
 * ```typescript
 * const myNode = new ExtendedNode({
 *   id: 'my-custom-node',
 *   name: 'My Custom Node',
 *   type: 'custom',
 *   execute: async (context) => {
 *     // Your logic here
 *     return { success: true, outputs: { result: 'done' } };
 *   }
 * });
 * ```
 */
export class ExtendedNode extends Node {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  private config: ExtendedNodeConfig;

  constructor(config: ExtendedNodeConfig) {
    super();
    this.config = config;
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
  }

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    return this.config.execute(context);
  }

  get inputPorts(): NodePortDefinition[] {
    return this.config.getInputPorts?.() || super.inputPorts;
  }

  get outputPorts(): NodePortDefinition[] {
    return this.config.getOutputPorts?.() || super.outputPorts;
  }

  get metadata() {
    if (!this.config.metadata) {
      return super.metadata;
    }

    return {
      ...super.metadata,
      ...this.config.metadata,
    };
  }

  validate() {
    return this.config.validate?.() || super.validate();
  }

  dispose() {
    this.config.dispose?.();
    super.dispose();
  }
}
