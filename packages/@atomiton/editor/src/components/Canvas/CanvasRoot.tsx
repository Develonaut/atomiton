import { useCallback, useRef } from "react";
import type { Connection } from "@xyflow/react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { styled } from "@atomiton/ui";
import type { CanvasProps } from "./Canvas.types";

const CanvasStyled = styled("div", {
  name: "Canvas",
})("atomiton-canvas relative w-full h-full overflow-hidden bg-background");

/**
 * Canvas component - main wrapper for the visual editor workspace
 * Built on top of React Flow with composable sub-components
 */
export function CanvasRoot({
  children,
  className,
  nodes: initialNodes = [],
  edges: initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  onDrop,
  onDragOver,
  flowInstance,
  onInit,
  fitView = true,
  fitViewOptions,
  ...props
}: CanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, , handleNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);

  const handleOnConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      onConnect?.(params);
    },
    [setEdges, onConnect],
  );

  const handleOnDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      onDrop?.(event);
    },
    [onDrop],
  );

  const handleOnDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      onDragOver?.(event);
    },
    [onDragOver],
  );

  return (
    <CanvasStyled
      ref={reactFlowWrapper}
      className={className}
      data-canvas-root
      {...props}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange || handleNodesChange}
        onEdgesChange={onEdgesChange || handleEdgesChange}
        onConnect={handleOnConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={handleOnDrop}
        onDragOver={handleOnDragOver}
        onInit={onInit}
        fitView={fitView}
        fitViewOptions={fitViewOptions}
        className="atomiton-canvas-flow"
      >
        {children}
      </ReactFlow>
    </CanvasStyled>
  );
}
