import { vi } from "vitest";

// Main process environment setup
// Minimal mocking - only mock what's absolutely necessary for test isolation

// Mock only the most basic Electron APIs for unit tests
// Integration tests will use real Electron APIs
vi.mock("electron", () => ({
  app: {
    getPath: vi.fn((name: string) => {
      // Use real-ish paths for better integration testing
      const paths = {
        userData: "/tmp/electron-test-userData",
        appData: "/tmp/electron-test-appData",
        documents: "/tmp/electron-test-documents",
      };
      return paths[name as keyof typeof paths] || "/tmp/electron-test";
    }),
    quit: vi.fn(),
    whenReady: vi.fn().mockResolvedValue(undefined),
  },
  BrowserWindow: vi.fn().mockImplementation(() => ({
    loadFile: vi.fn(),
    on: vi.fn(),
    webContents: {
      on: vi.fn(),
    },
  })),
  // Mock process.exit for error handling tests
  // but don't completely override process
}));

// Mock process.exit to prevent tests from actually exiting
const originalExit = process.exit;
process.exit = vi.fn() as unknown as typeof process.exit;

// Cleanup after tests
afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  process.exit = originalExit;
});
