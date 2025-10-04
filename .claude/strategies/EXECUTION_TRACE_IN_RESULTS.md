# Strategy: Execution Trace in Results

## Problem Statement

Currently, execution traces are only available client-side by subscribing to
progress events. When debugging or analyzing execution, we need the complete
execution history available in the `ExecutionResult` that's returned from
`conductor.node.run()`.

### Current Limitations

1. **No server-side trace**: Desktop execution doesn't capture or return
   execution history
2. **Client must subscribe**: Requires setting up event listeners to capture
   trace
3. **No nested traces**: Group node completions don't include child execution
   histories
4. **Hard to debug**: Can't easily inspect what happened during execution after
   it completes

### Desired Behavior

```typescript
const result = await conductor.node.run(flowNode, { slowMo: 7500 });

// Result should include complete execution trace
console.log(result.trace);
// {
//   executionId: "exec_123",
//   startTime: 1234567890,
//   endTime: 1234567890,
//   duration: 45000,
//   events: [
//     { timestamp: 1234567890, type: "started", ... },
//     { timestamp: 1234567891, type: "progress", progress: 0, message: "Executing: Node 1", ... },
//     { timestamp: 1234567892, type: "progress", progress: 12, message: "Executing: Node 1", ... },
//     // ... all progress events
//     { timestamp: 1234567935, type: "completed", ... }
//   ],
//   nodes: [
//     {
//       nodeId: "node-1",
//       nodeName: "Create Message",
//       startTime: 1234567890,
//       endTime: 1234567905,
//       duration: 15000,
//       state: "completed",
//       trace: { /* nested trace for this node */ }
//     },
//     // ... other nodes
//   ]
// }
```

## Architecture Design

### 1. ExecutionTrace Type

```typescript
// packages/@atomiton/conductor/src/types/execution.ts

export type ExecutionTraceEvent = {
  timestamp: number;
  type: "started" | "progress" | "state-change" | "completed" | "error";
  data: unknown;
};

export type NodeExecutionTrace = {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  state: NodeExecutionState;
  progress: number;
  events: ExecutionTraceEvent[];
  childTraces?: NodeExecutionTrace[]; // For group nodes
};

export type ExecutionTrace = {
  executionId: string;
  rootNodeId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  config: {
    slowMo?: number;
    // ... other config
  };
  events: ExecutionTraceEvent[];
  nodes: NodeExecutionTrace[];
};

// Add to ExecutionResult
export type ExecutionResult = {
  success: boolean;
  data?: unknown;
  error?: ExecutionError;
  duration: number;
  executedNodes: string[];
  context?: ConductorExecutionContext;
  trace?: ExecutionTrace; // NEW: Execution trace
};
```

### 2. Trace Collection in ExecutionGraphStore

The `ExecutionGraphStore` already tracks all node state changes and progress -
we just need to capture them.

