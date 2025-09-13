/**
 * CSV Reader Node
 *
 * Node for reading CSV files and spreadsheet data
 */

import { Node } from "../../base/Node.js";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
} from "../../types.js";
import { CSVReaderLogic } from "./CSVReaderNodeLogic.js";

/**
 * CSV Reader Node Class
 */
class CSVReaderNode extends Node {
  readonly id = "csv-reader";
  readonly name = "CSV Reader";
  readonly type = "csv-reader";

  private logic = new CSVReaderLogic();

  /**
   * Execute the CSV reader node
   */
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log(context, "info", "Executing CSV Reader node", {
        nodeId: this.id,
        inputs: Object.keys(context.inputs),
      });

      // Get validated configuration from context
      const config = this.logic.getValidatedConfig(context);

      // Execute the CSV reader logic
      const result = await this.logic.execute(context, config);

      this.log(context, "info", "CSV Reader execution completed", { result });
      return result;
    } catch (error) {
      this.log(context, "error", "CSV Reader execution failed", { error });
      return this.createErrorResult(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Atomic nodes are never composite
   */
  isComposite(): false {
    return false;
  }

  /**
   * Input ports for this node
   */
  get inputPorts(): NodePortDefinition[] {
    return [];
  }

  /**
   * Output ports for this node
   */
  get outputPorts(): NodePortDefinition[] {
    return [
      {
        id: "data",
        name: "Data",
        type: "output",
        dataType: "array",
        required: true,
        multiple: false,
        description: "Parsed CSV data as array of objects",
      },
      {
        id: "headers",
        name: "Headers",
        type: "output",
        dataType: "array",
        required: false,
        multiple: false,
        description: "Column headers from CSV",
      },
      {
        id: "rowCount",
        name: "Row Count",
        type: "output",
        dataType: "number",
        required: false,
        multiple: false,
        description: "Number of data rows",
      },
    ];
  }

  /**
   * Metadata for this node
   */
  get metadata() {
    return {
      ...super.metadata,
      category: "io",
      description: "Read CSV files and spreadsheet data",
      version: "1.0.0",
      author: "Atomiton Core Team",
      tags: ["csv", "data", "import", "spreadsheet", "table"],
      icon: "table-2",
    };
  }
}

export const csvReader = new CSVReaderNode();
