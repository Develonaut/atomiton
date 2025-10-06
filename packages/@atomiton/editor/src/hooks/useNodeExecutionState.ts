import { conductor } from "@atomiton/conductor/browser";
import { useEffect, useRef } from "react";
import { getAnimationPreferences } from "#hooks/useAnimationPreferences";

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
  const previousStateRef = useRef<string | null>(null);

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

        const previousState = previousStateRef.current;
        const currentState = nodeState.state;

        // Update execution state on ReactFlow wrapper (no React re-render)
        reactFlowNode.setAttribute("data-execution-state", currentState);

        // Apply animation attributes when transitioning to completion/error states
        const preferences = getAnimationPreferences();

        // Note: Input handle animation removed to avoid timing conflict with edge animation
        // Only output handles pulse when sending data (on completion)

        // Completion animation - trigger when transitioning to completed
        if (currentState === "completed" && previousState !== "completed") {
          if (preferences.completionAnimation !== "none") {
            reactFlowNode.setAttribute(
              "data-completion-animation",
              preferences.completionAnimation,
            );
            // Remove animation attribute after animation completes to allow re-triggering
            setTimeout(() => {
              reactFlowNode.removeAttribute("data-completion-animation");
            }, 600); // Match --atomiton-completion-animation-duration
          }

          // Pulse output handles when node completes
          if (preferences.handleAnimation !== "none") {
            const outputHandles = reactFlowNode.querySelectorAll(
              ".react-flow__handle.source",
            );
            outputHandles.forEach((handle) => {
              handle.setAttribute(
                "data-handle-animation",
                preferences.handleAnimation,
              );
              // Remove animation attribute after animation completes
              setTimeout(() => {
                handle.removeAttribute("data-handle-animation");
              }, 400); // Match --atomiton-handle-animation-duration
            });
          }
        }

        // Error animation - trigger when transitioning to error
        if (currentState === "error" && previousState !== "error") {
          if (preferences.errorAnimation !== "none") {
            reactFlowNode.setAttribute(
              "data-error-animation",
              preferences.errorAnimation,
            );
            // Remove animation attribute after animation completes
            setTimeout(() => {
              reactFlowNode.removeAttribute("data-error-animation");
            }, 600); // Match --atomiton-completion-animation-duration
          }
        }

        // Store current state for next comparison
        previousStateRef.current = currentState;

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
