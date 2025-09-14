/**
 * Execution module - Main entry point for execution functionality
 */

// Composite Runner
export {
  createCompositeRunner,
  type CompositeExecutionOptions,
  type CompositeExecutionResult,
  type CompositeRunnerInstance,
} from "./composite";

// Node Executor
export { createNodeExecutor, type NodeExecutorInstance } from "./nodeExecutor";

// Data Router (class export)
export { DataRouter } from "./dataRouter";

// Memory Pool (class export)
export { MemoryPool } from "./memoryPool";

// Stream Processor (class export)
export { StreamProcessor } from "./streamProcessor";

// Stream Types
export type * from "./streamTypes";

// Worker Pool Manager (class export) - Node.js only
// Conditionally export only in Node environment
export type { WorkerPoolManager } from "./workerPoolManager";

// Execution Strategies (class export) - Node.js only, depends on workers
// export { ExecutionStrategies } from "./executionStrategies";

// Strategy Analyzer (class export)
export { StrategyAnalyzer } from "./strategyAnalyzer";
