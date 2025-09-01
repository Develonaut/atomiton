import { useState } from "react";
import Item from "./Item";

import { content } from "./content";

const Scene = () => {
  const [selected, setSelected] = useState(4);

  return (
    <div className="flex flex-col gap-1 p-3">
      {content.map((item) => (
        <Item
          item={item}
          key={item.id}
          selected={selected}
          onClick={() => setSelected(item.id)}
        />
      ))}
    </div>
  );
};

export default Scene;
