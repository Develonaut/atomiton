import type { Node as ReactFlowNode } from "@xyflow/react";
import { useReactFlow, useNodes } from "@xyflow/react";
import { useCallback } from "react";
import type { EditorNode } from "#types/EditorNode";

export function useEditorNodes() {
  const { setNodes, getNodes } = useReactFlow();
  const nodes = useNodes() as EditorNode[];

  const setTypedNodes = useCallback(
    (updater: ReactFlowNode[] | ((nodes: EditorNode[]) => EditorNode[])) => {
      setNodes(
        updater as
          | ReactFlowNode[]
          | ((nodes: ReactFlowNode[]) => ReactFlowNode[]),
      );
    },
    [setNodes],
  );

  const getTypedNodes = useCallback(
    () => getNodes() as EditorNode[],
    [getNodes],
  );

  return { nodes, setNodes: setTypedNodes, getNodes: getTypedNodes };
}
