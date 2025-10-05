# Progress Visualization - Remaining Work

**Created**: 2025-10-04 **Status**: Phase 1 & 2 Complete, Phase 3-4 Pending

---

## Current State Assessment

### ✅ Completed (Phases 1 & 2)

#### Phase 1: Node Progress Border Visualization

- **Hook Implementation**: `useNodeExecutionState` ✅
  - Subscribes to conductor progress events
  - Updates DOM attributes without React re-renders
  - Handles execution states: pending, executing, completed, error
  - Sets ARIA attributes for accessibility
  - Updates `--progress` CSS variable (0-100)

- **CSS Animations**: Circular progress border ✅
  - Conic gradient fills clockwise from top (12 o'clock)
  - Green color for executing/completed states
  - Red color for error states (frozen at error progress %)
  - Smooth 0.3s transitions via `@property --progress-deg`
  - GPU-accelerated with CSS custom properties

- **Critical Path Visualization**: ✅
  - `data-critical-path` attribute set on nodes
  - Identifies nodes on longest execution path

#### Phase 2: Sequential Progress Tracking

- **Conductor Integration**: ✅ (commit 5c79e887)
  - Sequential progress visualization implemented
  - Weighted progress calculation with caching
  - Progress events emit node states and progress percentages

- **Type Safety**: ✅ (commit 8d757cc1)
  - Type safety issues resolved
  - Proper TypeScript types throughout

---

## 🚧 Remaining Work

### Phase 3: Edge Progress Animations

**Priority**: 🟡 MEDIUM **Estimated Time**: 2-3 hours **Prerequisites**: Phases
1-2 complete ✅

#### 3.1 Research & Planning ✅

**Status**: Complete (2025-10-04) **Researcher**: Guilliman (standards guardian)
**Research Document**:
[EDGE_ANIMATION_RESEARCH.md](./EDGE_ANIMATION_RESEARCH.md)

**Key Findings**:

- ❌ React Flow's `AnimatedSVGEdge` is NOT suitable (moves particles, not
  progress bars)
- ✅ Custom implementation with CSS `stroke-dasharray` is the correct approach
- ✅ Expected performance: 60fps with 500+ edges (GPU-accelerated CSS)
- ✅ Implementation mirrors existing `useNodeExecutionState` pattern

**Decision**: Use custom edge component with CSS-only animations

**Reference**: See [EDGE_ANIMATION_RESEARCH.md](./EDGE_ANIMATION_RESEARCH.md)
for:

- Detailed performance analysis
- Complete architecture blueprint
- Code examples for all files
- Browser compatibility assessment
- Risk mitigation strategies

#### 3.2 Implementation Tasks

##### Task 3.2.1: Create Animated Edge Component

**File**: `packages/@atomiton/editor/src/components/Edge/AnimatedEdge.tsx` (NEW)

**Implementation**:

```typescript
import { getBezierPath } from 'reactflow';
import { memo } from 'react';
import type { NodeExecutionState } from '@atomiton/conductor';

interface AnimatedEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourceNodeState: NodeExecutionState;
  targetNodeState: NodeExecutionState;
}

export const AnimatedEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourceNodeState,
  targetNodeState,
}: AnimatedEdgeProps) => {
  const [edgePath] = getBezierPath({ sourceX, sourceY, targetX, targetY });

  // Edge is active when source completed and target is executing
  const isActive =
    sourceNodeState === 'completed' && targetNodeState === 'executing';
  const hasError = sourceNodeState === 'error';

  const color = hasError ? 'var(--atomiton-node-state-error)' : 'var(--atomiton-node-state-completed)';

  return (
    <g>
      {/* Base edge path (always visible) */}
      <path
        d={edgePath}
        stroke="var(--atomiton-node-border-default)"
        strokeWidth={2}
        fill="none"
      />

      {/* Animated progress overlay (only when active) */}
      {isActive && (
        <path
          d={edgePath}
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeDasharray="10 5"
          className="animated-edge-flow"
        />
      )}
    </g>
  );
}, (prev, next) => {
  // Only re-render if states actually changed
  return prev.sourceNodeState === next.sourceNodeState &&
         prev.targetNodeState === next.targetNodeState;
});

AnimatedEdge.displayName = 'AnimatedEdge';
```

**Validation**:

```typescript
// Test in React Flow canvas
<ReactFlow
  nodes={nodes}
  edges={edges}
  edgeTypes={{ animated: AnimatedEdge }}
/>
```

##### Task 3.2.2: Add Edge Animation CSS

**File**: `packages/@atomiton/editor/src/components/Canvas/styles.css`

