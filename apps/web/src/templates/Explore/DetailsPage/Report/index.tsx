import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Icon from "@/components/Icon";

const Report = () => {
  const buttons = [
    {
      title: "Nudity & Sexual Content",
      onClick: () => {},
    },
    {
      title: "Child Exploitation",
      onClick: () => {},
    },
  ];

  return (
    <Menu className="relative" as="div">
      <MenuButton className="group size-11 rounded-xl bg-surface-01 border border-s-02 transition-all outline-0 hover:bg-surface-03 data-[active]:bg-shade-07 data-[active]:border-shade-07 data-[active]:shadow-[0_0.5px_1px_0px_rgba(255,255,255,0.15)_inset,0px_2px_4px_-1px_rgba(13,13,13,0.50),0px_-1px_1.2px_0.35px_#121212_inset]">
        <Icon
          className="!size-4 fill-primary transition-colors group-[[data-active]]:fill-shade-01"
          name="flag"
        />
      </MenuButton>
      <MenuItems
        className="z-30 p-6 rounded-[1.25rem] bg-surface-01 border border-s-01 outline-none shadow-popover [--anchor-gap:1.25rem] origin-top transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 max-md:[--anchor-gap:0.75rem]"
        anchor="bottom end"
        transition
        modal={false}
      >
        <div className="mb-4 text-title-str">
          Why are you reporting this image?
        </div>
        <div className="flex gap-2">
          {buttons.map((button, index) => (
            <MenuItem
              className="h-10 px-3 rounded-xl bg-surface-03 text-body-md-str transition-colors hover:bg-shade-04"
              as="button"
              onClick={button.onClick}
              key={index}
            >
              {button.title}
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
};

export default Report;
