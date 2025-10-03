// Functional Channel Server Exports
export * from "#main/channels/createChannelServer";
export * from "#main/channels/flowChannel";
export * from "#main/channels/loggerChannel";
export * from "#main/channels/nodeChannel";
export * from "#main/channels/storageChannel";
export * from "#main/channels/systemChannel";

// Re-export types for convenience
export type { ChannelServer } from "#main/channels/createChannelServer";

export type { LoggerChannelOptions } from "#main/channels/loggerChannel";

export type {
  NodeExecuteParams,
  NodeExecuteResult,
  NodeValidateParams,
  NodeValidateResult,
} from "#main/channels/nodeChannel";

export type {
  DeleteFlowParams,
  ListFlowsParams,
  ListFlowsResult,
  LoadFlowParams,
  LoadFlowResult,
  SaveFlowParams,
  SaveFlowResult,
} from "#main/channels/storageChannel";

export type {
  HealthResult,
  MetricsResult,
  RestartParams,
} from "#main/channels/systemChannel";
