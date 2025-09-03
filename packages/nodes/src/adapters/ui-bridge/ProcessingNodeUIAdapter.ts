/**
 * Processing Node UI Adapter - Specialized for Data Transformation and Computation
 *
 * This adapter is specifically designed for nodes that extend ProcessingNode from @atomiton/core.
 * It provides processing-specific configuration options including batch processing,
 * concurrency control, memory management, and performance optimization settings.
 *
 * ARCHITECTURAL BENEFITS:
 * - Specialized configuration for data transformation and computation
 * - Advanced batch processing controls
 * - Memory and performance management options
 * - Concurrency and parallelism settings
 * - Follows the established createStandardReactFlowAdapter() pattern
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
 * Processing Node specific UI configuration
 * Extends base configuration with processing operation specific options
 */
export interface ProcessingNodeUIConfig extends UINodeConfig {
  // Batch processing options
  batchSize: number;
  maxConcurrency: number;
  progressReportingInterval: number;

  // Memory management
  memoryThreshold: number; // percentage (0.0 to 1.0)
  maxMemoryUsage: number; // in MB
  enableMemoryOptimization: boolean;

  // Processing controls
  enableValidation: boolean;
  strictValidation: boolean;
  skipErrors: boolean;
  maxErrors: number;

  // Performance options
  enableProfiling: boolean;
  measurePerformance: boolean;
  enableCaching: boolean;
  cacheTTL: number;

  // Transform and aggregation settings
  enableTransformPipeline: boolean;
  enableFilterChain: boolean;
  enableSorting: boolean;
  enableGrouping: boolean;
  enableAggregation: boolean;
}

/**
 * Processing Node UI Adapter Implementation
 * Bridges between ProcessingNode implementations and UI components
 */
export class ProcessingNodeUIAdapter extends BaseNodeUIAdapter<ProcessingNodeUIConfig> {
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
      category: coreDefinition.category || "processing",
      version: coreDefinition.version,
      icon: coreDefinition.metadata?.icon || "cpu",

      // Convert core port definitions to UI format
      inputs: coreDefinition.inputPorts.map((port, index) => ({
        id: port.id || `input_${index}`,
        name: port.name || `Processing Input ${index + 1}`,
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
        name: port.name || `Processing Output ${index + 1}`,
        dataType: String(port.dataType || "any"),
        required: port.required || false,
        position: "right" as const,
        offset: this.calculatePortOffset(
          port.id || `output_${index}`,
          coreDefinition.outputPorts,
          "output",
        ),
      })),

