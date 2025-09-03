/**
 * CSV Parser UI Adapter - Phase 2 UI Architecture Refactor
 *
 * This adapter bridges the CSV Parser node implementation with UI components,
 * eliminating the need for UI components to directly import from @atomiton/core.
 *
 * ARCHITECTURAL BENEFITS:
 * - Clean separation of concerns: UI -> Nodes -> Core
 * - Type safety without boundary violations
 * - Reusable pattern for all node types
 * - Leverages existing node package structure
 */

import type {
  NodeExecutionContext,
  UIConfigSchema,
  UINodeConfig,
  UINodeDefinition,
} from "./NodeUIAdapter";
import {
  BaseNodeUIAdapter,
  createStandardReactFlowAdapter,
} from "./NodeUIAdapter";
import {
  csvParserConfigSchema,
  type CSVParserConfig,
} from "../../nodes/csv-parser/CSVParser.config";
import csvParserNode from "../../nodes/csv-parser/index";

/**
 * CSV Parser specific UI configuration
 * This is what UI components will work with - a clean, UI-focused interface
 */
export interface CSVParserUIConfig extends UINodeConfig {
  delimiter: string;
  quote: string;
  escape: string;
  hasHeaders: boolean;
  skipEmptyLines: boolean;
  trimFields: boolean;
  encoding: "utf8" | "ascii" | "latin1";
  maxRows?: number;
  validateData: boolean;
  outputFormat: "objects" | "arrays";
}

/**
 * CSV Parser UI Adapter Implementation
 * Bridges between CSV Parser node package and UI components
 */
export class CSVParserUIAdapter extends BaseNodeUIAdapter<CSVParserUIConfig> {
  /**
   * Convert core node definition to UI-friendly format
   */
  getUIDefinition(): UINodeDefinition {
    const coreDefinition = csvParserNode.definition;

    return {
      id: coreDefinition.id,
      name: coreDefinition.name,
      description: coreDefinition.description || "",
      category: coreDefinition.category || "data",
      version: coreDefinition.version || "1.0.0",
      icon: (coreDefinition.metadata?.icon as string) || "file-csv",

      // Convert core port definitions to UI format
      inputs: (coreDefinition.inputPorts || []).map((port, index) => ({
        id: String("id" in port ? port.id || "" : ""),
        name: String("name" in port ? port.name || "" : ""),
        dataType: String("dataType" in port ? port.dataType || "any" : "any"),
        required: Boolean("required" in port ? port.required : false),
        position: "left" as const,
        offset: this.calculatePortOffset(
          ("id" in port && port.id) || `input_${index}`,
          (coreDefinition.inputPorts || []).map((p, i) => ({
            id: ("id" in p && p.id) || `port_${i}`,
          })),
          "input",
        ),
      })),

      outputs: (coreDefinition.outputPorts || []).map((port, index) => ({
        id: String("id" in port ? port.id || "" : ""),
        name: String("name" in port ? port.name || "" : ""),
        dataType: String("dataType" in port ? port.dataType || "any" : "any"),
        required: Boolean("required" in port ? port.required : false),
        position: "right" as const,
        offset: this.calculatePortOffset(
          ("id" in port && port.id) || `output_${index}`,
          (coreDefinition.outputPorts || []).map((p, i) => ({
            id: ("id" in p && p.id) || `port_${i}`,
          })),
          "output",
        ),
      })),

      // Convert Zod schema to UI-friendly config schema
      configSchema: this.createUIConfigSchema(),
      defaultConfig: this.coreConfigToUI(coreDefinition.defaultConfig),
    };
  }

  /**
   * Convert core configuration to UI configuration
   */
  coreConfigToUI(coreConfig: unknown): CSVParserUIConfig {
    // Parse with schema to ensure type safety and defaults
    const parsed = csvParserConfigSchema.parse(coreConfig || {});

    return {
      delimiter: parsed.delimiter,
      quote: parsed.quote,
      escape: parsed.escape,
      hasHeaders: parsed.hasHeaders,
      skipEmptyLines: parsed.skipEmptyLines,
      trimFields: parsed.trimFields,
      encoding: parsed.encoding,
      maxRows: parsed.maxRows,
      validateData: parsed.validateData,
      outputFormat: parsed.outputFormat,
    };
  }

  /**
   * Convert UI configuration to core configuration
   */
  uiConfigToCore(uiConfig: CSVParserUIConfig): CSVParserConfig {
    // Ensure the config matches core expectations
    return csvParserConfigSchema.parse(uiConfig);
  }

  /**
   * Validate UI configuration
   */
  validateUIConfig(uiConfig: CSVParserUIConfig): string[] {
    const errors: string[] = [];

    try {
      csvParserConfigSchema.parse(uiConfig);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "errors" in error) {
        const zodError = error as {
          errors: Array<{ path: string[]; message: string }>;
        };
        errors.push(
          ...zodError.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
        );
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Invalid configuration";
        errors.push(errorMessage);
      }
    }

