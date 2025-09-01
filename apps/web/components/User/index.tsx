import { useState } from "react";
import Link from "next/link";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import Settings from "./Settings";

const User = ({}) => {
  const [open, setOpen] = useState(false);

  const navigation = [
    {
      id: 0,
      title: "Profile",
      icon: "profile",
      url: "/profile",
    },
    {
      id: 1,
      title: "Subscription",
      icon: "diamond",
      url: "/pricing",
    },
    {
      id: 2,
      title: "Join Dicord",
      icon: "text-generation",
      href: "https://discord.gg",
    },
    {
      id: 3,
      title: "Settings",
      icon: "switch",
      onClick: () => setOpen(true),
    },
    {
      id: 4,
      title: "Updates",
      icon: "check-circle",
      url: "/updates",
    },
    {
      id: 5,
      title: "Sign out",
      icon: "logout",
      url: "/sign-in",
    },
  ];

  const styleItem =
    "flex items-center w-full gap-3.5 h-10 px-2.5 rounded-xl text-body-md-str text-primary fill-secondary transition-colors data-[focus]:bg-surface-03 data-[focus]:fill-primary nth-4:relative nth-4:mb-4 nth-4:after:absolute nth-4:after:top-[calc(100%+0.5rem)] nth-4:after:-left-2 nth-4:after:-right-2 nth-4:after:h-0.25 nth-4:after:bg-[#F4F4F4] nth-4:after:pointer-events-none";

  return (
    <>
      <Menu className="relative" as="div">
        <MenuButton className="size-10 p-0.75 border border-transparent rounded-full overflow-hidden outline-0 transition-colors data-[hover]:border-shade-09/10 data-[active]:border-shade-09/10">
          <Image
            className="size-8 rounded-full object-cover opacity-100"
            src="/images/avatars/1.png"
            width={32}
            height={32}
            priority={true}
            quality={100}
            alt="avatar"
          />
        </MenuButton>
        <MenuItems
          className="z-30 w-55 p-2 rounded-[1.25rem] bg-surface-01 outline-none shadow-popover [--anchor-gap:0.75rem] [--anchor-offset:0.5rem] origin-top transition duration-200 ease-out after:absolute after:inset-0 after:rounded-[1.25rem] after:border after:border-[#E5E5E5] after:mask-b-from-0% after:pointer-events-none data-[closed]:scale-95 data-[closed]:opacity-0"
          anchor="bottom end"
          transition
          modal={false}
        >
          {navigation.map((item) => (
            <MenuItem key={item.id}>
              {item.href ? (
                <a
                  className={styleItem}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="fill-inherit" name={item.icon} />
                  {item.title}
                </a>
              ) : item.url ? (
                <Link className={styleItem} href={item.url}>
                  <Icon className="fill-inherit" name={item.icon} />
                  {item.title}
                </Link>
              ) : (
                <button className={styleItem} onClick={item.onClick}>
                  <Icon className="fill-inherit" name={item.icon} />
                  {item.title}
                </button>
              )}
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
      <Modal
        classWrapper="max-w-148.5 !rounded-3xl max-md:overflow-hidden"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Settings />
      </Modal>
    </>
  );
};

export default User;
