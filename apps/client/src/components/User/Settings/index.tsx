import { useState } from "react";
import Icon from "#components/Icon";
import General from "./General";
import Profile from "./Profile";
import Security from "./Security";
import Notifications from "./Notifications";
import Subscription from "./Subscription";

import { menu } from "./menu";

function Settings() {
  const [activeId, setActiveId] = useState(0);

  return (
    <div className="flex min-h-112 max-md:block max-md:min-h-120">
      <div className="flex flex-col gap-0.5 shrink-0 w-45 p-3 border-r border-s-01 max-md:flex-row max-md:gap-0 max-md:w-auto max-md:border-r-0 max-md:overflow-auto max-md:scrollbar-none">
        {menu.map((item) => (
          <button
            className={`flex items-center gap-3 w-full p-0.75 pr-2.5 border rounded-xl text-body-md-str transition-colors hover:bg-surface-03 max-md:shrink-0 max-md:w-auto max-md:gap-2.5 ${
              activeId === item.id
                ? "bg-surface-03 border-s-02"
                : "border-transparent"
            }`}
            key={item.id}
            onClick={() => setActiveId(item.id)}
          >
            <div
              className={`flex justify-center items-center size-8 rounded-lg transition-all ${
                activeId === item.id
                  ? "bg-surface-01 shadow-[0px_0px_4px_0px_rgba(18,18,18,0.10)] fill-primary"
                  : "fill-secondary"
              }`}
            >
              <Icon className="fill-inherit" name={item.icon} />
            </div>
            <div>{item.title}</div>
          </button>
        ))}
      </div>
      <div className="grow">
        {activeId === 0 && <General />}
        {activeId === 1 && <Profile />}
        {activeId === 2 && <Security />}
        {activeId === 3 && <Notifications />}
        {activeId === 4 && <Subscription />}
      </div>
    </div>
  );
}

export default Settings;
