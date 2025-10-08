import { conductor } from "@atomiton/conductor/browser";
import { useEffect, useRef } from "react";

/**
 * Hook to subscribe an edge to execution progress events
 * Updates DOM attributes directly for performance (no React re-renders)
 *
 * Uses CSS variables with SVG pathLength normalization for optimal performance
 * Mirrors the pattern from useNodeExecutionState for consistency
 *
 * @param edgeId - The ID of the edge to track
 * @param sourceId - ID of source node
 * @param targetId - ID of target node
 * @returns ref to attach to the edge's SVG group element
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

    // Cache path element reference
    const pathElement = reactFlowEdge.querySelector(
      ".react-flow__edge-path",
    ) as SVGPathElement | null;

    if (!pathElement) return;

    const unsubscribe = conductor.node.onProgress((event) => {
      try {
        // Use find() for small arrays - faster than Map creation for typical node counts
        const sourceNode = event.nodes.find((n) => n.id === sourceId);
        const targetNode = event.nodes.find((n) => n.id === targetId);

        if (!sourceNode || !targetNode) return;

        // Edge progress: only fills AFTER source node completes
        // Sequential flow: Node1 (0-100%) → Edge (0-100%) → Node2 (0-100%)
        let edgeProgress = 0;

        // Only fill edge if source completed successfully (not error/skipped)
        if (sourceNode.state === "completed" && sourceNode.progress >= 100) {
          edgeProgress = 100;
        }

        // Determine edge state based on progress and connected nodes
        let edgeState = "inactive";

        // If either connected node has error, edge shows error
        if (sourceNode.state === "error" || targetNode.state === "error") {
          edgeState = "error";
        } else if (edgeProgress === 100 && targetNode.progress > 0) {
          // Edge is complete AND target has started - turn green
          edgeState = "completed";
        } else if (edgeProgress > 0) {
          // Edge is filling but hasn't reached target - stay blue
          edgeState = "executing";
        } else if (
          sourceNode.state === "pending" ||
          targetNode.state === "pending"
        ) {
          edgeState = "pending";
        }

        // Update execution state on ReactFlow edge wrapper (no React re-render)
        reactFlowEdge.setAttribute("data-edge-state", edgeState);

        // Set CSS variable for progress - CSS handles the rest via pathLength normalization
        pathElement.style.setProperty("--edge-progress", String(edgeProgress));

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
        } else {
          reactFlowEdge.removeAttribute("aria-label");
        }
      } catch (error) {
        console.error(
          `[useEdgeExecutionState] Failed to update edge ${edgeId} (${sourceId} → ${targetId}):`,
          error,
        );
      }
    });

    return unsubscribe;
  }, [edgeId, sourceId, targetId]);

  return edgeRef;
}
