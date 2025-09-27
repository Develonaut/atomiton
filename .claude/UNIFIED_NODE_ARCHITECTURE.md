# Unified Node Architecture

## The Key Insight

**Everything is a node.** A Flow is just a composite node that contains other
nodes, which themselves could be composite nodes (flows). This creates a
recursive, fractal structure.

## Unified Type Structure

```typescript
// @atomiton/flow/src/types.ts

// Everything is a Node
export interface Node {
  id: string;
  type: string; // 'httpRequest', 'transform', 'flow', 'custom-flow', etc.
  version?: string; // Version of this node type

  // Instance data
  position?: { x: number; y: number };
  config?: Record<string, any>;
  label?: string;

  // The recursive part - a node can contain other nodes
  nodes?: Node[]; // If present, this is a composite node
  connections?: Connection[]; // How the child nodes connect

  // Metadata
  metadata?: {
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    [key: string]: any;
  };
}

// Connection between nodes
export interface Connection {
  id: string;
  source: string; // node id
  sourceHandle?: string;
  target: string; // node id
  targetHandle?: string;
}

// Type guards
export const isComposite = (node: Node): boolean =>
  Array.isArray(node.nodes) && node.nodes.length > 0;

export const isAtomic = (node: Node): boolean => !isComposite(node);

export const isFlow = (node: Node): boolean =>
  node.type === "flow" || isComposite(node);

// For backward compatibility or clarity
export type Flow = Node; // A Flow is just a Node
export type FlowNode = Node; // FlowNode is just Node
export type CompositeNode = Node & { nodes: Node[]; connections: Connection[] };
export type AtomicNode = Node & { nodes?: never };
```

## How This Works Recursively

```typescript
const myComplexFlow: Node = {
  id: "main-flow",
  type: "flow",
  label: "Main Workflow",
  nodes: [
    {
      // Atomic node
      id: "fetch-data",
      type: "httpRequest",
      position: { x: 100, y: 100 },
      config: { url: "api.com" },
    },
    {
      // Composite node (a sub-flow)
      id: "process-data",
      type: "flow", // or could be 'data-processing-flow'
      position: { x: 300, y: 100 },
      label: "Data Processing",
      nodes: [
        {
          id: "transform-1",
          type: "transform",
          position: { x: 50, y: 50 },
          config: { expression: "data.items" },
        },
        {
          id: "filter-1",
          type: "filter",
          position: { x: 200, y: 50 },
          config: { condition: "item.active" },
        },
      ],
      connections: [{ id: "c1", source: "transform-1", target: "filter-1" }],
    },
    {
      // Another composite that could be a saved flow
      id: "notification-flow",
      type: "saved-flow:notify-team", // Reference to a saved flow
      position: { x: 500, y: 100 },
      version: "1.2.0", // Version of that saved flow
      config: {
        channel: "#alerts", // Override config for this instance
      },
    },
  ],
  connections: [
    { id: "main-c1", source: "fetch-data", target: "process-data" },
    { id: "main-c2", source: "process-data", target: "notification-flow" },
  ],
};
```

## Execution is Recursive

```typescript
// @atomiton/conductor
async function executeNode(
  node: Node,
  context: ExecutionContext,
): Promise<ExecutionResult> {
  // Base case: atomic node
  if (isAtomic(node)) {
    const definition = getNodeDefinition(node.type, node.version);
    return definition.execute(context, node.config);
  }

  // Recursive case: composite node
  if (isComposite(node)) {
    // Execute child nodes in order based on connections
    const ordered = topologicalSort(node.nodes, node.connections);
    const results = {};

    for (const childNode of ordered) {
      const childContext = buildContext(
        context,
        results,
        node.connections,
        childNode,
      );
      results[childNode.id] = await executeNode(childNode, childContext); // RECURSIVE!
    }

    return combineResults(results);
  }
}
```

## Benefits of This Architecture

### 1. **Infinite Composition**

```typescript
// Flows can contain flows can contain flows...
const node: Node = {
  type: 'flow',
  nodes: [
    {
      type: 'flow',
      nodes: [
        {
          type: 'flow',
          nodes: [
            { type: 'httpRequest', config: {...} }
          ]
        }
      ]
    }
  ]
};
```

### 2. **Reusable Flows as Nodes**

```typescript
// Save a flow
const savedFlow = await saveFlow(myDataProcessingFlow);

// Use it as a node in another flow
const newFlow: Node = {
  type: "flow",
  nodes: [
    { type: "httpRequest", id: "fetch" },
    {
      type: `saved-flow:${savedFlow.id}`,
      id: "process",
      config: {
        /* instance overrides */
      },
    },
  ],
};
```

### 3. **Uniform Treatment**

```typescript
// Everything is executed the same way
await executeNode(atomicNode); // Works
await executeNode(compositeNode); // Works
await executeNode(flowWithinFlow); // Works
```

### 4. **Simple Type System**

```typescript
// Just one main type
interface Node {
  id: string;
  type: string;
  nodes?: Node[]; // Optional - if present, it's composite
  connections?: Connection[];
  // ... other fields
}
```

## Visual Representation in Editor

```typescript
// In the node palette
const availableNodes = [
  // Atomic nodes
  { type: "httpRequest", category: "network" },
  { type: "transform", category: "data" },

  // Saved flows appear as nodes!
  { type: "flow:data-cleanup", category: "my-flows" },
  { type: "flow:send-notifications", category: "my-flows" },
];

// Drag a flow onto canvas - it's just another node
const handleDrop = (nodeType: string) => {
  if (nodeType.startsWith("flow:")) {
    // Load the flow and add it as a node
    const flow = await loadFlow(nodeType.split(":")[1]);
    addNode({
      ...flow,
      id: generateId(),
      position: dropPosition,
    });
  }
};
```

## Storage Format (YAML)

```yaml
# Everything is just nodes
id: main-flow
type: flow
nodes:
  - id: fetch
    type: httpRequest
    config:
      url: https://api.example.com

  - id: process
    type: flow # A flow within a flow!
    nodes:
      - id: transform
        type: transform
        config:
          expression: data.items
      - id: filter
        type: filter
    connections:
      - source: transform
        target: filter

  - id: notify
    type: saved-flow:notification-v2 # Reference to saved flow
    version: 2.1.0

connections:
  - source: fetch
    target: process
  - source: process
    target: notify
```

## Migration Path

```typescript
// Old structure
interface Flow {
  type: "flow";
  nodes: FlowNode[];
}

interface FlowNode {
  type: "httpRequest" | "transform";
  // ...
}

// New structure - everything is Node
type Flow = Node; // Just an alias for clarity
type FlowNode = Node; // Just an alias

interface Node {
  type: string; // Can be 'flow', 'httpRequest', 'saved-flow:xyz', anything
  nodes?: Node[]; // Makes it composite
}
```

## The Beautiful Simplicity

1. **One Type**: Just `Node`
2. **One Execution Function**: `executeNode()` that's recursive
3. **One Storage Format**: Nodes all the way down
4. **One Mental Model**: Everything is a node

This makes the system incredibly flexible and powerful while being conceptually
simple!
