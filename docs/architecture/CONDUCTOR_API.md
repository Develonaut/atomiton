# Conductor API - Unified Execution Engine

## Overview

The conductor provides a unified API for Blueprint execution that works identically across all environments. It implements the factory pattern with automatic environment detection and transport selection.

## Core API

### createConductor Factory

The `createConductor()` factory function is the primary entry point that provides consistent behavior across all environments:

```typescript
import { createConductor } from "@atomiton/conductor";

// Auto-detects environment and configures appropriate transport
const conductor = createConductor();

// Same API everywhere!
const result = await conductor.execute({
  blueprintId: "my-workflow",
  inputs: { data: "test" },
});
```

### Configuration Options

```typescript
interface ConductorConfig {
  transport?: TransportType; // Override auto-detection
  apiUrl?: string; // For HTTP transport
  concurrency?: number; // For local execution
  storage?: unknown; // Storage backend
  timeout?: number; // Execution timeout
}

const conductor = createConductor({
  transport: "local", // Force local execution
  concurrency: 8, // 8 concurrent workers
  timeout: 30000, // 30-second timeout
});
```

### ConductorInstance Interface

```typescript
interface ConductorInstance {
  // Primary execution method
  execute(request: ExecutionRequest): Promise<ExecutionResult>;

  // Runtime configuration
  configureTransport(type: TransportType, config?: any): void;

  // Cleanup resources
  shutdown?(): Promise<void>;
}
```

## Environment Detection

The conductor automatically detects the runtime environment and selects the appropriate transport:

```typescript
// Detection logic
function detectEnvironment(): TransportType {
  if (typeof window !== "undefined" && window.electron?.ipcRenderer) {
    return "ipc"; // Electron renderer process
  }
  if (typeof window !== "undefined") {
    return "http"; // Browser environment
  }
  return "local"; // Node.js/Electron main
}
```

### Environment Behaviors

| Environment           | Transport | Execution Location | Capabilities             |
| --------------------- | --------- | ------------------ | ------------------------ |
| **Electron Renderer** | IPC       | Main Process       | Full Node.js API via IPC |
| **Electron Main**     | Local     | In-Process         | Full Node.js API direct  |
| **Browser**           | HTTP      | Remote Server      | API calls to backend     |
| **Server/Node.js**    | Local     | In-Process         | Full Node.js API direct  |

## Execution Flow

### Request Structure

```typescript
interface ExecutionRequest {
  blueprintId: string; // Blueprint identifier
  inputs?: Record<string, any>; // Input parameters
  context?: ExecutionContext; // Execution context
  options?: ExecutionOptions; // Runtime options
}
```

### Result Structure

```typescript
interface ExecutionResult {
  success: boolean; // Execution status
  outputs?: Record<string, any>; // Output data
  error?: string; // Error message if failed
  metadata?: ExecutionMetadata; // Execution metrics
}
```

### Example Usage Patterns

#### Simple Workflow Execution

```typescript
const conductor = createConductor();

// Execute data processing workflow
const result = await conductor.execute({
  blueprintId: "data-processing",
  inputs: {
    file: "/path/to/data.csv",
    format: "json",
  },
});

if (result.success) {
  console.log("Processed data:", result.outputs);
} else {
  console.error("Processing failed:", result.error);
}
```

#### HTTP API Workflow

```typescript
const conductor = createConductor();

// Execute HTTP processing pipeline
const result = await conductor.execute({
  blueprintId: "api-processing",
  inputs: {
    url: "https://api.example.com/data",
    method: "GET",
  },
});
```

#### Multi-step Automation

```typescript
const conductor = createConductor();

// Complex multi-step workflow
const result = await conductor.execute({
  blueprintId: "complex-automation",
  inputs: {
    source: "database",
    destination: "webhook",
    filters: { status: "active" },
  },
});
```

## Performance Characteristics

### Benchmarked Performance

The conductor has been benchmarked against competitors with measurable results:

