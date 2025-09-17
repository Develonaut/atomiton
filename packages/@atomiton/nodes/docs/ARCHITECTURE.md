# @atomiton/nodes Architecture

## Mental Model: "Everything is a Node"

This package implements a unified node architecture where **everything that can execute is a node**. This creates a powerful composition pattern where atomic nodes (building blocks) and composite nodes (orchestrations) share the same interface.

## Type Hierarchy

The node system follows a clear separation between data structures and runtime instances:

```
                        Data vs Runtime
                 ┌────────────┬────────────────┐
                 │    Data    │    Runtime     │
                 │ (Storage)  │  (Execution)   │
                 └────────────┴────────────────┘
                       │              │
                       ▼              ▼
                 ┌──────────┐  ┌──────────────┐
                 │   Node    │  │IExecutableNode│
                 │           │  │   execute()   │
                 │  - id     │  │   validate()  │
                 │  - name   │  │   metadata    │
                 │  - type   │  │               │
                 │  - nodes  │  └───────┬───────┘
                 │  - edges  │          │
                 └──────────┘      ┌────┴────┐
                       │           │         │
                       │    ┌──────────┐ ┌────────────┐
                       │    │IAtomicNode│ │ICompositeNode│
                       │    │ (single)  │ │(orchestrate) │
                       │    └──────────┘ └────────────┘
                       │
                 ┌─────▼──────┐
                 │ createNode()│
                 │  (Factory)  │
                 └─────────────┘
                       │
                   Returns Node
              (hides implementation)

    Legend:
    • Node: Data structure for storage, editing, serialization
    • IExecutableNode: Runtime interface for execution
    • IAtomicNode/ICompositeNode: Runtime implementations (internal)
    • createNode(): Public factory that returns Node data
```

### Mental Model

**"A node is just data until you execute it"**

1. **Node** - The data structure you create, store, and edit
2. **IExecutableNode** - The runtime instance that actually executes
3. **createNode()** - The simple factory that creates Node data

The atomic/composite distinction is an internal implementation detail. From the outside:

- You create a `Node` (data)
- You store/edit/serialize that `Node`
- The system converts it to an `IExecutableNode` when needed for execution

### Key Principles

1. **Data First**: Work with `Node` data structures, not runtime instances
2. **Hidden Complexity**: The atomic/composite split is internal
3. **Simple API**: One function (`createNode()`) creates all nodes
4. **Clear Naming**: "Executable" in the name means runtime execution

## Folder Structure

```
src/
├── interfaces/              # Pure interfaces (no implementations)
│   ├── IExecutableNode.ts   # Runtime node interface (IExecutableNode, IAtomicNode, ICompositeNode)
│   ├── INodeExecutable.ts   # Execution logic interface
│   ├── INodeMetadata.ts    # Metadata interface
│   ├── INodeParameters.ts  # Parameters interface
│   └── INodePorts.ts       # Ports interface
│
├── atomic/                  # Atomic node implementations
│   ├── createAtomicNode.ts # Factory for atomic runtime nodes
│   ├── createNodeExecutable.ts # Creates execution logic
│   ├── createNodeParameters.ts # Parameter factory
│   ├── createNodeMetadata.ts   # Metadata factory
│   ├── createNodePorts.ts      # Ports factory
│   └── nodes/              # Actual node implementations
│       ├── csv-reader/     # Read CSV files
│       ├── http-request/   # Make HTTP requests
│       ├── file-system/    # File operations
│       ├── shell-command/  # Execute shell commands
│       ├── code/          # Execute JavaScript/TypeScript code
│       ├── transform/     # Transform data
│       ├── image-composite/# Image manipulation
│       ├── loop/          # Loop constructs
│       └── parallel/      # Parallel execution
│
├── composite/              # Composite node implementations
│   ├── createCompositeNode.ts  # Factory for composite runtime nodes
│   ├── createCompositeExecutable.ts # Execution orchestration
│   ├── createCompositeGraph.ts # Graph management
│   ├── templates/          # Pre-built composite templates
│   └── types.ts           # Composite-specific types
│
├── types.ts               # Public data types (Node, etc.)
├── createNode.ts          # Public factory function
└── index.ts               # Clean public exports
```

