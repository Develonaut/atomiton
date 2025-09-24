import Tabs from "#components/Tabs";
import Isometric from "#Isometric";
import { useState } from "react";
import Group from "./../Group";

function Camera() {
  const [activeView, setActiveView] = useState<"isometric" | "perspective">(
    "isometric",
  );

  return (
    <Group title="Camera">
      <Tabs
        value={activeView}
        onChange={(value) =>
          setActiveView(value as "isometric" | "perspective")
        }
      >
        <Tabs.List>
          <Tabs.Trigger value="isometric">Isometric</Tabs.Trigger>
          <Tabs.Trigger value="perspective">Perspective</Tabs.Trigger>
        </Tabs.List>

        <div className="pt-3">
          <Tabs.Content value="isometric">
            <Isometric />
          </Tabs.Content>
          <Tabs.Content value="perspective">
            {/* Perspective content will go here */}
          </Tabs.Content>
        </div>
      </Tabs>
    </Group>
  );
}

export default Camera;
