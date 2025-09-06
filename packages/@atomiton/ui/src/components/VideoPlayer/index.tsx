import { useState } from "react";

type Props = {
  className?: string;
  repeat?: boolean;
  transparent?: boolean;
};

function VideoPlayer({ className, repeat, transparent }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      className={`flex items-center h-11 pl-2.5 pr-3.5 rounded-3xl ${
        transparent
          ? ""
          : "border border-[#ececec] bg-[#fcfcfc] shadow-[0_6px_3px_0_rgba(0,0,0,0.01),0_3px_3px_0_rgba(0,0,0,0.02),0_1px_1px_0_rgba(0,0,0,0.02)]"
      } ${className || ""}`}
    >
      <button
        className="group flex items-center justify-center size-6 mr-3 cursor-pointer"
        onClick={handlePlay}
      >
        <svg
          className={`size-4 transition-colors group-hover:fill-[#121212] ${
            transparent
              ? "fill-[#fcfcfc] group-hover:fill-[#fcfcfc]/80"
              : "fill-[#7b7b7b] group-hover:fill-[#121212]"
          }`}
          width={20}
          height={20}
          viewBox="0 0 20 20"
        >
          <path
            d={
              isPlaying
                ? "M5 6.333C5 5.321 5.839 4.5 6.875 4.5s1.875.821 1.875 1.833v7.333c0 1.012-.839 1.833-1.875 1.833S5 14.679 5 13.667V6.333zm6.25 0c0-1.013.839-1.833 1.875-1.833S15 5.321 15 6.333v7.333c0 1.012-.839 1.833-1.875 1.833s-1.875-.821-1.875-1.833V6.333z"
                : "M4 5.756C4 2.778 7.306.988 9.8 2.616l6.512 4.251c2.267 1.48 2.267 4.801 0 6.28L9.8 17.398c-2.494 1.628-5.8-.161-5.8-3.14V5.756z"
            }
          />
        </svg>
      </button>
      <div
        className={`relative grow min-w-45 h-0.75 rounded-full max-md:w-auto max-md:grow ${
          transparent ? "bg-[#FCFCFC]/20" : "bg-[#7B7B7B]/20"
        }`}
      >
        <div
          className={`absolute top-0 left-0 bottom-0 rounded-full after:absolute after:top-0 after:right-0 after:bottom-0 after:w-1.25 after:rounded-full ${
            transparent
              ? "bg-[#FCFCFC]/30 after:bg-[#fcfcfc]"
              : "bg-[#7B7B7B]/30 after:bg-[#121212]"
          }`}
          style={{ width: "40%" }}
        ></div>
      </div>
      <div
        className={`shrink-0 w-6 ml-4 text-[0.75rem] font-semibold ${
          transparent ? "text-[#FCFCFC]" : "text-[#7B7B7B]"
        }`}
      >
        8s
      </div>
      {repeat && (
        <button
          className={`flex items-center justify-center size-8 ml-1.5 -mr-2 rounded-full cursor-pointer transition-colors ${
            transparent
              ? "fill-[#fcfcfc] hover:bg-[#fcfcfc]/20"
              : "bg-[#f1f1f1] hover:bg-[#7b7b7b]/20"
          }`}
        >
          <svg
            className="size-4 fill-inherit"
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <path d="M15.94 2c1.414 0 2.56 1.133 2.56 2.532v8.506c0 1.398-1.146 2.532-2.56 2.532l-3.788-.001.931.85c.34.31.39.815.137 1.182l-.085.106a.93.93 0 0 1-1.302.052l-2.663-2.43c-.385-.351-.397-.948-.027-1.314l2.663-2.633a.93.93 0 0 1 1.303 0c.36.356.36.933 0 1.289l-1.09 1.076 3.92.001c.356 0 .652-.257.707-.594l.009-.115V4.532c0-.391-.321-.709-.717-.709H4.06c-.396 0-.717.317-.717.709v8.506c0 .392.321.709.717.709h2.048c.509 0 .922.408.922.911s-.413.911-.922.911H4.06c-1.414 0-2.56-1.134-2.56-2.532V4.532C1.5 3.133 2.646 2 4.06 2h11.88z" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default VideoPlayer;
