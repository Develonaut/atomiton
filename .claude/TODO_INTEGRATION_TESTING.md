# TODO: Integration Testing Strategy

## Problem

Current tests don't catch bugs that only appear when using the full RPC
transport layer between browser and desktop. Issues like `slowMo` being dropped
are only discovered through manual testing in the UI.

## Root Cause

- Unit tests mock the transport layer
- No tests exercise the full browser → RPC → desktop → execution path
- Schema validation bugs (like missing `slowMo` in nodeChannel.ts) aren't caught

## Solution: Full Integration Test Suite

### Test Architecture

```
Browser Process (Renderer)          Desktop Process (Main)
├─ conductor (browser)              ├─ conductor (desktop)
├─ RPC transport                    ├─ RPC channel servers
└─ IPC bridge                       └─ Node executors
         │                                    │
         └────── Electron IPC ───────────────┘
```

### Test Coverage Needed

1. **Context Propagation Tests**
   - Verify `slowMo` is preserved through RPC layer
   - Verify `variables` are preserved
   - Verify `parentContext` is preserved
   - Verify `executionId` is generated/preserved

2. **Progress Tracking Tests**
   - Verify progress events are broadcast from desktop to browser
   - Verify progress percentages are accurate
   - Verify slowMo delays are actually applied
   - Verify weighted progress calculations work end-to-end

3. **Error Handling Tests**
   - Verify errors propagate from desktop to browser
   - Verify error messages are preserved
   - Verify stack traces are available
   - Verify node state transitions to "error"

4. **Multi-Node Flow Tests**
   - Verify graph topology execution order
   - Verify edge data passing between nodes
   - Verify parallel execution (when implemented)
   - Verify sequential execution with dependencies

### Implementation Options

#### Option 1: Electron Test Runner (Recommended)

```typescript
// packages/@atomiton/e2e/src/integration/rpc-transport.test.ts
import { test, expect } from "@playwright/test";

test("slowMo parameter is preserved through RPC", async ({ page }) => {
  // Execute flow with slowMo=7500
  const startTime = Date.now();
  await page.evaluate(async () => {
    const result = await window.conductor.node.run(flowNode, { slowMo: 7500 });
    return result;
  });
  const duration = Date.now() - startTime;

  // Should take ~45 seconds (3 nodes × 15s each)
  expect(duration).toBeGreaterThan(40000);
  expect(duration).toBeLessThan(50000);
});
```

#### Option 2: Headless Electron Test Harness

```typescript
// packages/@atomiton/conductor/test/integration/electron-test-harness.ts
// Launch headless Electron, inject test scenarios, verify results
```

#### Option 3: Mock IPC Layer (Faster, Less Accurate)

```typescript
// Mock electron IPC to test RPC without full Electron
// Pro: Fast, Con: May miss Electron-specific bugs
```

### Test Scenarios Priority

**P0 - Critical Path**

1. ✅ Single node execution with slowMo
2. ✅ Multi-node flow execution with slowMo
3. ✅ Progress events are broadcast correctly
4. ✅ Context parameters preserved (slowMo, variables, executionId)

**P1 - Core Functionality** 5. ⬜ Error handling and propagation 6. ⬜ Node
state transitions (pending → executing → completed/error) 7. ⬜ Weighted
progress calculation accuracy 8. ⬜ Edge data passing between nodes

**P2 - Edge Cases** 9. ⬜ Very slow execution (slowMo=7500) 10. ⬜ Zero delay
execution (slowMo=0) 11. ⬜ Cancellation mid-execution 12. ⬜ Concurrent flow
executions

### Files to Create

- `packages/@atomiton/e2e/src/integration/rpc-slowmo.e2e.ts`
- `packages/@atomiton/e2e/src/integration/rpc-progress.e2e.ts`
- `packages/@atomiton/e2e/src/integration/rpc-context.e2e.ts`
- `packages/@atomiton/e2e/src/integration/rpc-errors.e2e.ts`

### Success Criteria

- All RPC transport bugs caught by tests before manual testing
- Tests run in CI/CD pipeline
- Full coverage of context propagation
- Full coverage of progress tracking
- Test execution time < 2 minutes for fast feedback

### Next Steps

1. Create test harness for Electron integration tests
2. Port existing manual test cases to automated tests
3. Add to CI/CD pipeline
4. Document test patterns for future development

---

**Created:** 2025-10-04 **Priority:** HIGH - Blocking confidence in conductor
functionality **Owner:** TBD

