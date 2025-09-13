/**
 * Code Node
 *
 * Node for executing custom JavaScript code
 */

import { Node } from "../../base/Node.js";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
} from "../../types.js";
import { CodeLogic } from "./CodeNodeLogic.js";

/**
 * Code Node Class
 */
class CodeNode extends Node {
  readonly id = "code";
  readonly name = "Code";
  readonly type = "code";

  private logic = new CodeLogic();

  /**
   * Execute the code node
   */
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log(context, "info", "Executing Code node", {
        nodeId: this.id,
        inputs: Object.keys(context.inputs),
      });

      // Get validated configuration from context
      const config = this.logic.getValidatedConfig(context);

      // Execute the code logic
      const result = await this.logic.execute(context, config);

      this.log(context, "info", "Code execution completed", { result });
      return result;
    } catch (error) {
      this.log(context, "error", "Code execution failed", { error });
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
        description: "Input data for code execution",
      },
      {
        id: "params",
        name: "Parameters",
        type: "input",
        dataType: "object",
        required: false,
        multiple: false,
        description: "Additional parameters",
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
        description: "Code execution result",
      },
      {
        id: "success",
        name: "Success",
        type: "output",
        dataType: "boolean",
        required: true,
        multiple: false,
        description: "Execution success status",
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
      description: "Execute custom JavaScript code",
      version: "1.0.0",
      author: "Atomiton Core Team",
      tags: ["code", "javascript", "custom", "logic", "function"],
      icon: "code-2",
    };
  }
}

export const code = new CodeNode();
