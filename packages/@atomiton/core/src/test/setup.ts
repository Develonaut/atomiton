/**
 * Vitest test setup file
 * Configures the test environment for all tests
 */

import { beforeAll, afterAll } from "vitest";

// Set test environment
process.env.NODE_ENV = "test";

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };

beforeAll(() => {
  // You can uncomment these to silence console output during tests
  // console.log = vi.fn();
  // console.error = vi.fn();
  // console.warn = vi.fn();
});

afterAll(() => {
  // Restore console
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});

// Add custom matchers if needed (removed for now to avoid conflicts)

// Global test utilities
export const mockBrowserEnvironment = (): void => {
  (global as unknown as { window: unknown }).window = {
    indexedDB: {},
    localStorage: {},
    Worker: class {},
  };
  (global as unknown as { document: unknown }).document = {};
  delete (global as unknown as { process?: unknown }).process;
};

export const mockDesktopEnvironment = (): void => {
  global.process = {
    ...process,
    versions: {
      ...process.versions,
      node: "18.0.0",
    },
  } as unknown as NodeJS.Process;
  delete (global as unknown as { window?: unknown }).window;
  delete (global as unknown as { document?: unknown }).document;
};

export const mockElectronEnvironment = (): void => {
  global.process = {
    ...process,
    versions: {
      ...process.versions,
      node: "18.0.0",
      electron: "25.0.0",
    },
  } as unknown as NodeJS.Process;
  (global as unknown as { window: unknown }).window = {
    electron: {},
  };
};

export const restoreEnvironment = (): void => {
  // Restore to test environment
  process.env.NODE_ENV = "test";
  delete (global as unknown as { window?: unknown }).window;
  delete (global as unknown as { document?: unknown }).document;
};
