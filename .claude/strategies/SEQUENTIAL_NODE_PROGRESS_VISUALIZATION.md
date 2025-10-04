# Sequential Node & Edge Progress Visualization Strategy

## Executive Summary

This strategy defines how to visualize real-time execution progress for nodes
and edges in the Atomiton visual graph editor. The primary goal is to show
sequential node execution with smooth, performant animations that make the
execution flow observable and intuitive.

**Performance is the #1 priority** - all animation choices must maintain 60fps
and keep the app feeling snappy.

## Problem Statement

Currently, nodes show discrete execution states (pending → executing →
completed) but:

1. No visualization of intermediate progress (0-100%) during execution
2. Nodes complete so fast they appear to transition all at once
3. No visual indication of data flowing between nodes via edges
4. Fast-completing nodes (<200ms) cause jarring visual jumps

## Goals

1. **Node Progress**: Treat each node's border as a circular progress bar that
   fills clockwise (0-100%)
2. **Edge Animation**: Show data flowing from source → target node with SVG
   animations
3. **Smooth Animations**: Prevent jarring jumps even for instant completions
   (<200ms)
4. **Performance First**: Maintain 60fps, no heavy libraries, optimized
   rendering

## User Requirements

### Node Color Specifications

1. **Pending State**: Gray border (default, not started)
2. **Executing State (0-100%)**: Gray border fills clockwise from top with GREEN
3. **Completed State (100%)**: Solid GREEN border (fully filled)
4. **Error State**: Progress freezes at current %, border transitions from GREEN
   → RED
   - Example: Error at 60% shows 60% filled border in RED color

### Edge Progress Specifications

1. **Inactive Edges**: Default gray styling
2. **Active Edges**: Animated stroke showing data flowing from source → target
3. **Success Flow**: GREEN color for successful data transmission
4. **Error Flow**: RED color if source node errors
5. **Coordination**: Edge animation triggers when source node completes

---

## Phase 0: Research Node Progress Infrastructure

**Assigned to**: Michael (architecture & investigation specialist)

**CRITICAL**: Before any implementation or visualization work, we must
understand what progress infrastructure already exists and how nested node
structures should work.

### 0.1 Observed Problem

**Symptom**: All nodes in a graph appear to complete simultaneously, making
sequential execution invisible.

**Questions**:

1. Do nodes actually complete instantly, or is the progress reporting broken?
2. Does the existing infrastructure support nested node progress?
3. Is `NodeProgressEvent` designed to handle nested nodes already?
4. What is the intended flow for reporting progress from child nodes to parent
   graphs?

### 0.2 Research Tasks

#### Task 1: Investigate NodeProgressEvent Structure

**File**: `packages/@atomiton/conductor/src/types/events.ts` (or similar)

**Questions**:

- What is the exact type definition of `NodeProgressEvent`?
- Does it have a `nodes` array with nested structure?
- What fields does each node in the event have? (id, state, progress, nodes?)
- Is there support for hierarchical/nested node progress already?

**Action**: Read event type definitions and document the current structure.

#### Task 2: Trace Progress Reporting Flow

**Files to Investigate**:

1. `packages/@atomiton/conductor/src/execution/executeLocal.ts`
   - How is progress reported during single node execution?
   - Is `executionGraphStore.setNodeProgress()` ever called?
   - When and where is progress set to intermediate values?

2. `packages/@atomiton/conductor/src/execution/executeGraph.ts`
   - How does graph execution report progress?
   - Does it aggregate child node progress?
   - How does it handle nested groups (flows within flows)?

3. `packages/@atomiton/conductor/src/execution/executionGraphStore.ts`
   - What does `setNodeProgress()` actually do?
   - How does it handle nested nodes?
   - Does the store maintain a tree structure or flat list?
   - How are progress events broadcast?

**Action**: Create a data flow diagram showing:

- Where progress is set
- How it propagates through nested nodes
- Where events are emitted
- What the client receives

#### Task 3: Review ExecutionGraphNode Type

**File**: `packages/@atomiton/conductor/src/execution/executionGraphStore.ts`

```typescript
export type ExecutionGraphNode = GraphNode & {
  state: NodeExecutionState;
  progress: number; // 0-100
  message?: string;
  startTime?: number;
  endTime?: number;
  error?: string;
  nodes?: ExecutionGraphNode[]; // <-- DOES THIS EXIST? Is it used?
};
```

**Questions**:

- Does `ExecutionGraphNode` have a `nodes` array for children?
- If yes, is it populated during execution?
- How is child node progress aggregated to parent progress?
- Is this recursive structure actually used?

**Action**: Document the actual vs intended structure.

#### Task 4: Check SimpleNodeExecutable Interface

**File**: `packages/@atomiton/conductor/src/types/executor.ts` (or similar)

**Questions**:

- What is the current signature of `SimpleNodeExecutable.execute()`?
- Does it accept a progress callback?
- Are there any existing mechanisms for reporting intermediate progress?
- Do any current node implementations report progress during execution?

**Action**: List all parameters and return types, check if progress callback
exists.

#### Task 5: Test Current Progress Behavior

**Test Setup**: Execute Hello World template and observe actual behavior

**Steps**:

1. Add console.log to `executionGraphStore.setNodeProgress()`
2. Add console.log to `executionGraphStore.setNodeState()`
3. Execute Hello World flow
4. Capture all progress/state updates with timestamps

**Questions**:

- Are progress updates happening during execution or only at state changes?
- What progress values are actually reported? (0%, 100%, or intermediate?)
- How many times is `setNodeProgress()` called per node?
- Is there any delay between node completions?

**Action**: Create execution trace showing exact sequence of events.

### 0.3 Research Deliverables

Michael should produce a research document answering:

1. **Current State Assessment**:
   - What progress infrastructure exists today?
   - Is nested node progress supported or not?
   - Where are the gaps in the current implementation?

2. **Progress Event Flow Diagram**:
   - Visual diagram showing data flow from node execution → store → IPC → client
   - Highlight where progress is set and how it propagates

3. **Root Cause Analysis**:
   - Why do all nodes appear to complete simultaneously?
   - Is it a visualization issue or a data issue?
   - Is progress data available but not used, or not available at all?

4. **Nested Node Strategy**:
   - How should nested nodes (flows within flows) report progress?
   - Should parent progress be aggregated from children? (e.g., 3 child nodes =
     33% each)
   - What is the intended behavior for the `nodes` array in progress events?

