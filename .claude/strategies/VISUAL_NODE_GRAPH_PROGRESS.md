# Visual Node Graph Progress Map - Implementation Strategy

## Executive Summary

This strategy outlines the implementation of a real-time execution graph
tracking system. The work is **segmented into two major phases**:

1. **Phase A: Backend/System** - Get the tracking system working (store, IPC,
   events)
2. **Phase B: Frontend/UI** - Build the visual representation in debug page

This ensures small, testable units of work with clear boundaries.

### Context: Current Focus vs. Future Vision

**Current Focus (This Implementation)**:

- Build the **core execution graph tracking system** (Phase A - COMPLETE)
- Create a **simple debug page visualization** (Phase B - TODO)
- Validate that the tracking system works correctly
- Ensure the foundation is solid for future work

**Future Vision (Not in Scope)**:

- **Editor Integration**: The real power of this system will be in the visual
  node editor
- **Live Node Animations**: Nodes in the editor will show execution state with
  animations
  - Border fills, pulsing effects, progress bars around edges
  - Color-coded states (pending, executing, completed, error)
  - Critical path highlighting in the editor canvas
- **Interactive Progress**: Users will see their flow come alive as it executes
- This implementation **postures us** for that future editor experience by
  building the foundation now

**Why Start with Debug Page?**:

- Simpler UI requirements (basic graph rendering)
- Easier to validate the tracking system works correctly
- Faster iteration on the core mechanics
- Proves the architecture before complex editor integration

---

## ✅ Phase A: Backend/System (COMPLETE)

**Goal**: Build the execution graph tracking system without any UI work.

### A1: Graph Analysis Foundation ✅

**What was done**:

- Moved `graphAnalyzer.ts` from `@atomiton/conductor` to
  `@atomiton/nodes/src/graph/`
- Added `@atomiton/nodes/graph` export
- Graph analysis functions available:
  - `analyzeExecutionGraph(flow)` - Complete graph analysis
  - `topologicalSort()` - Execution order calculation
  - `findCriticalPath()` - Critical path identification
  - `findParallelBranches()` - Parallelism detection

**Files modified**:

- `packages/@atomiton/nodes/src/graph/graphAnalyzer.ts`
- `packages/@atomiton/nodes/src/graph/index.ts`
- `packages/@atomiton/nodes/package.json`
- `packages/@atomiton/nodes/vite.config.ts`

### A2: Execution Graph Store ✅

**What was done**:

- Created `executionGraphStore.ts` in `@atomiton/conductor` using
  `@atomiton/store`
- **Conductor creates and owns store internally** - not passed via config
- Store tracks node execution states: pending, executing, completed, error,
  skipped
- Framework-agnostic subscription API (getState, setState, subscribe)

**Store API**:

```typescript
// Conductor creates store internally
const conductor = createConductor({ eventEmitter });

// Access store via conductor.store property
conductor.store.subscribe((state) => {
  console.log("Store updated:", state);
});

// Helper functions
getNodeState(conductor.store, nodeId);
getExecutionProgress(conductor.store); // Returns 0-100
getNodesByState(conductor.store, "completed");
```

**Files created/modified**:

- `packages/@atomiton/conductor/src/execution/executionGraphStore.ts` (new)
- `packages/@atomiton/conductor/src/conductor.ts` (store creation internal)
- `packages/@atomiton/conductor/src/types.ts` (removed store from config)
- `packages/@atomiton/conductor/src/exports/desktop/index.ts` (exported types)

### A3: Conductor Integration ✅

**What was done**:

- Integrated store into conductor execution flow
- Conductor automatically initializes store when executing a group node
- Updates store state on nodeStart, nodeComplete, nodeError
- Store is passed internally through execution functions

**Integration points in conductor.ts**:

```typescript
// executeGroup initializes store
if (executionGraphStore) {
  const { analyzeExecutionGraph } = await import("@atomiton/nodes/graph");
  const graph = analyzeExecutionGraph(node);
  if (graph) {
    executionGraphStore.initializeGraph(graph);
  }
}

// executeLocal updates store
if (executionGraphStore) {
  executionGraphStore.setNodeState(node.id, "executing");
}
// ... on completion
if (executionGraphStore) {
  executionGraphStore.setNodeState(node.id, "completed");
}
```

### A4: IPC Broadcast ✅

**What was done**:

