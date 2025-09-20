import { bench, describe } from "vitest";
import { defineLibraryConfig } from "./presets/library";
import { defineReactLibraryConfig } from "./presets/react";
import { defineAppConfig } from "./presets/app";

describe("Config Generation Performance", () => {
  bench("defineLibraryConfig - minimal", () => {
    defineLibraryConfig({
      name: "BenchmarkLibrary",
    });
  });

  bench("defineLibraryConfig - with chunks", () => {
    defineLibraryConfig({
      name: "BenchmarkLibrary",
      chunks: {
        utils: "src/utils/",
        components: "src/components/",
        hooks: "src/hooks/",
      },
    });
  });

  bench("defineReactLibraryConfig - minimal", () => {
    defineReactLibraryConfig({
      name: "BenchmarkReactLibrary",
    });
  });

  bench("defineReactLibraryConfig - with options", () => {
    defineReactLibraryConfig({
      name: "BenchmarkReactLibrary",
      enableTailwind: true,
      enableTsconfigPaths: true,
      external: ["lodash", "axios"],
    });
  });

  bench("defineAppConfig - minimal", () => {
    defineAppConfig({});
  });

  bench("defineAppConfig - with aliases", () => {
    defineAppConfig({
      port: 5000,
      aliases: {
        "@components": "./src/components",
        "@utils": "./src/utils",
        "@hooks": "./src/hooks",
        "@store": "./src/store",
      },
      workspacePackages: ["@atomiton/ui", "@atomiton/core"],
    });
  });
});