**Add**:

```css
/* Edge flow animation */
@keyframes dash-flow {
  from {
    stroke-dashoffset: 15;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.animated-edge-flow {
  animation: dash-flow 1s linear infinite;
}

/* Edge states */
.react-flow__edge[data-edge-state="propagating"] .react-flow__edge-path {
  stroke: var(--atomiton-node-state-completed);
  stroke-width: 2;
}

.react-flow__edge[data-edge-state="error"] .react-flow__edge-path {
  stroke: var(--atomiton-node-state-error);
  stroke-width: 2;
}

.react-flow__edge[data-edge-state="inactive"] .react-flow__edge-path {
  stroke: var(--atomiton-node-border-default);
  stroke-width: 1;
}
```

##### Task 3.2.3: Create Edge Execution State Hook

**File**: `packages/@atomiton/editor/src/hooks/useEdgeExecutionState.ts` (NEW)

**Implementation**:

```typescript
import { conductor } from "@atomiton/conductor/browser";
import { useEffect, useRef } from "react";

/**
 * Hook to subscribe an edge to execution progress events
 * Updates edge state when source/target nodes change state
 *
 * @param edgeId - The ID of the edge to track
 * @param sourceId - ID of source node
 * @param targetId - ID of target node
 * @returns ref to attach to the edge's SVG element
 */
export function useEdgeExecutionState(
  edgeId: string,
  sourceId: string,
  targetId: string,
) {
  const edgeRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const unsubscribe = conductor.node.onProgress((event) => {
      if (!edgeRef.current) return;

      const sourceNode = event.nodes.find((n) => n.id === sourceId);
      const targetNode = event.nodes.find((n) => n.id === targetId);

      if (!sourceNode || !targetNode) return;

      // Find the ReactFlow edge wrapper
      const reactFlowEdge = edgeRef.current.closest(
        ".react-flow__edge",
      ) as HTMLElement | null;
      if (!reactFlowEdge) return;

      // Determine edge state
      let edgeState = "inactive";
      if (sourceNode.state === "error") {
        edgeState = "error";
      } else if (
        sourceNode.state === "completed" &&
        targetNode.state === "executing"
      ) {
        edgeState = "propagating";
      }

      reactFlowEdge.setAttribute("data-edge-state", edgeState);
    });

    return unsubscribe;
  }, [edgeId, sourceId, targetId]);

  return edgeRef;
}
```

**Validation**:

```typescript
// Test in edge component
function CustomEdge({ id, source, target, ...props }) {
  const edgeRef = useEdgeExecutionState(id, source, target);
  return <path ref={edgeRef} {...props} />;
}
```

##### Task 3.2.4: Integrate Animated Edges with Canvas

**File**: `packages/@atomiton/editor/src/components/Canvas/index.tsx`

**Modify**:

```typescript
import { AnimatedEdge } from '../Edge/AnimatedEdge';

// Register custom edge types
const edgeTypes = {
  animated: AnimatedEdge,
};

// In component
<ReactFlow
  nodes={nodes}
  edges={edges}
  edgeTypes={edgeTypes}
  defaultEdgeOptions={{
    type: 'animated',
  }}
/>
```

#### 3.3 Performance Optimization

##### Optimization 1: Conditional Rendering

Only animate edges connected to active nodes:

```typescript
const shouldAnimate = sourceNodeState === 'completed' ||
                      targetNodeState === 'executing' ||
                      sourceNodeState === 'error';

if (!shouldAnimate) {
  return <StaticEdge {...props} />;
}
```

##### Optimization 2: Memoization

Use React.memo with custom comparison:

```typescript
const AnimatedEdge = memo(EdgeComponent, (prev, next) => {
  return (
    prev.sourceNodeState === next.sourceNodeState &&
    prev.targetNodeState === next.targetNodeState &&
    prev.id === next.id
  );
});
```

##### Optimization 3: CSS-only Animations

Prefer CSS animations over JavaScript:

- Runs on GPU compositor thread
- No JavaScript overhead
- Automatically paused when element off-screen

#### 3.4 Testing

**Manual Tests**:

1. Execute hello-world flow (3 sequential nodes)
   - Verify edges animate in sequence
   - Check color transitions (gray → green)
   - Confirm smooth transitions

2. Execute flow with error node
   - Verify edge turns red on error
   - Check animation stops at error point

3. Performance test (100+ edges)
   - Monitor frame rate (should stay 60fps)
   - Check CPU usage (<50%)
   - Verify no memory leaks

**Validation Commands**:

