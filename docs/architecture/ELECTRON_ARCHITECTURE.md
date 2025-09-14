# Conductor Electron Architecture

## Overview

The conductor package provides a **unified API** that works the same across all environments. Here's how execution flows in the Electron desktop app:

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron Renderer Process                │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Editor UI                                         │     │
│  │  import { conductor } from '@atomiton/conductor'   │     │
│  │                                                    │     │
│  │  // Same API everywhere!                           │     │
│  │  conductor.execute({                               │     │
│  │    blueprintId: 'my-workflow',                     │     │
│  │    inputs: { data: 'test' }                        │     │
│  │  })                                                │     │
│  └──────────────────┬─────────────────────────────────┘     │
│                     │                                        │
│  ┌──────────────────▼─────────────────────────────────┐     │
│  │  Conductor (Renderer Instance)                     │     │
│  │  - Auto-detects Electron environment               │     │
│  │  - Uses IPCTransport                               │     │
│  │  - Sends to main process via IPC                   │     │
│  └──────────────────┬─────────────────────────────────┘     │
│                     │                                        │
└─────────────────────┼────────────────────────────────────────┘
                      │
                      │ IPC Message
                      │ { type: 'conductor:execute',
                      │   payload: ExecutionRequest,
                      │   id: 'uuid' }
                      │
┌─────────────────────▼────────────────────────────────────────┐
│                     Electron Main Process                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Main Process Handler                              │     │
│  │  setupMainProcessHandler()                         │     │
│  │                                                    │     │
│  │  ipcMain.on('conductor:execute', (event, msg) => { │     │
│  │    // Has full Node.js access                      │     │
│  │    const result = await localTransport.execute()   │     │
│  │    event.reply('conductor:result', result)         │     │
│  │  })                                                │     │
│  └──────────────────┬─────────────────────────────────┘     │
│                     │                                        │
│  ┌──────────────────▼─────────────────────────────────┐     │
│  │  Conductor (Main Instance)                         │     │
│  │  - Uses LocalTransport                             │     │
│  │  - Direct execution with Node.js APIs              │     │
│  │  - File system access                              │     │
│  │  - Network access                                  │     │
│  │  - Native modules                                  │     │
│  └──────────────────┬─────────────────────────────────┘     │
│                     │                                        │
│  ┌──────────────────▼─────────────────────────────────┐     │
│  │  Execution Engine                                  │     │
│  │  - Runs blueprints                                 │     │
│  │  - Manages state                                   │     │
│  │  - Handles node execution                          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└───────────────────────────────────────────────────────────────┘
```

## Implementation Example

### 1. Electron Main Process Setup (main.ts)

```typescript
import { app, BrowserWindow } from "electron";
import { setupMainProcessHandler } from "@atomiton/conductor";

app.whenReady().then(() => {
  // Set up the conductor handler in main process
  setupMainProcessHandler({
    concurrency: 4,
    storage: storageEngine, // Your storage implementation
    timeout: 60000,
  });

  // Create window, etc...
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });
});
```

### 2. Electron Preload Script (preload.ts)

```typescript
import { contextBridge, ipcRenderer } from "electron";

// Expose IPC to renderer
contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel: string, data: any) => {
      const validChannels = ["conductor:execute"];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      const validChannels = ["conductor:result", "conductor:error"];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    },
  },
});
```

### 3. Renderer Process Usage (React Component)

```typescript
import { conductor } from '@atomiton/conductor';

function WorkflowEditor() {
  const runWorkflow = async () => {
    try {
      // Same API as browser or server!
      const result = await conductor.execute({
        blueprintId: 'data-processing',
        inputs: {
          file: '/path/to/data.csv',
          format: 'json'
        }
      });

      console.log('Execution complete:', result);
    } catch (error) {
      console.error('Execution failed:', error);
    }
  };

  return (
    <button onClick={runWorkflow}>
      Run Blueprint
    </button>
  );
}
```

## Key Benefits

1. **Unified API**: Same `conductor.execute()` call everywhere
2. **Auto-Detection**: Automatically uses correct transport based on environment
3. **Security**: Renderer never directly executes code, only sends messages
4. **Full Node.js Access**: Main process has unrestricted access to system resources
5. **Type Safety**: Full TypeScript support across IPC boundary

## Environment Detection

The conductor automatically detects its environment:

```typescript
// In conductor.ts
if (typeof window !== "undefined" && window.electron?.ipcRenderer) {
  // Electron renderer - use IPC
} else if (typeof window !== "undefined") {
  // Browser - use HTTP
} else {
  // Node.js/Electron main - execute locally
}
```

## Non-Desktop Environments

When running in non-desktop environments:

- **Browser**: Uses HTTP transport to communicate with API server
- **Cloud/Server**: Uses local transport for direct execution
- **Same API**: `conductor.execute()` works identically in all cases

This architecture ensures the conductor API remains consistent regardless of the runtime environment!

## Related Documentation

- **[Conductor API](./CONDUCTOR_API.md)** - Complete API reference and usage examples
- **[Transport Architecture](./TRANSPORT_ARCHITECTURE.md)** - Detailed transport layer implementation
- **[BENTO_BOX Implementation](./BENTO_BOX_IMPLEMENTATION.md)** - How Electron architecture exemplifies our simplicity principles
- **[Architecture Overview](./README.md)** - Main architecture documentation index

---

This Electron architecture demonstrates cross-environment consistency: the same `conductor.execute()` API works identically in renderer, main, browser, and server environments.
