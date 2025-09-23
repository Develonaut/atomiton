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
  return (
    <CanvasStyled className={className}>
      <ReactFlow
        nodeTypes={NODE_TYPES}
        deleteKeyCode={DELETE_KEY_CODES}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        defaultNodes={defaultNodes}
        defaultEdges={defaultEdges}
        {...other}
      >
        {children}
      </ReactFlow>
    </CanvasStyled>
  );
}
