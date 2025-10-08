# Shared Execution Hooks

Standardized hooks for node/flow execution used across the application.

## Core Principle

**Both nodes and flows are `NodeDefinition`** - there's no difference in how we
handle them. A "flow" is just a `NodeDefinition` with a `nodes` array containing
child nodes.

## Architecture

```
useNodeExecution (Foundation)
├── Toolbar (uses directly)
├── useFlowOperations (builds on it + adds progress tracking)
└── useNodeOperations (builds on it + adds debug features)
```

All execution goes through `useNodeExecution` as the single source of truth for
execution logic.

## Available Hooks

### `useNodeExecution` (Foundation Hook)

**Base hook for executing any NodeDefinition (node or flow) with validation**

This is the core primitive that all other execution hooks build upon.

```tsx
import { useNodeExecution } from "#hooks/useNodeExecution";

const MyComponent = () => {
  const { execute, isExecuting, result, error, success } = useNodeExecution({
    validateBeforeRun: true,
    onExecutionStart: (node) => console.log("Starting:", node.name),
    onExecutionComplete: (result) => console.log("Done!", result),
    onValidationError: (errors) => console.error("Invalid:", errors),
  });

  const handleRun = async () => {
    const result = await execute(myNode, {
      slowMo: 100,
      debug: { simulateError: { nodeId: "test", errorType: "runtime" } },
    });
  };

  return (
    <button onClick={handleRun} disabled={isExecuting}>
      {isExecuting ? "Running..." : "Run"}
    </button>
  );
};
```

**Features:**

- Automatic validation before execution (optional)
- Execution state management (isExecuting, result, error)
- Lifecycle callbacks (onStart, onComplete, onValidationError)
- Support for execution options (slowMo, debug, executionId, etc.)
- Cancel and reset methods

**Use Cases:**

- Editor toolbar (run selected node or entire flow)
- Foundation for all other execution hooks
- Any component that needs basic execution

### `useFlowOperations` (Debug Flows Page)

**Flow execution with progress tracking** - Built on `useNodeExecution`

```tsx
import { useFlowOperations } from "#templates/DebugPage/hooks/useFlowOperations";

const FlowsPage = () => {
  const slowMo = 100;
  const debugOptions = { simulateError: false };

  const { runFlow, isExecuting, progress, reset } = useFlowOperations(
    slowMo,
    debugOptions,
  );

  return (
    <div>
      <button onClick={() => runFlow(myFlow)} disabled={isExecuting}>
        Run Flow
      </button>
      <ProgressBar value={progress.graphProgress} />
      <p>
        Node {progress.currentNode} of {progress.totalNodes}
      </p>
    </div>
  );
};
```

**Features:**

- Uses `useNodeExecution` internally for execution
- Real-time progress tracking (0-100%)
- Node completion tracking
- Execution trace storage
- Debug options support (slowMo, error simulation)
- Logging integration

### `useNodeOperations` (Debug Nodes Page)

**Node testing and validation** - Built on `useNodeExecution`

```tsx
import { useNodeOperations } from "#templates/DebugPage/hooks/useNodeOperations";

const NodesPage = () => {
  const {
    validateNode,
    executeNode,
    isExecuting,
    nodeContent,
    setNodeContent,
  } = useNodeOperations();

  return (
    <div>
      <textarea
        value={nodeContent}
        onChange={(e) => setNodeContent(e.target.value)}
      />
      <button onClick={validateNode}>Validate</button>
      <button onClick={executeNode} disabled={isExecuting}>
        Execute
      </button>
    </div>
  );
};
```

**Features:**

- Uses `useNodeExecution` internally for execution
- JSON node editing and validation
- Sample node creation
- Dynamic node type selection
- Logging integration

## Usage Patterns

### Simple Execution (Editor Toolbar)

```tsx
const { execute, isExecuting, result } = useNodeExecution({
  validateBeforeRun: true,
});

// Execute selected node OR entire flow (both are NodeDefinition)
const nodeToRun = selectedNode || reactFlowToFlow(nodes, edges);
await execute(nodeToRun);
```

### Advanced Execution with Progress (Debug Page)

```tsx
const { execute } = useNodeExecution({
  onExecutionStart: (node) => {
    startTracking(executionId, node.nodes?.length || 0);
  },
  onExecutionComplete: (result) => {
    stopTracking(result.trace);
  },
});

const { progress, startTracking, stopTracking } = useExecutionProgress({
  onNodeComplete: (nodeId) => addLog(`✅ ${nodeId} complete`),
});

await execute(flow, { executionId, slowMo: 500 });
```

### With Debug Options

```tsx
const { execute } = useNodeExecution();

await execute(node, {
  slowMo: 100,
  debug: {
    simulateError: {
      nodeId: "error-node",
      errorType: "runtime",
      delayMs: 1000,
    },
    simulateLongRunning: {
      nodeId: "slow-node",
      delayMs: 5000,
    },
  },
});
```

## Migration Guide

### Before (Inline Logic)

```tsx
const [isRunning, setIsRunning] = useState(false);
const [output, setOutput] = useState(null);

const handleRun = async () => {
  setIsRunning(true);
  try {
    const result = await conductor.node.run(node);
    setOutput(result);
  } finally {
    setIsRunning(false);
  }
};
```

### After (Shared Hook)

```tsx
const { execute, isExecuting, result } = useNodeExecution();

const handleRun = () => execute(node);
```

## Benefits

1. **Consistency**: Same execution logic across all components
2. **Maintainability**: Update one place, fix everywhere
3. **Testability**: Hooks can be easily mocked and tested
4. **Features**: Built-in validation, error handling, progress tracking
5. **Flexibility**: Support for both simple and advanced use cases
6. **Type Safety**: Full TypeScript support

## Next Steps

The debug page can optionally be refactored to use these hooks, but the current
implementation works well. The key is that new features should use these
standardized hooks.
