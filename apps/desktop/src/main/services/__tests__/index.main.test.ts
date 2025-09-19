import { describe, it, expect, vi, beforeEach } from "vitest";
import { initializeServices } from "../../../main/services";
import { initializeStorage } from "../../../main/services/storage";
import { initializeConductor } from "../../../main/services/conductor";
import type { IStorageEngine } from "@atomiton/storage";

// Mock the individual service modules
vi.mock("../../../main/services/storage", () => ({
  initializeStorage: vi.fn(),
}));

vi.mock("../../../main/services/conductor", () => ({
  initializeConductor: vi.fn(),
}));

describe("Services Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Given services initialization", () => {
    it("When called, Then should initialize storage and conductor in correct order", () => {
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
      };

      vi.mocked(initializeStorage).mockReturnValue(
        mockStorage as IStorageEngine,
      );
      vi.mocked(initializeConductor).mockReturnValue(mockConductor);

      // Act
      const result = initializeServices();

      // Assert
      expect(initializeStorage).toHaveBeenCalledTimes(1);
      expect(initializeConductor).toHaveBeenCalledWith(mockStorage);
      expect(result).toEqual({
        storage: mockStorage,
        conductor: mockConductor,
      });
    });

    it("When services are initialized, Then should pass storage to conductor", () => {
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
      };

      vi.mocked(initializeStorage).mockReturnValue(
        mockStorage as IStorageEngine,
      );
      vi.mocked(initializeConductor).mockReturnValue(mockConductor);

      // Act
      initializeServices();

      // Assert
      expect(initializeConductor).toHaveBeenCalledWith(mockStorage);
    });
  });
});