- Wired conductor's execution graph store through existing `nodeChannel`
- Desktop subscribes to `conductor.store.subscribe()` and broadcasts via IPC
- Uses same channel as nodeStart, nodeComplete, nodeError events
- Serializes Map to array for IPC transmission

**Integration in apps/desktop/src/main/services/channels.ts**:

```typescript
// Create conductor - it owns the store internally
const conductor = createConductor({ eventEmitter });

// Wire conductor's execution graph store updates to IPC
conductor.store.subscribe((state: ExecutionGraphState) => {
  // Convert Map to array for IPC serialization
  const nodesArray = Array.from(state.nodes.entries()).map(
    ([id, node]: [string, any]) => ({ id, ...node }),
  );

  nodeChannel.broadcast("executionGraphStateUpdate", {
    nodes: nodesArray,
    edges: state.edges,
    executionOrder: state.executionOrder,
    criticalPath: state.criticalPath,
    totalWeight: state.totalWeight,
    maxParallelism: state.maxParallelism,
    isExecuting: state.isExecuting,
    startTime: state.startTime,
  });
});
```

### Phase A Validation ✅

```bash
✅ pnpm --filter @atomiton/nodes build
✅ pnpm --filter @atomiton/conductor build
✅ pnpm --filter @atomiton/desktop typecheck
```

**Current Status**: All backend infrastructure is complete and tested. The
execution graph tracking system is ready to use.

---

## ✅ Phase A5: Domain-Based API Organization (COMPLETE)

**Goal**: Restructure the Conductor API from flat to domain-based organization
for better clarity and maintainability.

**What was done**: Reorganized both desktop and browser conductor APIs to follow
domain-based structure.

### Desktop Conductor

- ✅ Moved `conductor.store` → `conductor.node.store`
- ✅ Updated IPC layer to use `conductor.node.store.subscribe()`
- ✅ Backward compatibility getter with deprecation warning

### Browser Conductor

- ✅ Moved `conductor.events.onNodeProgress` → `conductor.node.onProgress`
- ✅ Moved `conductor.events.onNodeComplete` → `conductor.node.onComplete`
- ✅ Moved `conductor.events.onNodeError` → `conductor.node.onError`
- ✅ Moved `conductor.events.onFlowSaved` → `conductor.storage.onFlowSaved`
- ✅ Moved `conductor.events.onAuthExpired` → `conductor.auth.onAuthExpired`
- ✅ Updated all client call sites (no backward compatibility)

**Final API Structure**:

```typescript
// Desktop Conductor
conductor.node.run(nodeDefinition)
conductor.node.store.subscribe(...)

// Browser Conductor
conductor.node.run(nodeDefinition)
conductor.node.onProgress(...)
conductor.node.onComplete(...)
conductor.node.onError(...)
conductor.storage.onFlowSaved(...)
conductor.auth.onAuthExpired(...)
```

**Files modified**:

- `packages/@atomiton/conductor/src/conductor.ts` - Added `store` to `nodeAPI`
  object
- `packages/@atomiton/conductor/src/exports/browser/index.ts` - Moved events to
  domain-specific APIs
- `apps/desktop/src/main/services/channels.ts` - Updated to use
  `conductor.node.store`
- `apps/client/src/templates/DebugPage/hooks/useFlowOperations.ts` - Updated
  event subscriptions
- `apps/client/src/templates/DebugPage/store.ts` - Updated all 5 event
  subscriptions

### Phase A5 Validation ✅

```bash
✅ pnpm --filter @atomiton/conductor typecheck
✅ pnpm --filter @atomiton/conductor build
✅ pnpm --filter @atomiton/conductor test (15 tests passing)
✅ pnpm --filter @atomiton/desktop typecheck
✅ pnpm --filter @atomiton/client typecheck
```

**Success Criteria**:

- ✅ All type checks pass across conductor, desktop, and client
- ✅ All tests pass (15/15)
- ✅ Build succeeds
- ✅ All client call sites updated to use domain-based API
- ✅ IPC broadcasting works with conductor.node.store
- ✅ API is now domain-based: conductor.node.store, conductor.node.onComplete,
  etc.

---

## 🚧 Phase B: Frontend/UI (IN PROGRESS)

**Goal**: Build the visual representation of the execution graph.

### B1: Unified Progress Event API ✅

**What was done**: Refactored to use unified `conductor.node.onProgress()` event
that includes graph data, eliminating need for separate execution graph store.

