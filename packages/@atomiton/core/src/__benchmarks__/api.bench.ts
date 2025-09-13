import { bench, describe } from "vitest";
import core from "../api";

describe("Core API Performance", () => {
  bench("initialization", async () => {
    await core.initialize();
  });

  bench("version access", () => {
    const version = core.version;
  });

  bench("nodes access", () => {
    const nodes = core.nodes;
  });

  bench("getAllNodes operation", () => {
    const allNodes = core.nodes.getAllNodes();
  });

  bench("getNodeMetadata operation (first node)", () => {
    const allNodes = core.nodes.getAllNodes();
    if (allNodes.length > 0) {
      const metadata = core.nodes.getNodeMetadata(allNodes[0]?.type as any);
    }
  });

  bench("singleton access pattern", () => {
    const instance = core;
  });

  bench("complete workflow - init and fetch nodes", async () => {
    await core.initialize();
    const nodes = core.nodes.getAllNodes();
    if (nodes.length > 0) {
      core.nodes.getNodeMetadata(nodes[0]?.type as any);
    }
  });
});
