# Conductor API Layering Fix Strategy

## ✅ RESOLVED

**Status:** All issues have been resolved through unified progress event API and
flow namespace aliases.

**Date Completed:** 2025-10-03

## Executive Summary

The conductor API was refactored to use a unified progress event that works for
both atomic and group nodes, with flow namespace aliases added for better
developer experience.

## Resolution Summary

### ✅ Solution: Unified Progress Event with Flow Aliases

Instead of separate events and complex layering, we implemented:

1. **Extended `NodeProgressEvent`** to include `nodes` and `graph` data
2. **Added `conductor.flow.*` aliases** for better DX (run, onProgress,
   onComplete, onError)
3. **Fixed Flow API** to use RPC transport (removed direct bridge access)
4. **Merged backend events** into single progress stream with graph data

### Benefits

- **Progressive Disclosure:** Simple progress bar uses `event.progress`,
  advanced UI uses `event.nodes` + `event.graph`
- **Works for Any Node:** Atomic nodes have trivial graphs, group nodes have
  rich graphs
- **Better DX:** Stay in flow namespace for entire journey
- **Single Source of Truth:** One event stream, no confusion

## Original Issues Identified

### ✅ Issue 1: Execution Graph Events on Wrong Layer (RESOLVED)

**Current (Wrong):**

```typescript
conductor.node.onExecutionGraphStateUpdate(); // ❌ This is flow-level logic
```

**Should be:**

```typescript
conductor.flow.onExecutionGraphStateUpdate(); // ✅ Flow-level orchestration
```

**Why it's wrong:**

- Execution graphs only exist for group nodes (flows)
- This is flow-level orchestration, not atomic node operations
- Violates single responsibility principle

### ❌ Issue 2: Missing conductor.flow.run()

**Current (Inconsistent):**

```typescript
conductor.flow.listTemplates(); // ✅ Exists
conductor.flow.getTemplate(); // ✅ Exists
conductor.node.run(flow); // ❌ Should have flow.run() alias
```

**Should be:**

```typescript
conductor.flow.run(flow); // ✅ Alias with flow-specific semantics
conductor.node.run(node); // ✅ For any node (including flows)
```

**Why we need both:**

- `node.run()` - Low-level: Execute any NodeDefinition
- `flow.run()` - High-level: Execute with flow-specific expectations (progress
  tracking, graph state, etc.)
- Mirrors the pattern where flow API provides flow-specific conveniences

### ❌ Issue 3: Flow API Uses Direct Bridge Access

**Current (Wrong):**

```typescript
// In flow.ts
window.atomiton?.__bridge__.call("flow", "listTemplates"); // ❌ Direct bridge access
```

**Should be:**

```typescript
// Use RPC transport layer
rpcTransport.channel("flow").call("listTemplates"); // ✅ Through RPC
```

**Why it's wrong:**

- Violates architecture principle: Conductor should never directly access bridge
- All transport concerns should go through RPC package
- Same issue we just fixed in eventsAPI

## Correct Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                     conductor.flow.*                         │
│                   (Flow Orchestration Layer)                 │
│                                                              │
│  • flow.run(flow) → Alias to node.run() with flow context   │
│  • flow.onProgress() → Orchestrates node progress events    │
│  • flow.onComplete() → Flow-level completion                │
│  • flow.onError() → Flow-level errors                       │
│  • flow.onExecutionGraphStateUpdate() → Graph tracking      │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ Uses internally
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                     conductor.node.*                         │
│                   (Atomic Node Operations)                   │
│                                                              │
│  • node.run(node) → Execute any node                        │
│  • node.onProgress() → Single node progress                 │
│  • node.onComplete() → Single node completion               │
│  • node.onError() → Single node error                       │
│  • node.validate() → Validate node definition               │
│  • node.cancel() → Cancel execution                         │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ Uses
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    RPC Transport Layer                       │
│                                                              │
│  • createTransport() → Full transport with channels         │
│  • channel("node").call() / .listen()                       │
│  • channel("flow").call() / .listen()                       │
│  • Abstracts: IPC / WebSocket / HTTP / Memory               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Move Execution Graph Events to Flow Layer

**Files to modify:**

- `packages/@atomiton/conductor/src/exports/browser/index.ts`

**Changes:**

```typescript
return {
  node: {
    ...nodeAPI,
    onProgress: eventsAPI.onNodeProgress,
    onComplete: eventsAPI.onNodeComplete,
    onError: eventsAPI.onNodeError,
    // ❌ REMOVE: onExecutionGraphStateUpdate
  },
  flow: {
    ...flowAPI,
    // ✅ ADD: Flow-level events
    onExecutionGraphStateUpdate: eventsAPI.onExecutionGraphStateUpdate,
    // Future: onProgress, onComplete, onError orchestrators
  },
  // ... rest
};
```

### Step 2: Fix Flow API to Use RPC Transport

**Files to modify:**

- `packages/@atomiton/conductor/src/exports/browser/flow.ts`

**Changes:**

