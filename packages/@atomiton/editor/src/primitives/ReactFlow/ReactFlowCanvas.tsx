import type {
  Edge,
  Node,
  NodeTypes,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  ReactFlowInstance,
  Viewport,
} from "@xyflow/react";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type ReactFlowCanvasProps = {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  nodes: Node[];
  edges: Edge[];
  nodeTypes: NodeTypes;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onPaneClick?: (event: React.MouseEvent) => void;
  onDrop?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
  onInit?: (instance: ReactFlowInstance) => void;
  onMove?: (event: MouseEvent | TouchEvent | null, viewport: Viewport) => void;
  fitView?: boolean;
  fitViewOptions?: Record<string, unknown>;
  deleteKeyCode?: string[];
  minZoom?: number;
  maxZoom?: number;
};

/**
 * Pure ReactFlow canvas primitive
 * Just wraps @xyflow/react ReactFlow with no business logic
 * All props are passed through directly - no state management here
 */
export function ReactFlowCanvas({
  children,
  className,
  style,
  nodes,
  edges,
  nodeTypes,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  onDrop,
  onDragOver,
  onInit,
  onMove,
  fitView,
  fitViewOptions,
  deleteKeyCode = ["Delete", "Backspace"],
  minZoom = 0.25,
  maxZoom = 2,
}: ReactFlowCanvasProps) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onInit={onInit}
      onMove={onMove}
      fitView={fitView}
      fitViewOptions={fitViewOptions}
      nodeTypes={nodeTypes}
      className={className}
      style={style}
      deleteKeyCode={deleteKeyCode}
      minZoom={minZoom}
      maxZoom={maxZoom}
    >
      {children}
    </ReactFlow>
  );
}
