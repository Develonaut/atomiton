import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import Zoom from "@/components/Zoom";

function ZoomControl() {
  return (
    <Popover className="relative group">
      <PopoverButton className="flex justify-between items-center gap-2 min-w-22 h-10 px-3 rounded-xl border border-[#ececec] bg-[#f1f1f1] text-[0.875rem] font-medium transition outline-0 cursor-pointer hover:bg-[#FCFCFC] hover:border-[#E2E2E2] data-open:border-[#121212]/10 data-open:shadow-[0_0px_2px_2px_#FFF_inset]">
        100%
        <svg
          className="size-4 fill-[#7b7b7b] transition-transform group-[[data-open]]:rotate-180"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        >
          <path d="M11.371 12.38c-.757.827-1.985.827-2.742 0l-3.36-3.668a1.07 1.07 0 0 1 0-1.418c.359-.392.94-.392 1.299 0l3.36 3.668c.04.044.104.044.144 0l3.36-3.668c.359-.392.94-.392 1.299 0a1.07 1.07 0 0 1 0 1.418l-3.36 3.668z" />
        </svg>
      </PopoverButton>
      <PopoverPanel
        className="z-20 [--anchor-gap:0.75rem] [--anchor-offset:0.5rem] w-51 rounded-2xl bg-[#FCFCFC] border border-[#ECECEC] shadow-2xl transition duration-200 data-closed:opacity-0"
        anchor={{ to: "bottom end" }}
        transition
      >
        <Zoom />
      </PopoverPanel>
    </Popover>
  );
}

export default ZoomControl;
