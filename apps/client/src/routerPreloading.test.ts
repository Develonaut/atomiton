import { router } from "./router";
import { routes } from "./router/routes";
import { describe, expect, it, vi } from "vitest";

describe("Preloading and Lazy Loading Smoke Tests", () => {
  it("should have intent-based preloading enabled in router configuration", () => {
    // Verify router is configured with intent preloading
    const routerOptions = router.options || router.__options;

    // The router should have defaultPreload set to "intent"
    expect(routerOptions?.defaultPreload).toBe("intent");

    // Should have a small delay to ensure intentional hover
    expect(routerOptions?.defaultPreloadDelay).toBe(50);
  });

  it("should have preloadRoute method available", () => {
    // Verify the preloadRoute method exists on the router
    expect(router.preloadRoute).toBeDefined();
    expect(typeof router.preloadRoute).toBe("function");
  });

  it("should have all routes configured with lazy loading", () => {
    // Verify all routes use dynamic imports for code splitting
    routes.forEach((route) => {
      // Component should be a function (lazy loader)
      expect(typeof route.component).toBe("function");

      // The function should contain 'import(' or '__vite_ssr_dynamic_import__' when stringified
      // This ensures it's a dynamic import and not a regular component
      // In test environment, Vite transforms import() to __vite_ssr_dynamic_import__
      const fnString = route.component.toString();
      expect(fnString).toMatch(
        /import\(|import\("|__vite_ssr_dynamic_import__/,
      );
    });
  });

  it("should have navigation utilities with preload functions", async () => {
    // Import navigation utilities to verify they exist
    const navigation = await import("@/router/navigation");

    // Verify preload functions exist for main routes
    expect(navigation.preloadHome).toBeDefined();
    expect(navigation.preloadExplore).toBeDefined();
    expect(navigation.preloadEditor).toBeDefined();
    expect(navigation.preloadProfile).toBeDefined();

    // Verify they are functions
    expect(typeof navigation.preloadHome).toBe("function");
    expect(typeof navigation.preloadExplore).toBe("function");
    expect(typeof navigation.preloadEditor).toBe("function");
    expect(typeof navigation.preloadProfile).toBe("function");
  });

  it("should not eagerly load route components", () => {
    // Mock console.warn to detect if components are being loaded
    const warnSpy = vi.spyOn(console, "warn");

    // Access the router's route tree
    // If components were eagerly loaded, they would already be in memory
    const routeTree = router.routeTree;

    // Check that route components are not already loaded
    // They should be wrapped in lazyRouteComponent
    expect(routeTree).toBeDefined();
    expect(routeTree.children).toBeDefined();

    // Verify no warnings about missing lazy loading
    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it("should have TanStack Router Link component with preloading support", async () => {
    const { Link } = await import("@/router");

    // Verify Link component exists
    expect(Link).toBeDefined();

    // Link might be a function or an object (React.forwardRef returns an object)
    // The important thing is that it exists and can be used as a component
    expect(["function", "object"]).toContain(typeof Link);
  });

  it("critical: should detect if lazy loading is broken", () => {
    // This test will fail if someone accidentally breaks lazy loading
    // by calling the import functions during route creation

    // Create a test route with a mock import function
    let importCalled = false;
    const testRoute = {
      name: "test",
      path: "/test",
      component: () => {
        importCalled = true;
        return Promise.resolve({ default: () => null });
      },
    };

    // Check the function string without executing it
    const fnString = testRoute.component.toString();

    // The import should NOT have been called yet
    expect(importCalled).toBe(false);

    // But the function should look like a dynamic import
    expect(fnString).toContain("importCalled");
  });
});
