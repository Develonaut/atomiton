import core from "@atomiton/core";
import { useNodes } from "@atomiton/editor";
import Item from "./Item";

function Scene() {
  const { nodes, selectedId, selectNode, deleteNode } = useNodes();

  const handleDelete = (nodeId: string) => {
    if (deleteNode) {
      deleteNode(nodeId);
    } else {
      console.log("Delete node:", nodeId);
    }
  };

  return (
    <div className="flex flex-col gap-1 p-3">
      {nodes.map((node) => {
        const nodeMetadata = core.nodes.getNodeMetadata(node.type);

        return (
          <Item
            key={node.id}
            item={{
              id: node.id,
              title: nodeMetadata?.name || `Node ${node.id}`,
              type: node.type,
              icon: nodeMetadata?.icon || "circle",
            }}
            selected={selectedId === node.id}
            onClick={() => selectNode(node.id)}
            onDelete={handleDelete}
          />
        );
      })}
    </div>
  );
}

export default Scene;
