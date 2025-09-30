/**
 * @atomiton/logger - Centralized Logging
 *
 * Environment-aware logger that automatically detects and uses the appropriate
 * implementation (desktop/browser) based on the runtime environment.
 */

// Re-export types
export type {
  Logger,
  LoggerOptions,
  LogEntry,
  LogLevel,
  LoggerTransport,
} from "#exports/shared/types";

// Note: Consumers should import from specific entry points:
// - '@atomiton/logger/desktop' for main process
// - '@atomiton/logger/browser' for renderer process (pass transport via options)
// - '@atomiton/logger/shared' for types only
//
// Example browser usage with transport:
//   import { createLogger } from '@atomiton/logger/browser';
//   import { createIPCTransport } from '@atomiton/rpc/renderer';
//
//   const transport = createIPCTransport();
//   const logger = createLogger({
//     scope: 'APP',
//     transport: transport.channel('logger')
//   });
//
// Example browser usage without transport (console fallback):
//   import { createLogger } from '@atomiton/logger/browser';
//
//   const logger = createLogger({ scope: 'APP' });  // Uses console.log
