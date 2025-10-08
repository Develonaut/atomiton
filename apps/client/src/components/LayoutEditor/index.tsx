import LeftSidebar from "#components/LeftSidebar";
import RightSidebar from "#components/RightSidebar";
import Toolbar from "#components/Toolbar";
import { useEditorUI } from "#store/editorUI";
import { useLocation, useParams } from "#router";
import type { EditorRouteState } from "#router/types";
import { Canvas, Editor } from "@atomiton/editor";
import type { NodeDefinition, NodeEdge } from "@atomiton/nodes/definitions";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import { Box } from "@atomiton/ui";

function LayoutEditor() {
  const { id } = useParams<{ id?: string }>();
  const { state: locationState } = useLocation();
  const editorState = locationState as EditorRouteState | undefined;
  const { showMinimap } = useEditorUI();

  // Create a flow (NodeDefinition) from the editor state
  // TODO: Load actual flow from storage using id
  const flow =
    editorState?.defaultNodes || editorState?.defaultEdges
      ? createNodeDefinition({
          id: id || `flow-${Date.now()}`,
          type: "group",
          version: "1.0.0",
          name: "Current Flow",
          position: { x: 0, y: 0 },
          metadata: {
            id: id || `flow-${Date.now()}`,
            name: "Current Flow",
            author: "editor",
            icon: "layers",
            category: "group",
            description: "Flow being edited",
          },
          // Convert legacy props to proper format
          nodes: Array.isArray(editorState?.defaultNodes)
            ? (editorState.defaultNodes as NodeDefinition[])
            : [],
          edges: Array.isArray(editorState?.defaultEdges)
            ? (editorState.defaultEdges as NodeEdge[])
            : [],
        })
      : undefined;

  // TODO: Implement complete file lifecycle:
  // - Save: Serialize editor state back to Flow (YAML) format
  // - Save As: Export flow with new name/location
  // - Auto-save: Periodic saves of working state
  // - Export: Convert to other formats if needed
  if (!id) {
    return (
      <Box className="relative min-h-screen bg-surface-02 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Flow Not Found</h2>
          <p className="text-secondary mb-4">
            The flow with ID {id} could not be loaded.
          </p>
          <a href="/editor" className="text-primary underline">
            Create a new flow
          </a>
        </div>
      </Box>
    );
  }

  return (
    <Box className="relative min-h-screen bg-surface-02">
      <Editor flow={flow}>
        <Box className="absolute inset-0">
          <Box className="relative w-full h-full">
            <Canvas>
              <Canvas.Grid variant="dots" gap={12} size={1} />
              {showMinimap && (
                <Canvas.Minimap
                  placement="bottom-right"
                  className="!right-66 !bottom-3"
                />
              )}
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
