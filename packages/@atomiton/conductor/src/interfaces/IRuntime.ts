import type {
  INode,
  NodeExecutionContext,
  NodeExecutionResult,
} from "@atomiton/nodes";

/**
 * Runtime language options
 */
export type RuntimeLanguage =
  | "typescript"
  | "rust"
  | "python"
  | "wasm"
  | "golang";

/**
 * Runtime configuration
 */
export type RuntimeConfig = {
  language: RuntimeLanguage;
  module?: string;
  handler?: string;
  options?: Record<string, unknown>;
};

/**
 * Runtime capabilities and constraints
 */
export type RuntimeCapabilities = {
  supportsStreaming: boolean;
  supportsParallel: boolean;
  supportsGPU?: boolean;
  maxMemoryMB?: number;
  maxExecutionTimeMs?: number;
};

/**
 * Runtime execution options
 */
export type RuntimeExecutionOptions = {
  timeout?: number;
  memory?: number;
  environment?: Record<string, string>;
  workDir?: string;
};

/**
 * Base runtime interface for executing nodes
 * Each language/environment has its own implementation
 */
export type IRuntime = {
  /**
   * Runtime language identifier
   */
  readonly language: RuntimeLanguage;

  /**
   * Runtime capabilities
   */
  readonly capabilities: RuntimeCapabilities;

  /**
   * Initialize the runtime
   */
  initialize(): Promise<void>;

  /**
   * Check if runtime is ready
   */
  isReady(): boolean;

  /**
   * Execute a node in this runtime
   */
  execute(
    node: INode,
    context: NodeExecutionContext,
    options?: RuntimeExecutionOptions,
  ): Promise<NodeExecutionResult>;

  /**
   * Load a native module (for Rust, WASM, Python, etc.)
   */
  loadModule?(modulePath: string): Promise<void>;

  /**
   * Cleanup runtime resources
   */
  cleanup(): Promise<void>;

  /**
   * Get runtime metrics
   */
  getMetrics(): RuntimeMetrics;
};

/**
 * Runtime performance metrics
 */
export type RuntimeMetrics = {
  executionsCount: number;
  totalExecutionTimeMs: number;
  averageExecutionTimeMs: number;
  memoryUsageMB: number;
  errors: number;
};