## Implementation Plan

### Solution Overview: Achieving 100% Confidence

**The Core Strategy:** Test the actual browser → RPC → desktop → execution path
with zero mocking. This approach provides complete confidence because it tests
the exact same code path that runs in production, catching serialization bugs,
schema validation issues, and transport layer problems that unit tests miss.

**What Makes This Different:** Unlike current unit tests that mock the RPC
transport layer, these integration tests exercise the full Electron IPC bridge.
When we test with `slowMo=7500`, we verify not just that the parameter exists in
memory, but that it survives JSON serialization, passes schema validation in
`nodeChannel.ts`, crosses the IPC boundary intact, and actually delays execution
in the desktop process.

**The Key Principle:** Real transport, real timing, real bugs caught. By using
Playwright's Electron support, we test the actual `window.conductor.node.run()`
API that the UI uses, sending real IPC messages through Electron's context
bridge, and measuring actual execution timing to prove delays are applied.

**Why This Catches What We Miss:** The `slowMo` bug slipped through because unit
tests had the parameter in memory but the RPC schema didn't include it.
Integration tests would have caught this immediately - the test would timeout
expecting a 7.5-second delay but getting instant execution instead. Every
parameter, every data type, every edge case gets validated by the actual
transport layer.

**Measurable Outcomes That Prove Success:**

- **Timing Precision:** Tests verify `slowMo=7500` actually delays execution by
  7.5 seconds (±500ms), not just that the parameter exists
- **Progress Accuracy:** Tests confirm progress events arrive in order (0%, 33%,
  66%, 100%) via real IPC broadcasts
- **Error Fidelity:** Tests ensure error messages, stack traces, and context
  survive the round trip intact
- **Zero Mocking:** 100% of tests use the production RPC transport, catching
  schema mismatches immediately
- **Fast Feedback:** Full test suite runs in <2 minutes, providing rapid
  validation in CI/CD

This isn't just better testing - it's definitive proof that the RPC layer works
correctly, eliminating an entire class of bugs that currently require manual UI
testing to discover.

### Phase 1: Test Infrastructure Foundation

**Goal:** Establish the testing harness and patterns for RPC integration tests

1. **Create RPC Test Utilities** (`apps/e2e/src/utils/rpc-test-helpers.ts`)
   - Helper to execute nodes through full RPC stack
   - Helper to capture and verify progress events
   - Helper to measure execution timing for slowMo validation
   - Mock data generators for test nodes

2. **Setup Test Fixtures** (`apps/e2e/src/fixtures/rpc-integration.ts`)
   - Extend existing Electron fixture with RPC-specific setup
   - Add window.conductor API exposure verification
   - Add IPC channel monitoring capabilities
   - Create reusable test node definitions

3. **Create Base Test Template** (`apps/e2e/src/integration/rpc-base.e2e.ts`)
   - Establish pattern for RPC integration tests
   - Include proper setup/teardown
   - Add common assertions and error handling

#### Claude Code Prompt

```
Create the test infrastructure foundation for RPC integration testing in the Atomiton project.

Context: We need to test the full browser → RPC → desktop → execution path to catch bugs that only appear when using the complete transport layer. Current unit tests mock the transport and miss critical issues like parameters being dropped during RPC serialization.

Tasks:
1. Create RPC test utilities at /Users/Ryan/Code/atomiton/apps/e2e/src/utils/rpc-test-helpers.ts with:
   - executeNodeViaRPC(node, context) - executes a node through the full RPC stack
   - captureProgressEvents(executionId) - returns a promise that collects all progress events
   - measureExecutionTime(fn) - accurately measures execution duration using performance.now()
   - createTestNode(type, config) - generates test node definitions with predictable behavior
   - waitForProgressEvent(executionId, percentage) - waits for specific progress milestone

2. Create test fixtures at /Users/Ryan/Code/atomiton/apps/e2e/src/fixtures/rpc-integration.ts:
   - Extend the existing electronTest fixture from /Users/Ryan/Code/atomiton/apps/e2e/src/fixtures/electronTest.ts
   - Add helper to verify window.conductor API is exposed properly
   - Add IPC message interception for debugging
   - Create standard test nodes (delay node, error node, data transform node)

3. Create base test template at /Users/Ryan/Code/atomiton/apps/e2e/src/integration/rpc-base.e2e.ts:
   - Import the RPC test utilities and fixtures
   - Include a basic smoke test that verifies RPC roundtrip works
   - Add pattern for measuring timing with slowMo validation
   - Include error boundary handling

Architecture notes from .claude/ARCHITECTURE.md:
- Client uses Conductor, never imports RPC directly
- @atomiton/conductor owns all execution types and logic
- @atomiton/rpc is pure transport with no business logic
- Use window.conductor.node.run() API in browser context

Validation:
- Run: pnpm test:e2e --grep "RPC integration smoke test"
- Verify the test executes a node through the full RPC stack
- Confirm timing measurements are accurate to within 100ms
- Check that progress events are captured correctly

The utilities should handle the complexity of Electron's multi-process architecture while providing a simple API for test writers.
```

