import { Box, Button } from "@atomiton/ui";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { useState } from "react";
import Images from "./Images";
import Menu from "./Menu";
import Object3D from "./Object3D";
import Preview from "./Preview";
import Video from "./Video";

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

type ExportProps = {
  disabled?: boolean;
};

function Export({ disabled = false }: ExportProps) {
  const [active, setActive] = useState(0);

  if (disabled) {
    return (
      <Button
        className="w-23"
        variant="default"
        disabled
        title="Export feature coming soon"
      >
        Export
      </Button>
    );
  }

  return (
    <Popover className="relative">
      <PopoverButton as={Button} className="w-23" variant="default">
        Export
      </PopoverButton>
      <PopoverPanel
        className="z-20 [--anchor-gap:0.75rem] [--anchor-offset:0.5rem] min-w-137.5 min-h-79.5 bg-surface-01 shadow-popover border border-s-01 rounded-[1.25rem] transition duration-200 data-closed:opacity-0"
        anchor="bottom end"
        transition
      >
        <Box className="flex">
          <Box className="flex flex-col shrink-0 w-38 p-2 border-r border-s-01">
            <Menu items={menu} onClick={setActive} isActive={active} />
            <Preview video={active === 1} />
          </Box>
          <Box className="flex flex-col grow">
            {active === 0 && <Images />}
            {active === 1 && <Video />}
            {active === 2 && <Object3D />}
          </Box>
        </Box>
      </PopoverPanel>
    </Popover>
  );
}

export default Export;
