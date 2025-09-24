import Assets from "#components/SceneAndAssetsSidebar/Assets";
import Tabs from "#components/Tabs";
import Head from "#components/SceneAndAssetsSidebar/Head";
import Scene from "#components/SceneAndAssetsSidebar/Scene";
import Search from "#components/SceneAndAssetsSidebar/Search";
import { useState } from "react";

type TabItem = {
  id: number;
  name: string;
  onClick?: () => void;
};

const tabs: TabItem[] = [
  { id: 0, name: "Scene" },
  { id: 1, name: "Assets" },
];

function LeftSidebar() {
  const [tab, setTab] = useState<TabItem>(tabs[0] ?? { id: 0, name: "Scene" });

  return (
    <div className="flex flex-col w-60 min-h-219 bg-[#FCFCFC] border border-[#ECECEC] rounded-[1.25rem]">
      <Head />
      <div className="px-4 py-3 border-b border-[#ECECEC]">
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
