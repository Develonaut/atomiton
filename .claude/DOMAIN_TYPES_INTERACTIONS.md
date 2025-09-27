# Domain Types & Interactions Map

## Core Domain Types Overview

This document maps out the core types defined by each domain and shows how they
flow through the system, with the key insight that **everything is built on Node
as the fundamental type**.

## 🎯 Core Domain Types

### 1. Nodes Domain (`@atomiton/nodes`) - THE FOUNDATION

**Purpose**: Defines the fundamental Node type and node definitions

```typescript
// The universal Node type - EVERYTHING is a node
Node {
  id: string;
  type: string;
  version?: string;

  // Instance data
  position?: Position;
  config?: Record<string, any>;
  label?: string;

  // Composite nodes have these
  nodes?: Node[];           // Child nodes (makes it composite)
  connections?: Connection[]; // How children connect

  // Metadata
  metadata?: NodeMetadata;
}

// Connection between nodes
Connection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// Node type definitions (like classes)
NodeDefinition {
  type: string;           // 'httpRequest', 'transform', etc.
  version: string;
  category: string;

  // Schema and validation
  configSchema: Schema;
  inputPorts?: PortDefinition[];
  outputPorts?: PortDefinition[];

  // Execution
  execute: (context, config) => Promise<Result>;
}

// Port definitions
PortDefinition {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  multiple?: boolean;
}

// Type guards
isComposite(node): boolean
isAtomic(node): boolean
```

### 2. Flow Domain (`@atomiton/flow`) - MINIMAL LAYER

**Purpose**: Provides flow-specific utilities and aliases

```typescript
import { Node, Connection } from '@atomiton/nodes';

// A Flow is just a type alias for clarity
type Flow = Node;  // A flow IS a node (composite)

// Flow-specific metadata extensions
interface FlowMetadata extends NodeMetadata {
  author?: string;
  entryNodeId?: string;
  exitNodeIds?: string[];
}

// Factory functions
createFlow(params): Flow  // Creates a node with type='flow'

// Type guards (re-export from nodes)
export { isComposite, isAtomic } from '@atomiton/nodes';

// Additional flow-specific guards
isFlow(node: Node): boolean  // Checks if type === 'flow'

// Flow-specific utilities
validateFlow(flow: Flow): ValidationResult
optimizeFlow(flow: Flow): Flow
```

### 3. Conductor Domain (`@atomiton/conductor`) - OWNS EXECUTION

**Purpose**: Executes any Node and owns all execution types

```typescript
import { Node } from '@atomiton/nodes';

// Execution types (owned by conductor)
ExecutionContext {
  nodeId: string;  // Not flowId - any node
  executionId: string;
  variables: Record<string, any>;
  input: any;
  output?: any;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
}

ExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
  duration?: number;
  executedNodes?: string[];
}

ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

ExecutionError {
  nodeId?: string;
  message: string;
  timestamp: Date;
  stack?: string;
}

// Single execution interface
execute(node: Node, context?: Partial<ExecutionContext>): Promise<ExecutionResult>

// Execution is recursive for composite nodes
// - Atomic nodes: Look up NodeDefinition and execute
// - Composite nodes: Execute children in topological order

// Factory
createConductor(config): Conductor
```

### 4. Editor Domain (`@atomiton/editor`)

**Purpose**: Visual representation and editing

```typescript
import { Node, Connection } from '@atomiton/nodes';

// Transform functions (not types)
nodeToReactFlow(node: Node)              // Transform for visualization
reactFlowToNode(reactFlowData)           // Transform back to domain
connectionToEdge(connection: Connection)  // Connection to visual edge
edgeToConnection(edge)                    // Visual edge to connection

// The editor works with Node directly
// No need for separate Flow type
```

### 5. RPC Domain (`@atomiton/rpc`)

**Purpose**: Transport for nodes

```typescript
import { Node } from '@atomiton/nodes';

// Simple transport types
ExecuteRequest {
  node: Node;  // Any node (atomic or composite)
  context?: Record<string, any>
}

ExecuteResponse {
  result: ExecutionResult;
}

// Factories
createExecuteRequest(node: Node)
createExecuteResponse(result: ExecutionResult)
```

### 6. Storage Domain (`@atomiton/storage`)

**Purpose**: Persistence of nodes

```typescript
import { Node } from '@atomiton/nodes';

// Storage types
NodeFile {
  version: string;
  node: Node;  // Can be any node (atomic or composite)
}

StorageAdapter {
  save(node: Node): Promise<void>
  load(id: string): Promise<Node>
  list(): Promise<Node[]>
}
```

## 🔄 Simplified Type Flow

### The Node Hierarchy

```
Level 1: Base Node (@atomiton/nodes)
━━━━━━━━━━━━━━━━━━━━━━
Node (base type)
  ├── id: string
  ├── type: string
  ├── version?: string
  ├── config?: Record<string, any>
  ├── position?: Position
  ├── nodes?: Node[]        // Makes it composite
  └── connections?: Connection[]

Level 2: Flow Utilities (@atomiton/flow)
━━━━━━━━━━━━━━━━━━━━━━
Flow = Node  // Just an alias for composite nodes
  └── Provides flow-specific utilities

Level 3: Execution (@atomiton/conductor)
━━━━━━━━━━━━━━━━━━━━━━
Conductor.execute(node: Node)
  → if isComposite(node): execute children recursively
  → if isAtomic(node): look up NodeDefinition and execute
  → return ExecutionResult

Level 4: Transport (@atomiton/rpc)
━━━━━━━━━━━━━━━━━━━━━━
ExecuteRequest {
  node: Node    // Any node
}
```

## 🎭 Transformation Points

### 1. Storage → Node

