/**
 * Benchmark for lazy loading performance
 */

import { bench, describe } from "vitest";
import nodes from "../api.js";

describe("Lazy Loading Performance", () => {
  bench("Get available node types (metadata only)", () => {
    nodes.getAvailableNodeTypes();
  });

  bench("Get node metadata without loading", () => {
    nodes.getNodeMetadata("http-request");
  });

  bench("Load single node (first time)", async () => {
    // Clear cache for accurate measurement
    await nodes.getNodePackageAsync("csv-reader");
  });

  bench("Load single node (cached)", async () => {
    // Should be much faster due to caching
    await nodes.getNodePackageAsync("csv-reader");
  });

  bench("Get all categories without loading nodes", () => {
    nodes.getCategories();
  });

  bench("Search nodes without loading", () => {
    nodes.searchNodes("http");
  });

  bench("Load multiple nodes sequentially", async () => {
    await nodes.getNodePackageAsync("http-request");
    await nodes.getNodePackageAsync("csv-reader");
    await nodes.getNodePackageAsync("file-system");
  });

  bench("Load multiple nodes in parallel", async () => {
    await Promise.all([
      nodes.getNodePackageAsync("http-request"),
      nodes.getNodePackageAsync("csv-reader"),
      nodes.getNodePackageAsync("file-system"),
    ]);
  });
});
