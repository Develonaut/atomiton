import { capitalize } from "@atomiton/utils";
import {
  createRootRoute,
  createRoute,
  createRouter as createTanStackRouter,
  Outlet,
  useRouterState,
  useParams as useTanStackParams,
  useRouter as useTanStackRouter,
  type AnyRoute,
  type Router,
} from "@tanstack/react-router";
import { Link } from "./components/Link";
import { createNavigationStore } from "./navigation/store";
import type {
  CreateRouterOptions,
  NavigationMethods,
  NavigationOptions,
  RouteConfig,
  RouterInstance,
} from "./types";
import { buildPath, extractParams } from "./utils/path";

export function createRouter<TRoutes extends readonly RouteConfig[]>(
  options: CreateRouterOptions<TRoutes>,
): RouterInstance<TRoutes> {
  const {
    routes,
    defaultPendingComponent,
    defaultErrorComponent,
    enableDevtools = true,
  } = options;

  // Create navigation store
  const navigationStore = createNavigationStore(enableDevtools);
  const navigationStoreApi = navigationStore.getState();

  // Create root route
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });

  // Create TanStack routes from config
  const tanStackRoutes = routes.map((routeConfig) => {
    const { path, component, errorComponent, pendingComponent } = routeConfig;

    // Convert our path format to TanStack format
    const tanStackPath = path
      .replace(/\$([^/?]+)\?/g, "$$$1") // Optional params
      .replace(/\$([^/?]+)/g, "$$$1"); // Required params

    return createRoute({
      getParentRoute: () => rootRoute,
      path: tanStackPath,
      component: async () => {
        const Component = await component();
        return typeof Component === "function" ? Component : Component.default;
      },
      errorComponent: (errorComponent || defaultErrorComponent) as undefined,
      pendingComponent: (pendingComponent ||
        defaultPendingComponent) as undefined,
    });
  });

  // Build route tree
  const routeTree = rootRoute.addChildren(tanStackRoutes);

  // Create TanStack router
  const router = createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: defaultErrorComponent as undefined,
    defaultPendingComponent: defaultPendingComponent as undefined,
  });

  // Generate navigation methods
  const navigationMethods = {} as NavigationMethods<TRoutes>;

  routes.forEach((route) => {
    const methodName =
      `to${capitalize(route.name)}` as keyof NavigationMethods<TRoutes>;

    if (route.navigator) {
      // Use custom navigator if provided
      (navigationMethods as Record<string, (...args: unknown[]) => void>)[
        methodName
      ] = (...args: unknown[]) => {
        const path = route.navigator!(...args);
        navigationStoreApi.navigate(path);
      };
    } else {
      // Auto-generate navigator based on path params
      const { required, optional } = extractParams(route.path);

      if (required.length === 0 && optional.length === 0) {
        // No params
        (navigationMethods as Record<string, () => void>)[methodName] = () => {
          navigationStoreApi.navigate(route.path);
        };
      } else {
        // Has params
        (
          navigationMethods as Record<
            string,
            (params: Record<string, unknown>) => void
          >
        )[methodName] = (params: Record<string, unknown>) => {
          const path = buildPath(
            route.path,
            params as Record<string, string | number | boolean>,
          );
          navigationStoreApi.navigate(path);
        };
      }
    }
  });

  // Create navigate object with generated methods and base methods
  const navigate = {
    ...navigationMethods,
    to: (path: string, options?: NavigationOptions) =>
      navigationStoreApi.navigate(path, options),
    back: () => navigationStoreApi.back(),
    forward: () => navigationStoreApi.forward(),
    replace: (path: string, options?: NavigationOptions) =>
      navigationStoreApi.replace(path, options),
  };

  // Hook to use router
  const useRouter = () => useTanStackRouter();

  // Hook to use navigation
  const useNavigate = () => navigate;

  // Hook to get current route
  const useCurrentRoute = (): AnyRoute | undefined => {
    const routerState = useRouterState();
    const matches = routerState.matches;
    return matches?.[matches.length - 1]?.routeId as unknown as AnyRoute;
  };

  // Hook to get params
  const useParams = <T = Record<string, string>,>() => {
    return useTanStackParams({ strict: false }) as T;
  };

  // Initialize router with navigation store
  navigationStoreApi.setRouter(router as unknown as Router<AnyRoute, never>);

  return {
    router: router as unknown as Router<AnyRoute, never>,
    navigate,
    useRouter: useRouter as unknown as () => Router<AnyRoute, never>,
    useNavigate,
    useCurrentRoute,
    useParams,
    Link,
  };
}