```typescript
// Load any node
NodeFile → deserialize → migrate → Node
```

### 2. Node → Editor

```typescript
// Visualize any node
Node → nodeToReactFlow() → ReactFlowData
```

### 3. Editor → Node

```typescript
// Edit produces a node
ReactFlowData → reactFlowToNode() → Node
```

### 4. Node → Execution

```typescript
// Execute any node
conductor.execute(node) → ExecutionResult
```

### 5. Client → Desktop (via RPC)

```typescript
// Simple transport
Node → ExecuteRequest → [RPC] → conductor.execute() → ExecuteResponse
```

## 🔗 Dependencies (UPDATED)

| Domain        | Imports Types From       | Exports Types For | Key Insight                          |
| ------------- | ------------------------ | ----------------- | ------------------------------------ |
| **nodes**     | None (foundation)        | ALL other domains | Defines Node as base type            |
| **flow**      | nodes (Node, Connection) | client, editor    | Provides flow utilities              |
| **conductor** | nodes                    | rpc, client       | Executes nodes, owns execution types |
| **editor**    | nodes                    | client            | Transforms Node ↔ ReactFlow         |
| **rpc**       | nodes                    | client, desktop   | Transports Node                      |
| **storage**   | nodes                    | client, desktop   | Persists Node                        |

## 📊 Type Usage (SIMPLIFIED)

### The Node Pattern

| Type                 | Defined In          | Used By      | Purpose                         |
| -------------------- | ------------------- | ------------ | ------------------------------- |
| **Node**             | @atomiton/nodes     | ALL domains  | Universal base type             |
| **Connection**       | @atomiton/nodes     | flow, editor | Links between nodes             |
| **NodeDefinition**   | @atomiton/nodes     | conductor    | Type definitions (like classes) |
| **ExecutionContext** | @atomiton/conductor | rpc, client  | Execution state                 |
| **ExecutionResult**  | @atomiton/conductor | rpc, client  | Execution output                |

## 🏗️ Key Architecture Simplifications

### 1. Everything is a Node

```typescript
// OLD: Different types
type FlowNode = { ... }
type Flow = { nodes: FlowNode[] }

// NEW: Just Node
type Node = {
  id: string;
  type: string;
  nodes?: Node[];  // Optional - makes it composite
}
```

### 2. Recursive Structure

```typescript
// Nodes can contain nodes can contain nodes...
const megaFlow: Node = {
  type: "flow",
  nodes: [
    {
      type: "flow",
      nodes: [
        {
          type: "flow",
          nodes: [{ type: "httpRequest" }],
        },
      ],
    },
  ],
};
```

### 3. Single Execution Path

```typescript
// Execute ANY node the same way
async function execute(node: Node) {
  if (isAtomic(node)) {
    return executeAtomic(node);
  } else {
    return executeComposite(node);
  }
}
```

### 4. Reusable Flows as Nodes

```typescript
// Save a flow
const savedFlow = await save(myDataProcessingFlow);

// Use it as a node in another flow
const mainFlow: Node = {
  type: "flow",
  nodes: [
    { type: "httpRequest" },
    { type: `saved-flow:${savedFlow.id}` }, // Flow as a node!
  ],
};
```

## 🚦 Type Validation

```typescript
// All validation works on Node
const validateNode = (node: Node): boolean => {
  // Validate base properties
  if (!node.id || !node.type) return false;

  // If composite, validate children
  if (node.nodes) {
    return node.nodes.every(validateNode); // Recursive!
  }

  return true;
};
```

## 📋 Updated Type Governance

### 1. Node is the Foundation

- Everything builds on Node from @atomiton/nodes
- No duplicate type definitions
- Other packages import and extend as needed

### 2. Flow Package Extends, Not Duplicates

- Imports Node from @atomiton/nodes
- Adds execution-specific concepts
- Type Flow = Node (just an alias)

### 3. Conductor Works with Nodes

- Accepts any Node
- Recursively executes composites
- Looks up NodeDefinitions for atomics

### 4. Storage is Simple

- Stores Nodes
- Handles any node type
- Migration works on Node structure

## 🎯 Key Insights from Restructuring

1. **Node is Universal** - Everything is a Node, eliminating special cases
2. **No Duplication** - Types defined once in @atomiton/nodes
3. **Recursive Power** - Nodes containing nodes enables infinite composition
4. **Flows are Nodes** - No special treatment needed
5. **Simpler Mental Model** - One type to understand

## 📈 Adding Features with This Pattern

### Example: Adding "Template" Concept

```typescript
// A Template is just a Node with metadata
interface Template extends Node {
  templateMetadata: {
    category: string;
    description: string;
    parameters: Parameter[];
  };
}

// Still works with everything!
conductor.execute(templateInstance);
```

### Example: Adding "Macro" Nodes

```typescript
// A Macro is just a Node that expands
interface MacroNode extends Node {
  type: "macro";
  expansion: () => Node[]; // Expands to multiple nodes
}

// Still executes normally after expansion
const expanded = macroNode.expansion();
conductor.execute({ type: "flow", nodes: expanded });
```

## Migration Impact

### What Changes:

1. **@atomiton/nodes** becomes the foundation package
2. **Node** is the base type (not Executable)
3. **Flow** is just a type alias for Node
4. **No duplicate type definitions**

### What Stays the Same:

1. Execution patterns
2. Visual transformation logic
3. Storage patterns
4. RPC transport

### What Gets Simpler:

1. Type imports (mostly from @atomiton/nodes)
2. Type definitions (no duplication)
3. Mental model (everything is Node)
4. Recursion (natural with Node structure)

---

**This document reflects the simplified architecture where Node is the
fundamental type and everything else builds on it, eliminating duplication and
creating a more elegant system.**
