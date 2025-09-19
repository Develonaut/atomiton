import type {
  ExecutionRequest,
  ExecutionResult,
} from "./interfaces/IExecutionEngine";
import { createExecutionRouter } from "./transport/executionRouter";
import { createHTTPTransport } from "./transport/httpTransport";
import { createIPCTransport } from "./transport/ipcTransport";
import { createLocalTransport } from "./transport/localTransport";
import type { TransportType } from "./transport/types";

export type ConductorConfig = {
  transport?: TransportType;
  apiUrl?: string;
  concurrency?: number;
  storage?: unknown;
  timeout?: number;
};

export type ConductorInstance = {
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
  configureTransport(type: TransportType, config?: unknown): void;
  shutdown?(): Promise<void>;
};

/**
 * Create a Conductor instance - Unified API for all environments
 *
 * This works the same in ALL environments:
 * - Electron Renderer: Automatically uses IPC to communicate with main process
 * - Electron Main: Executes directly using Node.js
 * - Browser: Uses HTTP to communicate with API server
 * - Server: Executes directly using Node.js
 *
 * Example usage:
 * ```typescript
 * import { createConductor } from '@atomiton/conductor';
 *
 * const conductor = createConductor();
 *
 * // Same API everywhere!
 * const result = await conductor.execute({
 *   compositeId: 'my-workflow',
 *   inputs: { data: 'test' }
 * });
 * ```
 */
export function createConductor(config?: ConductorConfig): ConductorInstance {
  const router = createExecutionRouter();
  let activeTransport: { shutdown?: () => Promise<void> } | null = null;

  const autoConfigureTransports = () => {
    // Use provided transport or auto-detect
    const transportType = config?.transport || detectEnvironment();

    switch (transportType) {
      case "ipc": {
        const ipcTransport = createIPCTransport();
        ipcTransport.initialize?.();
        router.registerTransport(ipcTransport);
        activeTransport = ipcTransport;
        break;
      }
      case "http": {
        const apiUrl =
          config?.apiUrl ||
          process.env.VITE_API_URL ||
          "http://localhost:3000/api";
        const httpTransport = createHTTPTransport({ apiUrl });
        router.registerTransport(httpTransport);
        activeTransport = httpTransport;
        break;
      }
      case "local": {
        const localTransport = createLocalTransport({
          concurrency: config?.concurrency,
          storage: config?.storage,
          timeout: config?.timeout,
        });
        router.registerTransport(localTransport);
        activeTransport = localTransport;
        break;
      }
    }
  };

  const detectEnvironment = (): TransportType => {
    if (typeof window !== "undefined" && window.electron?.ipcRenderer) {
      return "ipc"; // Electron renderer process
    }
    if (typeof window !== "undefined") {
      return "http"; // Browser environment
    }
    return "local"; // Node.js environment
  };

  // Initialize transports
  autoConfigureTransports();

  return {
    execute: async (request: ExecutionRequest): Promise<ExecutionResult> => {
      return router.execute(request);
    },

    configureTransport: (type: TransportType, transportConfig?: unknown) => {
      switch (type) {
        case "ipc": {
          const ipcTransport = createIPCTransport();
          ipcTransport.initialize?.();
          router.registerTransport(ipcTransport);
          activeTransport = ipcTransport;
          break;
        }
        case "http": {
          const httpTransport = createHTTPTransport(
            transportConfig as {
              apiUrl: string;
              headers?: Record<string, string>;
            }
          );
          router.registerTransport(httpTransport);
          activeTransport = httpTransport;
          break;
        }
        case "local": {
          const localTransport = createLocalTransport(
            transportConfig as {
              concurrency?: number;
              storage?: unknown;
              timeout?: number;
            }
          );
          router.registerTransport(localTransport);
          activeTransport = localTransport;
          break;
        }
      }
      router.setDefaultTransport(type);
    },

    shutdown: async () => {
      if (activeTransport?.shutdown) {
        await activeTransport.shutdown();
      }
    },
  };
}

// Convenience singleton for simple use cases
export const conductor = createConductor();
