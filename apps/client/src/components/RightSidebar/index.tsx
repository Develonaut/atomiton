import Tabs from "@/components/Tabs";
import ViewController from "@/components/ViewController";
import { Box } from "@atomiton/ui";
import { useState } from "react";
import Animation from "./Animation";
import Design from "./Design";
import Head from "./Head";

function RightSidebar() {
  const [activeTab, setActiveTab] = useState<"design" | "animation">("design");

  return (
    <Box className="sidebar right-3 flex flex-col">
      <Head />
      <Box className="px-4 py-3 border-b border-s-01">
        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value as "design" | "animation")}
        >
          <Tabs.List>
            <Tabs.Trigger value="design">Design</Tabs.Trigger>
            <Tabs.Trigger value="animation">Animation</Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      </Box>
      <Box className="grow overflow-y-auto scrollbar-none rounded-b-[1.25rem]">
        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value as "design" | "animation")}
        >
          <Tabs.Content value="design">
            <Design />
          </Tabs.Content>
          <Tabs.Content value="animation">
            <Animation />
          </Tabs.Content>
        </Tabs>
      </Box>
      <ViewController vertical />
    </Box>
  );
}

export default RightSidebar;
