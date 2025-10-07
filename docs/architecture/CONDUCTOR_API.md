# Conductor API - Unified Execution Engine

## Overview

The conductor provides a unified API for Flow execution that works identically
across all environments. It implements the factory pattern with automatic
environment detection and transport selection.

## Core API

### createConductor Factory

The `createConductor()` factory function is the primary entry point that
provides consistent behavior across all environments:

```typescript
import { createConductor } from "@atomiton/conductor";

// Auto-detects environment and configures appropriate transport
const conductor = createConductor();

// Same API everywhere!
const result = await conductor.execute({
  flowId: "my-workflow",
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

The conductor automatically detects the runtime environment and selects the
appropriate transport:

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
  flowId: string; // Flow identifier
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
  flowId: "data-processing",
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
  flowId: "api-processing",
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
  flowId: "complex-automation",
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
import { app } from 'electron';
import { createStorage } from '@atomiton/storage';
import { setupMainProcessHandler } from '@atomiton/conductor';
import path from 'path';

app.whenReady().then(async () => {
  // Initialize filesystem storage in userData directory
  const storage = await createStorage({
    type: 'filesystem',
    basePath: path.join(app.getPath('userData'), 'atomiton-data')
  });

  setupMainProcessHandler({
    concurrency: 4,
    storage // Configured storage instance
  });
});

// renderer.tsx - React component
import { conductor } from '@atomiton/conductor';

function WorkflowButton() {
  const handleClick = async () => {
    const result = await conductor.execute({
      flowId: 'file-processor',
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
    flowId: "web-scraper",
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
  flowId: "unreliable-api",
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
await engine.execute(flow);

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

## Node API

The Node API provides execution, validation, and cancellation capabilities for
individual nodes.

### Execute a Node

```typescript
import { conductor } from "@atomiton/conductor/browser";

const result = await conductor.node.run(nodeDefinition, {
  input: { data: [1, 2, 3] },
  variables: { userId: "123" },
  slowMo: 1000, // Optional: slow down execution for debugging
  debug: true, // Optional: enable debug logging
});

if (result.success) {
  console.log("Output:", result.data);
  console.log("Duration:", result.duration, "ms");
  console.log("Executed nodes:", result.executedNodes);
} else {
  console.error("Error:", result.error);
}
```

### Validate a Node

```typescript
const validation = await conductor.node.validate(nodeDefinition);

if (!validation.valid) {
  console.error("Validation errors:", validation.errors);
  // Example: ["Node must have an id", "Invalid parameter type"]
}
```

### Cancel Execution

```typescript
// Start execution
const result = conductor.node.run(longRunningNode);

// Cancel it
await conductor.node.cancel(executionId);
```

### Node Events

```typescript
// Progress updates
conductor.node.onProgress((event) => {
  console.log(`Progress: ${event.progress}%`);
  console.log(`Message: ${event.message}`);
  console.log("Executing nodes:", event.nodes);
});

// Completion
conductor.node.onComplete((event) => {
  console.log("Node completed:", event.nodeId);
  console.log("Output:", event.output);
});

// Errors
conductor.node.onError((event) => {
  console.error("Node failed:", event.nodeId);
  console.error("Error:", event.error);
});
```

## Flow API

The Flow API manages flow templates and provides convenience methods for
executing flows (group nodes).

### List Available Templates

```typescript
const { templates } = await conductor.flow.listTemplates();

templates.forEach((template) => {
  console.log(`${template.name}: ${template.description}`);
  console.log(`  Nodes: ${template.nodeCount}`);
});
```

### Load a Template

```typescript
// Get template details
const { definition } = await conductor.flow.getTemplate("hello-world");

// Or load directly
const flowDefinition = await conductor.flow.loadFlow("data-pipeline");
```

### Execute a Flow

```typescript
// Execute a flow (group node with children)
const result = await conductor.flow.run(flowDefinition, {
  input: {
    source: "database",
    destination: "api",
  },
  variables: {
    env: "production",
  },
});
```

**Note**: `conductor.flow.run()` is an alias to `conductor.node.run()` with
validation that ensures the node is a group (has child nodes). For atomic nodes,
use `conductor.node.run()` directly.

### Flow Events

```typescript
// Same events as node API (flows are nodes)
conductor.flow.onProgress((event) => {
  console.log(`Flow progress: ${event.progress}%`);
});

