import { useEffect, useState } from "react";

/**
 * Hook for tracking overflow state of document element
 * @returns boolean indicating if overflow is hidden
 */
export const useOverflowState = () => {
  const [hasOverflowHidden, setHasOverflowHidden] = useState(false);

  useEffect(() => {
    const updateOverflowState = () => {
      const htmlElement = document.documentElement;
      const isOverflowHidden =
        window.getComputedStyle(htmlElement).overflow === "hidden";
      setHasOverflowHidden(isOverflowHidden);
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "style") {
          updateOverflowState();
        }
      });
    });

    // Initial check
    updateOverflowState();

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => observer.disconnect();
  }, []);

  return hasOverflowHidden;
};
