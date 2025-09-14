import type {
  INode,
  NodeExecutionContext,
  NodeExecutionResult,
} from "@atomiton/nodes";
import type { IRuntime, RuntimeLanguage } from "../interfaces/IRuntime";
import { TypeScriptRuntime } from "./TypeScriptRuntime";

/**
 * RuntimeRouter manages and routes node execution to appropriate runtimes
 * Supports TypeScript initially with future support for Rust, WASM, Python
 */
export class RuntimeRouter {
  private readonly runtimes: Map<RuntimeLanguage, IRuntime>;
  private readonly initPromises: Map<RuntimeLanguage, Promise<void>>;

  constructor() {
    this.runtimes = new Map();
    this.initPromises = new Map();

    // Register default TypeScript runtime
    this.registerRuntime(new TypeScriptRuntime());
  }

  /**
   * Register a runtime implementation
   */
  registerRuntime(runtime: IRuntime): void {
    this.runtimes.set(runtime.language, runtime);

    // Initialize runtime lazily
    if (!runtime.isReady()) {
      const initPromise = runtime.initialize();
      this.initPromises.set(runtime.language, initPromise);
    }
  }

  /**
   * Execute a node using the appropriate runtime
   */
  async execute(
    node: INode,
    context: NodeExecutionContext,
  ): Promise<NodeExecutionResult> {
    // Determine runtime language from node metadata
    const language = this.getNodeLanguage(node);

    // Get the appropriate runtime
    const runtime = await this.getRuntime(language);
    if (!runtime) {
      throw new Error(
        `No runtime available for language "${language}". ` +
          `Available runtimes: ${Array.from(this.runtimes.keys()).join(", ")}`,
      );
    }

    // Ensure runtime is initialized
    await this.ensureRuntimeReady(runtime);

    // Execute the node
    try {
      return await runtime.execute(node, context);
    } catch (error) {
      // Wrap runtime errors with context
      throw new Error(
        `Runtime execution failed for node "${node.getId()}" in ${language} runtime: ` +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  }

  /**
   * Get node runtime language from metadata
   */
  private getNodeLanguage(node: INode): RuntimeLanguage {
    // Check for explicit runtime specification in metadata
    const metadata = node.metadata as Record<string, any>;
    if (metadata?.runtime?.language) {
      return metadata.runtime.language as RuntimeLanguage;
    }

    // Default to TypeScript for all standard nodes
    return "typescript";
  }

  /**
   * Get runtime for a language
   */
  private async getRuntime(
    language: RuntimeLanguage,
  ): Promise<IRuntime | undefined> {
    const runtime = this.runtimes.get(language);

    // Future: Support dynamic runtime loading
    if (!runtime && this.canLoadRuntime(language)) {
      await this.loadRuntime(language);
      return this.runtimes.get(language);
    }

    return runtime;
  }

  /**
   * Ensure runtime is initialized
   */
  private async ensureRuntimeReady(runtime: IRuntime): Promise<void> {
    if (runtime.isReady()) {
      return;
    }

    // Check if initialization is in progress
    const initPromise = this.initPromises.get(runtime.language);
    if (initPromise) {
      await initPromise;
      this.initPromises.delete(runtime.language);
    } else {
      // Initialize now
      await runtime.initialize();
    }
  }

  /**
   * Check if a runtime can be dynamically loaded
   */
  private canLoadRuntime(_language: RuntimeLanguage): boolean {
    // Future: Check if runtime module is available
    // For now, only TypeScript is supported
    return false;
  }

  /**
   * Dynamically load a runtime
   */
  private async loadRuntime(language: RuntimeLanguage): Promise<void> {
    // Future implementation for dynamic runtime loading
    switch (language) {
      case "rust":
        // const { RustRuntime } = await import("./RustRuntime.js");
        // this.registerRuntime(new RustRuntime());
        throw new Error("Rust runtime not yet implemented");

      case "python":
        // const { PythonRuntime } = await import("./PythonRuntime.js");
        // this.registerRuntime(new PythonRuntime());
        throw new Error("Python runtime not yet implemented");

      case "wasm":
        // const { WasmRuntime } = await import("./WasmRuntime.js");
        // this.registerRuntime(new WasmRuntime());
        throw new Error("WASM runtime not yet implemented");

      case "golang":
        // const { GoRuntime } = await import("./GoRuntime.js");
        // this.registerRuntime(new GoRuntime());
        throw new Error("Go runtime not yet implemented");

      default:
        throw new Error(`Unknown runtime language: ${language}`);
    }
  }

  /**
   * Get available runtimes
   */
  getAvailableRuntimes(): RuntimeLanguage[] {
    return Array.from(this.runtimes.keys());
  }

  /**
   * Get runtime metrics
   */
  getRuntimeMetrics(language: RuntimeLanguage) {
    const runtime = this.runtimes.get(language);
    return runtime?.getMetrics();
  }

  /**
   * Cleanup all runtimes
   */
  async cleanup(): Promise<void> {
    const cleanupPromises = Array.from(this.runtimes.values()).map((runtime) =>
      runtime.cleanup(),
    );
    await Promise.all(cleanupPromises);
    this.runtimes.clear();
    this.initPromises.clear();
  }
}
