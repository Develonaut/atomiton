import core from "@atomiton/core";
import { useNodes } from "@atomiton/editor";
import type { INodeMetadata } from "@atomiton/nodes";
import { useEffect, useState } from "react";
import Accordion from "./Accordion";

function Assets() {
  const { addNode } = useNodes();
  const [categories, setCategories] = useState<
    Array<{
      name: string;
      displayName: string;
      items: INodeMetadata[];
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    core.nodes
      .getCategoriesMetadata()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading nodes...</div>;
  }

  console.log(categories);

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
