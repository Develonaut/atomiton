/**
 * Engine module - Main entry point for execution engines
 */

// Standard Execution Engine
export {
  createExecutionEngine,
  type ExecutionEngineInstance,
} from "./executionEngine";

// Enhanced Execution Engine with metrics and webhooks
export {
  createEnhancedExecutionEngine,
  type EnhancedExecutionOptions,
  type EnhancedEngineInstance,
  type EnhancedExecutionMetrics,
} from "./enhanced";
