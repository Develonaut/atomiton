import { describe, it, expect } from "vitest";
import type {
  Logger,
  LoggerOptions,
  LogLevel,
  LogEntry,
  LoggerTransport,
} from "#exports/shared/types";

describe("Logger Types", () => {
  it("should have correct LogLevel values", () => {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    expect(levels).toHaveLength(4);
  });

  it("should define Logger interface correctly", () => {
    const mockLogger: Logger = {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      metric: () => {},
      analytics: () => {},
      scope: () => mockLogger,
    };

    expect(typeof mockLogger.debug).toBe("function");
    expect(typeof mockLogger.info).toBe("function");
    expect(typeof mockLogger.warn).toBe("function");
    expect(typeof mockLogger.error).toBe("function");
    expect(typeof mockLogger.metric).toBe("function");
    expect(typeof mockLogger.analytics).toBe("function");
    expect(typeof mockLogger.scope).toBe("function");
  });

  it("should define LogEntry interface correctly", () => {
    const entry: LogEntry = {
      level: "info",
      message: "test",
      timestamp: new Date(),
    };

    expect(entry.level).toBe("info");
    expect(entry.message).toBe("test");
    expect(entry.timestamp).toBeInstanceOf(Date);
  });

  it("should support optional LogEntry fields", () => {
    const entry: LogEntry = {
      level: "debug",
      message: "test",
      scope: "MODULE",
      meta: [{ key: "value" }],
      timestamp: new Date(),
    };

    expect(entry.scope).toBe("MODULE");
    expect(entry.meta).toEqual([{ key: "value" }]);
  });

  it("should define LoggerTransport interface correctly", () => {
    const transport: LoggerTransport = {
      send: () => {},
    };

    expect(typeof transport.send).toBe("function");
  });

  it("should define LoggerOptions interface correctly", () => {
    const options: LoggerOptions = {
      scope: "APP",
      filePath: "/logs/test.log",
      maxSize: 1024,
    };

    expect(options.scope).toBe("APP");
    expect(options.filePath).toBe("/logs/test.log");
    expect(options.maxSize).toBe(1024);
  });

  it("should support transport in LoggerOptions", () => {
    const transport: LoggerTransport = {
      send: () => {},
    };

    const options: LoggerOptions = {
      transport,
    };

    expect(options.transport).toBe(transport);
  });
});
