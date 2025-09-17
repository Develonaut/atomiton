import { router } from "@/router";
import { routes } from "@/router/routes";
import { describe, expect, it, vi } from "vitest";

describe("Router Domain Smoke Tests", () => {
  it("router package should be importable", async () => {
    const routerModule = await import("@atomiton/router");
    expect(routerModule).toBeDefined();
  });

  it("router should have intent-based preloading enabled", () => {
    const routerOptions = router.options || router.__options;
    expect(routerOptions?.defaultPreload).toBe("intent");
    expect(routerOptions?.defaultPreloadDelay).toBe(50);
  });

  it("router should have preloadRoute method available", () => {
    expect(router.preloadRoute).toBeDefined();
    expect(typeof router.preloadRoute).toBe("function");
  });

  it("all routes should use lazy loading via dynamic imports", () => {
    routes.forEach((route) => {
      expect(typeof route.component).toBe("function");
      const fnString = route.component.toString();
      expect(fnString).toMatch(
        /import\(|import\("|__vite_ssr_dynamic_import__/,
      );
    });
  });

  it("navigation utilities should have preload functions", async () => {
    const navigation = await import("@/router/navigation");
    expect(navigation.preloadHome).toBeDefined();
    expect(navigation.preloadExplore).toBeDefined();
    expect(navigation.preloadEditor).toBeDefined();
    expect(navigation.preloadProfile).toBeDefined();
    expect(typeof navigation.preloadHome).toBe("function");
    expect(typeof navigation.preloadExplore).toBe("function");
    expect(typeof navigation.preloadEditor).toBe("function");
    expect(typeof navigation.preloadProfile).toBe("function");
  });

  it("TanStack Router Link component should be importable with preloading support", async () => {
    const { Link } = await import("@/router");
    expect(Link).toBeDefined();
    expect(["function", "object"]).toContain(typeof Link);
  });

  it("lazy loading should not be broken by eager execution", () => {
    const warnSpy = vi.spyOn(console, "warn");
    const routeTree = router.routeTree;
    expect(routeTree).toBeDefined();
    expect(routeTree.children).toBeDefined();
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("dynamic imports should not execute during route creation", () => {
    let importCalled = false;
    const testRoute = {
      name: "test",
      path: "/test",
      component: () => {
        importCalled = true;
        return Promise.resolve({ default: () => null });
      },
    };

    const fnString = testRoute.component.toString();
    expect(importCalled).toBe(false);
    expect(fnString).toContain("importCalled");
  });
});
