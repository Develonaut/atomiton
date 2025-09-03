import Button from "@/components/Button";
import Logo from "@/components/Logo";
import NotificationsDropdown from "./NotificationsDropdown";
import UserDropdown from "./UserDropdown";
import { useScrollbarWidth } from "@/hooks";

type Props = {
  onOpen: () => void;
};

const HeaderSimple = ({ onOpen }: Props) => {
  const { hasOverflowHidden } = useScrollbarWidth();
  return (
    <div
      className={`fixed top-0 left-55 right-0 z-10 flex justify-end items-center gap-4 h-20 px-5 border-b border-[#ECECEC] bg-[#FCFCFC] max-[1023px]:left-0 max-[1023px]:justify-stretch ${
        hasOverflowHidden
          ? "right-[calc(0px+var(--scrollbar-width))]"
          : "right-0"
      }`}
    >
      <div className="hidden items-center gap-4 mr-auto max-[1023px]:flex">
        <button
          className="flex flex-col justify-center items-center gap-1 size-8 cursor-pointer [&_span]:w-6 [&_span]:h-0.5 [&_span]:bg-[#121212] [&_span]:rounded-full"
          onClick={onOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <Logo />
      </div>
      <NotificationsDropdown />
      <Button isPrimary as="a" href="https://brainwave2-app.vercel.app/create">
        Create
      </Button>
      <UserDropdown />
    </div>
  );
};

export default HeaderSimple;
