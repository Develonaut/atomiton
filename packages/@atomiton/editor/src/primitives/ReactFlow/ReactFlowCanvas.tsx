import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  ReactFlowInstance,
  NodeTypes,
} from "@xyflow/react";

interface ReactFlowCanvasProps {
  children?: React.ReactNode;
  className?: string;
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
  fitView?: boolean;
  fitViewOptions?: Record<string, unknown>;
  deleteKeyCode?: string[];
}

/**
 * Pure ReactFlow canvas primitive
 * Just wraps @xyflow/react ReactFlow with no business logic
 * All props are passed through directly - no state management here
 */
export function ReactFlowCanvas({
  children,
  className,
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
  fitView,
  fitViewOptions,
  deleteKeyCode = ["Delete", "Backspace"],
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
      fitView={fitView}
      fitViewOptions={fitViewOptions}
      nodeTypes={nodeTypes}
      className={className}
      deleteKeyCode={deleteKeyCode}
    >
      {children}
    </ReactFlow>
  );
}