```bash
# Run dev server
pnpm dev

# Navigate to debug page
open http://localhost:5173/debug/flows

# Execute flows and observe edge animations
```

---

### 🤖 Phase 3 Implementation Prompt (For Guilliman)

**Context**: Based on research completed on 2025-10-04, React Flow's
`AnimatedSVGEdge` is NOT suitable for our progress visualization needs. We need
a custom implementation using CSS-only animations for optimal performance.

**Research Findings**:

- React Flow's `AnimatedSVGEdge` moves particles along edges (not progress bars)
- Custom edge with CSS `stroke-dasharray` is the correct approach
- Expected performance: 60fps with 500+ edges
- Implementation mirrors existing `useNodeExecutionState` pattern

---

#### Implementation Instructions

**Objective**: Implement edge progress animations that:

1. Show visual data flow between nodes during execution
2. Use GPU-accelerated CSS animations (no JS animations)
3. Follow the same direct DOM manipulation pattern as `useNodeExecutionState`
4. Support error state visualization (red edges)
5. Maintain 60fps with 100+ edges

---

#### Step 1: Create Custom Edge Component (30 min)

**File**: `packages/@atomiton/editor/src/components/Edge/ProgressEdge.tsx` (NEW)

**Implementation**:

```typescript
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';
import { useEdgeExecutionState } from '#hooks/useEdgeExecutionState';

/**
 * Custom edge component with execution progress visualization
 * Uses direct DOM manipulation for performance (mirrors useNodeExecutionState pattern)
 */
export function ProgressEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  target,
  ...props
}: EdgeProps) {
  const edgeRef = useEdgeExecutionState(id, source, target);

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <g ref={edgeRef as React.RefObject<SVGGElement>}>
      <BaseEdge
        id={id}
        path={edgePath}
        {...props}
      />
    </g>
  );
}
```

**Validation**:

```bash
pnpm typecheck
# Should compile without errors
```

---

#### Step 2: Create Edge Execution State Hook (45 min)

**File**: `packages/@atomiton/editor/src/hooks/useEdgeExecutionState.ts` (NEW)

**Implementation**:

````typescript
import { conductor } from "@atomiton/conductor/browser";
import { useEffect, useRef } from "react";

/**
 * Hook to subscribe an edge to execution progress events
 * Updates DOM attributes directly for performance (no React re-renders)
 *
 * Mirrors the pattern from useNodeExecutionState for consistency
 *
 * @param edgeId - The ID of the edge to track
 * @param sourceId - ID of source node
 * @param targetId - ID of target node
 * @returns ref to attach to the edge's SVG group element
 *
 * @example
 * ```tsx
 * function ProgressEdge({ id, source, target, ...props }: EdgeProps) {
 *   const edgeRef = useEdgeExecutionState(id, source, target);
 *   return <g ref={edgeRef}>...</g>;
 * }
 * ```
 *
 * @performance
 * - Uses direct DOM manipulation (no React re-renders)
 * - Caches DOM references to avoid repeated traversals
 * - Efficient for graphs with 500+ edges
 */
export function useEdgeExecutionState(
  edgeId: string,
  sourceId: string,
  targetId: string,
) {
  const edgeRef = useRef<SVGGElement>(null);

  useEffect(() => {
    // Cache DOM reference once to avoid expensive .closest() calls on every event
    const reactFlowEdge = edgeRef.current?.closest(
      ".react-flow__edge",
    ) as HTMLElement | null;

    if (!reactFlowEdge) return;

    const unsubscribe = conductor.node.onProgress((event) => {
      // Use find() for small arrays - faster than Map creation for typical node counts
      const sourceNode = event.nodes.find((n) => n.id === sourceId);
      const targetNode = event.nodes.find((n) => n.id === targetId);

      if (!sourceNode || !targetNode) return;

      // Determine edge state based on connected node states
      // Edge is "propagating" when source completed and target is executing
      let edgeState = "inactive";

      if (sourceNode.state === "error") {
        edgeState = "error";
      } else if (
        sourceNode.state === "completed" &&
        targetNode.state === "executing"
      ) {
        edgeState = "propagating";
      }

      // Update execution state on ReactFlow edge wrapper (no React re-render)
      reactFlowEdge.setAttribute("data-edge-state", edgeState);

      // Add accessibility attributes for screen readers
      if (edgeState === "propagating") {
        reactFlowEdge.setAttribute(
          "aria-label",
          `Data flowing from ${sourceId} to ${targetId}`,
        );
      } else if (edgeState === "error") {
        reactFlowEdge.setAttribute(
          "aria-label",
          `Error in connection from ${sourceId} to ${targetId}`,
        );
      } else {
        reactFlowEdge.removeAttribute("aria-label");
      }
    });

    return unsubscribe;
  }, [edgeId, sourceId, targetId]);

  return edgeRef;
}
````

