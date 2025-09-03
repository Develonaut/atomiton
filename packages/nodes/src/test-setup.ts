/**
 * Test Setup - Global test configuration and mocks
 */

import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to hide logs during tests
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock AbortController if not available
if (!global.AbortController) {
  global.AbortController = class AbortController {
    signal: AbortSignal;

    constructor() {
      this.signal = {
        aborted: false,
        onabort: null,
        reason: undefined,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        throwIfAborted: vi.fn(),
      } as AbortSignal;
    }

    abort() {
      (this.signal as { aborted: boolean }).aborted = true;
    }
  };
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}
  observe(_target: Element) {}
  unobserve(_target: Element) {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver
  implements IntersectionObserver
{
  root = null;
  rootMargin = "";
  thresholds = [];

  constructor(
    _callback: IntersectionObserverCallback,
    _options?: IntersectionObserverInit,
  ) {}
  observe(_target: Element) {}
  unobserve(_target: Element) {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Set up fake timers
vi.useFakeTimers();

// Custom matchers
expect.extend({
  toBeValidNodePackage(received: unknown) {
    let pass = false;
    if (received && typeof received === "object") {
      const candidate = received as Record<string, unknown>;
      pass = Boolean(
        candidate.definition &&
          candidate.logic &&
          candidate.ui &&
          candidate.configSchema &&
          candidate.metadata,
      );
    }

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid node package`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid node package`,
        pass: false,
      };
    }
  },
});
