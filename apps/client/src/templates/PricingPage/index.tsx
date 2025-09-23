import { useState } from "react";
import LayoutOnlyHeader from "#components/LayoutOnlyHeader";
import Tabs from "#components/Tabs";
import Item from "./Item";

import { pricing } from "./content";

const tabs = [
  { id: 0, name: "Pay monthly" },
  { id: 1, name: "Pay yearly" },
];

function ProfilePage() {
  const [tab, setTab] = useState(tabs[0]);

  return (
    <LayoutOnlyHeader>
      <div className="py-16 max-lg:pb-0 max-md:pt-8">
        <div className="center">
          <div className="mb-8 text-center text-h2 max-md:mb-6 max-md:text-h3">
            Choose your plan
          </div>
          <Tabs
            className="max-w-52 mx-auto"
            classButton="last:after:absolute last:after:top-0.5 last:after:right-0.5 last:after:size-1 last:after:rounded-full last:after:bg-green"
            items={tabs}
            value={tab}
            setValue={setTab}
          />
          <div className="flex pt-12 gap-8 max-lg:gap-0 max-lg:overflow-x-auto max-lg:pb-16 max-lg:scrollbar-none max-lg:-mx-5 max-lg:after:shrink-0 max-lg:after:w-5 max-lg:before:shrink-0 max-lg:before:w-5 max-md:pt-8">
            {pricing.map((item) => (
              <Item key={item.id} item={item} price={tab.id} />
            ))}
          </div>
        </div>
      </div>
    </LayoutOnlyHeader>
  );
}

export default ProfilePage;
