import type { NodeItem } from "@atomiton/core";
import core from "@atomiton/core";
import { useElements } from "@atomiton/editor";
import Accordion from "./Accordion";

function Assets() {
  const { addElement } = useElements();
  const categories = core.nodes.getCategories();

  return (
    <>
      {categories.map((category, index) => (
        <Accordion
          key={category.name}
          title={category.displayName}
          titleButton="Add Node"
          items={category.items.map((item: NodeItem, itemIndex: number) => ({
            ...item,
            id: index * 100 + itemIndex, // Generate unique numeric id for compatibility
            icon: item.icon || "circle", // Use icon name directly
          }))}
          onAddNode={addElement}
        />
      ))}
    </>
  );
}

export default Assets;