conductor.flow.onComplete((event) => {
  console.log("Flow completed successfully");
});

conductor.flow.onError((event) => {
  console.error("Flow execution failed:", event.error);
});
```

## Storage API

The Storage API manages flow persistence - saving, loading, listing, and
deleting user flows.

### Save a Flow

```typescript
await conductor.storage.saveFlow({
  id: 'my-workflow',  // Optional: auto-generated if not provided
  name: 'Data Processing Pipeline',
  description: 'Processes CSV files and exports to JSON',
  nodes: [...],
  edges: [...],
  metadata: {
    tags: ['data', 'processing'],
    author: 'user@example.com'
  }
});
```

### Load a Flow

```typescript
const flow = await conductor.storage.loadFlow("my-workflow");

console.log("Flow:", flow.name);
console.log("Saved at:", flow.savedAt);
console.log("Version:", flow.version);
console.log("Nodes:", flow.nodes.length);
```

### List Flows

```typescript
const { flows, total } = await conductor.storage.listFlows({
  limit: 50, // Optional: default 50
  offset: 0, // Optional: for pagination
  sortBy: "savedAt", // Optional: 'name' | 'savedAt' | 'updatedAt'
  sortOrder: "desc", // Optional: 'asc' | 'desc'
});

flows.forEach((flow) => {
  console.log(`${flow.name} (${flow.nodeCount} nodes)`);
  console.log(`  Last saved: ${flow.savedAt}`);
});

console.log(`Total flows: ${total}`);
```

### Delete a Flow

```typescript
await conductor.storage.deleteFlow("my-workflow");
```

### Storage Events

```typescript
// Flow saved
conductor.storage.onFlowSaved((event) => {
  console.log("Flow saved:", event.id);
  console.log("Name:", event.name);
  console.log("Saved at:", event.savedAt);
});

// Note: Additional events (flowLoaded, flowDeleted) may be added in future versions
```

### Example: Save and Execute Workflow

```typescript
// 1. Load a template
const template = await conductor.flow.loadFlow("data-processor");

// 2. Customize it
const customFlow = {
  ...template,
  name: "My Custom Data Processor",
  parameters: {
    ...template.parameters,
    outputFormat: "json",
  },
};

// 3. Save for reuse
await conductor.storage.saveFlow(customFlow);

// 4. Execute it
const result = await conductor.flow.run(customFlow, {
  input: { file: "/path/to/data.csv" },
});

// 5. Check result
if (result.success) {
  console.log("Processed data:", result.data);
}
```

## Environment Detection

The conductor automatically detects the runtime environment:

```typescript
import { conductor } from "@atomiton/conductor/browser";

// Check environment
const env = conductor.getEnvironment();

console.log("Type:", env.type); // 'browser' | 'desktop'
console.log("Has transport:", env.hasTransport);

// Or use convenience flags
if (conductor.inDesktop) {
  console.log("Running in Electron");
}

if (conductor.inBrowser) {
  console.log("Running in web browser");
}
```

## Error Handling

### Error Types

All errors include a `code` for programmatic handling:

```typescript
const result = await conductor.node.run(node);

if (!result.success) {
  switch (result.error.code) {
    case "INVALID_NODE":
      console.error("Node definition is invalid");
      break;
    case "NO_TRANSPORT":
      console.error("No execution environment available");
      break;
    case "EXECUTION_FAILED":
      console.error("Execution failed:", result.error.message);
      break;
    case "TIMEOUT":
      console.error("Execution timed out");
      break;
  }
}
```

### Retry Logic

Node execution includes automatic retry with exponential backoff:

```typescript
// Automatically retries up to 3 times with increasing delays
// 1st retry: 1 second delay
// 2nd retry: 2 second delay
// 3rd retry: 4 second delay
const result = await conductor.node.run(unreliableNode);
```

### Error Recovery

```typescript
try {
  const result = await conductor.node.run(node);

  if (!result.success) {
    // Log error details
    console.error("Node execution failed:", {
      nodeId: result.error.nodeId,
      message: result.error.message,
      timestamp: result.error.timestamp,
      code: result.error.code,
    });

    // Fallback to default behavior
    return defaultResult;
  }

  return result.data;
} catch (error) {
  // Handle transport/network errors
  console.error("Transport error:", error);
  throw error;
}
```

## Auth API

The Auth API manages user authentication, session tokens, and authorization.

### Login

```typescript
const result = await conductor.auth.login({
  username: "user@example.com",
  password: "secure-password",
});

