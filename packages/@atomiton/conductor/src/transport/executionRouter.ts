import type {
  ExecutionRequest,
  ExecutionResult,
} from "../interfaces/IExecutionEngine";
import type {
  IExecutionTransport,
  IExecutionRouter,
  TransportType,
} from "./types";

/**
 * Execution Router - The unified API that abstracts different runtime environments
 *
 * In Electron Renderer: Uses IPC transport to send to main process
 * In Electron Main: Uses local transport to execute directly
 * In Browser: Uses HTTP/WebSocket transport to send to API server
 * In Server: Uses local transport to execute directly
 */
export function createExecutionRouter(): IExecutionRouter {
  const transports = new Map<TransportType, IExecutionTransport>();
  let defaultTransport: TransportType | null = null;

  const detectEnvironment = (): TransportType => {
    // Auto-detect based on environment
    if (typeof window !== "undefined" && window.electron?.ipcRenderer) {
      return "ipc"; // Electron renderer process
    }
    if (typeof window !== "undefined") {
      return "http"; // Browser environment
    }
    return "local"; // Node.js environment
  };

  const execute = async (
    request: ExecutionRequest,
  ): Promise<ExecutionResult> => {
    const transportType = defaultTransport || detectEnvironment();
    const transport = transports.get(transportType);

    if (!transport) {
      throw new Error(`No transport registered for type: ${transportType}`);
    }

    return transport.execute(request);
  };

  const registerTransport = (transport: IExecutionTransport): void => {
    transports.set(transport.type, transport);

    // Auto-set as default if it's the first one
    if (!defaultTransport && transports.size === 1) {
      defaultTransport = transport.type;
    }
  };

  const setDefaultTransport = (type: TransportType): void => {
    if (!transports.has(type)) {
      throw new Error(`Transport ${type} not registered`);
    }
    defaultTransport = type;
  };

  return {
    execute,
    registerTransport,
    setDefaultTransport,
  };
}
