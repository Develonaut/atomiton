import Icon from "@/components/Icon";
import Image from "@/components/Image";

type Props = {
  video: boolean;
};

function Preview({ video }: Props) {
  return (
    <div className="relative mt-6 border border-shade-07/10 rounded-xl bg-surface-02 overflow-hidden">
      <button className="group absolute top-1.5 right-1.5 z-1 size-6 bg-surface-01 rounded-md shadow-[0_1.25px_3px_0px_rgba(50,50,50,0.10),0_1.25px_1px_0px_#FFF_inset]">
        <Icon
          className={`fill-secondary transition-colors group-hover:fill-primary ${
            video ? "!size-3" : "!size-4"
          }`}
          name={video ? "play-fill" : "expand"}
        />
      </button>
      <Image
        className="w-full"
        src="/images/preview-image.png"
        width={136}
        height={96}
        alt="Preview"
      />
    </div>
  );
}

export default Preview;