      // Create processing-specific UI config schema
      configSchema: this.createUIConfigSchema(),
      defaultConfig: this.coreConfigToUI(coreDefinition.defaultConfig),
    };
  }

  /**
   * Convert core configuration to UI configuration
   */
  coreConfigToUI(coreConfig: unknown): ProcessingNodeUIConfig {
    const config = (coreConfig as Record<string, unknown>) || {};

    return {
      // Batch processing options
      batchSize: (config.batchSize as number) || 1000,
      maxConcurrency: (config.maxConcurrency as number) || 4,
      progressReportingInterval:
        (config.progressReportingInterval as number) || 10,

      // Memory management
      memoryThreshold: (config.memoryThreshold as number) || 0.8,
      maxMemoryUsage: (config.maxMemoryUsage as number) || 512,
      enableMemoryOptimization: config.enableMemoryOptimization !== false,

      // Processing controls
      enableValidation: config.enableValidation !== false,
      strictValidation: config.strictValidation === true,
      skipErrors: config.skipErrors === true,
      maxErrors: (config.maxErrors as number) || 100,

      // Performance options
      enableProfiling: config.enableProfiling === true,
      measurePerformance: config.measurePerformance === true,
      enableCaching: config.enableCaching === true,
      cacheTTL: (config.cacheTTL as number) || 300000, // 5 minutes

      // Transform and aggregation settings
      enableTransformPipeline: config.enableTransformPipeline !== false,
      enableFilterChain: config.enableFilterChain !== false,
      enableSorting: config.enableSorting !== false,
      enableGrouping: config.enableGrouping !== false,
      enableAggregation: config.enableAggregation !== false,
    };
  }

  /**
   * Convert UI configuration to core configuration
   */
  uiConfigToCore(uiConfig: ProcessingNodeUIConfig): Record<string, unknown> {
    return {
      batchSize: uiConfig.batchSize,
      maxConcurrency: uiConfig.maxConcurrency,
      progressReportingInterval: uiConfig.progressReportingInterval,
      memoryThreshold: uiConfig.memoryThreshold,
      maxMemoryUsage: uiConfig.maxMemoryUsage,
      enableMemoryOptimization: uiConfig.enableMemoryOptimization,
      enableValidation: uiConfig.enableValidation,
      strictValidation: uiConfig.strictValidation,
      skipErrors: uiConfig.skipErrors,
      maxErrors: uiConfig.maxErrors,
      enableProfiling: uiConfig.enableProfiling,
      measurePerformance: uiConfig.measurePerformance,
      enableCaching: uiConfig.enableCaching,
      cacheTTL: uiConfig.cacheTTL,
      enableTransformPipeline: uiConfig.enableTransformPipeline,
      enableFilterChain: uiConfig.enableFilterChain,
      enableSorting: uiConfig.enableSorting,
      enableGrouping: uiConfig.enableGrouping,
      enableAggregation: uiConfig.enableAggregation,
    };
  }

  /**
   * Validate UI configuration
   */
  validateUIConfig(uiConfig: ProcessingNodeUIConfig): string[] {
    const errors: string[] = [];

    // Validate batch size
    if (uiConfig.batchSize < 1) {
      errors.push("Batch size must be at least 1");
    }
    if (uiConfig.batchSize > 1000000) {
      errors.push("Batch size cannot exceed 1,000,000");
    }

    // Validate max concurrency
    if (uiConfig.maxConcurrency < 1) {
      errors.push("Max concurrency must be at least 1");
    }
    if (uiConfig.maxConcurrency > 32) {
      errors.push("Max concurrency cannot exceed 32");
    }

    // Validate progress reporting interval
    if (uiConfig.progressReportingInterval < 1) {
      errors.push("Progress reporting interval must be at least 1%");
    }
    if (uiConfig.progressReportingInterval > 50) {
      errors.push("Progress reporting interval cannot exceed 50%");
    }

    // Validate memory threshold
    if (uiConfig.memoryThreshold < 0.1) {
      errors.push("Memory threshold must be at least 10% (0.1)");
    }
    if (uiConfig.memoryThreshold > 1.0) {
      errors.push("Memory threshold cannot exceed 100% (1.0)");
    }

    // Validate max memory usage
    if (uiConfig.maxMemoryUsage < 64) {
      errors.push("Max memory usage must be at least 64MB");
    }
    if (uiConfig.maxMemoryUsage > 16384) {
      errors.push("Max memory usage cannot exceed 16GB (16384MB)");
    }

    // Validate max errors
    if (uiConfig.maxErrors < 0) {
      errors.push("Max errors must be non-negative");
    }
    if (uiConfig.maxErrors > 100000) {
      errors.push("Max errors cannot exceed 100,000");
    }

    // Validate cache TTL
    if (uiConfig.enableCaching && uiConfig.cacheTTL < 1000) {
      errors.push("Cache TTL must be at least 1000ms when caching is enabled");
    }
    if (uiConfig.cacheTTL > 86400000) {
      errors.push("Cache TTL cannot exceed 24 hours (86400000ms)");
    }

    return errors;
  }

  /**
   * Create execution context for core node
   */
  createExecutionContext(
    instanceId: string,
    config: ProcessingNodeUIConfig,
    inputs: Record<string, unknown>,
  ): Partial<NodeExecutionContext> {
    // Convert UI config back to core format
    const coreConfig = this.uiConfigToCore(config);

    // Return partial execution context structure optimized for processing operations
    return {
      instanceId,
      nodeId: (this.nodeDefinition as { id: string }).id,
      blueprintId: "ui-processing-execution", // Placeholder for UI-driven execution
      config: coreConfig,
      inputs,
      workspaceRoot: process.cwd(),
      tempDirectory: "/tmp",
      limits: {
        maxMemoryMB: config.maxMemoryUsage,
        maxExecutionTimeMs: 1800000, // 30 minutes for large dataset processing
        maxDiskSpaceMB: 2048, // 2GB for processing temporary files
      },
      startTime: new Date(),
      metadata: {
        processing: true,
        maxConcurrency: config.maxConcurrency,
        cachingEnabled: config.enableCaching,
        progressInterval: config.progressReportingInterval,
      },
      log: {
        info: (_message: string, _data?: unknown) => {},
        warn: (_message: string, _data?: unknown) => {},
        error: (_message: string, _data?: unknown) => {},
        debug: (_message: string, _data?: unknown) => {},
      },
      reportProgress: (_progress: number, _message?: string) => {},
      // Processing specific abort signal
      abortSignal: new AbortController().signal,
    };
  }

  /**
   * Create UI-friendly configuration schema
   */
  private createUIConfigSchema(): UIConfigSchema {
    return {
      batchSize: {
        type: "number",
        label: "Batch Size",
        description: "Number of items to process in each batch",
        default: 1000,
        required: false,
        min: 1,
        max: 1000000,
        placeholder: "1000",
      },

      maxConcurrency: {
        type: "number",
        label: "Max Concurrency",
        description: "Maximum number of concurrent processing operations",
        default: 4,
        required: false,
        min: 1,
        max: 32,
        placeholder: "4",
      },

      progressReportingInterval: {
        type: "number",
        label: "Progress Interval (%)",
        description: "How often to report progress (percentage)",
        default: 10,
        required: false,
        min: 1,
        max: 50,
        placeholder: "10",
      },

      memoryThreshold: {
        type: "number",
        label: "Memory Threshold",
        description: "Memory usage threshold (0.1 = 10%, 1.0 = 100%)",
        default: 0.8,
        required: false,
        min: 0.1,
        max: 1.0,
        placeholder: "0.8",
      },

      maxMemoryUsage: {
        type: "number",
        label: "Max Memory (MB)",
        description: "Maximum memory usage allowed",
        default: 512,
        required: false,
        min: 64,
        max: 16384,
        placeholder: "512",
      },

      enableMemoryOptimization: {
        type: "boolean",
        label: "Memory Optimization",
        description: "Enable automatic memory optimization strategies",
        default: true,
        required: false,
      },

      enableValidation: {
        type: "boolean",
        label: "Enable Validation",
        description: "Validate input data before processing",
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

      skipErrors: {
        type: "boolean",
        label: "Skip Errors",
        description: "Skip items that cause errors instead of stopping",
        default: false,
        required: false,
      },

      maxErrors: {
        type: "number",
        label: "Max Errors",
        description: "Maximum number of errors before stopping",
        default: 100,
        required: false,
        min: 0,
        max: 100000,
        placeholder: "100",
      },

      enableProfiling: {
        type: "boolean",
        label: "Enable Profiling",
        description: "Collect detailed performance profiling data",
        default: false,
        required: false,
      },

      measurePerformance: {
        type: "boolean",
        label: "Measure Performance",
        description: "Measure and report processing performance metrics",
        default: false,
        required: false,
      },

      enableCaching: {
        type: "boolean",
        label: "Enable Caching",
        description: "Cache processing results to improve performance",
        default: false,
        required: false,
      },

      cacheTTL: {
        type: "number",
        label: "Cache TTL (ms)",
        description: "How long to keep cached results",
        default: 300000,
        required: false,
        min: 1000,
        max: 86400000,
        placeholder: "300000",
      },

      enableTransformPipeline: {
        type: "boolean",
        label: "Transform Pipeline",
        description: "Enable data transformation pipeline",
        default: true,
        required: false,
      },

      enableFilterChain: {
        type: "boolean",
        label: "Filter Chain",
        description: "Enable data filtering chain",
        default: true,
        required: false,
      },

      enableSorting: {
        type: "boolean",
        label: "Enable Sorting",
        description: "Enable data sorting capabilities",
        default: true,
        required: false,
      },

      enableGrouping: {
        type: "boolean",
        label: "Enable Grouping",
        description: "Enable data grouping capabilities",
        default: true,
        required: false,
      },

      enableAggregation: {
        type: "boolean",
        label: "Enable Aggregation",
        description: "Enable data aggregation capabilities",
        default: true,
        required: false,
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
 * Factory function to create Processing Node UI adapter
 */
export function createProcessingNodeUIAdapter(
  nodeDefinition: unknown,
): ProcessingNodeUIAdapter {
  const reactFlowAdapter = createStandardReactFlowAdapter();
  return new ProcessingNodeUIAdapter(reactFlowAdapter, nodeDefinition);
}

/**
 * Default export for easy importing
 */
export default ProcessingNodeUIAdapter;
