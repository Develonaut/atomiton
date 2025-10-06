/**
 * Mock implementations for testing
 * Provides mock versions of key components for isolated testing
 */

import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type {
  ExecutionResult,
  ConductorExecutionContext,
  NodeId,
} from "#types";
import type {
  Transport,
  ProgressReporter,
  DebugController,
  Logger,
} from "#testing/injection";
import { EventEmitter } from "eventemitter3";
import type { ExecutionGraphState } from "#execution/executionGraphStore";
import { vi } from "vitest";

/**
 * Progress update shape for mocks
 */
export type ProgressUpdate = {
  nodeId: string | NodeId;
  status: string;
  progress: number;
  message?: string;
};

/**
 * Debug options for mocks
 */
export type DebugOptions = {
  simulateError?: { nodeId: string };
  simulateLongRunning?: { nodeId: string; delayMs?: number };
};

/**
 * Mock transport implementation for testing
 */
export class MockTransport implements Transport {
  private responses = new Map<string, ExecutionResult>();
  private delays = new Map<string, number>();
  private callHistory: Array<{
    node: NodeDefinition;
    context?: ConductorExecutionContext;
  }> = [];
  public executeCallCount = 0;

  /**
   * Set a mock response for a specific node ID
   */
  setResponse(nodeId: string, response: ExecutionResult): void {
    this.responses.set(nodeId, response);
  }

  /**
   * Set a delay for a specific node ID (simulates network latency)
   */
  setDelay(nodeId: string, delayMs: number): void {
    this.delays.set(nodeId, delayMs);
  }

  /**
   * Get the call history
   */
  getCallHistory(): typeof this.callHistory {
    return this.callHistory;
  }

  /**
   * Clear all mocked data
   */
  clear(): void {
    this.responses.clear();
    this.delays.clear();
    this.callHistory = [];
    this.executeCallCount = 0;
  }

  async execute(
    node: NodeDefinition,
    context?: ConductorExecutionContext,
  ): Promise<ExecutionResult> {
    this.executeCallCount++;
    this.callHistory.push({ node, context });

    // Apply delay if configured
    const delay = this.delays.get(node.id);
    if (delay) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Return mocked response or default
    const response = this.responses.get(node.id);
    if (response) {
      return response;
    }

    // Default successful response
    return {
      success: true,
      data: { mockData: `Executed ${node.id}` },
      duration: 100,
      executedNodes: [node.id as NodeId],
    };
  }

  async dispose(): Promise<void> {
    this.clear();
  }
}

/**
 * Mock logger implementation for testing
 */
export class MockLogger implements Logger {
  public logs: Array<{ level: string; message: string; args: unknown[] }> = [];

  info(message: string, ...args: unknown[]): void {
    this.logs.push({ level: "info", message, args });
  }

  warn(message: string, ...args: unknown[]): void {
    this.logs.push({ level: "warn", message, args });
  }

  error(message: string, ...args: unknown[]): void {
    this.logs.push({ level: "error", message, args });
  }

  debug(message: string, ...args: unknown[]): void {
    this.logs.push({ level: "debug", message, args });
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: string): typeof this.logs {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Check if a specific message was logged
   */
  hasMessage(message: string, level?: string): boolean {
    return this.logs.some(
      (log) => log.message.includes(message) && (!level || log.level === level),
    );
  }
}

/**
 * Mock progress reporter for testing
 */
export class MockProgressReporter implements ProgressReporter {
  public updates: ProgressUpdate[] = [];
  private listeners = new Set<(update: ProgressUpdate) => void>();

  report(update: ProgressUpdate): void {
    this.updates.push(update);
    this.listeners.forEach((listener) => listener(update));
  }

  onProgress(handler: (update: ProgressUpdate) => void): () => void {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  /**
   * Get updates for a specific node
   */
  getUpdatesForNode(nodeId: string): ProgressUpdate[] {
    return this.updates.filter((update) => update.nodeId === nodeId);
  }

  /**
   * Get the last update
   */
  getLastUpdate(): ProgressUpdate | undefined {
    return this.updates[this.updates.length - 1];
  }

  /**
   * Clear all updates
   */
  clear(): void {
    this.updates = [];
    this.listeners.clear();
  }
}

/**
 * Mock debug controller for testing
 */
export class MockDebugController implements DebugController {
  private enabled = false;
  private options: DebugOptions = {
    simulateError: undefined,
    simulateLongRunning: undefined,
  };

  isEnabled(): boolean {
    return this.enabled;
  }

  configure(options: DebugOptions): void {
    this.options = { ...this.options, ...options };
    this.enabled = true;
  }

  shouldSimulateError(nodeId: string): boolean {
    return this.options.simulateError?.nodeId === nodeId || false;
  }

  getDelay(_nodeId: string): number {
    return 0; // No slowMo in new architecture
  }

  shouldSimulateLongRunning(nodeId: string): boolean {
    return this.options.simulateLongRunning?.nodeId === nodeId || false;
  }

  getLongRunningDuration(nodeId: string): number {
    return this.shouldSimulateLongRunning(nodeId)
      ? (this.options.simulateLongRunning?.delayMs ?? 0)
      : 0;
  }

