import Image from "next/image";

type Props = {
  value: {
    title: string;
    description: string;
    images: string;
  };
};

const ExploreCardSm = ({ value }: Props) => (
  <div className="flex items-center shrink-0 w-59 p-2 bg-[#F8F7F7] rounded-[1.25rem] border border-[#ECECEC] transition-all cursor-pointer hover:shadow-xl hover:bg-[#FCFCFC] hover:border-[#E2E2E2]">
    <div className="shrink-0">
      <Image
        className="rounded-xl"
        src={value.images}
        width={64}
        height={64}
        alt={value.title}
      />
    </div>
    <div className="pl-4 w-[calc(100%-4rem)]">
      <div className="text-[0.75rem] leading-[1rem] font-semibold">
        {value.title}
      </div>
      <div className="mt-1 text-[0.75rem] leading-[1rem] font-medium text-[#7B7B7B]">
        {value.description}
      </div>
    </div>
  </div>
);

export default ExploreCardSm;
