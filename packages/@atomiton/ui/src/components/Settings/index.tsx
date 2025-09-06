import { useState } from "react";
import General from "./General";
import Profile from "./Profile";
import Security from "./Security";
import Notifications from "./Notifications";
import Subscription from "./Subscription";

import { menu } from "./menu";

function Settings() {
  const [activeId, setActiveId] = useState(0);

  return (
    <div className="flex w-148.5 min-h-112 rounded-3xl bg-[#FCFCFC] shadow-2xl">
      <div className="flex flex-col gap-0.5 shrink-0 w-45 p-3 border-r border-[#ECECEC]">
        {menu.map((item) => (
          <button
            className={`flex items-center gap-3 w-full p-0.75 pr-2.5 border rounded-xl text-[0.75rem] font-medium cursor-pointer transition-colors hover:bg-[#f1f1f1] ${
              activeId === item.id
                ? "bg-[#f1f1f1] border-[#e2e2e2]"
                : "border-transparent"
            }`}
            key={item.id}
            onClick={() => setActiveId(item.id)}
          >
            <div
              className={`flex justify-center items-center size-8 rounded-lg transition-all ${
                activeId === item.id
                  ? "bg-[#fcfcfc] shadow-[0px_0px_4px_0px_rgba(18,18,18,0.10)] fill-[#121212]"
                  : "fill-[#7b7b7b]"
              }`}
            >
              <svg
                className="size-5 fill-inherit"
                width={20}
                height={20}
                viewBox="0 0 20 20"
              >
                <path d={item.path} />
              </svg>
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
