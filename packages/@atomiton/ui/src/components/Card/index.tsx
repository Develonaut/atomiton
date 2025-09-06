import { useClipboard } from "@/utils/clipboard";

type Props = {
  className?: string;
  title?: string;
  span?: 1 | 2 | 3 | 4 | 5 | 6;
  center?: boolean;
  centerHorizontal?: boolean;
  children: React.ReactNode | string;
  isGray?: boolean;
  copyText?: string;
};

function Card({
  className,
  title,
  span = 1,
  center,
  centerHorizontal,
  children,
  isGray,
  copyText,
}: Props) {
  const { copy, isCopied } = useClipboard();

  const handleCopy = async () => {
    const success = await copy(copyText || "");
    if (success) {
      console.log("Link copied to clipboard!");
    } else {
      console.log("Failed to copy to clipboard");
    }
  };
  return (
    <div
      className={`group relative mt-2 mx-1 border border-[#ECECEC] ${
        span > 3 ? "rounded-[1.375rem]" : "rounded-2xl"
      } ${
        span === 2
          ? "w-[calc(50%-0.5rem)] max-[1023px]:w-[calc(100%-0.5rem)]"
          : span === 3
            ? "w-[calc(33.333%-0.5rem)] max-[1259px]:w-[calc(50%-0.5rem)] max-[1023px]:w-[calc(100%-0.5rem)]"
            : span === 4
              ? "w-[calc(25%-0.5rem)] max-[1259px]:w-[calc(33.333%-0.5rem)] max-[1023px]:w-[calc(50%-0.5rem)]"
              : span === 5
                ? "w-[calc(20%-0.5rem)] max-[1259px]:w-[calc(25%-0.5rem)] max-[1023px]:w-[calc(50%-0.5rem)]"
                : span === 6
                  ? "w-[calc(16.666%-0.5rem)] max-[1419px]:w-[calc(20%-0.5rem)] max-[1259px]:w-[calc(25%-0.5rem)] max-[1023px]:w-[calc(33.333%-0.5rem)]"
                  : "w-[calc(100%-0.5rem)]"
      } ${center ? "flex justify-center items-center" : ""} ${
        centerHorizontal ? "flex justify-center items-start" : ""
      } ${isGray ? "bg-[#F8F7F7]" : ""} ${className || ""}`}
    >
      {title && (
        <div
          className={`absolute top-2 left-2 z-2 px-3 py-1 border rounded-xl text-[0.6875rem] leading-[1rem] font-medium ${
            isGray
              ? "bg-[#FCFCFC] border-[#ECECEC]"
              : "bg-[#F1F1F1] border-transparent"
          }`}
        >
          {title}
        </div>
      )}
      {copyText && (
        <button
          className="absolute top-1.75 right-2 z-3 flex justify-center items-center size-7 rounded-full bg-[#FCFCFC] shadow-[0px_0px_12px_-1px_rgba(0,0,0,0.23)] invisible opacity-0 transition-all cursor-pointer hover:bg-[#f8f7f7] group-hover:visible group-hover:opacity-100"
          onClick={handleCopy}
        >
          <svg className="size-4" width={16} height={16} viewBox="0 0 16 16">
            <path
              d={
                isCopied
                  ? "M12.422 3.522a.75.75 0 0 1 1.156.956l-6.622 8a.75.75 0 0 1-1.024.125l-3.378-2.5a.75.75 0 1 1 .892-1.206l2.807 2.077 6.169-7.452z"
                  : "M11.5 1.75a2.75 2.75 0 0 1 2.75 2.75v4.34a2.75 2.75 0 0 1-2.75 2.75l.08-.003-.002.08a2.75 2.75 0 0 1-2.577 2.577l-.168.005H4.5a2.75 2.75 0 0 1-2.75-2.75V7.167a2.75 2.75 0 0 1 2.75-2.75l-.082.001.004-.086a2.75 2.75 0 0 1 2.577-2.577l.168-.005H11.5zM8.833 5.917H4.5a1.25 1.25 0 0 0-1.25 1.25V11.5a1.25 1.25 0 0 0 1.25 1.25h4.333a1.25 1.25 0 0 0 1.25-1.25V7.167a1.25 1.25 0 0 0-1.25-1.25zM11.5 3.25H7.167a1.25 1.25 0 0 0-1.25 1.25l.004-.084 2.912.001a2.75 2.75 0 0 1 2.745 2.582l.005.168v2.918l.045-.001a1.25 1.25 0 0 0 1.116-1.116l.006-.128V4.5a1.25 1.25 0 0 0-1.25-1.25z"
              }
            />
          </svg>
        </button>
      )}
      {children}
    </div>
  );
}

export default Card;
