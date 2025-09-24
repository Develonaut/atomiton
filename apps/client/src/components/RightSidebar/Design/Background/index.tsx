import { useState } from "react";
import Group from "#components/RightSidebar/Group";
import { ColorDisplay } from "#components/form";

function Background() {
  const [color, setColor] = useState("F4F4F4");
  const [opacity, setOpacity] = useState(100);

  return (
    <Group title="Background">
      <ColorDisplay
        color={color}
        onColorChange={setColor}
        opacity={opacity}
        onOpacityChange={setOpacity}
      />
    </Group>
  );
}

export default Background;
