import { useCallback } from "react";

export function useDragHandlers(
  onDrop?: (event: React.DragEvent) => void,
  onDragOver?: (event: React.DragEvent) => void,
) {
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      onDrop?.(event);
    },
    [onDrop],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Safely set dropEffect, handling cases where it might be read-only
      try {
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = "move";
        }
      } catch (error) {
        // Some browsers or scenarios may have read-only dataTransfer properties
        // We can safely ignore this error as the drag operation can still proceed
      }

      onDragOver?.(event);
    },
    [onDragOver],
  );

  return { handleDrop, handleDragOver };
}
