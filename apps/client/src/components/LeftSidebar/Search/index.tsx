import Icon from "@/components/Icon";
import { useState } from "react";

const Search = () => {
  const [search, setSearch] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(search);
  };

  return (
    <div className="p-3 border-t border-s-01">
      <form className="relative" onSubmit={handleSubmit}>
        <button className="absolute top-1 left-1 bottom-1 z-2 w-8 fill-secondary transition-colors hover:fill-primary">
          <Icon className="!size-4 fill-inherit" name="search" />
        </button>
        <input
          className="w-full h-10 pl-12 pr-14 border-0 outline-0 bg-transparent text-body-md text-primary placeholder:text-secondary"
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
        <div className="key absolute top-1/2 right-2.5 -translate-y-1/2">
          ⌘ K
        </div>
      </form>
    </div>
  );
};

export default Search;