if (result.token) {
  console.log("Login successful");
  console.log("User:", result.user?.username);
  console.log("Expires:", result.expiresAt);

  // Token is automatically stored in localStorage
}
```

### Get Current User

```typescript
const user = await conductor.auth.getCurrentUser();

if (user) {
  console.log("Logged in as:", user.username);
  console.log("Email:", user.email);
  console.log("Roles:", user.roles);
} else {
  console.log("Not authenticated");
}
```

### Refresh Token

```typescript
// Automatically refreshes the stored token
const result = await conductor.auth.refreshToken();

if (result.token) {
  console.log("Token refreshed successfully");
  console.log("New expiry:", result.expiresAt);
}
```

### Logout

```typescript
await conductor.auth.logout();

// Clears token from localStorage and sessionStorage
console.log("Logged out successfully");
```

### Auth Events

```typescript
// Session expired - prompt user to re-authenticate
conductor.auth.onAuthExpired(() => {
  console.warn("Session expired - please log in again");

  // Redirect to login page
  window.location.href = "/login";
});
```

### Example: Protected Route Component

```typescript
import { conductor } from '@atomiton/conductor/browser';
import { useEffect, useState } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    conductor.auth.getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));

    // Handle session expiry
    const unsubscribe = conductor.auth.onAuthExpired(() => {
      setUser(null);
      window.location.href = '/login';
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
}
```

### Example: Automatic Token Refresh

```typescript
// Set up automatic token refresh before expiry
async function setupTokenRefresh() {
  const user = await conductor.auth.getCurrentUser();
  if (!user) return;

  // Refresh token 5 minutes before expiry
  const result = await conductor.auth.refreshToken();
  if (result.expiresAt) {
    const expiryTime = new Date(result.expiresAt).getTime();
    const refreshTime = expiryTime - 5 * 60 * 1000; // 5 minutes before
    const delay = refreshTime - Date.now();

    if (delay > 0) {
      setTimeout(setupTokenRefresh, delay);
    }
  }
}

// Start refresh cycle
setupTokenRefresh();
```

## System API

The System API provides health checks and system operations.

### Health Check

```typescript
const health = await conductor.system.health();

console.log("Status:", health.status); // 'ok' | 'degraded' | 'down'
console.log("Timestamp:", health.timestamp);
console.log("Message:", health.message);
```

### Restart System (Desktop only)

```typescript
// Prompts user for confirmation before restarting
await conductor.system.restart();

// Note: Only available in desktop environment
// Throws error in browser environment
```

### Example: Health Monitoring Component

```typescript
import { conductor } from '@atomiton/conductor/browser';
import { useEffect, useState } from 'react';

function HealthMonitor() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    // Check health every 30 seconds
    const checkHealth = async () => {
      const result = await conductor.system.health();
      setHealth(result);
    };

    checkHealth(); // Initial check
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!health) return <div>Checking system health...</div>;

  return (
    <div className={`health-status status-${health.status}`}>
      <span className="indicator" />
      <span>System: {health.status}</span>
      {health.message && <span className="message">{health.message}</span>}
    </div>
  );
}
```

## Advanced Patterns

### Complete React Flow Execution Example

```typescript
import { conductor } from '@atomiton/conductor/browser';
import { useState } from 'react';
import type { ExecutionResult, NodeProgressEvent } from '@atomiton/conductor/browser';

