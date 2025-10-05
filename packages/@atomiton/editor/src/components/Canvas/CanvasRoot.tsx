import {
  DELETE_KEY_CODES,
  EDGE_TYPES,
  MAX_ZOOM,
  MIN_ZOOM,
  NODE_TYPES,
} from "#components/Canvas/constants";
import "#components/Canvas/styles.css";
import { styled } from "@atomiton/ui";
import type { ReactFlowProps } from "@xyflow/react";
import { ReactFlow } from "@xyflow/react";

const CanvasStyled = styled("div", {
  name: "Canvas",
})("atomiton-canvas relative w-full h-full overflow-hidden bg-background");

type CanvasRootProps = Omit<
  ReactFlowProps,
  "nodes" | "edges" | "defaultNodes" | "defaultEdges"
>;

export function CanvasRoot({ children, className, ...other }: CanvasRootProps) {
  return (
    <CanvasStyled className={className}>
      <ReactFlow
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        deleteKeyCode={DELETE_KEY_CODES}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        proOptions={{ hideAttribution: true }}
        {...other}
      >
        {children}
      </ReactFlow>
    </CanvasStyled>
  );
}
