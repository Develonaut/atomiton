/**
 * Parallel Node
 *
 * Node for running multiple operations simultaneously
 */

import { Node } from "../../base/Node.js";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
} from "../../types.js";
import { ParallelLogic } from "./ParallelNodeLogic.js";

/**
 * Parallel Node Class
 */
class ParallelNode extends Node {
  readonly id = "parallel";
  readonly name = "Parallel";
  readonly type = "parallel";

  private logic = new ParallelLogic();

  /**
   * Execute the parallel node
   */
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log(context, "info", "Executing Parallel node", {
        nodeId: this.id,
        inputs: Object.keys(context.inputs),
      });

      // Get validated configuration from context
      const config = this.logic.getValidatedConfig(context);

      // Execute the parallel logic
      const result = await this.logic.execute(context, config);

      this.log(context, "info", "Parallel execution completed", { result });
      return result;
    } catch (error) {
      this.log(context, "error", "Parallel execution failed", { error });
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
        id: "operations",
        name: "Operations",
        type: "input",
        dataType: "array",
        required: false,
        multiple: false,
        description: "Operations to run in parallel",
      },
      {
        id: "data",
        name: "Data",
        type: "input",
        dataType: "any",
        required: false,
        multiple: false,
        description: "Additional data for operations",
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
        description: "Parallel execution results",
      },
      {
        id: "success",
        name: "Success",
        type: "output",
        dataType: "boolean",
        required: true,
        multiple: false,
        description: "Parallel execution success status",
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
      description: "Run multiple operations simultaneously",
      version: "1.0.0",
      author: "Atomiton Core Team",
      tags: ["parallel", "concurrent", "async", "batch", "simultaneous"],
      icon: "zap",
    };
  }
}

export const parallel = new ParallelNode();
