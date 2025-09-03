import { useState } from "react";
import Tabs from "@/components/Tabs";
import Head from "./Head";
import Scene from "./Scene";
import Assets from "./Assets";
import Search from "./Search";

const tabs = [
  { id: 0, name: "Scene" },
  { id: 1, name: "Assets" },
];

const LeftSidebar = ({}) => {
  const [tab, setTab] = useState(tabs[0]);

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
};

export default LeftSidebar;
