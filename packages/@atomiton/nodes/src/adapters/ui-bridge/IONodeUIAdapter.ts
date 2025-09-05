/**
 * IO Node UI Adapter - Specialized for Input/Output Operations
 *
 * This adapter is specifically designed for nodes that extend IONode from @atomiton/core.
 * It provides I/O-specific configuration options including file system operations,
 * path management, and security settings while maintaining the established pattern.
 *
 * ARCHITECTURAL BENEFITS:
 * - Specialized configuration for I/O operations
 * - File system path validation and security
 * - Platform-specific I/O capabilities
 * - Network and local I/O handling
 * - Follows the createStandardReactFlowAdapter() pattern
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
 * IO Node specific UI configuration
 * Extends base configuration with I/O operation specific options
 */
export interface IONodeUIConfig extends UINodeConfig {
  // Path and file system options
  basePath: string;
  createDirectories: boolean;
  overwriteExisting: boolean;

  // File handling options
  encoding: "utf8" | "ascii" | "latin1" | "base64" | "binary";
  maxFileSize: number; // in MB
  allowedExtensions: string[];

  // Security and validation
  preventPathTraversal: boolean;
  restrictToWorkspace: boolean;
  maxPathLength: number;

  // Performance options
  atomicWrites: boolean;
  createBackups: boolean;
  concurrentOperations: number;

  // Network I/O (if applicable)
  timeout: number;
  retries: number;
  enableCompression: boolean;
}

/**
 * IO Node UI Adapter Implementation
 * Bridges between IONode implementations and UI components
 */
export class IONodeUIAdapter extends BaseNodeUIAdapter<IONodeUIConfig> {
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
      category: coreDefinition.category || "io",
      version: coreDefinition.version,
      icon: coreDefinition.metadata?.icon || "folder",

      // Convert core port definitions to UI format
      inputs: coreDefinition.inputPorts.map((port, index) => ({
        id: port.id || `input_${index}`,
        name: port.name || `IO Input ${index + 1}`,
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
        name: port.name || `IO Output ${index + 1}`,
        dataType: String(port.dataType || "any"),
        required: port.required || false,
        position: "right" as const,
        offset: this.calculatePortOffset(
          port.id || `output_${index}`,
          coreDefinition.outputPorts,
          "output",
        ),
      })),

