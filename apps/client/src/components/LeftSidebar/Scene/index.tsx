import { useEditorNodes } from "@atomiton/editor";
import Item from "./Item";

function Scene() {
  const { nodes } = useEditorNodes();

  return (
    <div className="flex flex-col gap-1 p-3">
      {nodes.map((node) => (
        <Item key={node.id} nodeId={node.id} />
      ))}
    </div>
  );
}

export default Scene;
