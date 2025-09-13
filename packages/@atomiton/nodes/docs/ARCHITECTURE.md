# @atomiton/nodes Architecture

## Mental Model: "Everything is a Node"

This package implements a unified node architecture where **everything that can execute is a node**. This creates a powerful composition pattern where atomic nodes (building blocks) and composite nodes (orchestrations) share the same interface.

## Folder Structure

```
src/
├── base/                    # Common base classes and interfaces
│   ├── interfaces/
│   │   ├── INode.ts        # Main node interfaces (INode, IAtomicNode, ICompositeNode)
│   │   └── IExecutable.ts  # Legacy compatibility exports
│   ├── BaseExecutable.ts   # Base implementation class
│   └── ...
├── atomic/                 # Atomic Nodes (Building Blocks)
│   ├── csv-reader/         # Read CSV files
│   ├── http-request/       # Make HTTP requests
│   ├── file-system/        # File operations
│   ├── shell-command/      # Execute shell commands
│   ├── code/              # Execute JavaScript/TypeScript code
│   ├── transform/         # Transform data
│   ├── image-composite/   # Image manipulation
│   ├── loop/             # Loop constructs
│   ├── parallel/         # Parallel execution
│   └── index.ts          # Exports all atomic nodes
├── composite/            # Composite Nodes (Orchestrators)
│   ├── CompositeNode.ts   # Main composite implementation
│   ├── CompositeExecutor.ts # Execution engine
│   ├── types.ts          # Composite-specific types
│   ├── utils.ts          # Utility functions
│   └── ...
├── types.ts              # Shared types
├── api.ts               # Main API
└── index.ts             # Main exports
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
