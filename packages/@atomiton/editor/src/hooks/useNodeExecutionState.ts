import { conductor } from "@atomiton/conductor/browser";
import { useEffect, useRef } from "react";

/**
 * Hook to subscribe a node to execution progress events
 * Updates DOM attributes directly for performance (no React re-renders)
 *
 * @param nodeId - The ID of the node to track
 * @returns ref to attach to the node's DOM element
 */
export function useNodeExecutionState(nodeId: string) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = conductor.node.onProgress((event) => {
      if (!nodeRef.current) return;

      // Find this node's state in the event
      const nodeState = event.nodes.find((n) => n.id === nodeId);
      if (!nodeState) return;

      // Find the ReactFlow wrapper (.react-flow__node) by traversing up from our ref
      const reactFlowNode = nodeRef.current.closest(
        ".react-flow__node",
      ) as HTMLElement | null;
      if (!reactFlowNode) return;

      // Find the inner .atomiton-node element for progress variable
      const atomitonNode = nodeRef.current.closest(
        ".atomiton-node",
      ) as HTMLElement | null;

      // Update execution state and critical path on ReactFlow wrapper (no React re-render)
      reactFlowNode.setAttribute("data-execution-state", nodeState.state);
      reactFlowNode.setAttribute(
        "data-critical-path",
        event.graph.criticalPath.includes(nodeId) ? "true" : "false",
      );

      // Add accessibility attributes for screen readers
      const progressPercent = Math.round(nodeState.progress);
      reactFlowNode.setAttribute(
        "aria-label",
        `Node ${nodeState.state}: ${progressPercent}% complete`,
      );

      if (nodeState.state === "executing") {
        reactFlowNode.setAttribute("role", "progressbar");
        reactFlowNode.setAttribute("aria-valuenow", String(progressPercent));
        reactFlowNode.setAttribute("aria-valuemin", "0");
        reactFlowNode.setAttribute("aria-valuemax", "100");
      } else {
        reactFlowNode.removeAttribute("role");
        reactFlowNode.removeAttribute("aria-valuenow");
        reactFlowNode.removeAttribute("aria-valuemin");
        reactFlowNode.removeAttribute("aria-valuemax");
      }

      // Update progress variable on the inner node (where pseudo-element lives)
      if (atomitonNode) {
        atomitonNode.style.setProperty(
          "--progress",
          String(nodeState.progress),
        );
      }
    });

    return unsubscribe;
  }, [nodeId]);

  return nodeRef;
}
