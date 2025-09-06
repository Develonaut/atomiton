const SceneCardSkeleton = () => (
  <div className="group flex flex-col w-65 p-2 border border-[#ECECEC] bg-[#FCFCFC] rounded-3xl">
    <div className="relative mb-2 aspect-[1.309] bg-[#F8F7F7] rounded-2xl"></div>
    <div className="grow p-3 max-md:p-1">
      <div className="mb-1 p-1">
        <div className="w-32 h-2 bg-[#F1F1F1] rounded-[2px]"></div>
      </div>
      <div className="p-1">
        <div className="w-18 h-2 bg-[#F1F1F1] rounded-[2px]"></div>
      </div>
    </div>
  </div>
);

export default SceneCardSkeleton;
