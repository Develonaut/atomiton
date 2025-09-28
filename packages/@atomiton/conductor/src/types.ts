/**
 * Conductor Types
 * Re-exports all types from type modules
 */

export * from "#types/execution";
export * from "#types/transport";

export type ConductorConfig = {
  transport?: ConductorTransport;
  nodeExecutorFactory?: NodeExecutorFactory;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  logLevel?: "debug" | "info" | "warn" | "error";
};

import type { ConductorTransport } from "#types/transport";
import type { NodeExecutorFactory } from "#types/execution";
