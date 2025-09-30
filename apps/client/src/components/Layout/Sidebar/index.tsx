import Icon from "#components/Icon";
import Image from "#components/Image";
import Dropdown, { DropdownItem } from "#components/Layout/Sidebar/Dropdown";
import Folders from "#components/Layout/Sidebar/Folders";
import NavLink from "#components/Layout/Sidebar/NavLink";
import { Link } from "#router";

import { folders } from "#components/Layout/Sidebar/navigation";

type Props = {
  visible: boolean;
  onClose: () => void;
};

function Sidebar({ visible, onClose }: Props) {
  return (
    <div
      className={`fixed top-0 left-0 bottom-0 z-10 w-55 border-r bg-surface-01 border-s-01 max-lg:z-50 max-lg:shadow-popover max-lg:w-62 max-lg:transition-transform max-lg:duration-300 max-md:w-full ${
        visible ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
      }`}
    >
      <div className="p-6 max-lg:flex">
        <Link to="/">
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
          <Dropdown title="Explore" icon="compass" href="/explore">
            <DropdownItem href="/explore/designs">Designs</DropdownItem>
            <DropdownItem href="/explore/animations">Animations</DropdownItem>
          </Dropdown>

          <Dropdown title="Assets" icon="package" counter={112}>
            <DropdownItem href="/assets/3d-objects">3D Objects</DropdownItem>
            <DropdownItem href="/assets/materials">Materials</DropdownItem>
          </Dropdown>

          <NavLink title="Likes" icon="heart" href="/likes" />

          {import.meta.env.DEV && (
            <Dropdown title="Debug" icon="bug" href="/debug/environment">
              <DropdownItem href="/debug/nodes">Nodes</DropdownItem>
              <DropdownItem href="/debug/flows">Flows</DropdownItem>
              <DropdownItem href="/debug/auth">Auth</DropdownItem>
            </Dropdown>
          )}
        </div>
        <div className="">
          <div className="p-2.5 text-secondary/70">My scenes</div>
          <NavLink title="My Scenes" icon="box" href="/" />
          <Folders folders={folders} />
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
