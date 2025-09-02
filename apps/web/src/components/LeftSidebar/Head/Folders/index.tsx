import { useState } from "react";
import NewFolder from "@/components/NewFolder";
import Folder from "@/components/Folder";
import Search from "./Search";

import { folders } from "./folders";

const Folders = () => {
  const [search, setSearch] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(search);
  };

  return (
    <div className="">
      <Search
        search={search}
        onChange={(e) => setSearch(e.target.value)}
        handleSubmit={handleSubmit}
      />
      <NewFolder />
      <div className="flex flex-col">
        {folders.map((folder, index) => (
          <Folder item={folder} key={index} />
        ))}
      </div>
    </div>
  );
};

export default Folders;
