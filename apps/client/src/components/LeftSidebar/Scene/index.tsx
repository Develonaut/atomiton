import { useEditorNodes } from "@atomiton/editor";
import Item from "./Item";

function Scene() {
  const { nodes } = useEditorNodes();

  return (
    <div className="flex flex-col gap-1 p-3">
      {nodes.map((item) => (
        <Item item={item} key={item.id} selected={item.selected} />
      ))}
    </div>
  );
}

export default Scene;