### Phase 2: Context Propagation Testing (P0)

**Goal:** Ensure all execution context parameters survive the RPC round trip

1. **SlowMo Parameter Tests** (`apps/e2e/src/integration/rpc-slowmo.e2e.ts`)
   - Test slowMo=0 (instant execution)
   - Test slowMo=1000 (1 second delays)
   - Test slowMo=7500 (7.5 second delays)
   - Verify actual timing matches expected delays
   - Test multiple nodes with cumulative delay verification

2. **Context Preservation Tests**
   (`apps/e2e/src/integration/rpc-context.e2e.ts`)
   - Test executionId generation and propagation
   - Test variables passing through RPC
   - Test parentContext preservation
   - Test nodeId tracking
   - Test input data serialization/deserialization

#### Claude Code Prompt

````
Implement comprehensive context propagation tests for the RPC transport layer to ensure all execution parameters survive the browser → desktop → browser round trip.

Prerequisites: Phase 1 test infrastructure must be complete.

Context: The critical bug we discovered was that slowMo parameter was being dropped when passed through the RPC layer. We need comprehensive tests to ensure ALL context parameters are preserved correctly.

Tasks:
1. Create slowMo parameter tests at /Users/Ryan/Code/atomiton/apps/e2e/src/integration/rpc-slowmo.e2e.ts:
   - Test "instant execution" with slowMo=0 - should complete in < 100ms
   - Test "1 second delay" with slowMo=1000 - should take 1000ms ± 100ms per node
   - Test "7.5 second delay" with slowMo=7500 - should take 7500ms ± 500ms per node
   - Test multi-node flow with slowMo=2000 and 3 nodes - should take ~6000ms total
   - Test that slowMo actually affects node executor delay, not just UI

2. Create context preservation tests at /Users/Ryan/Code/atomiton/apps/e2e/src/integration/rpc-context.e2e.ts:
   - Test executionId is generated on browser side and preserved through RPC
   - Test variables object with nested data survives serialization
   - Test parentContext is maintained for nested node execution
   - Test nodeId tracking for proper node identification
   - Test complex input data (arrays, objects, nulls, undefined) serialization

Test implementation pattern:
```typescript
test('slowMo parameter is preserved through RPC', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const testNode = window.testHelpers.createTestNode('delay', { duration: 500 });
    const startTime = performance.now();

    const execution = await window.conductor.node.run(testNode, {
      slowMo: 2000 // Should add 2 second delay
    });

    const duration = performance.now() - startTime;
    return { result: execution, duration };
  });

  // Node execution (500ms) + slowMo (2000ms) = ~2500ms
  expect(result.duration).toBeGreaterThan(2400);
  expect(result.duration).toBeLessThan(2600);
});
````

Architecture requirements:

- Use window.conductor.node.run() API (client never imports RPC)
- Verify timing with performance.now() for accuracy
- Test the actual desktop executor receives the parameters
- Ensure parameters survive schema validation in nodeChannel.ts

Validation:

- Run: pnpm test:e2e --grep "slowMo parameter"
- Run: pnpm test:e2e --grep "context preservation"
- All tests should pass consistently (no flaky timing)
- Verify desktop process actually applies the delays
- Check that all context fields are present in execution result

Success criteria: No context parameter should ever be lost during RPC transport.

```

### Phase 3: Progress Tracking Tests (P0)
**Goal:** Verify progress events flow correctly from desktop to browser

1. **Progress Event Broadcasting** (`apps/e2e/src/integration/rpc-progress.e2e.ts`)
   - Test single node progress (0% → 100%)
   - Test multi-node flow progress increments
   - Test weighted progress calculations
   - Test progress event ordering
   - Test concurrent flow progress isolation

2. **Node State Transitions** (`apps/e2e/src/integration/rpc-state-transitions.e2e.ts`)
   - Test pending → executing → completed flow
   - Test pending → executing → error flow
   - Test cancellation state transitions
   - Verify state consistency across RPC boundary

