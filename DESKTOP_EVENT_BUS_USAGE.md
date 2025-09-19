# Desktop Event Bus Usage Guide

## Two Functions for Different Use Cases

The desktop export provides two event bus functions:

### 1. `createEventBus` - Local Events Only

For events that stay within the same process:

```typescript
import { createEventBus } from "@atomiton/events/desktop";

type AppEvents = {
  "user:login": { userId: string };
  "user:logout": { userId: string };
  "data:updated": { id: string; data: any };
};

// Create a local bus - events don't cross process boundaries
const localBus = createEventBus<AppEvents>("app");

localBus.on("user:login", ({ userId }) => {
  console.log("User logged in:", userId);
});

localBus.emit("user:login", { userId: "123" });
```

### 2. `createIPCEventBus` - Cross-Process Events

For events that need to cross Electron process boundaries:

```typescript
import { createIPCEventBus } from "@atomiton/events/desktop";

type ConductorEvents = {
  execute: { nodeId: string; params: any };
  result: { nodeId: string; output: any };
  error: { nodeId: string; error: string };
};

// Create an IPC-enabled bus - events can cross process boundaries
const conductorBus = createIPCEventBus<ConductorEvents>("conductor", {
  bridgeMode: "auto",
  forwardEvents: ["execute", "result", "error"], // These events cross processes
});

// In renderer process:
conductorBus.on("result", ({ nodeId, output }) => {
  console.log("Execution result:", nodeId, output);
});

// This automatically sends to main process via IPC
conductorBus.emit("execute", { nodeId: "node-1", params: {} });

// Access the raw IPC bridge if needed for advanced use
if (conductorBus.ipc.isAvailable()) {
  console.log("Running in:", conductorBus.ipc.getEnvironment());
}
```

## How Conductor Should Use This

The conductor package should migrate from raw IPC to `createIPCEventBus`:

### Before (Raw IPC):

```typescript
// Complex manual IPC handling
window.electron.ipcRenderer.on("conductor:result", (_event, ...args) => {
  const response = args[0] as IPCResponse;
  // manual handling...
});

window.electron.ipcRenderer.send("conductor:execute", message);
```

### After (Event Bus):

```typescript
import { createIPCEventBus } from "@atomiton/events/desktop";

const conductorBus = createIPCEventBus<ConductorEvents>("conductor", {
  bridgeMode: "auto",
  forwardEvents: ["execute", "result", "error"],
});

// Clean, typed event handling
conductorBus.on("result", (result) => {
  // Handle result with full type safety
});

conductorBus.emit("execute", request);
```

## Benefits of This Approach

1. **Clear API Separation**:
   - `createEventBus` = local only
   - `createIPCEventBus` = cross-process

2. **Progressive Enhancement**:
   - Start with local bus
   - Upgrade to IPC bus when needed
   - Same API, just different function

3. **Type Safety**:
   - Full TypeScript support
   - No `any` types or manual casting

4. **Automatic Bridging**:
   - Set `bridgeMode: 'auto'` and events flow across processes
   - No manual IPC wiring needed

5. **Selective Forwarding**:
   - Only forward events that need to cross boundaries
   - Better performance, less IPC traffic

## Migration Path for Conductor

1. Add `@atomiton/events` dependency
2. Replace `createIPCTransport` with event-bus based implementation
3. Use `createIPCEventBus` for cross-process communication
4. Remove all direct `window.electron.ipcRenderer` usage
5. Get type safety and better testing as bonuses
