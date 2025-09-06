import { useState } from "react";

function Search({}) {
  const [search, setSearch] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(search);
  };

  return (
    <div className="p-3 border-t border-[#ececec]">
      <form className="relative" onSubmit={handleSubmit}>
        <button className="absolute top-1 left-1 bottom-1 z-2 w-8 fill-[#7B7B7B] transition-colors cursor-pointer hover:fill-[#121212]">
          <svg
            className="size-4 fill-inherit"
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <path d="M9.147 2a7.15 7.15 0 0 1 7.147 7.147 7.12 7.12 0 0 1-1.406 4.257l-.056.07 2.887 2.887a.96.96 0 0 1 .093 1.25l-.093.108a.96.96 0 0 1-1.358 0l-2.887-2.887-.07.056c-1.121.833-2.471 1.326-3.899 1.397l-.359.009A7.15 7.15 0 0 1 2 9.147 7.15 7.15 0 0 1 9.147 2zm0 1.92A5.23 5.23 0 0 0 3.92 9.147a5.23 5.23 0 0 0 5.227 5.227c1.406 0 2.721-.556 3.696-1.531s1.531-2.29 1.531-3.696A5.23 5.23 0 0 0 9.147 3.92z" />
          </svg>
        </button>
        <input
          className="w-full h-10 pl-12 pr-14 border-0 outline-0 bg-transparent text-[0.75rem] leading-[1rem] font-medium text-[#121212] placeholder:text-[#7B7B7B]/80"
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
        <div className="absolute top-1/2 right-2.5 -translate-y-1/2 px-1.5 py-0.5 bg-[#f1f1f1] rounded-md shadow-[0_0px_0px_1px_rgba(0,0,0,0.11),0px_2px_0.8px_0px_rgba(255,255,255,0.27)_inset,0px_-1px_0.6px_0px_rgba(0,0,0,0.20)_inset,0px_1px_4.2px_-1px_rgba(0,0,0,0.25)] text-[0.6875rem] leading-[1rem] font-medium text-[#7b7b7b]">
          ⌘ K
        </div>
      </form>
    </div>
  );
}

export default Search;
