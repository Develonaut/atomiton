import { useState } from "react";
import Switch from "#components/Switch";
import Group from "#components/Group";

function ShowFrame() {
  const [showFrame, setShowFrame] = useState(true);

  return (
    <Group
      title="Show Frame"
      rightContent={
        <Switch checked={showFrame} onChange={() => setShowFrame(!showFrame)} />
      }
    />
  );
}

export default ShowFrame;