#### Claude Code Prompt
```

Implement progress tracking tests to ensure progress events flow correctly from
desktop to browser through the RPC layer.

Prerequisites: Phase 1 test infrastructure must be complete.

Context: Progress tracking is critical for user feedback. We need to verify that
progress events are broadcast correctly, arrive in order, and accurately reflect
execution state.

Tasks:

1. Create progress event tests at
   /Users/Ryan/Code/atomiton/apps/e2e/src/integration/rpc-progress.e2e.ts:
   - Test single node emits 0% → 100% progress events
   - Test 3-node flow emits progress at 0%, 33%, 66%, 100%
   - Test weighted progress with nodes of different complexities
   - Verify progress events arrive in ascending order (never go backwards)
   - Test concurrent flow executions have isolated progress tracking

2. Create state transition tests at
   /Users/Ryan/Code/atomiton/apps/e2e/src/integration/rpc-state-transitions.e2e.ts:
   - Test successful execution: pending → executing → completed
   - Test error case: pending → executing → error
   - Test cancellation: pending → executing → cancelled (if supported)
   - Verify node states are consistent between browser and desktop
   - Test that state transitions trigger appropriate UI updates

Test implementation pattern:

```typescript
test("progress events flow from desktop to browser", async ({ page }) => {
  const progressEvents = await page.evaluate(async () => {
    const events = [];
    const testFlow = window.testHelpers.createTestNode("group", {
      nodes: [
        { type: "delay", duration: 100 },
        { type: "delay", duration: 100 },
        { type: "delay", duration: 100 },
      ],
    });

    // Subscribe to progress events
    const unsubscribe = window.conductor.events.onProgress((event) => {
      events.push({
        nodeId: event.nodeId,
        progress: event.progress,
        state: event.state,
        timestamp: Date.now(),
      });
    });

    await window.conductor.node.run(testFlow);
    unsubscribe();
    return events;
  });

  // Verify progress milestones
  const progressValues = progressEvents.map((e) => e.progress);
  expect(progressValues).toContain(0);
  expect(progressValues).toContain(33);
  expect(progressValues).toContain(66);
  expect(progressValues).toContain(100);

  // Verify monotonic increasing
  for (let i = 1; i < progressValues.length; i++) {
    expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1]);
  }
});
```

Architecture requirements:

- Progress events must be broadcast via IPC from desktop to browser
- Use weighted progress calculation from @atomiton/nodes/graph/weights.ts
- Ensure progress is calculated based on actual node execution, not estimates
- Progress should account for slowMo delays in timing

Validation:

- Run: pnpm test:e2e --grep "progress events"
- Run: pnpm test:e2e --grep "state transitions"
- Verify progress bar in UI updates smoothly
- Check that weighted nodes show appropriate progress chunks
- Ensure no progress events are lost or duplicated

Success criteria: Progress accurately reflects execution state and provides
smooth user feedback.

```

### Phase 4: Error Handling Tests (P1)
**Goal:** Ensure errors propagate correctly with full context

1. **Error Propagation** (`apps/e2e/src/integration/rpc-errors.e2e.ts`)
   - Test node execution errors
   - Test validation errors
   - Test transport errors
   - Test timeout errors
   - Verify error messages and stack traces preserved

2. **Error Recovery** (`apps/e2e/src/integration/rpc-error-recovery.e2e.ts`)
   - Test flow continues after non-critical errors
   - Test proper cleanup after fatal errors
   - Test error boundaries in parallel execution
   - Test retry mechanisms (if implemented)