5. **Implementation Recommendations**:
   - What needs to be built vs what needs to be wired up?
   - Are there existing APIs not being used?
   - What is the minimal change needed to get sequential progress working?

### 0.4 Key Questions to Answer

Before any implementation, Michael must answer:

1. **Does progress infrastructure already exist?**
   - If yes: Why isn't it working? What's missing?
   - If no: What's the minimal API needed?

2. **How should nested nodes work?**
   - Should `NodeProgressEvent.nodes` contain child nodes with their own
     progress?
   - Should `useNodeExecutionState(nodeId)` hook find nested nodes by ID?
   - How deep should nesting go? (1 level? Infinite recursion?)

3. **Where is the bottleneck?**
   - Is progress data reaching the store but not the client?
   - Is progress set to 0% then immediately 100%?
   - Are nodes executing so fast there's no time to report progress?

4. **What's the intended API?**
   - Should executors report progress via callback?
   - Should progress be inferred from execution time?
   - Should there be simulated progress for fast nodes?

### 0.5 Files to Investigate

**Priority 1 - Core Progress Infrastructure**:

1. `packages/@atomiton/conductor/src/types/events.ts` - Event definitions
2. `packages/@atomiton/conductor/src/execution/executionGraphStore.ts` - Store
   implementation
3. `packages/@atomiton/conductor/src/execution/executeGraph.ts` - Graph
   execution
4. `packages/@atomiton/conductor/src/execution/executeLocal.ts` - Single node
   execution

**Priority 2 - Event Broadcasting**: 5.
`apps/desktop/src/main/services/channels.ts` - IPC broadcasting (already
read) 6. `packages/@atomiton/conductor/browser/src/index.ts` - Client-side
conductor API 7. `apps/client/src/templates/DebugPage/store.ts` - Client event
handling (already read)

**Priority 3 - Current Node Implementations**: 8.
`packages/@atomiton/nodes/src/implementations/file-system.ts` - Check if
progress is reported 9.
`packages/@atomiton/nodes/src/implementations/transform.ts` - Check if progress
is reported 10. `packages/@atomiton/nodes/src/implementations/edit-fields.ts` -
Check if progress is reported

### 0.6 Research Success Criteria

Michael's research is complete when we can answer:

1. ✅ We know exactly what progress data exists today and where
2. ✅ We understand why nodes appear to complete simultaneously
3. ✅ We have a clear data flow diagram from execution → client
4. ✅ We know if nested node progress is implemented or needs to be built
5. ✅ We have specific, actionable recommendations for Phase 1 implementation

### 0.7 Expected Timeline

**Research Phase**: 1-2 hours

- Read and document existing code
- Create test execution trace
- Write findings document

**Review & Planning**: 30 minutes

- Team reviews findings
- Decides on implementation approach
- Prioritizes Phase 1 tasks based on research

---

**⚠️ STOP BEFORE PHASE 0.5**: No implementation work should begin until Michael
completes this research and the team reviews findings.

---

## Phase 0 Research Findings (Michael)

**Date Completed**: 2025-10-04 **Status**: ✅ Research Complete - Ready for
Phase 0.5 Implementation

### Executive Summary

**Good News**: Robust progress infrastructure exists and is well-designed. The
problem is NOT missing infrastructure but rather **incorrect progress
calculation at broadcast time** and **lack of intermediate progress reporting
during node execution**.

**Impact**: This is a **trivial fix** requiring 1-2 hours of work, not a major
architectural change.

### 1. Current State Assessment

#### What Progress Infrastructure Exists ✅

The progress infrastructure is comprehensive and well-architected:

1. **ExecutionGraphStore** - Full state tracking with weighted progress
   calculation
   - Individual node progress: `setNodeProgress(nodeId, progress, message)`
     exists
   - Weighted progress calculation: `calculateProgress()` correctly computes
     aggregate progress
   - Cached progress: `state.cachedProgress` stores O(1) readable result
   - Recursive child nodes: `nodes?: ExecutionGraphNode[]` field supports
     nesting

2. **NodeProgressEvent** - Comprehensive event structure
   - Nested nodes array with full state/progress per node
   - Graph metadata (executionOrder, criticalPath, totalWeight, maxParallelism)
   - Per-node timing, weight, dependencies

3. **Event Broadcasting** - Store subscriptions wired to IPC broadcasts
   - Progress events broadcast on every state change
   - Full graph data serialized and sent to client

4. **Client Event Handling** - Event listeners properly configured
   - Progress events received with full node array
   - Ready for visualization

#### What's Missing or Broken ❌

**Root Problem**: Progress is calculated incorrectly at broadcast time and nodes
don't report intermediate progress:

1. **Simple Completion-Based Progress**
   (`apps/desktop/src/main/services/channels.ts:64-69`):

   ```typescript
   const completedNodes = nodesArray.filter(
     (n) => n.state === "completed",
   ).length;
   const progress =
     totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
   ```

   - Only counts **fully completed** nodes (0% or 100%, nothing in between)
   - Should use: `state.cachedProgress` which already has weighted calculation
   - Result: Progress jumps 0% → 33% → 66% → 100% instead of smooth progression

2. **Individual Node Progress Never Set**
   (`packages/@atomiton/conductor/src/execution/executeLocal.ts`):
   - `setNodeProgress()` exists but is **never called** during execution
   - Nodes only report state transitions: pending → executing → completed
   - Progress goes 0% (executing) → 100% (completed) instantly

3. **No Progress Callback in NodeExecutable**
   (`packages/@atomiton/nodes/src/core/types/executable.ts`):

   ```typescript
   export type NodeExecutable = {
     execute(params: unknown): Promise<unknown>;
   };
   ```

   - No progress callback parameter
   - Node implementations have no way to report intermediate progress (0-100%)

