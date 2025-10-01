import { initializeStorage } from "#main/services/storage";
import {
  createFileSystemEngine,
  createStorage,
  type IStorageEngine,
} from "@atomiton/storage/desktop";
import { app } from "electron";
import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Electron app
vi.mock("electron", () => ({
  app: {
    getPath: vi.fn(() => "/mock/userData"),
    quit: vi.fn(),
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
}));

describe("Storage Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      expect(app.getPath).toHaveBeenCalledWith("userData");
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
