import Image from "@/components/Image";
import Logo from "@/components/Logo";

function HeaderMinimal() {
  const isNewNotification = true;

  return (
    <div className="flex items-center gap-4 w-full h-20 px-5 bg-[#FCFCFC]">
      <Logo className="mr-auto" onlyIcon />
      <button className="relative flex justify-center items-center size-10 rounded-xl border border-transparent transition-all cursor-pointer hover:bg-[#f1f1f1]">
        <svg
          className="size-5 fill-primary"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        >
          <path d="M9.147 2a7.15 7.15 0 0 1 7.147 7.147 7.12 7.12 0 0 1-1.406 4.257l-.056.07 2.887 2.887a.96.96 0 0 1 .093 1.25l-.093.108a.96.96 0 0 1-1.358 0l-2.887-2.887-.07.056c-1.121.833-2.471 1.326-3.899 1.397l-.359.009A7.15 7.15 0 0 1 2 9.147 7.15 7.15 0 0 1 9.147 2zm0 1.92A5.23 5.23 0 0 0 3.92 9.147a5.23 5.23 0 0 0 5.227 5.227c1.406 0 2.721-.556 3.696-1.531s1.531-2.29 1.531-3.696A5.23 5.23 0 0 0 9.147 3.92z" />
        </svg>
      </button>
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

export default HeaderMinimal;