#### Claude Code Prompt
```

Implement comprehensive error handling tests for the RPC transport layer to
ensure errors are properly caught, serialized, and propagated from desktop to
browser.

Prerequisites: Phase 1 test infrastructure must be complete.

Context: Errors can occur at multiple layers (validation, transport, execution)
and must be properly handled and reported to users with enough context for
debugging.

Tasks:

1. Create error propagation tests at
   /Users/Ryan/Code/atomiton/apps/e2e/src/integration/rpc-errors.e2e.ts:
   - Test node execution error (e.g., division by zero, null reference)
   - Test validation error (e.g., missing required inputs)
   - Test transport error (e.g., serialization failure)
   - Test timeout error (if timeouts are implemented)
   - Verify error message, type, and stack trace are preserved
   - Test that node ID and execution context are included in errors

2. Create error recovery tests at
   /Users/Ryan/Code/atomiton/apps/e2e/src/integration/rpc-error-recovery.e2e.ts:
   - Test flow with error in middle node - verify cleanup happens
   - Test parallel nodes where one fails - others should complete
   - Test error boundary behavior (if implemented)
   - Test retry mechanism (if implemented)
   - Verify resources are properly cleaned up after errors

Test implementation pattern:

```typescript
test("execution errors propagate with full context", async ({ page }) => {
  const errorResult = await page.evaluate(async () => {
    const errorNode = window.testHelpers.createTestNode("error", {
      errorMessage: "Intentional test error",
      errorCode: "TEST_ERROR",
    });

    try {
      await window.conductor.node.run(errorNode);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          nodeId: error.nodeId,
          executionId: error.executionId,
          hasStack: !!error.stack,
        },
      };
    }
  });

  expect(errorResult.success).toBe(false);
  expect(errorResult.error.message).toContain("Intentional test error");
  expect(errorResult.error.code).toBe("TEST_ERROR");
  expect(errorResult.error.nodeId).toBeDefined();
  expect(errorResult.error.executionId).toBeDefined();
  expect(errorResult.error.hasStack).toBe(true);
});

test("flow handles partial failure correctly", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const flowWithError = window.testHelpers.createTestNode("group", {
      nodes: [
        { type: "delay", duration: 100, id: "node1" },
        { type: "error", errorMessage: "Middle node fails", id: "node2" },
        { type: "delay", duration: 100, id: "node3" }, // Should not execute
      ],
    });

    const nodeStates = {};
    window.conductor.events.onStateChange((event) => {
      nodeStates[event.nodeId] = event.state;
    });

    try {
      await window.conductor.node.run(flowWithError);
    } catch (error) {
      return { nodeStates, error: error.message };
    }
  });

  expect(result.nodeStates.node1).toBe("completed");
  expect(result.nodeStates.node2).toBe("error");
  expect(result.nodeStates.node3).toBeUndefined(); // Never started
  expect(result.error).toContain("Middle node fails");
});
```

Architecture requirements:

- Errors must be serializable for IPC transport
- Include execution context (nodeId, executionId) in errors
- Preserve error types and codes through serialization
- Ensure stack traces are available for debugging
- Clean up resources (subscriptions, timers) on error

Validation:

- Run: pnpm test:e2e --grep "error propagation"
- Run: pnpm test:e2e --grep "error recovery"
- Verify errors appear correctly in UI error displays
- Check that partial execution state is preserved
- Ensure no memory leaks after error scenarios

Success criteria: Errors provide enough context for debugging and don't leave
the system in an inconsistent state.

```

### Phase 5: Complex Flow Testing (P1)
**Goal:** Test real-world flow execution patterns

1. **Graph Topology Tests** (`apps/e2e/src/integration/rpc-graph-execution.e2e.ts`)
   - Test sequential node chains
   - Test parallel node execution
   - Test conditional branching (when implemented)
   - Test nested group nodes
   - Test loop nodes with iterations

2. **Data Flow Tests** (`apps/e2e/src/integration/rpc-data-flow.e2e.ts`)
   - Test edge data passing between nodes
   - Test large data serialization
   - Test data transformation through multiple nodes
   - Test data type preservation (numbers, strings, objects, arrays)

#### Claude Code Prompt
```

Implement complex flow execution tests to verify real-world graph topologies and
data flows work correctly through the RPC layer.

Prerequisites: Phase 1-4 should be complete for best results.

Context: Real flows have complex topologies with sequential chains, parallel
branches, nested groups, and data dependencies. We need to ensure these patterns
work correctly through RPC.

Tasks:

1. Create graph topology tests at
   /Users/Ryan/Code/atomiton/apps/e2e/src/integration/rpc-graph-execution.e2e.ts:
   - Test 5-node sequential chain execution order
   - Test parallel execution of independent nodes (when supported)
   - Test nested group nodes (group containing groups)
   - Test loop nodes with 3 iterations (when supported)
   - Test diamond pattern (split then merge) execution

2. Create data flow tests at
   /Users/Ryan/Code/atomiton/apps/e2e/src/integration/rpc-data-flow.e2e.ts:
   - Test passing data through edges between nodes
   - Test large object (>1MB) serialization through RPC
   - Test data transformations (map, filter, reduce patterns)
   - Test all JS types: number, string, boolean, null, undefined, object, array,
     Date
   - Test that data mutations in one node don't affect others

Test implementation pattern:

```typescript
test("sequential chain executes in order", async ({ page }) => {
  const executionOrder = await page.evaluate(async () => {
    const order = [];
    const chainFlow = window.testHelpers.createTestNode("group", {
      nodes: [
        { type: "log", message: "Node 1", id: "n1" },
        { type: "log", message: "Node 2", id: "n2" },
        { type: "log", message: "Node 3", id: "n3" },
        { type: "log", message: "Node 4", id: "n4" },
        { type: "log", message: "Node 5", id: "n5" },
      ],
      edges: [
        { source: "n1", target: "n2" },
        { source: "n2", target: "n3" },
        { source: "n3", target: "n4" },
        { source: "n4", target: "n5" },
      ],
    });

    window.conductor.events.onNodeStart((event) => {
      order.push(event.nodeId);
    });

    await window.conductor.node.run(chainFlow);
    return order;
  });

  expect(executionOrder).toEqual(["n1", "n2", "n3", "n4", "n5"]);
});

