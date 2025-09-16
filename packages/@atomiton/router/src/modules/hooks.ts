/**
 * Domain: Router Hooks
 *
 * Purpose: Creates router-specific hooks for components
 *
 * Responsibilities:
 * - Router instance access hooks
 * - Navigation hooks
 * - Route information hooks
 * - Parameter extraction hooks
 */

import {
  useRouterState,
  useParams as useTanStackParams,
  useRouter as useTanStackRouter,
  type AnyRoute,
} from "@tanstack/react-router";

/**
 * Creates the useRouter hook
 */
export const createUseRouter = () => {
  return () => useTanStackRouter();
};

/**
 * Creates the useNavigate hook that returns the navigate object
 */
export const createUseNavigate = <TNavigate>(navigate: TNavigate) => {
  return () => navigate;
};

/**
 * Creates the useCurrentRoute hook
 */
export const createUseCurrentRoute = () => {
  return (): AnyRoute | undefined => {
    const routerState = useRouterState();
    const matches = routerState.matches;
    return matches?.[matches.length - 1]?.routeId as unknown as AnyRoute;
  };
};

/**
 * Creates the useParams hook
 */
export const createUseParams = () => {
  return <T = Record<string, string>>() => {
    return useTanStackParams({ strict: false }) as T;
  };
};

/**
 * Creates the usePathname hook
 */
export const createUsePathname = () => {
  return (): string => {
    const routerState = useRouterState();
    return routerState.location.pathname;
  };
};