function FlowExecutor() {
  const [executing, setExecuting] = useState(false);
  const [progress, setProgress] = useState<NodeProgressEvent | null>(null);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  useEffect(() => {
    // Subscribe to progress events
    const unsubscribeProgress = conductor.node.onProgress((event) => {
      setProgress(event);
      console.log(`Progress: ${event.progress}%`);
      console.log(`Message: ${event.message}`);

      // Update UI with node states
      event.nodes.forEach(node => {
        console.log(`  ${node.name}: ${node.state}`);
      });
    });

    // Subscribe to completion events
    const unsubscribeComplete = conductor.node.onComplete((event) => {
      console.log('Execution completed:', event.nodeId);
      setResult(event.result);
      setExecuting(false);
    });

    // Subscribe to error events
    const unsubscribeError = conductor.node.onError((event) => {
      console.error('Execution failed:', event.error);
      setExecuting(false);
    });

    return () => {
      unsubscribeProgress();
      unsubscribeComplete();
      unsubscribeError();
    };
  }, []);

  const executeFlow = async () => {
    setExecuting(true);
    setProgress(null);
    setResult(null);

    try {
      // Load a flow template
      const flow = await conductor.flow.loadFlow('data-processor');

      // Execute with custom inputs
      await conductor.flow.run(flow, {
        input: {
          file: '/path/to/data.csv',
          outputFormat: 'json'
        },
        variables: {
          environment: 'production',
          userId: 'user123'
        },
        slowMo: 100, // Add delay for visualization
        debug: true
      });
    } catch (error) {
      console.error('Failed to execute flow:', error);
      setExecuting(false);
    }
  };

  return (
    <div className="flow-executor">
      <button onClick={executeFlow} disabled={executing}>
        {executing ? 'Executing...' : 'Execute Flow'}
      </button>

      {progress && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress.progress}%` }} />
          <p>{progress.message}</p>

          <div className="node-states">
            {progress.nodes.map(node => (
              <div key={node.id} className={`node-state ${node.state}`}>
                <span className="node-name">{node.name}</span>
                <span className="node-status">{node.state}</span>
                {node.duration && <span className="node-duration">{node.duration}ms</span>}
              </div>
            ))}
          </div>

          <div className="graph-info">
            <p>Max parallelism: {progress.graph.maxParallelism}</p>
            <p>Critical path: {progress.graph.criticalPath.join(' → ')}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="result-container">
          {result.success ? (
            <div className="success">
              <h3>Success!</h3>
              <pre>{JSON.stringify(result.data, null, 2)}</pre>
              <p>Duration: {result.duration}ms</p>
              <p>Executed nodes: {result.executedNodes?.length}</p>
            </div>
          ) : (
            <div className="error">
              <h3>Execution Failed</h3>
              <p>Error: {result.error?.message}</p>
              <p>Code: {result.error?.code}</p>
              {result.error?.recovery && (
                <div className="recovery-suggestions">
                  <h4>Recovery Suggestions:</h4>
                  <ul>
                    {result.error.recovery.suggestions?.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                  {result.error.recovery.retryable && (
                    <button onClick={executeFlow}>
                      Retry ({result.error.recovery.maxRetries} attempts remaining)
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### State Management Integration (Zustand)

```typescript
import { create } from 'zustand';
import { conductor } from '@atomiton/conductor/browser';
import type { ExecutionResult, NodeProgressEvent } from '@atomiton/conductor/browser';

type ExecutionState = {
  executing: boolean;
  progress: NodeProgressEvent | null;
  result: ExecutionResult | null;
  error: string | null;

  // Actions
  executeFlow: (flowId: string, inputs?: Record<string, unknown>) => Promise<void>;
  reset: () => void;
};

export const useExecutionStore = create<ExecutionState>((set, get) => {
  // Subscribe to events once on store creation
  conductor.node.onProgress((event) => {
    set({ progress: event });
  });

  conductor.node.onComplete((event) => {
    set({ result: event.result, executing: false });
  });

  conductor.node.onError((event) => {
    set({ error: event.error, executing: false });
  });

  return {
    executing: false,
    progress: null,
    result: null,
    error: null,

    executeFlow: async (flowId, inputs = {}) => {
      set({ executing: true, progress: null, result: null, error: null });

      try {
        const flow = await conductor.flow.loadFlow(flowId);
        await conductor.flow.run(flow, { input: inputs });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Execution failed',
          executing: false
        });
      }
    },

    reset: () => {
      set({ executing: false, progress: null, result: null, error: null });
    }
  };
});

