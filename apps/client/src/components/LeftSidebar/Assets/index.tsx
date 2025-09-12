import core from "@atomiton/core";
import { useNodes } from "@atomiton/editor";
import Accordion from "./Accordion";

function Assets() {
  const { addNode } = useNodes();
  const categories = core.nodes.getCategories();

  return (
    <>
      {categories.map((category, index) => (
        <Accordion
          key={category.name}
          title={category.displayName}
          items={category.items.map((item, itemIndex: number) => ({
            ...item,
            id: index * 100 + itemIndex, // Generate unique numeric id for compatibility
            nodeType: item.type, // Map type to nodeType for compatibility
            title: item.name, // Map name to title for display
            icon: item.icon || "circle", // Use icon name directly
          }))}
          onAddNode={addNode}
        />
      ))}
    </>
  );
}

export default Assets;
