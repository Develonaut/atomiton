import { useState } from "react";
import Switch from "@/components/form/Switch";

function ShowFrame() {
  const [showFrame, setShowFrame] = useState(true);

  return (
    <div className="px-4 py-3 border-b border-shade-02">
      <Switch
        checked={showFrame}
        onChange={() => setShowFrame(!showFrame)}
        fullWidth
      >
        <Switch.Label>Show Frame</Switch.Label>
        <Switch.Thumb />
      </Switch>
    </div>
  );
}

export default ShowFrame;
