# Critical Issues & Action Plan - Progress Visualization

**Date**: 2025-10-04 **Reviewers**: Michael (Architecture), Karen (Quality),
Guilliman (Standards)

---

## 🔴 CRITICAL: Data Flow Between Nodes is BROKEN

### Issue Summary

**Discovered by**: Michael (Architecture Investigation) **Status**: CONFIRMED
BROKEN **Severity**: CRITICAL - Core functionality failure

### The Problem

Data from completed nodes is NOT being passed correctly to subsequent nodes in
graph execution.

**Evidence**: Test case shows wrong output:

```
Expected: 5 → double(10) → add10(20) → square(400)
Actual:   5 → double(10) → add10(15) → square(25)
          ❌ Node read parent input (5) instead of edge input (10)
```

### Root Cause

**File**: `packages/@atomiton/conductor/src/execution/executeGraph.ts:87`

```typescript
const childInput = node.edges
  ?.filter((edge) => edge.target === childNode.id)
  .reduce(
    (acc: Record<string, unknown>, edge) => {
      const sourceOutput = nodeOutputs.get(edge.source);
      if (sourceOutput !== undefined) {
        const key = edge.targetHandle || "default";
        return { ...acc, [key]: sourceOutput };
      }
      return acc;
    },
    (context.input as Record<string, unknown>) || {}, // ← PROBLEM HERE
  );
```

