# Blueprint Execution Architecture

## Overview

The Blueprint execution system is responsible for storing, loading, and executing visual workflows created in the Blueprint editor. This architecture defines how we persist Blueprint definitions, manage execution state, handle data flow between nodes, and scale execution across different deployment scenarios.

A critical feature is that **Blueprints can be nodes themselves** - any Blueprint can be packaged and used as a reusable node within other Blueprints, enabling powerful composition and abstraction.

**Status**: 📋 **PLANNED** - Architecture design phase

## Core Requirements

### Storage & Persistence

- Store Blueprint definitions in human-readable format (JSON or YAML)
- Version control for Blueprint changes
- **Desktop-first**: Local file system as primary storage
- Git-friendly format for version control
- Export/import capabilities for sharing workflows
- Zero-cost storage solution for MVP

### Execution Engine

- Stream-based processing for memory efficiency
- Support for both synchronous and asynchronous node execution
- **Nested Blueprint execution** - Blueprints as reusable nodes
- Error handling and retry mechanisms
- Execution history and logging
- Real-time progress monitoring

### Scalability

- **Desktop-first**: Single-process execution optimized for Electron
- In-memory queue for local task management
- Optional cloud sync (future enhancement)
- No external dependencies for MVP (no Redis, no database required)

## Storage Format Decision: JSON vs YAML

### Comparison Matrix

| Aspect                | JSON                       | YAML                           |
| --------------------- | -------------------------- | ------------------------------ |
| **Human Readability** | Good, but verbose          | Excellent, cleaner syntax      |
| **Git Diffs**         | Noisier (brackets, quotes) | Cleaner, easier to review      |
| **Comments**          | ❌ Not supported           | ✅ Native support              |
| **File Size**         | Larger (more syntax)       | ~30% smaller                   |
| **Parse Speed**       | Faster (native)            | Slower (needs parser)          |
| **Ecosystem**         | Universal support          | Good support, extra dependency |
| **Schema Validation** | JSON Schema                | Can use JSON Schema            |
| **Type Safety**       | Direct TypeScript types    | Needs conversion               |

### Recommendation: **YAML for Storage, JSON for Runtime**

```yaml
# blueprint.yaml - Human-friendly storage format
name: DataProcessingPipeline
version: 1.0.0
description: Processes CSV files and sends to API

nodes:
  - id: csv-reader
    type: core/csv-reader
    position: { x: 100, y: 200 }
    config:
      hasHeader: true
      delimiter: ","

  - id: data-transform
    type: blueprint/custom-transformer # Another Blueprint as node!
    position: { x: 300, y: 200 }
    config:
      blueprintId: "transforms/normalize-data"

connections:
  - source: { node: csv-reader, output: data }
    target: { node: data-transform, input: data }
```

**Why This Approach:**

1. YAML for human editing and Git storage
2. Convert to JSON in-memory for execution
3. Comments for documentation
4. Cleaner diffs for code review

## Architecture Components

### 1. Blueprint Storage Layer (Desktop-First)

```
┌─────────────────────────────────────────┐
│         Blueprint Storage API            │
├─────────────────────────────────────────┤
│  - save(blueprint: Blueprint)            │
│  - load(id: string): Blueprint           │
│  - list(): BlueprintMetadata[]           │
│  - delete(id: string)                    │
│  - version(id: string, changes: Delta)   │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│        Local FileSystem Storage          │
├─────────────────────────────────────────┤
│  Default: ~/Atomiton/Blueprints/         │
│  Format: .blueprint.yaml files           │
│  Optional: Git auto-commit               │
└─────────────────────────────────────────┘
```

**Desktop Storage Strategy:**

```typescript
// Zero-cost, local-first storage
class DesktopBlueprintStorage {
  private blueprintDir = path.join(os.homedir(), "Atomiton", "Blueprints");

  async save(blueprint: Blueprint) {
    const yaml = stringify(blueprint);
    const filepath = path.join(
      this.blueprintDir,
      `${blueprint.id}.blueprint.yaml`,
    );
    await fs.writeFile(filepath, yaml);

    // Optional: Auto-commit to Git
    if (this.gitEnabled) {
      await this.gitCommit(filepath, `Update ${blueprint.name}`);
    }
  }

  async load(id: string): Blueprint {
    const filepath = path.join(this.blueprintDir, `${id}.blueprint.yaml`);
    const yaml = await fs.readFile(filepath, "utf-8");
    return parse(yaml);
  }
}
```

#### Storage Formats

**Unified Type Hierarchy** - Blueprints extend Node types:

