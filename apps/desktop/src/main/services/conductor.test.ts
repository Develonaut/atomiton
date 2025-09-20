import { describe, it, expect, vi, beforeEach } from "vitest";
import { setupMainProcessHandler } from "@atomiton/conductor/desktop";
import { initializeConductor } from "../../main/services/conductor";
import type { IStorageEngine } from "@atomiton/storage";

// Mock the conductor factory
vi.mock("@atomiton/conductor/desktop", () => ({
  setupMainProcessHandler: vi.fn(),
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
        execute: vi.fn(),
        configureTransport: vi.fn(),
        cleanup: vi.fn(),
      };
      vi.mocked(setupMainProcessHandler).mockReturnValue(mockConductor);

      // Act
      const result = initializeConductor(mockStorage as IStorageEngine);

      // Assert
      expect(setupMainProcessHandler).toHaveBeenCalledWith({
        storage: mockStorage,
      });
      expect(result).toBe(mockConductor);
    });

    it("When conductor is created, Then should log successful initialization", () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockStorage: IStorageEngine = {
        save: vi.fn(),
        load: vi.fn(),
        list: vi.fn(),
        delete: vi.fn(),
        exists: vi.fn(),
        getInfo: vi.fn(),
      };
      const mockConductor = {
        execute: vi.fn(),
        configureTransport: vi.fn(),
        cleanup: vi.fn(),
      };
      vi.mocked(setupMainProcessHandler).mockReturnValue(mockConductor);

      // Act
      initializeConductor(mockStorage as IStorageEngine);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        "Conductor initialized with storage successfully",
      );

      consoleSpy.mockRestore();
    });
  });
});
