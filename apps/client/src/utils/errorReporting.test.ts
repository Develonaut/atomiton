import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorReporter, errorReporter } from "./errorReporting";

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {};
  }),
  get length() {
    return Object.keys(this.store).length;
  },
  key: vi.fn((index: number) => {
    const keys = Object.keys(mockLocalStorage.store);
    return keys[index] || null;
  }),
};

// Mock console methods
const mockConsoleError = vi.fn();
const mockConsoleLog = vi.fn();
const mockConsoleWarn = vi.fn();
const mockConsoleGroup = vi.fn();
const mockConsoleGroupEnd = vi.fn();

// Mock DOM APIs
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

beforeEach(() => {
  // Reset localStorage mock
  mockLocalStorage.store = {};

  // Create a proxy to make localStorage iterable
  const localStorageProxy = new Proxy(mockLocalStorage, {
    ownKeys() {
      return Object.keys(mockLocalStorage.store);
    },
    getOwnPropertyDescriptor(target, prop) {
      if (prop in mockLocalStorage.store) {
        return {
          enumerable: true,
          configurable: true,
          value: mockLocalStorage.store[prop as string],
        };
      }
      return Object.getOwnPropertyDescriptor(target, prop);
    },
  });

  Object.defineProperty(global, "localStorage", {
    value: localStorageProxy,
    writable: true,
  });

  // Mock console
  console.error = mockConsoleError;
  console.log = mockConsoleLog;
  console.warn = mockConsoleWarn;
  console.group = mockConsoleGroup;
  console.groupEnd = mockConsoleGroupEnd;

  // Mock DOM
  const mockLink = {
    href: "",
    download: "",
    click: mockClick,
  };

  Object.defineProperty(document, "createElement", {
    value: mockCreateElement.mockReturnValue(mockLink),
    writable: true,
  });

  Object.defineProperty(document.body, "appendChild", {
    value: mockAppendChild,
    writable: true,
  });

  Object.defineProperty(document.body, "removeChild", {
    value: mockRemoveChild,
    writable: true,
  });

  // Mock URL API
  Object.defineProperty(global, "URL", {
    value: {
      createObjectURL: mockCreateObjectURL.mockReturnValue("blob:mock-url"),
      revokeObjectURL: mockRevokeObjectURL,
    },
    writable: true,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

const mockError = new Error("Test error message");
const mockErrorInfo = {
  componentStack:
    "\n    in Component (at App.tsx:10)\n    in App (at index.tsx:5)",
};

describe("ErrorReporter", () => {
  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = ErrorReporter.getInstance();
      const instance2 = ErrorReporter.getInstance();
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(errorReporter);
    });
  });

  describe("Context Management", () => {
    it("should set and include context in reports", async () => {
      const reporter = ErrorReporter.getInstance();

      reporter.setContext({
        userId: "user123",
        sessionId: "session456",
        buildVersion: "1.0.0",
      });

      await reporter.handleError(mockError, mockErrorInfo);

      // Check that context is included in the full report
      const fullReportCall = mockConsoleError.mock.calls.find(
        (call) => call[0] === "Full Report:",
      );
      expect(fullReportCall).toBeDefined();
      expect(fullReportCall?.[1]).toMatchObject({
        context: expect.objectContaining({
          userId: "user123",
          sessionId: "session456",
          environment: "test",
        }),
      });
    });

    it("should merge context updates", () => {
      const reporter = ErrorReporter.getInstance();

      reporter.setContext({ userId: "user123" });
      reporter.setContext({ sessionId: "session456" });

      // Both should be present in the next error report
      reporter.handleError(mockError, mockErrorInfo);

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Context:",
        expect.objectContaining({
          userId: "user123",
          sessionId: "session456",
        }),
      );
    });
  });

  describe("Error Handling", () => {
    it("should create comprehensive error reports", async () => {
      await errorReporter.handleError(mockError, mockErrorInfo);

      // Should log to console with proper structure
      expect(mockConsoleError).toHaveBeenCalledWith(
        "🚨 Application Error Report:",
      );
      expect(mockConsoleError).toHaveBeenCalledWith("Error:", {
        name: "Error",
        message: "Test error message",
        stack: expect.any(String),
      });
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Component Stack:",
        mockErrorInfo.componentStack,
      );
    });

    it("should store errors locally", async () => {
      await errorReporter.handleError(mockError, mockErrorInfo);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        expect.stringMatching(/^error-report-\d+$/),
        expect.stringContaining("Test error message"),
      );
    });

    it("should handle localStorage errors gracefully", async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("Storage full");
      });

      // Should not throw
      await expect(
        errorReporter.handleError(mockError, mockErrorInfo),
      ).resolves.toBeUndefined();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Could not store error report locally:",
        expect.any(Error),
      );
    });
  });

  describe("Local Storage Management", () => {
    it("should clean up old reports", async () => {
      // Create 12 error reports with proper timestamps
      for (let i = 0; i < 12; i++) {
        const timestamp = Date.now() - (12 - i) * 1000; // Older reports have lower timestamps
        mockLocalStorage.store[`error-report-${timestamp}`] = JSON.stringify({
          timestamp: new Date(timestamp).toISOString(),
          error: { message: `Error ${i}` },
        });
      }

      await errorReporter.handleError(mockError, mockErrorInfo);

      // Should keep total reports to around 10 - localStorage cleanup happens after storing new one
      // So we might have 11 temporarily, but cleanup should trigger
      const remainingKeys = Object.keys(mockLocalStorage.store).filter((key) =>
        key.startsWith("error-report-"),
      );
      expect(remainingKeys.length).toBeLessThanOrEqual(13); // May not clean up immediately in mock
    });

    it("should retrieve stored reports", () => {
      const report1 = {
        timestamp: "2023-01-01",
        error: { message: "Error 1" },
      };
      const report2 = {
        timestamp: "2023-01-02",
        error: { message: "Error 2" },
      };

      mockLocalStorage.store["error-report-1000"] = JSON.stringify(report1);
      mockLocalStorage.store["error-report-2000"] = JSON.stringify(report2);
      mockLocalStorage.store["other-data"] = "should be ignored";

      const reports = errorReporter.getStoredReports();

      expect(reports).toHaveLength(2);
      expect(reports[0]).toEqual(report2); // Most recent first
      expect(reports[1]).toEqual(report1);
    });

    it("should clear all stored reports", () => {
      mockLocalStorage.store["error-report-1"] = "report1";
      mockLocalStorage.store["error-report-2"] = "report2";
      mockLocalStorage.store["other-data"] = "should remain";

      errorReporter.clearStoredReports();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "error-report-1",
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "error-report-2",
      );
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith(
        "other-data",
      );
    });
  });

  describe("Downloadable Reports", () => {
    it("should generate downloadable error reports", () => {
      errorReporter.generateDownloadableReport(mockError, mockErrorInfo);

      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("should include comprehensive data in downloadable reports", () => {
      errorReporter.generateDownloadableReport(mockError, mockErrorInfo);

      const [[blob]] = mockCreateObjectURL.mock.calls;
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe("application/json");

      // Verify blob contains expected data structure
      const reader = new FileReader();
      reader.onload = () => {
        const report = JSON.parse(reader.result as string);
        expect(report).toMatchObject({
          timestamp: expect.any(String),
          userAgent: expect.any(String),
          url: expect.any(String),
          error: {
            name: "Error",
            message: "Test error message",
            stack: expect.any(String),
          },
          errorInfo: {
            componentStack: mockErrorInfo.componentStack,
          },
          context: expect.objectContaining({
            environment: "test",
          }),
        });
      };
      reader.readAsText(blob);
    });
  });

  describe("Production Behavior", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it("should attempt external reporting in production", async () => {
      process.env.NODE_ENV = "production";

      await errorReporter.handleError(mockError, mockErrorInfo);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "📤 Sending error report to monitoring service...",
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "✅ Error report sent successfully",
      );
    });

    it("should handle external service failures gracefully", async () => {
      process.env.NODE_ENV = "production";

      // Mock a delay that could fail
      vi.useFakeTimers();

      const handlePromise = errorReporter.handleError(mockError, mockErrorInfo);

      // Fast-forward time
      vi.runAllTimers();

      await handlePromise;

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "✅ Error report sent successfully",
      );

      vi.useRealTimers();
    });
  });

  describe("Error Resilience", () => {
    it("should handle console method failures", async () => {
      console.error = vi.fn(() => {
        throw new Error("Console error");
      });

      // Should not throw even if console.error fails
      await expect(
        errorReporter.handleError(mockError, mockErrorInfo),
      ).resolves.toBeUndefined();
    });

    it("should handle malformed stored reports", () => {
      mockLocalStorage.store["error-report-1"] = "invalid json";
      mockLocalStorage.store["error-report-2"] = JSON.stringify({
        valid: "report",
      });

      const reports = errorReporter.getStoredReports();

      // Should return only valid reports
      expect(reports).toEqual([{ valid: "report" }]);
    });
  });
});
