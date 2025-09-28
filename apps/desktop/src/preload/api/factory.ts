import { createNodeAPI } from "#preload/api/node";
import { createSystemAPI } from "#preload/api/system";
import type { AtomitonRPC } from "#preload/types/api";

export function createAtomitonRPC(): AtomitonRPC {
  return {
    node: createNodeAPI(),
    system: createSystemAPI(),
  };
}
