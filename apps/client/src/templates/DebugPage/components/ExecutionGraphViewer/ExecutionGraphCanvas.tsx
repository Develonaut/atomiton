import { Canvas } from "@atomiton/editor";
import { useExecutionGraphSync } from "#templates/DebugPage/components/ExecutionGraphViewer/useExecutionGraphSync";

/**
 * Canvas component that renders the execution graph
 *
 * Features:
 * - Read-only interaction (no dragging, connecting, or selecting)
 * - Auto-syncs with execution progress events
 * - Grid overlay for visual context
 * - Automatic viewport fitting
 */
export function ExecutionGraphCanvas() {
  useExecutionGraphSync();

  return (
    <Canvas
      data-testid="execution-graph-canvas"
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      fitView
    >
      <Canvas.Grid variant="dots" gap={12} size={1} />
    </Canvas>
  );
}