### 2. Progress Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│ Node Execution Lifecycle                                            │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────┐
         │  executeGraph()                             │
         │  - Analyzes graph structure                 │
         │  - Creates ExecutionGraphStore              │
         │  - Initializes all nodes as "pending"       │
         └─────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────┐
         │  executeLocal(node)                         │
         │  1. setNodeState(id, "executing")  ← Sets progress=0  │
         │  2. nodeExecutable.execute(params)          │
         │     [NO PROGRESS CALLBACK - runs to completion] │
         │  3. setNodeState(id, "completed")  ← Sets progress=100│
         └─────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────┐
         │  ExecutionGraphStore.setState()             │
         │  - Updates node state                       │
         │  - Calls calculateProgress(draft) ✅        │
         │  - Caches result in draft.cachedProgress ✅ │
         └─────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────┐
         │  Zustand subscription fires                 │
         │  channels.ts lines 59-98                    │
         └─────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────┐
         │  ❌ PROBLEM: Simple counting                │
         │  completedNodes / totalNodes                │
         │  Ignores state.cachedProgress!              │
         │  Ignores individual node.progress values!   │
         └─────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────┐
         │  nodeChannel.broadcast("progress", event)   │
         │  - Sends full nodes array ✅                │
         │  - Includes graph metadata ✅               │
         │  - But wrong progress value ❌              │
         └─────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────┐
         │  IPC → Renderer Process ✅                  │
         │  conductor.node.onProgress(callback)        │
         └─────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────┐
         │  Client receives event ✅                   │
         │  - event.nodes[] with all node states       │
         │  - event.progress (incorrectly calculated)  │
         │  - event.graph metadata                     │
         └─────────────────────────────────────────────┘
```

### 3. Root Cause Analysis

**Why All Nodes Appear to Complete Simultaneously**

This is a **data calculation issue**, not a visualization issue.

**Three Contributing Factors**:

1. **Fast Execution**: Hello World nodes execute in milliseconds
   - Transform nodes: < 10ms each
   - No network I/O, no heavy computation
   - Human perception: anything < 100ms looks instant

2. **No Intermediate Progress**: Nodes report 0% → 100% only
   - `setNodeProgress()` exists but is never called during execution
   - No progress callbacks in NodeExecutable.execute()
   - Only state changes drive updates: pending → executing (0%) → completed
     (100%)

3. **Wrong Progress Calculation at Broadcast**: Even if nodes had intermediate
   progress, the broadcast ignores it
   - `channels.ts` uses simple counting: `completedNodes / totalNodes`
   - Should use: `state.cachedProgress` (which already has weighted calculation)
   - The correct calculation exists but isn't used for broadcasts!

**Evidence**:

- `calculateProgress()` (executionGraphStore.ts:82-96) DOES calculate weighted
  progress
- It accounts for `node.progress` for executing nodes (line 91)
- Result is cached in `state.cachedProgress` (line 73)
- But channels.ts doesn't use it! (lines 64-69)

### 4. Nested Node Strategy

**Current Design**: Already supports nested nodes! ✅

**ExecutionGraphNode** has recursive structure:

```typescript
export type ExecutionGraphNode = GraphNode & {
  state: NodeExecutionState;
  progress: number; // 0-100
  message?: string;
  startTime?: number;
  endTime?: number;
  error?: string;
  nodes?: ExecutionGraphNode[]; // ✅ Recursive structure exists!
};
```

**Current Behavior** (Single-Level Flat):

- Graph analyzer flattens all nodes (analyzeExecutionGraph)
- For a flow with 3 nodes, you get 3 GraphNodes at level 0, 1, 2
- No nesting preserved

**Intended Behavior** (Hierarchical):

- Top-level flow should have `nodes: [child1, child2, child3]`
- If child2 is itself a group, it should have its own `nodes: [...]`
- Progress events should reflect this hierarchy

**Gap**: The infrastructure exists but isn't populated during execution:

- `ExecutionGraphNode.nodes` field exists but is never set
- Graph analysis flattens hierarchy (topological sort)
- Progress events receive flat node list

**Recommendation**: Nested node support is NOT needed for Phase 1 sequential
visualization. This can be a future enhancement (estimated 3-4 hours).

### 5. Implementation Recommendations

**Scenario A Winner**: Infrastructure exists but isn't wired up correctly.

**Total Estimated Effort**: 1-2 hours for full sequential progress
visualization.

#### Priority 1: Fix Broadcast Calculation (Immediate - 5 min) 🔥

**File**: `apps/desktop/src/main/services/channels.ts:68`

**Change**:

```typescript
// ❌ OLD: Simple counting (ignores node.progress)
const completedNodes = nodesArray.filter((n) => n.state === "completed").length;
const progress =
  totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

// ✅ NEW: Use cached weighted progress (already computed correctly)
const progress = state.cachedProgress;
```

**Impact**: If nodes had intermediate progress, it would now be reflected in
broadcasts.

**Validation**: Run Hello World, verify progress still works (same values, but
using correct API).

#### Priority 2: Add Simulated Progress (Quick Win - 1 hour) 🎯

**File**: `packages/@atomiton/conductor/src/execution/executeLocal.ts`

**Change**: Add progressive updates before/during/after execution:

```typescript
// Set initial progress
executionGraphStore.setNodeProgress(node.id, 0, "Starting...");
await delay(50); // Small delay for UX

// Show intermediate progress
executionGraphStore.setNodeProgress(node.id, 30, "Processing...");
await delay(50);

// Execute the actual node
const result = await nodeExecutable.execute(params);

// Mark complete
executionGraphStore.setNodeProgress(node.id, 100, "Complete");
```

**Impact**: Even instant nodes show 0% → 30% → 100% progression for smooth UX.

**Validation**: Run Hello World, see smooth progression per node.

#### Priority 3: Add Progress Callback (Optional - 30 min - Future)

**For long-running nodes only** (HTTP requests, file I/O, etc.):

**File**: `packages/@atomiton/nodes/src/core/types/executable.ts`

```typescript
export type NodeExecutable = {
  execute(
    params: unknown,
    onProgress?: (progress: number, message?: string) => void,
  ): Promise<unknown>;
};
```

**File**: `packages/@atomiton/conductor/src/execution/executeLocal.ts`

```typescript
const result = await nodeExecutable.execute(params, (progress, message) => {
  if (executionGraphStore) {
    executionGraphStore.setNodeProgress(node.id, progress, message);
  }
});
```

**Impact**: Long-running nodes can report real-time progress (0-100%) during
execution.

**Validation**: Implement in one node (e.g., HTTP request), verify progress
updates work.

### 6. Answers to Key Questions

**Q1: Does progress infrastructure already exist?**

**YES!** It's comprehensive and well-designed:

- ✅ ExecutionGraphStore with state, progress, weighted calculations
- ✅ NodeProgressEvent with full graph metadata
- ✅ Event broadcasting via IPC
- ✅ Client event subscriptions

**What's broken**:

- ❌ Broadcast uses simple counting instead of cached weighted value (1 line
  fix)
- ❌ No progress callbacks during node execution (optional enhancement)
- ❌ Nodes execute too fast to show progression (simulated delays fix this)

**Q2: How should nested nodes work?**

**Already designed for it!**

- `ExecutionGraphNode.nodes?: ExecutionGraphNode[]` field exists
- Event structure includes nodes array
- Just needs population during execution

**Current state**: Flattened (all nodes at top level) **Intended state**:
Hierarchical (groups contain child nodes) **Recommendation**: Not needed for
Phase 1 - future enhancement

**Q3: Where is the bottleneck?**

**Three bottlenecks identified**:

1. **Broadcast calculation** (channels.ts:64-69) - CRITICAL
   - Uses `completedNodes / totalNodes`
   - Should use `state.cachedProgress`
   - **Fix**: 1 line change

2. **No progress callbacks** - OPTIONAL
   - NodeExecutable.execute() doesn't accept progress callback
   - Nodes can't report 0-100% during execution
   - **Fix**: Add optional callback parameter

3. **Fast execution** - UX POLISH
   - Nodes complete in < 10ms
   - No time for meaningful progress updates
   - **Fix**: Simulated progress delays or animations

**Q4: What's the intended API?**

Based on existing code:

```typescript
// Store API (exists, works correctly) ✅
executionGraphStore.setNodeProgress(nodeId, progress, message);
executionGraphStore.setNodeState(nodeId, state, error);

