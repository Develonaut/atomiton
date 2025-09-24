import type {
  ExecutionProgress,
  ExecutionRequest,
  ExecutionResult,
} from "#core/types";
import { createEventBus } from "@atomiton/events/browser";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { generateExecutionId } from "@atomiton/utils";

// Inline minimal validation (previously validateRequest)
function validateRequest(request: ExecutionRequest) {
  if (!request.id || !request.nodeId || !request.inputs) {
    return { valid: false, errors: ["Missing required fields"] };
  }
  return { valid: true, errors: [] };
}

// Event map for conductor events
type ConductorEvents = {
  "conductor:execute": ExecutionRequest;
  "conductor:result": ExecutionResult;
  "conductor:progress": ExecutionProgress;
  "conductor:error": { id: string; error: string };
};

export type BrowserConductorOptions = {
  domain?: string;
  timeout?: number;
};

export function createBrowserConductor(options?: BrowserConductorOptions) {
  const { domain = "conductor", timeout = 30000 } = options ?? {};

  // Use events package for all communication
  const events = createEventBus<ConductorEvents>({
    domain,
    enableBridge: true,
  });

  // Auto-forward execution requests to desktop
  events.bridge?.forward("conductor:execute", "desktop");

  // Track pending executions
  const pendingExecutions = new Map<
    string,
    {
      resolve: (result: ExecutionResult) => void;
      reject: (error: Error) => void;
      timer: NodeJS.Timeout;
    }
  >();

  // Listen for results from desktop
  events.on("conductor:result", (result) => {
    const pending = pendingExecutions.get(result.id);
    if (pending) {
      clearTimeout(pending.timer);
      pending.resolve(result);
      pendingExecutions.delete(result.id);
    }
  });

  // Listen for errors
  events.on("conductor:error", ({ id, error }) => {
    const pending = pendingExecutions.get(id);
    if (pending) {
      clearTimeout(pending.timer);
      pending.reject(new Error(error));
      pendingExecutions.delete(id);
    }
  });

  // Main execution function
  async function execute(
    definition: NodeDefinition,
    inputs: Record<string, unknown>,
  ): Promise<ExecutionResult> {
    const id = generateExecutionId();

    const request: ExecutionRequest = {
      id,
      nodeId: definition.id,
      definition,
      inputs,
      options: { timeout },
    };

    // Validate request
    const validation = validateRequest(request);
    if (!validation.valid) {
      throw new Error(`Invalid request: ${validation.errors.join(", ")}`);
    }

    return new Promise((resolve, reject) => {
      // Set timeout
      const timer = setTimeout(() => {
        pendingExecutions.delete(id);
        reject(new Error(`Execution timeout after ${timeout}ms`));
      }, timeout);

      // Store pending execution
      pendingExecutions.set(id, { resolve, reject, timer });

      // Emit execution request (will be forwarded to desktop)
      events.emit("conductor:execute", request);
    });
  }

  // Progress listener
  function onProgress(handler: (progress: ExecutionProgress) => void) {
    return events.on("conductor:progress", handler);
  }

  return {
    execute,
    onProgress,
    events, // Expose for advanced use cases
  };
}
