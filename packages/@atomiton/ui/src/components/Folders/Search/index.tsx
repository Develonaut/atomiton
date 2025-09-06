type Props = {
  search: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const Search = ({ search, onChange, handleSubmit }: Props) => {
  return (
    <form className="relative mb-2" onSubmit={handleSubmit}>
      <button className="absolute top-1 left-1 bottom-1 z-2 flex items-center justify-center w-8 rounded-lg fill-[#7B7B7B] cursor-pointer transition-all hover:bg-[#FCFCFC] hover:shadow-[0px_0px_4px_0px_rgba(18,18,18,0.10)] hover:fill-[#000]">
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
        className="w-full h-10 pl-12 pr-3 border border-[#E2E2E2] outline-0 bg-[#f8f7f7] rounded-xl shadow-[0px_1px_3px_0px_rgba(18,18,18,0.10)_inset] text-[0.75rem] font-medium text-[#000] placeholder:text-[#7B7B7B] transition-colors hover:border-[#7b7b7b]/50"
        type="text"
        placeholder="Search files..."
        value={search}
        onChange={onChange}
        autoComplete="off"
      />
    </form>
  );
};

export default Search;
