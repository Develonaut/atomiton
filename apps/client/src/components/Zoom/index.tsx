import { useRef, useState } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import Icon from "@/components/Icon";
import { useZoom } from "@atomiton/editor";

import { zoomOptions } from "./items";

interface PropsLine {
  title: string;
  keyName: string;
  onClick: () => void;
  active?: boolean;
}

function Line({ title, keyName, onClick, active }: PropsLine) {
  return (
    <button
      className="flex justify-between items-center gap-2.5 h-9 w-full px-2 rounded-xl text-body-sm transition-colors hover:bg-surface-03"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex justify-center items-center size-6 opacity-0 transition-opacity ${
            active ? "opacity-100" : ""
          }`}
        >
          <Icon className="!size-4 fill-secondary" name="check" />
        </div>
        <div>{title}</div>
      </div>
      {keyName && <div className="key">{keyName}</div>}
    </button>
  );
}

function Zoom() {
  const { zoom, zoomIn, zoomOut, zoomTo, fitView } = useZoom();

  const inputRef = useRef<HTMLInputElement>(null);
  const [activeId, setActiveId] = useState(2);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace("%", "");
    const numValue = Number(inputValue);

    if (!isNaN(numValue)) {
      zoomTo(numValue);
    }
  };

  const handleFocus = () => {
    if (inputRef.current) {
      const length = zoom.toString().length;
      inputRef.current.setSelectionRange(0, length);
    }
  };

  return (
    <Popover className="relative group">
      <PopoverButton className="flex justify-between items-center gap-2 min-w-22 h-10 px-3 rounded-xl border border-s-01 bg-surface-03 text-heading outline-0 transition hover:border-shade-09/10 data-open:border-shade-09/10 data-open:shadow-[0_0px_2px_2px_#FFF_inset]">
        {zoom}%
        <Icon
          className="!size-4 fill-secondary transition-transform group-[[data-open]]:rotate-180"
          name="chevron"
        />
      </PopoverButton>
      <PopoverPanel
        className="z-30 w-51 p-2 rounded-[1.25rem] bg-surface-01 border border-s-01 outline-none shadow-popover [--anchor-gap:0.75rem] origin-top transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        anchor={{ to: "bottom end" }}
        transition
      >
        <div className="mb-2 pb-2 border-b border-s-01">
          <div className="relative">
            <Icon
              className="absolute top-1/2 left-2.5 -translate-y-1/2 !size-4 fill-secondary/50"
              name="focus-plus"
            />
            <input
              ref={inputRef}
              className="w-full h-9 pl-8.5 pr-2 border border-s-02 bg-surface-02 rounded-xl text-body-sm text-primary outline-0"
              type="text"
              value={`${zoom}%`}
              onChange={handleChange}
              onFocus={handleFocus}
              min={10}
              max={100}
            />
          </div>
        </div>
        <div>
          {zoomOptions.map((item) => {
            const handleClick = () => {
              switch (item.action) {
                case "zoomIn":
                  zoomIn();
                  break;
                case "zoomOut":
                  zoomOut();
                  break;
                case "zoom100":
                  zoomTo(100);
                  setActiveId(item.id);
                  break;
                case "fitView":
                  fitView();
                  setActiveId(item.id);
                  break;
                case "zoom50":
                  zoomTo(50);
                  setActiveId(item.id);
                  break;
                case "zoom25":
                  zoomTo(25);
                  setActiveId(item.id);
                  break;
              }
            };

            return (
              <Line
                title={item.title}
                keyName={item.keyName}
                onClick={handleClick}
                active={item.action?.startsWith("zoom") && activeId === item.id}
                key={item.keyName}
              />
            );
          })}
        </div>
      </PopoverPanel>
    </Popover>
  );
}

export default Zoom;
