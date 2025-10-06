import Item from "#components/LeftSidebar/Scene/Item";
import { useEditorNodes } from "@atomiton/editor";

function Scene() {
  const { nodes } = useEditorNodes();

  return (
    <div className="flex flex-col gap-1 p-3">
      {nodes.map((node: { id: string }) => (
        <Item key={node.id} nodeId={node.id} />
      ))}
    </div>
  );
}

export default Scene;
