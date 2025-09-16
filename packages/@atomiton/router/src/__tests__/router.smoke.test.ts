import { describe, expect, it } from "vitest";
import { createRouter } from "../createRouter";
import { createNavigationStore } from "../navigation/store";
import { buildPath, extractParams } from "../utils/path";

describe("Router Smoke Tests", () => {
  it("should create router without errors", () => {
    const routes = [
      {
        name: "home",
        path: "/",
        component: () => Promise.resolve({ default: () => null }),
      },
      {
        name: "editor",
        path: "/editor/$id?",
        component: () => Promise.resolve({ default: () => null }),
      },
    ] as const;

    expect(() => createRouter({ routes })).not.toThrow();
  });

  it("should expose core API methods", () => {
    const routes = [
      {
        name: "home",
        path: "/",
        component: () => Promise.resolve({ default: () => null }),
      },
    ] as const;

    const result = createRouter({ routes });

    expect(result.router).toBeDefined();
    expect(result.navigate).toBeDefined();
    expect(result.navigate.to).toBeDefined();
    expect(result.navigate.back).toBeDefined();
    expect(result.navigate.forward).toBeDefined();
    expect(result.navigate.replace).toBeDefined();
    expect(result.useRouter).toBeDefined();
    expect(result.useNavigate).toBeDefined();
    expect(result.useCurrentRoute).toBeDefined();
    expect(result.useParams).toBeDefined();
    expect(result.Link).toBeDefined();
  });

  it("should generate navigation methods", () => {
    const routes = [
      {
        name: "home",
        path: "/",
        component: () => Promise.resolve({ default: () => null }),
      },
      {
        name: "editor",
        path: "/editor/$id",
        component: () => Promise.resolve({ default: () => null }),
      },
      {
        name: "profile",
        path: "/profile/$userId?",
        component: () => Promise.resolve({ default: () => null }),
      },
    ] as const;

    const result = createRouter({ routes });

    expect(result.navigate.toHome).toBeDefined();
    expect(result.navigate.toEditor).toBeDefined();
    expect(result.navigate.toProfile).toBeDefined();
  });

  it("should handle path utilities", () => {
    const path = buildPath("/user/$id", { id: "123" });
    expect(path).toBe("/user/123");

    const params = extractParams("/user/$id/posts/$postId?");
    expect(params.required).toContain("id");
    expect(params.optional).toContain("postId");
  });

  it("should create navigation store", () => {
    const store = createNavigationStore();
    const state = store.getState();

    expect(state.currentPath).toBe("/");
    expect(state.history).toEqual(["/"]);
    expect(state.isNavigating).toBe(false);
    expect(state.navigate).toBeDefined();
    expect(state.back).toBeDefined();
    expect(state.forward).toBeDefined();
  });
});
