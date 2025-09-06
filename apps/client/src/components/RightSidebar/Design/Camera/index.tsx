import { useState } from "react";
import Tabs from "@/components/Tabs";
import Group from "../../Group";
import Isometric from "./Isometric";

const tabs = [
  { id: 0, name: "Isometric" },
  { id: 1, name: "Perspective" },
];

function Camera() {
  const [tab, setTab] = useState(tabs[0]);

  return (
    <Group title="Camera">
      <Tabs items={tabs} value={tab} setValue={setTab} />
      <div className="pt-3">{tab.id === 0 && <Isometric />}</div>
    </Group>
  );
}

export default Camera;
