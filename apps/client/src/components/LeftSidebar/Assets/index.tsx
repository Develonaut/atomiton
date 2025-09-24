import Accordion from "#components/LeftSidebar/Assets/Accordion";
import { useAddNode } from "@atomiton/editor";
import { getNodeDefinitionsGroupedByCategory } from "@atomiton/nodes/definitions";

function Assets() {
  const { addNode } = useAddNode();
  const nodesByCategory = getNodeDefinitionsGroupedByCategory();

  return (
    <div data-testid="node-palette">
      {nodesByCategory.map((category, index) => (
        <Accordion
          key={category.name}
          title={category.title}
          items={category.items.map((item, itemIndex: number) => ({
            id: index * 100 + itemIndex, // Generate unique numeric id for compatibility
            nodeType: item.metadata.type, // Use type as the node type
            title: item.metadata.name, // Map name to title for display
            category: item.metadata.category, // Add required category property
            icon: item.metadata.icon || "zap", // Use icon name directly
            description: item.metadata.description, // Add description if available
          }))}
          onAddNode={addNode}
        />
      ))}
    </div>
  );
}

export default Assets;
