import { useState } from "react";
import Layout from "@/components/Layout";
import Assets from "@/components/Assets";

import { content } from "./content";

function Objects3dPage() {
  const [tab, setTab] = useState("all-objects");

  const tabs = [
    {
      label: "All Objects",
      value: "all-objects",
    },
    {
      label: "Built-in",
      value: "built-in",
    },
    {
      label: "Yours",
      value: "yours",
    },
    {
      label: "Shared",
      value: "shared",
    },
  ];

  return (
    <Layout>
      <Assets
        title="3D Objects"
        sort={tab}
        setSort={setTab}
        tabs={tabs}
        items={content}
      />
    </Layout>
  );
}

export default Objects3dPage;
