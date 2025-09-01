import { useState } from "react";
import Tabs from "@/components/Tabs";
import ViewController from "@/components/ViewController";
import Head from "./Head";
import Design from "./Design";
import Animation from "./Animation";
import useStore from "@/store";
import { TabItem } from "@/types";

const RightSidebar = () => {
  const { isAnimationSettings, openAnimationSettings, closeAnimationSettings } =
    useStore((state) => state);

  const tabs: TabItem[] = [
    { id: 0, name: "Design", onClick: closeAnimationSettings },
    { id: 1, name: "Animation", onClick: openAnimationSettings },
  ];

  const [tab, setTab] = useState<TabItem>(tabs[0]);

  const handleTabChange = (newTab: TabItem) => {
    setTab(newTab);
  };

  return (
    <div className="sidebar right-3 flex flex-col">
      <Head />
      <div className="px-4 py-3 border-b border-s-01">
        <Tabs items={tabs} value={tab} setValue={handleTabChange} />
      </div>
      <div className="grow overflow-y-auto scrollbar-none rounded-b-[1.25rem]">
        {tab.id === 0 && <Design />}
        {tab.id === 1 && <Animation />}
      </div>
      {!isAnimationSettings && <ViewController vertical />}
    </div>
  );
};

export default RightSidebar;
