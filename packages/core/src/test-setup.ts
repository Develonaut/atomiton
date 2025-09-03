/**
 * Test Setup - Global test configuration and mocks
 */

import { vi } from "vitest";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
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
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as AbortSignal;
    }

    abort(): void {
      (this.signal as { aborted: boolean }).aborted = true;
    }
  };
}

// Set up fake timers
vi.useFakeTimers();
