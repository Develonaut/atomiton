import Image from "next/image";

type Props = {
  image: string;
};

const AssetCard = ({ image }: Props) => {
  return (
    <>
      <div className="group relative w-65.5 aspect-square p-6 bg-[#F8F7F7] border border-[#ECECEC] rounded-[1.25rem] overflow-hidden transition-colors hover:bg-[#F1F1F1]">
        <div className="flex justify-center items-center cursor-pointer">
          <Image
            className="w-full"
            src={image}
            width={214}
            height={214}
            alt=""
          />
        </div>
        <div className="absolute left-0 right-0 bottom-0 h-24 bg-gradient-to-t from-[#171717]/100 to-[#171717]/0 opacity-0 transition-opacity pointer-events-none group-hover:opacity-30"></div>
        <button className="absolute top-2 right-2 z-2 flex justify-center items-center size-10 bg-[#FCFCFC] border border-[#DBDBDB] rounded-xl cursor-pointer shadow-[0px_16px_4px_0px_rgba(0,0,0,0.00),0px_10px_4px_0px_rgba(0,0,0,0.00),0px_6px_3px_0px_rgba(0,0,0,0.01),0px_3px_3px_0px_rgba(0,0,0,0.02),0px_1px_1px_0px_rgba(0,0,0,0.02)] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#F8F7F7]">
          <svg className="size-4" width={20} height={20} viewBox="0 0 20 20">
            <path d="M10.005 2.38a.75.75 0 0 1 .75.75v6.125h6.125a.75.75 0 0 1 .743.648l.007.102a.75.75 0 0 1-.75.75h-6.125v6.125a.75.75 0 0 1-.648.743l-.102.007a.75.75 0 0 1-.75-.75v-6.125H3.13a.75.75 0 0 1-.743-.648l-.007-.102a.75.75 0 0 1 .75-.75h6.125V3.13a.75.75 0 0 1 .648-.743l.102-.007z" />
          </svg>
        </button>
        <button className="absolute left-2 bottom-2 z-2 flex justify-center items-center size-10 opacity-0 border border-transparent rounded-xl transition-colors cursor-pointer hover:bg-[#FCFCFC]/15 hover:border-[#FCFCFC]/25 group-hover:opacity-100">
          <svg
            className="size-4 fill-[#FCFCFC]"
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <path d="M16.043 16.957a.75.75 0 1 1 0 1.5H3.96a.75.75 0 1 1 0-1.5h12.083zM10.002 1.54a.75.75 0 0 1 .75.75l-.001 10.481 2.262-2.261a.75.75 0 0 1 .977-.073l.084.073a.75.75 0 0 1 0 1.061l-2.952 2.952c-.618.618-1.621.618-2.239 0L5.93 11.57A.75.75 0 1 1 6.99 10.51l2.261 2.261.001-10.481a.75.75 0 0 1 .648-.743l.102-.007z" />
          </svg>
        </button>
        <button className="absolute right-2 bottom-2 z-2 flex items-center gap-1.5 h-10 px-3 border border-transparent rounded-xl text-[0.875rem] leading-[1.25rem] tracking-[-0.02em] font-semibold text-[#FCFCFC] transition-colors opacity-0 cursor-pointer hover:bg-[#FCFCFC]/15 hover:border-[#FCFCFC]/25 group-hover:opacity-100">
          <svg
            className="size-4 fill-[#FCFCFC]"
            width={16}
            height={16}
            viewBox="0 0 16 16"
          >
            <path d="M7.617 3.032c0-1.09 1.298-1.658 2.099-.918l5.43 5.023a1.25 1.25 0 0 1 0 1.835l-5.43 5.023c-.8.74-2.099.173-2.099-.918l-.001-1.933-.208.004c-3.416.078-4.379.565-5.211 2.102l-.073.138-.073.142-.124.248-.055.111c-.354.708-1.421.456-1.421-.335 0-5.947 1.793-8.325 6.998-8.563l.168-.007.001-1.953zm1.499.571l.001 1.785a1.09 1.09 0 0 1-1.074 1.086c-3.81.061-5.423 1.105-5.916 4.281l-.031.212.043-.036c1.09-.89 2.689-1.239 5.549-1.287l.336-.004c.6-.005 1.093.48 1.093 1.082l-.001 1.784 4.813-4.451-4.813-4.452z" />
          </svg>
          Share
        </button>
      </div>
    </>
  );
};

export default AssetCard;
