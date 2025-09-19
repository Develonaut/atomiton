import "@testing-library/jest-dom";
import { vi } from "vitest";

// ReactFlow needs ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// ReactFlow needs matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ReactFlow needs DOMRect for bounding box calculations
global.DOMRect = vi.fn().mockImplementation(() => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON: vi.fn(),
}));

// Add the static fromRect method that DOMRect requires
global.DOMRect.fromRect = vi
  .fn()
  .mockImplementation(
    (rect) => new global.DOMRect(rect?.x, rect?.y, rect?.width, rect?.height),
  );

// ReactFlow needs getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
  bottom: 0,
  height: 100,
  left: 0,
  right: 100,
  top: 0,
  width: 100,
  x: 0,
  y: 0,
  toJSON: vi.fn(),
});

// ReactFlow needs getComputedStyle
window.getComputedStyle = vi.fn().mockReturnValue({
  getPropertyValue: vi.fn().mockReturnValue(""),
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi
  .fn()
  .mockImplementation((cb) => setTimeout(cb, 0));
global.cancelAnimationFrame = vi.fn();

// Mock performance.now for timing
global.performance = global.performance || {};
global.performance.now = vi.fn(() => Date.now());
