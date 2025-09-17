/**
 * CSV Reader Logic Implementation
 *
 * Handles the business logic for reading CSV files and spreadsheet data
 */

import { createAtomicExecutable } from "../../createAtomicExecutable";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
} from "../../../exports/executable/execution-types";
import type { CSVReaderParameters } from "./parameters";
import { csvReaderParameters } from "./parameters";

export const csvReaderExecutable = createAtomicExecutable<CSVReaderParameters>({
  async execute(
    context: NodeExecutionContext,
    params: CSVReaderParameters,
  ): Promise<NodeExecutionResult> {
    try {
      // For MVP, this would integrate with file system or external data sources
      // Currently returns mock data for demonstration

      const mockData = [
        { id: "1", name: "Product A", category: "Electronics" },
        { id: "2", name: "Product B", category: "Clothing" },
        { id: "3", name: "Product C", category: "Home & Garden" },
      ];

      const headers = params.hasHeaders ? Object.keys(mockData[0] || {}) : [];

      return {
        success: true,
        outputs: {
          data: mockData,
          headers: headers,
          rowCount: mockData.length,
        },
        error: undefined,
        metadata: {
          executedAt: new Date().toISOString(),
          nodeId: "csv-reader",
          nodeType: "csv-reader",
        },
      };
    } catch (error) {
      return {
        success: false,
        outputs: undefined,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          executedAt: new Date().toISOString(),
          nodeId: "csv-reader",
          nodeType: "csv-reader",
        },
      };
    }
  },

  getValidatedParams(context: NodeExecutionContext): CSVReaderParameters {
    return csvReaderParameters.withDefaults(context.parameters);
  },
});