**Validation**:

```bash
pnpm --filter @atomiton/editor typecheck
# Should compile without errors
```

---

#### Step 3: Add Edge Animation CSS (30 min)

**File**: `packages/@atomiton/editor/src/components/Canvas/styles.css`

**Add at the end of file**:

```css
/* ============================================================================
 * Edge Progress Animations
 * ============================================================================
 * CSS-only animations for edge execution state visualization
 * GPU-accelerated with stroke-dasharray for optimal performance
 */

/* Edge flow animation - moving dashes to indicate data propagation */
@keyframes edge-dash-flow {
  from {
    stroke-dashoffset: 15;
  }
  to {
    stroke-dashoffset: 0;
  }
}

/* Edge states - controlled by data-edge-state attribute */
.react-flow__edge[data-edge-state="inactive"] .react-flow__edge-path {
  stroke: var(--atomiton-node-border-default);
  stroke-width: 1;
  transition:
    stroke 0.3s ease,
    stroke-width 0.3s ease;
}

.react-flow__edge[data-edge-state="propagating"] .react-flow__edge-path {
  stroke: var(--atomiton-node-state-completed);
  stroke-width: 2;
  stroke-dasharray: 10 5;
  animation: edge-dash-flow 1s linear infinite;
  transition:
    stroke 0.3s ease,
    stroke-width 0.3s ease;
}

.react-flow__edge[data-edge-state="error"] .react-flow__edge-path {
  stroke: var(--color-red);
  stroke-width: 2;
  transition:
    stroke 0.3s ease,
    stroke-width 0.3s ease;
  /* No animation - frozen state */
}

/* Performance optimization: will-change hint for GPU acceleration */
.react-flow__edge[data-edge-state="propagating"] .react-flow__edge-path {
  will-change: stroke-dashoffset;
}
```

**Validation**:

```bash
# Visual check - should see CSS in file with no syntax errors
cat packages/@atomiton/editor/src/components/Canvas/styles.css | tail -50
```

---

#### Step 4: Integrate with Canvas (30 min)

**File**: `packages/@atomiton/editor/src/components/Canvas/index.tsx`

**Add import**:

```typescript
import { ProgressEdge } from "../Edge/ProgressEdge";
```

**Register edge type** (find the existing `edgeTypes` or create if missing):

```typescript
const edgeTypes = {
  default: ProgressEdge,
};
```

**Apply to ReactFlow component**:

```typescript
<ReactFlow
  nodes={nodes}
  edges={edges}
  edgeTypes={edgeTypes}
  // ... other props
/>
```

**Validation**:

```bash
pnpm --filter @atomiton/editor typecheck
pnpm --filter @atomiton/editor lint
```

---

#### Step 5: Manual Testing (30 min)

**Test Plan**:

1. **Sequential Execution Test**

   ```bash
   pnpm dev
   # Navigate to debug page
   # Execute hello-world template (3 sequential nodes)
   ```

   **Expected Behavior**:
   - Edges remain gray (inactive) initially
   - As node 1 completes, edge 1→2 animates (moving dashes, green)
   - As node 2 completes, edge 2→3 animates
   - When execution completes, all edges return to gray

2. **Error State Test**

   ```bash
   # Execute a flow with an error node
   ```

   **Expected Behavior**:
   - Edge connected to error node turns red
   - No animation on error edge (frozen)
   - Subsequent edges remain inactive

3. **Performance Test**
   - Create flow with 100+ nodes and 150+ edges
   - Execute and monitor Chrome DevTools Performance tab

   **Success Criteria**:
   - FPS stays above 55fps
   - No long tasks (>50ms)
   - CPU usage <50%

**Validation Commands**:

```bash
# Run dev server
pnpm dev

# Run E2E test to verify no regressions
E2E_OUTPUT_DIR=/tmp/e2e-test pnpm --filter @atomiton/e2e test hello-world-template
```

---

#### Step 6: Architecture Review (15 min)

**Checklist**:

- [ ] Custom edge component uses `BaseEdge` from React Flow (no reinventing)
- [ ] Hook follows same pattern as `useNodeExecutionState` (consistency)
- [ ] CSS animations are GPU-accelerated (will-change, stroke-dashoffset)
- [ ] No JavaScript animations (CSS-only for performance)
- [ ] Direct DOM manipulation (no React re-renders)
- [ ] Accessibility attributes added (ARIA labels)
- [ ] Edge states match node states logically
- [ ] Performance targets met (60fps with 500+ edges)

