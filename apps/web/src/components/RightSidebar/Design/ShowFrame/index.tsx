import { useState } from "react";
import Switch from "@/components/Switch";
import Group from "../../Group";

const ShowFrame = () => {
  const [showFrame, setShowFrame] = useState(true);

  return (
    <Group
      title="Show Frame"
      rightContent={
        <Switch checked={showFrame} onChange={() => setShowFrame(!showFrame)} />
      }
    />
  );
};

export default ShowFrame;
