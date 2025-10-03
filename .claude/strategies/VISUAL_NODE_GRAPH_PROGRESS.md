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

**Test Coverage**: ✅

```bash
✅ 47 unit tests passing in @atomiton/conductor
✅ 7 integration tests for IPC broadcasting
✅ Test factories for reusable mock data
✅ Co-located test files following best practices
```

**Test Files Created**:
- `packages/@atomiton/conductor/src/exports/browser/types.test.ts` - NodeProgressEvent structure
- `packages/@atomiton/conductor/src/exports/browser/flow.test.ts` - RPC transport and flow validation
- `packages/@atomiton/conductor/src/exports/browser/index.test.ts` - Event aliases and API namespaces
- `packages/@atomiton/conductor/src/test-utils/factories.ts` - Reusable test fixtures
- `apps/desktop/src/integration/channels-progress-events.test.ts` - IPC broadcasting

**Validation**: ✅

```bash
✅ pnpm --filter @atomiton/rpc build
✅ pnpm --filter @atomiton/conductor build
✅ pnpm --filter @atomiton/conductor test (47/47 tests passing)
✅ pnpm --filter @atomiton/desktop test (6/6 tests passing)
✅ pnpm --filter @atomiton/desktop typecheck
✅ pnpm --filter @atomiton/client typecheck
✅ pnpm typecheck (all packages clean)
✅ pnpm lint:fix (conductor and desktop clean)
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
- ✅ **Comprehensive test coverage** with unit and integration tests
- ✅ **Test factories** for reusable mock data generation

---

### B2: Execution State Visualization (Leverage Existing Editor) ✅

**Strategy**: Reuse the existing `@atomiton/editor` package infrastructure instead
of building from scratch. This ensures visual consistency and makes future editor
integration trivial.

**Phase B2.1: Add Dagre Layout to Editor Package** ✅

**What was done**: Added auto-layout utilities to `@atomiton/editor` for use
across the application.

**Dependencies added**:

```bash
pnpm --filter @atomiton/editor add @dagrejs/dagre
pnpm --filter @atomiton/editor add -D @types/dagre
```

**Files created**:

- `packages/@atomiton/editor/src/utils/layout/dagre.ts` - Dagre auto-layout implementation
- `packages/@atomiton/editor/src/utils/layout/index.ts` - Layout utilities export
- Updated `packages/@atomiton/editor/src/index.ts` - Export layout functions

**Layout utilities provided**:

```typescript
// Main layout function with left-to-right default
export function getLayoutedElements<T>(
  nodes: ReactFlowNode<T>[],
  edges: ReactFlowEdge[],
  options?: {
    direction?: 'LR' | 'TB';  // 'LR' = left-to-right (default)
    nodeWidth?: number;
    nodeHeight?: number;
    rankSep?: number;
    nodeSep?: number;
  }
): { nodes: ReactFlowNode<T>[]; edges: ReactFlowEdge[] }

