import { useState } from "react";
import Icon from "@/components/Icon";
import Export from "@/components/Export";
import Zoom from "@/components/Zoom";
import useStore from "@/store";

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
          <button
            className={`size-10 border rounded-xl transition-all hover:bg-surface-03 ${
              active === action.id
                ? "bg-surface-03 border-s-02 shadow-[0_-1px_3px_0px_rgba(18,18,18,0.15)_inset,_0px_1.25px_1px_0px_#FFF_inset]"
                : "border-transparent"
            }`}
            key={action.id}
            onClick={() => {
              setActive(action.id);
              action.onClick();
            }}
          >
            <Icon className="fill-primary" name={action.icon} />
          </button>
        ))}
        <Zoom />
        <button className="size-10 rounded-xl transition-all opacity-40 hover:bg-surface-03">
          <Icon className="fill-primary rotate-180" name="arrow" />
        </button>
        <button className="size-10 rounded-xl transition-all hover:bg-surface-03">
          <Icon className="fill-primary" name="arrow" />
        </button>
      </div>
      <div className="p-2">
        <Export />
      </div>
    </div>
  );
}

export default Toolbar;
