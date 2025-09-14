// Unified API - Use this!
export { conductor, createConductor } from "./conductor";
export type { ConductorInstance, ConductorConfig } from "./conductor";

// Transport layer (for advanced use)
export * from "./transport";

// Electron integration
export { setupMainProcessHandler } from "./electron/mainProcessHandler";

// Simple Executor
export {
  createSimpleNode,
  createSimpleExecutor,
  type SimpleComposite,
  type SimpleNode,
  type SimpleResult,
  type SimpleExecutorInstance,
} from "./simple/simpleExecutor";

// Store
export {
  createExecutionStore,
  type ExecutionStore,
  type ExecutionStoreState,
  type ExecutionRecord,
  type NodeRecord,
  type ExecutionState,
  type NodeState,
  type Checkpoint,
} from "./store";

// Queue
export {
  createQueue,
  createScalableQueue,
  type QueueInstance,
  type ScalableQueueInstance,
  type QueueOptions,
  type JobData,
  type JobResponse,
  type JobOptions,
  type WebhookData,
  type WebhookResponse,
} from "./queue";

// Execution Engine
export {
  createExecutionEngine,
  type ExecutionEngineInstance,
} from "./engine/executionEngine";

// Interfaces
export * from "./interfaces/IExecutionEngine";

// Node Executor
export {
  createNodeExecutor,
  type NodeExecutorInstance,
} from "./execution/nodeExecutor";

// Composite Runner
export {
  createCompositeRunner,
  type CompositeRunnerInstance,
  type CompositeExecutionOptions,
  type CompositeExecutionResult,
} from "./execution";

// Runtime
export {
  createRuntimeRouter,
  createTypeScriptRuntime,
  type RuntimeRouterInstance,
  type TypeScriptRuntimeInstance,
} from "./runtime";
