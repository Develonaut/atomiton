import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import Toolbar from "@/components/Toolbar";
// import useStore from "@/store";
import { Canvas, Editor } from "@atomiton/editor";

function LayoutEditor() {
  return (
    <div className="min-h-screen bg-surface-02">
      <Editor>
        <LeftSidebar />
        <div className="flex flex-col flex-1">
          <Toolbar />
          <div className="relative flex-1 ml-63 mr-63">
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
              <Canvas.Controls />
              <Canvas.Minimap />
            </Canvas>
          </div>
        </div>
        <RightSidebar />
      </Editor>
    </div>
  );
}

export default LayoutEditor;
