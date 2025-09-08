import { useAvailableNodes } from "@/hooks/useAvailableNodes";
import { useElements } from "@atomiton/editor";
import Accordion from "./Accordion";
import type { NodeItem } from "@atomiton/core";

function Assets() {
  const { nodeCategories, loading, error } = useAvailableNodes();
  const { addElement } = useElements();

  if (loading) {
    return (
      <div className="p-4 text-center text-secondary">
        Loading available nodes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-error">
        Failed to load nodes: {error.message}
      </div>
    );
  }

  if (nodeCategories.length === 0) {
    return (
      <div className="p-4 text-center text-secondary">No nodes available</div>
    );
  }

  return (
    <>
      {nodeCategories.map((category, index) => (
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
