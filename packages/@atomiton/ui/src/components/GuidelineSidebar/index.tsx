import Link from "#components/Link";
import Image from "#components/Image";
import { usePathname } from "#hooks/usePathname";

type Props = {
  className?: string;
  content: {
    id: number;
    title: string;
    items: {
      id: number;
      title: string;
      iconPath: string;
      href: string;
    }[];
  }[];
  onClose?: () => void;
};

function Sidebar({ className, content, onClose }: Props) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <div
      className={`flex flex-col w-60 min-h-219 bg-[#FCFCFC] border-r border-[#ECECEC] ${
        className || ""
      }`}
    >
      <div className="flex items-center p-6 max-[1023px]:pr-4">
        <Link href="/">
          <Image
            className="opacity-100"
            src="/images/logo.svg"
            width={145}
            height={32}
            alt="Logo"
          />
        </Link>
        {onClose && (
          <button
            className="hidden size-8 ml-auto cursor-pointer max-[1023px]:inline-block"
            onClick={onClose}
          >
            <svg
              className="size-5 fill-[#7b7b7b]"
              width={20}
              height={20}
              viewBox="0 0 20 20"
            >
              <path d="M3.275 3.275a.94.94 0 0 1 1.33 0L10 8.671l5.395-5.395a.94.94 0 0 1 1.224-.091l.105.091a.94.94 0 0 1 0 1.33L11.329 10l5.396 5.395a.94.94 0 0 1 .091 1.224l-.091.105a.94.94 0 0 1-1.33 0L10 11.329l-5.394 5.396a.94.94 0 0 1-1.224.091l-.105-.091a.94.94 0 0 1 0-1.33L8.671 10 3.275 4.605a.94.94 0 0 1-.091-1.224l.091-.105z" />
            </svg>
          </button>
        )}
      </div>
      <div className="grow px-5 pb-5 overflow-y-auto scrollbar-none">
        {content.map((group) => (
          <div className="mb-3 last:mb-0" key={group.id}>
            <div className="mb-0.5 p-2.5 text-[0.75rem] leading-[1rem] font-medium text-[#7b7b7b]/70">
              {group.title}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <Link
                  className={`group flex items-center gap-3 p-1 rounded-xl text-[0.75rem] leading-[1rem] font-semibold text-[#121212] transition-colors hover:bg-[#F1F1F1] ${
                    isActive(item.href) ? "bg-[#F1F1F1]" : ""
                  }`}
                  key={item.id}
                  href={item.href}
                >
                  <div
                    className={`flex items-center justify-center size-8 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? "bg-[#FCFCFC] shadow-[0px_0px_4px_0px_rgba(18,18,18,0.10)]"
                        : ""
                    }`}
                  >
                    <svg
                      className={`size-5 fill-[#7B7B7B] transition-colors group-hover:fill-[#121212] ${
                        isActive(item.href) ? "fill-[#121212]" : ""
                      }`}
                      width={20}
                      height={20}
                      viewBox="0 0 20 20"
                    >
                      <path d={item.iconPath} />
                    </svg>
                  </div>
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
