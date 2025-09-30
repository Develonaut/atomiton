/**
 * @atomiton/conductor
 *
 * Orchestration layer for executing NodeDefinitions with rich context
 */

export { createConductor } from "#conductor";

// Export only essential types
export type {
  ConductorExecutionContext,
  ExecutionResult,
  ExecutionError,
  ExecutionStatus,
  NodeExecutorFactory,
} from "#types/execution";

export type {
  ConductorTransport,
  TransportConfig,
  HealthResult,
} from "#types/transport";

export type { ConductorConfig } from "#types";
