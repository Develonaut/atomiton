import { useElements } from "@atomiton/editor";
import Item from "./Item";

function Scene() {
  const { elements, selectedId, selectElement, deleteElement } = useElements();

  // Transform elements into the format expected by Item component
  const sceneItems = elements.map((element) => ({
    id: element.id,
    title:
      element.data?.label || element.data?.title || `Element ${element.id}`,
    type: element.type || "default",
    icon: element.data?.icon || element.icon || "circle",
  }));

  const handleDelete = (elementId: string) => {
    if (deleteElement) {
      deleteElement(elementId);
    } else {
      console.log("Delete element:", elementId);
    }
  };

  return (
    <div className="flex flex-col gap-1 p-3">
      {sceneItems.map((item) => (
        <Item
          item={item}
          key={item.id}
          selected={selectedId === item.id}
          onClick={() => selectElement(item.id)}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

export default Scene;
