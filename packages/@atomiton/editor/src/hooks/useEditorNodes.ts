import type { Node } from "@xyflow/react";
import { useReactFlow, useNodes as useReactFlowNodes } from "@xyflow/react";
import { useCallback, useMemo } from "react";

export type EditorNode = Node;

export function useEditorNodes() {
  const nodes = useReactFlowNodes();
  const { setNodes, getNodes } = useReactFlow();

  const typedNodes = useMemo(() => nodes, [nodes]);

  const setTypedNodes = useCallback(
    (updater: Node[] | ((nodes: EditorNode[]) => EditorNode[])) => {
      setNodes(updater);
    },
    [setNodes],
  );

  const getTypedNodes = useCallback(() => getNodes(), [getNodes]);

  return {
    nodes: typedNodes,
    setNodes: setTypedNodes,
    getNodes: getTypedNodes,
  };
}
