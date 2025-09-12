# Execution Engine Strategy

## Current State

**No execution engine exists yet** - we have node definitions and logic but no orchestration layer that executes Blueprints/workflows.

Currently, nodes like `ShellCommandNodeLogic` use Node.js APIs (`child_process`) directly, indicating execution happens in Node.js environment, not the browser.

## Architecture Decision: Where Should Execution Live?

### Option 1: Electron Main Process (Node.js) ✅ RECOMMENDED

**Architecture:**

```
Browser (Renderer)          Electron Main           Node.js Runtime
┌──────────────┐   IPC    ┌──────────────┐       ┌──────────────┐
│   Editor UI  │ ──────>  │  Execution   │ ────> │ Native APIs  │
│   (React)    │ <──────  │   Engine     │       │ (fs, spawn)  │
└──────────────┘          └──────────────┘       └──────────────┘
```

**Pros:**

- Full Node.js API access (file system, child processes, native modules)
- Can leverage high-performance libraries (Rust via NAPI, C++ addons)
- Direct OS integration for desktop features
- Security: execution isolated from renderer
- Can use Worker Threads for parallel execution

**Cons:**

- IPC overhead between renderer and main process
- Harder to deploy to web (would need separate backend)

**Implementation:**

```typescript
// packages/@atomiton/execution-engine (new package)
// Runs in Electron main process
export class DesktopExecutionEngine {
  private workers = new WorkerPool();

  async executeBlueprint(blueprint: BlueprintDefinition) {
    // Orchestrate node execution in Node.js environment
    // Full access to: fs, child_process, native modules
  }
}
```

### Option 2: Browser with WebAssembly/Web Workers

**Architecture:**

```
Browser Only
┌─────────────────────────────────────┐
│  Editor UI + Execution Engine       │
│  ┌──────────┐  ┌─────────────────┐ │
│  │ React UI │  │ WASM Execution  │ │
│  └──────────┘  │   Engine        │ │
│                └─────────────────┘ │
└─────────────────────────────────────┘
```

**Pros:**

- Single deployment target (pure web app)
- Could run entirely in browser for simple workflows
- WebAssembly for performance-critical parts

**Cons:**

- No file system access (without File API limitations)
- No shell command execution
- No native module support
- Limited to browser sandbox

### Option 3: Hybrid Approach (Progressive Enhancement) 🎯

**Best of both worlds:**

```typescript
// Abstract execution interface
interface IExecutionEngine {
  execute(blueprint: Blueprint): Promise<ExecutionResult>;
}

// Desktop implementation (full power)
class DesktopExecutionEngine implements IExecutionEngine {
  // Uses Node.js, native modules, full OS access
}

// Browser implementation (limited but portable)
class BrowserExecutionEngine implements IExecutionEngine {
  // WebAssembly, Web Workers, limited to browser APIs
}

// Future cloud implementation
class CloudExecutionEngine implements IExecutionEngine {
  // Delegates to remote servers
}
```

## Technology Recommendations for Desktop-First

### 1. Core Engine: TypeScript/Node.js

- Primary language for orchestration logic
- Good enough performance for most workflows
- Seamless integration with existing node system

### 2. Performance-Critical Nodes: Rust via NAPI

```rust
// packages/@atomiton/native-nodes
#[napi]
pub fn process_large_csv(path: String) -> Result<DataFrame> {
  // Rust for data processing nodes
  // 10-100x faster than JavaScript for heavy computation
}
```

### 3. Parallel Execution: Worker Threads

```typescript
// Use Node.js Worker Threads for parallel node execution
import { Worker } from "worker_threads";

class ParallelExecutor {
  private workers: Worker[] = [];

  async executeNode(node: INode) {
    return new Promise((resolve) => {
      const worker = new Worker("./node-executor.js", {
        workerData: { node },
      });
      worker.on("message", resolve);
    });
  }
}
```

### 4. Future Optimizations

**WebAssembly Modules** (for both desktop and web):

```typescript
// Compile performance-critical paths to WASM
import initWasm from "@atomiton/wasm-engine";

const wasmEngine = await initWasm();
wasmEngine.executeDataTransform(data);
```

**GPU Acceleration** (via WebGPU/CUDA):

```typescript
// For ML/AI nodes, image processing
import { GPUExecutor } from "@atomiton/gpu-nodes";

const gpuExecutor = new GPUExecutor();
await gpuExecutor.runImageComposite(images);
```

