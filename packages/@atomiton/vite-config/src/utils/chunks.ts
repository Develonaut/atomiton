import type { ChunkMapping } from "../types";

export function createManualChunks(mapping: ChunkMapping) {
  return (id: string) => {
    if (id.includes("node_modules")) {
      return "vendor";
    }

    for (const [chunkName, pattern] of Object.entries(mapping)) {
      if (typeof pattern === "string") {
        if (id.includes(pattern)) {
          return chunkName;
        }
      } else if (pattern instanceof RegExp) {
        if (pattern.test(id)) {
          return chunkName;
        }
      }
    }

    return undefined;
  };
}
