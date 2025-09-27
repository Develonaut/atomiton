# Domain Types & Interactions Map

## Core Domain Types Overview

This document maps out the core types defined by each domain and shows how they
flow through the system, with the key insight that **a Flow is just a composite
node**.

## 🎯 Core Domain Types

### 1. Flow Domain (`@atomiton/flow`)

**Purpose**: Defines executable units (both individual nodes and composite
flows)

```typescript
// Everything is executable
Executable                    // Base interface for anything that can run
├── FlowNode                 // Single executable node
└── Flow                     // Composite node containing other nodes

Connection                   // Links between nodes in a flow
FlowMetadata                // Creation/modification tracking

// Type guards
isFlow(executable)          // Check if executable is a flow
isNode(executable)          // Check if executable is a node

// Factories
createFlow()                // Create a new flow
createNode()                // Create a new node
```

### 2. Nodes Domain (`@atomiton/nodes`)

**Purpose**: Defines what specific node types can do

```typescript
// Node implementation types
NodeDefinition              // What a node type is
├── NodeSchema             // Configuration structure
├── NodeExecutable         // How to run it
└── NodeMetadata           // Version, compatibility

NodeExecutionContext        // Runtime context for nodes
NodeExecutionResult         // Output from execution
```

### 3. Conductor Domain (`@atomiton/conductor`)

**Purpose**: Executes any Executable (unified execution)

```typescript
// Single execution interface
execute(executable: Executable)    // Executes anything
ExecutionResult                    // Result from any execution
ExecutionContext                   // Context passed through execution

// Factory
createConductor(config)            // Create configured conductor
```

### 4. Editor Domain (`@atomiton/editor`)

**Purpose**: Visual representation and editing

```typescript
// Transform functions (not types)
flowToReactFlow(flow); // Transform for visualization
reactFlowToFlow(nodes, edges); // Transform back to domain
nodeToReactFlow(node); // Single node transform
edgeToConnection(edge); // Edge to connection transform
```

### 5. RPC Domain (`@atomiton/rpc`)

**Purpose**: Transport for executables

```typescript
// Simple transport types
ExecuteRequest {
  executable: Executable           // Can be Flow OR FlowNode
  context?: Record<string, any>
}
ExecuteResponse                    // Response from execution
Progress                           // Progress updates

// Factories
createExecuteRequest()             // Create request
createExecuteResponse()            // Create response
```

### 6. Storage Domain (`@atomiton/storage`)

**Purpose**: Persistence of executables

```typescript
// Storage types
FlowFile {
  version: string
  executable: Flow                 // Stores flows (composite nodes)
}
StorageAdapter                     // Platform-specific storage
```

## 🔄 Simplified Type Flow

### The Executable Hierarchy

```
Level 1: Base Executable
━━━━━━━━━━━━━━━━━━━━━━
Executable (interface)
  ├── id: string
  ├── type: string
  └── version?: string

Level 2: Concrete Executables
━━━━━━━━━━━━━━━━━━━━━━
FlowNode extends Executable
  └── config, position

Flow extends Executable
  └── type = 'flow'
  └── nodes: FlowNode[]
  └── connections: Connection[]

Level 3: Execution (Unified)
━━━━━━━━━━━━━━━━━━━━━━
Conductor.execute(executable: Executable)
  → if isFlow(executable): execute composite
  → if isNode(executable): execute single
  → return ExecutionResult

Level 4: Transport (Simplified)
━━━━━━━━━━━━━━━━━━━━━━
ExecuteRequest {
  executable: Executable    // Any executable
}
```

## 🎭 Simplified Transformation Points

### 1. Storage → Executable

```typescript
// Load any executable
FlowFile → deserialize → migrate → Executable (Flow or Node)
```

### 2. Executable → Editor

```typescript
// Visualize based on type
if (isFlow(executable)) → flowToReactFlow()
if (isNode(executable)) → nodeToReactFlow()
```

### 3. Editor → Executable

```typescript
// Always produces a Flow (even for single node)
ReactFlowData → reactFlowToFlow() → Flow
```

### 4. Any Executable → Execution

```typescript
// Unified execution
conductor.execute(executable) → ExecutionResult
```

