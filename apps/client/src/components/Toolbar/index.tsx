import Export from "@/components/Export";
import Icon from "@/components/Icon";
import Zoom from "@/components/Zoom";
import useStore from "@/store";
import { Button } from "@atomiton/ui";
import { useState } from "react";

function Toolbar() {
  const { openComments, closeComments, openResizeImage, closeResizeImage } =
    useStore((state) => state);
  const [active, setActive] = useState<number | null>(0);

  const actions = [
    {
      id: 0,
      icon: "cursor",
      onClick: () => {
        closeResizeImage();
        closeComments();
      },
    },
    {
      id: 1,
      icon: "pinch",
      onClick: () => {
        closeResizeImage();
        closeComments();
      },
    },
    {
      id: 2,
      icon: "message",
      onClick: () => {
        closeResizeImage();
        openComments();
      },
    },
    {
      id: 3,
      icon: "crop",
      onClick: () => {
        openResizeImage();
        closeComments();
      },
    },
    {
      id: 4,
      icon: "play",
      onClick: () => {
        closeResizeImage();
        closeComments();
      },
    },
  ];

  return (
    <div className="fixed top-3 left-1/2 z-20 -translate-x-1/2 flex shadow-toolbar border border-s-01 bg-surface-01 rounded-[1.25rem]">
      <div className="flex gap-2 p-2">
        {actions.map((action) => (
          <Button
            size="icon"
            variant={active === action.id ? "embossed" : "ghost"}
            key={action.id}
            onClick={() => {
              setActive(action.id);
              action.onClick();
            }}
          >
            <Icon className="fill-primary" name={action.icon} />
          </Button>
        ))}
        <Zoom />
        <Button size="icon" variant="ghost">
          <Icon className="fill-primary rotate-180" name="arrow" />
        </Button>
        <Button size="icon" variant="ghost">
          <Icon className="fill-primary" name="arrow" />
        </Button>
      </div>
      <div className="p-2">
        <Export />
      </div>
    </div>
  );
}

export default Toolbar;
