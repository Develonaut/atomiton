import Image from "@/components/Image";

type Props = {
  value: {
    title: string;
    image: string;
  };
};

const ExploreCard = ({ value }: Props) => {
  return (
    <div className="group relative overflow-hidden rounded-3xl">
      <div className="cursor-pointer">
        <Image
          src={value.image}
          className="inline-block align-top w-full h-auto"
          width={360}
          height={288}
          alt={value.title}
        />
      </div>
      <div className="absolute left-0 right-0 bottom-0 h-24 bg-gradient-to-t from-[#171717]/100 to-[#171717]/0 opacity-0 transition-opacity pointer-events-none group-hover:opacity-45"></div>
      <div className="absolute left-0 right-0 bottom-0 z-2 flex items-center p-3 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="relative z-1 mr-auto p-2.5 text-[0.75rem] leading-[1rem] font-semibold text-[#FCFCFC]">
          {value.title}
        </div>
        <div className="relative z-1 flex gap-1 shrink-0">
          <button className="flex justify-center items-center size-9 border border-transparent rounded-[0.625rem] transition-colors cursor-pointer hover:bg-[#fcfcfc]/15 hover:border-[#fcfcfc]/25">
            <svg
              className="size-4 fill-[#FCFCFC]"
              width={20}
              height={20}
              viewBox="0 0 20 20"
            >
              <path d="M8.08 18a.96.96 0 1 1 0-1.92h.96V3.92H3.92v1.173a.96.96 0 0 1-.83.951l-.13.009a.96.96 0 0 1-.96-.96V2.96A.96.96 0 0 1 2.96 2H10h7.04a.96.96 0 0 1 .951.83l.009.13v2.133a.96.96 0 1 1-1.92 0V3.92h-5.12v12.16h.96a.96.96 0 0 1 .951.83l.009.13a.96.96 0 0 1-.96.96H10 8.08z" />
            </svg>
          </button>
          <button className="flex justify-center items-center size-9 border border-transparent rounded-[0.625rem] transition-colors cursor-pointer hover:bg-[#fcfcfc]/15 hover:border-[#fcfcfc]/25">
            <svg
              className="size-4 fill-[#FCFCFC]"
              width={20}
              height={20}
              viewBox="0 0 20 20"
            >
              <path d="M15.94 2c1.414 0 2.56 1.133 2.56 2.532v8.506c0 1.398-1.146 2.532-2.56 2.532l-3.788-.001.931.85c.34.31.39.815.137 1.182l-.085.106a.93.93 0 0 1-1.302.052l-2.663-2.43c-.385-.351-.397-.948-.027-1.314l2.663-2.633a.93.93 0 0 1 1.303 0c.36.356.36.933 0 1.289l-1.09 1.076 3.92.001c.356 0 .652-.257.707-.594l.009-.115V4.532c0-.391-.321-.709-.717-.709H4.06c-.396 0-.717.317-.717.709v8.506c0 .392.321.709.717.709h2.048c.509 0 .922.408.922.911s-.413.911-.922.911H4.06c-1.414 0-2.56-1.134-2.56-2.532V4.532C1.5 3.133 2.646 2 4.06 2h11.88z" />
            </svg>
          </button>
          <button className="flex justify-center items-center size-9 border border-transparent rounded-[0.625rem] transition-colors cursor-pointer hover:bg-[#fcfcfc]/15 hover:border-[#fcfcfc]/25">
            <svg
              className="size-4 fill-[#FCFCFC]"
              width={20}
              height={20}
              viewBox="0 0 20 20"
            >
              <path d="M10.137 3.308c2.84-2.175 6.607-1.109 7.907 2.139 1.535 3.836-1.049 8.561-7.68 12.287a.75.75 0 0 1-.735 0C2.998 14.009.415 9.283 1.949 5.447c1.299-3.248 5.067-4.313 7.907-2.139l.14.112.141-.112zm6.514 2.696c-1.01-2.524-4.007-3.194-6.12-1.046a.75.75 0 0 1-1.069 0C7.35 2.81 4.352 3.48 3.342 6.004c-1.164 2.91.818 6.726 6.354 10.035l.3.176.301-.176c5.428-3.245 7.439-6.976 6.419-9.863l-.065-.172z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExploreCard;
