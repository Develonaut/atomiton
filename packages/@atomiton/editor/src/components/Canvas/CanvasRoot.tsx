import { styled } from "@atomiton/ui";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useRef } from "react";
import type { CanvasProps } from "./Canvas.types";
import { useReactFlow } from "./hooks/useReactFlow";

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
  nodeTypes,
  ...props
}: CanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Single hook that handles everything - our complete ReactFlow adapter
  const reactFlow = useReactFlow({
    nodes: initialNodes,
    edges: initialEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
  });

  return (
    <CanvasStyled
      ref={reactFlowWrapper}
      className={className}
      data-canvas-root
      {...props}
    >
      <ReactFlow
        nodes={reactFlow.nodes}
        edges={reactFlow.edges}
        onNodesChange={reactFlow.onNodesChange}
        onEdgesChange={reactFlow.onEdgesChange}
        onConnect={reactFlow.onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={reactFlow.onDrop}
        onDragOver={reactFlow.onDragOver}
        onInit={onInit}
        fitView={fitView}
        fitViewOptions={fitViewOptions}
        nodeTypes={nodeTypes}
        className="atomiton-canvas-flow"
      >
        {children}
      </ReactFlow>
    </CanvasStyled>
  );
}
