/**
 * CSV Reader Logic Implementation - Pure business logic
 *
 * NO UI IMPORTS ALLOWED IN THIS FILE
 * Handles the business logic for reading CSV files and spreadsheet data
 */

import { NodeLogic } from "../../base/NodeLogic";
import type { NodeExecutionContext, NodeExecutionResult } from "../../types";
import type { CSVReaderConfig } from "./CSVReaderNodeConfig";

export class CSVReaderLogic extends NodeLogic<CSVReaderConfig> {
  async execute(
    context: NodeExecutionContext,
    config: CSVReaderConfig,
  ): Promise<NodeExecutionResult> {
    // Store context for metadata creation
    this.context = context;

    try {
      this.log(context, "info", "Starting CSV read operation", { config });

      // For MVP, this would integrate with file system or external data sources
      // Currently returns mock data for demonstration

      const mockData = [
        { id: "1", name: "Product A", category: "Electronics" },
        { id: "2", name: "Product B", category: "Clothing" },
        { id: "3", name: "Product C", category: "Home & Garden" },
      ];

      const headers = config.hasHeaders ? Object.keys(mockData[0] || {}) : [];

      this.log(
        context,
        "info",
        `Read ${mockData.length} rows with ${headers.length} columns`,
      );

      return this.createSuccessResult({
        data: mockData,
        headers: headers,
        rowCount: mockData.length,
      });
    } catch (error) {
      this.log(context, "error", "CSV read failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return this.createErrorResult(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  validateConfig(config: unknown): config is CSVReaderConfig {
    return (
      typeof config === "object" &&
      config !== null &&
      "hasHeaders" in config &&
      "delimiter" in config &&
      typeof (config as Record<string, unknown>).hasHeaders === "boolean" &&
      typeof (config as Record<string, unknown>).delimiter === "string"
    );
  }

  getDefaultConfig(): Partial<CSVReaderConfig> {
    return {
      hasHeaders: true,
      delimiter: ",",
    };
  }
}
