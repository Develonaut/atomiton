import Icon from "@/components/Icon";

type Props = {
  className?: string;
  vertical?: boolean;
};

function ViewController({ className, vertical }: Props) {
  return (
    <div
      className={`absolute flex items-center gap-3 bg-surface-01 border border-s-01 rounded-full shadow-depth-01 ${
        vertical
          ? "top-1/2 right-full flex-col-reverse w-11 mr-3 py-5 -translate-y-1/2"
          : "left-1/2 bottom-full flex-row h-11 mb-4 px-5 -translate-x-1/2"
      } ${className || ""}`}
    >
      <button>
        <Icon
          className={`!size-4 fill-secondary ${
            vertical ? "rotate-90" : "rotate-180"
          }`}
          name="arrow"
        />
      </button>
      <div className={`flex items-center gap-2 ${vertical ? "flex-col" : ""}`}>
        <span
          className={`bg-primary/30 rounded-full ${
            vertical ? "w-2 h-[0.09375rem]" : "w-[0.09375rem] h-2"
          }`}
        ></span>
        <span
          className={`bg-primary rounded-full ${
            vertical ? "w-3.5 h-[0.09375rem]" : "w-[0.09375rem] h-3.5"
          }`}
        ></span>
        <span
          className={`bg-primary/30 rounded-full ${
            vertical ? "w-2 h-[0.09375rem]" : "w-[0.09375rem] h-2"
          }`}
        ></span>
        <span
          className={`bg-primary/30 rounded-full ${
            vertical ? "w-2 h-[0.09375rem]" : "w-[0.09375rem] h-2"
          }`}
        ></span>
        <span
          className={`bg-primary/30 rounded-full ${
            vertical ? "w-2 h-[0.09375rem]" : "w-[0.09375rem] h-2"
          }`}
        ></span>
        <span
          className={`bg-primary rounded-full ${
            vertical ? "w-3.5 h-[0.09375rem]" : "w-[0.09375rem] h-3.5"
          }`}
        ></span>
        <span
          className={`bg-primary/30 rounded-full ${
            vertical ? "w-2 h-[0.09375rem]" : "w-[0.09375rem] h-2"
          }`}
        ></span>
      </div>
      <button>
        <Icon
          className={`!size-4 ${vertical ? "-rotate-90" : ""}`}
          name="arrow"
        />
      </button>
    </div>
  );
}

export default ViewController;
