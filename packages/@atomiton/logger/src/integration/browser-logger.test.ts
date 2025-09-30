import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLogger } from "#exports/browser/index";
import type { LoggerTransport } from "#exports/shared/types";

describe("Browser Logger", () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.spyOn(console, "debug").mockImplementation(() => {});
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should create a logger without transport", () => {
    const logger = createLogger();
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
  });

  it("should fall back to console when no transport provided", () => {
    const logger = createLogger();
    logger.info("test message");

    expect(infoSpy).toHaveBeenCalledWith("", "test message");
  });

  it("should use console with scope prefix when no transport", () => {
    const logger = createLogger({ scope: "TEST" });
    logger.info("test message");

    expect(infoSpy).toHaveBeenCalledWith("[TEST]", "test message");
  });

  it("should use transport when provided", () => {
    const mockTransport: LoggerTransport = {
      send: vi.fn(),
    };

    const logger = createLogger({ transport: mockTransport });
    logger.info("test message", { data: "test" });

    expect(mockTransport.send).toHaveBeenCalledWith("log", {
      level: "info",
      message: "test message",
      meta: [{ data: "test" }],
      timestamp: expect.any(Date),
      scope: undefined,
    });
  });

  it("should fall back to console when transport throws", () => {
    const failingTransport: LoggerTransport = {
      send: vi.fn(() => {
        throw new Error("Transport error");
      }),
    };

    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    const logger = createLogger({ transport: failingTransport, scope: "TEST" });
    logger.info("test message");

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "[LOGGER:BROWSER] Transport error, falling back to console:",
      expect.any(Error),
    );
    expect(infoSpy).toHaveBeenCalledWith("[TEST]", "test message");
  });

  it("should support scoped loggers", () => {
    const logger = createLogger({ scope: "APP" });
    const scoped = logger.scope("MODULE");

    scoped.info("test");
    expect(infoSpy).toHaveBeenCalledWith("[APP:MODULE]", "test");
  });

  it("should log metrics with transport", () => {
    const mockTransport: LoggerTransport = {
      send: vi.fn(),
    };

    const logger = createLogger({ transport: mockTransport });
    logger.metric("response_time", 150, { endpoint: "/api/data" });

    expect(mockTransport.send).toHaveBeenCalledWith("log", {
      level: "info",
      message: "[METRIC]",
      meta: [
        { name: "response_time", value: 150, tags: { endpoint: "/api/data" } },
      ],
      timestamp: expect.any(Date),
      scope: undefined,
    });
  });

  it("should log analytics events with transport", () => {
    const mockTransport: LoggerTransport = {
      send: vi.fn(),
    };

    const logger = createLogger({ transport: mockTransport });
    logger.analytics("user_login", { userId: "123" });

    expect(mockTransport.send).toHaveBeenCalledWith("log", {
      level: "info",
      message: "[ANALYTICS]",
      meta: [{ event: "user_login", data: { userId: "123" } }],
      timestamp: expect.any(Date),
      scope: undefined,
    });
  });
});
