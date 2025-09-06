import { useState, useRef } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import Icon from "@/components/Icon";

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
      className="flex items-center w-full h-9 px-1.5 rounded-[0.625rem] transition-colors hover:bg-surface-03"
      onClick={onClick}
    >
      <div
        className={`flex justify-center items-center size-6 mr-1 opacity-0 transition-opacity ${
          active ? "opacity-100" : ""
        }`}
      >
        <Icon className="!size-4 fill-secondary" name="check" />
      </div>
      <div className="">{title}</div>
      <div className="key min-w-8.5 ml-auto text-center">{keyName}</div>
    </button>
  );
}

function Zoom() {
  const [percentage, setPercentage] = useState(100);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeId, setActiveId] = useState(2);
  const [comments, setComments] = useState(true);
  const [view, setView] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace("%", "");
    const numValue = Number(inputValue);

    if (!isNaN(numValue)) {
      if (numValue < 1) {
        setPercentage(1);
      } else if (numValue > 100) {
        setPercentage(100);
      } else {
        setPercentage(numValue);
      }
    }
  };

  const handleFocus = () => {
    if (inputRef.current) {
      const length = percentage.toString().length;
      inputRef.current.setSelectionRange(0, length);
    }
  };

  return (
    <Popover className="relative group">
      <PopoverButton className="flex justify-between items-center gap-2 min-w-22 h-10 px-3 rounded-xl border border-s-01 bg-surface-03 text-heading outline-0 transition hover:border-shade-09/10 data-open:border-shade-09/10 data-open:shadow-[0_0px_2px_2px_#FFF_inset]">
        {percentage}%
        <Icon
          className="!size-4 fill-secondary transition-transform group-[[data-open]]:rotate-180"
          name="chevron"
        />
      </PopoverButton>
      <PopoverPanel
        className="z-20 [--anchor-gap:0.75rem] [--anchor-offset:0.5rem] shadow-popover rounded-2xl bg-shade-01 border border-s-01 transition duration-200 data-closed:opacity-0"
        anchor={{ to: "bottom end" }}
        transition
      >
        <div className="p-2 border-b border-s-01">
          <div className="relative">
            <Icon
              className="absolute top-1/2 left-2.5 -translate-y-1/2 !size-4 fill-secondary/50"
              name="focus-plus"
            />
            <input
              ref={inputRef}
              className="w-full h-9 pl-8.5 pr-2 border border-s-02 bg-surface-02 rounded-[0.625rem] text-body-md-str text-primary outline-0"
              type="text"
              value={`${percentage}%`}
              onChange={handleChange}
              onFocus={handleFocus}
              min={1}
              max={100}
            />
          </div>
        </div>
        <div className="p-2">
          {zoomOptions.map((item) => (
            <Line
              title={item.title}
              keyName={item.keyName}
              onClick={() => setActiveId(item.id)}
              active={activeId === item.id}
              key={item.keyName}
            />
          ))}
          <div className="-mx-2 h-0.25 my-2 bg-s-01"></div>
          <Line
            title="Comments"
            keyName="Shift C"
            onClick={() => setComments(!comments)}
            active={comments}
          />
          <Line
            title="3D Views"
            keyName="Shift"
            onClick={() => setView(!view)}
            active={view}
          />
        </div>
      </PopoverPanel>
    </Popover>
  );
}

export default Zoom;
