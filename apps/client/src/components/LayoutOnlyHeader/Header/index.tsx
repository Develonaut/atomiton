import { useState } from "react";
import { usePathname } from "@/router/hooks";
import Link from "@/router/Link";
import Image from "@/components/Image";
import Notifications from "@/components/Notifications";
import User from "@/components/User";
import Search from "@/components/Search";
import Icon from "@/components/Icon";
import { useScrollbarWidth } from "@/hooks";

type Props = {
  className?: string;
};

function Header({ className }: Props) {
  const [visibleSearch, setVisibleSearch] = useState(false);
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const { hasOverflowHidden } = useScrollbarWidth();

  const isActiveExploreDetails = pathname.includes("/explore/details");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(search);
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-20 flex items-center h-20 px-5 bg-surface-01 border-b border-s-01 ${
        hasOverflowHidden
          ? "right-[calc(0px+var(--scrollbar-width))]"
          : "right-0"
      } ${className || ""}`}
    >
      <Link href="/">
        <Image
          className="opacity-100"
          src="/images/logo-text.svg"
          width={145}
          height={32}
          alt="Logo"
        />
      </Link>
      <div className="flex items-center gap-4 ml-auto">
        {!isActiveExploreDetails &&
          (visibleSearch ? (
            <Search
              className="max-md:hidden"
              search={search}
              onChange={(e) => setSearch(e.target.value)}
              handleSubmit={handleSubmit}
            />
          ) : (
            <button
              className="size-10 rounded-xl outline-0 transition-colors hover:bg-surface-03 max-md:hidden"
              onClick={() => setVisibleSearch(true)}
            >
              <Icon name="search" />
            </button>
          ))}
        <Notifications />
        <User />
      </div>
    </div>
  );
}

export default Header;
