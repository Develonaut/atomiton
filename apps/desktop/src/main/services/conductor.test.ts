import { describe, it, expect, vi, beforeEach } from "vitest";
import { setupMainProcessHandler } from "@atomiton/conductor/desktop";
import { initializeConductor } from "@/main/services/conductor";
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
        concurrency: 4,
        storage: mockStorage,
        timeout: 60000,
      });
      expect(result).toBe(mockConductor);
    });

    it("When conductor initialization fails outside Electron context, Then should log warning", () => {
      // Arrange
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      const mockStorage: IStorageEngine = {
        save: vi.fn(),
        load: vi.fn(),
        list: vi.fn(),
        delete: vi.fn(),
        exists: vi.fn(),
        getInfo: vi.fn(),
      };
      const electronError = new Error(
        "Main process handler requires Electron main process context",
      );
      vi.mocked(setupMainProcessHandler).mockImplementation(() => {
        throw electronError;
      });

      // Act
      const result = initializeConductor(mockStorage as IStorageEngine);

      // Assert
      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Conductor initialization skipped: Not in Electron context",
      );

      consoleWarnSpy.mockRestore();
    });
  });
});