**Architecture Alignment**:

- ✅ Follows existing hook pattern (`useNodeExecutionState`)
- ✅ Uses direct DOM manipulation (not React state)
- ✅ Subscribes to conductor progress events (same event system)
- ✅ CSS-only animations (GPU-accelerated)
- ✅ No new dependencies required

---

#### Success Criteria

**Functional**:

- [ ] Edges animate during data propagation
- [ ] Edge colors match execution states (gray/green/red)
- [ ] Animations smooth and synchronized with node progress
- [ ] Error states visible (red, no animation)
- [ ] Accessibility attributes present

**Performance**:

- [ ] 60fps maintained with 100+ edges
- [ ] CPU usage <50% during execution
- [ ] No memory leaks after 10+ executions
- [ ] Animations use GPU compositing (check DevTools Layers)

**Code Quality**:

- [ ] TypeScript compiles without errors
- [ ] Lint passes without warnings
- [ ] Follows existing code patterns
- [ ] JSDoc documentation complete
- [ ] No magic numbers (use CSS variables)

---

#### Common Pitfalls to Avoid

1. **DON'T use JavaScript animations**
   - ❌ `setInterval` to update edge state
   - ✅ CSS `@keyframes` with `stroke-dasharray`

2. **DON'T cause React re-renders**
   - ❌ Setting React state in progress event handler
   - ✅ Direct DOM manipulation with `.setAttribute()`

3. **DON'T forget accessibility**
   - ❌ Visual-only state changes
   - ✅ ARIA labels for screen readers

4. **DON'T ignore performance**
   - ❌ Animating all edges regardless of state
   - ✅ Only animate "propagating" edges

5. **DON'T reinvent React Flow components**
   - ❌ Custom SVG path rendering
   - ✅ Use `BaseEdge` and `getBezierPath`

---

#### Files Summary

**New Files**:

- `packages/@atomiton/editor/src/components/Edge/ProgressEdge.tsx`
- `packages/@atomiton/editor/src/hooks/useEdgeExecutionState.ts`

**Modified Files**:

- `packages/@atomiton/editor/src/components/Canvas/styles.css` (add edge
  animations)
- `packages/@atomiton/editor/src/components/Canvas/index.tsx` (register edge
  type)

---

#### Estimated Time

- Step 1: 30 min (ProgressEdge component)
- Step 2: 45 min (useEdgeExecutionState hook)
- Step 3: 30 min (CSS animations)
- Step 4: 30 min (Canvas integration)
- Step 5: 30 min (Manual testing)
- Step 6: 15 min (Architecture review)

**Total**: ~3 hours

---

**Next Steps After Completion**:

1. Create PR with implementation
2. Request Karen review for code quality
3. Have user test in real flows
4. Proceed to Phase 4 (Integration & Performance Validation)

---

### Phase 4: Integration & Performance Validation

**Priority**: 🔴 HIGH **Estimated Time**: 1-2 hours **Prerequisites**: Phase 3
complete

#### 4.1 Integration Checklist

- [ ] Node progress visualization working (borders fill 0-100%)
- [ ] Color transitions correct (gray→green, red on error)
- [ ] Edge animations trigger on node completion
- [ ] Edge colors match node states
- [ ] No visual glitches or flickering
- [ ] Smooth animations even for fast nodes (<200ms)
- [ ] Transitions feel natural and responsive
- [ ] ARIA attributes present and correct
- [ ] Critical path highlighting works
- [ ] Progress percentages accurate

#### 4.2 Performance Testing

##### Test Case 1: Sequential Execution (Hello World)

**Setup**: 3 nodes executing one-by-one **Metrics**:

- Frame rate: Target 60fps
- CPU usage: <30%
- Memory: Stable (no leaks)

**Validation**:

```bash
# Open dev tools
# Go to Performance tab
# Record while executing flow
# Check:
# - FPS stays above 55fps
# - No long tasks (>50ms)
# - Memory doesn't increase after execution
```

##### Test Case 2: Large Graph Stress Test

**Setup**: 100 nodes, 150 edges, all executing in parallel **Metrics**:

- Frame rate: Maintain 60fps
- CPU usage: <50%
- Memory: <200MB increase

**Setup**:

