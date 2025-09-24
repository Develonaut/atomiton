# Transport Architecture - Cross-Environment Communication

## Overview

The conductor's transport layer enables consistent Blueprint execution across
different runtime environments by abstracting communication mechanisms. The same
`conductor.execute()` API works identically whether running in Electron,
browsers, or Node.js servers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Unified Conductor API                    │
│               conductor.execute(request)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                 Execution Router                            │
│            Auto-detects environment                         │
│     Delegates to appropriate transport                      │
└──────┬─────────────────┬─────────────────┬──────────────────┘
       │                 │                 │
┌──────▼──────┐ ┌────────▼────────┐ ┌──────▼──────┐
│IPC Transport│ │ HTTP Transport  │ │Local Transport│
│   (Electron │ │   (Browser)     │ │ (Node.js/    │
│   Renderer) │ │                 │ │  Main Process│
└──────┬──────┘ └────────┬────────┘ └──────┬──────┘
       │                 │                 │
┌──────▼──────┐ ┌────────▼────────┐ ┌──────▼──────┐
│Main Process │ │  API Server     │ │Direct Exec  │
│IPC Handler  │ │  HTTP Endpoint  │ │Execution    │
│             │ │                 │ │Engine       │
└─────────────┘ └─────────────────┘ └─────────────┘
```

## Transport Types

### 1. Local Transport

**Used in**: Electron main process, Node.js servers

**Characteristics**:

- Direct, in-process execution
- Full Node.js API access
- Maximum performance
- No network overhead

**Implementation**:

```typescript
export function createLocalTransport(config?: {
  concurrency?: number;
  storage?: unknown;
  timeout?: number;
}): IExecutionTransport {
  const engine = createExecutionEngine(config);

  return {
    type: "local",
    execute: async (request) => engine.execute(request),
    shutdown: async () => engine.shutdown(),
  };
}
```

**Use Cases**:

- Desktop applications (Electron main)
- API servers
- CLI tools
- Direct script execution

### 2. IPC Transport

**Used in**: Electron renderer process

**Characteristics**:

- Inter-process communication via Electron's IPC
- Secure isolation from renderer process
- Full Node.js capabilities via main process
- Asynchronous request/response pattern

**Implementation**:

```typescript
export function createIPCTransport(): IExecutionTransport {
  const pendingRequests = new Map();

  return {
    type: "ipc",
    execute: async (request) => {
      const id = uuidv4();
      return new Promise((resolve, reject) => {
        pendingRequests.set(id, { resolve, reject });

        window.electron.ipcRenderer.send("conductor:execute", {
          type: "conductor:execute",
          payload: request,
          id,
        });
      });
    },
  };
}
```

**Message Flow**:

1. Renderer sends `conductor:execute` with request + unique ID
2. Main process receives via `ipcMain.on('conductor:execute')`
3. Main executes via local transport
4. Main responds with `conductor:result` + same ID
5. Renderer resolves promise with result

### 3. HTTP Transport

**Used in**: Web browsers (non-Electron)

**Characteristics**:

- RESTful API communication
- Standard HTTP/HTTPS protocols
- Works with any Blueprint API server
- Configurable endpoints and headers

**Implementation**:

```typescript
export function createHTTPTransport(config: {
  apiUrl: string;
  headers?: Record<string, string>;
}): IExecutionTransport {
  return {
    type: "http",
    execute: async (request) => {
      const response = await fetch(`${config.apiUrl}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
        body: JSON.stringify(request),
      });

      return response.json();
    },
  };
}
```

**API Contract**:

- **Endpoint**: `POST /api/execute`
- **Request**: `ExecutionRequest` JSON
- **Response**: `ExecutionResult` JSON
- **Headers**: `Content-Type: application/json`

## Execution Router

The router provides the unified interface that abstracts transport selection:

```typescript
export function createExecutionRouter(): IExecutionRouter {
  const transports = new Map<TransportType, IExecutionTransport>();
  let defaultTransport: TransportType | null = null;

  const detectEnvironment = (): TransportType => {
    if (typeof window !== "undefined" && window.electron?.ipcRenderer) {
      return "ipc"; // Electron renderer
    }
    if (typeof window !== "undefined") {
      return "http"; // Browser
    }
    return "local"; // Node.js
  };

  return {
    execute: async (request) => {
      const transportType = defaultTransport || detectEnvironment();
      const transport = transports.get(transportType);
      return transport.execute(request);
    },

    registerTransport: (transport) => {
      transports.set(transport.type, transport);
    },

    setDefaultTransport: (type) => {
      defaultTransport = type;
    },
  };
}
```

## Environment Detection

### Detection Logic

```typescript
function detectEnvironment(): TransportType {
  // Check for Electron renderer context
  if (typeof window !== "undefined" && window.electron?.ipcRenderer) {
    return "ipc";
  }

  // Check for browser context
  if (typeof window !== "undefined") {
    return "http";
  }

  // Default to Node.js context
  return "local";
}
```

### Environment Characteristics

| Environment           | Global Objects                   | Transport | Execution Location |
| --------------------- | -------------------------------- | --------- | ------------------ |
| **Electron Renderer** | `window`, `electron.ipcRenderer` | IPC       | Main Process       |
| **Browser**           | `window` (no `electron`)         | HTTP      | Remote Server      |
| **Electron Main**     | No `window`                      | Local     | In-Process         |
| **Node.js Server**    | No `window`                      | Local     | In-Process         |

## Message Protocols

### IPC Messages

```typescript
// Request message (renderer → main)
interface IPCMessage {
  type: "conductor:execute";
  payload: ExecutionRequest;
  id: string; // UUID for matching responses
}

// Response message (main → renderer)
interface IPCResponse {
  type: "conductor:result";
  payload: ExecutionResult;
  id: string; // Matches request ID
}

// Error message (main → renderer)
interface IPCError {
  type: "conductor:error";
  error: string;
  id: string;
}
```

### HTTP API

```typescript
// Request
POST /api/execute
Content-Type: application/json

{
  "blueprintId": "workflow-id",
  "inputs": { "key": "value" },
  "context": { "userId": "123" },
  "options": { "timeout": 30000 }
}

// Response
200 OK
Content-Type: application/json

{
  "success": true,
  "outputs": { "result": "data" },
  "metadata": { "duration": 1250 }
}
```

## Configuration Examples

### Automatic Configuration (Recommended)

```typescript
import { createConductor } from "@atomiton/conductor";

// Auto-detects environment and configures transport
const conductor = createConductor();

// Works the same everywhere!
const result = await conductor.execute({
  blueprintId: "my-workflow",
  inputs: { data: "test" },
});
```

### Manual Transport Configuration

```typescript
import { createConductor } from "@atomiton/conductor";

// Force specific transport
const conductor = createConductor({
  transport: "http",
  apiUrl: "https://api.example.com",
});

// Or configure at runtime
conductor.configureTransport("local", {
  concurrency: 8,
  timeout: 60000,
});
```

### Environment-Specific Setup

#### Electron Main Process Setup

```typescript
import { setupMainProcessHandler } from "@atomiton/conductor";
import { createStorage } from "@atomiton/storage";
import { app, ipcMain } from "electron";
import path from "path";

// Initialize storage and register IPC handlers for conductor requests
app.whenReady().then(async () => {
  const storage = await createStorage({
    type: "filesystem",
    basePath: path.join(app.getPath("userData"), "atomiton-data"),
  });

  setupMainProcessHandler({
    concurrency: 4,
    storage,
    timeout: 60000,
  });
});
```

#### API Server Setup

```typescript
import express from "express";
import { createConductor } from "@atomiton/conductor";

const app = express();
const conductor = createConductor({
  transport: "local",
  concurrency: 16,
});

app.post("/api/execute", async (req, res) => {
  try {
    const result = await conductor.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Error Handling

### Transport-Level Errors

```typescript
// Network failures (HTTP transport)
if (!response.ok) {
  throw new Error(`Execution failed: ${response.statusText}`);
}

// IPC timeouts (IPC transport)
setTimeout(
  () => {
    if (pendingRequests.has(id)) {
      reject(new Error("Execution timeout"));
    }
  },
  5 * 60 * 1000,
);

// Direct execution errors (Local transport)
try {
  return await engine.execute(request);
} catch (error) {
  return { success: false, error: error.message };
}
```

### Error Recovery Patterns

```typescript
// Automatic retry for transient failures
const conductor = createConductor();

async function executeWithRetry(request, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await conductor.execute(request);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## Performance Characteristics

### Transport Performance Comparison

| Transport | Overhead | Latency  | Throughput | Use Case         |
| --------- | -------- | -------- | ---------- | ---------------- |
| **Local** | None     | <1ms     | High       | Direct execution |
| **IPC**   | Low      | <5ms     | High       | Electron desktop |
| **HTTP**  | Medium   | 10-100ms | Medium     | Web applications |

### Optimization Strategies

#### Connection Pooling (HTTP)

```typescript
const conductor = createConductor({
  transport: "http",
  apiUrl: "https://api.example.com",
  headers: {
    Connection: "keep-alive",
  },
});
```

#### Batch Operations (IPC)

```typescript
// Send multiple requests with single IPC roundtrip
const results = await Promise.all([
  conductor.execute(request1),
  conductor.execute(request2),
  conductor.execute(request3),
]);
```

#### Worker Scaling (Local)

```typescript
const conductor = createConductor({
  transport: "local",
  concurrency: os.cpus().length * 2, // Scale with CPU cores
});
```

## Security Considerations

### IPC Security

- Renderer process never executes Blueprint code directly
- All execution happens in main process with full Node.js access
- IPC messages are scoped to conductor operations only
- Request/response correlation prevents message hijacking

### HTTP Security

- HTTPS recommended for production
- API authentication via headers
- Request validation on server side
- CORS configuration for browser compatibility

### Local Security

- Direct execution with full Node.js privileges
- Storage isolation via configuration
- Resource limits via timeout and concurrency controls

## Testing Strategies

### Transport Mocking

```typescript
// Mock IPC transport for testing
const mockTransport: IExecutionTransport = {
  type: "ipc",
  execute: vi.fn().mockResolvedValue({ success: true }),
};

const conductor = createConductor();
conductor.configureTransport("ipc", mockTransport);
```

### Environment Simulation

```typescript
// Test different environments
beforeEach(() => {
  // Simulate Electron renderer
  global.window = {
    electron: { ipcRenderer: mockIpcRenderer },
  };
});
```

## Related Documentation

- **[Conductor API](./CONDUCTOR_API.md)** - Unified API design and usage
- **[Electron Integration](./ELECTRON_ARCHITECTURE.md)** - Detailed Electron IPC
  flow
- **[BENTO_BOX Implementation](./BENTO_BOX_IMPLEMENTATION.md)** - Simplicity
  principles

---

The transport architecture demonstrates the BENTO_BOX_PRINCIPLE: complex
cross-environment communication hidden behind a simple, unified interface that
"just works" everywhere.
