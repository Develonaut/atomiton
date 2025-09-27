import { styled } from "@atomiton/ui";
import type { ReactFlowProps, Node, Edge } from "@xyflow/react";
import { ReactFlow } from "@xyflow/react";
import {
  DELETE_KEY_CODES,
  MAX_ZOOM,
  MIN_ZOOM,
  NODE_TYPES,
} from "#components/Canvas/constants";
import "#components/Canvas/styles.css";
import { createEditorNode } from "#utils/node/creation";
import { useMemo } from "react";
import type { Flow } from "@atomiton/flow";
import { flowToReactFlow } from "#utils/transform";

const CanvasStyled = styled("div", {
  name: "Canvas",
})("atomiton-canvas relative w-full h-full overflow-hidden bg-background");

type CanvasRootProps = {
  flow?: Flow;
  defaultNodes?: ReactFlowProps['defaultNodes'];
  defaultEdges?: ReactFlowProps['defaultEdges'];
} & Omit<ReactFlowProps, 'defaultNodes' | 'defaultEdges'>

export function CanvasRoot({
  children,
  className,
  flow,
  defaultNodes = [],
  defaultEdges = [],
  ...other
}: CanvasRootProps) {
  // Transform Flow to React Flow format if flow prop is provided
  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
    if (flow) {
      return flowToReactFlow(flow);
    }
    return { nodes: [], edges: [] };
  }, [flow]);

  // Transform raw node definitions or pass through editor nodes
  const transformedNodes = useMemo(() => {
    // Use flow nodes if available
    const nodesToTransform = flow ? flowNodes : defaultNodes;
    return nodesToTransform.map((node: unknown, index): Node => {
      // Type guard for NodeDefinition
      const nodeObj = node as Record<string, unknown>;
      if (nodeObj.metadata && nodeObj.inputPorts && !nodeObj.data) {
        const position = (nodeObj.position as { x: number; y: number }) || {
          x: 100 + index * 250,
          y: 100,
        };
        return createEditorNode(
          (nodeObj.metadata as { type?: string })?.type ||
            (nodeObj.name as string),
          position,
          nodeObj.id as string,
        );
      }
      // Already an EditorNode
      return node as Node;
    });
  }, [flow, flowNodes, defaultNodes]);

  // Transform edges to ensure they have all required properties
  const transformedEdges = useMemo(() => {
    // Use flow edges if available
    const edgesToTransform = flow ? flowEdges : defaultEdges;
    return edgesToTransform.map((edge: unknown): Edge => {
      const edgeObj = edge as Record<string, unknown>;
      return {
        id: edgeObj.id as string,
        source: edgeObj.source as string,
        target: edgeObj.target as string,
        sourceHandle:
          (edgeObj.sourceHandle as string | undefined) ||
          (edgeObj.sourcePort as string | undefined) ||
          undefined,
        targetHandle:
          (edgeObj.targetHandle as string | undefined) ||
          (edgeObj.targetPort as string | undefined) ||
          undefined,
        type: (edgeObj.type as string | undefined) || "default",
      };
    });
  }, [flow, flowEdges, defaultEdges]);

  return (
    <CanvasStyled className={className}>
      <ReactFlow
        nodeTypes={NODE_TYPES}
        deleteKeyCode={DELETE_KEY_CODES}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        defaultNodes={transformedNodes}
        defaultEdges={transformedEdges}
        {...other}
      >
        {children}
      </ReactFlow>
    </CanvasStyled>
  );
}