// Bounding box calculation for viewport fitting
export function getNodesBounds(nodes: ReactFlowNode[]): {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

**Validation**: ✅

```bash
✅ pnpm --filter @atomiton/editor typecheck
✅ pnpm --filter @atomiton/editor build
```

**Success criteria**: ✅

- ✅ Dagre layout utilities available in @atomiton/editor
- ✅ Left-to-right (LR) layout by default
- ✅ Configurable node dimensions and spacing
- ✅ TypeScript types properly exported
- ✅ No build errors

---

**Phase B2.2: Extend Node Component for Execution States** (TODO)

**What to do**: Add execution state visualization to the existing Node component
in @atomiton/editor.

**Files to modify**:

- `packages/@atomiton/editor/src/types/EditorNode.ts` - Add execution state types
- `packages/@atomiton/editor/src/components/Node/index.tsx` - Add state-based styling

**Implementation**:

```typescript
// types/EditorNode.ts
export type NodeExecutionState =
  | 'pending'
  | 'executing'
  | 'completed'
  | 'error'
  | 'skipped';

export type NodeData = {
  // Existing fields...
  metadata?: NodeMetadata;
  inputPorts?: EditorNodePort[];
  outputPorts?: EditorNodePort[];

  // NEW: Execution state fields
  executionState?: NodeExecutionState;
  isCriticalPath?: boolean;
  weight?: number;
}

// components/Node/index.tsx - Add state colors
const STATE_COLORS = {
  pending: '#94a3b8',
  executing: '#3b82f6',
  completed: '#22c55e',
  error: '#ef4444',
  skipped: '#f59e0b',
} as const;

function Node(props: ReactFlowNodeProps) {
  const data = props.data as NodeData | undefined;
  const executionState = data?.executionState;
  const isCriticalPath = data?.isCriticalPath;

  const borderColor = executionState
    ? STATE_COLORS[executionState]
    : undefined;

  const boxShadow = isCriticalPath
    ? '0 0 10px rgba(239, 68, 68, 0.5)'
    : undefined;

  return (
    <div
      className="atomiton-node"
      style={{
        borderColor,
        boxShadow,
        transition: 'all 0.3s ease'
      }}
    >
      {/* Existing node content */}
    </div>
  );
}
```

**Validation**:

```bash
pnpm --filter @atomiton/editor typecheck
pnpm --filter @atomiton/editor build
pnpm --filter @atomiton/editor test
```

**Success criteria**:

- Node component accepts executionState and isCriticalPath props
- Border color changes based on execution state
- Critical path nodes have red shadow effect
- Smooth transitions between states
- No breaking changes to existing editor usage

---

**Phase B2.3: Create ExecutionGraphViewer Component** (TODO)

**What to do**: Create a read-only viewer component in the client that uses the
Editor package to display execution state.

**Files to create**:

- `apps/client/src/templates/DebugPage/components/ExecutionGraphViewer.tsx`

**Implementation**:

```typescript
import { Editor, Canvas, getLayoutedElements } from '@atomiton/editor';
import { conductor } from '@atomiton/conductor/browser';
import { useState, useEffect } from 'react';
import type { NodeDefinition } from '@atomiton/nodes/definitions';
import type { Node as ReactFlowNode } from '@xyflow/react';

export function ExecutionGraphViewer({ flow }: { flow: NodeDefinition }) {
  const [nodes, setNodes] = useState<ReactFlowNode[]>([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    // Subscribe to unified progress events
    const unsubscribe = conductor.node.onProgress((event) => {
      // Transform event.nodes into ReactFlow nodes with execution states
      const executionNodes = event.nodes.map(node => ({
        id: node.id,
        type: node.type || 'default',
        position: node.position || { x: 0, y: 0 },
        data: {
          label: node.name,
          metadata: node.metadata,
          // Execution state fields
          executionState: node.state,
          isCriticalPath: event.graph.criticalPath.includes(node.id),
          weight: node.weight,
        },
      }));

      // Apply auto-layout (left-to-right as requested)
      const { nodes: layoutedNodes } = getLayoutedElements(
        executionNodes,
        event.graph.edges || [],
        { direction: 'LR' }  // Left-to-right layout
      );

      setNodes(layoutedNodes);
      setEdges(event.graph.edges || []);
    });

    return unsubscribe;
  }, []);

  if (nodes.length === 0) {
    return null;
  }

  return (
    <div className="execution-graph-viewer" style={{ height: '400px', width: '100%' }}>
      <Editor flow={flow}>
        <Canvas
          nodes={nodes}
          edges={edges}
          nodesDraggable={false}        // Read-only
          nodesConnectable={false}      // No connecting
          elementsSelectable={false}    // No selection
          fitView
        />
      </Editor>
    </div>
  );
}
```

**Key benefits**:

- ✅ **Reuses existing Editor/Canvas components** - No duplicate ReactFlow setup
- ✅ **Same visual appearance** - Consistency between editor and execution view
- ✅ **Left-to-right layout** - Already configured with dagre
- ✅ **Minimal code** - Just subscription logic and state mapping
- ✅ **Future editor integration trivial** - Just enable execution tracking in editor

**Validation**:

```bash
pnpm --filter @atomiton/client typecheck
pnpm --filter @atomiton/desktop dev
# Execute a flow in DebugPage and verify graph appears with colored states
```

**Success criteria**:

- Graph renders using existing Editor components
- Nodes display execution states with color-coded borders
- Critical path nodes have red shadow
- Auto-layout positions nodes left-to-right
- Updates smoothly as execution progresses
- Read-only (no dragging/connecting)

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

### Prompt for Phase B2.1: Add Dagre Layout to Editor

```
Implement Phase B2.1 of the Visual Node Graph Progress Map feature.

Context:
✅ Phase B1 COMPLETE: Unified progress event API with graph data
🚧 Phase B2.1: Add dagre auto-layout utilities to @atomiton/editor package

Strategy: Add layout utilities to the editor package so they can be reused
across the application and make future editor enhancements easier.

Tasks:
1. Install dependencies:
   pnpm --filter @atomiton/editor add @dagrejs/dagre
   pnpm --filter @atomiton/editor add -D @types/dagre

2. Create packages/@atomiton/editor/src/utils/layout/dagre.ts with:
   - getLayoutedElements() function (left-to-right default)
   - getNodesBounds() function for viewport fitting
   - Configurable options (direction, node dimensions, spacing)

3. Create packages/@atomiton/editor/src/utils/layout/index.ts to export utilities

4. Update packages/@atomiton/editor/src/index.ts to export layout functions

Follow the complete implementation code in Phase B2.1 section of .claude/strategies/VISUAL_NODE_GRAPH_PROGRESS.md.

Validation:
pnpm --filter @atomiton/editor typecheck
pnpm --filter @atomiton/editor build
pnpm --filter @atomiton/editor test

Success criteria:
- Dagre layout utilities available from @atomiton/editor
- Left-to-right (LR) layout by default (as requested by user)
- TypeScript types properly exported
- No build or test errors
```

Once complete, mark Phase B2.1 as complete and commit your work.

---

### Prompt for Phase B2.2: Extend Node Component for Execution States

```
Implement Phase B2.2 of the Visual Node Graph Progress Map feature.

Context:
✅ Phase B2.1 COMPLETE: Dagre layout utilities added to editor package
🚧 Phase B2.2: Extend Node component to support execution state visualization

Strategy: Modify the existing Node component in @atomiton/editor to accept
execution state props, ensuring visual consistency between editor and execution views.

Tasks:
1. Update packages/@atomiton/editor/src/types/EditorNode.ts:
   - Add NodeExecutionState type
   - Extend NodeData with executionState, isCriticalPath, weight fields

2. Update packages/@atomiton/editor/src/components/Node/index.tsx:
   - Add STATE_COLORS mapping
   - Apply border color based on executionState
   - Add critical path shadow effect
   - Add smooth transitions

Follow the complete implementation code in Phase B2.2 section of .claude/strategies/VISUAL_NODE_GRAPH_PROGRESS.md.

State colors:
- pending: #94a3b8
- executing: #3b82f6
- completed: #22c55e
- error: #ef4444
- skipped: #f59e0b

Critical path styling:
- boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
- transition: 'all 0.3s ease'

Validation:
pnpm --filter @atomiton/editor typecheck
pnpm --filter @atomiton/editor build
pnpm --filter @atomiton/editor test

Success criteria:
- Node component accepts execution state props
- Border colors change based on state
- Critical path nodes have red shadow
- Smooth transitions between states
- No breaking changes to existing editor usage
```

Once complete, mark Phase B2.2 as complete and commit your work.

---

### Prompt for Phase B2.3: Create ExecutionGraphViewer Component

```
Implement Phase B2.3 of the Visual Node Graph Progress Map feature.

Context:
✅ Phase B2.2 COMPLETE: Node component supports execution states
🚧 Phase B2.3: Create ExecutionGraphViewer component in client

Strategy: Leverage the existing Editor/Canvas components to create a read-only
execution graph viewer. This ensures visual consistency and makes future
editor integration trivial.

Task:
Create apps/client/src/templates/DebugPage/components/ExecutionGraphViewer.tsx

The component should:
1. Subscribe to conductor.node.onProgress() for unified progress events
2. Transform event.nodes into ReactFlow nodes with execution state data
3. Apply auto-layout with getLayoutedElements (direction: 'LR')
4. Render using existing Editor and Canvas components
5. Configure Canvas as read-only (no dragging/connecting/selection)

Follow the complete implementation code in Phase B2.3 section of .claude/strategies/VISUAL_NODE_GRAPH_PROGRESS.md.

Key imports:
- import { Editor, Canvas, getLayoutedElements } from '@atomiton/editor';
- import { conductor } from '@atomiton/conductor/browser';

Layout configuration:
- direction: 'LR' (left-to-right as requested)
- Auto-fit viewport with fitView prop

Validation:
pnpm --filter @atomiton/client typecheck
pnpm --filter @atomiton/desktop dev
# Execute a flow in DebugPage and verify graph appears with colored states

Success criteria:
- Graph renders using existing Editor components
- Nodes display execution states with color-coded borders
- Critical path nodes have red shadow
- Auto-layout positions nodes left-to-right
- Updates smoothly as execution progresses
- Read-only interaction (no dragging/connecting)
```

Once complete, mark Phase B2.3 as complete and commit your work.

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