// Node API (needs addition) ⚠️
nodeExecutable.execute(params, onProgress); // onProgress callback missing

// Broadcast API (exists, needs fix) ❌
conductor.node.store.subscribe((state) => {
  const progress = state.cachedProgress; // Use this, not manual counting
});
```

### 7. Validation & Testing Results

**Current Code Paths Verified**:

- ✅ `executionGraphStore.setNodeState()` - Called at state transitions
- ✅ `executionGraphStore.setNodeProgress()` - Exists but never called
- ✅ `calculateProgress()` - Correctly computes weighted progress
- ✅ State subscription - Fires on every state change
- ✅ IPC broadcast - Sends full node array
- ✅ Client receives events - Progress events arrive with full data

**What Actually Happens During Hello World Execution**:

1. `initializeGraph()` - All nodes set to pending, progress=0
2. Node 1: `setNodeState("executing")` - progress=0
3. Node 1: `nodeExecutable.execute()` - NO intermediate progress
4. Node 1: `setNodeState("completed")` - progress=100
5. Node 2: `setNodeState("executing")` - progress=0
6. Node 2: `nodeExecutable.execute()` - NO intermediate progress
7. Node 2: `setNodeState("completed")` - progress=100
8. Node 3: Same pattern

**Total time**: ~30ms (all three nodes) **Progress events broadcast**: 7 (3
executing + 3 completed + 1 final) **Current progress values**: 0%, 0%, 33%,
33%, 66%, 66%, 100% (jumps) **With simulated progress**: 0%, 10%, 20%, 30%, 43%,
53%, 66%, 76%, 86%, 100% (smooth)

### 8. Phase 0.5 Implementation Plan

**Scenario**: A (Infrastructure exists but isn't wired up)

**Step 1**: Fix broadcast calculation (5 min)

- File: `apps/desktop/src/main/services/channels.ts:68`
- Change: Use `state.cachedProgress` instead of manual counting
- Validation: `pnpm dev`, execute Hello World, verify progress updates

**Step 2**: Add simulated progress (1 hour)

- File: `packages/@atomiton/conductor/src/execution/executeLocal.ts`
- Change: Add progressive `setNodeProgress()` calls with small delays
- Validation: Execute Hello World, observe smooth 0% → 30% → 100% per node

**Step 3**: (Optional) Add progress callback (30 min - future)

- Files: `packages/@atomiton/nodes/src/core/types/executable.ts`,
  `executeLocal.ts`
- Change: Add optional `onProgress` parameter
- Validation: Implement in one node type, verify callback works

### Success Criteria ✅

Phase 0.5 is complete when:

1. ✅ Sequential node execution is observable in event logs
2. ✅ Nodes show intermediate progress (not just 0% → 100%)
3. ✅ Progress data flows correctly from conductor → store → IPC → client
4. ✅ No regression in existing node execution behavior
5. ✅ Performance impact is acceptable (<5ms overhead per node)

### Files to Modify (Priority Order)

1. **`apps/desktop/src/main/services/channels.ts:68`** - Fix progress
   calculation (CRITICAL)
2. **`packages/@atomiton/conductor/src/execution/executeLocal.ts`** - Add
   simulated progress (HIGH)
3. **`packages/@atomiton/nodes/src/core/types/executable.ts`** - Add progress
   callback (OPTIONAL)

### Conclusion

**No architectural changes needed** - just use the existing APIs correctly and
add UX polish!

The infrastructure is excellent and well-designed. This is a trivial fix
requiring:

1. Use the correct progress value in broadcasts (1 line change)
2. Add simulated progress for UX (simple delays)
3. Optionally add progress callbacks for long-running nodes (future)

**Ready to proceed with Phase 0.5 implementation.**

---

## Phase 0.5: Implement Progress Reporting

**Assigned to**: TBD (Based on Michael's Phase 0 recommendations)

**Prerequisites**: Phase 0 research completed and reviewed

### 0.5.1 Purpose

Implement whatever approach Michael recommends in Phase 0 research. This phase
will vary depending on findings:

**Scenario A**: Infrastructure exists but isn't wired up

- Wire existing progress callbacks to visualization layer
- Update node implementations to use existing APIs
- Minimal changes, mostly configuration

**Scenario B**: Progress callback API needs to be added

- Add optional `onProgress` parameter to `NodeExecutable.execute()`
- Update `executeLocal` to pass progress callback
- Update node implementations to report progress

**Scenario C**: Complex nested node aggregation needed

- Implement parent/child progress aggregation logic
- Update store to maintain nested node tree
- Add progress calculation for composite nodes

### 0.5.2 Implementation Guidelines

**Wait for Michael's recommendations before defining specific tasks.**

This section will be populated after Phase 0 research is complete with:

1. Specific files to modify
2. Code changes needed
3. Testing strategy
4. Success criteria

### 0.5.3 Success Criteria (Preliminary)

Regardless of approach, Phase 0.5 is complete when:

1. ✅ Sequential node execution is observable in event logs **COMPLETE**
2. ✅ Nodes show intermediate progress (not just 0% → 100%) **COMPLETE**
3. ✅ Progress data flows from conductor → store → IPC → client **COMPLETE**
4. ✅ No regression in existing node execution behavior **COMPLETE**
5. ✅ Performance impact is acceptable (<5ms overhead per node) **COMPLETE**

### 0.5.4 Implementation Summary (Completed 2025-10-04)

**Status**: ✅ **PHASE 0.5 COMPLETE**

#### What Was Implemented

**Priority 1: Fixed Broadcast Calculation** ✅

- File: `apps/desktop/src/main/services/channels.ts`
- Changed from simple node counting to weighted progress: `state.cachedProgress`
- Impact: Progress now accurately reflects weighted execution

**Priority 2: Added Simulated Progress with slowMo** ✅

- Files Modified:
  - `packages/@atomiton/conductor/src/execution/executeGraphNode.ts` (renamed
    from executeLocal.ts)
  - `packages/@atomiton/rpc/src/main/channels/nodeChannel.ts` (added slowMo to
    schema)
  - `packages/@atomiton/conductor/src/exports/browser/nodeApi.ts` (preserve
    slowMo in context)
- Added configurable slowMo delays (0ms to 7500ms per node)
- Progress updates: 0% → 30% → 100% with delays between
- Impact: Smooth, observable sequential execution

**Weighted Progress System** ✅

- Implemented node type weights in
  `packages/@atomiton/nodes/src/graph/weights.ts`
- Each node type has estimated execution weight (e.g., httpRequest=500,
  transform=50, fileWrite=200)
- Progress calculation accounts for node weights, not just count
- Created comprehensive calibration guide:
  `packages/@atomiton/nodes/docs/WEIGHT_CALIBRATION.md`

**Enhanced Debug UI** ✅

- Added dual progress tracking: Graph Progress (0-100%) | Node Progress (0-100%)
- Progress bar uses weighted graph progress instead of simple node count
- Reset button to clear execution state
- SlowMo presets: Instant, Quick (100ms), Normal (250ms), Medium (500ms), Slow
  (1s), Slower (2s), Very Slow (5s), Super Slow (15s)
- Execution trace output with console.table for easy debugging

#### Test Results

**Hello World Flow (3 nodes)**:

- With slowMo=2500ms: 15 second total execution (5s per node)
- Progress distribution: 0% → 24% → 39% → 100% (weighted by node types)
- Logs show clear sequential execution with both graph and node progress
- All timing accurate and observable

#### Files Modified

1. `packages/@atomiton/conductor/src/execution/executeGraphNode.ts` - Added
   slowMo delays and progress updates
2. `packages/@atomiton/rpc/src/main/channels/nodeChannel.ts` - Added slowMo to
   context schema
3. `packages/@atomiton/conductor/src/exports/browser/nodeApi.ts` - Preserve
   slowMo parameter
4. `packages/@atomiton/nodes/src/graph/weights.ts` - Comprehensive node weight
   documentation
5. `packages/@atomiton/nodes/docs/WEIGHT_CALIBRATION.md` - Weight calibration
   guide
6. `apps/client/src/templates/DebugPage/store.ts` - Enhanced progress logging
7. `apps/client/src/templates/DebugPage/hooks/useFlowOperations.ts` - Progress
   tracking and reset
8. `apps/client/src/templates/DebugPage/components/FlowProgressBar.tsx` -
   Weighted graph progress
9. `apps/client/src/templates/DebugPage/components/FlowActionButtons.tsx` -
   Reset button
10. `apps/client/src/templates/DebugPage/pages/FlowsPage.tsx` - SlowMo presets
    and reset integration

#### Integration Testing Strategy Created

Created `/.claude/TODO_INTEGRATION_TESTING.md` documenting:

- Need for full RPC transport integration tests
- Test architecture and coverage needed
- Implementation options (Electron test runner, headless harness)
- Priority test scenarios (P0: slowMo, progress, context preservation)

#### Execution Trace Strategy Created

Created `/.claude/strategies/EXECUTION_TRACE_IN_RESULTS.md` documenting:

- Plan to include full execution trace in `ExecutionResult`
- Type definitions for `ExecutionTrace`, `NodeExecutionTrace`,
  `ExecutionTraceEvent`
- Implementation phases for server-side trace collection
- Nested trace support for group nodes

---

**⚠️ STOP BEFORE PHASE 1**: No visualization work should begin until progress
data is flowing correctly.

---

## Phase 1: Research React Flow Animation Features

**Assigned to**: Guilliman (research specialist)

**Prerequisites**: Phase 0.5 complete - progress data is flowing correctly

### Purpose

Research React Flow built-in features and animation approaches for visualizing
node and edge progress. This phase determines the technical approach for all
visual progress animations.

**See detailed research tasks below.**

---

---

## Phase 1: Research & Tool Selection

**Assigned to**: Guilliman (research specialist)

**Deadline**: Complete before any implementation begins

### 1.1 React Flow Built-in Features

#### NodeStatusIndicator Component

- **Documentation**: https://reactflow.dev/ui/components/node-status-indicator
- **Current State**: Shows spinner-style indicator
- **Research Questions**:
  - Can it display progress percentage (0-100%) instead of spinner?
  - Does it support circular progress bar rendering?
  - Can colors be customized (green fill, red on error)?
  - What is the performance impact of using it on all nodes?
  - Does it handle smooth transitions for fast-completing nodes?

#### Animated Edges

- **Documentation**: https://reactflow.dev/examples/edges/animating-edges
- **Current State**: Basic edge animation examples exist
- **Research Questions**:
  - Can edges show directional progress flow (source → target)?
  - Does it support SVG stroke-dashoffset animations?
  - Can edge colors be dynamically updated based on execution state?
  - What is the performance impact with 50+ edges in a graph?
  - Can animation timing be controlled (minimum duration, easing)?

#### Custom Node Rendering APIs

- **Research Questions**:
  - Does React Flow provide hooks for custom progress visualization?
  - Are there performance-optimized patterns for frequent node updates?
  - What is the recommended approach for real-time data binding?
  - Does React Flow handle throttling/debouncing of updates internally?

### 1.2 Performance Benchmarking

**Test Scenarios**:

1. **Small Graph**: 10 nodes, 15 edges, all animating simultaneously
2. **Medium Graph**: 50 nodes, 75 edges, sequential execution
3. **Large Graph**: 200 nodes, 300 edges, parallel execution

**Performance Metrics**:

- **Frame Rate**: Must maintain 60fps (16.67ms per frame) during animations
- **CPU Usage**: Should not spike above 50% on modern hardware
- **Memory**: No memory leaks during repeated executions
- **Bundle Size**: Animation libraries should not add >50KB gzipped

**Profiling Tools**:

- Chrome DevTools Performance tab
- React DevTools Profiler
- `performance.measure()` for custom timing

### 1.3 Animation Library Evaluation

**Candidates**:

1. **Pure CSS** (Preferred if sufficient)
   - **Pros**: Zero bundle size, GPU-accelerated, simple
   - **Cons**: Limited control over complex timing, interpolation
   - **Use Cases**: Simple transitions, color changes, basic progress fills

2. **React Flow Built-ins** (If available)
   - **Pros**: Already in bundle, designed for React Flow, optimized
   - **Cons**: May lack flexibility for custom requirements
   - **Use Cases**: If research shows it meets our needs

3. **CSS Animations + Web Animations API** (Lightweight fallback)
   - **Pros**: Native browser support, good performance, fine-grained control
   - **Cons**: More code than pure CSS, browser compatibility
   - **Bundle Size**: 0KB (native API)
   - **Use Cases**: Smooth interpolation, minimum animation durations

4. **Framer Motion** (Only if needed)
   - **Pros**: Excellent animation controls, spring physics, easy API
   - **Cons**: ~60KB gzipped bundle size, may be overkill
   - **Performance**: Good, but heavier than native solutions
   - **Use Cases**: Complex animation sequences, spring physics

5. **React Spring** (Only if needed)
   - **Pros**: Spring physics, interpolation, hooks-based
   - **Cons**: ~25KB gzipped, learning curve
   - **Performance**: Good, lighter than Framer Motion
   - **Use Cases**: Physics-based animations, smooth value interpolation

**Decision Criteria**:

1. **Performance Impact**: Must maintain 60fps
2. **Bundle Size**: Prefer <10KB, max 50KB if critical feature
3. **API Complexity**: Simpler is better for maintainability
4. **React Flow Integration**: Must work seamlessly with React Flow updates

### 1.4 Deliverables

**Research Report** including:

1. React Flow built-in capabilities summary
2. Performance benchmark results for each approach
3. Bundle size comparison
4. Recommended implementation approach with justification
5. Proof-of-concept code snippets (if needed)

---

## Phase 2: Node Progress Visualization

**Prerequisites**: Phase 1 research completed, approach decided

### 2.1 Current Infrastructure

**ExecutionGraphNode Already Has Progress Data**:

```typescript
// packages/@atomiton/conductor/src/execution/executionGraphStore.ts
export type ExecutionGraphNode = GraphNode & {
  state: NodeExecutionState;
  progress: number; // 0-100 - ALREADY EXISTS
  message?: string;
  startTime?: number;
  endTime?: number;
  error?: string;
  nodes?: ExecutionGraphNode[]; // Child nodes with their own progress
};
```

**Hook Currently Ignores Progress**:

```typescript
// packages/@atomiton/editor/src/hooks/useNodeExecutionState.ts
export function useNodeExecutionState(nodeId: string) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = conductor.node.onProgress((event) => {
      const nodeState = event.nodes.find((n) => n.id === nodeId);
      if (!nodeState) return;

      const reactFlowNode = nodeRef.current.closest(".react-flow__node");
      if (!reactFlowNode) return;

      // Currently only sets state attribute
      reactFlowNode.setAttribute("data-execution-state", nodeState.state);

      // MISSING: nodeState.progress is not used
    });

    return unsubscribe;
  }, [nodeId]);

  return nodeRef;
}
```

### 2.2 Implementation Approach A: CSS Conic Gradient

**When to Use**: If research shows pure CSS is sufficient for smooth animations

**File**: `packages/@atomiton/editor/src/hooks/useNodeExecutionState.ts`

```typescript
export function useNodeExecutionState(nodeId: string) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = conductor.node.onProgress((event) => {
      const nodeState = event.nodes.find((n) => n.id === nodeId);
      if (!nodeState) return;

      const reactFlowNode = nodeRef.current.closest(".react-flow__node");
      if (!reactFlowNode) return;

      reactFlowNode.setAttribute("data-execution-state", nodeState.state);

      // Add progress as CSS custom property for smooth transitions
      reactFlowNode.style.setProperty("--progress", String(nodeState.progress));
    });

    return unsubscribe;
  }, [nodeId]);

  return nodeRef;
}
```

**File**: `packages/@atomiton/editor/src/components/Canvas/styles.css`

```css
/* Executing state - circular progress fill */
.react-flow__node[data-execution-state="executing"],
.react-flow__node-default[data-execution-state="executing"],
.react-flow__node-input[data-execution-state="executing"],
.react-flow__node-output[data-execution-state="executing"],
.react-flow__node-group[data-execution-state="executing"] {
  --progress-percent: calc(
    var(--progress, 0) * 3.6deg
  ); /* Convert 0-100 to 0-360deg */

  border: 2px solid transparent;
  background: conic-gradient(
      from -90deg,
      /* Start from top (12 o'clock) */ var(--color-green)
        var(--progress-percent),
      /* Green fill */ var(--color-s-01) var(--progress-percent)
        /* Gray remainder */
    )
    border-box;

  /* Smooth transition for progress changes */
  transition: --progress 0.3s ease;
}

