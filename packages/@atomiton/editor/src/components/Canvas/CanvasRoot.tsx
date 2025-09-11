import { styled } from "@atomiton/ui";
import { useRef } from "react";
import { useNodeTypes } from "../../hooks/useNodeTypes";
import { ReactFlowCanvas, ReactFlowProvider } from "../../primitives/ReactFlow";
import "./Canvas.css";
import type { CanvasProps } from "./Canvas.types";
import { useCanvasHandlers } from "./hooks/useCanvasHandlers";
import { useReactFlow } from "./hooks/useReactFlow";

const CanvasStyled = styled("div", {
  name: "Canvas",
})("atomiton-canvas relative w-full h-full overflow-hidden bg-background");

/**
 * Canvas component - main wrapper for the visual editor workspace
 * All business logic is in the store, this is just the view layer
 */
export function CanvasRoot({
  children,
  className,
  nodes: defaultNodes = [],
  edges: defaultEdges = [],
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  onDrop,
  onDragOver,
  onInit,
  onMove,
  fitView = true,
  fitViewOptions,
  nodeTypes: nodeTypesProp,
  ...props
}: CanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const nodeTypes = useNodeTypes(nodeTypesProp);

  const reactFlow = useReactFlow({
    defaultNodes,
    defaultEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  });

  const handlers = useCanvasHandlers({
    reactFlow,
    reactFlowWrapper,
    onInit,
    onDrop,
    onDragOver,
    onNodeClick,
    onPaneClick,
    onMove,
  });

  return (
    <CanvasStyled
      ref={reactFlowWrapper}
      className={className}
      data-canvas-root
      onKeyDown={handlers.handleOnKeyDown}
      tabIndex={0}
      {...props}
    >
      <ReactFlowProvider>
        <ReactFlowCanvas
          nodes={reactFlow.nodes}
          edges={reactFlow.edges}
          onNodesChange={reactFlow.onNodesChange}
          onEdgesChange={reactFlow.onEdgesChange}
          onConnect={reactFlow.onConnect}
          onNodeClick={handlers.handleOnNodeClick}
          onPaneClick={handlers.handleOnPaneClick}
          onDrop={handlers.handleOnDrop}
          onDragOver={handlers.handleOnDragOver}
          onInit={handlers.handleOnInit}
          onMove={handlers.handleOnMove}
          fitView={fitView}
          fitViewOptions={fitViewOptions}
          nodeTypes={nodeTypes}
          className="atomiton-canvas-flow"
          deleteKeyCode={["Delete", "Backspace"]}
          minZoom={0.25}
          maxZoom={2}
        >
          {children}
        </ReactFlowCanvas>
      </ReactFlowProvider>
    </CanvasStyled>
  );
}
