import { conductor } from "@atomiton/conductor/browser";
import { useEffect, useRef } from "react";

/**
 * Hook to subscribe a node to execution progress events
 * Updates DOM attributes directly for performance (no React re-renders)
 *
 * @param nodeId - The ID of the node to track
 * @returns ref to attach to the node's DOM element
 *
 * @example
 * ```tsx
 * function CustomNode({ id, data }: NodeProps) {
 *   const nodeRef = useNodeExecutionState(id);
 *   return (
 *     <div ref={nodeRef} className="atomiton-node">
 *       <NodeIcon type={data.type} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @performance
 * - Uses direct DOM manipulation (no React re-renders)
 * - Caches DOM references to avoid repeated traversals
 * - Efficient for graphs with 500+ nodes
 */
export function useNodeExecutionState(
  nodeId: string,
): React.RefObject<HTMLDivElement | null> {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cache DOM references once to avoid expensive .closest() calls on every event
    const reactFlowNode = nodeRef.current?.closest(
      ".react-flow__node",
    ) as HTMLElement | null;
    const atomitonNode = nodeRef.current?.closest(
      ".atomiton-node",
    ) as HTMLElement | null;

    if (!reactFlowNode) return;

    const unsubscribe = conductor.node.onProgress((event) => {
      try {
        // Use find() for small arrays - faster than Map creation for typical node counts (3-50)
        // Map would only be better if we needed multiple lookups per event
        const nodeState = event.nodes.find((n) => n.id === nodeId);
        if (!nodeState) return;

        // Update execution state on ReactFlow wrapper (no React re-render)
        reactFlowNode.setAttribute("data-execution-state", nodeState.state);

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
      } catch (error) {
        console.error(
          `[useNodeExecutionState] Failed to update node ${nodeId}:`,
          error,
        );
      }
    });

    return unsubscribe;
  }, [nodeId]);

  return nodeRef;
}
