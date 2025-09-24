import { content } from "#components/SceneAndAssetsSidebar/Scene/content";
import Item from "#components/SceneAndAssetsSidebar/Scene/Item";
import { useState } from "react";

function Scene() {
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
}

export default Scene;
