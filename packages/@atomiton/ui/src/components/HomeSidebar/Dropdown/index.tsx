import type { ReactNode } from "react";
import { useState } from "react";
import AnimateHeight from "react-animate-height";

type DropdownProps = {
  title: string;
  iconPath: string;
  active?: boolean;
  counter?: number;
  defaultOpen?: boolean;
  children?: ReactNode;
};

function Dropdown({
  title,
  iconPath,
  active = false,
  counter,
  defaultOpen = false,
  children,
}: DropdownProps) {
  const [height, setHeight] = useState<number | "auto">(
    defaultOpen ? "auto" : 0,
  );

  return (
    <div className="relative">
      <div
        className={`group relative flex items-center w-full p-0.75 pr-3 border rounded-xl text-[0.75rem] font-semibold text-[#121212] transition-colors cursor-pointer hover:bg-[#f1f1f1] ${
          height === 0 ? "" : "bg-[#f1f1f1]"
        } ${active ? "bg-[#f1f1f1] border-[#ececec]" : "border-transparent"}`}
        onClick={() => setHeight(height === 0 ? "auto" : 0)}
      >
        <div
          className={`flex justify-center items-center size-8 mr-3 rounded-lg transition ${
            active
              ? "bg-[#fcfcfc] shadow-[0_0_4px_0_rgba(18,18,18,0.10)] fill-[#121212]"
              : "fill-[#7b7b7b]"
          }`}
        >
          <svg
            className="size-5 fill-inherit"
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <path d={iconPath} />
          </svg>
        </div>
        <div className="mr-auto">{title}</div>
        {counter && (
          <div className="px-1.5 py-0.5 bg-[#f1f1f1] rounded-md shadow-[0_0px_0px_1px_rgba(0,0,0,0.11),0px_2px_0.8px_0px_rgba(255,255,255,0.27)_inset,0px_-1px_0.6px_0px_rgba(0,0,0,0.20)_inset,0px_1px_4.2px_-1px_rgba(0,0,0,0.25)] text-[0.6875rem] font-medium text-[#7b7b7b]">
            {counter}
          </div>
        )}
        <div className="relative z-3">
          <svg
            className={`size-4 ml-3 fill-[#7b7b7b] transition-transform ${
              height === 0 ? "" : "rotate-180"
            }`}
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <path d="M11.371 12.38c-.757.827-1.985.827-2.742 0l-3.36-3.668a1.07 1.07 0 0 1 0-1.418c.359-.392.94-.392 1.299 0l3.36 3.668c.04.044.104.044.144 0l3.36-3.668c.359-.392.94-.392 1.299 0a1.07 1.07 0 0 1 0 1.418l-3.36 3.668z" />
          </svg>
        </div>
      </div>
      <AnimateHeight duration={500} height={height}>
        <div className="relative flex flex-col pt-0.5 before:absolute before:top-0 before:left-4.75 before:bottom-8 before:w-[1.5px] before:bg-[#ececec]">
          {children}
        </div>
      </AnimateHeight>
    </div>
  );
}

export default Dropdown;
