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
      const reactFlowNode = nodeRef.current.closest(".react-flow__node");
      if (!reactFlowNode) return;

      // Update DOM attributes on the ReactFlow wrapper (no React re-render)
      reactFlowNode.setAttribute("data-execution-state", nodeState.state);
      reactFlowNode.setAttribute(
        "data-critical-path",
        event.graph.criticalPath.includes(nodeId) ? "true" : "false",
      );
    });

    return unsubscribe;
  }, [nodeId]);

  return nodeRef;
}
