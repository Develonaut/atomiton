import LeftSidebar from "#components/LeftSidebar";
import RightSidebar from "#components/RightSidebar";
import Toolbar from "#components/Toolbar";
import { useLocation, useParams } from "#router";
import type { EditorRouteState } from "#router/types";
import { Canvas, Editor, type EditorNode, type NodeData } from "@atomiton/editor";
import { Box } from "@atomiton/ui";
import { useMemo } from "react";

function LayoutEditor() {
  const { id } = useParams<{ id?: string }>();
  const { state: locationState } = useLocation();
  const editorState = locationState as EditorRouteState | undefined;

  const defaultNodes = useMemo(() => {
    const rawNodes = Array.isArray(editorState?.defaultNodes)
      ? editorState.defaultNodes
      : [];

    return rawNodes.map(
      (node: Record<string, unknown>, nodeIndex: number): EditorNode => {
        const nodeBase = node as {
          id: string;
          name: string;
          category: string;
          type: string;
          data?: Record<string, unknown>;
          settings?: { ui?: { position?: { x: number; y: number } } };
        };

        const nodeData: NodeData = {
          name: nodeBase.name,
          metadata: {
            id: nodeBase.type,
            name: nodeBase.name,
            type: 'test' as const,
            version: '1.0.0',
            category: (nodeBase.category || 'utility') as any,
            description: '',
            icon: 'file' as any,
            author: '',
            tags: [],
          },
          parameters: nodeBase.data || {},
          fields: {},
          inputPorts: [],
          outputPorts: [],
        };

        return {
          ...nodeBase,
          position: nodeBase.settings?.ui?.position || {
            x: nodeIndex * 200,
            y: 100,
          },
          selected: false,
          draggable: true,
          selectable: true,
          connectable: true,
          deletable: true,
          data: nodeData,
        };
      },
    );
  }, [editorState?.defaultNodes]);

  const defaultEdges = Array.isArray(editorState?.defaultEdges)
    ? editorState.defaultEdges
    : [];

  // TODO: Implement complete file lifecycle:
  // - Save: Serialize editor state back to Blueprint (YAML) format
  // - Save As: Export blueprint with new name/location
  // - Auto-save: Periodic saves of working state
  // - Export: Convert to other formats if needed
  if (!id) {
    return (
      <Box className="relative min-h-screen bg-surface-02 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Blueprint Not Found</h2>
          <p className="text-secondary mb-4">
            The blueprint with ID {id} could not be loaded.
          </p>
          <a href="/editor" className="text-primary underline">
            Create a new blueprint
          </a>
        </div>
      </Box>
    );
  }

  return (
    <Box className="relative min-h-screen bg-surface-02">
      <Editor>
        <Box className="absolute inset-0">
          <Box className="relative w-full h-full">
            <Canvas defaultNodes={defaultNodes} defaultEdges={defaultEdges}>
              <Canvas.Grid variant="dots" gap={12} size={1} />
              <Canvas.Minimap
                placement="bottom-right"
                className="!right-66 !bottom-3"
              />
            </Canvas>
          </Box>
        </Box>

        <Toolbar />
        <LeftSidebar />
        <RightSidebar />
      </Editor>
    </Box>
  );
}

export default LayoutEditor;
