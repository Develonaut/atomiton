import Image from "#components/Image";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

const navigation = [
  {
    title: "Profile",
    path: "M10 1.96c2.14 0 3.875 1.735 3.875 3.875S12.14 9.71 10 9.71 6.125 7.975 6.125 5.835 7.86 1.96 10 1.96zm0 1.5c-1.312 0-2.375 1.063-2.375 2.375S8.689 8.21 10 8.21s2.375-1.063 2.375-2.375S11.312 3.46 10 3.46zm0 7.25c3.046 0 5.53 1.782 6.551 4.542.525 1.419-.627 2.791-2.132 2.791H5.581c-1.505 0-2.657-1.372-2.132-2.791C4.47 12.492 6.955 10.71 10 10.71zm0 1.5c-2.409 0-4.339 1.383-5.145 3.563-.136.369.201.771.725.771h8.839c.525 0 .862-.402.725-.771-.806-2.179-2.735-3.563-5.145-3.563z",
  },
  {
    title: "Subscription",
    path: "M13.026 2.47a2.75 2.75 0 0 1 1.923.784l3.298 3.224a2.75 2.75 0 0 1 .022 3.911l-6.322 6.322a2.75 2.75 0 0 1-3.889 0l-6.322-6.322a2.75 2.75 0 0 1 .022-3.911l3.298-3.224a2.75 2.75 0 0 1 1.922-.784h6.048zm0 1.5H6.978a1.25 1.25 0 0 0-.874.356L2.806 7.551a1.25 1.25 0 0 0-.01 1.778l6.322 6.322a1.25 1.25 0 0 0 1.768 0l6.322-6.322a1.25 1.25 0 0 0-.01-1.778L13.9 4.326a1.25 1.25 0 0 0-.874-.356zM6.555 6.023a.75.75 0 1 1 1.061 1.061L6.271 8.428l1.345 1.345a.75.75 0 0 1 .073.977l-.073.084a.75.75 0 0 1-1.061 0L4.68 8.959a.75.75 0 0 1 0-1.061l1.875-1.875z",
  },
  {
    title: "Join Dicord",
    path: "M12.971 7.893a.75.75 0 0 1 1.342 0l1.137 2.276 2.277 1.138a.75.75 0 0 1 .097 1.284l-.097.058-2.277 1.139-1.137 2.276a.75.75 0 0 1-1.284.097l-.058-.097-1.139-2.277-2.276-1.138a.75.75 0 0 1-.097-1.284l.097-.058 2.275-1.138 1.14-2.276zm-7.454 6.044a.75.75 0 1 1 0 1.5H2.6a.75.75 0 1 1 0-1.5h2.917zm8.124-4.032l-.578 1.159a.75.75 0 0 1-.335.335l-1.158.579 1.158.579a.75.75 0 0 1 .287.252l.049.084.578 1.157.58-1.157a.75.75 0 0 1 .252-.287l.084-.049 1.158-.579-1.158-.579a.75.75 0 0 1-.287-.252l-.049-.084-.58-1.159zM7.183 8.728a.75.75 0 1 1 0 1.5H2.6a.75.75 0 1 1 0-1.5h4.583zM16.35 3.52a.75.75 0 0 1 0 1.5H2.6a.75.75 0 0 1 0-1.5h13.75z",
  },
  {
    title: "Settings",
    path: "M13.335 4.04a5.96 5.96 0 0 1 5.958 5.958 5.96 5.96 0 0 1-5.958 5.958H6.668A5.96 5.96 0 0 1 .71 9.998 5.96 5.96 0 0 1 6.668 4.04h6.667zm0 1.5H6.668A4.46 4.46 0 0 0 2.21 9.998a4.46 4.46 0 0 0 4.458 4.458h6.667a4.46 4.46 0 0 0 4.458-4.458 4.46 4.46 0 0 0-4.458-4.458zm0 1a3.46 3.46 0 0 1 3.458 3.458 3.46 3.46 0 0 1-3.458 3.458 3.46 3.46 0 0 1-3.458-3.458 3.46 3.46 0 0 1 3.458-3.458zm0 1.5a1.96 1.96 0 0 0-1.958 1.958 1.96 1.96 0 0 0 1.958 1.958 1.96 1.96 0 0 0 1.958-1.958 1.96 1.96 0 0 0-1.958-1.958z",
  },
  {
    title: "Updates",
    path: "M9.998 1.54a8.46 8.46 0 0 1 8.458 8.458 8.46 8.46 0 0 1-8.458 8.458A8.46 8.46 0 0 1 1.54 9.998 8.46 8.46 0 0 1 9.998 1.54zm0 1.5A6.96 6.96 0 0 0 3.04 9.998a6.96 6.96 0 0 0 6.958 6.958 6.96 6.96 0 0 0 6.958-6.958A6.96 6.96 0 0 0 9.998 3.04zm1.92 4.4a.75.75 0 1 1 1.161.95l-3.75 4.583a.75.75 0 0 1-1.111.055l-1.667-1.667a.75.75 0 0 1 1.061-1.061l1.08 1.08 3.226-3.941z",
  },
  {
    title: "Sign out",
    path: "M17.707 3.21a.75.75 0 0 1 .75.75v12.083a.75.75 0 0 1-1.5 0V3.96a.75.75 0 0 1 .75-.75zM10.51 5.93a.75.75 0 0 1 1.061 0l2.952 2.952c.618.618.618 1.621 0 2.239l-2.952 2.952a.75.75 0 1 1-1.061-1.061l2.261-2.262-10.481.001a.75.75 0 0 1-.743-.648l-.007-.102a.75.75 0 0 1 .75-.75l10.481-.001L10.51 6.99a.75.75 0 0 1-.073-.977l.073-.084z",
  },
];

function UserDropdown() {
  return (
    <Menu className="relative" as="div">
      <MenuButton className="flex justify-center items-center size-10 p-0.75 border border-transparent rounded-full overflow-hidden cursor-pointer transition-colors data-[hover]:border-[#121212]/10 data-[active]:border-[#121212]/10">
        <Image
          className="size-8 rounded-full object-cover"
          src="/images/avatars/1.png"
          width={32}
          height={32}
          quality={100}
          alt="Avatar"
        />
      </MenuButton>
      <MenuItems
        className="z-30 w-55 p-2 rounded-[1.25rem] bg-[#fcfcfc] outline-none shadow-2xl [--anchor-gap:0.75rem] [--anchor-offset:0.5rem] origin-top transition duration-200 ease-out after:absolute after:inset-0 after:rounded-[1.25rem] after:border after:border-[#E5E5E5] after:mask-b-from-0% after:pointer-events-none data-[closed]:scale-95 data-[closed]:opacity-0"
        anchor="bottom end"
        transition
        modal={false}
      >
        {navigation.map((item, index) => (
          <MenuItem
            className="flex items-center w-full gap-3.5 h-10 px-2.5 rounded-xl text-[0.75rem] font-semibold fill-[#7B7B7B] cursor-pointer transition-colors hover:bg-[#F1F1F1] hover:fill-[#000] nth-4:relative nth-4:mb-4 nth-4:after:absolute nth-4:after:top-[calc(100%+0.5rem)] nth-4:after:-left-2 nth-4:after:-right-2 nth-4:after:h-0.25 nth-4:after:bg-[#F4F4F4] nth-4:after:pointer-events-none"
            key={index}
            as="button"
          >
            <svg
              className="size-5 fill-inherit"
              width={20}
              height={20}
              viewBox="0 0 20 20"
            >
              <path d={item.path} />
            </svg>
            {item.title}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}

export default UserDropdown;
