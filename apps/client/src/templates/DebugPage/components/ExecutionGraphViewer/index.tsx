import { Editor } from "@atomiton/editor";
import { ExecutionGraphCanvas } from "#templates/DebugPage/components/ExecutionGraphViewer/ExecutionGraphCanvas";

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
 * <ExecutionGraphViewer />
 * ```
 */
export function ExecutionGraphViewer() {
  return (
    <div
      className="execution-graph-viewer"
      data-testid="execution-graph-viewer"
      style={{ height: "400px", width: "100%" }}
    >
      <Editor data-testid="execution-graph-editor">
        <ExecutionGraphCanvas />
      </Editor>
    </div>
  );
}