// Usage in components
function FlowButton({ flowId }: { flowId: string }) {
  const { executeFlow, executing, progress } = useExecutionStore();

  return (
    <button onClick={() => executeFlow(flowId)} disabled={executing}>
      {executing ? `${progress?.progress ?? 0}%` : 'Execute'}
    </button>
  );
}
```

### Error Recovery with Retry Logic

```typescript
async function executeWithRetry(
  flow: NodeDefinition,
  inputs: Record<string, unknown>,
  maxRetries = 3,
): Promise<ExecutionResult> {
  let lastError: ExecutionError | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Execution attempt ${attempt}/${maxRetries}`);

    const result = await conductor.flow.run(flow, { input: inputs });

    if (result.success) {
      console.log("Execution succeeded on attempt", attempt);
      return result;
    }

    lastError = result.error;

    // Check if error is retryable
    if (result.error?.recovery?.retryable) {
      const delayMs = result.error.recovery.retryDelayMs ?? 1000 * attempt;
      console.log(`Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    } else {
      console.error("Error is not retryable:", result.error?.code);
      break;
    }
  }

  // All retries exhausted
  return {
    success: false,
    error: lastError,
    duration: 0,
    executedNodes: [],
  };
}

// Usage
const result = await executeWithRetry(myFlow, { data: "test" });
if (result.success) {
  console.log("Success:", result.data);
} else {
  console.error("Failed after all retries:", result.error);
}
```

### Execution Cancellation

```typescript
import { conductor, createExecutionId } from '@atomiton/conductor/browser';

function CancellableExecution() {
  const [executionId, setExecutionId] = useState<string | null>(null);

  const startExecution = async () => {
    const execId = createExecutionId(`exec-${Date.now()}`);
    setExecutionId(execId);

    const flow = await conductor.flow.loadFlow('long-running-flow');

    await conductor.flow.run(flow, {
      executionId: execId,
      input: { data: 'test' }
    });

    setExecutionId(null);
  };

  const cancelExecution = async () => {
    if (executionId) {
      await conductor.node.cancel(executionId);
      setExecutionId(null);
    }
  };

  return (
    <div>
      <button onClick={startExecution} disabled={!!executionId}>
        Start Execution
      </button>
      <button onClick={cancelExecution} disabled={!executionId}>
        Cancel
      </button>
    </div>
  );
}
```

### Debug Mode - Simulate Errors

```typescript
// Simulate a timeout error on a specific node
const result = await conductor.node.run(myNode, {
  debug: {
    simulateError: {
      nodeId: "node-123",
      errorType: "timeout",
      message: "Simulated timeout for testing",
      delayMs: 2000, // Error after 2 seconds
    },
  },
});

// Simulate a random error
const result2 = await conductor.node.run(myNode, {
  debug: {
    simulateError: {
      nodeId: "random", // Random node will fail
      errorType: "network",
      message: "Simulated network failure",
    },
  },
});

// Simulate a long-running node
const result3 = await conductor.node.run(myNode, {
  debug: {
    simulateLongRunning: {
      nodeId: "node-456",
      delayMs: 5000, // 5-second delay
    },
  },
});
```

### SlowMo Visualization

```typescript
// Execute with different slowMo settings for development

// Instant execution (production)
await conductor.node.run(node, { slowMo: 0 });

// Normal speed for demos (100ms per node)
await conductor.node.run(node, { slowMo: 50 });

// Slow for debugging (500ms per node)
await conductor.node.run(node, { slowMo: 250 });

// Very slow for presentations (2s per node)
await conductor.node.run(node, { slowMo: 1000 });

// Super slow for detailed analysis (15s per node)
await conductor.node.run(node, { slowMo: 7500 });
```

### Flow Management Workflow

```typescript
// Complete workflow: List, Load, Execute, Save

// 1. List available templates
const { templates } = await conductor.flow.listTemplates();
console.log("Available templates:", templates);

// 2. Load a template
const template = await conductor.flow.loadFlow("data-processor");

// 3. Customize it
const customFlow = {
  ...template,
  id: "my-custom-processor",
  name: "My Custom Data Processor",
  // Modify nodes, parameters, etc.
};

// 4. Execute to test
const result = await conductor.flow.run(customFlow, {
  input: { file: "test.csv" },
});

if (result.success) {
  // 5. Save for reuse
  await conductor.storage.saveFlow(customFlow);
  console.log("Flow saved successfully");
}

