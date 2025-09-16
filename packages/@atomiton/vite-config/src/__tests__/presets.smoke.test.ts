import { describe, expect, it } from "vitest";
import {
  defineLibraryConfig,
  defineReactLibraryConfig,
  defineAppConfig,
} from "../index";

describe("Smoke Tests - Presets", () => {
  it("should export defineLibraryConfig", () => {
    expect(defineLibraryConfig).toBeDefined();
    expect(typeof defineLibraryConfig).toBe("function");
  });

  it("should export defineReactLibraryConfig", () => {
    expect(defineReactLibraryConfig).toBeDefined();
    expect(typeof defineReactLibraryConfig).toBe("function");
  });

  it("should export defineAppConfig", () => {
    expect(defineAppConfig).toBeDefined();
    expect(typeof defineAppConfig).toBe("function");
  });

  it("should create valid library config", () => {
    const config = defineLibraryConfig({
      name: "SmokeTestLibrary",
    });

    expect(config).toBeDefined();
    expect(config.build).toBeDefined();
    expect(config.plugins).toBeDefined();
    expect(Array.isArray(config.plugins)).toBe(true);
  });

  it("should create valid React library config", () => {
    const config = defineReactLibraryConfig({
      name: "SmokeTestReactLibrary",
    });

    expect(config).toBeDefined();
    expect(config.build?.rollupOptions?.external).toContain("react");
    expect(config.build?.rollupOptions?.external).toContain("react-dom");
  });

  it("should create valid app config", () => {
    const config = defineAppConfig({
      port: 3000,
    });

    expect(config).toBeDefined();
    expect(config.server).toBeDefined();
    expect(config.server?.port).toBe(3000);
  });
});