```typescript
// packages/@atomiton/conductor/src/execution/executionGraphStore.ts

export function createExecutionGraphStore(): ExecutionGraphStore {
  // ... existing code

  // NEW: Trace collection
  const trace: ExecutionTrace = {
    executionId: "",
    rootNodeId: "",
    startTime: 0,
    events: [],
    nodes: [],
    config: {},
  };

  const nodeTraces = new Map<string, NodeExecutionTrace>();

  function initializeGraph(graph: ExecutionGraph): void {
    // ... existing code

    // Initialize trace
    trace.executionId = generateExecutionId();
    trace.rootNodeId = graph.nodes[0]?.id || "unknown";
    trace.startTime = Date.now();
    trace.config = {}; // TODO: Pass config from context

    // Record start event
    trace.events.push({
      timestamp: Date.now(),
      type: "started",
      data: {
        totalNodes: graph.nodes.length,
        totalWeight: graph.totalWeight,
        criticalPath: graph.criticalPath,
      },
    });

    // Initialize node traces
    graph.nodes.forEach((node) => {
      nodeTraces.set(node.id, {
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        startTime: 0,
        state: "pending",
        progress: 0,
        events: [],
      });
    });
  }

  function setNodeState(
    nodeId: string,
    state: NodeExecutionState,
    errorMessage?: string,
  ): void {
    // ... existing code

    // Record in trace
    const nodeTrace = nodeTraces.get(nodeId);
    if (nodeTrace) {
      const timestamp = Date.now();

      if (state === "executing" && nodeTrace.startTime === 0) {
        nodeTrace.startTime = timestamp;
      }

      if (state === "completed" || state === "error") {
        nodeTrace.endTime = timestamp;
        nodeTrace.duration = timestamp - nodeTrace.startTime;
      }

      nodeTrace.state = state;
      nodeTrace.events.push({
        timestamp,
        type: "state-change",
        data: { state, errorMessage },
      });

      trace.events.push({
        timestamp,
        type: "state-change",
        data: { nodeId, state, errorMessage },
      });
    }
  }

  function setNodeProgress(
    nodeId: string,
    progress: number,
    message?: string,
  ): void {
    // ... existing code

    // Record in trace
    const nodeTrace = nodeTraces.get(nodeId);
    if (nodeTrace) {
      nodeTrace.progress = progress;
      nodeTrace.events.push({
        timestamp: Date.now(),
        type: "progress",
        data: { progress, message },
      });
    }

    trace.events.push({
      timestamp: Date.now(),
      type: "progress",
      data: {
        nodeId,
        progress: state.cachedProgress,
        message: message || "",
        allNodes: Array.from(state.nodes.values()).map((n) => ({
          id: n.id,
          name: n.name,
          state: n.state,
          progress: n.progress,
        })),
      },
    });
  }

  function completeExecution(): void {
    // ... existing code

    // Finalize trace
    trace.endTime = Date.now();
    trace.duration = trace.endTime - trace.startTime;
    trace.nodes = Array.from(nodeTraces.values());

    trace.events.push({
      timestamp: Date.now(),
      type: "completed",
      data: {
        totalDuration: trace.duration,
        nodesCompleted: trace.nodes.filter((n) => n.state === "completed")
          .length,
        nodesErrored: trace.nodes.filter((n) => n.state === "error").length,
      },
    });
  }

  function getTrace(): ExecutionTrace {
    return { ...trace }; // Return copy
  }

  return {
    // ... existing methods
    getTrace, // NEW: Get execution trace
  };
}
```

### 3. Include Trace in ExecutionResult

```typescript
// packages/@atomiton/conductor/src/execution/executeGraph.ts

export async function executeGraph(
  node: NodeDefinition,
  context: ConductorExecutionContext,
  config: ConductorConfig,
  executionGraphStore: ExecutionGraphStore | undefined,
  execute: (/* ... */) => Promise<ExecutionResult>,
): Promise<ExecutionResult> {
  // ... existing execution logic

  // On completion
  if (executionGraphStore) {
    executionGraphStore.completeExecution();
  }

  return {
    success: true,
    data: finalOutput,
    duration: Date.now() - startTime,
    executedNodes: [node.id, ...executedNodes],
    context,
    trace: executionGraphStore?.getTrace(), // NEW: Include trace
  };
}
```

### 4. Nested Traces for Group Nodes

For group nodes, we need to include child execution traces recursively.

```typescript
// When executing child nodes in executeGraph.ts

for (const childNode of sorted) {
  // ... build child context

  const result = await execute(
    childNode,
    childContext,
    config,
    executionGraphStore, // Same store, captures all in one trace
  );

  // If child has a trace, add it to parent node trace
  if (result.trace && executionGraphStore) {
    const parentNodeTrace = nodeTraces.get(node.id);
    if (parentNodeTrace) {
      if (!parentNodeTrace.childTraces) {
        parentNodeTrace.childTraces = [];
      }
      parentNodeTrace.childTraces.push({
        nodeId: childNode.id,
        nodeName: childNode.name || childNode.type,
        nodeType: childNode.type,
        startTime: result.trace.startTime,
        endTime: result.trace.endTime,
        duration: result.trace.duration,
        state: result.success ? "completed" : "error",
        progress: 100,
        events: result.trace.events,
        childTraces: result.trace.nodes, // Nested children
      });
    }
  }

  // ... handle result
}
```

