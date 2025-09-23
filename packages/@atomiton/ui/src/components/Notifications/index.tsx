import { useState } from "react";
import Notification from "#components/Notification";

import { content } from "./content";

type Props = {
  className?: string;
};

function Notifications({ className }: Props) {
  const [tab, setTab] = useState("all");

  const tabs = [
    {
      label: "All",
      value: "all",
    },
    {
      label: "Unread",
      value: "unread",
    },
  ];

  return (
    <div className={`${className || ""}`}>
      <div className="flex justify-between items-center px-5 py-4 border-b border-[#ECECEC]">
        <div className="text-[0.875rem] leading-[1.25rem] font-semibold">
          Notifications
        </div>
        <div className="flex gap-1">
          {tabs.map((tabItem) => (
            <button
              className={`text-[0.75rem] leading-[1rem] font-medium px-2 py-1 rounded-[0.625rem] cursor-pointer transition-colors hover:text-[#000] ${
                tabItem.value === tab
                  ? "bg-[#F1F1F1] text-[#000]"
                  : "text-[#7B7B7B]"
              }`}
              onClick={() => setTab(tabItem.value)}
              key={tabItem.value}
            >
              {tabItem.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-auto scrollbar-none">
        {content.map((item) => (
          <Notification item={item} key={item.id} />
        ))}
      </div>
    </div>
  );
}

export default Notifications;
