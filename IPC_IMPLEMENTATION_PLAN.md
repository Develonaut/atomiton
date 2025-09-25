# Electron IPC Implementation Plan for Atomiton

## Overview

This document outlines the plan to replace the overcomplicated
`@atomiton/events` and `@atomiton/conductor` packages with a simple, standard
Electron IPC implementation following
[Electron's official Pattern 2: Renderer to Main (two-way)](https://www.electronjs.org/docs/latest/tutorial/ipc#pattern-2-renderer-to-main-two-way).

## Current Architecture Understanding

- **Desktop app** (`apps/desktop`): Electron main process that loads the client
  URL
- **Client app** (`apps/client`): React app served at `http://localhost:5173`
  (dev) or production URL
- **Communication**: The client is loaded as a URL, not bundled with Electron
- **Problem**: Current `events` and `conductor` packages are non-functional and
  overcomplicated

## Implementation Steps

### Step 1: Delete Old Packages

```bash
rm -rf packages/@atomiton/events
rm -rf packages/@atomiton/conductor
```

Remove references from:

- Root `package.json` workspaces
- Any imports in apps
- The `pnpm-lock.yaml` will regenerate

### Step 2: Create New IPC Package Structure

```
packages/@atomiton/ipc/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── shared/
│   │   ├── channels.ts      # IPC channel names
│   │   └── types.ts         # Shared types
│   ├── main/
│   │   ├── index.ts         # Main process setup
│   │   └── handlers.ts      # IPC handlers
│   ├── preload/
│   │   └── index.ts         # Preload script API
│   └── renderer/
│       └── index.ts         # Client-side API
```

### Step 3: Package Files

#### `packages/@atomiton/ipc/package.json`

```json
{
  "name": "@atomiton/ipc",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "exports": {
    "./main": {
      "types": "./dist/main/index.d.ts",
      "import": "./dist/main/index.js",
      "require": "./dist/main/index.cjs"
    },
    "./preload": {
      "types": "./dist/preload/index.d.ts",
      "import": "./dist/preload/index.js",
      "require": "./dist/preload/index.cjs"
    },
    "./renderer": {
      "types": "./dist/renderer/index.d.ts",
      "import": "./dist/renderer/index.js",
      "require": "./dist/renderer/index.cjs"
    },
    "./shared": {
      "types": "./dist/shared/index.d.ts",
      "import": "./dist/shared/index.js",
      "require": "./dist/shared/index.cjs"
    }
  },
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "electron": "^38.0.0"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "typescript": "catalog:",
    "vite": "catalog:",
    "vite-plugin-dts": "catalog:"
  }
}
```

#### `packages/@atomiton/ipc/tsconfig.json`

```json
{
  "extends": "@atomiton/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### `packages/@atomiton/ipc/vite.config.ts`

```typescript
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: {
        "main/index": resolve(__dirname, "src/main/index.ts"),
        "preload/index": resolve(__dirname, "src/preload/index.ts"),
        "renderer/index": resolve(__dirname, "src/renderer/index.ts"),
        "shared/index": resolve(__dirname, "src/shared/index.ts"),
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["electron", "path", "fs", "crypto"],
    },
  },
});
```

### Step 4: Core Implementation Files

#### `packages/@atomiton/ipc/src/shared/channels.ts`

```typescript
// Define ALL IPC channels as constants
export const IPC = {
  // Node execution
  EXECUTE_NODE: "node:execute",
  NODE_PROGRESS: "node:progress",
  NODE_COMPLETE: "node:complete",
  NODE_ERROR: "node:error",

  // Storage operations
  STORAGE_GET: "storage:get",
  STORAGE_SET: "storage:set",
  STORAGE_DELETE: "storage:delete",

  // System
  PING: "system:ping",

  // Add more channels as needed
} as const;

export type IPCChannel = (typeof IPC)[keyof typeof IPC];
```

#### `packages/@atomiton/ipc/src/shared/types.ts`

```typescript
// Node execution types
export interface NodeExecuteRequest {
  id: string;
  nodeId: string;
  inputs: Record<string, unknown>;
  options?: {
    timeout?: number;
  };
}

