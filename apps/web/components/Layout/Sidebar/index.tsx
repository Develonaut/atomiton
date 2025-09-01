import Link from "next/link";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import NavLink from "./NavLink";
import Dropdown from "./Dropdown";
import Folders from "./Folders";

import { navigation, folders } from "./navigation";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const Sidebar = ({ visible, onClose }: Props) => {
  return (
    <div
      className={`fixed top-0 left-0 bottom-0 z-10 w-55 border-r bg-surface-01 border-s-01 max-lg:z-50 max-lg:shadow-popover max-lg:w-62 max-lg:transition-transform max-lg:duration-300 max-md:w-full ${
        visible ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
      }`}
    >
      <div className="p-6 max-lg:flex">
        <Link href="/">
          <Image
            className="opacity-100"
            src="/images/logo-text.svg"
            width={145}
            height={32}
            alt="Logo"
          />
        </Link>
        <button
          className="hidden size-8 ml-auto max-lg:inline-block"
          onClick={onClose}
        >
          <Icon className="fill-secondary" name="close" />
        </button>
      </div>
      <div className="px-5 pb-5 h-[calc(100svh-5rem)] overflow-y-auto scrollbar-none">
        <div className="flex flex-col gap-0.5 mb-3">
          {navigation.map((item) =>
            item.list ? (
              <Dropdown key={item.title} value={item} />
            ) : (
              <NavLink key={item.title} value={item} />
            ),
          )}
        </div>
        <div className="">
          <div className="p-2.5 text-secondary/70">My scenes</div>
          <NavLink
            value={{
              title: "My Scenes",
              icon: "cube-think",
              href: "/",
            }}
          />
          <Folders folders={folders} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
