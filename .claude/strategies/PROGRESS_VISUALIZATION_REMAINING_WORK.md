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

#### 3.1 Research & Planning

**Assigned to**: Guilliman (standards guardian)

**🔍 IMPORTANT NOTE**: React Flow has a built-in `AnimatedSVGEdge` component
that might be exactly what we need!

- Component: https://reactflow.dev/ui/components/animated-svg-edge
- This component can render edges with animated SVG paths
- Could potentially turn edges into progress bars that fill based on graph
  progress
- **ACTION**: Guilliman should evaluate if this component meets our needs before
  custom implementation

**Questions to Answer**:

1. Does React Flow's `AnimatedSVGEdge` support progress bar visualization?
   - Component docs: https://reactflow.dev/ui/components/animated-svg-edge
2. Can we customize edge animations to show directional progress (0-100%)?
3. What's the performance impact of animating 50+ edges simultaneously?
4. Can edge colors be dynamically updated based on execution state?
5. Does `AnimatedSVGEdge` work with our existing edge data structure?

**Validation**:

```bash
# Research React Flow edge capabilities
npm docs react-flow
# Check AnimatedSVGEdge component docs
open https://reactflow.dev/ui/components/animated-svg-edge
# Check general animated edges examples
open https://reactflow.dev/examples/edges/animating-edges
```

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

**Last Updated**: 2025-10-04 **Next Review**: After Phase 3 completion