## Migration Path

### Phase 1: MVP (Desktop Node.js)

```
Week 1-2: Build basic execution engine in TypeScript
- Run in Electron main process
- Execute nodes sequentially
- Use existing Node.js node implementations
```

### Phase 2: Performance (Native Modules)

```
Week 3-4: Add Rust nodes for performance
- CSV processing in Rust
- Data transformation in Rust
- Keep orchestration in TypeScript
```

### Phase 3: Scalability (Workers + Cloud-Ready)

```
Week 5-6: Add parallelization
- Worker threads for parallel nodes
- Abstract execution interface
- Prepare for cloud deployment
```

## Desktop vs Cloud Architecture

### Desktop (Current Focus)

```yaml
execution:
  location: electron-main
  language: typescript
  performance:
    - worker-threads for parallelism
    - rust via napi for computation
    - wasm for portable performance
  storage: local-filesystem
  queue: in-memory (p-queue)
```

### Cloud (Future)

```yaml
execution:
  location: kubernetes-cluster
  language: typescript + rust
  performance:
    - horizontal scaling via k8s
    - gpu nodes for ml workloads
    - distributed queue (redis/rabbitmq)
  storage: s3 + postgresql
  queue: redis with bull
```

## Decision: Electron Main Process with Progressive Enhancement

**Why this approach:**

1. **Desktop-First Performance**: Full Node.js access for file operations, shell commands, native modules
2. **Security**: Execution isolated from renderer process
3. **Future-Proof**: Abstract interface allows browser/cloud implementations later
4. **Incremental Optimization**: Start with TypeScript, add Rust/WASM as needed
5. **User Experience**: No latency from network calls, works offline

**Implementation Priority:**

1. TypeScript execution engine in Electron main process
2. IPC communication layer with renderer
3. Worker thread pool for parallelization
4. Rust modules for performance-critical nodes (optional)
5. Abstract interface for future web/cloud deployment

## Multi-Language Node Architecture

### Node Definition with Runtime Specification

All nodes are **defined** in `@atomiton/nodes` (TypeScript) but specify their **runtime**:

```typescript
// packages/@atomiton/nodes/src/base/INodeMetadata.ts
export interface INodeMetadata {
  id: string;
  name: string;
  version: string;
  category: string;

  // Runtime specification
  runtime: {
    language: "typescript" | "rust" | "python" | "wasm" | "golang";
    module?: string; // Path to native module or WASM file
    handler?: string; // Function name in native module
  };

  // Performance hints
  performance?: {
    preferGPU?: boolean;
    streamable?: boolean;
    parallelizable?: boolean;
  };
}
```

### Example Node Definitions

```typescript
// packages/@atomiton/nodes/src/nodes/csv-reader/CSVReaderNode.ts
export class CSVReaderNode extends Node {
  readonly metadata = {
    id: "csv-reader",
    name: "CSV Reader",
    runtime: {
      language: "typescript", // Simple CSV: TypeScript is fine
    },
  };

  readonly logic = new CSVReaderLogic(); // TypeScript implementation
}

// packages/@atomiton/nodes/src/nodes/large-csv-processor/LargeCSVProcessorNode.ts
export class LargeCSVProcessorNode extends Node {
  readonly metadata = {
    id: "large-csv-processor",
    name: "Large CSV Processor",
    runtime: {
      language: "rust", // Heavy processing: Use Rust
      module: "@atomiton/native-nodes",
      handler: "process_large_csv",
    },
    performance: {
      streamable: true,
      parallelizable: true,
    },
  };

  // Logic is just a proxy that delegates to Rust
  readonly logic = new NativeProxyLogic("process_large_csv");
}

// packages/@atomiton/nodes/src/nodes/ml-inference/MLInferenceNode.ts
export class MLInferenceNode extends Node {
  readonly metadata = {
    id: "ml-inference",
    name: "ML Inference",
    runtime: {
      language: "python", // ML: Use Python
      module: "@atomiton/python-nodes",
      handler: "run_inference",
    },
    performance: {
      preferGPU: true,
    },
  };

  readonly logic = new PythonProxyLogic("run_inference");
}
```

### Execution Engine Runtime Router

