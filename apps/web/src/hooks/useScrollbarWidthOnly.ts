import { useEffect } from "react";

/**
 * Hook for managing scrollbar width CSS variable
 * Sets --scrollbar-width CSS variable on document element
 */
export const useScrollbarWidthOnly = () => {
  useEffect(() => {
    const updateScrollbarWidth = () => {
      // Calculate and set scrollbar width CSS variable
      const scrollWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty(
        "--scrollbar-width",
        `${scrollWidth}px`,
      );
    };

    // Initial calculation
    updateScrollbarWidth();

    // Update on window resize
    window.addEventListener("resize", updateScrollbarWidth);

    return () => {
      window.removeEventListener("resize", updateScrollbarWidth);
      document.documentElement.style.removeProperty("--scrollbar-width");
    };
  }, []);
};
