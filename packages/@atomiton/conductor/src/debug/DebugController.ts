/**
 * Debug Controller for conductor execution
 *
 * Separates debug concerns from execution logic, providing a clean
 * interface for controlling debug behavior during node execution.
 */

/**
 * Debug options that can be configured at runtime
 */
export type DebugOptions = {
  /**
   * Simulate an error on a specific node
   */
  simulateError?: {
    /** Node ID to fail on (or 'random' for a random node) */
    nodeId: string | "random";
    /** Type of error to simulate */
    errorType: "generic" | "timeout" | "network" | "validation" | "permission";
    /** Custom error message (optional) */
    message?: string;
    /** Delay in ms before throwing error (simulates mid-execution failure) */
    delayMs?: number;
  };
  /**
   * Simulate a long-running node
   */
  simulateLongRunning?: {
    /** Node ID to delay (or 'random' for a random node) */
    nodeId: string | "random";
    /** Delay in milliseconds */
    delayMs: number;
  };
  /**
   * Slow-motion delay in milliseconds for progress visualization
   * Total delay per node = slowMo * 2 (two progress steps)
   * - 0 = instant (no delays)
   * - 50 = normal (100ms per node)
   * - 250 = slow (500ms per node)
   * - 1000 = slower (2s per node)
   * - 2500 = very slow (5s per node)
   * - 7500 = super slow (15s per node)
   */
  slowMo?: number;
};

/**
 * Controller interface for managing debug behavior during execution
 */
export type DebugController = {
  /**
   * Configure debug options
   */
  configure(options: DebugOptions): void;

  /**
   * Check if error should be simulated for a node
   */
  shouldSimulateError(nodeId: string): boolean;

  /**
   * Get error details if error should be simulated
   */
  getSimulatedError(nodeId: string): {
    errorType: string;
    message?: string;
    delayMs?: number;
  } | null;

  /**
   * Check if node should be delayed (long-running simulation)
   */
  shouldSimulateLongRunning(nodeId: string): boolean;

  /**
   * Get long-running delay for a node
   */
  getLongRunningDelay(nodeId: string): number;

  /**
   * Get slow-motion delay
   */
  getSlowMoDelay(): number;

  /**
   * Get total delay for a node (combines all delays)
   */
  getNodeDelay(nodeId: string): number;

  /**
   * Initialize debug options with resolved node IDs
   * (converts 'random' to actual node IDs)
   */
  initialize(nodeIds: string[]): void;

  /**
   * Get current debug options
   */
  getOptions(): DebugOptions;
};

/**
 * Default implementation of DebugController
 */
export class DefaultDebugController implements DebugController {
  private options: DebugOptions = {};
  private resolvedErrorNodeId?: string;
  private resolvedLongRunningNodeId?: string;

  configure(options: DebugOptions): void {
    this.options = { ...options };
    // Reset resolved IDs when reconfigured
    this.resolvedErrorNodeId = undefined;
    this.resolvedLongRunningNodeId = undefined;
  }

  initialize(nodeIds: string[]): void {
    if (!nodeIds.length) return;

    // Resolve "random" to actual node IDs
    if (this.options.simulateError?.nodeId === "random") {
      const randomIndex = Math.floor(Math.random() * nodeIds.length);
      this.resolvedErrorNodeId = nodeIds[randomIndex];
    } else if (this.options.simulateError?.nodeId) {
      this.resolvedErrorNodeId = this.options.simulateError.nodeId;
    }

    if (this.options.simulateLongRunning?.nodeId === "random") {
      const randomIndex = Math.floor(Math.random() * nodeIds.length);
      this.resolvedLongRunningNodeId = nodeIds[randomIndex];
    } else if (this.options.simulateLongRunning?.nodeId) {
      this.resolvedLongRunningNodeId = this.options.simulateLongRunning.nodeId;
    }
  }

  shouldSimulateError(nodeId: string): boolean {
    return this.resolvedErrorNodeId === nodeId;
  }

  getSimulatedError(nodeId: string): {
    errorType: string;
    message?: string;
    delayMs?: number;
  } | null {
    if (!this.shouldSimulateError(nodeId) || !this.options.simulateError) {
      return null;
    }

    return {
      errorType: this.options.simulateError.errorType,
      message: this.options.simulateError.message,
      delayMs: this.options.simulateError.delayMs,
    };
  }

  shouldSimulateLongRunning(nodeId: string): boolean {
    return this.resolvedLongRunningNodeId === nodeId;
  }

  getLongRunningDelay(nodeId: string): number {
    if (
      !this.shouldSimulateLongRunning(nodeId) ||
      !this.options.simulateLongRunning
    ) {
      return 0;
    }
    return this.options.simulateLongRunning.delayMs;
  }

  getSlowMoDelay(): number {
    return this.options.slowMo ?? 0;
  }

  getNodeDelay(nodeId: string): number {
    let delay = 0;

    // Add long-running delay if applicable
    delay += this.getLongRunningDelay(nodeId);

    // Add slow-mo delay (applied to all nodes)
    delay += this.getSlowMoDelay();

    return delay;
  }

  getOptions(): DebugOptions {
    return { ...this.options };
  }
}

/**
 * Factory function to create a debug controller
 */
export function createDebugController(options?: DebugOptions): DebugController {
  const controller = new DefaultDebugController();
  if (options) {
    controller.configure(options);
  }
  return controller;
}

/**
 * No-op debug controller that does nothing (for production)
 */
export class NoOpDebugController implements DebugController {
  configure(_options: DebugOptions): void {
    // No-op
  }

  initialize(_nodeIds: string[]): void {
    // No-op
  }

  shouldSimulateError(_nodeId: string): boolean {
    return false;
  }

  getSimulatedError(_nodeId: string): null {
    return null;
  }

  shouldSimulateLongRunning(_nodeId: string): boolean {
    return false;
  }

  getLongRunningDelay(_nodeId: string): number {
    return 0;
  }

  getSlowMoDelay(): number {
    return 0;
  }

  getNodeDelay(_nodeId: string): number {
    return 0;
  }

  getOptions(): DebugOptions {
    return {};
  }
}

/**
 * Create a no-op debug controller for production use
 */
export function createNoOpDebugController(): DebugController {
  return new NoOpDebugController();
}