export interface NodeExecuteResponse {
  id: string;
  success: boolean;
  outputs?: Record<string, unknown>;
  error?: string;
  duration?: number;
}

export interface NodeProgress {
  id: string;
  nodeId: string;
  progress: number;
  message?: string;
}

// Storage types
export interface StorageRequest {
  key: string;
  value?: unknown;
}

export interface StorageResponse {
  success: boolean;
  value?: unknown;
  error?: string;
}

// Re-export from index
export * from "./channels";
```

#### `packages/@atomiton/ipc/src/shared/index.ts`

```typescript
export * from "./channels";
export * from "./types";
```

#### `packages/@atomiton/ipc/src/main/handlers.ts`

```typescript
import { ipcMain, BrowserWindow } from "electron";
import { IPC } from "../shared/channels";
import type {
  NodeExecuteRequest,
  NodeExecuteResponse,
  NodeProgress,
  StorageRequest,
  StorageResponse,
} from "../shared/types";

export function setupHandlers(mainWindow: BrowserWindow) {
  console.log("[IPC] Setting up handlers...");

  // System handlers
  ipcMain.handle(IPC.PING, async () => {
    console.log("[IPC] Received ping");
    return "pong";
  });

  // Node execution handler
  ipcMain.handle(
    IPC.EXECUTE_NODE,
    async (
      _event,
      request: NodeExecuteRequest,
    ): Promise<NodeExecuteResponse> => {
      console.log("[IPC] Execute node:", request.nodeId);

      try {
        // Send initial progress
        const progress: NodeProgress = {
          id: request.id,
          nodeId: request.nodeId,
          progress: 0,
          message: "Starting execution...",
        };
        mainWindow.webContents.send(IPC.NODE_PROGRESS, progress);

        // TODO: Import and use actual node execution logic
        // const executable = getNodeExecutable(request.nodeId);
        // if (!executable) throw new Error(`Node not found: ${request.nodeId}`);

        // Simulate execution for testing
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Send progress update
        mainWindow.webContents.send(IPC.NODE_PROGRESS, {
          id: request.id,
          nodeId: request.nodeId,
          progress: 50,
          message: "Processing...",
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Create response
        const response: NodeExecuteResponse = {
          id: request.id,
          success: true,
          outputs: {
            result: "Test output from node execution",
            timestamp: Date.now(),
          },
        };

        // Send completion event
        mainWindow.webContents.send(IPC.NODE_COMPLETE, response);

        return response;
      } catch (error) {
        const errorResponse: NodeExecuteResponse = {
          id: request.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };

        // Send error event
        mainWindow.webContents.send(IPC.NODE_ERROR, errorResponse);

        return errorResponse;
      }
    },
  );

  // Storage handlers
  ipcMain.handle(
    IPC.STORAGE_GET,
    async (_event, request: StorageRequest): Promise<StorageResponse> => {
      console.log("[IPC] Storage get:", request.key);

      try {
        // TODO: Implement actual storage logic
        return {
          success: true,
          value: `Value for ${request.key}`,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  ipcMain.handle(
    IPC.STORAGE_SET,
    async (_event, request: StorageRequest): Promise<StorageResponse> => {
      console.log("[IPC] Storage set:", request.key);

      try {
        // TODO: Implement actual storage logic
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  console.log("[IPC] Handlers ready");
}
```

#### `packages/@atomiton/ipc/src/main/index.ts`

```typescript
import { BrowserWindow } from "electron";
import { setupHandlers } from "./handlers";

export function setupIPC(mainWindow: BrowserWindow) {
  setupHandlers(mainWindow);
}

// Export types for main process usage
export type {
  NodeExecuteRequest,
  NodeExecuteResponse,
  NodeProgress,
  StorageRequest,
  StorageResponse,
} from "../shared/types";
```

#### `packages/@atomiton/ipc/src/preload/index.ts`

```typescript
import { contextBridge, ipcRenderer } from "electron";
import { IPC } from "../shared/channels";
import type {
  NodeExecuteRequest,
  NodeExecuteResponse,
  NodeProgress,
  StorageRequest,
  StorageResponse,
} from "../shared/types";

// Define the IPC API
const ipcAPI = {
  // System
  ping: (): Promise<string> => ipcRenderer.invoke(IPC.PING),

  // Node execution
  executeNode: (request: NodeExecuteRequest): Promise<NodeExecuteResponse> =>
    ipcRenderer.invoke(IPC.EXECUTE_NODE, request),

  // Storage
  storageGet: (request: StorageRequest): Promise<StorageResponse> =>
    ipcRenderer.invoke(IPC.STORAGE_GET, request),

  storageSet: (request: StorageRequest): Promise<StorageResponse> =>
    ipcRenderer.invoke(IPC.STORAGE_SET, request),

  // Event listeners with cleanup
  onNodeProgress: (callback: (progress: NodeProgress) => void) => {
    const listener = (_event: any, progress: NodeProgress) =>
      callback(progress);
    ipcRenderer.on(IPC.NODE_PROGRESS, listener);
    return () => {
      ipcRenderer.removeListener(IPC.NODE_PROGRESS, listener);
    };
  },

  onNodeComplete: (callback: (response: NodeExecuteResponse) => void) => {
    const listener = (_event: any, response: NodeExecuteResponse) =>
      callback(response);
    ipcRenderer.on(IPC.NODE_COMPLETE, listener);
    return () => {
      ipcRenderer.removeListener(IPC.NODE_COMPLETE, listener);
    };
  },

  onNodeError: (callback: (response: NodeExecuteResponse) => void) => {
    const listener = (_event: any, response: NodeExecuteResponse) =>
      callback(response);
    ipcRenderer.on(IPC.NODE_ERROR, listener);
    return () => {
      ipcRenderer.removeListener(IPC.NODE_ERROR, listener);
    };
  },
};

// Expose the API
export function exposeIPC() {
  if (process.contextIsolated) {
    try {
      contextBridge.exposeInMainWorld("atomitonIPC", ipcAPI);
      console.log("[IPC] API exposed to renderer");
    } catch (error) {
      console.error("[IPC] Failed to expose API:", error);
    }
  } else {
    (window as any).atomitonIPC = ipcAPI;
  }
}

// Type for global augmentation
export type AtomitonIPC = typeof ipcAPI;

// Global type augmentation
declare global {
  interface Window {
    atomitonIPC: AtomitonIPC;
  }
}
```

#### `packages/@atomiton/ipc/src/renderer/index.ts`

```typescript
import type {
  NodeExecuteRequest,
  NodeExecuteResponse,
  NodeProgress,
  StorageRequest,
  StorageResponse,
} from "../shared/types";

/**
 * Client-side IPC wrapper
 * Provides a clean API for the renderer process to communicate with main
 */
class IPCClient {
  private get api() {
    if (typeof window !== "undefined" && window.atomitonIPC) {
      return window.atomitonIPC;
    }
    return null;
  }

  /**
   * Check if IPC is available (running in Electron)
   */
  isAvailable(): boolean {
    return this.api !== null;
  }

  /**
   * Test IPC connection
   */
  async ping(): Promise<string> {
    if (!this.api)
      throw new Error("IPC not available - not running in Electron");
    return await this.api.ping();
  }

  /**
   * Execute a node
   */
  async executeNode(
    nodeId: string,
    inputs: Record<string, unknown>,
    options?: { timeout?: number },
  ): Promise<NodeExecuteResponse> {
    if (!this.api) throw new Error("IPC not available");

    const request: NodeExecuteRequest = {
      id: crypto.randomUUID(),
      nodeId,
      inputs,
      options,
    };

    return await this.api.executeNode(request);
  }

  /**
   * Storage operations
   */
  async storageGet(key: string): Promise<unknown> {
    if (!this.api) throw new Error("IPC not available");
    const response = await this.api.storageGet({ key });
    if (!response.success) throw new Error(response.error);
    return response.value;
  }

  async storageSet(key: string, value: unknown): Promise<void> {
    if (!this.api) throw new Error("IPC not available");
    const response = await this.api.storageSet({ key, value });
    if (!response.success) throw new Error(response.error);
  }

  /**
   * Event subscriptions
   */
  onProgress(callback: (progress: NodeProgress) => void): () => void {
    if (!this.api) return () => {};
    return this.api.onNodeProgress(callback);
  }

  onComplete(callback: (response: NodeExecuteResponse) => void): () => void {
    if (!this.api) return () => {};
    return this.api.onNodeComplete(callback);
  }

  onError(callback: (response: NodeExecuteResponse) => void): () => void {
    if (!this.api) return () => {};
    return this.api.onNodeError(callback);
  }
}

// Export singleton instance
export const ipc = new IPCClient();

// Re-export types
export type {
  NodeExecuteRequest,
  NodeExecuteResponse,
  NodeProgress,
  StorageRequest,
  StorageResponse,
} from "../shared/types";
```

### Step 5: Integration with Existing Apps

#### Update `apps/desktop/src/preload/index.ts`

```typescript
import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge } from "electron";
import { exposeIPC } from "@atomiton/ipc/preload";

// Expose electron API
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
}

// Expose Atomiton IPC
exposeIPC();
```

#### Update `apps/desktop/src/main/index.ts`

Add after window creation in `app.whenReady()`:

```typescript
import { setupIPC } from "@atomiton/ipc/main";

// After createWindow()
if (mainWindow) {
  setupIPC(mainWindow);
  logger.info("IPC handlers initialized");
}
```

### Step 6: Client Application Integration

#### Create `apps/client/src/lib/ipc.ts`

```typescript
// Re-export the IPC client for use in React components
export { ipc } from "@atomiton/ipc/renderer";
export type { NodeExecuteResponse, NodeProgress } from "@atomiton/ipc/renderer";
```

#### Test Component `apps/client/src/components/IPCTest.tsx`

```tsx
import { useState, useEffect } from "react";
import { ipc, type NodeProgress } from "@/lib/ipc";

export function IPCTest() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [pingResult, setPingResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<NodeProgress | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setIsAvailable(ipc.isAvailable());
  }, []);

  const testPing = async () => {
    try {
      setError("");
      setPingResult("");
      const result = await ipc.ping();
      setPingResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ping failed");
    }
  };

  const testNodeExecution = async () => {
    setLoading(true);
    setError("");
    setProgress(null);
    setResult(null);

    // Set up listeners
    const unsubProgress = ipc.onProgress((p) => {
      setProgress(p);
      console.log("Progress:", p);
    });

    const unsubComplete = ipc.onComplete((response) => {
      console.log("Complete:", response);
      setResult(response);
      setLoading(false);
    });

    const unsubError = ipc.onError((response) => {
      console.log("Error:", response);
      setError(response.error || "Unknown error");
      setLoading(false);
    });

    try {
      const response = await ipc.executeNode("test-node", {
        input: "test data",
        timestamp: Date.now(),
      });
      console.log("Final response:", response);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Execution failed");
    } finally {
      setLoading(false);
      // Cleanup listeners
      unsubProgress();
      unsubComplete();
      unsubError();
    }
  };

  if (!isAvailable) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800">
          IPC not available - App is not running in Electron desktop mode
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">IPC Communication Test</h2>

      {/* Ping Test */}
      <div className="border rounded p-4 space-y-2">
        <h3 className="font-semibold">Connection Test</h3>
        <button
          onClick={testPing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Ping
        </button>
        {pingResult && (
          <p className="text-green-600">✓ Response: {pingResult}</p>
        )}
      </div>

      {/* Node Execution Test */}
      <div className="border rounded p-4 space-y-2">
        <h3 className="font-semibold">Node Execution Test</h3>
        <button
          onClick={testNodeExecution}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Executing..." : "Execute Test Node"}
        </button>

        {progress && (
          <div className="bg-gray-100 rounded p-2">
            <p className="text-sm text-gray-600">
              Progress: {progress.progress}%
            </p>
            <p className="text-xs text-gray-500">{progress.message}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 rounded p-2">
            <p className="text-sm font-semibold">Result:</p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}
    </div>
  );
}
```

### Step 7: Hook Up Real Node Execution

Update `packages/@atomiton/ipc/src/main/handlers.ts` to use real node execution:

```typescript
import { getNodeExecutable } from "@atomiton/nodes/executables";
import type { NodeExecutionContext } from "@atomiton/nodes/executables";

// In the EXECUTE_NODE handler, replace the TODO with:
const executable = getNodeExecutable(request.nodeId);
if (!executable) {
  throw new Error(`Node not found: ${request.nodeId}`);
}

// Create execution context
const context: NodeExecutionContext = {
  nodeId: request.nodeId,
  inputs: request.inputs,
  startTime: new Date(),
  reportProgress: (progress: number, message?: string) => {
    mainWindow.webContents.send(IPC.NODE_PROGRESS, {
      id: request.id,
      nodeId: request.nodeId,
      progress,
      message,
    });
  },
  log: {
    info: (msg: string) => console.log(`[Node ${request.nodeId}]`, msg),
    error: (msg: string) => console.error(`[Node ${request.nodeId}]`, msg),
  },
  limits: {
    maxExecutionTimeMs: request.options?.timeout || 30000,
  },
};

// Execute
const result = await executable.execute(context, {});
```

## Testing Plan

### 1. Basic IPC Test

```bash
# Start the desktop app in dev mode
cd apps/desktop
npm run dev

# In another terminal, start the client
cd apps/client
npm run dev

# Add the IPCTest component to your app and test:
# 1. Ping should return "pong"
# 2. Node execution should show progress updates
# 3. Final result should be displayed
```

### 2. Console Verification

Look for these console logs:

- Main process: `[IPC] Setting up handlers...`
- Main process: `[IPC] Received ping`
- Preload: `[IPC] API exposed to renderer`
- Renderer: Progress and completion events

### 3. DevTools Testing

In Chrome DevTools console:

```javascript
// Check if IPC is available
window.atomitonIPC;

// Test ping
await window.atomitonIPC.ping();

// Test node execution
await window.atomitonIPC.executeNode({
  id: "test-1",
  nodeId: "test-node",
  inputs: { test: true },
});
```

## Migration Checklist

- [ ] Delete `packages/@atomiton/events`
- [ ] Delete `packages/@atomiton/conductor`
- [ ] Create `packages/@atomiton/ipc` with all files
- [ ] Update `apps/desktop/src/preload/index.ts`
- [ ] Update `apps/desktop/src/main/index.ts`
- [ ] Create `apps/client/src/lib/ipc.ts`
- [ ] Add test component to client app
- [ ] Test ping functionality
- [ ] Test node execution with progress
- [ ] Remove old package references from imports
- [ ] Update `pnpm-lock.yaml` (run `pnpm install`)
- [ ] Connect real node execution logic
- [ ] Add remaining handlers as needed

## Benefits of This Approach

1. **Simplicity**: Direct use of Electron's IPC without abstractions
2. **Type Safety**: Full TypeScript support across all boundaries
3. **Debuggability**: Clear console logs at each step
4. **Standards Compliant**: Follows Electron best practices
5. **Maintainable**: Easy to understand and extend
6. **Testable**: Each layer can be tested independently
7. **Performance**: No overhead from multiple event systems

## Future Enhancements

Once basic IPC is working, you can add:

- Request/response correlation for multiple concurrent executions
- Request queuing and priority handling
- Batch operations
- Streaming data support
- Better error handling and retry logic
- Performance metrics and logging
- WebSocket fallback for web-only mode

## Troubleshooting

### IPC not available in renderer

- Check that preload script is specified in BrowserWindow options
- Verify `contextIsolation: true` is set
- Check console for exposure errors

### No response from main process

- Verify handlers are registered before window loads
- Check main process console for errors
- Ensure channel names match exactly

### Type errors in client

- Run `pnpm build` in the IPC package
- Ensure TypeScript can find the types
- Check import paths are correct

## Resources

- [Electron IPC Documentation](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [Process Model](https://www.electronjs.org/docs/latest/tutorial/process-model)