// 6. List all saved flows
const { flows } = await conductor.storage.listFlows();
console.log("Saved flows:", flows);

// 7. Load and execute saved flow
const savedFlow = await conductor.storage.loadFlow("my-custom-processor");
await conductor.flow.run(savedFlow, {
  input: { file: "production-data.csv" },
});
```

### Batch Execution

```typescript
// Execute multiple flows in parallel
async function executeBatch(
  flowIds: string[],
  inputs: Record<string, unknown>[],
) {
  const flows = await Promise.all(
    flowIds.map((id) => conductor.flow.loadFlow(id)),
  );

  const results = await Promise.all(
    flows.map((flow, i) => conductor.flow.run(flow, { input: inputs[i] })),
  );

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(
    `Batch complete: ${successful.length} succeeded, ${failed.length} failed`,
  );

  return { successful, failed };
}

// Usage
const { successful, failed } = await executeBatch(
  ["flow-1", "flow-2", "flow-3"],
  [{ data: "a" }, { data: "b" }, { data: "c" }],
);
```

### Environment-Aware Code

```typescript
import { conductor } from '@atomiton/conductor/browser';

// Check environment
const env = conductor.getEnvironment();

if (conductor.inDesktop) {
  console.log('Running in Electron desktop app');
  console.log('Has IPC transport:', env.hasTransport);

  // Desktop-specific features
  await conductor.system.restart();
} else if (conductor.inBrowser) {
  console.log('Running in web browser');
  console.log('Has HTTP transport:', env.hasTransport);

  // Browser-specific features
  if (!env.hasTransport) {
    console.warn('No backend connection - limited functionality');
  }
}

// Conditional rendering
function AppLayout() {
  if (conductor.inDesktop) {
    return <DesktopLayout />;
  }
  return <WebLayout />;
}
```

## Performance Optimization

### Lazy Loading Flows

```typescript
// Don't load all flows upfront
const flows = await conductor.storage.listFlows();

// Load flow definition only when needed
async function executeSelectedFlow(flowId: string) {
  const flow = await conductor.storage.loadFlow(flowId);
  return conductor.flow.run(flow, { input: {} });
}
```

### Debouncing Saves

```typescript
import { debounce } from 'lodash';

// Debounce flow saves to avoid excessive writes
const debouncedSave = debounce(async (flow) => {
  await conductor.storage.saveFlow(flow);
  console.log('Flow saved');
}, 1000);

// Usage in editor
function FlowEditor({ flow, onChange }) {
  const handleChange = (updatedFlow) => {
    onChange(updatedFlow);
    debouncedSave(updatedFlow);
  };

  return <Editor flow={flow} onChange={handleChange} />;
}
```

### Pagination

```typescript
// Load flows in pages
async function loadFlowsPage(page: number, pageSize = 50) {
  const { flows, total } = await conductor.storage.listFlows({
    limit: pageSize,
    offset: page * pageSize,
    sortBy: 'savedAt',
    sortOrder: 'desc'
  });

  return {
    flows,
    total,
    hasMore: (page + 1) * pageSize < total
  };
}

