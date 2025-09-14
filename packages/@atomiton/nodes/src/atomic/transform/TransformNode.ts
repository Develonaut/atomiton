/**
 * Transform Node
 *
 * Node for transforming data, arrays, JSON, and templates
 */

import { Node } from "../../base/Node";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
} from "../../types";
import { TransformLogic } from "./TransformNodeLogic";

/**
 * Transform Node Class
 */
class TransformNode extends Node {
  readonly id = "transform";
  readonly name = "Transform";
  readonly type = "transform";

  private logic = new TransformLogic();

  /**
   * Execute the transform node
   */
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log(context, "info", "Executing Transform node", {
        nodeId: this.id,
        inputs: Object.keys(context.inputs),
      });

      // Get validated configuration from context
      const config = this.logic.getValidatedConfig(context);

      // Execute the transform logic
      const result = await this.logic.execute(context, config);

      this.log(context, "info", "Transform execution completed", { result });
      return result;
    } catch (error) {
      this.log(context, "error", "Transform execution failed", { error });
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
        id: "data",
        name: "Data",
        type: "input",
        dataType: "any",
        required: false,
        multiple: false,
        description: "Input data to transform",
      },
      {
        id: "template",
        name: "Template",
        type: "input",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Template string for transformation",
      },
      {
        id: "context",
        name: "Context",
        type: "input",
        dataType: "object",
        required: false,
        multiple: false,
        description: "Context variables for template",
      },
    ];
  }

  /**
   * Output ports for this node
   */
  get outputPorts(): NodePortDefinition[] {
    return [
      {
        id: "result",
        name: "Result",
        type: "output",
        dataType: "any",
        required: true,
        multiple: false,
        description: "Transformed data result",
      },
      {
        id: "success",
        name: "Success",
        type: "output",
        dataType: "boolean",
        required: true,
        multiple: false,
        description: "Transformation success status",
      },
    ];
  }

  /**
   * Get metadata for this node
   */
  get metadata() {
    return {
      ...super.metadata,
      category: "data",
      description: "Transform data with JS expressions",
      version: "1.0.0",
      author: "Atomiton Core Team",
      tags: ["transform", "data", "map", "filter", "template", "javascript"],
      icon: "wand-2",
    };
  }
}

export const transform = new TransformNode();

export default transform;
