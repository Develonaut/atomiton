import { useState } from "react";
import Image from "@/components/Image";
import Search from "@/components/Search";
import Button from "@/components/Button";
import Logo from "@/components/Logo";

type Props = {
  className?: string;
  isFilters?: boolean;
  isShowSearch?: boolean;
};

function HeaderSimple({ className, isFilters, isShowSearch }: Props) {
  const disabled = true;
  const isNewNotification = true;
  const [search, setSearch] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(search);
  };

  return (
    <div
      className={`flex items-center gap-4 h-20 px-5 bg-[#FCFCFC] ${
        className || ""
      }`}
    >
      {isShowSearch && <Logo className="mr-auto" />}
      {!isShowSearch && (
        <div className="flex gap-2 max-lg:hidden">
          <button
            className={`flex justify-center items-center size-10 border border-transparent rounded-[0.625rem] fill-[#7b7b7b] transition-all cursor-pointer hover:bg-[#f1f1f1] hover:fill-[#121212] hover:shadow-[0px_-1px_3px_0px_rgba(18,18,18,0.15)_inset,0px_1.25px_1px_0px_#FFF_inset] hover:border-[#E2E2E2] ${
              disabled ? "opacity-40 pointer-events-none" : ""
            }`}
          >
            <svg
              className="size-5 fill-inherit rotate-180"
              width={20}
              height={20}
              viewBox="0 0 20 20"
            >
              <path d="M12.183 4.3a.75.75 0 0 1 1.061 0l3.44 3.441a3.25 3.25 0 0 1 0 4.596l-3.44 3.441a.75.75 0 0 1-1.061-1.061l3.441-3.441a1.75 1.75 0 0 0 .298-.397l.043-.091H3.13a.75.75 0 0 1-.743-.648l-.007-.102a.75.75 0 0 1 .75-.75h12.836l-.044-.09c-.052-.095-.114-.186-.184-.272l-.114-.125-3.44-3.441a.75.75 0 0 1 0-1.061z" />
            </svg>
          </button>
          <button className="flex justify-center items-center size-10 border border-transparent rounded-[0.625rem] fill-[#7b7b7b] transition-all cursor-pointer hover:bg-[#f1f1f1] hover:fill-[#121212] hover:shadow-[0px_-1px_3px_0px_rgba(18,18,18,0.15)_inset,0px_1.25px_1px_0px_#FFF_inset] hover:border-[#E2E2E2]">
            <svg
              className="size-5 fill-inherit"
              width={20}
              height={20}
              viewBox="0 0 20 20"
            >
              <path d="M12.183 4.3a.75.75 0 0 1 1.061 0l3.44 3.441a3.25 3.25 0 0 1 0 4.596l-3.44 3.441a.75.75 0 0 1-1.061-1.061l3.441-3.441a1.75 1.75 0 0 0 .298-.397l.043-.091H3.13a.75.75 0 0 1-.743-.648l-.007-.102a.75.75 0 0 1 .75-.75h12.836l-.044-.09c-.052-.095-.114-.186-.184-.272l-.114-.125-3.44-3.441a.75.75 0 0 1 0-1.061z" />
            </svg>
          </button>
        </div>
      )}
      <Search
        className={`w-65 ${isShowSearch ? "ml-auto" : "mr-auto"}`}
        classInput="!bg-[#F8F7F7] !border-[#E2E2E2]"
        search={search}
        onChange={(e) => setSearch(e.target.value)}
        handleSubmit={handleSubmit}
      />
      {isFilters && (
        <button className="relative flex justify-center items-center size-10 rounded-xl border border-transparent transition-all cursor-pointer hover:bg-[#f1f1f1]">
          <svg
            className="size-5 fill-primary"
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <path d="M14.48 2C16.424 2 18 3.5 18 5.346c0 .887-.371 1.738-1.031 2.365l-3.62 3.437a1.48 1.48 0 0 0-.469 1.074v3.854a.92.92 0 0 1-.703.878l-3.84 1.013c-.612.161-1.217-.275-1.217-.878v-4.867a1.48 1.48 0 0 0-.469-1.074l-3.62-3.437C2.371 7.084 2 6.232 2 5.346 2 3.5 3.576 2 5.52 2h8.96zm0 1.823H5.52c-.882 0-1.6.683-1.6 1.523 0 .403.169.791.469 1.076l3.62 3.437c.66.627 1.031 1.477 1.031 2.363v3.668l1.92-.507v-3.161c0-.806.306-1.581.858-2.187l.173-.176 3.62-3.437c.3-.284.469-.672.469-1.076 0-.84-.718-1.523-1.6-1.523z" />
          </svg>
        </button>
      )}
      <button
        className={`relative flex justify-center items-center size-10 rounded-xl border border-transparent transition-all cursor-pointer hover:bg-[#f1f1f1] ${
          isNewNotification
            ? "after:absolute after:top-1 after:right-1 after:size-1 after:bg-[#fe5938] after:rounded-full"
            : ""
        }`}
      >
        <svg
          className="size-5 fill-primary"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        >
          <path d="M9.149 1.683c.852-1.272 2.787-.651 2.787.894v3.749l4.033.001c1.18 0 1.896 1.307 1.338 2.335l-.08.132-6.376 9.522c-.852 1.272-2.787.651-2.787-.894l-.001-3.751-4.032.001c-1.18 0-1.896-1.307-1.338-2.336l.08-.132 6.376-9.522zm.952 1.904l-5.489 8.196 3.757.001c.791 0 1.442.619 1.521 1.413l.008.161-.001 3.053 5.489-8.196-3.756.001c-.791 0-1.442-.619-1.521-1.413l-.008-.161V3.587z" />
        </svg>
      </button>
      {!isFilters && !isShowSearch && <Button isPrimary>Create</Button>}
      <button className="flex justify-center items-center size-10 p-0.75 border border-transparent rounded-full overflow-hidden cursor-pointer transition-colors hover:border-[#121212]/10">
        <Image
          className="size-8 rounded-full object-cover"
          src="/images/avatars/1.png"
          width={32}
          height={32}
          priority={true}
          quality={100}
          alt="Avatar"
        />
      </button>
    </div>
  );
}

export default HeaderSimple;
