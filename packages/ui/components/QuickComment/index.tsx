import Image from "next/image";
import Comment from "./Comment";

const QuickComment = () => {
  return (
    <div className="w-92 p-1 bg-[#FCFCFC] rounded-[1.25rem] shadow-2xl">
      <div className="flex items-center gap-3 mb-2 p-3">
        <button className="flex justify-center items-center size-9 border border-[#ECECEC] rounded-[0.625rem] cursor-pointer transition-colors hover:bg-[#F1F1F1]">
          <svg className="size-4" width={20} height={20} viewBox="0 0 20 20">
            <path d="M3.275 3.275a.94.94 0 0 1 1.33 0L10 8.671l5.395-5.395a.94.94 0 0 1 1.224-.091l.105.091a.94.94 0 0 1 0 1.33L11.329 10l5.396 5.395a.94.94 0 0 1 .091 1.224l-.091.105a.94.94 0 0 1-1.33 0L10 11.329l-5.394 5.396a.94.94 0 0 1-1.224.091l-.105-.091a.94.94 0 0 1 0-1.33L8.671 10 3.275 4.605a.94.94 0 0 1-.091-1.224l.091-.105z" />
          </svg>
        </button>
        <div className="grow">
          <div className="text-[0.875rem] leading-[1.25rem] font-semibold text-[#121212]">
            Shop House Icon
          </div>
          <div className="text-[0.6875rem] leading-[1rem] font-medium text-[#7B7B7B]">
            3D Objects
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center mb-2 bg-[#F1F1F1] border border-[#E2E2E2] rounded-2xl overflow-hidden">
        <Image
          src="/images/3d-objects/2.png"
          width={264}
          height={264}
          alt="3D Object"
        />
      </div>
      <Comment />
    </div>
  );
};

export default QuickComment;
