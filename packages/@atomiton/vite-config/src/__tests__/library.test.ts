import { describe, expect, it } from "vitest";
import { defineLibraryConfig } from "../presets/library";

describe("defineLibraryConfig", () => {
  it("should create a basic library config", () => {
    const config = defineLibraryConfig({
      name: "TestLibrary",
    });

    expect(config).toBeDefined();
    expect(config.build).toBeDefined();
    expect(config.build?.lib).toBeDefined();
    if (config.build?.lib && typeof config.build.lib === 'object') {
      expect(config.build.lib.name).toBe("TestLibrary");
      expect(config.build.lib.formats).toEqual(["es", "cjs"]);
    } else {
      throw new Error("Expected lib configuration to be an object");
    }
  });

  it("should apply custom entry point", () => {
    const config = defineLibraryConfig({
      name: "TestLibrary",
      entry: "./src/main.ts",
    });

    if (config.build?.lib && typeof config.build.lib === 'object') {
      expect(config.build.lib.entry).toContain("main.ts");
    } else {
      throw new Error("Expected lib configuration to be an object");
    }
  });

  it("should set external dependencies", () => {
    const config = defineLibraryConfig({
      name: "TestLibrary",
      external: ["react", "react-dom"],
    });

    expect(config.build?.rollupOptions?.external).toEqual([
      "react",
      "react-dom",
    ]);
  });

  it("should disable minification when requested", () => {
    const config = defineLibraryConfig({
      name: "TestLibrary",
      enableMinification: false,
    });

    expect(config.build?.minify).toBe(false);
    expect(config.build?.terserOptions).toBeUndefined();
  });

  it("should set test environment", () => {
    const config = defineLibraryConfig({
      name: "TestLibrary",
      testEnvironment: "jsdom",
    });

    expect(config.test?.environment).toBe("jsdom");
  });

  it("should merge additional config", () => {
    const config = defineLibraryConfig({
      name: "TestLibrary",
      additionalConfig: {
        define: {
          __DEV__: "true",
        },
      },
    });

    expect(config.define).toEqual({
      __DEV__: "true",
    });
  });
});
