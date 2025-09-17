import type {
  INode,
  NodeExecutionContext,
  NodeExecutionResult,
} from "@atomiton/nodes/executable";
import type { IRuntime, RuntimeLanguage } from "../interfaces/IRuntime";
import { createTypeScriptRuntime } from "./typeScriptRuntime";

export type RuntimeRouterInstance = {
  registerRuntime: (runtime: IRuntime) => void;
  execute: (
    node: INode,
    context: NodeExecutionContext,
  ) => Promise<NodeExecutionResult>;
  getAvailableRuntimes: () => RuntimeLanguage[];
  getRuntimeMetrics: (language: RuntimeLanguage) => unknown;
  cleanup: () => Promise<void>;
};

/**
 * Creates a RuntimeRouter that manages and routes node execution to appropriate runtimes
 * Supports TypeScript initially with future support for Rust, WASM, Python
 */
export function createRuntimeRouter(): RuntimeRouterInstance {
  // Private state using closures
  const runtimes = new Map<RuntimeLanguage, IRuntime>();
  const initPromises = new Map<RuntimeLanguage, Promise<void>>();

  // Private helper functions
  const getNodeLanguage = (node: INode): RuntimeLanguage => {
    // Check for explicit runtime specification in metadata
    const metadata = node.metadata as Record<string, unknown>;
    const runtime = metadata?.runtime as Record<string, unknown> | undefined;
    if (runtime?.language) {
      return runtime.language as RuntimeLanguage;
    }

    // Default to TypeScript for all standard nodes
    return "typescript";
  };

  const getRuntime = async (
    language: RuntimeLanguage,
  ): Promise<IRuntime | undefined> => {
    const runtime = runtimes.get(language);

    // Future: Support dynamic runtime loading
    if (!runtime && canLoadRuntime(language)) {
      await loadRuntime(language);
      return runtimes.get(language);
    }

    return runtime;
  };

  const ensureRuntimeReady = async (runtime: IRuntime): Promise<void> => {
    if (runtime.isReady()) {
      return;
    }

    // Check if initialization is in progress
    const initPromise = initPromises.get(runtime.language);
    if (initPromise) {
      await initPromise;
      initPromises.delete(runtime.language);
    } else {
      // Initialize now
      await runtime.initialize();
    }
  };

  const canLoadRuntime = (_language: RuntimeLanguage): boolean => {
    // Future: Check if runtime module is available
    // For now, only TypeScript is supported
    return false;
  };

  const loadRuntime = async (language: RuntimeLanguage): Promise<void> => {
    // Future implementation for dynamic runtime loading
    switch (language) {
      case "rust":
        // const { RustRuntime } = await import("./RustRuntime.js");
        // registerRuntime(createRustRuntime());
        throw new Error("Rust runtime not yet implemented");

      case "python":
        // const { PythonRuntime } = await import("./PythonRuntime.js");
        // registerRuntime(createPythonRuntime());
        throw new Error("Python runtime not yet implemented");

      case "wasm":
        // const { WasmRuntime } = await import("./WasmRuntime.js");
        // registerRuntime(createWasmRuntime());
        throw new Error("WASM runtime not yet implemented");

      case "golang":
        // const { GoRuntime } = await import("./GoRuntime.js");
        // registerRuntime(createGoRuntime());
        throw new Error("Go runtime not yet implemented");

      default:
        throw new Error(`Unknown runtime language: ${language}`);
    }
  };

  // Initialize with default TypeScript runtime
  const typeScriptRuntime = createTypeScriptRuntime();
  runtimes.set(typeScriptRuntime.language, typeScriptRuntime);

  /**
   * Register a runtime implementation
   */
  const registerRuntime = (runtime: IRuntime): void => {
    runtimes.set(runtime.language, runtime);

    // Initialize runtime lazily
    if (!runtime.isReady()) {
      const initPromise = runtime.initialize();
      initPromises.set(runtime.language, initPromise);
    }
  };

  /**
   * Execute a node using the appropriate runtime
   */
  const execute = async (
    node: INode,
    context: NodeExecutionContext,
  ): Promise<NodeExecutionResult> => {
    // Determine runtime language from node metadata
    const language = getNodeLanguage(node);

    // Get the appropriate runtime
    const runtime = await getRuntime(language);
    if (!runtime) {
      throw new Error(
        `No runtime available for language "${language}". ` +
          `Available runtimes: ${Array.from(runtimes.keys()).join(", ")}`,
      );
    }

    // Ensure runtime is initialized
    await ensureRuntimeReady(runtime);

    // Execute the node
    try {
      return await runtime.execute(node, context);
    } catch (error) {
      // Wrap runtime errors with context
      throw new Error(
        `Runtime execution failed for node "${node.id}" in ${language} runtime: ` +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  };

  /**
   * Get available runtimes
   */
  const getAvailableRuntimes = (): RuntimeLanguage[] => {
    return Array.from(runtimes.keys());
  };

  /**
   * Get runtime metrics
   */
  const getRuntimeMetrics = (language: RuntimeLanguage) => {
    const runtime = runtimes.get(language);
    return runtime?.getMetrics();
  };

  /**
   * Cleanup all runtimes
   */
  const cleanup = async (): Promise<void> => {
    const cleanupPromises = Array.from(runtimes.values()).map((runtime) =>
      runtime.cleanup(),
    );
    await Promise.all(cleanupPromises);
    runtimes.clear();
    initPromises.clear();
  };

  // Return public API
  return {
    registerRuntime,
    execute,
    getAvailableRuntimes,
    getRuntimeMetrics,
    cleanup,
  };
}