**Files created**:

- None (removed separate store approach)

**Files modified**:

- `packages/@atomiton/conductor/src/exports/browser/types.ts` - Extended
  `NodeProgressEvent` to include `nodes` and `graph` fields, removed
  `ExecutionGraphStateUpdateEvent`
- `packages/@atomiton/conductor/src/exports/browser/eventsApi.ts` - Refactored
  to use RPC transport, removed separate graph event
- `packages/@atomiton/conductor/src/exports/browser/index.ts` - Added flow event
  aliases for better DX
- `packages/@atomiton/conductor/src/exports/browser/flow.ts` - Fixed to use RPC
  transport, added `flow.run()` alias with validation
- `packages/@atomiton/rpc/src/renderer/createTransport.ts` - Added
  `createTransport()` export for full Transport with channel access
- `packages/@atomiton/rpc/src/renderer/index.ts` - Exported `createTransport()`
- `apps/desktop/src/main/services/channels.ts` - Merged execution graph updates
  into unified progress events

**Unified API Design**:

```typescript
// Single event for all progress tracking (atomic and group nodes)
conductor.node.onProgress((event: NodeProgressEvent) => {
  // Always available (simple use case)
  event.progress   // 0-100 overall progress
  event.message    // "Executing: node1, node2"

  // Always present (advanced use case - progressive disclosure)
  event.nodes      // Array of all nodes with states
  event.graph      // Execution order, critical path, etc.
});

// Flow namespace aliases (better DX)
conductor.flow.run(flow)          // Validates group node, delegates to node.run()
conductor.flow.onProgress(...)    // Alias to node.onProgress
conductor.flow.onComplete(...)    // Alias to node.onComplete
conductor.flow.onError(...)       // Alias to node.onError
```

**For atomic nodes:**

- `event.nodes` = array of 1 node
- `event.graph` = trivial graph (single node)
- Simple progress bar just uses `event.progress`

**For group nodes (flows):**

- `event.nodes` = array of all child nodes
- `event.graph` = rich graph data (order, dependencies, critical path)
- Visual graph UI uses `event.nodes` + `event.graph`

**Validation**: ✅

```bash
✅ pnpm --filter @atomiton/rpc build
✅ pnpm --filter @atomiton/conductor build
✅ pnpm --filter @atomiton/desktop typecheck
✅ pnpm --filter @atomiton/client typecheck
```

**Success criteria**: ✅

- ✅ Unified `conductor.node.onProgress()` event with graph data
- ✅ `conductor.flow.run()` alias exists with validation
- ✅ Flow API uses RPC transport (no direct bridge access)
- ✅ Flow event aliases for better DX
- ✅ No separate execution graph store needed
- ✅ Backend merges graph updates into progress events
- ✅ All TypeScript errors resolved
- ✅ **Architecture Fix**: Proper layered abstraction with flow aliases

---

### B2: ReactFlow Graph Components

**What to do**: Build the ReactFlow visualization components with auto-layout
and color-coded node states.

**Dependencies to add**:

```bash
pnpm --filter @atomiton/client add @dagrejs/dagre @types/dagre
```

**Files to create**:

1. **NodeGraphProgressMap.tsx** - Main graph container

   ```typescript
   import { ReactFlow, useNodesState, useEdgesState } from '@xyflow/react';
   import { useExecutionGraphStore } from '#stores/executionGraphStore';
   import { getLayoutedElements } from './layoutUtils';
   import { ExecutionNode } from './ExecutionNode';
   import '@xyflow/react/dist/style.css';

   export function NodeGraphProgressMap() {
     const graphState = useExecutionGraphStore.useStore(state => state);
     const [nodes, setNodes, onNodesChange] = useNodesState([]);
     const [edges, setEdges, onEdgesChange] = useEdgesState([]);

     useEffect(() => {
       if (!graphState.isExecuting || graphState.nodes.size === 0) {
         setNodes([]);
         setEdges([]);
         return;
       }

       const reactFlowNodes = Array.from(graphState.nodes.values()).map(node => ({
         id: node.id,
         type: 'executionNode',
         position: { x: 0, y: 0 },
         data: {
           label: node.name,
           state: node.state,
           type: node.type,
           weight: node.weight,
           isCriticalPath: graphState.criticalPath.includes(node.id),
         },
       }));

       const reactFlowEdges = graphState.edges.map((edge, i) => ({
         id: `edge-${i}`,
         source: edge.from,
         target: edge.to,
         type: 'smoothstep',
         animated: graphState.criticalPath.includes(edge.from),
       }));

       const { nodes: layouted, edges: layoutedEdges } = getLayoutedElements(
         reactFlowNodes,
         reactFlowEdges,
         'TB'
       );

       setNodes(layouted);
       setEdges(layoutedEdges);
     }, [graphState, setNodes, setEdges]);

     if (!graphState.isExecuting || graphState.nodes.size === 0) {
       return null;
     }

     return (
       <div style={{ width: '100%', height: '400px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
         <ReactFlow
           nodes={nodes}
           edges={edges}
           onNodesChange={onNodesChange}
           onEdgesChange={onEdgesChange}
           nodeTypes={{ executionNode: ExecutionNode }}
           fitView
           proOptions={{ hideAttribution: true }}
         />
       </div>
     );
   }
   ```

