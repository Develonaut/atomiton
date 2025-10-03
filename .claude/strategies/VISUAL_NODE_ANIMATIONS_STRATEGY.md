# Visual Node Animations Strategy - Performant Execution State Visualization

## Executive Summary

This strategy document outlines the implementation of ultra-performant visual
animations for node execution states in our React Flow-based editor. The
approach prioritizes CSS-based animations using data attributes, minimizes
JavaScript overhead, and leverages GPU acceleration for smooth 60fps performance
even with hundreds of nodes.

## Table of Contents

1. [Research Findings](#research-findings)
2. [Architecture](#architecture)
3. [Implementation Phases](#implementation-phases)
4. [Code Patterns](#code-patterns)
5. [Performance Benchmarks](#performance-benchmarks)

---

## Research Findings

### React Flow Performance Best Practices

#### 1. **Node Memoization is Critical**

- React Flow nodes should be wrapped with `React.memo()` to prevent unnecessary
  re-renders
- Use stable references for node data to avoid breaking memoization
- Our current implementation already follows this (see
  `/packages/@atomiton/editor/src/components/Node/index.tsx`)

#### 2. **Data Attributes Over Props**

- React Flow supports passing custom attributes through node data
- Data attributes bypass React's reconciliation for style updates
- CSS selectors on data attributes are highly performant

#### 3. **Batch Updates**

- React Flow's `applyNodeChanges` and `applyEdgeChanges` batch DOM updates
- Our `useExecutionGraphSync` hook should batch all state changes in one update

#### 4. **Viewport Culling**

- React Flow automatically culls nodes outside viewport
- This makes animations scale to thousands of nodes

### CSS Animation Techniques

#### 1. **GPU Acceleration Triggers**

```css
/* Force GPU acceleration */
.node {
  will-change: transform, opacity;
  transform: translateZ(0); /* Create GPU layer */
}
```

#### 2. **CSS Custom Properties for Dynamic Values**

```css
/* Dynamic progress using CSS variables */
.node {
  --progress: 0;
  --state-color: var(--color-pending);

  background: conic-gradient(
    var(--state-color) calc(var(--progress) * 3.6deg),
    transparent 0
  );
}
```

#### 3. **Composite Layers for Animations**

- Use `transform` and `opacity` for animations (compositor-only properties)
- Avoid `top`, `left`, `width`, `height` (trigger layout)
- Avoid `color`, `background-color` without layers (trigger paint)

#### 4. **CSS Containment**

```css
/* Isolate node rendering */
.react-flow__node {
  contain: layout style paint;
}
```

### Data Attribute State Management Pattern

```typescript
// Set state via data attributes
<div
  data-execution-state={state}
  data-progress={progress}
  data-critical-path={isCriticalPath}
  style={{ '--progress': progress }}
/>

// CSS responds to attributes
[data-execution-state="executing"] {
  animation: pulse 2s infinite;
}
```

### RequestAnimationFrame vs CSS

#### Use CSS Animations When:

- State transitions (pending → executing → completed)
- Visual effects (pulsing, glow, color transitions)
- Progress indicators (using CSS custom properties)

#### Use RAF When:

- Coordinating multiple element updates
- Reading DOM measurements
- Complex timing synchronization

### GPU Acceleration Techniques

#### 1. **Layer Creation**

```css
.animated-node {
  transform: translateZ(0); /* Create layer */
  backface-visibility: hidden; /* Optimization hint */
  perspective: 1000px; /* Fix for some browsers */
}
```

#### 2. **Reducing Paint Areas**

```css
.progress-ring {
  position: absolute;
  /* Isolate from node content */
  will-change: transform;
}
```

### Avoiding Layout Thrashing

#### 1. **Batch DOM Reads and Writes**

```typescript
// Bad
nodes.forEach((node) => {
  const width = node.offsetWidth; // Read
  node.style.left = width + "px"; // Write
});

// Good
const measurements = nodes.map((n) => n.offsetWidth); // All reads
nodes.forEach((node, i) => {
  node.style.left = measurements[i] + "px"; // All writes
});
```

#### 2. **Use CSS Grid/Flexbox for Layout**

- Let CSS handle positioning instead of JavaScript
- React Flow already handles this internally

---

## Architecture

### System Design

```
┌─────────────────────────────────────────┐
│          Execution Event Stream          │
│         (NodeProgressEvent)              │
└────────────┬────────────────────────────┘
             │
             v
┌─────────────────────────────────────────┐
│      Transform Layer (transforms.ts)     │
│   - Maps state to data attributes       │
│   - Calculates progress percentages     │
│   - Identifies critical path            │
└────────────┬────────────────────────────┘
             │
             v
┌─────────────────────────────────────────┐
│        React Flow Nodes                  │
│   - Data attributes for state           │
│   - CSS custom properties for progress  │
│   - Memoized components                 │
└────────────┬────────────────────────────┘
             │
             v
┌─────────────────────────────────────────┐
│          CSS Animation Layer             │
│   - GPU-accelerated transitions         │
│   - Keyframe animations                 │
│   - Progress visualizations             │
└─────────────────────────────────────────┘
```

### State Management Approach

1. **Execution State**: Managed via `data-execution-state` attribute
2. **Progress Values**: CSS custom properties (`--progress`, `--duration`)
3. **Critical Path**: Boolean `data-critical-path` attribute
4. **Animation Triggers**: CSS `:is()` and attribute selectors

### Data Flow

```typescript
// 1. Progress Event
{
  nodeId: "node-1",
  nodes: [{
    id: "node-1",
    state: "executing",
    progress: 45
  }]
}

// 2. Transform to Node Data
{
  id: "node-1",
  data: {
    executionState: "executing",
    progress: 45,
    isCriticalPath: true
  }
}

// 3. Render as Data Attributes
<div
  data-execution-state="executing"
  data-progress="45"
  data-critical-path="true"
  style={{ "--progress": 45 }}
/>

// 4. CSS Responds
[data-execution-state="executing"] {
  animation: pulse-border 2s infinite;
  border-color: var(--color-blue);
}
```

### Separation of Concerns

- **TypeScript**: State management and data transformation only
- **CSS**: All visual effects and animations
- **React**: Minimal re-renders, data attribute updates only
- **Browser**: GPU handles compositing and animations

---

## Implementation Phases

### Phase 1: Foundation - Data Attributes & CSS Setup

**Objectives:**

- Set up data attribute system for execution states
- Create CSS architecture for animations
- Establish GPU-accelerated base styles

**Technical Approach:**

1. Extend node transform to include all execution data as attributes
2. Create modular CSS with animation definitions
3. Set up CSS custom properties for dynamic values
4. Implement GPU acceleration base styles

**Ready-to-Use Prompt:**

```
Implement Phase 1 of the visual node animations strategy:

1. Update /apps/client/src/templates/DebugPage/components/ExecutionGraphViewer/transforms.ts:
   - Add progress percentage to data attributes
   - Add execution duration as data attribute
   - Add animation-ready class names

2. Create /packages/@atomiton/editor/src/styles/animations.css:
   - Define CSS custom properties for animation timing
   - Create GPU-accelerated base classes
   - Add will-change and transform optimizations
   - Set up containment for performance

3. Update /packages/@atomiton/editor/src/components/Node/index.tsx:
   - Pass through execution state data attributes
   - Add CSS custom properties to style prop
   - Ensure memo() optimization is maintained

4. Update /packages/@atomiton/editor/src/components/Canvas/styles.css:
   - Import animations.css
   - Add GPU layer creation for animated nodes
   - Set up transition base timing

Test that nodes receive and display data attributes correctly in browser DevTools.
```

**Success Criteria:**

- [ ] Data attributes visible in DOM inspector
- [ ] CSS custom properties updating with state
- [ ] No React re-renders on state change (verify with React DevTools)
- [ ] GPU layers created (verify in Chrome Performance tab)

**Performance Benchmarks:**

- 100 nodes: < 1ms state update
- 1000 nodes: < 10ms state update
- Maintain 60fps during state transitions

---

### Phase 2: Basic State Animations - Color Transitions

**Objectives:**

- Implement smooth color transitions between states
- Add state-specific border colors
- Create hover state interactions that respect execution state

**Technical Approach:**

1. CSS transitions for border-color changes
2. State-specific color variables
3. Cascade rules for state + hover combinations
4. Smooth fade transitions between states

**Ready-to-Use Prompt:**

```
Implement Phase 2 of the visual node animations strategy:

1. Update /packages/@atomiton/editor/src/styles/animations.css:
   - Add state transition definitions:
     * pending: gray with subtle opacity
     * executing: blue with smooth fade-in
     * completed: green with quick transition
     * error: red with attention-grabbing transition
     * skipped: yellow with reduced opacity
   - Create smooth color transition timing functions
   - Add border-width transitions for emphasis

2. Enhance /packages/@atomiton/editor/src/components/Canvas/styles.css:
   - Implement cascading rules for execution states
   - Add :is() selectors for efficient state combinations
   - Create transition timing for 300ms color changes
   - Ensure hover states respect execution state colors

3. Add animation utilities to transforms.ts:
   - Calculate transition delays based on execution order
   - Add stagger effect for parallel nodes
   - Include transition duration in data attributes

Test with mock execution states to verify smooth transitions.
```

**Success Criteria:**

- [ ] Smooth color transitions between all states
- [ ] No flickering during rapid state changes
- [ ] Hover effects work with execution states
- [ ] Transitions complete within 300ms

**Performance Benchmarks:**

- Color transition cost: < 0.5ms per node
- No dropped frames during transitions
- Paint time < 2ms for 100 nodes

---

### Phase 3: Progress Visualizations - Border Fills & Progress Bars

**Objectives:**

- Implement animated border progress fill
- Add circular progress indicators
- Create subtle progress bars
- Maintain 60fps with hundreds of animated nodes

**Technical Approach:**

1. CSS conic-gradient for circular progress
2. Linear-gradient for border fill effect
3. CSS custom properties for progress values
4. Pseudo-elements for layered effects

**Ready-to-Use Prompt:**

````
Implement Phase 3 of the visual node animations strategy:

1. Create progress visualization styles in animations.css:
   - Conic gradient border fill:
     ```css
     [data-execution-state="executing"]::before {
       content: '';
       position: absolute;
       inset: -2px;
       border-radius: inherit;
       background: conic-gradient(
         from 0deg,
         var(--state-color) calc(var(--progress) * 3.6deg),
         transparent 0
       );
       mask: radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px));
     }
     ```
   - Add linear progress bar option
   - Create smooth progress transitions

2. Update transforms.ts to provide progress data:
   - Calculate progress percentage (0-100)
   - Add progress to CSS custom properties
   - Include estimated duration for smooth animations

3. Add progress animation classes:
   - .progress-circular for border fill
   - .progress-linear for bottom bar
   - .progress-pulse for indeterminate state

4. Optimize for performance:
   - Use transform for progress animations
   - Implement CSS containment
   - Add will-change declarations

Test with simulated progress updates at 60fps.
````

**Success Criteria:**

- [ ] Smooth progress animation without stuttering
- [ ] Progress accurately reflects execution state
- [ ] Multiple progress styles available
- [ ] Maintains 60fps with 200+ nodes

**Performance Benchmarks:**

- Progress update: < 0.1ms per node
- No layout recalculation on progress change
- Composite time < 1ms

---

### Phase 4: Advanced Effects - Pulsing & Critical Path

**Objectives:**

- Add pulsing animation for executing nodes
- Highlight critical path with glow effect
- Create completion wave animation
- Add error shake animation

**Technical Approach:**

1. CSS keyframe animations for effects
2. Box-shadow for glow effects (GPU accelerated)
3. Transform animations for shake/pulse
4. Animation composition for combined effects

**Ready-to-Use Prompt:**

````
Implement Phase 4 of the visual node animations strategy:

1. Create advanced animation keyframes:
   ```css
   @keyframes pulse-executing {
     0%, 100% { transform: scale(1); opacity: 1; }
     50% { transform: scale(1.02); opacity: 0.9; }
   }

   @keyframes glow-critical {
     0%, 100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); }
     50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
   }

   @keyframes shake-error {
     0%, 100% { transform: translateX(0); }
     25% { transform: translateX(-2px); }
     75% { transform: translateX(2px); }
   }

   @keyframes complete-wave {
     from { transform: scale(0.95); opacity: 0; }
     to { transform: scale(1); opacity: 1; }
   }
````

2. Apply effects based on state combinations:
   - [data-execution-state="executing"]: pulse animation
   - [data-critical-path="true"]: glow effect
   - [data-execution-state="error"]: shake animation
   - [data-execution-state="completed"]: wave effect

3. Add animation orchestration:
   - Stagger animations for visual flow
   - Coordinate timing with execution order
   - Prevent animation overlap

4. Optimize effect rendering:
   - Use CSS animation-fill-mode
   - Implement animation-play-state for pausing
   - Add prefers-reduced-motion support

Test with full execution simulation including errors.

```

**Success Criteria:**
- [ ] Animations enhance understanding of execution flow
- [ ] Effects don't interfere with each other
- [ ] Critical path clearly visible
- [ ] Error states immediately noticeable

**Performance Benchmarks:**
- Combined animations: < 3ms total overhead
- No animation queue buildup
- Smooth 60fps with all effects active

---

### Phase 5: Performance Optimization & Polish

**Objectives:**
- Profile and optimize animation performance
- Add accessibility considerations
- Implement animation preferences
- Create debug mode for performance monitoring

**Technical Approach:**
1. Performance profiling with Chrome DevTools
2. CSS will-change optimization
3. Animation debouncing for rapid updates
4. Reduced motion support

**Ready-to-Use Prompt:**
```

Implement Phase 5 of the visual node animations strategy:

1. Add performance optimizations:
   - Implement CSS containment strategy:
     ```css
     .react-flow__node {
       contain: layout style paint;
     }
     ```
   - Add will-change declarations strategically
   - Use transform-only animations where possible
   - Implement animation batching for bulk updates

2. Add accessibility features:

   ```css
   @media (prefers-reduced-motion: reduce) {
     * {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

3. Create performance monitoring:
   - Add debug mode with FPS counter
   - Log animation frame timing
   - Track paint and composite times
   - Monitor GPU memory usage

4. Add animation preferences:
   - Create AnimationSettings context
   - Allow users to disable animations
   - Provide performance/quality slider
   - Save preferences to localStorage

5. Polish animations:
   - Fine-tune timing functions
   - Add subtle easing curves
   - Ensure consistent animation language
   - Remove any visual artifacts

Test on low-end devices and with 1000+ nodes.

````

**Success Criteria:**
- [ ] Maintains 60fps on average hardware
- [ ] Graceful degradation on low-end devices
- [ ] Respects user accessibility preferences
- [ ] No memory leaks during long sessions

**Performance Benchmarks:**
- 1000 nodes: < 16ms frame time
- Memory usage: < 50MB for animations
- No dropped frames during normal operation
- Graceful degradation at 2000+ nodes

---

## Code Patterns

### Pattern 1: Data Attribute State Management

```typescript
// transforms.ts
export function transformToEditorNode(
  node: ProgressNode,
  criticalPath: string[]
): EditorNode {
  const progress = calculateProgress(node);
  const duration = calculateDuration(node);

  return {
    id: node.id,
    type: 'default',
    data: {
      // Regular React props
      name: node.name,
      metadata: node.metadata,
    },
    // Data attributes for CSS
    className: classNames(
      'execution-node',
      node.state === 'executing' && 'animating',
      criticalPath.includes(node.id) && 'critical-path'
    ),
    style: {
      '--progress': `${progress}%`,
      '--duration': `${duration}ms`,
      '--delay': `${node.level * 50}ms`,
    },
    // HTML data attributes
    'data-execution-state': node.state,
    'data-progress': progress,
    'data-critical-path': criticalPath.includes(node.id) ? 'true' : 'false',
    'data-node-level': node.level,
  };
}
````

### Pattern 2: CSS Animation Definitions

```css
/* Base GPU acceleration */
.execution-node {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  contain: layout style paint;
}

/* State-based animations */
[data-execution-state="executing"] {
  animation: pulse-executing 2s ease-in-out infinite;
  border-color: var(--color-blue);
}

/* Progress visualization */
[data-execution-state="executing"]::before {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: conic-gradient(
    from 0deg at 50% 50%,
    var(--color-blue) calc(var(--progress) * 3.6deg),
    transparent 0
  );
  mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 3px),
    black calc(100% - 2px)
  );
  transition: transform 0.3s ease;
}

/* Critical path enhancement */
[data-critical-path="true"] {
  animation: glow-critical 3s ease-in-out infinite;
  z-index: 10;
}

/* Keyframe definitions */
@keyframes pulse-executing {
  0%,
  100% {
    transform: scale(1) translateZ(0);
    opacity: 1;
  }
  50% {
    transform: scale(1.02) translateZ(0);
    opacity: 0.9;
  }
}

@keyframes glow-critical {
  0%,
  100% {
    box-shadow:
      0 0 10px rgba(59, 130, 246, 0.5),
      inset 0 0 10px rgba(59, 130, 246, 0.1);
  }
  50% {
    box-shadow:
      0 0 20px rgba(59, 130, 246, 0.8),
      inset 0 0 15px rgba(59, 130, 246, 0.2);
  }
}
```

### Pattern 3: Performance-Optimized Updates

```typescript
// useExecutionGraphSync.ts
export function useExecutionGraphSync() {
  const { setNodes } = useEditorNodes();
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const handleProgress = (event: NodeProgressEvent) => {
      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Batch updates in next animation frame
      animationFrameRef.current = requestAnimationFrame(() => {
        const { nodes, edges } = transformProgressEvent(event);

        // Single batched update
        setNodes(nodes);

        // Update CSS custom properties directly (no React)
        nodes.forEach((node) => {
          const element = document.querySelector(`[data-node-id="${node.id}"]`);
          if (element instanceof HTMLElement) {
            element.style.setProperty("--progress", node.data.progress);
            element.style.setProperty("--duration", node.data.duration);
          }
        });
      });
    };

    const unsubscribe = conductor.node.onProgress(handleProgress);

    return () => {
      unsubscribe();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [setNodes]);
}
```

### Pattern 4: CSS Custom Properties for Dynamic Values

```typescript
// Node component
export const ExecutionNode = memo(({ data, ...props }) => {
  const progressStyle = {
    '--progress': data.progress || 0,
    '--duration': data.duration || 1000,
    '--state-color': `var(--color-${data.executionState})`,
    '--delay': `${data.level * 50}ms`,
  } as React.CSSProperties;

  return (
    <div
      className="execution-node"
      data-execution-state={data.executionState}
      data-critical-path={data.isCriticalPath}
      style={progressStyle}
    >
      {/* Node content */}
    </div>
  );
});
```

---

## Performance Benchmarks

### Measurement Methodology

```typescript
// Performance measurement utility
export function measureAnimationPerformance() {
  const metrics = {
    frameTime: [],
    paintTime: [],
    compositeTime: [],
  };

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === "paint") {
        metrics.paintTime.push(entry.duration);
      }
    }
  });

  observer.observe({ entryTypes: ["paint", "measure"] });

  let frameCount = 0;
  let lastTime = performance.now();

  function measureFrame() {
    const now = performance.now();
    const delta = now - lastTime;
    metrics.frameTime.push(delta);
    lastTime = now;

    frameCount++;
    if (frameCount < 600) {
      // Measure for 10 seconds at 60fps
      requestAnimationFrame(measureFrame);
    } else {
      analyzeMetrics(metrics);
    }
  }

  requestAnimationFrame(measureFrame);
}
```

### Target Performance Metrics

| Metric         | 100 Nodes | 500 Nodes | 1000 Nodes | 2000 Nodes |
| -------------- | --------- | --------- | ---------- | ---------- |
| Frame Time     | < 16ms    | < 16ms    | < 16ms     | < 20ms     |
| State Update   | < 1ms     | < 5ms     | < 10ms     | < 20ms     |
| Paint Time     | < 2ms     | < 5ms     | < 8ms      | < 15ms     |
| Composite Time | < 1ms     | < 2ms     | < 3ms      | < 5ms      |
| Memory Usage   | < 10MB    | < 25MB    | < 50MB     | < 100MB    |
| GPU Memory     | < 20MB    | < 50MB    | < 100MB    | < 200MB    |

### Performance Testing Checklist

- [ ] Test with Chrome DevTools Performance tab
- [ ] Verify no layout thrashing in Timeline
- [ ] Check Paint Flashing shows minimal repaints
- [ ] Confirm GPU layers in Rendering tab
- [ ] Monitor memory usage over time
- [ ] Test on low-end devices (throttle CPU 4x)
- [ ] Verify smooth scrolling during animations
- [ ] Test with various zoom levels
- [ ] Measure with different node densities
- [ ] Profile with React DevTools Profiler

### Optimization Techniques

1. **Reduce Paint Areas**
   - Use `contain: paint` on nodes
   - Isolate animated elements with `position: absolute`
   - Use `overflow: hidden` to limit paint regions

2. **Minimize Reflows**
   - Batch DOM reads and writes
   - Use CSS transforms instead of position
   - Avoid reading computed styles during animation

3. **Optimize Compositing**
   - Use `will-change` sparingly
   - Create GPU layers for animated elements
   - Avoid too many compositing layers (< 50)

4. **Memory Management**
   - Remove animation classes when complete
   - Clean up animation frame callbacks
   - Use CSS animations instead of JavaScript where possible

---

## Future Enhancements

### Editor Integration (Future Vision)

When we integrate this into the main editor:

1. **Live Execution Overlay**
   - Execution state overlays on existing nodes
   - Progress indicators integrated with node design
   - Real-time feedback during development

2. **Interactive Debugging**
   - Click to pause execution at node
   - Hover for execution details
   - Step-through animation controls

3. **Performance Visualization**
   - Heat map of execution times
   - Bottleneck highlighting
   - Parallel execution lanes

4. **Advanced Visual Effects**
   - Particle effects for data flow
   - Connection animation along edges
   - 3D perspective for complex graphs

### Technical Debt Considerations

1. **Animation System Abstraction**
   - Consider animation library (Framer Motion, React Spring)
   - But only if CSS proves insufficient
   - Maintain performance as primary concern

2. **State Management Evolution**
   - May need more complex state for editor integration
   - Consider animation queue for complex orchestration
   - Maintain data attribute approach for performance

3. **Browser Compatibility**
   - Test on Safari (different GPU acceleration)
   - Ensure Firefox compatibility
   - Provide fallbacks for older browsers

---

## Conclusion

This strategy provides a comprehensive approach to implementing performant
visual node graph animations. By prioritizing CSS-based animations with data
attributes, we achieve:

1. **Ultra-high performance** - 60fps with thousands of nodes
2. **Clean separation** - CSS handles visuals, JS handles state
3. **Maintainability** - Clear patterns and modular code
4. **Scalability** - GPU acceleration and viewport culling
5. **Future-ready** - Foundation for editor integration

The phased approach ensures incremental value delivery while maintaining system
stability. Each phase builds on the previous, creating a robust animation system
that enhances user understanding of execution flow without sacrificing
performance.
