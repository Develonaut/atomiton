/**
 * Loop Node
 *
 * Node for looping and iterating over data items
 */

import { Node } from "../../base/Node.js";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
} from "../../types.js";
import { LoopLogic } from "./LoopNodeLogic.js";

/**
 * Loop Node Class
 */
class LoopNode extends Node {
  readonly id = "loop";
  readonly name = "Loop";
  readonly type = "loop";

  private logic = new LoopLogic();

  /**
   * Execute the loop node
   */
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log(context, "info", "Executing Loop node", {
        nodeId: this.id,
        inputs: Object.keys(context.inputs),
      });

      // Get validated configuration from context
      const config = this.logic.getValidatedConfig(context);

      // Execute the loop logic
      const result = await this.logic.execute(context, config);

      this.log(context, "info", "Loop execution completed", { result });
      return result;
    } catch (error) {
      this.log(context, "error", "Loop execution failed", { error });
      return this.createErrorResult(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Input ports for this node
   */
  get inputPorts(): NodePortDefinition[] {
    return [
      {
        id: "items",
        name: "Items",
        type: "input",
        dataType: "array",
        required: false,
        multiple: false,
        description: "Items to loop over",
      },
      {
        id: "data",
        name: "Data",
        type: "input",
        dataType: "any",
        required: false,
        multiple: false,
        description: "Additional data for loop",
      },
    ];
  }

  /**
   * Output ports for this node
   */
  get outputPorts(): NodePortDefinition[] {
    return [
      {
        id: "results",
        name: "Results",
        type: "output",
        dataType: "array",
        required: true,
        multiple: false,
        description: "Loop execution results",
      },
      {
        id: "success",
        name: "Success",
        type: "output",
        dataType: "boolean",
        required: true,
        multiple: false,
        description: "Loop success status",
      },
    ];
  }

  /**
   * Get metadata for this node
   */
  get metadata() {
    return {
      ...super.metadata,
      category: "logic",
      description: "Loop over items and execute operations",
      version: "1.0.0",
      author: "Atomiton Core Team",
      tags: ["loop", "iterate", "foreach", "batch", "repeat"],
      icon: "repeat",
    };
  }
}

export const loop = new LoopNode();

export default loop;