**The Bug**: The reduce starts with `context.input` (parent's input) as the
initial value. This means:

1. Child nodes inherit parent context input
2. Edge data is ADDED to inherited input, not replacing it
3. If edge `targetHandle` doesn't match the key the node reads, node gets wrong
   data

**Example**:

```
Parent input: { default: 5 }
Edge provides: { in: 10 } (targetHandle: "in")
Child receives: { default: 5, in: 10 }  ← Has BOTH!
Node reads: input.default = 5  ← WRONG!
```

### Required Fix

**Change line 87 from**:

```typescript
(context.input as Record<string, unknown>) || {},
```

**To**:

```typescript
{},  // Start with empty object
```

**Add after line 88**:

```typescript
);

// Merge parent context input, but edge data takes precedence
const finalInput = {
  ...(context.input as Record<string, unknown> || {}),
  ...childInput,
};
```

**Update line 94**:

```typescript
input: finalInput,  // Instead of childInput
```

### Tests Required

1. ✅ Sequential data flow test (ADDED but FAILING)
2. Test edge data overrides parent context
3. Test nodes without edges receive parent input
4. Test multiple edges merge correctly
5. Test various targetHandle values

### Priority

**🔴 MUST FIX BEFORE ANY OTHER WORK**

This is a fundamental execution bug that breaks graph data flow.

---

## 🟠 HIGH PRIORITY: Performance Issues

### Issue 1: O(n) Array Search on Every Progress Event

**Discovered by**: Karen (Quality Review) **File**:
`packages/@atomiton/editor/src/hooks/useNodeExecutionState.ts:19`

```typescript
const nodeState = event.nodes.find((n) => n.id === nodeId);
```

**Problem**: Linear search through all nodes on every progress event

- 100 nodes × 10 events/sec = **1000 array scans per second**

**Fix**:

```typescript
// Option 1: Convert to Map lookup (better)
useEffect(() => {
  const unsubscribe = conductor.node.onProgress((event) => {
    if (!nodeRef.current) return;

    // O(1) lookup instead of O(n)
    const nodeStateMap = new Map(event.nodes.map((n) => [n.id, n]));
    const nodeState = nodeStateMap.get(nodeId);

    // ... rest of logic
  });

  return unsubscribe;
}, [nodeId]);

// Option 2: Filter subscription to specific node (even better if supported)
// Check if conductor.node.onProgress can filter by nodeId
```

### Issue 2: Multiple DOM Traversals

**File**: `packages/@atomiton/editor/src/hooks/useNodeExecutionState.ts:23-31`

**Problem**: Two `.closest()` calls per progress event

**Fix**: Cache the lookups

```typescript
useEffect(() => {
  // Cache expensive DOM traversals once
  const reactFlowNode = nodeRef.current?.closest(
    ".react-flow__node",
  ) as HTMLElement | null;
  const atomitonNode = nodeRef.current?.closest(
    ".atomiton-node",
  ) as HTMLElement | null;

  const unsubscribe = conductor.node.onProgress((event) => {
    if (!reactFlowNode || !atomitonNode) return;

    // Use cached references (no more .closest() calls)
    const nodeState = event.nodes.find((n) => n.id === nodeId);
    // ...
  });

  return unsubscribe;
}, [nodeId]);
```

**Estimated Impact**: 5-10% performance improvement on large graphs

---

## 🟠 HIGH PRIORITY: Missing Tests

### Issue: Zero Test Coverage for Progress Visualization

**Discovered by**: Karen (Quality Review)

**Critical Missing Tests**:

1. **Hook Tests** (`useNodeExecutionState.test.ts` - DOES NOT EXIST)

   ```typescript
   describe("useNodeExecutionState", () => {
     it("should subscribe to progress events on mount");
     it("should unsubscribe on unmount");
     it("should update DOM attributes when node state changes");
     it("should handle missing nodeRef gracefully");
     it("should update --progress CSS variable");
     it("should set/remove ARIA attributes correctly");
   });
   ```

2. **Integration Tests**
   - Sequential execution progress visualization
   - Error state visualization (red border at frozen %)
   - Smooth animation from 0-100%

3. **Performance Tests** (Phase 4.2)
   - Frame rate with 100+ nodes
   - Memory stability during/after execution

**Priority**: Create basic hook tests before proceeding to Phase 3

---

## 🟡 MEDIUM PRIORITY: Build & Dependency Issues

### Issue 1: Missing CSS Variable

**Discovered by**: Karen (Quality Review) **File**:
`packages/@atomiton/editor/src/components/Canvas/styles.css:36`

```css
--atomiton-node-critical-path-shadow: 0 0 10px rgba(var(--color-red-rgb), 0.5);
```

**Problem**: References `--color-red-rgb` from `@atomiton/ui` but it's not
imported

**Fix**:

```css
/* Option 1: Import UI theme CSS */
@import "@atomiton/ui/theme/variables.css";

/* Option 2: Define locally */
:root {
  --color-red-rgb: 239, 68, 68; /* red-500 */
}
```

### Issue 2: TypeScript Build Error

**File**: `packages/@atomiton/editor/src/hooks/useEditorStore.ts`

```
error TS7016: Could not find a declaration file for module '@atomiton/store'
```

**Fix**: Add type declarations or update imports

---

## 🟡 MEDIUM PRIORITY: Browser Compatibility

### Issue: Firefox Doesn't Support @property

**Discovered by**: Guilliman (Standards Review) **Impact**: Firefox users won't
see smooth progress animations

**Current Code**:

```css
@property --progress-deg {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}
```

**Browser Support**:

- ✅ Chrome/Edge 85+
- ✅ Safari 16.4+
- ❌ **Firefox: NO SUPPORT**

**Fix**: Add graceful degradation

```typescript
// In useNodeExecutionState.ts
const supportsAtProperty =
  CSS.supports("(--test: 0deg)") && CSS.supports("transition: --test 0.3s");

if (atomitonNode) {
  atomitonNode.style.setProperty("--progress", String(nodeState.progress));

  if (!supportsAtProperty) {
    // Disable smooth transition in Firefox
    atomitonNode.style.transition = "none";
  }
}
```

---

## 🟢 LOW PRIORITY: Code Quality Improvements

### Issue 1: Hardcoded CSS Values

**File**: `packages/@atomiton/editor/src/components/Canvas/styles.css`

**Current**: Magic numbers scattered throughout

- `-2px`, `-4px`, `3px` (border calculations)
- `0.3s`, `0.2s` (animation durations)
- `3.6deg` (360/100 for percentage)

**Fix**: Extract to CSS variables

```css
:root {
  --atomiton-progress-border-width: 3px;
  --atomiton-progress-transition-duration: 0.3s;
  --atomiton-hover-transition-duration: 0.2s;
  --atomiton-progress-deg-per-percent: 3.6deg;
}
```

### Issue 2: Missing Error Handling

**File**: `useNodeExecutionState.ts:15-16`

**Add**:

```typescript
const unsubscribe = conductor.node.onProgress((event) => {
  try {
    if (!nodeRef.current) return;
    // ... rest of logic
  } catch (error) {
    console.error("Progress update failed for node:", nodeId, error);
  }
});
```

---

## 📋 ACTION PLAN

### Phase 0: Critical Fixes (MUST DO FIRST)

**Priority**: 🔴 CRITICAL **Time**: 2-3 hours **Owner**: Primary developer

1. **Fix data flow bug** ✅ **COMPLETED**
   - [x] Modify `executeGraph.ts` line 74-94
   - [x] Run existing data flow test (all 4 tests pass)
   - [x] Fix test to use correct targetHandle (default instead of "in")
   - [x] Verify all tests pass

   **Changes Made**:
   - Modified `executeGraph.ts` to use edge data exclusively when edges exist
     (no parent input leaking)
   - Fixed `dataFlow.test.ts` to omit targetHandle (defaults to "default")
   - Verified data flows correctly: 5 → 10 → 20 → 400 ✅

2. **Fix performance issues** ✅ **COMPLETED**
   - [x] Cache DOM lookups in `useNodeExecutionState`
   - [x] Keep array.find() for node lookup (simpler and faster for typical use)
   - [ ] Test with 100-node graph (deferred - requires E2E test infrastructure)

   **Changes Made**:
   - Cached `reactFlowNode` and `atomitonNode` DOM references once in useEffect
   - Kept `event.nodes.find()` after review showed Map creation is slower for
     small arrays
   - Estimated 5-10% performance improvement from DOM caching

   **Review Finding** (Guilliman): Initial Map optimization was slower due to
   Map creation overhead. For typical node counts (3-50), `find()` is faster
   than creating a Map for single lookup.

3. **Fix critical CSS/build issues** ✅ **COMPLETED**
   - [x] Use `--color-red-rgb` from `@atomiton/ui` theme
   - [x] Fix `@atomiton/store` missing type declarations
   - [x] Fix pre-existing lint errors (any types in tests)
   - [x] Verify all builds pass successfully

   **Changes Made**:
   - Verified `--color-red-rgb` is already available from
     `@atomiton/ui/theme/variables.css`
   - Removed redundant local definition (using theme variable instead)
   - Added clarifying comment that variable comes from UI theme
   - Rebuilt @atomiton/store to generate missing type declarations
   - Fixed all explicit `any` types in test files:
     - `sequentialProgress.test.ts`: Added ExecutionGraphState type for store
       subscriptions
     - `asyncProgress.test.ts`: Added ExecutionGraphState type for store
       subscriptions
     - `slowMo.test.ts`: Added ExecutionGraphState and ExecutionGraphNode types
     - `executionGraphStore.test.ts`: Added ExecutionGraphState type for store
       subscriptions
     - `dataFlow.test.ts`: Used ExecutionContext and Record<string, unknown> for
       test mocks
   - All packages build successfully
   - All conductor tests pass (109 tests)

**Validation**:

```bash
# Must all pass before proceeding
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

---

### Phase 1: Test Coverage (SHOULD DO BEFORE PHASE 3)

**Priority**: 🟠 HIGH **Time**: 2-3 hours **Owner**: Primary developer

1. **Create hook tests** (1.5 hours)
   - [ ] Create `useNodeExecutionState.test.ts`
   - [ ] Add 8-10 test cases (see Missing Tests section)
   - [ ] Achieve >80% coverage

2. **Add integration tests** (1 hour)
   - [ ] Test sequential execution visualization
   - [ ] Test error state visualization
   - [ ] Test rapid state changes

3. **Document browser requirements** (30 min)
   - [ ] Add Firefox compatibility note to README
   - [ ] Document minimum browser versions
   - [ ] Add browser support matrix

---

### Phase 2: Polish & Documentation (NICE TO HAVE)

**Priority**: 🟡 MEDIUM **Time**: 1-2 hours **Owner**: Primary developer

1. **Code quality improvements** (1 hour)
   - [ ] Extract CSS magic numbers to variables
   - [ ] Add error handling
   - [ ] Add explicit TypeScript return types

2. **Documentation** (30 min)
   - [ ] Add usage examples to hook JSDoc
   - [ ] Document performance characteristics
   - [ ] Add troubleshooting guide

3. **Firefox fallback** (30 min)
   - [ ] Add `@property` support detection
   - [ ] Gracefully degrade to instant updates

---

### Phase 3: Edge Animations (AFTER PHASE 0-1)

**Continue with original plan from `PROGRESS_VISUALIZATION_REMAINING_WORK.md`**

---

## 🎯 Immediate Next Steps

**DO THIS NOW** (in order):

1. **Fix data flow bug** (`executeGraph.ts`) ← CRITICAL
2. **Run tests** to verify fix works
3. **Fix performance issues** (`useNodeExecutionState.ts`)
4. **Fix CSS/build errors**
5. **Create basic hook tests**
6. **Validate everything builds and passes**

**THEN proceed to Phase 3** (Edge Animations)

---

## 📊 Summary

### Current State

- ✅ Phase 1-2 UI implementation complete
- ❌ Critical data flow bug
- ⚠️ Performance issues
- ❌ No test coverage
- ⚠️ Minor build/CSS issues

### After Phase 0 Fixes

- ✅ Data flows correctly between nodes
- ✅ Performance optimized
- ✅ Builds successfully
- ⚠️ Still needs tests

### After Phase 1 Tests

- ✅ Test coverage >80%
- ✅ Production-ready quality
- ✅ Ready for Phase 3 (Edge Animations)

---

**Created**: 2025-10-04 **Last Updated**: 2025-10-04 **Status**: ACTION
REQUIRED - Critical bugs must be fixed before proceeding
