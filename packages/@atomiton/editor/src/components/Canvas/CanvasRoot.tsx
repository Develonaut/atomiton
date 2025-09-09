import { styled } from "@atomiton/ui";
import { useCallback, useRef } from "react";
import {
  ReactFlowProvider,
  ReactFlowCanvas,
  type NodeTypes,
  type ReactFlowInstance,
} from "../../primitives/ReactFlow";
import { editorStore } from "../../store";
import { Element } from "../Element";
import type { CanvasProps } from "./Canvas.types";
import { useReactFlow } from "./hooks/useReactFlow";

const CanvasStyled = styled("div", {
  name: "Canvas",
})("atomiton-canvas relative w-full h-full overflow-hidden bg-background");

const DEFAULT_NODE_TYPES: NodeTypes = {
  default: Element,
  square: Element,
};

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
  fitView = true,
  fitViewOptions,
  nodeTypes: customNodeTypes,
  ...props
}: CanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const nodeTypes = (customNodeTypes || DEFAULT_NODE_TYPES) as NodeTypes;

  const reactFlow = useReactFlow({
    defaultNodes,
    defaultEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  });

  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      reactFlow.onInit(instance);
      onInit?.(instance);
    },
    [reactFlow, onInit],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const bounds = reactFlowWrapper.current?.getBoundingClientRect() || null;
      editorStore.handleDrop(event, bounds);
      onDrop?.(event);
    },
    [onDrop],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      onDragOver?.(event);
    },
    [onDragOver],
  );

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (
      (event.key === "Delete" || event.key === "Backspace") &&
      !event.metaKey
    ) {
      editorStore.deleteSelectedElements();
    }
  }, []);

  return (
    <CanvasStyled
      ref={reactFlowWrapper}
      className={className}
      data-canvas-root
      onKeyDown={handleKeyDown}
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
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onInit={handleInit}
          fitView={fitView}
          fitViewOptions={fitViewOptions}
          nodeTypes={nodeTypes}
          className="atomiton-canvas-flow"
          deleteKeyCode={["Delete", "Backspace"]}
        >
          {children}
        </ReactFlowCanvas>
      </ReactFlowProvider>
    </CanvasStyled>
  );
}