```typescript
// Create test flow with 100 nodes
const nodes = Array.from({ length: 100 }, (_, i) => ({
  id: `node-${i}`,
  type: "delay",
  data: { duration: 100 },
}));

const edges = Array.from({ length: 150 }, (_, i) => ({
  id: `edge-${i}`,
  source: `node-${Math.floor(Math.random() * 100)}`,
  target: `node-${Math.floor(Math.random() * 100)}`,
}));
```

##### Test Case 3: Rapid Re-execution

**Setup**: Execute same flow 10 times rapidly **Purpose**: Check for memory
leaks **Validation**:

```typescript
// Execute flow 10 times
for (let i = 0; i < 10; i++) {
  await conductor.node.run(flowNode);
}

// Check memory in dev tools
// Memory should stabilize, not continuously grow
```

#### 4.3 Profiling Tools

**Chrome DevTools Performance**:

```javascript
// Add performance marks
performance.mark("animation-start");
// ... execute flow ...
performance.mark("animation-end");
performance.measure("animation-duration", "animation-start", "animation-end");

// Check results
const measures = performance.getEntriesByName("animation-duration");
console.log("Animation took:", measures[0].duration, "ms");
```

**React DevTools Profiler**:

1. Open React DevTools
2. Go to Profiler tab
3. Click "Record"
4. Execute flow
5. Stop recording
6. Check for:
   - Excessive re-renders
   - Long commit times (>16ms)
   - Wasted renders

#### 4.4 Success Criteria

- ✅ **Frame Rate**: Maintain 60fps during all animations
- ✅ **CPU Usage**: Stay under 50% on modern hardware (M1/M2 MacBook)
- ✅ **Memory**: No leaks after 10+ executions
- ✅ **Bundle Size**: <10KB added for animations (prefer 0KB with CSS-only)
- ✅ **User Perception**: Animations feel smooth and responsive
- ✅ **Error Visibility**: Error states clearly visible with red borders
- ✅ **Accessibility**: Screen readers can announce progress
- ✅ **No Regressions**: All existing tests still pass

#### 4.5 Validation Commands

```bash
# Type check
pnpm typecheck

# Lint
pnpm lint

# Unit tests
pnpm test

# Build
pnpm build

# E2E tests (when implemented)
pnpm test:e2e

# Bundle size analysis
pnpm --filter @atomiton/editor analyze
```

---

## Implementation Order

1. **Phase 3 Research** (30 min)
   - Review React Flow edge documentation
   - Test animated edge examples
   - Determine optimal approach

2. **Phase 3.2.1: Animated Edge Component** (45 min)
   - Create AnimatedEdge.tsx
   - Implement basic animation
   - Test with static props

3. **Phase 3.2.2: Edge Animation CSS** (30 min)
   - Add dash-flow keyframes
   - Style edge states
   - Test animation smoothness

4. **Phase 3.2.3: Edge Execution Hook** (45 min)
   - Create useEdgeExecutionState
   - Subscribe to progress events
   - Update edge states

5. **Phase 3.2.4: Canvas Integration** (30 min)
   - Register edge types
   - Apply to all edges
   - Test with real flows

6. **Phase 4.1: Integration Testing** (30 min)
   - Run through checklist
   - Fix any issues
   - Document findings

7. **Phase 4.2-4.3: Performance Validation** (1 hour)
   - Run all performance tests
   - Profile with dev tools
   - Optimize hot paths

8. **Phase 4.4: Final Validation** (30 min)
   - Verify all success criteria
   - Run validation commands
   - Document results

**Total Estimated Time**: 5-6 hours

---

## Files to Create/Modify

### New Files

- `packages/@atomiton/editor/src/components/Edge/AnimatedEdge.tsx`
- `packages/@atomiton/editor/src/hooks/useEdgeExecutionState.ts`

### Files to Modify

- `packages/@atomiton/editor/src/components/Canvas/styles.css`
- `packages/@atomiton/editor/src/components/Canvas/index.tsx`

---

## References

- React Flow Animated Edges:
  https://reactflow.dev/examples/edges/animating-edges
- Current implementation commits:
  - 5c79e887 - Sequential progress visualization
  - 8d757cc1 - Type safety fixes
  - 1c1fd775 - Progress visualization improvements
  - 8a1152fb - Weighted progress tracking

---

## Notes for Future Development

### Potential Enhancements (Post Phase 4)

1. **Edge Progress Percentage**
   - Show actual % along edge during propagation
   - Requires more complex SVG/DOM manipulation

2. **Parallel Execution Visualization**
   - Multiple edges animating simultaneously
   - Requires coordination logic

3. **Edge Animation Timing**
   - Sync edge animation duration with slowMo parameter
   - Make configurable per edge type