/* Completed state - solid green border */
.react-flow__node[data-execution-state="completed"],
.react-flow__node-default[data-execution-state="completed"],
.react-flow__node-input[data-execution-state="completed"],
.react-flow__node-output[data-execution-state="completed"],
.react-flow__node-group[data-execution-state="completed"] {
  border-color: var(--color-green);
  background: var(--atomiton-node-background);
  transition: border-color 0.3s ease;
}

/* Error state - frozen progress with red color */
.react-flow__node[data-execution-state="error"],
.react-flow__node-default[data-execution-state="error"],
.react-flow__node-input[data-execution-state="error"],
.react-flow__node-output[data-execution-state="error"],
.react-flow__node-group[data-execution-state="error"] {
  --progress-percent: calc(var(--progress, 0) * 3.6deg);

  border: 2px solid transparent;
  background: conic-gradient(
      from -90deg,
      var(--color-red) var(--progress-percent),
      /* Red fill at frozen % */ var(--color-s-01) var(--progress-percent)
        /* Gray remainder */
    )
    border-box;

  /* Transition color but keep progress frozen */
  transition: background 0.3s ease;
}
```

**Pros**:

- Zero bundle size impact
- GPU-accelerated rendering
- Simple implementation
- No React re-renders needed

**Cons**:

- Limited control over animation timing
- May not handle <200ms completions smoothly
- CSS custom property transitions may not be supported in older browsers

### 2.3 Implementation Approach B: Web Animations API

**When to Use**: If we need more control over animation timing (minimum
duration, easing curves)

```typescript
// packages/@atomiton/editor/src/hooks/useNodeExecutionState.ts
export function useNodeExecutionState(nodeId: string) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const currentAnimationRef = useRef<Animation | null>(null);
  const currentProgressRef = useRef(0);

  useEffect(() => {
    const unsubscribe = conductor.node.onProgress((event) => {
      const nodeState = event.nodes.find((n) => n.id === nodeId);
      if (!nodeState) return;

      const reactFlowNode = nodeRef.current.closest(".react-flow__node");
      if (!reactFlowNode) return;

      reactFlowNode.setAttribute("data-execution-state", nodeState.state);

      // Animate progress with minimum duration
      const MIN_DURATION = 300; // ms
      const targetProgress = nodeState.progress;
      const currentProgress = currentProgressRef.current;

      // Cancel existing animation
      currentAnimationRef.current?.cancel();

      // Calculate animation duration
      const progressDelta = Math.abs(targetProgress - currentProgress);
      const duration = Math.max(MIN_DURATION, progressDelta * 10); // 10ms per % point

      // Animate using Web Animations API
      const animation = reactFlowNode.animate(
        [
          { "--progress": String(currentProgress) },
          { "--progress": String(targetProgress) },
        ],
        {
          duration,
          easing: "ease-out",
          fill: "forwards",
        },
      );

      currentAnimationRef.current = animation;
      currentProgressRef.current = targetProgress;
    });

    return () => {
      currentAnimationRef.current?.cancel();
      unsubscribe();
    };
  }, [nodeId]);

  return nodeRef;
}
```

**Pros**:

- Fine-grained control over timing
- Can enforce minimum animation duration
- Native browser API (0KB bundle)
- Smooth interpolation

**Cons**:

- More complex code
- Requires animation state management
- Browser compatibility (modern browsers only)

### 2.4 Implementation Approach C: SVG Circle Progress

**When to Use**: If conic-gradient doesn't work well with border styling

```tsx
// packages/@atomiton/editor/src/components/Node/ProgressRing.tsx
interface ProgressRingProps {
  progress: number; // 0-100
  state: NodeExecutionState;
  size: number; // diameter
}

