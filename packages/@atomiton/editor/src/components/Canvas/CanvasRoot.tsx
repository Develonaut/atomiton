import { styled } from "@atomiton/ui";
import type { ReactFlowProps } from "@xyflow/react";
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

const CanvasStyled = styled("div", {
  name: "Canvas",
})("atomiton-canvas relative w-full h-full overflow-hidden bg-background");

export function CanvasRoot({
  children,
  className,
  defaultNodes = [],
  defaultEdges = [],
  ...other
}: ReactFlowProps) {
  // Transform raw node definitions or pass through editor nodes
  const transformedNodes = useMemo(() => {
    return defaultNodes.map((node: any, index) => {
      // If it looks like a NodeDefinition (has metadata and inputPorts at root level but no data property)
      if (node.metadata && node.inputPorts && !node.data) {
        const position = node.position || {
          x: 100 + index * 250,
          y: 100,
        };
        return createEditorNode(
          node.metadata?.type || node.name,
          position,
          node.id,
        );
      }
      // Already an EditorNode
      return node;
    });
  }, [defaultNodes]);

  // Transform edges to ensure they have all required properties
  const transformedEdges = useMemo(() => {
    return defaultEdges.map((edge: any) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || edge.sourcePort || undefined,
      targetHandle: edge.targetHandle || edge.targetPort || undefined,
      type: edge.type || "default",
    }));
  }, [defaultEdges]);

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