```typescript
import { INode, NodeDefinition, NodeExecutionContext } from "@atomiton/nodes";

/**
 * Blueprint extends NodeDefinition
 * A Blueprint IS a Node, with additional workflow properties
 */
interface BlueprintDefinition extends NodeDefinition {
  // Inherited from NodeDefinition:
  // id, name, description, category, type, version
  // inputPorts, outputPorts, icon, defaultConfig, configSchema

  // Blueprint-specific additions:
  nodes: BlueprintNodeInstance[]; // Nodes inside this Blueprint
  connections: ConnectionDefinition[]; // Connections between nodes
  settings?: BlueprintSettings;

  // Blueprint interface (defines its behavior as a node)
  interface: {
    inputs: NodePortDefinition[];
    outputs: NodePortDefinition[];
  };
}

/**
 * Node instance within a Blueprint
 * Can be a regular node OR another Blueprint
 */
interface BlueprintNodeInstance {
  id: string; // Instance ID (unique within Blueprint)
  type: string; // Node type (e.g., 'csv-reader' or 'blueprint/my-workflow')
  position: { x: number; y: number };
  config: Record<string, any>;
  disabled?: boolean;
}

interface ConnectionDefinition {
  id: string;
  source: {
    nodeId: string; // 'input' for Blueprint input ports
    port: string;
  };
  target: {
    nodeId: string; // 'output' for Blueprint output ports
    port: string;
  };
}

/**
 * Type guards to distinguish Blueprints from regular Nodes
 */
function isBlueprint(node: INode): node is BlueprintNode {
  return node.metadata.type === "blueprint";
}

function isBlueprintDefinition(
  def: NodeDefinition,
): def is BlueprintDefinition {
  return def.type === "blueprint" && "nodes" in def && "connections" in def;
}
```

#### Storage Backends

1. **File System Storage** (Development/Simple Deployments)
   - Store as `.blueprint.json` files
   - Git-friendly for version control
   - Simple backup/restore via file copy

2. **Database Storage** (Production)
   - PostgreSQL/MySQL with JSON columns
   - Better for multi-user environments
   - Supports advanced querying and indexing

3. **Hybrid Approach** (Recommended)
   - Database for metadata and active workflows
   - File system/S3 for version history and backups
   - Cache layer for frequently accessed Blueprints

### 2. Unified Node/Blueprint Architecture

**Key Insight**: Blueprints ARE Nodes - they extend the same base `Node` class from `@atomiton/nodes`.

```typescript
import {
  Node,
  INode,
  INodeConfig,
  INodeLogic,
  NodeDefinition,
} from "@atomiton/nodes";

/**
 * BlueprintNode extends the base Node class
 * This allows any Blueprint to be used as a node in another Blueprint
 */
export class BlueprintNode extends Node<BlueprintConfig> {
  readonly metadata = {
    id: this.blueprintId,
    name: this.blueprintName,
    version: this.blueprintVersion,
    category: "blueprint",
    type: "blueprint",
    description: "Reusable Blueprint workflow",
  };

  readonly config: INodeConfig<BlueprintConfig> = {
    schema: z.object({
      blueprintPath: z.string(), // Path to .blueprint.yaml file
      inputMapping: z.record(z.string()).optional(),
      outputMapping: z.record(z.string()).optional(),
    }),
    defaults: {
      blueprintPath: "",
    },
  };

  readonly logic: INodeLogic<BlueprintConfig> = new BlueprintNodeLogic();

  readonly definition: NodeDefinition = {
    id: this.blueprintId,
    name: this.blueprintName,
    category: "blueprint",
    type: "blueprint",
    // Ports are dynamically generated from the Blueprint's interface
    inputPorts: this.blueprintInterface.inputs,
    outputPorts: this.blueprintInterface.outputs,
  };
}

/**
 * BlueprintNodeLogic handles execution of Blueprints as nodes
 */
class BlueprintNodeLogic implements INodeLogic<BlueprintConfig> {
  async execute(
    context: NodeExecutionContext,
    config: BlueprintConfig,
  ): Promise<NodeExecutionResult> {
    // Load the Blueprint definition
    const blueprint = await this.loadBlueprint(config.blueprintPath);

    // Create sub-execution context (Blueprint is just another node)
    const subContext: NodeExecutionContext = {
      ...context,
      blueprintId: blueprint.id,
      metadata: {
        ...context.metadata,
        parentExecution: context.nodeId,
        depth: (context.metadata?.depth || 0) + 1,
      },
    };

    // Execute the Blueprint using the standard execution engine
    const engine = new ExecutionEngine();
    return engine.executeBlueprint(blueprint, subContext);
  }
}
```

**Blueprint Storage Format (YAML) - Now explicitly a Node extension:**

