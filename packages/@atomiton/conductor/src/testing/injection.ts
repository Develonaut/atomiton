/**
 * Dependency injection system for conductor testing
 * Allows injecting mock implementations of key dependencies
 */

import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type {
  ExecutionResult,
  ConductorExecutionContext,
  NodeId,
} from "#types";
import { toExecutionError } from "#types/errors";
import type { ExecutionGraphStore } from "#execution/executionGraphStore";
import { EventEmitter } from "eventemitter3";
import { MockExecutionGraphStore } from "#testing/mocks";

/**
 * Transport interface for testing
 * Simplified version for mock implementations
 */
export type Transport = {
  execute(
    node: NodeDefinition,
    context?: ConductorExecutionContext,
  ): Promise<ExecutionResult>;
  dispose(): Promise<void>;
};

/**
 * Progress reporter interface for testing
 */
export type ProgressReporter = {
  report(update: {
    nodeId: string | NodeId;
    status: string;
    progress: number;
  }): void;
  onProgress(callback: (update: unknown) => void): () => void;
};

/**
 * Debug controller interface for testing
 */
export type DebugController = {
  isEnabled(): boolean;
  configure(options: Record<string, unknown>): void;
  shouldSimulateError(nodeId: string | NodeId): boolean;
  getDelay(nodeId: string | NodeId): number;
  shouldSimulateLongRunning(nodeId: string | NodeId): boolean;
  getLongRunningDuration(nodeId: string | NodeId): number;
};

/**
 * Logger interface for dependency injection
 */
export type Logger = {
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
};

/**
 * Dependencies that can be injected into the conductor
 */
export type ConductorDependencies = {
  transport?: Transport;
  logger?: Logger;
  progressReporter?: ProgressReporter;
  debugController?: DebugController;
  store?: ExecutionGraphStore | MockExecutionGraphStore;
  eventEmitter?: EventEmitter;
};

/**
 * Factory for creating conductor with injected dependencies
 */
export class ConductorFactory {
  private static defaultDependencies: ConductorDependencies = {};

  /**
   * Set default dependencies for all conductors
   */
  static setDefaults(deps: ConductorDependencies): void {
    this.defaultDependencies = { ...this.defaultDependencies, ...deps };
  }

  /**
   * Reset default dependencies
   */
  static resetDefaults(): void {
    this.defaultDependencies = {};
  }

  /**
   * Create a conductor with injected dependencies
   */
  static create(deps: ConductorDependencies = {}): ConductorWithDependencies {
    const mergedDeps = { ...this.defaultDependencies, ...deps };
    return new ConductorWithDependencies(mergedDeps);
  }
}

/**
 * Conductor implementation with dependency injection support
 */
export class ConductorWithDependencies {
  private dependencies: Required<ConductorDependencies>;

  constructor(deps: ConductorDependencies = {}) {
    this.dependencies = {
      transport: deps.transport || this.createDefaultTransport(),
      logger: deps.logger || this.createDefaultLogger(),
      progressReporter:
        deps.progressReporter || this.createDefaultProgressReporter(),
      debugController:
        deps.debugController || this.createDefaultDebugController(),
      store: deps.store || this.createDefaultStore(),
      eventEmitter: deps.eventEmitter || new EventEmitter(),
    };
  }

  /**
   * Execute a node with injected dependencies
   */
  async execute(
    node: NodeDefinition,
    _context?: Partial<ConductorExecutionContext>,
  ): Promise<ExecutionResult> {
    const { logger, progressReporter, debugController } = this.dependencies;

    logger.info(`Starting execution of node: ${node.id}`);

    // Report initial progress
    progressReporter.report({
      nodeId: node.id,
      status: "pending",
      progress: 0,
    });

    try {
      // Apply debug options if configured
      if (debugController.isEnabled()) {
        const delay = debugController.getDelay(node.id);
        if (delay > 0) {
          logger.debug(`Applying ${delay}ms delay to node: ${node.id}`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        if (debugController.shouldSimulateError(node.id)) {
          throw new Error(`Simulated error for node: ${node.id}`);
        }
      }

      // Update progress
      progressReporter.report({
        nodeId: node.id,
        status: "executing",
        progress: 50,
      });

      // Simulate execution
      const result: ExecutionResult = {
        success: true,
        data: { message: `Executed node: ${node.id}` },
        duration: 100,
        executedNodes: [node.id as NodeId],
      };

      // Report completion
      progressReporter.report({
        nodeId: node.id,
        status: "completed",
        progress: 100,
      });

      logger.info(`Completed execution of node: ${node.id}`);
      return result;
    } catch (error) {
      logger.error(`Error executing node: ${node.id}`, error);

      progressReporter.report({
        nodeId: node.id,
        status: "failed",
        progress: 0,
      });

      return {
        success: false,
        error: toExecutionError(error),
        duration: 0,
        executedNodes: [],
      };
    }
  }

  /**
   * Get injected dependencies (for testing)
   */
  getDependencies(): Required<ConductorDependencies> {
    return this.dependencies;
  }

  private createDefaultTransport(): Transport {
    // Return a no-op transport for testing
    return {
      execute: async () => ({
        success: true,
        data: {},
        duration: 0,
        executedNodes: [],
      }),
      dispose: async () => {},
    } as Transport;
  }

  private createDefaultLogger(): Logger {
    // Return a console logger by default
    return {
      info: (..._args) => {}, // console.log(...args)
      warn: (...args) => console.warn(...args),
      error: (...args) => console.error(...args),
      debug: (..._args) => {}, // console.debug(...args)
    };
  }

  private createDefaultProgressReporter(): ProgressReporter {
    return {
      report: () => {},
      onProgress: () => () => {},
    };
  }

  private createDefaultDebugController(): DebugController {
    return {
      isEnabled: () => false,
      configure: () => {},
      shouldSimulateError: () => false,
      getDelay: () => 0,
      shouldSimulateLongRunning: () => false,
      getLongRunningDuration: () => 0,
    };
  }

  private createDefaultStore(): MockExecutionGraphStore {
    return new MockExecutionGraphStore();
  }
}

/**
 * Create a test conductor with optional dependency overrides
 */
export function createTestConductor(
  deps: ConductorDependencies = {},
): ConductorWithDependencies {
  return ConductorFactory.create(deps);
}
