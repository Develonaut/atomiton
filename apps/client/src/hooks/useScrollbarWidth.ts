import { useEffect, useState } from "react";
import { setScrollbarWidth, removeScrollbarWidth } from "#utils/scrollbar";

/**
 * Hook for managing scrollbar width and overflow state
 * @returns object with hasOverflowHidden state
 */
export const useScrollbarWidth = () => {
  const [hasOverflowHidden, setHasOverflowHidden] = useState(false);

  useEffect(() => {
    const updateStates = () => {
      // Update overflow state
      const htmlElement = document.documentElement;
      const isOverflowHidden =
        window.getComputedStyle(htmlElement).overflow === "hidden";
      setHasOverflowHidden(isOverflowHidden);

      // Update scrollbar width using reliable utility
      setScrollbarWidth();
    };

    // Initial calculation
    updateStates();

    // Observer for style changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "style") {
          updateStates();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    // Debounced resize handler for better performance
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateStates, 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
      removeScrollbarWidth();
    };
  }, []);

  return { hasOverflowHidden };
};