```yaml
# my-workflow.blueprint.yaml
extends: "@atomiton/nodes/Node" # Explicit inheritance
id: "my-workflow"
name: "Data Processing Workflow"
version: "1.0.0"
category: "blueprint"
type: "blueprint"

# Define the interface (ports) for this Blueprint-as-Node
interface:
  inputs:
    - id: csvFile
      name: CSV File
      dataType: file
      required: true
  outputs:
    - id: processedData
      name: Processed Data
      dataType: json

# Internal workflow definition
nodes:
  - id: csv-reader
    type: "@atomiton/nodes/csv-reader" # Standard node
    position: { x: 100, y: 200 }

  - id: data-cleaner
    type: "blueprint/data-cleaner" # Another Blueprint as node!
    position: { x: 300, y: 200 }

connections:
  - source: { node: input, port: csvFile }
    target: { node: csv-reader, port: file }
  - source: { node: csv-reader, port: data }
    target: { node: data-cleaner, port: input }
  - source: { node: data-cleaner, port: output }
    target: { node: output, port: processedData }
```

**Benefits of Unified Architecture:**

1. **No Special Cases** - Blueprints use the exact same interfaces as regular nodes
2. **Type Safety** - Full TypeScript support through INode interface
3. **Composition** - Infinite nesting without special handling
4. **Testing** - Test Blueprints using the same framework as nodes
5. **Registry** - Blueprints register in the same node registry

### 3. Execution Engine (Desktop-Optimized)

```
┌─────────────────────────────────────────┐
│     Desktop Execution Orchestrator       │
├─────────────────────────────────────────┤
│  - execute(blueprint: Blueprint)         │
│  - executeNested(blueprintId: string)    │
│  - pause(executionId: string)            │
│  - resume(executionId: string)           │
│  - cancel(executionId: string)           │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│  Node     │ │  Data    │ │  State   │
│ Executor  │ │  Router  │ │ Manager  │
└──────────┘ └──────────┘ └──────────┘
```

#### Execution Flow

1. **Blueprint Loading**

   ```typescript
   class ExecutionEngine {
     async execute(blueprintId: string, input?: ExecutionInput) {
       const blueprint = await this.storage.load(blueprintId);
       const execution = new Execution(blueprint, input);

       // Create execution context
       const context = {
         id: generateExecutionId(),
         startTime: new Date(),
         status: "running",
         blueprint: blueprint,
         state: new Map(),
       };

       return this.runExecution(context);
     }
   }
   ```

2. **Node Execution Strategy**

   ```typescript
   interface INodeExecutor {
     execute(
       node: NodeDefinition,
       input: NodeInput,
       context: ExecutionContext,
     ): Promise<NodeOutput>;
   }

   class StreamingNodeExecutor implements INodeExecutor {
     async execute(node, input, context) {
       const nodeInstance = this.nodeRegistry.get(node.type);

       // Stream processing for memory efficiency
       const inputStream = createReadStream(input);
       const outputStream = createWriteStream();

       await nodeInstance.process(
         inputStream,
         outputStream,
         node.config,
         context,
       );

       return outputStream.getData();
     }
   }
   ```

3. **Data Flow Between Nodes**

   ```typescript
   interface NodeData {
     items: DataItem[];
     metadata?: Record<string, any>;
   }

   interface DataItem {
     json: Record<string, any>;
     binary?: Record<string, Buffer>;
   }
   ```

#### Execution Modes (Desktop-First)

1. **Local Mode** (MVP/Default)
   - Executes in Electron renderer or main process
   - In-memory queue using p-queue
   - No external dependencies
   - Perfect for desktop users

```typescript
// Desktop-optimized local execution
class LocalExecutionEngine {
  private queue = new PQueue({ concurrency: 4 });
  private executions = new Map<string, ExecutionState>();

  async execute(blueprintId: string, input?: ExecutionInput) {
    const executionId = generateId();

    // Add to in-memory queue
    const task = this.queue.add(async () => {
      const blueprint = await this.storage.load(blueprintId);
      return this.runBlueprint(blueprint, input);
    });

    this.executions.set(executionId, {
      id: executionId,
      blueprintId,
      status: "queued",
      task,
    });

    return { executionId, status: "queued" };
  }
}
```

2. **Future: Cloud Mode** (Post-MVP)
   - Optional cloud sync for collaboration
   - Remote execution for heavy workloads
   - Pay-per-use model for enterprise features

### 3. Execution State Management

