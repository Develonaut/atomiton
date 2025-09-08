import { useEventCallback } from "@atomiton/hooks";
import type { ReactFlowInstance, Node, Edge } from "@xyflow/react";
import { editorStore } from "../store";

const defaultNodes: Node[] = [
  {
    id: "1",
    type: "default",
    position: { x: 100, y: 100 },
    data: { label: "Node 1" },
  },
  {
    id: "2",
    type: "default",
    position: { x: 300, y: 200 },
    data: { label: "Node 2" },
  },
];

const defaultEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
  },
];

function initializeCanvas(instance: ReactFlowInstance): void {
  editorStore.setFlowInstance(instance);

  const currentNodes = editorStore.getNodes();
  const currentEdges = editorStore.getEdges();

  if (currentNodes.length === 0) {
    editorStore.setNodes(defaultNodes);
  }

  if (currentEdges.length === 0) {
    editorStore.setEdges(defaultEdges);
  }
}

export function useCanvas() {
  const handleOnCanvasInit = useEventCallback(initializeCanvas);

  return {
    onCanvasInit: handleOnCanvasInit,
    defaultNodes,
    defaultEdges,
  };
}
