/**
 * Conductor Types
 * Re-exports all types from type modules
 */

export * from "#types/execution";
export * from "#types/transport";
export * from "#types/errors";
export * from "#types/branded";

export type ConductorConfig = {
  transport?: ConductorTransport;
  nodeExecutorFactory?: NodeExecutorFactory;
  debugController?: DebugController;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  logLevel?: "debug" | "info" | "warn" | "error";
};

import type { ConductorTransport } from "#types/transport";
import type { NodeExecutorFactory } from "#types/execution";
import type { DebugController } from "#debug";
