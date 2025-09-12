import { useState } from "react";
import Switch from "@/components/form/Switch";

function MotionBlur() {
  const [blur, setBlur] = useState(true);

  return (
    <div className="px-4 py-3 border-b border-shade-02">
      <Switch checked={blur} onChange={() => setBlur(!blur)} fullWidth>
        <Switch.Label>Motion Blur</Switch.Label>
        <Switch.Thumb />
      </Switch>
    </div>
  );
}

export default MotionBlur;
