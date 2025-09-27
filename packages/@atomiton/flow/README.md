# @atomiton/flow

Functional flow and node execution system for Atomiton. This package provides a
functional programming approach to creating and managing flows, where a flow is
just a special type of node that contains other nodes.

## Key Concepts

- **Executable**: Base interface for all executable entities (nodes and flows)
- **FlowNode**: A single node that performs a specific operation
- **Flow**: A composite node (type: 'flow') that contains other nodes and their
  connections
- **Connection**: Links between nodes that define data flow

The key insight: A Flow is just a special type of node that contains other
nodes. Both Flow and FlowNode extend the Executable interface.

## Installation

```bash
pnpm add @atomiton/flow
```

## Usage

### Creating Nodes and Flows

```typescript
import { createNode, createFlow, createConnection } from "@atomiton/flow";

// Create individual nodes
const inputNode = createNode({
  type: "input",
  label: "Data Input",
  position: { x: 0, y: 100 },
  outputs: [{ id: "out", label: "Output", type: "data" }],
});

const processorNode = createNode({
  type: "processor",
  label: "Process Data",
  position: { x: 200, y: 100 },
  inputs: [{ id: "in", label: "Input", type: "data" }],
  outputs: [{ id: "out", label: "Output", type: "data" }],
  config: {
    operation: "transform",
  },
});

// Create connections
const connection = createConnection({
  source: { nodeId: inputNode.id, portId: "out" },
  target: { nodeId: processorNode.id, portId: "in" },
});

// Create a flow containing the nodes
const flow = createFlow({
  label: "Data Processing Flow",
  nodes: [inputNode, processorNode],
  connections: [connection],
});
```

### Using Type Guards

```typescript
import { isFlow, isNode, isValidFlow, hasCycles } from "@atomiton/flow";

// Check entity types
if (isFlow(entity)) {
  console.log("This is a flow with", entity.nodes.length, "nodes");
}

if (isNode(entity)) {
  console.log("This is a node of type", entity.type);
}

// Validate flow structure
if (isValidFlow(flow)) {
  console.log("Flow structure is valid");
}

// Check for cycles
if (!hasCycles(flow)) {
  console.log("Flow is a directed acyclic graph (DAG)");
}
```

### Functional Composition

```typescript
import {
  pipe,
  compose,
  addNode,
  removeNode,
  connectNodes,
} from "@atomiton/flow";

// Use pipe to apply transformations left-to-right
const transformedFlow = pipe(
  addNode(node1),
  addNode(node2),
  connectNodes(node1.id, "out", node2.id, "in"),
  addNode(node3),
  connectNodes(node2.id, "out", node3.id, "in"),
)(emptyFlow);

// Use compose for right-to-left composition
const transform = compose(
  removeNode("obsolete-node"),
  addNode(replacementNode),
);

const updatedFlow = transform(flow);
```

### Working with Flows

```typescript
import {
  getNodeById,
  getConnectedNodes,
  getTopologicalOrder,
  filterNodes,
  mapNodes,
} from "@atomiton/flow";

// Query operations
const node = getNodeById("node-123")(flow);
const connected = getConnectedNodes("node-123", flow);

// Get nodes in execution order (for DAGs)
try {
  const orderedNodes = getTopologicalOrder(flow);
  console.log(
    "Execution order:",
    orderedNodes.map((n) => n.label),
  );
} catch (e) {
  console.error("Flow contains cycles");
}

// Filter and map operations
const processorNodes = filterNodes((node) => node.type === "processor")(flow);
const nodeLabels = mapNodes((node) => node.label)(flow);
```

### Creating Sequential Flows

```typescript
import { createSequentialFlow } from "@atomiton/flow";

// Create a simple sequential flow
const nodes = [startNode, processNode1, processNode2, endNode];
const sequentialFlow = createSequentialFlow("Sequential Pipeline", nodes);
// Automatically creates connections between consecutive nodes
```

## API Reference

### Factory Functions

- `createFlow(options)` - Create a new flow
- `createNode(options)` - Create a new node
- `createConnection(options)` - Create a connection between nodes
- `createEmptyFlow(label?)` - Create an empty flow
- `createSequentialFlow(label, nodes)` - Create a flow with sequential
  connections
- `cloneFlow(flow, newId?)` - Clone a flow with new IDs
- `cloneNode(node, newId?)` - Clone a node with new ID

### Type Guards

- `isExecutable(value)` - Check if value is an Executable
- `isFlow(value)` - Check if value is a Flow
- `isNode(value)` - Check if value is a FlowNode
- `isConnection(value)` - Check if value is a Connection
- `isValidFlow(flow)` - Validate flow structure
- `hasCycles(flow)` - Check if flow contains cycles
- `isEntryNode(nodeId, flow)` - Check if node has no incoming connections
- `isExitNode(nodeId, flow)` - Check if node has no outgoing connections

### Functional Utilities

#### Core Functional Programming

- `pipe(...fns)` - Compose functions left-to-right
- `compose(...fns)` - Compose functions right-to-left

#### Node Operations

- `addNode(node)` - Add a node to a flow
- `removeNode(nodeId)` - Remove a node from a flow
- `updateNode(nodeId, updates)` - Update a node in a flow

#### Connection Operations

- `addConnection(connection)` - Add a connection to a flow
- `removeConnection(connectionId)` - Remove a connection
- `connectNodes(sourceId, sourcePort, targetId, targetPort)` - Connect two nodes

#### Query Operations

- `getNodeById(nodeId)` - Get a node by its ID
- `getConnectedNodes(nodeId, flow)` - Get all nodes connected to a node
- `getIncomingConnections(nodeId, flow)` - Get incoming connections
- `getOutgoingConnections(nodeId, flow)` - Get outgoing connections
- `filterNodes(predicate)` - Filter nodes by predicate
- `mapNodes(fn)` - Map over nodes
- `findNode(predicate)` - Find first node matching predicate

#### Flow Operations

- `clearConnections(flow)` - Remove all connections
- `clearNodes(flow)` - Remove all nodes and connections
- `transformFlow(flow, ...transformations)` - Apply multiple transformations
- `getTopologicalOrder(flow)` - Get nodes in topological order (DAGs only)

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run benchmarks
pnpm test:benchmark

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## License

MIT
