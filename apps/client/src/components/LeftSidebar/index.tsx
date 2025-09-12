import Tabs from "@/components/Tabs";
import { useState } from "react";
import Assets from "./Assets";
import Head from "./Head";
import Scene from "./Scene";
import Search from "./Search";

const tabs = [
  { id: 0, name: "Scene" },
  { id: 1, name: "Assets" },
];

function LeftSidebar() {
  const [tab, setTab] = useState(tabs[0]);

  return (
    <div className="sidebar left-3 flex flex-col">
      <Head />
      <div className="px-4 py-3 border-b border-s-01">
        <Tabs items={tabs} value={tab} setValue={setTab} />
      </div>
      <div className="grow overflow-y-auto scrollbar-none">
        {tab.id === 0 && <Scene />}
        {tab.id === 1 && <Assets />}
      </div>
      <Search />
    </div>
  );
}

export default LeftSidebar;
