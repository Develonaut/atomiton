/**
 * Base Node UI Adapter - Core Foundation for All Node Types
 *
 * This adapter provides a generic UI bridge for any node that extends BaseNode.
 * It serves as the foundation adapter that other specialized adapters can extend
 * or use as a fallback for unknown node types.
 *
 * ARCHITECTURAL BENEFITS:
 * - Generic adapter for any BaseNode implementation
 * - Provides sensible defaults for all node types
 * - Follows the established createStandardReactFlowAdapter() pattern
 * - Type-safe configuration handling
 * - Clean separation between UI and Core
 */

import {
  BaseNodeUIAdapter as BaseUIAdapter,
  createStandardReactFlowAdapter,
  type NodeExecutionContext,
  type ReactFlowAdapter,
  type UIConfigSchema,
  type UINodeConfig,
  type UINodeDefinition,
} from "./NodeUIAdapter";

/**
 * Generic UI configuration for BaseNode
 * This provides a minimal configuration interface that all nodes support
 */
export interface BaseNodeUIConfig extends UINodeConfig {
  // Core configuration that all BaseNodes support
  executionTimeout?: number;
  retryCount?: number;
  enableCaching?: boolean;
  cacheTTL?: number;

  // Platform-specific settings
  requiredCapabilities?: string[];
  memoryLimit?: number;
}

/**
 * Generic Base Node UI Adapter Implementation
 * Works with any node that extends BaseNode from @atomiton/core
 */
export class GenericBaseNodeUIAdapter extends BaseUIAdapter<BaseNodeUIConfig> {
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
      category: coreDefinition.category || "general",
      version: coreDefinition.version,
      icon: coreDefinition.metadata?.icon || "box",

      // Convert core port definitions to UI format
      inputs: coreDefinition.inputPorts.map((port, index) => ({
        id: port.id || `input_${index}`,
        name: port.name || `Input ${index + 1}`,
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
        name: port.name || `Output ${index + 1}`,
        dataType: String(port.dataType || "any"),
        required: port.required || false,
        position: "right" as const,
        offset: this.calculatePortOffset(
          port.id || `output_${index}`,
          coreDefinition.outputPorts,
          "output",
        ),
      })),

      // Create generic UI config schema
      configSchema: this.createUIConfigSchema(),
      defaultConfig: this.coreConfigToUI(coreDefinition.defaultConfig),
    };
  }

  /**
   * Convert core configuration to UI configuration
   */
  coreConfigToUI(coreConfig: unknown): BaseNodeUIConfig {
    const config = (coreConfig as Record<string, unknown>) || {};

    return {
      executionTimeout: config.executionTimeout as number,
      retryCount: config.retryCount as number,
      enableCaching: config.enableCaching as boolean,
      cacheTTL: config.cacheTTL as number,
      requiredCapabilities: config.requiredCapabilities as string[],
      memoryLimit: config.memoryLimit as number,
    };
  }

  /**
   * Convert UI configuration to core configuration
   */
  uiConfigToCore(uiConfig: BaseNodeUIConfig): Record<string, unknown> {
    return {
      executionTimeout: uiConfig.executionTimeout,
      retryCount: uiConfig.retryCount,
      enableCaching: uiConfig.enableCaching,
      cacheTTL: uiConfig.cacheTTL,
      requiredCapabilities: uiConfig.requiredCapabilities,
      memoryLimit: uiConfig.memoryLimit,
    };
  }

  /**
   * Validate UI configuration
   */
  validateUIConfig(uiConfig: BaseNodeUIConfig): string[] {
    const errors: string[] = [];

    if (uiConfig.executionTimeout !== undefined) {
      if (
        typeof uiConfig.executionTimeout !== "number" ||
        uiConfig.executionTimeout < 1000
      ) {
        errors.push("Execution timeout must be at least 1000ms");
      }
      if (uiConfig.executionTimeout > 300000) {
        errors.push("Execution timeout cannot exceed 5 minutes (300000ms)");
      }
    }

    if (uiConfig.retryCount !== undefined) {
      if (typeof uiConfig.retryCount !== "number" || uiConfig.retryCount < 0) {
        errors.push("Retry count must be a non-negative number");
      }
      if (uiConfig.retryCount > 10) {
        errors.push("Retry count cannot exceed 10");
      }
    }

    if (uiConfig.cacheTTL !== undefined) {
      if (typeof uiConfig.cacheTTL !== "number" || uiConfig.cacheTTL < 1000) {
        errors.push("Cache TTL must be at least 1000ms");
      }
    }

    if (uiConfig.memoryLimit !== undefined) {
      if (
        typeof uiConfig.memoryLimit !== "number" ||
        uiConfig.memoryLimit < 64
      ) {
        errors.push("Memory limit must be at least 64MB");
      }
      if (uiConfig.memoryLimit > 4096) {
        errors.push("Memory limit cannot exceed 4096MB");
      }
    }

    return errors;
  }

  /**
   * Create execution context for core node
   */
  createExecutionContext(
    instanceId: string,
    config: BaseNodeUIConfig,
    inputs: Record<string, unknown>,
  ): Partial<NodeExecutionContext> {
    // Convert UI config back to core format
    const coreConfig = this.uiConfigToCore(config);

    // Return partial execution context structure
    // Note: Full context would need blueprint management system
    return {
      instanceId,
      nodeId: (this.nodeDefinition as { id: string }).id,
      config: coreConfig,
      inputs,
      workspaceRoot: process.cwd(),
      tempDirectory: "/tmp",
      limits: {
        maxMemoryMB: config.memoryLimit || 256,
        maxExecutionTimeMs: config.executionTimeout || 30000,
      },
      startTime: new Date(),
      metadata: {},
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
      executionTimeout: {
        type: "number",
        label: "Execution Timeout",
        description: "Maximum execution time in milliseconds",
        default: 60000,
        required: false,
        min: 1000,
        max: 300000,
        placeholder: "60000",
      },

      retryCount: {
        type: "number",
        label: "Retry Count",
        description: "Number of times to retry on failure",
        default: 1,
        required: false,
        min: 0,
        max: 10,
        placeholder: "1",
      },

      enableCaching: {
        type: "boolean",
        label: "Enable Caching",
        description: "Cache execution results to improve performance",
        default: false,
        required: false,
      },

      cacheTTL: {
        type: "number",
        label: "Cache TTL",
        description: "How long to keep cached results (milliseconds)",
        default: 60000,
        required: false,
        min: 1000,
        placeholder: "60000",
      },

      memoryLimit: {
        type: "number",
        label: "Memory Limit (MB)",
        description: "Maximum memory usage allowed",
        default: 256,
        required: false,
        min: 64,
        max: 4096,
        placeholder: "256",
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
 * Factory function to create a generic BaseNode UI adapter
 */
export function createBaseNodeUIAdapter(
  nodeDefinition: unknown,
): GenericBaseNodeUIAdapter {
  const reactFlowAdapter = createStandardReactFlowAdapter();
  return new GenericBaseNodeUIAdapter(reactFlowAdapter, nodeDefinition);
}

/**
 * Default export for easy importing
 */
export default GenericBaseNodeUIAdapter;
