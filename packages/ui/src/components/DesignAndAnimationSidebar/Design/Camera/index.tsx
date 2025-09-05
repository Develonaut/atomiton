import { useState } from "react";
import Tabs from "@/components/Tabs";
import Group from "../../Group";
import Isometric from "./Isometric";

type TabItem = {
  id: number;
  name: string;
  onClick?: () => void;
};

const tabs: TabItem[] = [
  { id: 0, name: "Isometric" },
  { id: 1, name: "Perspective" },
];

const Camera = () => {
  const [tab, setTab] = useState<TabItem>(
    tabs[0] ?? { id: 0, name: "Isometric" },
  );

  return (
    <Group title="Camera">
      <Tabs items={tabs} value={tab} setValue={setTab} />
      <div className="pt-3">{tab.id === 0 && <Isometric />}</div>
    </Group>
  );
};

export default Camera;
