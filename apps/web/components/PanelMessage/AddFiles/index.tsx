import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Icon from "@/components/Icon";

type Props = {
  className?: string;
};

const AddFiles = ({ className }: Props) => {
  const items = [
    {
      title: "Add photos or videos",
      icon: "focus-plus",
      onClick: () => {},
    },
    {
      title: "Add 3D objects",
      icon: "cube-think",
      onClick: () => {},
    },
    {
      title: "Add files (docs, txt...)",
      icon: "add-document",
      onClick: () => {},
    },
  ];

  return (
    <Menu>
      <MenuButton
        className={`size-10 rounded-xl border border-s-02 outline-0 transition-colors hover:bg-surface-03 data-open:bg-surface-03 ${
          className || ""
        }`}
      >
        <Icon name="plus-think" />
      </MenuButton>
      <MenuItems
        className="z-10 w-51 p-2 rounded-[1.25rem] bg-surface-01 border border-s-02 outline-none shadow-popover [--anchor-gap:0.5rem] [--anchor-offset:-0.5rem] origin-top transition ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        anchor="top start"
        transition
        modal={false}
      >
        {items.map((item, index) => (
          <MenuItem
            className="flex items-center gap-2.5 h-10 w-full px-2 rounded-xl text-body-lg font-medium text-primary transition-colors hover:bg-surface-03"
            key={index}
            as="button"
            onClick={item.onClick}
          >
            <div className="flex justify-center items-center size-6">
              <Icon className="fill-secondary" name={item.icon} />
            </div>
            {item.title}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
};

export default AddFiles;
