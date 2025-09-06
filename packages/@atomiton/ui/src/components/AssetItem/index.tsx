import Image from "@/components/Image";

type Props = {
  value: {
    image: string;
    fullSizeImage: boolean;
  };
};

function AssetItem({ value }: Props) {
  return (
    <div className="group relative flex justify-center items-center size-15 rounded-[0.625rem] bg-[#F1F1F1] border border-[#ECECEC] overflow-hidden transition-colors cursor-pointer hover:border-[#C4C4C4] hover:bg-[#fcfcfc]">
      <Image
        className={value.fullSizeImage ? "size-full object-cover" : "size-11"}
        src={value.image}
        width={value.fullSizeImage ? 60 : 44}
        height={value.fullSizeImage ? 60 : 44}
        alt=""
      />
      <button className="absolute top-0.5 right-0.5 z-2 flex justify-center items-center size-4 rounded-full bg-gradient-to-b from-[#323232] to-[#121212] opacity-0 cursor-pointer transition-opacity group-hover:opacity-100">
        <svg
          className="size-3 fill-white"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        >
          <path d="M10 4a.95.95 0 0 1 .947.947v4.105h4.105a.95.95 0 0 1 .939.819L16 10a.95.95 0 0 1-.947.947h-4.105v4.105a.95.95 0 0 1-.819.939L10 16a.95.95 0 0 1-.947-.947v-4.105H4.947a.95.95 0 0 1-.939-.819L4 10a.95.95 0 0 1 .947-.947h4.105V4.947a.95.95 0 0 1 .819-.939L10 4z" />
        </svg>
      </button>
    </div>
  );
}

export default AssetItem;
