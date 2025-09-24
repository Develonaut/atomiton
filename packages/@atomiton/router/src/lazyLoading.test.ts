import { createRouter } from "#createRouter";
import { createRootRouteInstance, createTanStackRoutes } from "#routeFactory";
import { describe, expect, it } from "vitest";

describe("Lazy Loading Smoke Tests", () => {
  it("should detect dynamic imports without executing them", () => {
    // This is the critical test that would have caught our bug
    let componentExecuted = false;

    const testRoutes = [
      {
        name: "test",
        path: "/test",
        component: () => {
          componentExecuted = true;
          return Promise.resolve({ default: () => null });
        },
      },
    ];

    // Create routes using our factory
    const rootRoute = createRootRouteInstance();
    const tanStackRoutes = createTanStackRoutes(testRoutes, rootRoute);

    // The component function should NOT have been executed
    expect(componentExecuted).toBe(false);

    // But the route should have been created
    expect(tanStackRoutes).toHaveLength(1);
    expect(tanStackRoutes[0]).toBeDefined();
  });

  it("should properly identify lazy loaders by string inspection", () => {
    // Create test functions without executing them
    const lazyComponentFunction = new Function(
      'return import("./test-module")',
    );
    const directComponentFunction = function TestComponent() {
      return null;
    };

    // Check that our string inspection works correctly
    const lazyFnString = lazyComponentFunction.toString();
    const directFnString = directComponentFunction.toString();

    expect(lazyFnString).toMatch(/import\(/);
    expect(directFnString).not.toMatch(/import\(/);
  });

  it("should configure router with intent-based preloading", () => {
    const router = createRouter({
      routes: [
        {
          name: "home",
          path: "/",
          component: () => Promise.resolve({ default: () => null }),
        },
      ],
    });

    // Verify router has preloading configured
    expect(router.router.options?.defaultPreload).toBe("intent");
    expect(router.router.options?.defaultPreloadDelay).toBe(50);
  });

  it("should expose preloadRoute method", () => {
    const router = createRouter({
      routes: [
        {
          name: "test",
          path: "/test",
          component: () => Promise.resolve({ default: () => null }),
        },
      ],
    });

    // Verify preloadRoute is available
    expect(router.router.preloadRoute).toBeDefined();
    expect(typeof router.router.preloadRoute).toBe("function");
  });

  it("should handle mixed route types correctly", () => {
    let eagerExecuted = false;
    let lazyExecuted = false;

    const testRoutes = [
      {
        name: "lazy",
        path: "/lazy",
        component: () => {
          lazyExecuted = true;
          return Promise.resolve({ default: () => null });
        },
      },
      {
        name: "eager",
        path: "/eager",
        component: function EagerComponent() {
          eagerExecuted = true;
          return null;
        },
      },
    ];

    const rootRoute = createRootRouteInstance();
    createTanStackRoutes(testRoutes, rootRoute);

    // Lazy route should not execute
    expect(lazyExecuted).toBe(false);

    // Eager component also shouldn't execute during route creation
    expect(eagerExecuted).toBe(false);
  });
});
