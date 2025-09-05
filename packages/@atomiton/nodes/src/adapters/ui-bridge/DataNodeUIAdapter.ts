/**
 * Data Node UI Adapter - Specialized for Data Processing Nodes
 *
 * This adapter is specifically designed for nodes that extend DataNode from @atomiton/core.
 * It provides data-specific configuration options and validation while maintaining
 * the clean UI → Nodes → Core architecture pattern.
 *
 * ARCHITECTURAL BENEFITS:
 * - Specialized configuration for data processing nodes
 * - Built-in data validation options
 * - Batch processing controls
 * - Data format handling
 * - Extends the established adapter pattern
 */

import type {
  NodeExecutionContext,
  ReactFlowAdapter,
  UIConfigSchema,
  UINodeConfig,
  UINodeDefinition,
} from "./NodeUIAdapter";
import {
  BaseNodeUIAdapter,
  createStandardReactFlowAdapter,
} from "./NodeUIAdapter";

/**
 * Data Node specific UI configuration
 * Extends base configuration with data processing specific options
 */
export interface DataNodeUIConfig extends UINodeConfig {
  // Data validation options
  validationEnabled: boolean;
  strictValidation: boolean;
  allowEmptyData: boolean;

  // Data processing options
  batchSize: number;
  maxDataSize: number; // in MB
  dataFormat: "auto" | "json" | "csv" | "xml" | "yaml" | "text";

  // Error handling
  skipInvalidRecords: boolean;
  maxErrors: number;

  // Performance options
  enableStreaming: boolean;
  streamChunkSize: number;
}

/**
 * Data Node UI Adapter Implementation
 * Bridges between DataNode implementations and UI components
 */
export class DataNodeUIAdapter extends BaseNodeUIAdapter<DataNodeUIConfig> {
  private nodeDefinition: unknown;

  constructor(reactFlowAdapter: ReactFlowAdapter, nodeDefinition: unknown) {
    super(reactFlowAdapter);
    this.nodeDefinition = nodeDefinition;
  }

  /**
   * Convert core node definition to UI-friendly format
   */
  getUIDefinition(): UINodeDefinition {
    const coreDefinition = this.nodeDefinition as {
      id: string;
      name: string;
      description: string;
      category?: string;
      version: string;
      metadata?: { icon?: string };
      inputPorts: Array<{
        id?: string;
        name?: string;
        dataType?: string;
        required?: boolean;
      }>;
      outputPorts: Array<{
        id?: string;
        name?: string;
        dataType?: string;
        required?: boolean;
      }>;
      defaultConfig: unknown;
    };

    return {
      id: coreDefinition.id,
      name: coreDefinition.name,
      description: coreDefinition.description,
      category: coreDefinition.category || "data",
      version: coreDefinition.version,
      icon: coreDefinition.metadata?.icon || "database",

      // Convert core port definitions to UI format
      inputs: coreDefinition.inputPorts.map((port, index) => ({
        id: port.id || `input_${index}`,
        name: port.name || `Data Input ${index + 1}`,
        dataType: String(port.dataType || "any"),
        required: port.required || false,
        position: "left" as const,
        offset: this.calculatePortOffset(
          port.id || `input_${index}`,
          coreDefinition.inputPorts,
          "input",
        ),
      })),

      outputs: coreDefinition.outputPorts.map((port, index) => ({
        id: port.id || `output_${index}`,
        name: port.name || `Data Output ${index + 1}`,
        dataType: String(port.dataType || "any"),
        required: port.required || false,
        position: "right" as const,
        offset: this.calculatePortOffset(
          port.id || `output_${index}`,
          coreDefinition.outputPorts,
          "output",
        ),
      })),

      // Create data-specific UI config schema
      configSchema: this.createUIConfigSchema(),
      defaultConfig: this.coreConfigToUI(coreDefinition.defaultConfig),
    };
  }

  /**
   * Convert core configuration to UI configuration
   */
  coreConfigToUI(coreConfig: unknown): DataNodeUIConfig {
    const config = (coreConfig as Record<string, unknown>) || {};

    return {
      // Data validation options
      validationEnabled: config.validationEnabled !== false, // default to true
      strictValidation: config.strictValidation === true,
      allowEmptyData: config.allowEmptyData === true,

      // Data processing options
      batchSize: (config.batchSize as number) || 1000,
      maxDataSize: (config.maxDataSize as number) || 100,
      dataFormat:
        (config.dataFormat as
          | "auto"
          | "json"
          | "csv"
          | "xml"
          | "yaml"
          | "text") || "auto",

      // Error handling
      skipInvalidRecords: config.skipInvalidRecords === true,
      maxErrors: (config.maxErrors as number) || 10,

      // Performance options
      enableStreaming: config.enableStreaming === true,
      streamChunkSize: (config.streamChunkSize as number) || 1024,
    };
  }

  /**
   * Convert UI configuration to core configuration
   */
  uiConfigToCore(uiConfig: DataNodeUIConfig): Record<string, unknown> {
    return {
      validationEnabled: uiConfig.validationEnabled,
      strictValidation: uiConfig.strictValidation,
      allowEmptyData: uiConfig.allowEmptyData,
      batchSize: uiConfig.batchSize,
      maxDataSize: uiConfig.maxDataSize,
      dataFormat: uiConfig.dataFormat,
      skipInvalidRecords: uiConfig.skipInvalidRecords,
      maxErrors: uiConfig.maxErrors,
      enableStreaming: uiConfig.enableStreaming,
      streamChunkSize: uiConfig.streamChunkSize,
    };
  }