## Node Types

### INode (Base Interface)

All nodes implement the `INode` interface:

- `execute()` - Core execution method
- `validate()` - Validate configuration
- `inputPorts` / `outputPorts` - Port definitions (getter properties)
- `metadata` - Node metadata (getter property)
- `isComposite()` - Type identification
- `dispose()` - Resource cleanup

### IAtomicNode (Leaf Nodes)

Atomic nodes are the building blocks that do actual work:

- **Location**: `src/atomic/`
- **Purpose**: Perform specific tasks (read files, make HTTP requests, etc.)
- **Characteristics**: Standalone, no child nodes, `isComposite()` returns `false`
- **Examples**: CSV Reader, HTTP Request, File System, Shell Command

### ICompositeNode (Orchestrators)

Composite nodes orchestrate other nodes:

- **Location**: `src/composite/`
- **Purpose**: Coordinate execution of multiple child nodes
- **Characteristics**: Contains child nodes, `isComposite()` returns `true`
- **Additional Methods**:
  - `getChildNodes()` - Get contained nodes
  - `addChildNode()` / `removeChildNode()` - Manage children
  - `getExecutionFlow()` - Get node connections

## Key Principles

### 1. Unified Interface

Both atomic and composite nodes implement `INode`, enabling:

- Polymorphic operations
- Consistent execution pattern
- Composability (composites can contain other composites)

### 2. Clear Separation of Concerns

- **Atomic**: Focus on specific functionality
- **Composite**: Focus on orchestration and workflow
- **Base**: Shared functionality and contracts

### 3. Terminology Consistency

- **UI Domain**: "Blueprint" (user-facing term for workflows)
- **Code Domain**: "Composite Node" (technical implementation)
- **Mental Model**: Atomic vs Composite (architectural distinction)

## Interface Hierarchy

```
INode (base interface)
├── IAtomicNode extends INode
│   └── isComposite(): false
└── ICompositeNode extends INode
    ├── isComposite(): true
    ├── getChildNodes(): INode[]
    ├── addChildNode(node: INode): void
    └── getExecutionFlow(): CompositeEdge[]
```

## Usage Examples

### Creating an Atomic Node

```typescript
class MyAtomicNode extends Node implements IAtomicNode {
  readonly id = "my-atomic-node";
  readonly name = "My Atomic Node";
  readonly type = "my-atomic-node";

  isComposite(): false {
    return false;
  }

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    // Perform specific task
    return this.createSuccessResult({ processed: true });
  }
}
```

### Creating a Composite Node

```typescript
class MyCompositeNode extends Node implements ICompositeNode {
  readonly id = "my-composite-node";
  readonly name = "My Composite Node";
  readonly type = "composite";

  private childNodes = new Map<string, INode>();

  isComposite(): true {
    return true;
  }

  getChildNodes(): INode[] {
    return Array.from(this.childNodes.values());
  }

  addChildNode(node: INode): void {
    this.childNodes.set(node.id, node);
  }

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    // Orchestrate child node execution
    return this.createSuccessResult({ orchestrated: true });
  }
}
```

## Key Changes in Unified Architecture

### Terminology Updates

- **UI Domain**: "Blueprint" (user-facing term)
- **Code Domain**: "Composite Node" (technical implementation)
- **Interface**: All nodes implement `INode` regardless of type

### Getter API

Modern property access instead of method calls:

```typescript
// Current unified API
const ports = node.inputPorts; // getter property
const meta = node.metadata; // getter property

// Note: All nodes now use the getter pattern consistently
```

### Factory Pattern

Create nodes without classes:

```typescript
// New factory approach
const customNode = nodes.extendNode({
  type: "custom-transform",
  async execute(context) {
    /* logic */
  },
});

// Traditional class approach (still works)
class CustomNode extends Node {
  /* ... */
}
```

This unified architecture creates a powerful, scalable foundation where "everything executable is a node" while maintaining clean abstractions and developer-friendly patterns.