| Workflow Type         | Atomiton | n8n         | Zapier      | Advantage           |
| --------------------- | -------- | ----------- | ----------- | ------------------- |
| HTTP→JSON→DB          | 117ms    | ~150ms      | ~1500ms     | 22% faster than n8n |
| Multi-step automation | 118ms    | ~200ms      | ~1500ms     | 41% faster than n8n |
| Error handling        | 11ms     | 30+ seconds | 30+ seconds | 99% faster          |

### Memory Efficiency

- **Complex workflows**: <5MB overhead
- **Large datasets**: 4.26MB for 100K items
- **Worker pool management**: Automatic scaling based on workload

## Integration Examples

### Electron Application

```typescript
// main.ts - Electron main process
import { setupMainProcessHandler } from '@atomiton/conductor';

app.whenReady().then(() => {
  setupMainProcessHandler({
    concurrency: 4,
    storage: storageEngine
  });
});

// renderer.tsx - React component
import { conductor } from '@atomiton/conductor';

function WorkflowButton() {
  const handleClick = async () => {
    const result = await conductor.execute({
      blueprintId: 'file-processor',
      inputs: { path: '/selected/file.csv' }
    });
  };

  return <button onClick={handleClick}>Process File</button>;
}
```

### Web Application

```typescript
// Uses HTTP transport automatically in browser
import { conductor } from "@atomiton/conductor";

async function runWebWorkflow() {
  const result = await conductor.execute({
    blueprintId: "web-scraper",
    inputs: { url: "https://example.com" },
  });
}
```

### Server Application

```typescript
// Uses local transport automatically in Node.js
import { createConductor } from "@atomiton/conductor";

const conductor = createConductor({
  concurrency: 16, // High concurrency for server
});

app.post("/execute", async (req, res) => {
  const result = await conductor.execute(req.body);
  res.json(result);
});
```

## Transport Configuration

### Manual Transport Selection

```typescript
const conductor = createConductor();

// Override auto-detection
conductor.configureTransport("http", {
  apiUrl: "https://api.example.com",
});

// Switch to local execution
conductor.configureTransport("local", {
  concurrency: 4,
  timeout: 60000,
});
```

### Environment Variables

```bash
# HTTP transport configuration
VITE_API_URL=https://api.example.com

# Local transport configuration
CONDUCTOR_CONCURRENCY=8
CONDUCTOR_TIMEOUT=30000
```

## Error Handling

### Built-in Error Recovery

```typescript
// Automatic retry and error recovery
const result = await conductor.execute({
  blueprintId: "unreliable-api",
  options: {
    retries: 3,
    timeout: 10000,
    fallback: "cached-data",
  },
});
```

### Error Types

```typescript
interface ExecutionError {
  type: "validation" | "network" | "timeout" | "internal";
  message: string;
  details?: any;
  retryable: boolean;
}
```

## Migration Guide

### From Class-Based to Factory Pattern

```typescript
// Old approach (deprecated)
import { ExecutionEngine } from "@atomiton/conductor";
const engine = new ExecutionEngine(config);
await engine.execute(blueprint);

// New approach (current)
import { createConductor } from "@atomiton/conductor";
const conductor = createConductor(config);
await conductor.execute(request);
```

### Benefits of New API

1. **Simpler**: Single factory function vs complex class hierarchy
2. **Consistent**: Same API across all environments
3. **Auto-configuring**: No manual transport setup required
4. **Type-safe**: Full TypeScript support throughout
5. **Testable**: Easy to mock and test in isolation

## Related Documentation

- **[Transport Architecture](./TRANSPORT_ARCHITECTURE.md)** - Detailed transport layer implementation
- **[Electron Integration](./ELECTRON_ARCHITECTURE.md)** - Electron-specific integration patterns
- **[BENTO_BOX Implementation](./BENTO_BOX_IMPLEMENTATION.md)** - Simplicity principles in practice

---

The conductor API exemplifies our BENTO_BOX_PRINCIPLE: one simple, unified interface that works everywhere, with complexity hidden behind clean abstractions.