4. **Advanced Edge States**
   - Queued (waiting to propagate)
   - Throttled (rate-limited data flow)
   - Batched (accumulated data)

### Performance Optimizations (If Needed)

1. **Virtual Edges**
   - Only render edges in viewport
   - React Flow may handle this

2. **Animation Pooling**
   - Reuse animation instances
   - Reduce memory churn

3. **WebGL Rendering**
   - For very large graphs (1000+ nodes)
   - Significant complexity increase

---

### Phase 5: Test Coverage ✅ COMPLETE

**Priority**: 🟠 HIGH **Estimated Time**: 2-3 hours **Prerequisites**: Phase 0
fixes complete ✅ **Status**: ✅ COMPLETED (2025-10-05)

> **IMPORTANT**: This phase should be completed BEFORE starting Phase 3 (Edge
> Animations) to ensure existing functionality is well-tested.

**Completed Items**:

- ✅ Created comprehensive hook tests (26 tests, all passing)
- ✅ Added @testing-library/react dependency
- ✅ Verified integration tests exist (conductor package)
- ✅ Created comprehensive browser support documentation

**Files Modified/Created**:

- Created: `packages/@atomiton/editor/src/hooks/useNodeExecutionState.test.tsx`
  (26 tests)
- Created: `packages/@atomiton/editor/BROWSER_SUPPORT.md`
- Modified: `packages/@atomiton/editor/package.json` (added dependencies)

**Test Coverage**: 26 new tests covering:

- Subscription lifecycle (mount, unmount, nodeId changes)
- DOM attribute updates (execution states, accessibility)
- CSS variable updates (progress visualization)
- ARIA attributes (progressbar role, labels)
- Performance optimizations (DOM caching, rapid updates)
- Edge cases (missing refs, multiple nodes, errors)
- State transitions (pending→executing→completed→error)

#### 5.1 Create Hook Tests ✅ COMPLETE

**File**: `packages/@atomiton/editor/src/hooks/useNodeExecutionState.test.tsx`
(CREATED)

**Time**: ~1 hour **Actual**: 1 hour

**Test Cases**:

```typescript
describe("useNodeExecutionState", () => {
  it("should subscribe to progress events on mount");
  it("should unsubscribe on unmount");
  it("should update DOM attributes when node state changes");
  it("should handle missing nodeRef gracefully");
  it("should update --progress CSS variable");
  it("should set/remove ARIA attributes correctly");
  it("should cache DOM references to avoid repeated .closest() calls");
  it("should handle rapid state changes without errors");
  it("should set correct execution state attributes");
  it("should update progress percentage in ARIA label");
});
```

**Coverage Goal**: >80%

#### 5.2 Add Integration Tests

**Time**: 1 hour

**Test Cases**:

1. **Sequential Execution Visualization**
   - Create flow with 3 sequential nodes
   - Execute and verify progress updates in order
   - Check borders animate 0→100% for each node

2. **Error State Visualization**
   - Create flow with error node
   - Verify error state sets red border
   - Check progress freezes at error percentage

3. **Rapid State Changes**
   - Execute very fast nodes (<100ms)
   - Verify no visual glitches
   - Check all state transitions complete

#### 5.3 Document Browser Requirements

**Time**: 30 minutes

**Tasks**:

1. **Add Firefox Compatibility Note**
   - Document `@property` limitation
   - Explain fallback behavior (no smooth transitions)

2. **Document Minimum Browser Versions**
   - Chrome/Edge: 85+ (full support)
   - Safari: 16.4+ (full support)
   - Firefox: Current (degraded experience)

3. **Create Browser Support Matrix**
   - Table showing feature support by browser
   - Note which features gracefully degrade

**File**: Add to README or create `BROWSER_SUPPORT.md`

#### 5.4 Validation

```bash
# Run tests
pnpm --filter @atomiton/editor test

# Check coverage
pnpm --filter @atomiton/editor test --coverage

# Type check
pnpm typecheck

# Lint
pnpm lint
```

---

### Phase 6: Polish & Documentation (MEDIUM PRIORITY)

**Priority**: 🟡 MEDIUM **Estimated Time**: 1-2 hours **Prerequisites**: Phases
3-5 complete

#### 6.1 Code Quality Improvements

**Time**: 1 hour

##### Extract CSS Magic Numbers

**File**: `packages/@atomiton/editor/src/components/Canvas/styles.css`

**Current Issues**:

- Magic numbers: `-2px`, `-4px`, `3px` (border calculations)
- Magic durations: `0.3s`, `0.2s` (animation timing)
- Magic calculation: `3.6deg` (360/100 for percentage)

