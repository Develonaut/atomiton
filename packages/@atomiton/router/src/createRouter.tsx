import {
  createRouter as createTanStackRouter,
  Link,
  RouterProvider,
  useLocation,
  useParams,
  useRouter,
} from "@tanstack/react-router";
import React from "react";
import { createRootRouteInstance, createTanStackRoutes } from "./routeFactory";
import type { CreateRouterOptions } from "./types";

export function createRouter(options: CreateRouterOptions) {
  const { routes, defaultPendingComponent } = options;

  const rootRoute = createRootRouteInstance();

  const tanStackRoutes = createTanStackRoutes(
    routes,
    rootRoute,
    defaultPendingComponent,
  );

  const routeTree = rootRoute.addChildren(tanStackRoutes);

  const router = createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPreloadDelay: 50, // Small delay to ensure hover is intentional
  });

  // Return the expected API structure that the client expects
  return {
    router,
    navigate: router.navigate.bind(router),
    useRouter: () => useRouter(),
    useNavigate: () => router.navigate.bind(router),
    useCurrentRoute: () => {
      const routerInstance = useRouter();
      return routerInstance.state.matches[
        routerInstance.state.matches.length - 1
      ];
    },
    useParams: <T = Record<string, string>,>() =>
      useParams({ strict: false }) as T,
    usePathname: () => {
      const location = useLocation();
      return location.pathname;
    },
    useLocation: () => {
      const location = useLocation();
      return {
        pathname: location.pathname,
        state: location.state,
        search: location.search,
        hash: location.hash,
      };
    },
    Link,
    RouterProvider: () => React.createElement(RouterProvider, { router }),
  };
}
