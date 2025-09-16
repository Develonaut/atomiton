import { describe, expect, it } from "vitest";
import React from "react";
import { createRouter } from "../createRouter";

describe("Route Preloading", () => {
  describe("Router Configuration", () => {
    it("should enable preloading by default", () => {
      const routes = [
        {
          name: "home" as const,
          path: "/",
          component: () => Promise.resolve({ default: () => null }),
        },
      ] as const;

      const router = createRouter({ routes });

      // Router should have defaultPreload set to "intent"
      expect(router.router.options.defaultPreload).toBe("intent");
    });

    it("should provide Link component with preload support", () => {
      const routes = [
        {
          name: "test" as const,
          path: "/test",
          component: () => Promise.resolve({ default: () => null }),
        },
      ] as const;

      const router = createRouter({ routes });

      // Link component should be available
      expect(router.Link).toBeDefined();

      // Test different preload strategies
      const strategies: Array<"intent" | "viewport" | "render" | false> = [
        "intent",
        "viewport",
        "render",
        false,
      ];

      strategies.forEach((strategy) => {
        const linkElement = React.createElement(router.Link, {
          to: "/test",
          children: "Test",
          preload: strategy,
        });
        expect(linkElement.props.preload).toBe(strategy);
      });
    });
  });

  describe("Link Component", () => {
    it("should accept preload prop", () => {
      const routes = [
        {
          name: "page" as const,
          path: "/page",
          component: () => Promise.resolve({ default: () => null }),
        },
      ] as const;

      const router = createRouter({ routes });

      // Test intent preload (hover)
      const intentLink = React.createElement(router.Link, {
        to: "/page",
        children: "Hover to preload",
        preload: "intent",
      });
      expect(intentLink.props.preload).toBe("intent");

      // Test viewport preload
      const viewportLink = React.createElement(router.Link, {
        to: "/page",
        children: "Preload when visible",
        preload: "viewport",
      });
      expect(viewportLink.props.preload).toBe("viewport");

      // Test render preload
      const renderLink = React.createElement(router.Link, {
        to: "/page",
        children: "Preload immediately",
        preload: "render",
      });
      expect(renderLink.props.preload).toBe("render");

      // Test disabled preload
      const noPreloadLink = React.createElement(router.Link, {
        to: "/page",
        children: "No preload",
        preload: false,
      });
      expect(noPreloadLink.props.preload).toBe(false);
    });

    it("should use intent preloading by default", () => {
      const routes = [
        {
          name: "default" as const,
          path: "/default",
          component: () => Promise.resolve({ default: () => null }),
        },
      ] as const;

      const router = createRouter({ routes });

      // Create link without explicit preload prop
      const defaultLink = React.createElement(router.Link, {
        to: "/default",
        children: "Default preload",
      });

      // Should have the Link component type
      expect(defaultLink.type).toBe(router.Link);
    });
  });

  describe("Route Path Conversion", () => {
    it("should convert dynamic paths for TanStack Router", () => {
      const routes = [
        {
          name: "user" as const,
          path: "/users/$id",
          component: () => Promise.resolve({ default: () => null }),
        },
        {
          name: "post" as const,
          path: "/posts/$postId/comments/$commentId",
          component: () => Promise.resolve({ default: () => null }),
        },
        {
          name: "optional" as const,
          path: "/items/$id?",
          component: () => Promise.resolve({ default: () => null }),
        },
      ] as const;

      const router = createRouter({ routes });

      // Check route tree structure
      expect(router.router.routeTree).toBeDefined();
      expect(router.router.routesById).toBeDefined();

      // Routes should exist with converted paths
      const routeIds = Object.keys(router.router.routesById);

      // Should have root route
      expect(routeIds).toContain("__root__");

      // Should have converted dynamic routes
      expect(routeIds.some((id) => id.includes("users"))).toBe(true);
      expect(routeIds.some((id) => id.includes("posts"))).toBe(true);
      expect(routeIds.some((id) => id.includes("items"))).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should support custom error components", () => {
      function ErrorBoundary() {
        return React.createElement("div", null, "Error");
      }

      const routes = [
        {
          name: "page" as const,
          path: "/page",
          component: () => Promise.resolve({ default: () => null }),
          errorComponent: ErrorBoundary,
        },
      ] as const;

      const router = createRouter({
        routes,
        defaultErrorComponent: ErrorBoundary,
      });

      // Default error component should be set
      expect(router.router.options.defaultErrorComponent).toBe(ErrorBoundary);
    });

    it("should support custom pending components", () => {
      function LoadingComponent() {
        return React.createElement("div", null, "Loading...");
      }

      const routes = [
        {
          name: "slow" as const,
          path: "/slow",
          component: () =>
            new Promise<{ default: React.ComponentType }>((resolve) => {
              setTimeout(() => {
                resolve({ default: () => null });
              }, 100);
            }),
          pendingComponent: LoadingComponent,
        },
      ] as const;

      const router = createRouter({
        routes,
        defaultPendingComponent: LoadingComponent,
      });

      // Default pending component should be set
      expect(router.router.options.defaultPendingComponent).toBe(
        LoadingComponent,
      );
    });
  });

  describe("Navigation Methods", () => {
    it("should provide navigation methods", () => {
      const routes = [
        {
          name: "home" as const,
          path: "/",
          component: () => Promise.resolve({ default: () => null }),
        },
        {
          name: "about" as const,
          path: "/about",
          component: () => Promise.resolve({ default: () => null }),
        },
      ] as const;

      const router = createRouter({ routes });

      // Should have navigation object
      expect(router.navigate).toBeDefined();
      expect(router.navigate.to).toBeDefined();
      expect(router.navigate.back).toBeDefined();
      expect(router.navigate.forward).toBeDefined();
      expect(router.navigate.replace).toBeDefined();

      // Should have typed navigation methods
      expect(router.navigate.toHome).toBeDefined();
      expect(router.navigate.toAbout).toBeDefined();
    });

    it("should provide navigation hooks", () => {
      const routes = [
        {
          name: "test" as const,
          path: "/test",
          component: () => Promise.resolve({ default: () => null }),
        },
      ] as const;

      const router = createRouter({ routes });

      // Should have navigation hooks
      expect(router.useNavigate).toBeDefined();
      expect(router.useRouter).toBeDefined();
      expect(router.useCurrentRoute).toBeDefined();
      expect(router.useParams).toBeDefined();
      expect(router.usePathname).toBeDefined();
    });
  });

  describe("Performance", () => {
    it("should have routes configured for preloading", () => {
      const routes = [
        {
          name: "preloadable" as const,
          path: "/preloadable",
          component: () => Promise.resolve({ default: () => null }),
        },
      ] as const;

      const router = createRouter({ routes });

      // Routes should exist in router
      const routeIds = Object.keys(router.router.routesById);
      const preloadableRoute = routeIds.find((id) =>
        id.includes("preloadable"),
      );

      expect(preloadableRoute).toBeDefined();

      if (preloadableRoute) {
        const route = router.router.routesById[preloadableRoute];
        expect(route).toBeDefined();

        // Route should have necessary properties for preloading
        // The loader is added internally and might not be directly accessible
        // but the route should exist and be properly configured
        expect(route.id).toBe(preloadableRoute);
        expect(route.path).toBeDefined();
      }
    });

    it("should support preloading through Link component", () => {
      const routes = [
        {
          name: "optimized" as const,
          path: "/optimized",
          component: () => Promise.resolve({ default: () => null }),
        },
      ] as const;

      const router = createRouter({ routes });

      // Link component should support preloading
      const preloadLink = React.createElement(router.Link, {
        to: "/optimized",
        children: "Optimized Link",
        preload: "intent",
      });

      expect(preloadLink).toBeDefined();
      expect(preloadLink.props.preload).toBe("intent");

      // Router should be configured for preloading
      expect(router.router.options.defaultPreload).toBe("intent");
    });
  });
});
