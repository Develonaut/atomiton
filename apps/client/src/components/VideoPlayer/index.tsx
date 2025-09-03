import Icon from "@/components/Icon";

type Props = {
  className?: string;
};

const VideoPlayer = ({ className }: Props) => {
  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 flex items-center h-11 px-3.5 border border-s-01 bg-surface-01 rounded-3xl shadow-depth-01 ${
        className || ""
      }`}
    >
      <button className="group">
        <Icon
          className="!size-4 fill-secondary transition-colors group-hover:fill-primary"
          name="play-fill"
        />
      </button>
      <div className="relative w-45 h-0.75 mx-4 bg-secondary/20 rounded-full max-md:w-auto max-md:grow">
        <div
          className="absolute top-0 left-0 bottom-0 bg-secondary/30 rounded-full after:absolute after:top-0 after:right-0 after:bottom-0 after:bg-primary after:w-1.25 after:rounded-full"
          style={{ width: "40%" }}
        ></div>
      </div>
      <div className="w-6 text-body-md-str text-secondary">8s</div>
      <button className="size-8 ml-1.5 -mr-2 bg-surface-03 rounded-full">
        <Icon className="!size-4" name="repeat" />
      </button>
    </div>
  );
};

export default VideoPlayer;