2. **ExecutionNode.tsx** - Custom node with color-coded states

   ```typescript
   import { memo } from 'react';
   import { Handle, Position } from '@xyflow/react';

   const STATE_COLORS = {
     pending: '#94a3b8',
     executing: '#3b82f6',
     completed: '#22c55e',
     error: '#ef4444',
     skipped: '#f59e0b',
   };

   export const ExecutionNode = memo(({ data }) => {
     const color = STATE_COLORS[data.state];

     return (
       <div style={{
         padding: '10px 15px',
         borderRadius: '6px',
         backgroundColor: 'white',
         border: `2px solid ${color}`,
         boxShadow: data.isCriticalPath ? '0 0 10px rgba(239, 68, 68, 0.5)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
         transition: 'all 0.3s ease',
         minWidth: '120px',
       }}>
         <Handle type="target" position={Position.Top} />
         <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
           {data.label}
         </div>
         <div style={{ fontSize: '10px', color: '#64748b' }}>
           {data.type} • w:{data.weight}
         </div>
         {data.isCriticalPath && (
           <div style={{ fontSize: '9px', color: '#ef4444', fontWeight: 600, marginTop: '2px' }}>
             CRITICAL PATH
           </div>
         )}
         <Handle type="source" position={Position.Bottom} />
       </div>
     );
   });
   ```

3. **layoutUtils.ts** - Dagre auto-layout

   ```typescript
   import dagre from "@dagrejs/dagre";

   export const getLayoutedElements = (nodes, edges, direction = "TB") => {
     const dagreGraph = new dagre.graphlib.Graph();
     dagreGraph.setDefaultEdgeLabel(() => ({}));
     dagreGraph.setGraph({ rankdir: direction, ranksep: 50, nodesep: 30 });

     nodes.forEach((node) => {
       dagreGraph.setNode(node.id, { width: 150, height: 80 });
     });

     edges.forEach((edge) => {
       dagreGraph.setEdge(edge.source, edge.target);
     });

     dagre.layout(dagreGraph);

     const layoutedNodes = nodes.map((node) => {
       const nodeWithPosition = dagreGraph.node(node.id);
       return {
         ...node,
         position: {
           x: nodeWithPosition.x - 75,
           y: nodeWithPosition.y - 40,
         },
       };
     });

     return { nodes: layoutedNodes, edges };
   };
   ```

**Validation**:

```bash
pnpm --filter @atomiton/client typecheck
# Manually test in dev mode
pnpm --filter @atomiton/desktop dev
```

**Success criteria**:

- Graph renders without errors
- Nodes are properly positioned with dagre
- Critical path is visually distinct
- Color-coded states work correctly

---

### B3: Integration into FlowsPage

**What to do**: Add the NodeGraphProgressMap component below the progress bar,
visible only during execution.

**Files to modify**:

- `apps/client/src/templates/FlowsPage/FlowsPage.tsx`

**Implementation**:

```typescript
import { NodeGraphProgressMap } from '../DebugPage/components/NodeGraphProgressMap';

export function FlowsPage() {
  const { isExecuting, progress, logs } = useFlowOperations();

  return (
    <div className="flows-page">
      <div className="left-column">
        {/* Existing flows list */}
      </div>

      <div className="right-column">
        <FlowProgressBar
          percentage={progress.percentage}
          estimatedTimeRemaining={progress.estimatedTimeRemaining}
          isExecuting={isExecuting}
          logs={logs}
        />

        {/* NEW: Visual node graph progress map */}
        {isExecuting && <NodeGraphProgressMap />}
      </div>
    </div>
  );
}
```

