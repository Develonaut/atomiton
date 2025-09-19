# Conductor Integration with @atomiton/events

## Current State

The conductor package currently uses raw Electron IPC for request/response patterns. This should be replaced with the @atomiton/events package for consistency and better event management.

## Migration Plan

### 1. Replace Raw IPC with Event Bus

Current conductor implementation:

```typescript
// Raw IPC approach (current)
window.electron.ipcRenderer.on("conductor:result", handler);
window.electron.ipcRenderer.send("conductor:execute", message);
```

Should be replaced with:

```typescript
// Using @atomiton/events (proposed)
import { createEventBus, createIPCBridge } from "@atomiton/events/desktop";

// Create typed event bus for conductor
type ConductorEvents = {
  execute: ExecutionRequest;
  result: ExecutionResult;
  error: { id: string; error: string };
};

const conductorBus = createEventBus<ConductorEvents>("conductor");
const ipcBridge = createIPCBridge();

// Use event bus for local events
conductorBus.on("result", (result) => {
  // Handle result
});

// Bridge to IPC when needed
if (ipcBridge.isAvailable()) {
  // Forward execution requests through IPC
  conductorBus.on("execute", (request) => {
    ipcBridge.send("conductor:execute", request);
  });

  // Listen for IPC responses
  ipcBridge.on("conductor:result", (event) => {
    conductorBus.emit("result", event.data as ExecutionResult);
  });
}
```

### 2. Benefits of Migration

1. **Type Safety**: Full TypeScript support for all events
2. **Consistency**: Same event patterns across the entire codebase
3. **Testing**: Easier to test without Electron dependency
4. **Memory Management**: Proper cleanup with WeakMaps
5. **Error Handling**: Built-in safe listeners with error catching

### 3. Implementation Steps

1. Add `@atomiton/events` as dependency to conductor package
2. Create typed event definitions for conductor events
3. Replace `window.electron.ipcRenderer` calls with event bus
4. Use IPC bridge only for actual cross-process communication
5. Update tests to use event bus instead of mocking IPC

### 4. Example Refactored Transport

```typescript
import { createEventBus, createIPCBridge } from "@atomiton/events/desktop";
import { generateId } from "@atomiton/utils";
import type {
  ExecutionRequest,
  ExecutionResult,
} from "../interfaces/IExecutionEngine";

type ConductorEvents = {
  request: { id: string; payload: ExecutionRequest };
  response: { id: string; payload: ExecutionResult };
  error: { id: string; error: string };
};

export function createIPCTransport(): IExecutionTransport {
  const bus = createEventBus<ConductorEvents>("conductor");
  const ipc = createIPCBridge();
  const pendingRequests = new Map<
    string,
    {
      resolve: (result: ExecutionResult) => void;
      reject: (error: Error) => void;
    }
  >();

  const initialize = async (): Promise<void> => {
    if (!ipc.isAvailable() || ipc.getEnvironment() !== "renderer") {
      throw new Error("IPC transport requires Electron renderer context");
    }

    // Listen for responses
    bus.on("response", ({ id, payload }) => {
      const pending = pendingRequests.get(id);
      if (pending) {
        pending.resolve(payload);
        pendingRequests.delete(id);
      }
    });

    bus.on("error", ({ id, error }) => {
      const pending = pendingRequests.get(id);
      if (pending) {
        pending.reject(new Error(error));
        pendingRequests.delete(id);
      }
    });

    // Bridge IPC to event bus
    ipc.on("conductor:response", (event) => {
      bus.emit("response", event.data as any);
    });

    ipc.on("conductor:error", (event) => {
      bus.emit("error", event.data as any);
    });
  };

  const execute = async (
    request: ExecutionRequest,
  ): Promise<ExecutionResult> => {
    const id = generateId();

    return new Promise((resolve, reject) => {
      pendingRequests.set(id, { resolve, reject });

      // Send through IPC
      ipc.send("conductor:execute", { id, payload: request });

      // Timeout handling
      setTimeout(
        () => {
          if (pendingRequests.has(id)) {
            pendingRequests.delete(id);
            reject(new Error("Execution timeout"));
          }
        },
        5 * 60 * 1000,
      );
    });
  };

  const shutdown = async (): Promise<void> => {
    bus.removeAllListeners();
    pendingRequests.clear();
  };

  return {
    type: "ipc",
    execute,
    initialize,
    shutdown,
  };
}
```

## Summary

By migrating the conductor to use @atomiton/events:

1. We get a consistent event system across the entire codebase
2. Better type safety and error handling
3. Easier testing without Electron mocks
4. Cleaner separation between local events and IPC communication
