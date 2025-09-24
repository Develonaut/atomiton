/**
 * Utility functions for managing scrollbar width
 */

/**
 * Calculate and set the scrollbar width CSS variable
 */
export function setScrollbarWidth(): void {
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty(
    "--scrollbar-width",
    `${scrollbarWidth}px`,
  );
}

/**
 * Remove the scrollbar width CSS variable
 */
export function removeScrollbarWidth(): void {
  document.documentElement.style.removeProperty("--scrollbar-width");
}

/**
 * Get the current scrollbar width
 */
export function getScrollbarWidth(): number {
  return window.innerWidth - document.documentElement.clientWidth;
}