test("data flows through edges correctly", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const dataFlow = window.testHelpers.createTestNode("group", {
      nodes: [
        { type: "constant", value: 10, id: "source" },
        { type: "multiply", factor: 2, id: "double" },
        { type: "add", value: 5, id: "addFive" },
        { type: "output", id: "result" },
      ],
      edges: [
        {
          source: "source",
          target: "double",
          sourceHandle: "value",
          targetHandle: "input",
        },
        {
          source: "double",
          target: "addFive",
          sourceHandle: "result",
          targetHandle: "input",
        },
        {
          source: "addFive",
          target: "result",
          sourceHandle: "result",
          targetHandle: "value",
        },
      ],
    });

    const execution = await window.conductor.node.run(dataFlow);
    return execution.outputs.result;
  });

  expect(result).toBe(25); // (10 * 2) + 5
});

test("nested groups execute correctly", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const nestedFlow = window.testHelpers.createTestNode("group", {
      id: "outer",
      nodes: [
        { type: "log", message: "Before inner", id: "before" },
        {
          type: "group",
          id: "inner",
          nodes: [
            { type: "log", message: "Inner 1", id: "i1" },
            { type: "log", message: "Inner 2", id: "i2" },
          ],
        },
        { type: "log", message: "After inner", id: "after" },
      ],
    });

    const order = [];
    window.conductor.events.onNodeComplete((event) => {
      order.push(event.nodeId);
    });

    await window.conductor.node.run(nestedFlow);
    return order;
  });

  expect(result).toContain("before");
  expect(result).toContain("i1");
  expect(result).toContain("i2");
  expect(result).toContain("inner");
  expect(result).toContain("after");
  expect(result.indexOf("before")).toBeLessThan(result.indexOf("inner"));
  expect(result.indexOf("inner")).toBeLessThan(result.indexOf("after"));
});
```

Architecture requirements:

- Use graph topology from @atomiton/nodes for execution order
- Ensure edges properly connect node inputs/outputs
- Support nested NodeDefinitions (groups containing groups)
- Preserve data types through JSON serialization
- Handle large data efficiently (streaming if needed)

Validation:

- Run: pnpm test:e2e --grep "graph execution"
- Run: pnpm test:e2e --grep "data flow"
- Test with actual flows from apps/client/src/templates/DebugPage/data/
- Verify execution order matches topological sort
- Check that data transformations produce correct results

Success criteria: Complex real-world flows execute correctly with proper data
flow and execution order.

```

### Phase 6: Performance & Edge Cases (P2)
**Goal:** Ensure system handles edge cases and performs adequately

1. **Performance Tests** (`apps/e2e/src/integration/rpc-performance.e2e.ts`)
   - Test execution with 100+ nodes
   - Test concurrent flow executions
   - Test memory usage during long-running flows
   - Test progress event throttling (if implemented)

2. **Edge Cases** (`apps/e2e/src/integration/rpc-edge-cases.e2e.ts`)
   - Test empty flows
   - Test single-node flows
   - Test deeply nested flows
   - Test flows with circular references (error handling)
   - Test cancellation mid-execution

