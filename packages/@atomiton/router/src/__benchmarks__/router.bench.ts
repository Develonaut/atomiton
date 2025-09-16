import { bench, describe } from "vitest";
import { createRouter } from "../createRouter";
import { createNavigationStore } from "../navigation/store";
import { buildPath, extractParams, validateParams } from "../utils/path";
import type { RouteConfig } from "../types";

describe("Router Performance", () => {
  const routes = Array.from({ length: 100 }, (_, i) => ({
    name: `route${i}` as const,
    path: `/route${i}/$param${i}?`,
    component: () => Promise.resolve({ default: () => null }),
  }));

  bench("router initialization", () => {
    createRouter({ routes: routes as readonly RouteConfig[] });
  });

  bench("navigation method generation", () => {
    const router = createRouter({ routes: routes as readonly RouteConfig[] });
    // Access all generated methods to trigger any lazy initialization
    Object.keys(router.navigate).forEach((key) => {
      if (key.startsWith("to")) {
        // Just access the method, don't call it
        void (router.navigate as Record<string, unknown>)[key];
      }
    });
  });

  bench("path building (simple)", () => {
    buildPath("/user/profile", {});
  });

  bench("path building (with params)", () => {
    buildPath("/user/$id/posts/$postId", { id: "123", postId: "456" });
  });

  bench("path building (optional params)", () => {
    buildPath("/search/$query?/$page?", { query: "test" });
  });

  bench("param extraction", () => {
    extractParams("/user/$id/posts/$postId?/$commentId?");
  });

  bench("param validation", () => {
    validateParams("/user/$id/posts/$postId", { id: "123", postId: "456" });
  });

  bench("navigation store creation", () => {
    createNavigationStore();
  });

  bench("navigation store update", () => {
    const store = createNavigationStore();
    const { updateState } = store.getState();
    updateState({ currentPath: "/new/path", isNavigating: true });
  });
});