      // Create I/O-specific UI config schema
      configSchema: this.createUIConfigSchema(),
      defaultConfig: this.coreConfigToUI(coreDefinition.defaultConfig),
    };
  }

  /**
   * Convert core configuration to UI configuration
   */
  coreConfigToUI(coreConfig: unknown): IONodeUIConfig {
    const config = (coreConfig as Record<string, unknown>) || {};

    return {
      // Path and file system options
      basePath: (config.basePath as string) || "",
      createDirectories: config.createDirectories !== false, // default to true
      overwriteExisting: config.overwriteExisting === true,

      // File handling options
      encoding:
        (config.encoding as
          | "utf8"
          | "ascii"
          | "latin1"
          | "base64"
          | "binary") || "utf8",
      maxFileSize: (config.maxFileSize as number) || 100,
      allowedExtensions: (config.allowedExtensions as string[]) || [],

      // Security and validation
      preventPathTraversal: config.preventPathTraversal !== false, // default to true
      restrictToWorkspace: config.restrictToWorkspace !== false, // default to true
      maxPathLength: (config.maxPathLength as number) || 260,

      // Performance options
      atomicWrites: config.atomicWrites !== false, // default to true
      createBackups: config.createBackups === true,
      concurrentOperations: (config.concurrentOperations as number) || 4,

      // Network I/O options
      timeout: (config.timeout as number) || 30000,
      retries: (config.retries as number) || 3,
      enableCompression: config.enableCompression === true,
    };
  }

  /**
   * Convert UI configuration to core configuration
   */
  uiConfigToCore(uiConfig: IONodeUIConfig): Record<string, unknown> {
    return {
      basePath: uiConfig.basePath,
      createDirectories: uiConfig.createDirectories,
      overwriteExisting: uiConfig.overwriteExisting,
      encoding: uiConfig.encoding,
      maxFileSize: uiConfig.maxFileSize,
      allowedExtensions: uiConfig.allowedExtensions,
      preventPathTraversal: uiConfig.preventPathTraversal,
      restrictToWorkspace: uiConfig.restrictToWorkspace,
      maxPathLength: uiConfig.maxPathLength,
      atomicWrites: uiConfig.atomicWrites,
      createBackups: uiConfig.createBackups,
      concurrentOperations: uiConfig.concurrentOperations,
      timeout: uiConfig.timeout,
      retries: uiConfig.retries,
      enableCompression: uiConfig.enableCompression,
    };
  }

  /**
   * Validate UI configuration
   */
  validateUIConfig(uiConfig: IONodeUIConfig): string[] {
    const errors: string[] = [];

    // Validate base path
    if (uiConfig.basePath && uiConfig.basePath.includes("..")) {
      errors.push("Base path cannot contain path traversal sequences (..)");
    }

    // Validate max file size
    if (uiConfig.maxFileSize < 1) {
      errors.push("Max file size must be at least 1MB");
    }
    if (uiConfig.maxFileSize > 10240) {
      errors.push("Max file size cannot exceed 10GB (10240MB)");
    }

    // Validate encoding
    const validEncodings = ["utf8", "ascii", "latin1", "base64", "binary"];
    if (!validEncodings.includes(uiConfig.encoding)) {
      errors.push(`Encoding must be one of: ${validEncodings.join(", ")}`);
    }

    // Validate max path length
    if (uiConfig.maxPathLength < 50) {
      errors.push("Max path length must be at least 50 characters");
    }
    if (uiConfig.maxPathLength > 32767) {
      errors.push("Max path length cannot exceed 32767 characters");
    }

    // Validate concurrent operations
    if (uiConfig.concurrentOperations < 1) {
      errors.push("Concurrent operations must be at least 1");
    }
    if (uiConfig.concurrentOperations > 50) {
      errors.push("Concurrent operations cannot exceed 50");
    }

    // Validate timeout
    if (uiConfig.timeout < 1000) {
      errors.push("Timeout must be at least 1000ms (1 second)");
    }
    if (uiConfig.timeout > 600000) {
      errors.push("Timeout cannot exceed 600000ms (10 minutes)");
    }

    // Validate retries
    if (uiConfig.retries < 0) {
      errors.push("Retries must be non-negative");
    }
    if (uiConfig.retries > 20) {
      errors.push("Retries cannot exceed 20");
    }

    // Validate allowed extensions format
    for (const ext of uiConfig.allowedExtensions) {
      if (typeof ext !== "string" || ext.length === 0) {
        errors.push("All allowed extensions must be non-empty strings");
        break;
      }
    }

    return errors;
  }

  /**
   * Create execution context for core node
   */
  createExecutionContext(
    instanceId: string,
    config: IONodeUIConfig,
    inputs: Record<string, unknown>,
  ): Partial<NodeExecutionContext> {
    // Convert UI config back to core format
    const coreConfig = this.uiConfigToCore(config);

    // Return partial execution context structure optimized for I/O operations
    return {
      instanceId,
      nodeId: (this.nodeDefinition as { id: string }).id,
      blueprintId: "ui-io-execution", // Placeholder for UI-driven execution
      config: coreConfig,
      inputs,
      workspaceRoot: process.cwd(),
      tempDirectory: "/tmp",
      limits: {
        maxMemoryMB: Math.min(config.maxFileSize * 2, 1024), // 2x file size or 1GB max
        maxExecutionTimeMs: config.timeout * (config.retries + 1),
        maxDiskSpaceMB: config.maxFileSize * config.concurrentOperations,
      },
      startTime: new Date(),
      metadata: {
        ioOperations: true,
        concurrent: config.concurrentOperations,
        allowedExtensions: config.allowedExtensions,
      },
      log: {
        info: (_message: string, _data?: unknown) => {},
        warn: (_message: string, _data?: unknown) => {},
        error: (_message: string, _data?: unknown) => {},
        debug: (_message: string, _data?: unknown) => {},
      },
      reportProgress: (_progress: number, _message?: string) => {},
      // I/O specific abort signal
      abortSignal: new AbortController().signal,
    };
  }

  /**
   * Create UI-friendly configuration schema
   */
  private createUIConfigSchema(): UIConfigSchema {
    return {
      basePath: {
        type: "string",
        label: "Base Path",
        description: "Base directory for file operations (optional)",
        required: false,
        placeholder: "e.g., /data/input or ./files",
      },

      createDirectories: {
        type: "boolean",
        label: "Create Directories",
        description: "Automatically create directories if they don't exist",
        default: true,
        required: false,
      },

      overwriteExisting: {
        type: "boolean",
        label: "Overwrite Existing",
        description: "Overwrite existing files/directories",
        default: false,
        required: false,
      },

      encoding: {
        type: "select",
        label: "Encoding",
        description: "Character encoding for text files",
        default: "utf8",
        required: false,
        options: [
          { value: "utf8", label: "UTF-8" },
          { value: "ascii", label: "ASCII" },
          { value: "latin1", label: "Latin-1" },
          { value: "base64", label: "Base64" },
          { value: "binary", label: "Binary" },
        ],
      },

      maxFileSize: {
        type: "number",
        label: "Max File Size (MB)",
        description: "Maximum file size for operations",
        default: 100,
        required: false,
        min: 1,
        max: 10240,
        placeholder: "100",
      },

      preventPathTraversal: {
        type: "boolean",
        label: "Prevent Path Traversal",
        description: "Block paths containing .. or other traversal attempts",
        default: true,
        required: false,
      },

      restrictToWorkspace: {
        type: "boolean",
        label: "Restrict to Workspace",
        description: "Only allow operations within the workspace directory",
        default: true,
        required: false,
      },

      maxPathLength: {
        type: "number",
        label: "Max Path Length",
        description: "Maximum allowed path length in characters",
        default: 260,
        required: false,
        min: 50,
        max: 32767,
        placeholder: "260",
      },

      atomicWrites: {
        type: "boolean",
        label: "Atomic Writes",
        description: "Use atomic file writes (safer but slower)",
        default: true,
        required: false,
      },

      createBackups: {
        type: "boolean",
        label: "Create Backups",
        description: "Create backup copies before overwriting files",
        default: false,
        required: false,
      },

      concurrentOperations: {
        type: "number",
        label: "Concurrent Operations",
        description: "Maximum number of simultaneous I/O operations",
        default: 4,
        required: false,
        min: 1,
        max: 50,
        placeholder: "4",
      },

      timeout: {
        type: "number",
        label: "Timeout (ms)",
        description: "Operation timeout in milliseconds",
        default: 30000,
        required: false,
        min: 1000,
        max: 600000,
        placeholder: "30000",
      },

      retries: {
        type: "number",
        label: "Retries",
        description: "Number of retry attempts on failure",
        default: 3,
        required: false,
        min: 0,
        max: 20,
        placeholder: "3",
      },

      enableCompression: {
        type: "boolean",
        label: "Enable Compression",
        description: "Use compression for network I/O operations",
        default: false,
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
 * Factory function to create IO Node UI adapter
 */
export function createIONodeUIAdapter(
  nodeDefinition: unknown,
): IONodeUIAdapter {
  const reactFlowAdapter = createStandardReactFlowAdapter();
  return new IONodeUIAdapter(reactFlowAdapter, nodeDefinition);
}

/**
 * Default export for easy importing
 */
export default IONodeUIAdapter;
