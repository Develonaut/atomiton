import Image from "@/components/Image";

type Props = {
  video: boolean;
};

function Preview({ video }: Props) {
  return (
    <div className="relative mt-6 border border-[#323232]/10 rounded-xl bg-[#f8f7f7] overflow-hidden">
      <button className="group absolute top-1.5 right-1.5 z-1 flex items-center justify-center size-6 bg-[#fcfcfc] rounded-md cursor-pointer shadow-[0_1.25px_3px_0px_rgba(50,50,50,0.10),0_1.25px_1px_0px_#FFF_inset]">
        <svg
          className={`fill-[#7B7B7B] transition-colors group-hover:fill-[#121212] ${
            video ? "size-3" : "size-4"
          }`}
          width={20}
          height={20}
          viewBox="0 0 20 20"
        >
          <path
            d={
              video
                ? "M4 5.756C4 2.778 7.306.988 9.8 2.616l6.512 4.251c2.267 1.48 2.267 4.801 0 6.28L9.8 17.398c-2.494 1.628-5.8-.161-5.8-3.14V5.756z"
                : "M10.833 3.333c0-.46.373-.833.833-.833h4.167c.92 0 1.667.746 1.667 1.667v4.167c0 .46-.373.833-.833.833s-.833-.373-.833-.833V5.345l-3.577 3.577c-.325.325-.853.325-1.179 0s-.325-.853 0-1.179l3.577-3.577h-2.988c-.46 0-.833-.373-.833-.833zm-7.5 7.5c.46 0 .833.373.833.833v2.988l3.577-3.577c.325-.325.853-.325 1.179 0s.325.853 0 1.179l-3.577 3.577h2.988c.46 0 .833.373.833.833s-.373.833-.833.833H4.167c-.92 0-1.667-.746-1.667-1.667v-4.167c0-.46.373-.833.833-.833z"
            }
          />
        </svg>
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
