import type {
  ExecutionRequest,
  ExecutionResult,
} from "../interfaces/IExecutionEngine";
import type { IExecutionTransport } from "./types";

/**
 * HTTP Transport for Browser/API Server Communication
 * Used when running in browser without Electron
 */
export function createHTTPTransport(config: {
  apiUrl: string;
  headers?: Record<string, string>;
}): IExecutionTransport {
  const execute = async (
    request: ExecutionRequest,
  ): Promise<ExecutionResult> => {
    const response = await fetch(`${config.apiUrl}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Execution failed: ${response.statusText}`);
    }

    return response.json();
  };

  return {
    type: "http",
    execute,
  };
}
