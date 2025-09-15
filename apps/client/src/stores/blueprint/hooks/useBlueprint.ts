import { useCallback, useEffect, useState } from "react";
import { blueprintStore, type Blueprint } from "..";
import {
  selectBlueprintById,
  selectBlueprintNodesAndEdges,
  selectError,
  selectIsLoading,
} from "../selectors";
import { useBlueprintStore } from "./useBlueprintStore";

// TODO: Replace with actual user ID from user store when implemented
const CURRENT_USER_ID = "user_default_123";

interface UseBlueprintReturn {
  blueprint: Blueprint | undefined;
  isLoading: boolean;
  error: string | null;
  initialNodes: any[];
  initialEdges: any[];
  isOwner: boolean;
  onSave: (editorState: any) => void;
  onCopy: () => string | null;
}

export function useBlueprint(id?: string): UseBlueprintReturn {
  const [currentId, setCurrentId] = useState<string | undefined>(id);
  const blueprint = useBlueprintStore(selectBlueprintById(currentId));
  const isLoading = useBlueprintStore(selectIsLoading);
  const error = useBlueprintStore(selectError);
  const { nodes: initialNodes, edges: initialEdges } =
    selectBlueprintNodesAndEdges(blueprint);

  // Check ownership
  const isOwner = blueprint
    ? (blueprint.metadata as any)?.authorId === CURRENT_USER_ID
    : false;

  useEffect(() => {
    if (id && id !== currentId) {
      console.log(`Loading blueprint with ID: ${id}`);
      blueprintStore.loadBlueprint(id);
      setCurrentId(id);
    }
  }, [id, currentId]);

  const handleOnSave = useCallback(
    (editorState: any) => {
      const savedId = blueprintStore.saveBlueprintFromEditor(
        currentId,
        editorState,
      );
      // If a new blueprint was created (different ID), update our current ID
      if (savedId !== currentId) {
        setCurrentId(savedId);
      }
    },
    [currentId],
  );

  const handleOnCopy = useCallback(() => {
    if (!id) return null;

    const newId = blueprintStore.copyBlueprint(id);
    if (newId) {
      setCurrentId(newId);
    }
    return newId;
  }, [id]);

  return {
    blueprint,
    isLoading,
    error,
    initialNodes,
    initialEdges,
    isOwner,
    onSave: handleOnSave,
    onCopy: handleOnCopy,
  };
}
