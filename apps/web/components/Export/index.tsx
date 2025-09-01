import { useState } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import Button from "@/components/Button";
import Menu from "./Menu";
import Preview from "./Preview";
import Images from "./Images";
import Video from "./Video";
import Object3D from "./Object3D";

const menu = [
  {
    id: 0,
    title: "Images",
    icon: "image",
  },
  {
    id: 1,
    title: "Video",
    icon: "video-camera",
  },
  {
    id: 2,
    title: "3D Object",
    icon: "cube",
  },
];

const Export = () => {
  const [active, setActive] = useState(0);

  return (
    <>
      <Popover className="relative">
        <PopoverButton as="div">
          <Button className="w-23" isPrimary>
            Export
          </Button>
        </PopoverButton>
        <PopoverPanel
          className="z-20 flex [--anchor-gap:0.75rem] [--anchor-offset:0.5rem] min-w-137.5 min-h-79.5 bg-shade-01 shadow-popover border border-s-01 rounded-[1.25rem] transition duration-200 data-closed:opacity-0"
          anchor="bottom end"
          transition
        >
          <div className="flex flex-col shrink-0 w-38 p-2 border-r border-s-01">
            <Menu items={menu} onClick={setActive} isActive={active} />
            <Preview video={active === 1} />
          </div>
          <div className="flex flex-col grow">
            {active === 0 && <Images />}
            {active === 1 && <Video />}
            {active === 2 && <Object3D />}
          </div>
        </PopoverPanel>
      </Popover>
    </>
  );
};

export default Export;
