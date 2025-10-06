/**
 * Event-driven architecture for conductor progress updates
 *
 * This decouples the execution engine from transport/IPC layers,
 * enabling cleaner testing and better modularity.
 *
 * Uses eventemitter3 for cross-platform compatibility and performance.
 *
 * Progress events are throttled to prevent IPC flooding and improve
 * performance with high-frequency state updates.
 */

import type { ExecutionGraphState } from "#execution/executionGraphStore";
import type { ExecutionResult } from "#types";
import EventEmitter from "eventemitter3";
import throttle from "lodash.throttle";

/**
 * Handler function for progress events
 */
export type ProgressHandler = (state: ExecutionGraphState) => void;

/**
 * Handler function for execution started events
 */
export type StartedHandler = (data: {
  executionId: string;
  nodeId: string;
}) => void;

/**
 * Handler function for execution completed events
 */
export type CompletedHandler = (data: {
  executionId: string;
  result: ExecutionResult;
}) => void;

/**
 * Handler function for execution error events
 */
export type ErrorHandler = (data: {
  executionId: string;
  error: Error;
}) => void;

/**
 * Function to unsubscribe from events
 */
export type Unsubscribe = () => void;

/**
 * Event types for the conductor
 */
type ConductorEvents = {
  progress: (state: ExecutionGraphState) => void;
  started: (data: { executionId: string; nodeId: string }) => void;
  completed: (data: { executionId: string; result: ExecutionResult }) => void;
  error: (data: { executionId: string; error: Error }) => void;
};

/**
 * Event emitter for conductor execution events
 *
 * Provides a clean interface for subscribing to execution events
 * without tight coupling to the execution engine internals.
 * Uses eventemitter3 for optimal cross-platform performance.
 *
 * Progress events are throttled to prevent overwhelming IPC channels
 * while maintaining responsiveness.
 */
export class ConductorEventEmitter extends EventEmitter<ConductorEvents> {
  /**
   * Throttled progress emitter to prevent IPC flooding
   * Default: Max 10 progress updates per second (100ms throttle)
   */
  private throttledProgressEmit: ((state: ExecutionGraphState) => void) & {
    cancel: () => void;
    flush: () => void;
  };

  constructor(progressThrottleMs: number = 100) {
    super();

    // Create throttled version of progress emission
    this.throttledProgressEmit = throttle(
      (state: ExecutionGraphState) => {
        this.emit("progress", state);
      },
      progressThrottleMs,
      { leading: true, trailing: true },
    );
  }

  /**
   * Emit a progress update event
   * Throttled to prevent IPC flooding with high-frequency updates
   */
  emitProgress(state: ExecutionGraphState): void {
    this.throttledProgressEmit(state);
  }

  /**
   * Force immediate emission of pending progress update
   * Useful for final state or critical updates
   */
  flushProgress(): void {
    this.throttledProgressEmit.flush();
  }

  /**
   * Subscribe to progress updates
   * @returns Unsubscribe function to remove the listener
   */
  onProgress(handler: ProgressHandler): Unsubscribe {
    this.on("progress", handler);
    return () => {
      this.off("progress", handler);
    };
  }

  /**
   * Emit an execution started event
   */
  emitStarted(executionId: string, nodeId: string): void {
    this.emit("started", { executionId, nodeId });
  }

  /**
   * Subscribe to execution started events
   * @returns Unsubscribe function to remove the listener
   */
  onStarted(handler: StartedHandler): Unsubscribe {
    this.on("started", handler);
    return () => {
      this.off("started", handler);
    };
  }

  /**
   * Emit an execution completed event
   */
  emitCompleted(executionId: string, result: ExecutionResult): void {
    this.emit("completed", { executionId, result });
  }

  /**
   * Subscribe to execution completed events
   * @returns Unsubscribe function to remove the listener
   */
  onCompleted(handler: CompletedHandler): Unsubscribe {
    this.on("completed", handler);
    return () => {
      this.off("completed", handler);
    };
  }

  /**
   * Emit an execution error event
   */
  emitError(executionId: string, error: Error): void {
    this.emit("error", { executionId, error });
  }

  /**
   * Subscribe to execution error events
   * @returns Unsubscribe function to remove the listener
   */
  onError(handler: ErrorHandler): Unsubscribe {
    this.on("error", handler);
    return () => {
      this.off("error", handler);
    };
  }

  /**
   * Remove all listeners (useful for cleanup)
   */
  removeAllListeners(): this {
    // Cancel any pending throttled progress updates
    this.throttledProgressEmit.cancel();
    super.removeAllListeners();
    return this;
  }
}

/**
 * Factory function to create a new ConductorEventEmitter instance
 *
 * @param progressThrottleMs - Milliseconds to throttle progress events (default: 100ms = 10 updates/sec)
 */
export function createConductorEventEmitter(
  progressThrottleMs?: number,
): ConductorEventEmitter {
  return new ConductorEventEmitter(progressThrottleMs);
}
