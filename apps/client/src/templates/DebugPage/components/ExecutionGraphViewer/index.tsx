import { Editor, Canvas } from "@atomiton/editor";
import type { NodeDefinition } from "@atomiton/nodes/definitions";

export type ExecutionGraphViewerProps = {
  /** The flow definition to visualize */
  flow: NodeDefinition;
};

/**
 * ExecutionGraphViewer - Real-time execution graph visualization
 *
 * Displays a live graph showing the execution progress of a flow:
 * - Node states (pending, executing, completed, error, skipped)
 * - Critical path highlighting
 * - Auto-layout with left-to-right orientation
 * - Read-only interaction
 *
 * The graph automatically updates as execution progresses by subscribing
 * to conductor.node.onProgress() events.
 *
 * @example
 * ```tsx
 * <ExecutionGraphViewer flow={flowDefinition} />
 * ```
 */
export function ExecutionGraphViewer({ flow }: ExecutionGraphViewerProps) {
  return (
    <div
      className="execution-graph-viewer"
      data-testid="execution-graph-viewer"
      style={{ height: "100px", width: "100%" }}
    >
      <Editor
        key={flow.id}
        flow={flow}
        className="h-full w-full"
        data-testid="execution-graph-editor"
      >
        <Canvas
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          fitView
        >
          <Canvas.Grid variant="dots" gap={12} size={1} />
        </Canvas>
      </Editor>
    </div>
  );
}