  /**
   * Reset to default state
   */
  reset(): void {
    this.enabled = false;
    this.options = {
      simulateError: undefined,
      simulateLongRunning: undefined,
    };
  }
}

/**
 * Mock execution graph store for testing
 * Provides a simple in-memory implementation for test scenarios
 */
export class MockExecutionGraphStore {
  private state: ExecutionGraphState = {
    nodes: new Map(),
    edges: [],
    executionOrder: [],
    criticalPath: [],
    totalWeight: 0,
    maxParallelism: 0,
    isExecuting: false,
    startTime: null,
    endTime: null,
    cachedProgress: 0,
  };
  private listeners = new Set<
    (state: ExecutionGraphState, prevState: ExecutionGraphState) => void
  >();
  public stateHistory: ExecutionGraphState[] = [];

  // Store API methods
  getState(): ExecutionGraphState {
    return this.state;
  }

  setState(updater: (state: ExecutionGraphState) => void): void {
    const prevState = { ...this.state };
    updater(this.state);
    this.stateHistory.push({ ...this.state });
    this.notifyListeners(prevState);
  }

  subscribe(
    listener: (
      state: ExecutionGraphState,
      prevState: ExecutionGraphState,
    ) => void,
  ): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // ExecutionGraphStore-specific methods
  initializeGraph = vi.fn((graph: unknown) => {
    this.state = { ...this.state, ...(graph as Partial<ExecutionGraphState>) };
    this.stateHistory.push({ ...this.state });
  });

  setNodeState = vi.fn((nodeId: string, state: string, error?: string) => {
    const node = this.state.nodes.get(nodeId);
    if (node) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      node.state = state as any;
      if (error) node.error = error;
    }
    this.stateHistory.push({ ...this.state });
  });

  setNodeProgress = vi.fn(
    (nodeId: string, progress: number, message?: string) => {
      const node = this.state.nodes.get(nodeId);
      if (node) {
        node.progress = progress;
        if (message !== undefined) node.message = message;
      }
      this.stateHistory.push({ ...this.state });
    },
  );

  completeExecution = vi.fn(() => {
    this.state.isExecuting = false;
    this.state.endTime = Date.now();
  });

  reset = vi.fn(() => {
    this.state = {
      nodes: new Map(),
      edges: [],
      executionOrder: [],
      criticalPath: [],
      totalWeight: 0,
      maxParallelism: 0,
      isExecuting: false,
      startTime: null,
      endTime: null,
      cachedProgress: 0,
    };
    this.stateHistory = [];
  });

  getTrace = vi.fn(() => ({
    executionId: "test-exec-id",
    startTime: Date.now(),
    endTime: null,
    events: [],
  }));

  // Mock helper for React hook (useStore)
  useStore = vi.fn(() => this.state);

  private notifyListeners(prevState: ExecutionGraphState): void {
    this.listeners.forEach((listener) => listener(this.state, prevState));
  }

  /**
   * Clear all state and history
   */
  clear(): void {
    this.reset();
    this.listeners.clear();
  }

  /**
   * Get the state at a specific point in history
   */
  getStateAt(index: number): ExecutionGraphState | undefined {
    return this.stateHistory[index];
  }
}

/**
 * Create a spy function for testing
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSpy<T extends (...args: any[]) => any>(
  _name = "spy",
  implementation?: T,
): T & { calls: Array<Parameters<T>>; reset: () => void } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spy = vi.fn(implementation) as any;
  spy.calls = [];

  const originalFn = spy;
  const wrappedSpy = ((...args: Parameters<T>) => {
    spy.calls.push(args);
    return originalFn(...args);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

  wrappedSpy.calls = spy.calls;
  wrappedSpy.reset = () => {
    spy.calls = [];
    wrappedSpy.calls = spy.calls;
    vi.clearAllMocks();
  };

  return wrappedSpy;
}

/**
 * Mock event emitter for testing event-driven components
 */
export class MockEventEmitter extends EventEmitter {
  public emittedEvents: Array<{ event: string; args: unknown[] }> = [];

  override emit<T extends string | symbol>(
    event: T,
    ...args: unknown[]
  ): boolean {
    this.emittedEvents.push({ event: String(event), args });
    return super.emit(event, ...args);
  }

  /**
   * Get events by name
   */
  getEventsByName(eventName: string): typeof this.emittedEvents {
    return this.emittedEvents.filter((e) => e.event === eventName);
  }

  /**
   * Clear all recorded events
   */
  clearHistory(): void {
    this.emittedEvents = [];
  }

  /**
   * Wait for a specific event to be emitted
   */
  waitForEvent(eventName: string, timeout = 5000): Promise<unknown[]> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for event: ${eventName}`));
      }, timeout);

      this.once(eventName, (...args) => {
        clearTimeout(timer);
        resolve(args);
      });
    });
  }
}

/**
 * Factory for creating mock objects
 */
export class MockFactory {
  static createTransport(): MockTransport {
    return new MockTransport();
  }

  static createLogger(): MockLogger {
    return new MockLogger();
  }

  static createProgressReporter(): MockProgressReporter {
    return new MockProgressReporter();
  }

  static createDebugController(): MockDebugController {
    return new MockDebugController();
  }

  static createExecutionGraphStore(): MockExecutionGraphStore {
    return new MockExecutionGraphStore();
  }

  static createEventEmitter(): MockEventEmitter {
    return new MockEventEmitter();
  }

  /**
   * Create all mocks at once
   */
  static createAllMocks() {
    return {
      transport: this.createTransport(),
      logger: this.createLogger(),
      progressReporter: this.createProgressReporter(),
      debugController: this.createDebugController(),
      store: this.createExecutionGraphStore(),
      eventEmitter: this.createEventEmitter(),
    };
  }
}
