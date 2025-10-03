# ExecutionGraphViewer

Real-time execution graph visualization component that displays the execution
progress of flows with visual state indicators and critical path highlighting.

## Structure

This component follows the Bento Box pattern with separated concerns:

```
ExecutionGraphViewer/
├── index.tsx                    # Main component export
├── ExecutionGraphCanvas.tsx     # Canvas rendering component
├── useExecutionGraphSync.ts     # Progress event sync hook
├── transforms.ts                # Pure transformation functions
└── README.md                    # This file
```

## Components

### ExecutionGraphViewer (Main Component)

The root component that provides the Editor context and container styling.

**Usage:**

```tsx
import { ExecutionGraphViewer } from "./components/ExecutionGraphViewer";

<ExecutionGraphViewer />;
```

**Props:** None - fully self-contained

**Features:**

- Fixed height container (400px)
- Provides Editor context for child components
- No external configuration needed

---

### ExecutionGraphCanvas (Internal)

Renders the actual graph canvas with read-only interaction.

**Features:**

- Read-only mode (no dragging, connecting, or selecting)
- Grid overlay for visual context
- Automatic viewport fitting
- Uses `useExecutionGraphSync` hook for data

**Props:** None - consumes Editor context

---

## Hooks

### useExecutionGraphSync

Synchronizes execution progress events with the graph visualization.

**Responsibilities:**

- Subscribes to `conductor.node.onProgress()` events
- Transforms progress data into graph nodes/edges
- Updates editor state via `setNodes` and `setEdges`
- Automatically fits viewport to show all nodes

**Dependencies:**

- `useEditorNodes()` - For updating node state
- `useEditorEdges()` - For updating edge state
- `useEditorViewport()` - For fitting viewport
- `transformProgressEvent()` - For data transformation

---

## Utilities

### transforms.ts

Pure functions for transforming conductor progress events into editor graph
format.

**Exported:**

- `transformProgressEvent(event)` - Main transformation orchestrator

**Internal:**

- `createExecutionNodeMetadata()` - Creates minimal node metadata
- `transformToEditorNode()` - Transforms single node with execution state
- `transformToEditorEdges()` - Transforms edges array

**Benefits:**

- Pure functions (no side effects)
- Easy to test in isolation
- Performance optimized (static functions)
- No React dependencies

---

## Data Flow

```
conductor.node.onProgress()
    ↓
useExecutionGraphSync
    ↓
transformProgressEvent
    ↓
[EditorNode[], EditorEdge[]]
    ↓
getLayoutedElements (auto-layout)
    ↓
setNodes / setEdges
    ↓
ExecutionGraphCanvas
    ↓
Rendered Graph
```

---

## Execution State Visualization

Nodes display their execution state through:

1. **Border Colors** (via CSS data attributes):
   - `pending` - Gray
   - `executing` - Blue
   - `completed` - Green
   - `error` - Red
   - `skipped` - Orange

2. **Critical Path** (via CSS data attributes):
   - Red shadow effect on critical path nodes
   - `data-critical-path="true"` attribute

3. **Data Attributes:**
   - `data-execution-state` - Current node state
   - `data-critical-path` - Boolean flag for critical path

---

## Performance Considerations

- **Static Functions**: All transformation logic uses static functions (not
  closures)
- **Minimal Re-renders**: Hook only updates when progress events arrive
- **Optimized Layout**: Dagre layout is applied once per event
- **No Props Drilling**: Uses context to avoid prop updates

---

## Testing Strategy

### Unit Tests (transforms.ts)

- Test pure transformation functions in isolation
- Verify node/edge format conversion
- Check critical path detection

### Integration Tests (useExecutionGraphSync)

- Mock conductor.node.onProgress()
- Verify hook updates editor state
- Test viewport fitting behavior

### Component Tests (ExecutionGraphViewer)

- Verify component renders without errors
- Check Editor context is provided
- Ensure Canvas is configured correctly

---

## Future Enhancements

Potential improvements for future iterations:

1. **Configurable Layout**: Support top-to-bottom and other layouts
2. **Zoom Controls**: Add manual zoom in/out controls
3. **Node Details**: Show node details on hover/click
4. **Export**: Export graph as image or SVG
5. **Animation**: Animate state transitions between nodes
6. **Performance Metrics**: Display execution time per node

---

## Dependencies

- `@atomiton/editor` - Graph rendering and layout
- `@atomiton/conductor/browser` - Progress event subscription
- `@atomiton/nodes/definitions` - Node metadata types
- `react` - Hooks and components

---

## Related Components

- `FlowProgressBar` - Overall progress indicator
- `LogsSection` - Execution log display
- `ConductorStatusIndicator` - System health status