**Validation**:

```bash
# Run flows and verify graph appears
pnpm --filter @atomiton/desktop dev
# Open flows page, execute a flow, watch graph update
```

**Success criteria**:

- Graph appears below progress bar during execution
- Layout is responsive and readable
- No visual glitches or overlaps
- Graph hides when execution completes

---

### B4: Testing & Performance

**What to do**: Validate implementation and ensure performance targets are met.

**Manual testing steps**:

1. Run hello-world-template flow
2. Verify nodes change color as they execute (pending → executing → completed)
3. Check critical path highlighting (red shadow)
4. Test with complex flows (20+ nodes)
5. Verify graph clears after execution completes

**E2E test** (optional):

```bash
E2E_OUTPUT_DIR=/tmp/e2e-test pnpm --filter @atomiton/e2e test hello-world-template
```

**Performance validation**:

```bash
# Use React DevTools Profiler
# Check for:
# - < 16ms state updates (60fps)
# - < 100ms initial render for 50 nodes
# - No memory leaks
```

**Success criteria**:

- Graph updates smoothly without jank
- Performance: < 16ms state updates, < 100ms initial render
- Visual: Critical path distinct, smooth transitions, readable layout
- No TypeScript errors, all tests pass

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FlowsPage (Client)                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              FlowProgressBar (existing)                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │          NodeGraphProgressMap (NEW - Phase B)              │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │       ReactFlow Graph Visualization                  │  │  │
│  │  │  - ExecutionNode components (color-coded)            │  │  │
│  │  │  - Edges with critical path highlighting             │  │  │
│  │  │  - Dagre auto-layout                                 │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                         ▲
                         │ useStore()
                         │
┌────────────────────────┴─────────────────────────────────────────┐
│    useExecutionGraphStore (Client Store - NEW - Phase B1)       │
│  - Subscribes to IPC executionGraphStateUpdate events            │
│  - Exposes state to React components                             │
└──────────────────────────▲───────────────────────────────────────┘
                           │ IPC: executionGraphStateUpdate
                           │
┌──────────────────────────┴───────────────────────────────────────┐
│        Desktop IPC - channels.ts (Phase A4 - COMPLETE)           │
│  - conductor.store.subscribe() → nodeChannel.broadcast()         │
│  - Uses EXISTING nodeChannel (same as nodeStart, nodeComplete)   │
│  - Serializes Map to array for IPC                               │
└──────────────────────────▲───────────────────────────────────────┘
                           │ store.subscribe()
                           │
┌──────────────────────────┴───────────────────────────────────────┐
│   ExecutionGraphStore (Phase A2 - COMPLETE)                      │
│  - Created internally by conductor                                │
│  - Updated during node execution                                  │
│  - Framework-agnostic API (getState, setState, subscribe)        │
└──────────────────────────▲───────────────────────────────────────┘
                           │ setNodeState()
                           │
┌──────────────────────────┴───────────────────────────────────────┐
│         Conductor Execution (Phase A3 - COMPLETE)                │
│  - Calls analyzeExecutionGraph() from @atomiton/nodes/graph      │
│  - Initializes store before group execution                       │
│  - Updates store on nodeStart, nodeComplete, nodeError           │
└───────────────────────────────────────────────────────────────────┘
```

---

## Performance Targets

- Graph initialization: < 100ms for 50 nodes
- State update (single node): < 16ms (60fps)
- Full graph re-render: < 100ms
- Memory usage: < 10MB for typical flow (20-30 nodes)

---

## Claude Code Prompts

### Prompt for Phase B1: Client Store Adapter

```
Implement Phase B1 of the Visual Node Graph Progress Map feature.

Context:
✅ Phase A (Backend) is COMPLETE: Conductor creates execution graph store internally, broadcasts updates via IPC
🚧 Phase B1 (Frontend): Create client-side store adapter

Task:
Create apps/client/src/stores/executionGraphStore.ts that:
1. Uses @atomiton/store to create a Zustand store
2. Subscribes to 'executionGraphStateUpdate' IPC events from conductor
3. Converts nodes array back to Map for React components
4. Exports useExecutionGraphStore for component usage