#### Claude Code Prompt
```

Implement performance and edge case tests to ensure the RPC layer handles
extreme scenarios and maintains good performance under load.

Prerequisites: Phase 1 infrastructure must be complete. Other phases helpful but
not required.

Context: The system must handle edge cases gracefully and maintain reasonable
performance with large flows or concurrent executions.

Tasks:

1. Create performance tests at
   /Users/Ryan/Code/atomiton/apps/e2e/src/integration/rpc-performance.e2e.ts:
   - Test flow with 100+ nodes completes successfully
   - Test 5 concurrent flow executions remain isolated
   - Test memory doesn't leak during 10 sequential executions
   - Test progress events are throttled (no more than 60 events/second)
   - Test execution time scales linearly with node count

2. Create edge case tests at
   /Users/Ryan/Code/atomiton/apps/e2e/src/integration/rpc-edge-cases.e2e.ts:
   - Test empty flow (group with no nodes)
   - Test single atomic node execution
   - Test 5-level deep nested groups
   - Test circular reference detection and error
   - Test cancellation during execution (if supported)
   - Test execution with null/undefined input data

Test implementation pattern:

```typescript
test("handles 100+ node flow efficiently", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const nodes = [];
    for (let i = 0; i < 100; i++) {
      nodes.push({
        type: "delay",
        duration: 10, // Short delay to keep test fast
        id: `node-${i}`,
      });
    }

    const largeFlow = window.testHelpers.createTestNode("group", { nodes });

    const startTime = performance.now();
    const startMemory = performance.memory?.usedJSHeapSize;

    await window.conductor.node.run(largeFlow);

    const endTime = performance.now();
    const endMemory = performance.memory?.usedJSHeapSize;

    return {
      nodeCount: nodes.length,
      executionTime: endTime - startTime,
      memoryDelta: endMemory - startMemory,
    };
  });

  expect(result.nodeCount).toBe(100);
  expect(result.executionTime).toBeLessThan(5000); // Should complete in < 5 seconds
  expect(result.memoryDelta).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
});

test("concurrent executions remain isolated", async ({ page }) => {
  const results = await page.evaluate(async () => {
    const createFlow = (id) =>
      window.testHelpers.createTestNode("group", {
        id: `flow-${id}`,
        nodes: [
          { type: "constant", value: id, id: "source" },
          { type: "delay", duration: 100, id: "wait" },
          { type: "output", id: "result" },
        ],
      });

    // Launch 5 concurrent executions
    const executions = [];
    for (let i = 0; i < 5; i++) {
      executions.push(window.conductor.node.run(createFlow(i)));
    }

    const results = await Promise.all(executions);
    return results.map((r) => r.outputs.result);
  });

  // Each flow should return its own ID, proving isolation
  expect(results).toEqual([0, 1, 2, 3, 4]);
});

test("handles empty flow gracefully", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const emptyFlow = window.testHelpers.createTestNode("group", {
      nodes: [],
    });

    const execution = await window.conductor.node.run(emptyFlow);
    return {
      success: execution.status === "completed",
      hasOutputs: Object.keys(execution.outputs || {}).length > 0,
    };
  });

  expect(result.success).toBe(true);
  expect(result.hasOutputs).toBe(false);
});

test("detects circular references", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const circularFlow = window.testHelpers.createTestNode("group", {
      nodes: [
        { type: "delay", duration: 10, id: "n1" },
        { type: "delay", duration: 10, id: "n2" },
        { type: "delay", duration: 10, id: "n3" },
      ],
      edges: [
        { source: "n1", target: "n2" },
        { source: "n2", target: "n3" },
        { source: "n3", target: "n1" }, // Creates cycle
      ],
    });

    try {
      await window.conductor.node.run(circularFlow);
      return { error: null };
    } catch (error) {
      return {
        error: error.message,
        code: error.code,
      };
    }
  });

  expect(result.error).toContain("circular");
  expect(result.code).toBe("CIRCULAR_DEPENDENCY");
});
```

Architecture requirements:

- Monitor memory usage with performance.memory API
- Use performance.now() for accurate timing
- Ensure concurrent executions have separate contexts
- Implement progress event throttling to prevent flooding
- Handle edge cases without crashes or hangs

Validation:

- Run: pnpm test:e2e --grep "performance"
- Run: pnpm test:e2e --grep "edge cases"
- Monitor system resources during test execution
- Verify no memory leaks with repeated runs
- Check that edge cases produce appropriate errors

Success criteria: System remains stable and performant under stress and handles
all edge cases gracefully.

```

### Phase 7: CI/CD Integration
**Goal:** Ensure tests run reliably in automated pipelines

1. **CI Configuration**
   - Update GitHub Actions workflow to include RPC tests
   - Configure test parallelization for faster execution
   - Set up test result reporting
   - Add performance benchmarks