**Fix**:

```css
:root {
  --atomiton-progress-border-width: 3px;
  --atomiton-progress-transition-duration: 0.3s;
  --atomiton-hover-transition-duration: 0.2s;
  --atomiton-progress-deg-per-percent: 3.6deg;

  /* Calculated values */
  --atomiton-progress-border-offset: calc(
    var(--atomiton-progress-border-width) * -1
  );
  --atomiton-progress-border-offset-2x: calc(
    var(--atomiton-progress-border-width) * -2
  );
}
```

##### Add Error Handling

**File**: `packages/@atomiton/editor/src/hooks/useNodeExecutionState.ts`

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

##### Add Explicit TypeScript Return Types

**Files**: All hook files

**Review**:

- Add explicit return types to all exported functions
- Document complex types with JSDoc comments
- Ensure all edge cases are typed

#### 6.2 Documentation

**Time**: 30 minutes

##### Add Usage Examples to Hook JSDoc

**File**: `packages/@atomiton/editor/src/hooks/useNodeExecutionState.ts`

**Add**:

````typescript
/**
 * Hook to subscribe a node to execution progress events
 * Updates DOM attributes directly for performance (no React re-renders)
 *
 * @param nodeId - The ID of the node to track
 * @returns ref to attach to the node's DOM element
 *
 * @example
 * ```tsx
 * function CustomNode({ id }: { id: string }) {
 *   const nodeRef = useNodeExecutionState(id);
 *   return <div ref={nodeRef} className="atomiton-node">...</div>;
 * }
 * ```
 *
 * @performance
 * - Uses direct DOM manipulation (no React re-renders)
 * - Caches DOM references to avoid repeated traversals
 * - Efficient for graphs with 100+ nodes
 */
````

##### Document Performance Characteristics

**File**: Create `packages/@atomiton/editor/docs/PERFORMANCE.md`

**Contents**:

- How progress visualization works
- Performance optimizations applied
- Expected metrics (FPS, CPU, memory)
- Scaling characteristics

##### Add Troubleshooting Guide

**File**: Create `packages/@atomiton/editor/docs/TROUBLESHOOTING.md`

**Contents**:

- Common issues and solutions
- Browser compatibility problems
- Performance degradation
- Debug tips

#### 6.3 Firefox Fallback

**Time**: 30 minutes

**File**: `packages/@atomiton/editor/src/hooks/useNodeExecutionState.ts`

**Add Support Detection**:

```typescript
// Detect @property support once
const supportsAtProperty = (() => {
  try {
    return (
      CSS.supports("(--test: 0deg)") && CSS.supports("transition: --test 0.3s")
    );
  } catch {
    return false;
  }
})();

// In useEffect
useEffect(() => {
  // ... existing code ...

  if (atomitonNode) {
    atomitonNode.style.setProperty("--progress", String(nodeState.progress));

    if (!supportsAtProperty) {
      // Disable smooth transition in Firefox
      atomitonNode.style.transition = "none";
    }
  }
}, [nodeId]);
```

#### 6.4 Validation

```bash
# Code quality
pnpm lint
pnpm typecheck

# Test documentation examples
pnpm test

# Build check
pnpm build
```

---

## Updated Implementation Order

**Recommended Sequence**:

1. ✅ **Phases 1-2 Complete** (Node visualization & sequential tracking)
2. ✅ **Phase 0 Complete** (Critical bug fixes from separate action plan)
3. 🔶 **Phase 3: Edge Animations** (2-3 hours)
4. 🔶 **Phase 4: Integration & Performance** (1-2 hours) 🔶 **Phase 5: Test
   Coverage** (2-3 hours)
5. 🔶 **Phase 6: Polish & Documentation** (1-2 hours)

**Total Remaining Time**: 8-12 hours

---

## Summary Checklist

### Must Do (High Priority)

- [ ] Phase 5.1: Create useNodeExecutionState tests
- [ ] Phase 5.2: Add integration tests
- [ ] Phase 5.3: Document browser support
- [ ] Phase 3: Edge animations
- [ ] Phase 4: Integration & performance validation

### Should Do (Medium Priority)

- [ ] Phase 6.1: Extract CSS magic numbers
- [ ] Phase 6.1: Add error handling
- [ ] Phase 6.2: Add JSDoc examples
- [ ] Phase 6.3: Firefox fallback

### Nice to Have (Low Priority)

- [ ] Phase 6.2: Performance documentation
- [ ] Phase 6.2: Troubleshooting guide

---

**Last Updated**: 2025-10-04 **Next Review**: After Phase 5 completion
