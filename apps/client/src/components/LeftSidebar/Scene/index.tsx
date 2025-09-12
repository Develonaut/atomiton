import core, { type NodeType } from "@atomiton/core";
import { useNodes, useStore } from "@atomiton/editor";
import Item from "./Item";

function Scene() {
  const { nodes, selectedId, selectNode, deleteNode } = useNodes();
  const flowInstance = useStore((state) => state.flowInstance);

  const handleDelete = (nodeId: string) => {
    if (deleteNode) {
      deleteNode(nodeId);
    }
    // If deleteNode is not available, the operation is silently ignored
  };

  const handleNodeClick = (nodeId: string) => {
    // Select the node in the state
    selectNode(nodeId);

    // Focus on the node in the canvas
    if (flowInstance) {
      setTimeout(() => {
        flowInstance.fitView({
          nodes: [{ id: nodeId }],
          duration: 200,
          padding: 0.2,
        });
      }, 50);
    }
  };

  return (
    <div className="flex flex-col gap-1 p-3">
      {nodes.map((node) => {
        if (!node.type) return null;

        const nodeMetadata = core.nodes.getNodeMetadata(node.type as NodeType);

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
            onClick={() => handleNodeClick(node.id)}
            onDelete={handleDelete}
          />
        );
      })}
    </div>
  );
}

export default Scene;
