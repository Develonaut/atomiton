import Link from "@/components/Link";
import Image from "@/components/Image";
import NavLink from "./NavLink";
import Dropdown from "./Dropdown";
import Folders from "./Folders";

import { navigation, folders } from "./navigation";

function Sidebar() {
  return (
    <div className="flex flex-col w-60 min-h-219 bg-[#FCFCFC] border-r border-[#ECECEC]">
      <div className="p-6">
        <Link href="/">
          <Image
            className="opacity-100"
            src="/images/logo.svg"
            width={145}
            height={32}
            alt="Logo"
          />
        </Link>
      </div>
      <div className="px-5 pb-5 overflow-y-auto scrollbar-none">
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
          <div className="p-2.5 text-[0.75rem] font-medium text-[#7b7b7b]/70">
            My scenes
          </div>
          <NavLink
            value={{
              title: "My Scenes",
              iconPath:
                "M8.69 2.07c.736-.414 1.634-.414 2.37 0L16.268 5c.761.428 1.232 1.233 1.232 2.106v5.785c0 .873-.471 1.678-1.232 2.106l-5.208 2.93c-.736.414-1.634.414-2.37 0l-5.208-2.93c-.761-.428-1.232-1.233-1.232-2.106V7.106c0-.873.471-1.678 1.232-2.106L8.69 2.07zM3.75 7.413v5.478c0 .331.179.637.467.799l4.908 2.76v-6.013L3.75 7.413zm12.25 0l-5.375 3.024v6.013l4.908-2.76c.253-.142.421-.394.459-.676l.008-.123V7.413zm-5.676-4.035c-.279-.157-.62-.157-.899 0L4.53 6.131l5.345 3.007 5.344-3.007-4.895-2.753z",
              active: false,
            }}
          />
          <Folders folders={folders} />
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
