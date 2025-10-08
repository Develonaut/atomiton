import Assets from "#components/LeftSidebar/Assets";
import Tabs from "#components/Tabs";
import Head from "#components/LeftSidebar/Head";
import Scene from "#components/LeftSidebar/Scene";
import Search from "#components/LeftSidebar/Search";
import { useState } from "react";

const tabs = [
  { id: 0, name: "Flow" },
  { id: 1, name: "Nodes" },
];

function LeftSidebar() {
  const [tab, setTab] = useState(tabs[0]);

  return (
    <div className="sidebar left-3 flex flex-col" data-testid="left-sidebar">
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