### 5. Client → Desktop (via RPC)

```typescript
// Simple transport
Executable → ExecuteRequest → [RPC] → conductor.execute() → ExecuteResponse
```

## 🔗 Simplified Dependencies

| Domain        | Imports Types From       | Exports Types For | Key Insight                    |
| ------------- | ------------------------ | ----------------- | ------------------------------ |
| **flow**      | None (foundation)        | All other domains | Defines Executable base        |
| **nodes**     | flow (for FlowNode type) | conductor         | Implements specific node types |
| **conductor** | flow (Executable only)   | None              | Executes ANY Executable        |
| **editor**    | flow                     | client            | Transforms, not types          |
| **rpc**       | flow (Executable)        | client, desktop   | Transports Executable          |
| **storage**   | flow                     | client, desktop   | Persists Executables           |

## 📊 Simplified Type Usage

### The Executable Pattern

| Type                | Used By                    | Purpose                             |
| ------------------- | -------------------------- | ----------------------------------- |
| **Executable**      | ALL domains                | Universal execution interface       |
| **Flow**            | conductor, storage, editor | Composite executable (special node) |
| **FlowNode**        | flow, editor               | Single executable unit              |
| **ExecutionResult** | conductor, rpc, client     | Unified result type                 |

## 🏗️ Key Architecture Simplifications

### 1. No Special Treatment for Flows

```typescript
// OLD: Different APIs
conductor.executeFlow(flow);
conductor.executeNode(node);

// NEW: Unified API
conductor.execute(executable); // Works for both!
```

### 2. Type Guards Instead of Complex Logic

```typescript
// Simple type checking
if (isFlow(executable)) {
  // It's a composite node with nodes array
} else if (isNode(executable)) {
  // It's a single node
}
```

### 3. Single Transport Type

```typescript
// OLD: Multiple request types
type ExecuteFlowRequest = ...
type ExecuteNodeRequest = ...

// NEW: One request type
type ExecuteRequest = {
  executable: Executable  // Can be anything
}
```

## 🚦 Validation Simplified

Only one validation point needed:

```typescript
const validateExecutable = (executable: Executable): boolean => {
  if (isFlow(executable)) {
    return executable.nodes.length > 0;
  }
  return isNode(executable);
};
```

## 📋 Updated Type Governance

### 1. Everything is Executable

- Flows and Nodes both implement Executable
- No special cases in APIs

### 2. Conductor is Universal

- One execute method for all
- Type guards handle differences internally

### 3. Transport is Simple

- One request type with Executable
- No need for mode flags

### 4. Storage is Unified

- Store any Executable
- Flows are just Executables with nodes array

## 🎯 Key Insights from Simplification

1. **Flow = Composite Node** - This eliminates special cases everywhere
2. **One Execute API** - `conductor.execute(executable)` handles all
3. **Type Guards Over Flags** - Use `isFlow()` not `mode: 'flow'`
4. **Fewer Types** - Executable unifies everything
5. **Simpler Transport** - One request type instead of many

## 📈 Adding Features with This Pattern

### Example: Adding "Template" Concept

```typescript
// A Template is just an Executable with metadata
interface Template extends Executable {
  type: "template";
  category: string;
  description: string;
  executable: Flow; // The actual flow to use
}

// Still works with conductor!
conductor.execute(template.executable);
```

### Example: Adding "Scheduled Execution"

```typescript
interface ScheduledExecutable {
  executable: Executable; // ANY executable
  schedule: CronExpression;
}

// Execute when scheduled
conductor.execute(scheduled.executable);
```

## Migration Impact

### What Changes:

1. **ExecuteRequest** only needs `executable` field
2. **Conductor** has single `execute()` method
3. **Type guards** replace mode checks
4. **Flow** extends Executable

### What Stays the Same:

1. Node types and definitions
2. Visual transformation logic
3. Storage patterns
4. Basic type structure

### What Gets Simpler:

1. RPC contracts (one request type)
2. Conductor API (one method)
3. Client code (no mode selection)
4. Testing (one path to test)

---

**This document reflects the simplified architecture where Flow is just a
composite node, making the entire system more uniform and easier to
understand.**
