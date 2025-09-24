import Folder from "#components/Folder";
import NewFolder from "#components/NewFolder";
import Search from "#Search";
import { useState } from "react";

import { folders } from "#folders";

function Folders() {
  const [search, setSearch] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement actual folder search functionality
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
}

export default Folders;
