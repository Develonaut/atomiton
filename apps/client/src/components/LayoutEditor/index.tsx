import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import Toolbar from "@/components/Toolbar";
import { Canvas, Editor } from "@atomiton/editor";
import { Box } from "@atomiton/ui";

function LayoutEditor() {
  return (
    <Box className="relative min-h-screen bg-surface-02">
      <Editor>
        <Box className="absolute inset-0">
          <Box className="relative w-full h-full">
            <Canvas>
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
