import { describe, it, expect, vi, beforeEach } from "vitest";
import { initializeServices } from "@/main/services";
import { initializeStorage } from "@/main/services/storage";
import type { IStorageEngine } from "@atomiton/storage";

// Mock the individual service modules
vi.mock("@/main/services/storage", () => ({
  initializeStorage: vi.fn(),
}));

describe("Services Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Given services initialization", () => {
    it("When called, Then should initialize storage", () => {
      // Arrange
      const mockStorage: IStorageEngine = {
        save: vi.fn(),
        load: vi.fn(),
        list: vi.fn(),
        delete: vi.fn(),
        exists: vi.fn(),
        getInfo: vi.fn(),
      };

      (initializeStorage as ReturnType<typeof vi.fn>).mockReturnValue(
        mockStorage as IStorageEngine,
      );

      // Act
      const result = initializeServices();

      // Assert
      expect(initializeStorage).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        storage: mockStorage,
      });
    });

    it("When services are initialized, Then should return storage service", () => {
      // Arrange
      const mockStorage: IStorageEngine = {
        save: vi.fn(),
        load: vi.fn(),
        list: vi.fn(),
        delete: vi.fn(),
        exists: vi.fn(),
        getInfo: vi.fn(),
      };

      (initializeStorage as ReturnType<typeof vi.fn>).mockReturnValue(
        mockStorage as IStorageEngine,
      );

      // Act
      const result = initializeServices();

      // Assert
      expect(result.storage).toBe(mockStorage);
    });
  });
});
