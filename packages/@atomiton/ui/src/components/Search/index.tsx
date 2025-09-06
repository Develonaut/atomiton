type Props = {
  className?: string;
  classInput?: string;
  search: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

function Search({
  className,
  classInput,
  search,
  onChange,
  handleSubmit,
}: Props) {
  return (
    <form
      className={`group relative ${className || ""}`}
      onSubmit={handleSubmit}
    >
      <button className="absolute top-1 left-1 bottom-1 z-2 flex items-center justify-center cursor-pointer w-8 fill-[#7B7B7B] transition-colors group-hover:fill-[#000]">
        <svg
          className="size-4 fill-inherit"
          width={16}
          height={16}
          viewBox="0 0 16 16"
        >
          <path d="M7.333 1.75c3.084 0 5.583 2.5 5.583 5.583 0 1.219-.393 2.377-1.098 3.326l-.043.055 2.255 2.256a.75.75 0 0 1 .073.977l-.073.084a.75.75 0 0 1-1.061 0l-2.256-2.255-.055.043a5.56 5.56 0 0 1-3.046 1.091l-.28.007c-3.084 0-5.583-2.5-5.583-5.583S4.25 1.75 7.333 1.75zm0 1.5c-2.255 0-4.083 1.828-4.083 4.083s1.828 4.083 4.083 4.083c1.098 0 2.126-.435 2.887-1.196s1.196-1.789 1.196-2.887c0-2.255-1.828-4.083-4.083-4.083z" />
        </svg>
      </button>
      <input
        className={`w-full h-10 px-12 border border-transparent bg-[#FCFCFC] rounded-xl text-[0.75rem] leading-[1rem] font-medium text-[#000] transition-all placeholder:text-[#7B7B7B] hover:border-[#ECECEC] focus:border-[#F1F1F1] focus:bg-[#F1F1F1] focus:shadow-[0px_1px_3px_0px_rgba(18,18,18,0.10)_inset] ${
          classInput || ""
        }`}
        type="text"
        placeholder="Search..."
        value={search}
        onChange={onChange}
        autoComplete="off"
      />
      <div className="absolute top-1/2 right-2.5 -translate-y-1/2 px-1.5 py-0.5 bg-[#F1F1F1] rounded-md shadow-[0_0px_0px_1px_rgba(0,0,0,0.11),0px_2px_0.8px_0px_rgba(255,255,255,0.27)_inset,0px_-1px_0.6px_0px_rgba(0,0,0,0.20)_inset,0px_1px_4.2px_-1px_rgba(0,0,0,0.25)] text-[0.75rem] leading-[1rem] font-medium text-[#7B7B7B]">
        ⌘ K
      </div>
    </form>
  );
}

export default Search;
