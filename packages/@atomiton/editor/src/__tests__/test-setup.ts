import { expect } from "vitest";

// Add any global test setup here
// @ts-expect-error - Adding expect to globalThis for tests
globalThis.expect = expect;

// Mock ResizeObserver for jsdom environment
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;

// Mock IntersectionObserver for jsdom environment
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-expect-error - Mock for testing
globalThis.IntersectionObserver = IntersectionObserverMock;