```typescript
// packages/@atomiton/execution-engine/src/RuntimeRouter.ts
export class RuntimeRouter {
  private runtimes: Map<string, INodeRuntime> = new Map();

  constructor() {
    // Register available runtimes
    this.runtimes.set("typescript", new TypeScriptRuntime());
    this.runtimes.set("rust", new RustRuntime());
    this.runtimes.set("python", new PythonRuntime());
    this.runtimes.set("wasm", new WasmRuntime());
    this.runtimes.set("golang", new GoRuntime());
  }

  async executeNode(
    node: INode,
    context: NodeExecutionContext,
  ): Promise<NodeExecutionResult> {
    const runtime = this.runtimes.get(node.metadata.runtime.language);

    if (!runtime) {
      throw new Error(
        `No runtime available for ${node.metadata.runtime.language}`,
      );
    }

    // Route to appropriate runtime
    return runtime.execute(node, context);
  }
}

// Different runtime implementations
class TypeScriptRuntime implements INodeRuntime {
  async execute(node: INode, context: NodeExecutionContext) {
    // Direct execution in Node.js
    return node.logic.execute(context);
  }
}

class RustRuntime implements INodeRuntime {
  private nativeModule: any;

  async initialize() {
    // Load Rust module via NAPI
    this.nativeModule = await import("@atomiton/native-nodes");
  }

  async execute(node: INode, context: NodeExecutionContext) {
    const handler = node.metadata.runtime.handler;
    return this.nativeModule[handler](context);
  }
}

class PythonRuntime implements INodeRuntime {
  async execute(node: INode, context: NodeExecutionContext) {
    // Use python-shell or Pyodide (WASM Python)
    const { PythonShell } = await import("python-shell");
    return PythonShell.run(node.metadata.runtime.module, context);
  }
}

class WasmRuntime implements INodeRuntime {
  private wasmModules: Map<string, WebAssembly.Module> = new Map();

  async execute(node: INode, context: NodeExecutionContext) {
    // Load and execute WASM module
    const module = await this.loadWasmModule(node.metadata.runtime.module);
    return module.exports[node.metadata.runtime.handler](context);
  }
}
```

## Benefits of This Architecture

1. **Single Source of Truth**: All node definitions in `@atomiton/nodes`
2. **Clean Separation**: Node specification vs implementation
3. **Progressive Performance**: Start with TypeScript, optimize with Rust/WASM later
4. **Language Flexibility**: Use the best language for each task
5. **Easy Testing**: Mock different runtimes for testing

## Code Organization

```
packages/
├── @atomiton/nodes/              # All node DEFINITIONS (TypeScript)
│   ├── src/
│   │   ├── base/                # Base classes with runtime spec
│   │   └── nodes/               # All node definitions
│   │       ├── csv-reader/      # TypeScript implementation
│   │       ├── large-csv/       # Rust implementation (via proxy)
│   │       └── ml-inference/    # Python implementation (via proxy)
│   └── package.json
│
├── @atomiton/execution-engine/   # Runtime router & orchestration
│   ├── src/
│   │   ├── RuntimeRouter.ts    # Routes nodes to correct runtime
│   │   ├── runtimes/           # Runtime implementations
│   │   │   ├── TypeScriptRuntime.ts
│   │   │   ├── RustRuntime.ts
│   │   │   ├── PythonRuntime.ts
│   │   │   └── WasmRuntime.ts
│   │   └── DesktopEngine.ts
│   └── package.json
│
├── @atomiton/native-nodes/       # Rust implementations
│   ├── src/
│   │   └── lib.rs              # Rust node implementations
│   ├── Cargo.toml
│   └── index.node              # Compiled NAPI module
│
├── @atomiton/python-nodes/       # Python implementations
│   ├── src/
│   │   └── nodes.py            # Python node implementations
│   └── package.json
│
└── @atomiton/wasm-nodes/         # WASM implementations
    ├── src/
    │   └── lib.rs              # Rust → WASM
    └── pkg/                    # Compiled WASM modules
```

## Next Steps

1. **Create `@atomiton/execution-engine` package**
2. **Implement basic `DesktopExecutionEngine` class**
3. **Set up IPC bridge for renderer ↔ main communication**
4. **Test with simple Blueprint execution**
5. **Add Worker Thread pool for parallel nodes**

---

**Decision Date**: 2025-01-11
**Status**: Architecture Approved, Implementation Pending