// Infinite scroll implementation
function FlowList() {
  const [page, setPage] = useState(0);
  const [flows, setFlows] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    const { flows: newFlows, hasMore: more } = await loadFlowsPage(page);
    setFlows([...flows, ...newFlows]);
    setHasMore(more);
    setPage(page + 1);
  };

  return (
    <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
      {flows.map(flow => <FlowCard key={flow.id} flow={flow} />)}
    </InfiniteScroll>
  );
}
```

## Error Codes Reference

Complete list of error codes with recovery strategies:

| Error Code                 | Category   | Retryable | Description                     |
| -------------------------- | ---------- | --------- | ------------------------------- |
| `VALIDATION_FAILED`        | Validation | No        | Node validation failed          |
| `INVALID_PARAMETERS`       | Validation | No        | Invalid parameters provided     |
| `INVALID_NODE`             | Validation | No        | Invalid node definition         |
| `MISSING_REQUIRED_FIELD`   | Validation | No        | Required field missing          |
| `TYPE_MISMATCH`            | Validation | No        | Type mismatch in parameters     |
| `EXECUTION_FAILED`         | Execution  | Yes       | General execution failure       |
| `NODE_NOT_FOUND`           | Execution  | No        | Referenced node not found       |
| `NODE_TYPE_NOT_FOUND`      | Execution  | No        | Node type not registered        |
| `IMPLEMENTATION_NOT_FOUND` | Execution  | No        | Node implementation missing     |
| `CIRCULAR_DEPENDENCY`      | Execution  | No        | Circular dependency detected    |
| `NO_EXECUTOR_FACTORY`      | Execution  | No        | Executor factory not configured |
| `TIMEOUT`                  | Runtime    | Yes       | Execution timeout               |
| `CANCELLED`                | Runtime    | No        | Execution cancelled by user     |
| `MEMORY_LIMIT_EXCEEDED`    | Runtime    | No        | Memory limit exceeded           |
| `RATE_LIMIT_EXCEEDED`      | Runtime    | Yes       | Rate limit exceeded             |
| `TRANSPORT_ERROR`          | Transport  | Yes       | Transport communication error   |
| `NO_TRANSPORT`             | Transport  | No        | No transport available          |
| `IPC_COMMUNICATION_FAILED` | Transport  | Yes       | IPC communication failed        |
| `SERIALIZATION_FAILED`     | Transport  | No        | Failed to serialize data        |
| `DESERIALIZATION_FAILED`   | Transport  | No        | Failed to deserialize data      |
| `INTERNAL_ERROR`           | System     | No        | Internal system error           |
| `UNKNOWN_ERROR`            | System     | No        | Unknown error occurred          |

### Error Code Handling Example

```typescript
const result = await conductor.node.run(node);

if (!result.success && result.error) {
  switch (result.error.code) {
    case ErrorCode.TIMEOUT:
      console.error("Execution timed out - consider increasing timeout");
      // Retry with longer timeout
      break;

    case ErrorCode.RATE_LIMIT_EXCEEDED:
      console.error("Rate limit exceeded - waiting before retry");
      // Wait and retry
      await new Promise((resolve) => setTimeout(resolve, 5000));
      break;

    case ErrorCode.INVALID_PARAMETERS:
      console.error("Invalid parameters:", result.error.message);
      // Fix parameters and retry
      break;

    case ErrorCode.NO_TRANSPORT:
      console.error("No transport available - check connection");
      // Prompt user to check connection
      break;

    default:
      console.error("Unexpected error:", result.error.code);
  }
}
```

## Type Imports Reference

Quick reference for importing conductor types:

```typescript
// Main conductor instance
import { conductor } from "@atomiton/conductor/browser";

// Factory function
import { createConductor } from "@atomiton/conductor/browser";

// Execution types
import type {
  ExecutionResult,
  ExecutionError,
  ConductorExecutionContext,
  ExecutionStatus,
} from "@atomiton/conductor/browser";

// Event types
import type {
  NodeProgressEvent,
  NodeCompleteEvent,
  NodeErrorEvent,
  FlowSavedEvent,
} from "@atomiton/conductor/browser";

// Error types
import { ErrorCode } from "@atomiton/conductor/browser";
import type { ErrorRecoveryStrategy } from "@atomiton/conductor/browser";

// Progress event types
import type {
  ProgressEvent,
  ProgressNodeSnapshot,
  ProgressGraphMetadata,
} from "@atomiton/conductor/browser";

// Validation
import { isValidProgressEvent } from "@atomiton/conductor/browser";

// Branded types
import { createExecutionId, toExecutionId } from "@atomiton/conductor/browser";
import type { ExecutionId } from "@atomiton/conductor/browser";

// Constants
import { DEFAULT_SLOWMO_MS } from "@atomiton/conductor/browser";
```

## Related Documentation

- **[Transport Architecture](./TRANSPORT_ARCHITECTURE.md)** - Detailed transport
  layer implementation
- **[Electron Integration](./ELECTRON_ARCHITECTURE.md)** - Electron-specific
  integration patterns
- **[Storage Architecture](./STORAGE.md)** - Flow persistence and storage
  engines
- **[BENTO_BOX Implementation](./BENTO_BOX_IMPLEMENTATION.md)** - Simplicity
  principles in practice

---

The conductor API exemplifies our BENTO_BOX_PRINCIPLE: one simple, unified
interface that works everywhere, with complexity hidden behind clean
abstractions.
