import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Icon from "@/components/Icon";
import Image from "@/components/Image";

import { users } from "./users";

const AddUser = () => (
  <Menu as="div" className="relative">
    <MenuButton className="size-8 rounded-[0.625rem] border border-transparent transition-colors outline-0 hover:bg-surface-03 data-open:bg-surface-03 data-open:border-s-01">
      <Icon className="fill-secondary" name="at" />
    </MenuButton>
    <MenuItems
      className="headlessui-dropdown new-comment z-100 w-54 rounded-xl bg-surface-01 border border-s-01 outline-none shadow-popover [--anchor-gap:1rem] [--anchor-offset:-0.75rem] overflow-hidden origin-top transition ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
      anchor="bottom start"
      transition
      modal={false}
    >
      {users.map((user, index) => (
        <MenuItem
          className="flex items-center gap-3 w-full px-3 py-2.5 transition-colors hover:bg-surface-03 cursor-pointer"
          key={index}
          as="div"
        >
          <div className="shrink-0">
            <Image
              className="size-8 rounded-full"
              src={user.avatar}
              width={32}
              height={32}
              alt={user.name}
            />
          </div>
          <div className="grow">
            <div className="">{user.name}</div>
            <div className="text-body-sm text-secondary">@{user.login}</div>
          </div>
        </MenuItem>
      ))}
    </MenuItems>
  </Menu>
);

export default AddUser;
