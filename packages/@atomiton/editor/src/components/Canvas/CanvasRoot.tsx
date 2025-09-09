import { styled } from "@atomiton/ui";
import type { ReactFlowInstance } from "@xyflow/react";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useRef } from "react";
import { editorStore } from "../../store";
import { Element } from "../Element";
import type { CanvasProps } from "./Canvas.types";
import { useReactFlow } from "./hooks/useReactFlow";

const CanvasStyled = styled("div", {
  name: "Canvas",
})("atomiton-canvas relative w-full h-full overflow-hidden bg-background");

// Default node types - static definition outside component
const DEFAULT_NODE_TYPES = {
  default: Element,
};

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
  onInit: externalOnInit,
  fitView = true,
  fitViewOptions,
  nodeTypes: customNodeTypes,
  ...props
}: CanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Use custom node types if provided, otherwise use defaults
  const nodeTypes = customNodeTypes || DEFAULT_NODE_TYPES;

  // Handle canvas initialization
  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      // Store the flow instance in our editor store
      editorStore.setFlowInstance(instance);

      // Initialize with default content if needed
      const currentNodes = editorStore.getNodes();
      const currentEdges = editorStore.getEdges();

      if (currentNodes.length === 0 && initialNodes.length > 0) {
        editorStore.setNodes(initialNodes);
      }

      if (currentEdges.length === 0 && initialEdges.length > 0) {
        editorStore.setEdges(initialEdges);
      }

      // Call external onInit if provided
      externalOnInit?.(instance);
    },
    [initialNodes, initialEdges, externalOnInit],
  );

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
        onInit={handleInit}
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
