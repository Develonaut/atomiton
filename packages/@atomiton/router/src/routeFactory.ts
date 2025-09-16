import { createRootRoute, createRoute, Outlet } from "@tanstack/react-router";
import React, { type ComponentType } from "react";
import type { RouteConfig } from "./types";

export function createRootRouteInstance() {
  return createRootRoute({
    component: () => React.createElement(Outlet),
  });
}

export function createRouteComponent(
  routeConfig: RouteConfig,
  defaultPendingComponent?: ComponentType,
) {
  function RouteComponent() {
    const [Component, setComponent] = React.useState<ComponentType | null>(
      null,
    );
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      const loadComponent = async () => {
        try {
          const comp = routeConfig.component;
          if (
            typeof comp === "function" &&
            comp.constructor.name === "AsyncFunction"
          ) {
            const result = await (
              comp as () => Promise<{ default: ComponentType }>
            )();
            setComponent(() => result.default);
          } else if (typeof comp === "function") {
            const result = (
              comp as () => ComponentType | Promise<{ default: ComponentType }>
            )();
            if (result && typeof result === "object" && "then" in result) {
              const module = await result;
              setComponent(() => module.default);
            } else {
              setComponent(() => result as ComponentType);
            }
          } else {
            setComponent(() => comp);
          }
        } catch (error) {
          console.error("Failed to load component:", error);
        } finally {
          setLoading(false);
        }
      };

      loadComponent();
    }, []);

    if (loading) {
      const PendingComponent =
        routeConfig.pendingComponent || defaultPendingComponent;
      return PendingComponent
        ? React.createElement(PendingComponent)
        : React.createElement("div", null, "Loading...");
    }

    return Component ? React.createElement(Component) : null;
  }

  return RouteComponent;
}

export function createTanStackRoutes(
  routes: RouteConfig[],
  rootRoute: ReturnType<typeof createRootRouteInstance>,
  defaultPendingComponent?: ComponentType,
) {
  return routes.map((routeConfig) => {
    return createRoute({
      getParentRoute: () => rootRoute,
      path: routeConfig.path,
      component: createRouteComponent(routeConfig, defaultPendingComponent),
    });
  });
}
