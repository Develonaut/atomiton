import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import Button from "#components/Button";
import Export from "#components/Export";

function ExportFiles() {
  return (
    <>
      <Popover className="relative">
        <PopoverButton as="div">
          <Button className="w-23" isPrimary>
            Export
          </Button>
        </PopoverButton>
        <PopoverPanel
          className="z-20 [--anchor-gap:0.75rem] [--anchor-offset:0.5rem] bg-[#FCFCFC] border border-[#ECECEC] rounded-[1.25rem] shadow-2xl transition duration-200 data-closed:opacity-0"
          anchor="bottom end"
          transition
        >
          <Export />
        </PopoverPanel>
      </Popover>
    </>
  );
}

export default ExportFiles;
