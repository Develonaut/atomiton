type Props = {
  className?: string;
  vertical?: boolean;
};

const ViewController = ({ className, vertical }: Props) => (
  <div
    className={`absolute flex items-center gap-3 bg-[#fcfcfc] border border-[#ececec] rounded-full shadow-[0_6px_3px_0_rgba(0,0,0,0.01),0_3px_3px_0_rgba(0,0,0,0.02),0_1px_1p_ 0_rgba(0,0,0,0.02)] ${
      vertical
        ? "top-1/2 right-full flex-col-reverse w-11 mr-3 py-5 -translate-y-1/2"
        : "left-1/2 bottom-full flex-row h-11 mb-4 px-5 -translate-x-1/2"
    } ${className || ""}`}
  >
    <button>
      <svg
        className={`size-4 fill-[#7b7b7b] ${
          vertical ? "rotate-90" : "rotate-180"
        }`}
        width={20}
        height={20}
        viewBox="0 0 20 20"
      >
        <path d="M12.183 4.3a.75.75 0 0 1 1.061 0l3.44 3.441a3.25 3.25 0 0 1 0 4.596l-3.44 3.441a.75.75 0 0 1-1.061-1.061l3.441-3.441a1.75 1.75 0 0 0 .298-.397l.043-.091H3.13a.75.75 0 0 1-.743-.648l-.007-.102a.75.75 0 0 1 .75-.75h12.836l-.044-.09c-.052-.095-.114-.186-.184-.272l-.114-.125-3.44-3.441a.75.75 0 0 1 0-1.061z" />
      </svg>
    </button>
    <div className={`flex items-center gap-2 ${vertical ? "flex-col" : ""}`}>
      <span
        className={`bg-[#121212]/30 rounded-full ${
          vertical ? "w-2 h-[0.09375rem]" : "w-[0.09375rem] h-2"
        }`}
      ></span>
      <span
        className={`bg-[#121212] rounded-full ${
          vertical ? "w-3.5 h-[0.09375rem]" : "w-[0.09375rem] h-3.5"
        }`}
      ></span>
      <span
        className={`bg-[#121212]/30 rounded-full ${
          vertical ? "w-2 h-[0.09375rem]" : "w-[0.09375rem] h-2"
        }`}
      ></span>
      <span
        className={`bg-[#121212]/30 rounded-full ${
          vertical ? "w-2 h-[0.09375rem]" : "w-[0.09375rem] h-2"
        }`}
      ></span>
      <span
        className={`bg-[#121212]/30 rounded-full ${
          vertical ? "w-2 h-[0.09375rem]" : "w-[0.09375rem] h-2"
        }`}
      ></span>
      <span
        className={`bg-[#121212] rounded-full ${
          vertical ? "w-3.5 h-[0.09375rem]" : "w-[0.09375rem] h-3.5"
        }`}
      ></span>
      <span
        className={`bg-[#121212]/30 rounded-full ${
          vertical ? "w-2 h-[0.09375rem]" : "w-[0.09375rem] h-2"
        }`}
      ></span>
    </div>
    <button>
      <svg
        className={`size-4 ${vertical ? "-rotate-90" : ""}`}
        width={20}
        height={20}
        viewBox="0 0 20 20"
      >
        <path d="M12.183 4.3a.75.75 0 0 1 1.061 0l3.44 3.441a3.25 3.25 0 0 1 0 4.596l-3.44 3.441a.75.75 0 0 1-1.061-1.061l3.441-3.441a1.75 1.75 0 0 0 .298-.397l.043-.091H3.13a.75.75 0 0 1-.743-.648l-.007-.102a.75.75 0 0 1 .75-.75h12.836l-.044-.09c-.052-.095-.114-.186-.184-.272l-.114-.125-3.44-3.441a.75.75 0 0 1 0-1.061z" />
      </svg>
    </button>
  </div>
);

export default ViewController;