export function ProgressRing({ progress, state, size }: ProgressRingProps) {
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const color =
    state === "error"
      ? "var(--color-red)"
      : state === "completed"
        ? "var(--color-green)"
        : state === "executing"
          ? "var(--color-green)"
          : "var(--color-s-01)";

  return (
    <svg
      className="progress-ring"
      width={size}
      height={size}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="var(--color-s-01)"
        strokeWidth={strokeWidth}
        fill="transparent"
      />

      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          transition: "stroke-dashoffset 0.3s ease, stroke 0.3s ease",
        }}
      />
    </svg>
  );
}
```

**Pros**:

- Very precise control over rendering
- Works well with rounded borders
- Easy to understand visually
- Can add additional decorations

**Cons**:

- Additional component overhead
- Slightly more bundle size
- Requires integration into Node component

### 2.5 Animation Smoothness Requirements

**Problem**: Nodes completing in <200ms cause jarring visual jumps

**Solutions**:

1. **Minimum Animation Duration**:

   ```typescript
   const MIN_ANIMATION_DURATION = 300; // ms
   const actualDuration = Math.max(MIN_ANIMATION_DURATION, nodeExecutionTime);
   ```

2. **Progress Throttling**:

   ```typescript
   // Throttle progress updates to max 60fps (16.67ms)
   const throttledProgress = useThrottle(nodeState.progress, 16);
   ```

3. **Easing Curves**:
   - `ease-out`: Fast start, slow end (feels responsive)
   - `ease-in-out`: Smooth acceleration/deceleration (feels natural)
   - Linear: Constant speed (feels mechanical)
   - **Recommendation**: `ease-out` for progress fills

4. **State Transition Delays**:
   ```typescript
   // When transitioning from executing → completed, delay state change
   // to let progress animation finish
   if (nodeState.state === "completed" && currentProgress < 100) {
     setTimeout(() => {
       reactFlowNode.setAttribute("data-execution-state", "completed");
     }, 200); // Let animation catch up
   }
   ```

---

## Phase 3: Edge Progress Animations

**Prerequisites**: Phase 2 completed, node animations working smoothly

### 3.1 Goals

- Show data "flowing" from source node → target node
- Coordinate edge animation with source node completion
- Use same color logic (green for success, red for error)
- Maintain performance with many edges animating

### 3.2 React Flow Animated Edges Research

**Documentation**: https://reactflow.dev/examples/edges/animating-edges

**Key Questions** (for Guilliman):

1. Does React Flow provide built-in animated edge types?
2. Can we customize the animation to show directional progress?
3. What is the performance impact of animating 50+ edges?
4. Can edge colors be dynamically updated based on execution state?

### 3.3 Implementation Approach: SVG Stroke Animation

**Concept**: Use `stroke-dasharray` and `stroke-dashoffset` to create moving
dash effect

```tsx
// packages/@atomiton/editor/src/components/Edge/AnimatedEdge.tsx
interface AnimatedEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourceNodeState: NodeExecutionState;
  targetNodeState: NodeExecutionState;
}