2. **Documentation**
   - Create RPC testing guide in `.claude/testing/`
   - Document test patterns and best practices
   - Add troubleshooting guide for common issues
   - Create template for new RPC tests

#### Claude Code Prompt
```

Integrate the RPC integration tests into the CI/CD pipeline and create
comprehensive documentation for future test development.

Prerequisites: At least Phase 1-3 tests should be implemented and working
locally.

Context: Tests must run reliably in GitHub Actions CI environment and be
maintainable by the team. Documentation ensures consistent test patterns.

Tasks:

1. Update GitHub Actions workflow at
   /Users/Ryan/Code/atomiton/.github/workflows/ci.yml:
   - Add new job "rpc-integration-tests" that depends on build job
   - Configure Xvfb for headless Electron testing in Linux
   - Set up test sharding for parallel execution
   - Add test result reporting with artifacts
   - Set timeout limits (2 minutes for P0 tests, 5 minutes for all)
   - Add performance regression detection

2. Create RPC testing guide at
   /Users/Ryan/Code/atomiton/.claude/testing/RPC_INTEGRATION_TESTING.md:
   - Explain the test architecture and why it's needed
   - Document the test utilities and fixtures API
   - Provide examples of common test patterns
   - List best practices for timing-sensitive tests
   - Include debugging tips (PWDEBUG=1, --headed, etc.)

3. Create test template at
   /Users/Ryan/Code/atomiton/apps/e2e/src/integration/rpc-template.e2e.ts.example:
   - Boilerplate for new RPC integration tests
   - Common imports and setup
   - Example test cases with proper assertions
   - Comments explaining each section

GitHub Actions configuration:

```yaml
rpc-integration-tests:
  name: RPC Integration Tests
  runs-on: ubuntu-latest
  needs: build
  timeout-minutes: 10

  strategy:
    matrix:
      shard: [1, 2, 3] # Run tests in parallel

  steps:
    - uses: actions/checkout@v4

    - name: Setup pnpm
      uses: pnpm/action-setup@v2

    - name: Setup Node
      uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: "pnpm"

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Download build artifacts
      uses: actions/download-artifact@v4
      with:
        name: build-output

    - name: Run RPC Integration Tests
      run: |
        # Start Xvfb for headless display
        export DISPLAY=:99
        Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &

        # Run tests with sharding
        pnpm test:e2e \
          --shard=${{ matrix.shard }}/${{ strategy.job-total }} \
          --reporter=json \
          --reporter=html \
          --grep "rpc-"

    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: rpc-test-results-${{ matrix.shard }}
        path: |
          apps/e2e/test-results/
          apps/e2e/playwright-report/

    - name: Check performance regression
      run: |
        node scripts/check-performance-regression.js \
          --baseline .performance-baseline.json \
          --current apps/e2e/test-results/performance.json \
          --threshold 20
```

Documentation structure for RPC_INTEGRATION_TESTING.md:

1. **Why RPC Integration Tests**: Explain the gap they fill
2. **Architecture Overview**: Browser → RPC → Desktop flow diagram
3. **Test Utilities API Reference**: Each helper function documented
4. **Common Patterns**: SlowMo testing, progress tracking, error handling
5. **Writing New Tests**: Step-by-step guide
6. **Debugging Failed Tests**: How to diagnose RPC issues
7. **Performance Considerations**: Timing tolerances, flaky test prevention
8. **CI/CD Integration**: How tests run in GitHub Actions

Validation:

- Push changes and verify CI runs successfully
- Check that test artifacts are uploaded
- Verify parallel execution reduces total time
- Ensure documentation is clear and complete
- Test that new developers can write tests using the guide

Success criteria: RPC tests run reliably in CI with <2% flake rate and
comprehensive documentation enables team to maintain and extend tests.

```

### Implementation Notes

- **Test Execution Strategy:** Use Playwright's built-in Electron support to test the full stack without mocking
- **Test Data:** Leverage existing test flows in `apps/client/src/templates/DebugPage/data/`
- **Timing Verification:** Use performance.now() for accurate timing measurements
- **Progress Monitoring:** Subscribe to progress events via window.conductor API
- **Parallel Execution:** Run independent test suites in parallel for faster feedback
- **Debugging:** Use PWDEBUG=1 environment variable for interactive debugging

### Success Metrics

- All P0 tests passing consistently
- Test execution time < 2 minutes for core suite
- Zero flaky tests in CI/CD pipeline
- 100% coverage of RPC transport layer
- All manual test scenarios automated
```
