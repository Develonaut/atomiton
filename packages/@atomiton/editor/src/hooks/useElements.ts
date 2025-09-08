import { useState, useEffect } from "react";
import { editorStore } from "../store";
import type { EditorState } from "../store/types";

export function useElements() {
  const [elements, setElements] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const updateState = () => {
      setElements(editorStore.getSortedElements());
      setSelectedId(editorStore.getSelectedElementId());
    };

    updateState();

    const unsubscribe = editorStore.subscribe((state: EditorState) => {
      updateState();
    });

    return () => unsubscribe();
  }, []);

  const selectElement = (id: string | null) => {
    editorStore.selectNode(id);
  };

  const deleteElement = (id: string) => {
    editorStore.deleteNode(id);
  };

  const addElement = (nodeType: string) => {
    const node = {
      id: `node-${Date.now()}`,
      type: nodeType,
      position: { x: 100, y: 100 },
      data: { label: nodeType },
    };
    editorStore.addNode(node);
  };

  return {
    elements,
    selectedId,
    selectElement,
    deleteElement,
    addElement,
  };
}
