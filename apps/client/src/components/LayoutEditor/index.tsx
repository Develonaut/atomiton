import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import Toolbar from "@/components/Toolbar";
// import useStore from "@/store";
import { Canvas, Editor } from "@atomiton/editor";

function LayoutEditor() {
  return (
    <div className="relative min-h-screen bg-surface-02">
      <Editor>
        {/* Canvas sits at the bottom layer, full screen */}
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            <Canvas
              nodes={[
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
              ]}
              edges={[
                {
                  id: "e1-2",
                  source: "1",
                  target: "2",
                },
              ]}
            >
              <Canvas.Grid variant="dots" gap={12} size={1} />
              {/* Controls positioned with padding to avoid clipping */}
              <Canvas.Controls
                placement="bottom-left"
                style={{ left: "264px", bottom: "12px" }} // 264px = 252px sidebar + 12px padding
              />
              <Canvas.Minimap
                placement="bottom-right"
                className="!right-66 !bottom-3" // Using Tailwind's important to override default positioning
              />
            </Canvas>
          </div>
        </div>

        {/* Toolbar and Sidebars sit on top with proper z-index */}
        <Toolbar />
        <LeftSidebar />
        <RightSidebar />
      </Editor>
    </div>
  );
}

export default LayoutEditor;
