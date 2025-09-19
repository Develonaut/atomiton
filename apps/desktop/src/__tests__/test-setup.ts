import { vi } from "vitest";

// Mock Electron APIs for testing
vi.mock("electron", () => ({
  app: {
    getPath: vi.fn((name: string) => {
      switch (name) {
        case "userData":
          return "/mock/userData";
        default:
          return "/mock/path";
      }
    }),
    quit: vi.fn(),
  },
  BrowserWindow: vi.fn(),
  ipcMain: {
    on: vi.fn(),
    handle: vi.fn(),
  },
  session: {
    defaultSession: {
      webRequest: {
        onHeadersReceived: vi.fn(),
      },
      extensions: {
        getAllExtensions: vi.fn(() => []),
      },
    },
  },
  shell: {
    openExternal: vi.fn(),
  },
}));

// Mock process.exit to prevent tests from actually exiting
global.process.exit = vi.fn() as typeof process.exit;