    // Additional UI-specific validations
    if (uiConfig.delimiter === uiConfig.quote) {
      errors.push("Delimiter and quote characters cannot be the same");
    }

    if (uiConfig.maxRows !== undefined && uiConfig.maxRows < 1) {
      errors.push("Maximum rows must be at least 1");
    }

    return errors;
  }

  /**
   * Create execution context for core node
   */
  createExecutionContext(
    instanceId: string,
    config: CSVParserUIConfig,
    inputs: Record<string, unknown>,
  ): Partial<NodeExecutionContext> {
    // Convert UI config back to core format
    const coreConfig = this.uiConfigToCore(config);

    // Return partial execution context for CSV parsing
    return {
      instanceId,
      nodeId: "csv-parser",
      blueprintId: "ui-csv-execution", // Placeholder for UI-driven execution
      config: coreConfig,
      inputs,
      workspaceRoot: process.cwd(),
      tempDirectory: "/tmp",
      limits: {
        maxMemoryMB: config.maxRows
          ? Math.max(256, config.maxRows * 0.01)
          : 256, // Estimate based on rows
        maxExecutionTimeMs: 120000, // 2 minutes for large CSV files
        maxDiskSpaceMB: 1024, // 1GB for CSV processing
      },
      startTime: new Date(),
      metadata: {
        csvParsing: true,
        hasHeaders: config.hasHeaders,
        delimiter: config.delimiter,
        outputFormat: config.outputFormat,
      },
      log: {
        info: (_message: string, _data?: unknown) => {},
        warn: (_message: string, _data?: unknown) => {},
        error: (_message: string, _data?: unknown) => {},
        debug: (_message: string, _data?: unknown) => {},
      },
      reportProgress: (_progress: number, _message?: string) => {},
    };
  }

  /**
   * Create UI-friendly configuration schema
   */
  private createUIConfigSchema(): UIConfigSchema {
    return {
      delimiter: {
        type: "string",
        label: "Delimiter",
        description: "Character used to separate fields",
        default: ",",
        required: true,
        placeholder: "e.g., , ; | \\t",
      },

      quote: {
        type: "string",
        label: "Quote Character",
        description: "Character used to wrap fields containing delimiters",
        default: '"',
        required: true,
        placeholder: "e.g., \" '",
      },

      escape: {
        type: "string",
        label: "Escape Character",
        description: "Character used to escape quote characters",
        default: "\\",
        required: true,
        placeholder: "e.g., \\ /",
      },

      hasHeaders: {
        type: "boolean",
        label: "Has Headers",
        description: "First row contains column headers",
        default: true,
        required: false,
      },

      skipEmptyLines: {
        type: "boolean",
        label: "Skip Empty Lines",
        description: "Ignore empty or whitespace-only lines",
        default: true,
        required: false,
      },

      trimFields: {
        type: "boolean",
        label: "Trim Fields",
        description: "Remove leading and trailing whitespace",
        default: true,
        required: false,
      },

      encoding: {
        type: "select",
        label: "Encoding",
        description: "Character encoding of the CSV data",
        default: "utf8",
        required: false,
        options: [
          { value: "utf8", label: "UTF-8" },
          { value: "ascii", label: "ASCII" },
          { value: "latin1", label: "Latin-1" },
        ],
      },

      maxRows: {
        type: "number",
        label: "Max Rows",
        description: "Maximum number of rows to process (optional)",
        required: false,
        min: 1,
        max: 1000000,
        placeholder: "Leave empty for no limit",
      },

      validateData: {
        type: "boolean",
        label: "Validate Data",
        description: "Enable data validation and quality checks",
        default: true,
        required: false,
      },

      outputFormat: {
        type: "select",
        label: "Output Format",
        description: "Format for parsed records",
        default: "objects",
        required: false,
        options: [
          { value: "objects", label: "Objects (key-value pairs)" },
          { value: "arrays", label: "Arrays (positional values)" },
        ],
      },
    };
  }

  /**
   * Calculate port offset for positioning
   */
  private calculatePortOffset(
    portId: string,
    ports: Array<{ id: string }>,
    _type: "input" | "output",
  ): number {
    const index = ports.findIndex((p) => p.id === portId);
    const total = ports.length;

    if (total === 1) return 50; // Center single port

    // Distribute ports evenly from 20% to 80%
    const step = 60 / (total - 1);
    return 20 + index * step;
  }
}

/**
 * Factory function to create CSV Parser UI adapter
 */
export function createCSVParserUIAdapter(): CSVParserUIAdapter {
  const reactFlowAdapter = createStandardReactFlowAdapter();
  return new CSVParserUIAdapter(reactFlowAdapter);
}

/**
 * Default export for easy importing
 */
export default CSVParserUIAdapter;
