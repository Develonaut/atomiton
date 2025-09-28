import { useMemo } from "react";
import type {
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
} from "@xyflow/react";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { reactFlowToFlow, type ReactFlowData } from "#utils/transform";

/**
 * Hook to transform ReactFlow data back to a flow (NodeDefinition)
 */
export function useReactFlowToFlow(
  nodes: ReactFlowNode<ReactFlowData>[],
  edges: ReactFlowEdge[],
  baseFlow?: NodeDefinition,
) {
  return useMemo(() => {
    return reactFlowToFlow(nodes, edges, baseFlow);
  }, [nodes, edges, baseFlow]);
}
