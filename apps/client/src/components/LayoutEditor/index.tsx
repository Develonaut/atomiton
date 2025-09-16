import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import Toolbar from "@/components/Toolbar";
import { useLocation, useParams } from "@/router";
import { Canvas, Editor } from "@atomiton/editor";
import { Box } from "@atomiton/ui";
import { useCallback } from "react";

function LayoutEditor() {
  const { id } = useParams<{ id?: string }>();
  const { state: locationState } = useLocation();

  // Validate and sanitize location state
  const initialNodes = Array.isArray(locationState?.defaultNodes)
    ? locationState.defaultNodes
    : [];
  const initialEdges = Array.isArray(locationState?.defaultEdges)
    ? locationState.defaultEdges
    : [];

  /**
   * Handles saving the editor state
   * @param editorState - The current editor state to save
   */
  const onSave = useCallback(
    (editorState: unknown) => {
      if (!id) {
        console.error("Cannot save: No blueprint ID provided");
        return;
      }

      if (!editorState || typeof editorState !== "object") {
        console.error("Cannot save: Invalid editor state");
        return;
      }

      // TODO: Implement save functionality
      // blueprintStore.updateBlueprint(id, editorState);
      console.log("Save functionality not yet implemented");
    },
    [id],
  );

  // If no ID is provided, show an error message
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
            <Canvas key={id} nodes={initialNodes} edges={initialEdges}>
              <Canvas.Grid variant="dots" gap={12} size={1} />
              <Canvas.Minimap
                placement="bottom-right"
                className="!right-66 !bottom-3"
              />
            </Canvas>
          </Box>
        </Box>

        <Toolbar onSave={onSave} />
        <LeftSidebar />
        <RightSidebar />
      </Editor>
    </Box>
  );
}

export default LayoutEditor;
