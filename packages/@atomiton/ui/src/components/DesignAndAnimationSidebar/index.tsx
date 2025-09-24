import Tabs from "#components/Tabs";
import { useState } from "react";
// import ViewController from "#components/ViewController";
import Animation from "#Animation";
import Design from "#Design";
import Head from "#Head";

type TabItem = {
  id: number;
  name: string;
  onClick?: () => void;
};

function RightSidebar() {
  const tabs: TabItem[] = [
    { id: 0, name: "Design" },
    { id: 1, name: "Animation" },
  ];

  const [tab, setTab] = useState<TabItem>(tabs[0] ?? { id: 0, name: "Design" });

  return (
    <div className="flex flex-col w-60 min-h-219 bg-[#FCFCFC] border border-[#ECECEC] rounded-[1.25rem]">
      <Head />
      <div className="px-4 py-3 border-b border-[#ececec]">
        <Tabs items={tabs} value={tab} setValue={setTab} />
      </div>
      <div className="grow overflow-y-auto scrollbar-none rounded-b-[1.25rem]">
        {tab.id === 0 && <Design />}
        {tab.id === 1 && <Animation />}
      </div>
      {/* {tab.id === 1 && <ViewController vertical />} */}
    </div>
  );
}

export default RightSidebar;
