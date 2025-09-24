import { initializeConductor } from "@/main/services/conductor";
import { createConductor } from "@atomiton/conductor/desktop";
import type { IStorageEngine } from "@atomiton/storage";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the conductor factory
vi.mock("@atomiton/conductor/desktop", () => ({
  createConductor: vi.fn(),
}));

describe("Conductor Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Given conductor initialization", () => {
    it("When provided with storage, Then should create conductor with storage config", () => {
      // Arrange
      const mockStorage: IStorageEngine = {
        save: vi.fn(),
        load: vi.fn(),
        list: vi.fn(),
        delete: vi.fn(),
        exists: vi.fn(),
        getInfo: vi.fn(),
      };
      const mockConductor = {
        events: {},
        executor: {},
        store: {},
        shutdown: vi.fn(),
        cleanup: vi.fn(),
      } as any;
      vi.mocked(createConductor).mockReturnValue(mockConductor);

      // Act
      const result = initializeConductor(mockStorage as IStorageEngine);

      // Assert
      expect(createConductor).toHaveBeenCalledWith({
        concurrency: 4,
        storage: mockStorage,
        timeout: 60000,
      });
      expect(result).toBe(mockConductor);
    });

    it("When conductor initialization fails, Then should log error and return null", () => {
      // Arrange
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockStorage: IStorageEngine = {
        save: vi.fn(),
        load: vi.fn(),
        list: vi.fn(),
        delete: vi.fn(),
        exists: vi.fn(),
        getInfo: vi.fn(),
      };
      const error = new Error("Failed to initialize conductor");
      vi.mocked(createConductor).mockImplementation(() => {
        throw error;
      });

      // Act
      const result = initializeConductor(mockStorage as IStorageEngine);

      // Assert
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to initialize conductor:",
        error,
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