Follow the implementation code in Phase B1 section of .claude/strategies/VISUAL_NODE_GRAPH_PROGRESS.md.

Validation:
pnpm --filter @atomiton/client typecheck
pnpm --filter @atomiton/client build

Success criteria:
- Client receives and stores execution graph state updates
- React components can access store via useExecutionGraphStore.useStore()
- No TypeScript errors
```

Once your work is complete, please mark this phase as complete in the strategy
document and and work before it.

---

### Prompt for Phase B2: ReactFlow Components

```
Implement Phase B2 of the Visual Node Graph Progress Map feature.

Context:
✅ Phase B1 COMPLETE: Client store adapter is working
🚧 Phase B2: Build ReactFlow visualization components

Tasks:
1. Install dependency: pnpm --filter @atomiton/client add @dagrejs/dagre @types/dagre

2. Create three files in apps/client/src/templates/DebugPage/components/:
   - NodeGraphProgressMap.tsx (main graph container)
   - ExecutionNode.tsx (custom node with color-coded states)
   - layoutUtils.ts (dagre auto-layout)

Follow the complete implementation code in Phase B2 section of .claude/strategies/VISUAL_NODE_GRAPH_PROGRESS.md.

State colors:
- pending: #94a3b8
- executing: #3b82f6
- completed: #22c55e
- error: #ef4444
- skipped: #f59e0b

Critical path styling:
- boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'

Layout settings:
- direction: 'TB' (top-to-bottom)
- ranksep: 50
- nodesep: 30

Validation:
pnpm --filter @atomiton/client typecheck
pnpm --filter @atomiton/desktop dev

Success criteria:
- Graph renders without errors
- Nodes are properly positioned with dagre
- Critical path is visually distinct
- Color-coded states work correctly
```

---

### Prompt for Phase B3: FlowsPage Integration

```
Implement Phase B3 of the Visual Node Graph Progress Map feature.

Context:
✅ Phase B2 COMPLETE: ReactFlow components are built and tested
🚧 Phase B3: Integrate NodeGraphProgressMap into FlowsPage

Task:
Modify apps/client/src/templates/FlowsPage/FlowsPage.tsx to:
1. Import NodeGraphProgressMap component
2. Add it below FlowProgressBar
3. Show only during execution (conditional render with isExecuting)

Follow the implementation code in Phase B3 section of .claude/strategies/VISUAL_NODE_GRAPH_PROGRESS.md.

Validation:
pnpm --filter @atomiton/desktop dev
# Open flows page, execute a flow, verify graph appears and updates

Success criteria:
- Graph appears below progress bar during execution
- Layout is responsive and readable
- No visual glitches or overlaps
- Graph hides when execution completes
```

---

### Prompt for Phase B4: Testing & Performance

```
Complete Phase B4 of the Visual Node Graph Progress Map feature.

Context:
✅ Phase B3 COMPLETE: NodeGraphProgressMap is integrated into FlowsPage
🚧 Phase B4: Test and validate performance

Manual testing checklist:
1. Run hello-world-template flow
2. Verify nodes change color as they execute (pending → executing → completed)
3. Check critical path highlighting (red shadow)
4. Test with complex flows (20+ nodes)
5. Verify graph clears after execution completes

E2E test:
E2E_OUTPUT_DIR=/tmp/e2e-test pnpm --filter @atomiton/e2e test hello-world-template

Performance validation (use React DevTools Profiler):
- State updates: < 16ms (60fps)
- Initial render: < 100ms for 50 nodes
- No memory leaks

Success criteria:
- Graph updates smoothly without jank
- Performance targets met
- Visual: Critical path distinct, smooth transitions, readable layout
- No TypeScript errors, all tests pass

If performance issues found:
1. Add React.memo to ExecutionNode
2. Use useMemo for expensive calculations in NodeGraphProgressMap
3. Consider throttling store updates
```

---

## Summary

**Phase A (Backend) - ✅ COMPLETE**:

- Graph analysis in @atomiton/nodes/graph
- Execution graph store created internally by conductor
- Store updates broadcast through IPC
- Desktop channels wired to conductor.store

**Phase B (Frontend) - 🚧 TODO**:

- B1: Client store adapter (subscribe to IPC)
- B2: ReactFlow components (visualization)
- B3: FlowsPage integration (add graph below progress bar)
- B4: Testing & performance validation

Each phase has a clear prompt for execution. Complete one phase before moving to
the next.
