import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as path from "node:path";

// Mock electron and electron-log before imports
vi.mock("electron", () => ({
  app: {
    getPath: vi.fn(),
  },
}));

vi.mock("electron-log", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    verbose: vi.fn(),
    silly: vi.fn(),
    log: vi.fn(),
    scope: vi.fn(),
    transports: {
      file: {
        resolvePathFn: null as (() => string) | null,
        maxSize: 0,
      },
    },
  },
}));

// Import after mocking
import { createLogger } from "#exports/desktop/index";
import { app } from "electron";
import log from "electron-log";

// Get references to mocked functions
const mockGetPath = vi.mocked(app.getPath);
const mockElectronLog = vi.mocked(log);

describe("Desktop Logger", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Setup default mock implementations
    mockGetPath.mockReturnValue("/mock/user/data");

    // Reset electron-log transports
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mock type compatibility
    mockElectronLog.transports.file.resolvePathFn = (() => "") as any;
    mockElectronLog.transports.file.maxSize = 0;

    // Setup scope to return self (for chaining)
    mockElectronLog.scope.mockReturnValue(mockElectronLog);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Logger Creation", () => {
    it("should create a logger with default options", () => {
      const logger = createLogger();

      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.debug).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.error).toBe("function");
      expect(typeof logger.metric).toBe("function");
      expect(typeof logger.analytics).toBe("function");
      expect(typeof logger.scope).toBe("function");
    });

    it("should use default file path when none provided", () => {
      createLogger();

      // Call the resolvePathFn to verify it returns correct path
      const resolvePathFn = mockElectronLog.transports.file.resolvePathFn;
      expect(resolvePathFn).toBeDefined();

      if (resolvePathFn) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mock type compatibility
        const resolvedPath = resolvePathFn({} as any);

        // app.getPath should be called when resolving the path
        expect(mockGetPath).toHaveBeenCalledWith("userData");
        expect(resolvedPath).toBe(
          path.join("/mock/user/data", "logs", "atomiton.log"),
        );
      }
    });

    it("should use custom file path when provided", () => {
      const customPath = "/custom/logs/app.log";
      createLogger({ filePath: customPath });

      // Call the resolvePathFn to verify it returns custom path
      const resolvePathFn = mockElectronLog.transports.file.resolvePathFn;
      expect(resolvePathFn).toBeDefined();

      if (resolvePathFn) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mock type compatibility
        const resolvedPath = resolvePathFn({} as any);
        expect(resolvedPath).toBe(customPath);
      }
    });

    it("should use default maxSize when none provided", () => {
      createLogger();

      // Default maxSize is 5MB (5 * 1024 * 1024)
      expect(mockElectronLog.transports.file.maxSize).toBe(5 * 1024 * 1024);
    });

    it("should use custom maxSize when provided", () => {
      const customMaxSize = 10 * 1024 * 1024; // 10MB
      createLogger({ maxSize: customMaxSize });

      expect(mockElectronLog.transports.file.maxSize).toBe(customMaxSize);
    });

    it("should create scoped logger when scope provided", () => {
      const scope = "TEST_SCOPE";
      createLogger({ scope });

      expect(mockElectronLog.scope).toHaveBeenCalledWith(scope);
    });

    it("should not create scoped logger when no scope provided", () => {
      createLogger();

      expect(mockElectronLog.scope).not.toHaveBeenCalled();
    });
  });

  describe("Log Levels", () => {
    it("should log debug messages", () => {
      const logger = createLogger();
      logger.debug("debug message", { meta: "data" });

      expect(mockElectronLog.debug).toHaveBeenCalledWith("debug message", {
        meta: "data",
      });
    });

    it("should log info messages", () => {
      const logger = createLogger();
      logger.info("info message", { meta: "data" });

      expect(mockElectronLog.info).toHaveBeenCalledWith("info message", {
        meta: "data",
      });
    });

    it("should log warn messages", () => {
      const logger = createLogger();
      logger.warn("warn message", { meta: "data" });

      expect(mockElectronLog.warn).toHaveBeenCalledWith("warn message", {
        meta: "data",
      });
    });

    it("should log error messages", () => {
      const logger = createLogger();
      logger.error("error message", { meta: "data" });

      expect(mockElectronLog.error).toHaveBeenCalledWith("error message", {
        meta: "data",
      });
    });

    it("should handle multiple meta arguments", () => {
      const logger = createLogger();
      logger.info("message", { key1: "value1" }, { key2: "value2" });

      expect(mockElectronLog.info).toHaveBeenCalledWith(
        "message",
        { key1: "value1" },
        { key2: "value2" },
      );
    });

    it("should use scoped log when scope is provided", () => {
      const scopedLog = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        verbose: vi.fn(),
        silly: vi.fn(),
        log: vi.fn(),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mock type compatibility
      mockElectronLog.scope.mockReturnValue(scopedLog as any);

      const logger = createLogger({ scope: "SCOPED" });
      logger.info("test message");

      expect(mockElectronLog.scope).toHaveBeenCalledWith("SCOPED");
      expect(scopedLog.info).toHaveBeenCalledWith("test message");
    });
  });

  describe("Scoped Loggers", () => {
    it("should create a scoped logger from existing logger", () => {
      const logger = createLogger();
      const scoped = logger.scope("MODULE");

      expect(scoped).toBeDefined();
      expect(typeof scoped.info).toBe("function");
    });

    it("should create scoped logger with correct scope name", () => {
      const logger = createLogger({ scope: "APP" });
      const scoped = logger.scope("MODULE");

      scoped.info("test message");

      // Verify that scope was called twice: once for APP, once for APP:MODULE
      expect(mockElectronLog.scope).toHaveBeenCalledWith("APP");
      expect(mockElectronLog.scope).toHaveBeenCalledWith("APP:MODULE");
    });

    it("should handle deeply nested scopes", () => {
      const logger = createLogger({ scope: "APP" });
      const scoped1 = logger.scope("MODULE");
      const scoped2 = scoped1.scope("COMPONENT");

      scoped2.info("test message");

      expect(mockElectronLog.scope).toHaveBeenCalledWith("APP");
      expect(mockElectronLog.scope).toHaveBeenCalledWith("APP:MODULE");
      expect(mockElectronLog.scope).toHaveBeenCalledWith(
        "APP:MODULE:COMPONENT",
      );
    });

    it("should create scope without parent when no initial scope", () => {
      const logger = createLogger();
      const scoped = logger.scope("MODULE");

      scoped.info("test message");

      expect(mockElectronLog.scope).toHaveBeenCalledWith("MODULE");
    });
  });

  describe("Metric Logging", () => {
    it("should log metrics without tags", () => {
      const logger = createLogger();
      logger.metric("response_time", 150);

      expect(mockElectronLog.info).toHaveBeenCalledWith(
        "[METRIC]",
        expect.objectContaining({
          name: "response_time",
          value: 150,
          tags: undefined,
          timestamp: expect.any(Date),
        }),
      );
    });

    it("should log metrics with tags", () => {
      const logger = createLogger();
      const tags = { endpoint: "/api/data", method: "GET" };
      logger.metric("response_time", 150, tags);

      expect(mockElectronLog.info).toHaveBeenCalledWith(
        "[METRIC]",
        expect.objectContaining({
          name: "response_time",
          value: 150,
          tags,
          timestamp: expect.any(Date),
        }),
      );
    });

    it("should use scoped log for metrics when scope provided", () => {
      const scopedLog = {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        verbose: vi.fn(),
        silly: vi.fn(),
        log: vi.fn(),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mock type compatibility
      mockElectronLog.scope.mockReturnValue(scopedLog as any);

      const logger = createLogger({ scope: "PERF" });
      logger.metric("load_time", 500, { page: "home" });

      expect(scopedLog.info).toHaveBeenCalledWith(
        "[METRIC]",
        expect.objectContaining({
          name: "load_time",
          value: 500,
          tags: { page: "home" },
        }),
      );
    });
  });

  describe("Analytics Logging", () => {
    it("should log analytics events without data", () => {
      const logger = createLogger();
      logger.analytics("user_login");

      expect(mockElectronLog.info).toHaveBeenCalledWith(
        "[ANALYTICS]",
        expect.objectContaining({
          event: "user_login",
          data: undefined,
          timestamp: expect.any(Date),
        }),
      );
    });

    it("should log analytics events with data", () => {
      const logger = createLogger();
      const data = { userId: "123", method: "google" };
      logger.analytics("user_login", data);

      expect(mockElectronLog.info).toHaveBeenCalledWith(
        "[ANALYTICS]",
        expect.objectContaining({
          event: "user_login",
          data,
          timestamp: expect.any(Date),
        }),
      );
    });

    it("should use scoped log for analytics when scope provided", () => {
      const scopedLog = {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        verbose: vi.fn(),
        silly: vi.fn(),
        log: vi.fn(),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mock type compatibility
      mockElectronLog.scope.mockReturnValue(scopedLog as any);

      const logger = createLogger({ scope: "ANALYTICS" });
      logger.analytics("page_view", { page: "/home" });

      expect(scopedLog.info).toHaveBeenCalledWith(
        "[ANALYTICS]",
        expect.objectContaining({
          event: "page_view",
          data: { page: "/home" },
        }),
      );
    });
  });

  describe("File Path Resolution", () => {
    it("should resolve default path using electron app.getPath", () => {
      createLogger();

      const resolvePathFn = mockElectronLog.transports.file.resolvePathFn;
      expect(resolvePathFn).toBeDefined();

      if (resolvePathFn) {
        mockGetPath.mockReturnValue("/test/user/data");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mock type compatibility
        const resolvedPath = resolvePathFn({} as any);

        expect(mockGetPath).toHaveBeenCalledWith("userData");
        expect(resolvedPath).toBe(
          path.join("/test/user/data", "logs", "atomiton.log"),
        );
      }
    });

    it("should not call app.getPath when custom filePath provided", () => {
      createLogger({ filePath: "/custom/path.log" });

      const resolvePathFn = mockElectronLog.transports.file.resolvePathFn;
      if (resolvePathFn) {
        // Clear previous calls
        mockGetPath.mockClear();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mock type compatibility
        const resolvedPath = resolvePathFn({} as any);

        // app.getPath should not be called when resolving custom path
        expect(mockGetPath).not.toHaveBeenCalled();
        expect(resolvedPath).toBe("/custom/path.log");
      }
    });

    it("should handle different userData paths correctly", () => {
      const paths = [
        "/home/user/.config/app",
        "C:\\Users\\User\\AppData\\Roaming\\app",
        "/Users/user/Library/Application Support/app",
      ];

      paths.forEach((userDataPath) => {
        mockGetPath.mockReturnValue(userDataPath);
        createLogger();

        const resolvePathFn = mockElectronLog.transports.file.resolvePathFn;
        if (resolvePathFn) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test mock type compatibility
          const resolvedPath = resolvePathFn({} as any);
          expect(resolvedPath).toBe(
            path.join(userDataPath, "logs", "atomiton.log"),
          );
        }
      });
    });
  });

  describe("electron-log Configuration", () => {
    it("should configure file transport resolvePathFn", () => {
      createLogger();

      expect(mockElectronLog.transports.file.resolvePathFn).toBeDefined();
      expect(typeof mockElectronLog.transports.file.resolvePathFn).toBe(
        "function",
      );
    });

    it("should configure file transport maxSize", () => {
      const maxSize = 1024 * 1024; // 1MB
      createLogger({ maxSize });

      expect(mockElectronLog.transports.file.maxSize).toBe(maxSize);
    });

    it("should reconfigure transports on each logger creation", () => {
      // First logger with default settings
      createLogger();
      const firstMaxSize = mockElectronLog.transports.file.maxSize;
      expect(firstMaxSize).toBe(5 * 1024 * 1024);

      // Second logger with custom settings
      const customMaxSize = 10 * 1024 * 1024;
      createLogger({ maxSize: customMaxSize });
      expect(mockElectronLog.transports.file.maxSize).toBe(customMaxSize);
    });
  });

  describe("Integration with electron-log", () => {
    it("should preserve original logger options when creating scopes", () => {
      const originalMaxSize = 2 * 1024 * 1024;
      const originalPath = "/custom/log.log";

      const logger = createLogger({
        scope: "APP",
        filePath: originalPath,
        maxSize: originalMaxSize,
      });

      const scoped = logger.scope("MODULE");

      // Verify scoped logger still uses same configuration
      scoped.info("test");

      // Original configuration should be preserved
      expect(mockElectronLog.transports.file.maxSize).toBe(originalMaxSize);
    });

    it("should handle all log methods consistently", () => {
      const logger = createLogger();
      const methods = ["debug", "info", "warn", "error"] as const;

      methods.forEach((method) => {
        logger[method](`${method} message`);
        expect(mockElectronLog[method]).toHaveBeenCalledWith(
          `${method} message`,
        );
      });
    });
  });
});
