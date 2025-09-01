/**
 * Calculates the width of the scrollbar more reliably
 * @returns scrollbar width in pixels
 */
export const getScrollbarWidth = (): number => {
  // Method 1: Standard calculation
  const standardWidth =
    window.innerWidth - document.documentElement.clientWidth;

  if (standardWidth > 0) {
    return standardWidth;
  }

  // Method 2: Create temporary element to measure
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  outer.style.position = "absolute";
  outer.style.top = "0";
  outer.style.left = "0";
  document.body.appendChild(outer);

  const inner = document.createElement("div");
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

  document.body.removeChild(outer);

  return Math.max(0, scrollbarWidth);
};

/**
 * Sets the scrollbar width CSS variable on document element
 * @param width - width to set (optional, will calculate if not provided)
 */
export const setScrollbarWidth = (width?: number): void => {
  const scrollbarWidth = width ?? getScrollbarWidth();
  document.documentElement.style.setProperty(
    "--scrollbar-width",
    `${scrollbarWidth}px`,
  );
};

/**
 * Removes the scrollbar width CSS variable from document element
 */
export const removeScrollbarWidth = (): void => {
  document.documentElement.style.removeProperty("--scrollbar-width");
};