```typescript
interface ExecutionState {
  id: string;
  blueprintId: string;
  status: "pending" | "running" | "paused" | "completed" | "failed";
  startTime: Date;
  endTime?: Date;
  currentNode?: string;
  nodeStates: Map<string, NodeExecutionState>;
  data: Map<string, NodeData>;
  errors?: ExecutionError[];
}

interface NodeExecutionState {
  nodeId: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  startTime?: Date;
  endTime?: Date;
  retryCount: number;
  error?: Error;
}
```

### 4. Error Handling & Recovery

```typescript
class ExecutionErrorHandler {
  async handleNodeError(
    error: Error,
    node: NodeDefinition,
    context: ExecutionContext,
  ): Promise<ErrorRecoveryAction> {
    const strategy = this.getErrorStrategy(node);

    switch (strategy) {
      case "retry":
        return this.scheduleRetry(node, context);

      case "continue":
        return this.continueWithDefault(node, context);

      case "fail":
        return this.failExecution(context, error);

      case "branch":
        return this.executeErrorBranch(node, context);
    }
  }
}
```

## Implementation Phases (Desktop-First MVP)

### Phase 1: Local Storage & Basic Execution (Week 1-2)

- [ ] YAML-based Blueprint storage in ~/Atomiton/Blueprints
- [ ] File watcher for auto-reload
- [ ] Simple synchronous execution engine
- [ ] Basic error handling
- [ ] Blueprint-as-node support

### Phase 2: Enhanced Local Features (Week 3-4)

- [ ] Local execution history (SQLite or JSON log)
- [ ] Streaming data processing
- [ ] In-memory queue with p-queue
- [ ] Pause/resume capabilities
- [ ] Blueprint composition UI

### Phase 3: Polish & Performance (Week 5-6)

- [ ] Execution performance monitoring
- [ ] Blueprint marketplace preparation
- [ ] Export/import with dependencies
- [ ] Optional Git integration
- [ ] Blueprint validation & testing tools

## Technology Choices (Desktop-First)

### Storage

- **MVP/Primary**: Local file system with YAML
- **Execution Cache**: In-memory Map
- **History**: SQLite or JSON logs
- **Future**: Optional PostgreSQL for teams

### Queue System

- **MVP**: p-queue (in-memory, zero dependencies)
- **Future Cloud**: Redis with Bull/BullMQ
- **No RabbitMQ**: Too heavy for desktop

### Monitoring

- **Metrics**: Prometheus-compatible
- **Logging**: Structured JSON logs
- **Tracing**: OpenTelemetry support

## Performance Considerations

### Memory Management

- Stream processing for large datasets
- Lazy loading of node implementations
- Garbage collection optimization
- Memory limits per execution

### Concurrency Control

- Configurable execution limits
- Resource pooling for expensive operations
- Backpressure handling in queues

### Optimization Strategies

- Node output caching for deterministic nodes
- Parallel execution for independent branches
- Compiled execution plans for frequently-run Blueprints

## Security Considerations

### Execution Isolation

- Sandboxed node execution environment
- Resource limits (CPU, memory, time)
- Network access controls

### Data Protection

- Encryption at rest for stored Blueprints
- Secure credential management
- Audit logging for all executions

## Comparison with n8n

### What We'll Do Similarly

- Node-based execution model
- Queue mode for scaling (when needed)
- Execution history tracking
- Visual workflow editor

### What We'll Do Better

- **Unified Architecture**: Blueprints ARE Nodes (not a special case)
- **True Composition**: Infinite nesting without special handling
- **Stream Processing**: Lower memory footprint
- **Desktop-First**: Local file storage, no infrastructure needed
- **Better TypeScript**: Blueprints use the same INode interface
- **YAML Storage**: Human-readable with comments, better for Git

### What We'll Simplify

- No complex expression language initially (just JavaScript)
- Single execution model (Blueprints execute like any other node)
- No database required for MVP
- No built-in scheduling (use OS schedulers or cron)

## Next Steps

1. **Prototype Development**
   - Build proof-of-concept execution engine
   - Test with simple workflows
   - Benchmark performance

2. **Storage Implementation**
   - Implement file-based storage
   - Design database schema
   - Build import/export functionality

3. **Integration Planning**
   - Connect with existing editor
   - Design execution UI/monitoring
   - Plan API endpoints

## References

- n8n Architecture: [docs.n8n.io/hosting/architecture](https://docs.n8n.io/hosting/architecture)
- n8n Database Structure: [docs.n8n.io/hosting/architecture/database-structure](https://docs.n8n.io/hosting/architecture/database-structure)
- Our Node System: [NODE_CONFIGURATION_SYSTEM.md](./NODE_CONFIGURATION_SYSTEM.md)
- Project Roadmap: [/docs/project/ROADMAP.md](../project/ROADMAP.md)

---

**Last Updated**: 2025-01-11
**Status**: Architecture Planning Phase