## Implementation Steps

### Phase 1: Type Definitions (P0)

- [ ] Add `ExecutionTraceEvent`, `NodeExecutionTrace`, `ExecutionTrace` types
- [ ] Add `trace?: ExecutionTrace` to `ExecutionResult`
- [ ] Update type exports

### Phase 2: Trace Collection (P0)

- [ ] Add trace collection to `ExecutionGraphStore`
- [ ] Capture events in `initializeGraph()`, `setNodeState()`,
      `setNodeProgress()`, `completeExecution()`
- [ ] Add `getTrace()` method to store
- [ ] Include trace in `ExecutionResult` from `executeGraph()`

### Phase 3: Nested Traces (P1)

- [ ] Implement child trace collection for group nodes
- [ ] Test nested execution traces
- [ ] Verify trace depth for deeply nested groups

### Phase 4: RPC Transport (P1)

- [ ] Ensure trace serializes correctly through IPC
- [ ] Update RPC channel to preserve trace in result
- [ ] Test browser receives complete trace

### Phase 5: Client Integration (P2)

- [ ] Update browser conductor to expose trace from result
- [ ] Add trace visualization UI component
- [ ] Add trace export/download functionality

## Testing Strategy

### Unit Tests

```typescript
describe("Execution Trace", () => {
  it("should capture trace for single node execution", async () => {
    const result = await conductor.node.run(singleNode);
    expect(result.trace).toBeDefined();
    expect(result.trace.events).toHaveLength(4); // started, 2x progress, completed
    expect(result.trace.nodes).toHaveLength(1);
  });

  it("should capture trace for group node execution", async () => {
    const result = await conductor.node.run(groupNode);
    expect(result.trace).toBeDefined();
    expect(result.trace.nodes).toHaveLength(3); // 3 child nodes
    expect(result.trace.events.length).toBeGreaterThan(10);
  });

  it("should include nested traces for child nodes", async () => {
    const result = await conductor.node.run(nestedGroupNode);
    expect(result.trace.nodes[0].childTraces).toBeDefined();
    expect(result.trace.nodes[0].childTraces.length).toBeGreaterThan(0);
  });

  it("should preserve trace through RPC transport", async () => {
    // Test that trace survives browser -> desktop -> browser
  });
});
```

### Integration Tests

- Execute flows with slowMo and verify trace timestamps are accurate
- Execute nested groups and verify complete trace hierarchy
- Verify trace includes all progress events broadcasted

## Success Criteria

✅ **Trace Availability**

- [ ] Every `ExecutionResult` includes a complete trace
- [ ] Trace includes all events that occurred during execution
- [ ] Trace timestamps are accurate

✅ **Nested Execution**

- [ ] Group node traces include child node traces
- [ ] Deeply nested groups preserve complete trace hierarchy
- [ ] Each node level has its own event history

✅ **Transport Compatibility**

- [ ] Trace serializes correctly through RPC/IPC
- [ ] Browser receives complete trace from desktop execution
- [ ] No data loss during transport

✅ **Debuggability**

- [ ] Can easily inspect what happened during execution
- [ ] Can identify which node took longest
- [ ] Can see exact progress event sequence
- [ ] Can export trace for sharing (e.g., paste to Claude)

## Future Enhancements

### Trace Visualization (Phase 6)

- Timeline view showing node execution sequence
- Gantt chart for parallel execution (when implemented)
- Progress curve visualization

### Trace Analytics (Phase 7)

- Identify performance bottlenecks
- Compare execution traces
- Detect anomalies in execution patterns

### Trace Persistence (Phase 8)

- Save traces to disk for later analysis
- Load and compare historical traces
- Build execution profile database

---

**Created:** 2025-10-04 **Priority:** HIGH - Essential for debugging and testing
**Dependencies:** None (builds on existing ExecutionGraphStore) **Estimated
Effort:** 2-3 days for P0+P1
