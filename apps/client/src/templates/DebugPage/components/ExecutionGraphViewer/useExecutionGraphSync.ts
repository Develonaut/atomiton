import type { NodeProgressEvent } from "@atomiton/conductor/browser";
import { conductor } from "@atomiton/conductor/browser";
import {
  useEditorEdges,
  useEditorNodes,
  useEditorViewport,
} from "@atomiton/editor";
import { useEffect } from "react";
import { transformProgressEvent } from "#templates/DebugPage/components/ExecutionGraphViewer/transforms";

/**
 * Hook to synchronize execution progress events with the graph visualization
 *
 * Subscribes to conductor.node.onProgress() and automatically updates
 * the graph nodes and edges when execution state changes.
 *
 * @returns void - Updates are applied directly to the editor state
 */
export function useExecutionGraphSync() {
  const { setNodes } = useEditorNodes();
  const { setEdges } = useEditorEdges();
  const { fitView } = useEditorViewport();

  useEffect(() => {
    // Subscribe to unified progress events
    const unsubscribe = conductor.node.onProgress(
      (event: NodeProgressEvent) => {
        const { nodes: layoutedNodes, edges: layoutedEdges } =
          transformProgressEvent(event);

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        // Fit the view after layout (defer to next frame)
        setTimeout(() => fitView({ padding: 0.2 }), 0);
      },
    );

    return unsubscribe;
  }, [setNodes, setEdges, fitView]);
}
