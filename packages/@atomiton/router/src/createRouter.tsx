import { type AnyRoute, type Router } from "@tanstack/react-router";
import { Link } from "./components/Link";
import {
  createUseCurrentRoute,
  createUseNavigate,
  createUseParams,
  createUseRouter,
} from "./modules/hooks";
import {
  createNavigateObject,
  generateNavigationMethods,
} from "./modules/navigation";
import { createRouterProvider } from "./modules/provider";
import {
  createRoutesFromConfig,
  createTanStackRouterInstance,
} from "./modules/routes";
import { createNavigationStore } from "./store";
import type { CreateRouterOptions, RouteConfig, RouterInstance } from "./types";

export function createRouter<TRoutes extends readonly RouteConfig[]>(
  options: CreateRouterOptions<TRoutes>,
): RouterInstance<TRoutes> {
  const {
    routes,
    defaultPendingComponent,
    defaultErrorComponent,
    enableDevtools = true,
  } = options;

  const navigationStore = createNavigationStore(enableDevtools);

  const { routeTree } = createRoutesFromConfig(
    routes,
    defaultPendingComponent,
    defaultErrorComponent,
  );

  const router = createTanStackRouterInstance(
    routeTree,
    defaultErrorComponent,
    defaultPendingComponent,
  );

  const navigationMethods = generateNavigationMethods(
    routes,
    navigationStore.navigate,
  );

  const navigate = createNavigateObject(
    routes,
    navigationMethods,
    navigationStore.navigate,
    navigationStore.back,
    navigationStore.forward,
    navigationStore.replace,
  );

  const useRouter = createUseRouter();
  const useNavigate = createUseNavigate(navigate);
  const useCurrentRoute = createUseCurrentRoute();
  const useParams = createUseParams();

  // Initialize router with navigation store
  navigationStore.setRouter(router as unknown as Router<AnyRoute, never>);

  // Create RouterProvider component
  const RouterProvider = createRouterProvider(router);

  return {
    router: router as unknown as Router<AnyRoute, never>,
    navigate,
    useRouter: useRouter as unknown as () => Router<AnyRoute, never>,
    useNavigate,
    useCurrentRoute,
    useParams,
    Link,
    RouterProvider,
  };
}
