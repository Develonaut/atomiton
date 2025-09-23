import { useState } from "react";
import {
  Popover,
  PopoverBackdrop,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import { motion } from "framer-motion";
import Icon from "#components/Icon";
import Notification from "./Notification";
import Details from "./Details";

import { content } from "./content";

function Notifications() {
  const [visible, setVisible] = useState(false);
  const isNewNotification = true;
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
    <Popover className="">
      <PopoverButton
        className={`relative z-20 size-10 rounded-xl border border-transparent outline-0 transition-all hover:bg-surface-03 data-open:bg-surface-03 data-open:border-s-02 data-open:shadow-[0_-1px_3px_0px_rgba(18,18,18,0.15)_inset,0px_1.25px_1px_0px_#FFF_inset] ${
          isNewNotification
            ? "after:absolute after:top-1 after:right-1 after:size-1 after:bg-red after:rounded-full"
            : ""
        }`}
      >
        <Icon className="fill-primary" name="flash" />
      </PopoverButton>
      <PopoverBackdrop
        className="fixed inset-0 z-15 bg-shade-07/40 transition duration-100 ease-out data-closed:opacity-0"
        transition
        onClick={() => setVisible(false)}
      />
      <PopoverPanel
        className="z-20 top-full right-5 !left-auto w-96 h-[calc(100vh-6.25rem)] mt-5 flex origin-top flex-col bg-shade-01 border border-s-01 rounded-[1.25rem] shadow-popover transition outline-0 !overflow-visible data-closed:opacity-0 max-md:!left-5 max-md:w-auto"
        anchor="bottom"
        transition
        modal={true}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-s-01">
          <div className="text-heading-str">Notifications</div>
          <div className="flex gap-1">
            {tabs.map((tabItem) => (
              <button
                className={`text-body-md px-2 py-1 rounded-[0.625rem] transition-colors hover:text-primary ${
                  tabItem.value === tab
                    ? "bg-surface-03 text-primary"
                    : "text-secondary"
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
            <Notification
              item={item}
              key={item.id}
              onClick={() => setVisible(true)}
            />
          ))}
        </div>
        {visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              delay: 0.2,
            }}
          >
            <Details onClose={() => setVisible(false)} />
          </motion.div>
        )}
      </PopoverPanel>
    </Popover>
  );
}

export default Notifications;
