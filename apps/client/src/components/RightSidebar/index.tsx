import Tabs from "@/components/Tabs";
import ViewController from "@/components/ViewController";
import type { TabItem } from "@/types";
import { Box } from "@atomiton/ui";
import { useState } from "react";
import Animation from "./Animation";
import Design from "./Design";
import Head from "./Head";

function RightSidebar() {
  const tabs: TabItem[] = [
    { id: 0, name: "Design" },
    { id: 1, name: "Animation" },
  ];

  const [tab, setTab] = useState<TabItem>(tabs[0]);

  const handleTabChange = (newTab: TabItem) => {
    setTab(newTab);
  };

  return (
    <Box className="sidebar right-3 flex flex-col">
      <Head />
      <Box className="px-4 py-3 border-b border-s-01">
        <Tabs items={tabs} value={tab} setValue={handleTabChange} />
      </Box>
      <Box className="grow overflow-y-auto scrollbar-none rounded-b-[1.25rem]">
        {tab.id === 0 && <Design />}
        {tab.id === 1 && <Animation />}
      </Box>
      <ViewController vertical />
    </Box>
  );
}

export default RightSidebar;