  /**
   * Validate UI configuration
   */
  validateUIConfig(uiConfig: DataNodeUIConfig): string[] {
    const errors: string[] = [];

    // Validate batch size
    if (uiConfig.batchSize < 1) {
      errors.push("Batch size must be at least 1");
    }
    if (uiConfig.batchSize > 100000) {
      errors.push("Batch size cannot exceed 100,000");
    }

    // Validate max data size
    if (uiConfig.maxDataSize < 1) {
      errors.push("Max data size must be at least 1MB");
    }
    if (uiConfig.maxDataSize > 1024) {
      errors.push("Max data size cannot exceed 1024MB (1GB)");
    }

    // Validate max errors
    if (uiConfig.maxErrors < 0) {
      errors.push("Max errors must be non-negative");
    }
    if (uiConfig.maxErrors > 10000) {
      errors.push("Max errors cannot exceed 10,000");
    }

    // Validate stream chunk size
    if (uiConfig.enableStreaming && uiConfig.streamChunkSize < 64) {
      errors.push(
        "Stream chunk size must be at least 64 bytes when streaming is enabled",
      );
    }
    if (uiConfig.streamChunkSize > 1048576) {
      errors.push("Stream chunk size cannot exceed 1MB");
    }

    // Validate data format
    const validFormats = ["auto", "json", "csv", "xml", "yaml", "text"];
    if (!validFormats.includes(uiConfig.dataFormat)) {
      errors.push(`Data format must be one of: ${validFormats.join(", ")}`);
    }

    return errors;
  }

  /**
   * Create execution context for core node
   */
  createExecutionContext(
    instanceId: string,
    config: DataNodeUIConfig,
    inputs: Record<string, unknown>,
  ): Partial<NodeExecutionContext> {
    // Convert UI config back to core format
    const coreConfig = this.uiConfigToCore(config);

    // Return partial execution context structure optimized for data processing
    return {
      instanceId,
      nodeId: (this.nodeDefinition as { id: string }).id,
      blueprintId: "ui-data-execution", // Placeholder for UI-driven execution
      config: coreConfig,
      inputs,
      workspaceRoot: process.cwd(),
      tempDirectory: "/tmp",
      limits: {
        maxMemoryMB: config.maxDataSize * 2, // Allow 2x data size for processing
        maxExecutionTimeMs: 300000, // 5 minutes for large datasets
        maxDiskSpaceMB: 2048, // 2GB for data processing
      },
      startTime: new Date(),
      metadata: {
        dataProcessing: true,
        batchSize: config.batchSize,
        streamingEnabled: config.enableStreaming,
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
      validationEnabled: {
        type: "boolean",
        label: "Enable Validation",
        description: "Enable data validation and quality checks",
        default: true,
        required: false,
      },

      strictValidation: {
        type: "boolean",
        label: "Strict Validation",
        description: "Use strict validation rules (may reject more data)",
        default: false,
        required: false,
      },

      allowEmptyData: {
        type: "boolean",
        label: "Allow Empty Data",
        description: "Allow processing of empty or null data inputs",
        default: false,
        required: false,
      },

      batchSize: {
        type: "number",
        label: "Batch Size",
        description: "Number of records to process in each batch",
        default: 1000,
        required: false,
        min: 1,
        max: 100000,
        placeholder: "1000",
      },

      maxDataSize: {
        type: "number",
        label: "Max Data Size (MB)",
        description: "Maximum size of data to process",
        default: 100,
        required: false,
        min: 1,
        max: 1024,
        placeholder: "100",
      },

      dataFormat: {
        type: "select",
        label: "Data Format",
        description: "Expected format of input data",
        default: "auto",
        required: false,
        options: [
          { value: "auto", label: "Auto-detect" },
          { value: "json", label: "JSON" },
          { value: "csv", label: "CSV" },
          { value: "xml", label: "XML" },
          { value: "yaml", label: "YAML" },
          { value: "text", label: "Plain Text" },
        ],
      },

      skipInvalidRecords: {
        type: "boolean",
        label: "Skip Invalid Records",
        description: "Skip records that fail validation instead of stopping",
        default: false,
        required: false,
      },

      maxErrors: {
        type: "number",
        label: "Max Errors",
        description: "Maximum number of errors before stopping",
        default: 10,
        required: false,
        min: 0,
        max: 10000,
        placeholder: "10",
      },

      enableStreaming: {
        type: "boolean",
        label: "Enable Streaming",
        description: "Process data in streaming mode for large datasets",
        default: false,
        required: false,
      },

      streamChunkSize: {
        type: "number",
        label: "Stream Chunk Size",
        description: "Size of each data chunk when streaming (bytes)",
        default: 1024,
        required: false,
        min: 64,
        max: 1048576,
        placeholder: "1024",
      },
    };
  }

  /**
   * Calculate port offset for positioning
   */
  private calculatePortOffset(
    portId: string,
    ports: Array<{ id?: string }>,
    _type: "input" | "output",
  ): number {
    const index = ports.findIndex((p) => (p.id || "") === portId);
    const total = ports.length;

    if (total === 1) return 50; // Center single port

    // Distribute ports evenly from 20% to 80%
    const step = 60 / (total - 1);
    return 20 + index * step;
  }
}

/**
 * Factory function to create Data Node UI adapter
 */
export function createDataNodeUIAdapter(
  nodeDefinition: unknown,
): DataNodeUIAdapter {
  const reactFlowAdapter = createStandardReactFlowAdapter();
  return new DataNodeUIAdapter(reactFlowAdapter, nodeDefinition);
}

/**
 * Default export for easy importing
 */
export default DataNodeUIAdapter;
