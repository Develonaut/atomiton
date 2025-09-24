import { useState } from "react";
import Switch from "#components/Switch";
import Group from "#components/Group";

function MotionBlur() {
  const [blur, setBlur] = useState(true);

  return (
    <Group
      title="Motion Blur"
      rightContent={<Switch checked={blur} onChange={() => setBlur(!blur)} />}
    />
  );
}

export default MotionBlur;