```typescript
import { createTransport } from "@atomiton/rpc/renderer";
import type { Transport } from "@atomiton/rpc/renderer";

export function createFlowAPI(transport: ConductorTransport | undefined) {
  let rpcTransport: Transport | undefined;

  try {
    rpcTransport = createTransport();
  } catch (error) {
    console.warn("[FLOW] RPC transport unavailable:", error);
  }

  return {
    async listTemplates(): Promise<ListTemplatesResponse> {
      if (!rpcTransport) {
        throw new Error("No transport available for flow operations");
      }
      return rpcTransport
        .channel("flow")
        .call("listTemplates", {}) as Promise<ListTemplatesResponse>;
    },

    async getTemplate(id: string): Promise<GetTemplateResponse> {
      if (!rpcTransport) {
        throw new Error("No transport available for flow operations");
      }
      return rpcTransport
        .channel("flow")
        .call("getTemplate", { id }) as Promise<GetTemplateResponse>;
    },

    async loadFlow(id: string): Promise<NodeDefinition> {
      const response = await this.getTemplate(id);
      return response.definition;
    },

    // ✅ ADD: Flow execution alias
    async run(
      flow: NodeDefinition,
      contextOverrides?: Partial<ConductorExecutionContext>,
    ): Promise<ExecutionResult> {
      // Validate it's a group node (flow)
      if (!flow.nodes || flow.nodes.length === 0) {
        throw new Error("Flow must be a group node with child nodes");
      }

      // Delegate to node.run() - this is just an alias with flow semantics
      // The actual execution logic lives in node.run()
      const nodeAPI = createNodeAPI(transport);
      return nodeAPI.run(flow, contextOverrides);
    },
  };
}
```

### Step 3: Update Client-Side Store to Use Flow API

**Files to modify:**

- `apps/client/src/stores/executionGraphStore.ts`

**Changes:**

```typescript
// Change subscription from node to flow
const subscription = conductor.flow?.onExecutionGraphStateUpdate?.(
  (event: ExecutionGraphStateUpdateEvent) => {
    const nodesMap = new Map(event.nodes.map((n) => [n.id, n]));
    useExecutionGraphStore.setState({
      nodes: nodesMap,
      edges: event.edges,
      executionOrder: event.executionOrder,
      criticalPath: event.criticalPath,
      totalWeight: event.totalWeight,
      maxParallelism: event.maxParallelism,
      isExecuting: event.isExecuting,
      startTime: event.startTime,
      endTime: event.endTime,
    });
  },
);
```

### Step 4: Update All Client Call Sites (Optional - Breaking Change)

**Decision needed:** Should we update all `conductor.node.run(flow)` to
`conductor.flow.run(flow)`?

**Option A: Breaking Change (Recommended for Long-Term)**

- Update all call sites to use `conductor.flow.run(flow)` for group nodes
- Keep `conductor.node.run()` for atomic nodes only
- Clear semantic distinction

**Option B: Non-Breaking (Pragmatic)**

- Keep both working
- `flow.run()` is just a convenience alias
- Gradually migrate call sites over time

**Recommendation:** Option B for Phase B, Option A for Phase C (code cleanup)

## Validation Commands

```bash
# Step 1-2: Build packages
pnpm --filter @atomiton/conductor build

# Step 3: Build client
pnpm --filter @atomiton/client typecheck
pnpm --filter @atomiton/client build

# Integration test
pnpm --filter @atomiton/desktop dev
# Execute a flow, verify graph updates appear in client store
```

## Success Criteria

- ✅ `conductor.flow.onExecutionGraphStateUpdate()` exists and works
- ✅ `conductor.node.onExecutionGraphStateUpdate()` removed
- ✅ `conductor.flow.run()` exists as alias to `conductor.node.run()`
- ✅ Flow API uses RPC transport, not direct bridge access
- ✅ Client store subscribes to `conductor.flow.*` events
- ✅ No TypeScript errors
- ✅ All builds pass
- ✅ Execution graph tracking still works

## Future Enhancements (Phase C)

Once the layering is correct, we can add flow-level orchestration:

```typescript
conductor.flow.onProgress((progress) => {
  // Aggregates conductor.node.onProgress() for all nodes in flow
  // Returns: { completedNodes: 5, totalNodes: 10, percentage: 50 }
});

conductor.flow.onComplete((result) => {
  // Aggregates all node completions into flow result
});

conductor.flow.onError((error) => {
  // Flow-level error handling
});
```

These would internally subscribe to `conductor.node.*` events and orchestrate
them into flow-level semantics.

---

## Claude Code Prompt for Implementation

```
Fix the conductor API layering violations identified in the architecture review.

Context:
- Execution graph events are currently on conductor.node.* (wrong layer)
- Should be on conductor.flow.* (orchestration layer)
- Flow API still uses direct bridge access (should use RPC)
- Missing conductor.flow.run() alias

Tasks:
1. Move onExecutionGraphStateUpdate from conductor.node to conductor.flow
2. Fix flow.ts to use RPC transport instead of direct bridge access
3. Add conductor.flow.run() as alias to conductor.node.run() with flow validation
4. Update client store to subscribe to conductor.flow.onExecutionGraphStateUpdate
5. Keep types/exports clean - execution graph types should be on conductor.flow

Follow implementation steps in .claude/strategies/CONDUCTOR_API_LAYERING_FIX.md

Validation:
pnpm --filter @atomiton/conductor build
pnpm --filter @atomiton/client typecheck
pnpm --filter @atomiton/desktop typecheck

Success criteria:
- conductor.flow.onExecutionGraphStateUpdate() works
- conductor.flow.run() exists
- Flow API uses RPC transport
- No TypeScript errors
- Proper layered abstraction maintained
```