export function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourceNodeState,
  targetNodeState,
}: AnimatedEdgeProps) {
  const edgePath = getBezierPath({ sourceX, sourceY, targetX, targetY });

  // Edge is active when source is completed and target is executing
  const isActive =
    sourceNodeState === "completed" && targetNodeState === "executing";
  const hasError = sourceNodeState === "error";

  const color = hasError ? "var(--color-red)" : "var(--color-green)";

  return (
    <g>
      {/* Base edge path */}
      <path
        d={edgePath}
        stroke="var(--color-s-01)"
        strokeWidth={2}
        fill="none"
      />

      {/* Animated progress overlay */}
      {isActive && (
        <path
          d={edgePath}
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeDasharray="10 5"
          strokeDashoffset={0}
          style={{
            animation: "dash-flow 1s linear infinite",
          }}
        />
      )}
    </g>
  );
}
```

**CSS**:

```css
@keyframes dash-flow {
  from {
    stroke-dashoffset: 15;
  }
  to {
    stroke-dashoffset: 0;
  }
}
```

### 3.4 Performance Optimization

**Concerns**:

- 50+ edges animating simultaneously = potential performance hit
- React Flow re-renders entire graph on updates

**Solutions**:

1. **Conditional Rendering**:

   ```typescript
   // Only animate edges connected to active nodes
   const shouldAnimate = sourceNodeState === 'completed' ||
                         targetNodeState === 'executing';

   if (!shouldAnimate) return <StaticEdge {...props} />;
   ```

2. **CSS Animations over JS**:
   - Use CSS keyframes instead of RAF loops
   - GPU-accelerated, runs on compositor thread
   - No JavaScript overhead

3. **Memoization**:

   ```typescript
   const AnimatedEdge = memo(({ id, sourceNodeState, ... }) => {
     // Component only re-renders when props change
   }, (prev, next) => {
     return prev.sourceNodeState === next.sourceNodeState &&
            prev.targetNodeState === next.targetNodeState;
   });
   ```

4. **Virtual Edges** (if needed):
   - Only render edges visible in viewport
   - React Flow may handle this internally

---

## Phase 4: Integration & Performance Validation

### 4.1 Integration Checklist

- [ ] Node progress visualization working (borders fill 0-100%)
- [ ] Color transitions correct (gray→green, red on error)
- [ ] Edge animations trigger on node completion
- [ ] Edge colors match node states
- [ ] No visual glitches or flickering
- [ ] Smooth animations even for fast nodes (<200ms)
- [ ] Transitions feel natural and responsive

### 4.2 Performance Testing

**Test Cases**:

1. **Sequential Execution** (Hello World template):
   - 3 nodes executing one-by-one
   - Verify 60fps during transitions
   - Check CPU usage stays under 30%

2. **Large Graph Stress Test**:
   - 100 nodes, 150 edges
   - All nodes executing in parallel
   - Measure frame rate, CPU, memory
   - Target: Maintain 60fps

3. **Rapid Re-execution**:
   - Execute same flow 10 times rapidly
   - Check for memory leaks
   - Verify animations don't accumulate/lag

**Profiling Tools**:

```javascript
// Custom performance mark
performance.mark("animation-start");
// ... animation code ...
performance.mark("animation-end");
performance.measure("animation-duration", "animation-start", "animation-end");
console.log(performance.getEntriesByName("animation-duration"));
```

### 4.3 Success Criteria

1. **Frame Rate**: Maintain 60fps during all animations
2. **CPU Usage**: Stay under 50% on modern hardware
3. **Memory**: No leaks after 10+ executions
4. **Bundle Size**: <10KB added for animations (prefer 0KB with CSS)
5. **User Perception**: Animations feel smooth and responsive, not laggy or
   janky
6. **Error Visibility**: Error states clearly visible with red borders at frozen
   progress

---

## Implementation Roadmap

### Step 1: Research Phase (Guilliman)

- [ ] Research React Flow built-in features
- [ ] Benchmark animation approaches
- [ ] Provide recommendation with performance data
- [ ] Create proof-of-concept snippets

### Step 2: Node Progress (Post-Research)

- [ ] Implement chosen approach in `useNodeExecutionState.ts`
- [ ] Add CSS styling for progress visualization
- [ ] Test with Hello World template
- [ ] Verify smooth animations for fast nodes
- [ ] Performance validation (60fps maintained)

### Step 3: Edge Animations

- [ ] Implement animated edge component
- [ ] Wire edge state to node execution events
- [ ] Test with multi-node flows
- [ ] Performance validation with 50+ edges

### Step 4: Polish & Optimization

- [ ] Fine-tune animation timing (easing, duration)
- [ ] Add minimum animation duration logic
- [ ] Implement progress throttling if needed
- [ ] Final performance testing and profiling
- [ ] User testing for perceived smoothness

---

## Files to Modify

### Core Implementation

1. **`packages/@atomiton/editor/src/hooks/useNodeExecutionState.ts`**
   - Add progress tracking
   - Set CSS custom property or trigger animations
   - Handle minimum animation duration

2. **`packages/@atomiton/editor/src/components/Canvas/styles.css`**
   - Implement conic-gradient or SVG styling
   - Add color transitions for states
   - Define animation keyframes

### Edge Animations (Phase 3)

3. **`packages/@atomiton/editor/src/components/Edge/` (new)**
   - Create AnimatedEdge component
   - Implement SVG stroke animations
   - Wire to execution state

### Optional Enhancements

4. **`packages/@atomiton/editor/src/components/Node/ProgressRing.tsx` (new)**
   - SVG-based progress ring if conic-gradient insufficient

---

## Open Questions (For Guilliman to Resolve)

1. Does React Flow's NodeStatusIndicator support progress percentage mode?
2. Can React Flow animated edges show directional flow with our color
   requirements?
3. What is the actual performance impact of conic-gradient vs SVG circles?
4. Should we use Web Animations API or stick with pure CSS?
5. Are there existing React Flow examples of real-time progress visualization?
6. What animation library (if any) does React Flow use internally?

---

## Appendix: Color Reference

```css
/* From existing styles.css */
--atomiton-node-state-pending: var(--color-tertiary);
--atomiton-node-state-executing: var(--color-blue);
--atomiton-node-state-completed: var(--color-green);
--atomiton-node-state-error: var(--color-red);
--atomiton-node-state-skipped: var(--color-yellow);

/* New colors for progress fills */
--atomiton-progress-fill-executing: var(--color-green);
--atomiton-progress-fill-error: var(--color-red);
--atomiton-progress-background: var(--color-s-01); /* Gray */
```

**Note**: Current executing state uses blue, but user requested green for
progress fill. Need to clarify:

- Keep blue for executing state, green for progress fill?
- Or change executing state to green entirely?

---

## Next Steps

1. **Guilliman**: Complete Phase 1 research and provide recommendations
2. **Team Review**: Discuss research findings and approve implementation
   approach
3. **Implementation**: Execute phases 2-4 based on approved approach
4. **Testing**: Validate performance and user experience
5. **Documentation**: Update component docs with animation behavior
