/**
 * Base Node Package Interface
 *
 * This defines the contract that every node package must implement to ensure
 * 1:1 mapping between logic and UI, with clean separation of concerns.
 */

import type { NodeProps } from "@xyflow/react";
import type { z } from "zod";

import type {
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from "../types";

/**
 * Node Logic Interface - Pure business logic, no UI concerns
 * This contains all the execution logic for a node
 */
export interface NodeLogic<TConfig = Record<string, unknown>> {
  /** Execute the node's business logic */
  execute(
    context: NodeExecutionContext,
    config: TConfig,
  ): Promise<NodeExecutionResult>;

  /** Validate node configuration */
  validateConfig?(config: unknown): config is TConfig;

  /** Get default configuration values */
  getDefaultConfig?(): Partial<TConfig>;

  /** Custom validation logic for inputs */
  validateInputs?(inputs: Record<string, unknown>): boolean;
}

/**
 * Node UI Component Properties
 * Extends React Flow's NodeProps with our node-specific data
 */
export interface NodeUIProps<TData = Record<string, unknown>>
  extends NodeProps {
  data: TData & {
    config?: Record<string, unknown>;
    status?: "idle" | "running" | "success" | "error" | "warning";
    progress?: number;
    error?: string;
  };
}

/**
 * Node UI Component Interface - Pure display and user interaction
 * This handles all visual representation and user configuration
 */
export interface NodeUIComponent<TData = Record<string, unknown>> {
  /** The component function */
  (props: NodeUIProps<TData>): React.ReactElement | null;
  /** Display name for debugging */
  displayName?: string;
}

/**
 * Node Test Suite Interface - Optional testing utilities
 */
export interface NodeTestSuite {
  /** Test data for unit tests */
  testData?: {
    validConfigs: Array<Record<string, unknown>>;
    invalidConfigs: Array<Record<string, unknown>>;
    validInputs: Array<Record<string, unknown>>;
    invalidInputs: Array<Record<string, unknown>>;
  };

  /** Custom test utilities */
  testUtils?: {
    createMockContext: () => NodeExecutionContext;
    createMockInputs: (
      overrides?: Record<string, unknown>,
    ) => Record<string, unknown>;
  };
}

/**
 * Complete Node Package - The main interface every node must implement
 * This ensures every node has both logic and UI co-located but cleanly separated
 */
export interface NodePackage<
  TConfig = Record<string, unknown>,
  TUIData = Record<string, unknown>,
> {
  /** Node definition (metadata, ports, schema, etc.) */
  definition: NodeDefinition;

  /** Business logic implementation (NO UI imports allowed) */
  logic: NodeLogic<TConfig>;

  /** UI component for visual representation (NO business logic allowed) */
  ui: NodeUIComponent<TUIData>;

  /** Configuration schema (shared between logic and UI) */
  configSchema: z.ZodSchema<TConfig>;

  /** Optional test suite */
  tests?: NodeTestSuite;

  /** Package metadata */
  metadata: {
    /** Package version (semantic) */
    version: string;
    /** Package author */
    author: string;
    /** Package description */
    description: string;
    /** Keywords for searchability */
    keywords: string[];
    /** Icon identifier */
    icon: string;
    /** Documentation URL */
    documentationUrl?: string;
    /** Is this node experimental? */
    experimental?: boolean;
    /** Is this node deprecated? */
    deprecated?: boolean;
  };
}

/**
 * Node Package Builder - Helper to ensure proper structure
 */
export abstract class BaseNodePackage<
  TConfig = Record<string, unknown>,
  TUIData = Record<string, unknown>,
> implements NodePackage<TConfig, TUIData>
{
  abstract readonly definition: NodeDefinition;
  abstract readonly logic: NodeLogic<TConfig>;
  abstract readonly ui: NodeUIComponent<TUIData>;
  abstract readonly configSchema: z.ZodSchema<TConfig>;
  abstract readonly metadata: NodePackage<TConfig, TUIData>["metadata"];

  readonly tests?: NodeTestSuite;

  /**
   * Validate that this package is properly structured
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check that definition exists and has required fields
    if (!this.definition) {
      errors.push("Node definition is required");
    } else {
      if (!this.definition.id) errors.push("Node definition must have an ID");
      if (!this.definition.name)
        errors.push("Node definition must have a name");
      if (!this.definition.execute)
        errors.push("Node definition must have an execute function");
    }

    // Check that logic exists
    if (!this.logic) {
      errors.push("Node logic is required");
    } else {
      if (typeof this.logic.execute !== "function") {
        errors.push("Node logic must have an execute function");
      }
    }

    // Check that UI exists
    if (!this.ui) {
      errors.push("Node UI component is required");
    } else {
      if (typeof this.ui !== "function") {
        errors.push("Node UI must be a React component");
      }
    }

    // Check that config schema exists
    if (!this.configSchema) {
      errors.push("Node config schema is required");
    }

    // Check metadata
    if (!this.metadata) {
      errors.push("Node metadata is required");
    } else {
      if (!this.metadata.version)
        errors.push("Node metadata must have a version");
      if (!this.metadata.author)
        errors.push("Node metadata must have an author");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get the node type identifier
   */
  getId(): string {
    return this.definition.id;
  }

  /**
   * Get the node version
   */
  getVersion(): string {
    return this.metadata.version;
  }

  /**
   * Check if node is experimental
   */
  isExperimental(): boolean {
    return this.metadata.experimental ?? false;
  }

  /**
   * Check if node is deprecated
   */
  isDeprecated(): boolean {
    return this.metadata.deprecated ?? false;
  }
}

/**
 * Node Package Registry Entry
 * Used by the registry to track and organize node packages
 */
export interface NodePackageRegistryEntry {
  /** Unique package identifier */
  id: string;
  /** Package instance */
  package: NodePackage;
  /** Registration timestamp */
  registeredAt: Date;
  /** Package file path (for dev mode hot reloading) */
  filePath?: string;
  /** Package validation result */
  validation: {
    valid: boolean;
    errors: string[];
    lastChecked: Date;
  };
}
