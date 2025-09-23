import { describe, expect, it } from "vitest";
import { getTerserOptions } from "#utils/terser";
import { createManualChunks } from "#utils/chunks";

describe("getTerserOptions", () => {
  it("should return default terser options", () => {
    const options = getTerserOptions();

    expect(options.compress.drop_console).toBe(true);
    expect(options.compress.drop_debugger).toBe(true);
    expect(options.compress.pure_funcs).toEqual([
      "console.log",
      "console.debug",
    ]);
    expect(options.mangle.keep_classnames).toBe(true);
    expect(options.mangle.keep_fnames).toBe(true);
  });

  it("should allow overriding terser options", () => {
    const options = getTerserOptions({
      dropConsole: false,
      keepClassNames: false,
      pureFunctions: ["myDebug"],
    });

    expect(options.compress.drop_console).toBe(false);
    expect(options.mangle.keep_classnames).toBe(false);
    expect(options.compress.pure_funcs).toEqual(["myDebug"]);
  });
});

describe("createManualChunks", () => {
  it("should place node_modules in vendor chunk", () => {
    const chunker = createManualChunks({});
    const result = chunker("/path/to/node_modules/lodash/index.js");

    expect(result).toBe("vendor");
  });

  it("should match string patterns", () => {
    const chunker = createManualChunks({
      utils: "src/utils/",
      components: "src/components/",
    });

    expect(chunker("/project/src/utils/helper.ts")).toBe("utils");
    expect(chunker("/project/src/components/Button.tsx")).toBe("components");
    expect(chunker("/project/src/other/file.ts")).toBeUndefined();
  });

  it("should match regex patterns", () => {
    const chunker = createManualChunks({
      tests: /\.test\.ts$/,
      styles: /\.(css|scss|less)$/,
    });

    expect(chunker("/project/src/utils.test.ts")).toBe("tests");
    expect(chunker("/project/src/styles.css")).toBe("styles");
    expect(chunker("/project/src/index.ts")).toBeUndefined();
  });

  it("should prioritize vendor chunk", () => {
    const chunker = createManualChunks({
      utils: "utils",
    });

    expect(chunker("/node_modules/utils/index.js")).toBe("vendor");
  });
});
