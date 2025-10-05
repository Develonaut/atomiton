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
): React.RefObject<SVGGElement | null> {
  const edgeRef = useRef<SVGGElement>(null);

  useEffect(() => {
    // Cache DOM reference once to avoid expensive .closest() calls on every event
    const reactFlowEdge = edgeRef.current?.closest(
      ".react-flow__edge",
    ) as HTMLElement | null;

    if (!reactFlowEdge) return;

    // Cache path element and calculate its length once
    const pathElement = reactFlowEdge.querySelector(
      ".react-flow__edge-path",
    ) as SVGPathElement | null;
    const pathLength = pathElement?.getTotalLength() || 0;

    // Initialize dasharray for progress effect
    if (pathElement && pathLength > 0) {
      pathElement.style.strokeDasharray = String(pathLength);
      pathElement.style.strokeDashoffset = String(pathLength); // Start fully hidden
    }

    const unsubscribe = conductor.node.onProgress((event) => {
      // Use find() for small arrays - faster than Map creation for typical node counts
      const sourceNode = event.nodes.find((n) => n.id === sourceId);
      const targetNode = event.nodes.find((n) => n.id === targetId);

      if (!sourceNode || !targetNode) return;

      // Determine edge state based on connected node states
      let edgeState = "inactive";

      if (sourceNode.state === "error" || targetNode.state === "error") {
        edgeState = "error";
      } else if (
        sourceNode.state === "completed" &&
        targetNode.state === "completed"
      ) {
        edgeState = "completed";
      } else if (
        sourceNode.state === "executing" ||
        targetNode.state === "executing"
      ) {
        edgeState = "executing";
      }

      // Update execution state on ReactFlow edge wrapper (no React re-render)
      reactFlowEdge.setAttribute("data-edge-state", edgeState);

      // Set edge progress based on node progress
      // Edge progress is calculated from the connected nodes' progress
      const edgeProgress = Math.min(
        sourceNode.progress || 0,
        targetNode.progress || 0,
      );

      // Update stroke-dashoffset for linear progress bar effect
      if (pathElement && pathLength > 0) {
        // Calculate dashoffset: as progress increases (0-100), dashoffset decreases (pathLength to 0)
        const dashoffset = pathLength - (pathLength * edgeProgress) / 100;
        pathElement.style.strokeDashoffset = String(dashoffset);
      }

      // Add accessibility attributes for screen readers
      if (edgeState === "executing") {
        reactFlowEdge.setAttribute(
          "aria-label",
          `Connection from ${sourceId} to ${targetId} executing (${edgeProgress}%)`,
        );
      } else if (edgeState === "completed") {
        reactFlowEdge.setAttribute(
          "aria-label",
          `Connection from ${sourceId} to ${targetId} completed successfully`,
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
