import Tabs from "#components/Tabs";
import ViewController from "#components/ViewController";
import Design from "#components/RightSidebar/Design";
import Head from "#components/RightSidebar/Head";
import { LogsSection } from "#components/LogsSection";
import { Box } from "@atomiton/ui";
import { useState } from "react";

const tabs = [
  { id: 0, name: "Config" },
  { id: 1, name: "Output" },
];

function RightSidebar() {
  const [tab, setTab] = useState(tabs[0]);

  return (
    <Box className="sidebar right-3 flex flex-col" data-testid="right-sidebar">
      <Head />
      <Box className="px-4 py-3 border-b border-s-01">
        <Tabs items={tabs} value={tab} setValue={setTab} />
      </Box>
      <Box className="grow overflow-y-auto scrollbar-none rounded-b-[1.25rem]">
        {tab.id === 0 && <Design />}
        {tab.id === 1 && <LogsSection />}
      </Box>
      <ViewController vertical />
    </Box>
  );
}

export default RightSidebar;
