import Assets from "#components/Assets";
import Layout from "#components/Layout";
import { useState } from "react";

import { content } from "#content";

function MaterialsPage() {
  const [tab, setTab] = useState("all-objects");

  const tabs = [
    {
      label: "All Materials",
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
        title="Materials"
        sort={tab}
        setSort={setTab}
        tabs={tabs}
        items={content}
      />
    </Layout>
  );
}

export default MaterialsPage;
