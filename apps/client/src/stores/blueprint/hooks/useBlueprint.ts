import { useCallback, useEffect } from "react";
import { blueprintStore, type Blueprint } from "..";
import {
  selectBlueprintById,
  selectBlueprintNodesAndEdges,
  selectError,
  selectIsLoading,
} from "../selectors";
import { useBlueprintStore } from "./useBlueprintStore";

interface UseBlueprintReturn {
  blueprint: Blueprint | undefined;
  isLoading: boolean;
  error: string | null;
  initialNodes: any[];
  initialEdges: any[];
  onSave: (editorState: any) => void;
}
export function useBlueprint(id?: string): UseBlueprintReturn {
  const blueprint = useBlueprintStore(selectBlueprintById(id));
  const isLoading = useBlueprintStore(selectIsLoading);
  const error = useBlueprintStore(selectError);
  const { nodes: initialNodes, edges: initialEdges } =
    selectBlueprintNodesAndEdges(blueprint);

  useEffect(() => {
    if (id) {
      console.log(`Loading blueprint with ID: ${id}`);
      blueprintStore.loadBlueprint(id);
    }
  }, [id]);

  const handleOnSave = useCallback(
    (editorState: any) => {
      blueprintStore.saveBlueprintFromEditor(id, editorState);
    },
    [id],
  );

  return {
    blueprint,
    isLoading,
    error,
    initialNodes,
    initialEdges,
    onSave: handleOnSave,
  };
}
