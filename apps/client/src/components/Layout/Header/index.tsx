import { useState } from "react";
import { usePathname } from "@/router/hooks";
import Link from "@/router/Link";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import Notifications from "@/components/Notifications";
import { Button } from "@atomiton/ui";
import User from "@/components/User";
import Filters from "@/components/Filters";
import Search from "@/components/Search";
import { useScrollbarWidth } from "@/hooks";

type Props = {
  onOpen: () => void;
};

function Header({ onOpen }: Props) {
  const [search, setSearch] = useState("");
  const disabled = true;
  const pathname = usePathname();
  const { hasOverflowHidden } = useScrollbarWidth();

  const isActiveExplore = pathname.includes("/explore");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement actual search functionality
  };

  return (
    <div
      className={`fixed top-0 left-55 z-20 flex items-center h-20 px-5 bg-surface-01 border-b border-s-01 max-lg:left-0 ${
        hasOverflowHidden
          ? "right-[calc(0px+var(--scrollbar-width))]"
          : "right-0"
      }`}
    >
      <div className="hidden items-center gap-4 mr-2 max-lg:flex max-md:gap-3">
        <button
          className="flex flex-col justify-center items-center gap-1 size-8 [&_span]:w-6 [&_span]:h-0.5 [&_span]:bg-primary [&_span]:rounded-full"
          onClick={onOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <Link href="/">
          <Image
            className="opacity-100"
            src="/images/logo.svg"
            width={40}
            height={40}
            alt="Logo"
          />
        </Link>
      </div>
      <div className="flex gap-2 max-lg:hidden">
        <button
          className={`btn-icon size-10 rounded-[0.625rem] ${
            disabled ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          <Icon className="fill-primary rotate-180" name="arrow" />
        </button>
        <button className="btn-icon size-10 rounded-[0.625rem]">
          <Icon className="fill-primary" name="arrow" />
        </button>
      </div>
      <Search
        className="max-md:hidden"
        search={search}
        onChange={(e) => setSearch(e.target.value)}
        handleSubmit={handleSubmit}
      />
      <div className="flex items-center gap-4 ml-auto max-md:gap-3">
        {isActiveExplore && <Filters onlyBtnIcon />}
        <Notifications />
        {!isActiveExplore && (
          <Button isPrimary as="link" href="/create">
            Create
          </Button>
        )}
        <User />
      </div>
    </div>
  );
}

export default Header;
