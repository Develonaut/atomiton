import { initializeStorage } from "#main/services/storage";
import {
  initializePathManager,
  resetPathManager,
} from "#main/services/pathManager";
import {
  createFileSystemEngine,
  createStorage,
  type IStorageEngine,
} from "@atomiton/storage/desktop";
import { app } from "electron";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock Electron app
vi.mock("electron", () => ({
  app: {
    getPath: vi.fn((name: string) => {
      switch (name) {
        case "userData":
          return "/mock/userData";
        case "temp":
          return "/tmp";
        case "home":
          return "/tmp/test-home";
        default:
          return "/tmp";
      }
    }),
    quit: vi.fn(),
  },
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

// Mock process.exit
vi.spyOn(process, "exit").mockImplementation(() => {
  return undefined as never;
});

// Mock the storage factory
vi.mock("@atomiton/storage/desktop", () => ({
  createFileSystemEngine: vi.fn(),
  createStorage: vi.fn(),
  createPathManager: vi.fn(() => ({
    getUserDataPath: vi.fn(() => "/mock/userData"),
    getLogsPath: vi.fn(() => "/mock/logs"),
    getTempPath: vi.fn(() => "/mock/temp"),
    getDataPath: vi.fn(() => "/mock/data"),
  })),
}));

describe("Storage Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Initialize PathManager before each test
    initializePathManager();
  });

  afterEach(() => {
    // Reset PathManager after each test
    resetPathManager();
  });

  describe("Given storage initialization", () => {
    it("When called, Then should create filesystem storage with userData path", () => {
      // Arrange
      const mockStorage: IStorageEngine = {
        save: vi.fn(),
        load: vi.fn(),
        list: vi.fn(),
        delete: vi.fn(),
        exists: vi.fn(),
        getInfo: vi.fn(),
      };
      vi.mocked(createFileSystemEngine).mockReturnValue(
        mockStorage as IStorageEngine,
      );
      vi.mocked(createStorage).mockReturnValue(mockStorage as IStorageEngine);

      // Act
      const result = initializeStorage();

      // Assert
      // Storage service now uses PathManager, not app.getPath directly
      expect(createFileSystemEngine).toHaveBeenCalledWith({
        baseDir: path.join("/mock/userData", "atomiton-data"),
      });
      expect(createStorage).toHaveBeenCalledWith({
        engine: mockStorage,
      });
      expect(result).toBe(mockStorage);
    });

    it("When storage creation fails, Then should quit app gracefully", () => {
      // Arrange
      const mockError = new Error("Failed to create storage");
      vi.mocked(createStorage).mockImplementation(() => {
        throw mockError;
      });
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      const result = initializeStorage();

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to initialize storage:",
        mockError,
      );
      expect(app.quit).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined(); // Function exits before returning

      consoleSpy.mockRestore();
    });
  });
});
