import type { AnyRoute, Router } from "@tanstack/react-router";
import type { ComponentType, LazyExoticComponent } from "react";

export type RouteComponent =
  | ComponentType<Record<string, unknown>>
  | LazyExoticComponent<ComponentType<Record<string, unknown>>>;

export type RouteConfig<TName extends string = string> = {
  name: TName;
  path: string;
  component: () => Promise<{ default: RouteComponent }> | RouteComponent;
  navigator?: (...args: unknown[]) => string;
  errorComponent?: RouteComponent;
  pendingComponent?: RouteComponent;
  meta?: Record<string, unknown>;
};

export type RouteParams<T extends string> =
  T extends `${string}$${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & RouteParams<Rest>
    : T extends `${string}$${infer Param}`
      ? { [K in Param]: string }
      : Record<string, never>;

export type OptionalParams<T extends string> =
  T extends `${string}$${infer Param}?${infer Rest}`
    ? { [K in Param]?: string } & OptionalParams<Rest>
    : T extends `${string}$${infer Param}?`
      ? { [K in Param]?: string }
      : Record<string, never>;

export type ExtractParams<T extends string> = RouteParams<T> &
  OptionalParams<T>;

export type NavigationMethod<TPath extends string> =
  keyof ExtractParams<TPath> extends never
    ? () => void
    : (params: ExtractParams<TPath>) => void;

export type NavigationMethods<TRoutes extends readonly RouteConfig[]> = {
  [K in TRoutes[number]["name"] as `to${Capitalize<K>}`]: NavigationMethod<
    Extract<TRoutes[number], { name: K }>["path"]
  >;
};

export type RouterInstance<TRoutes extends readonly RouteConfig[]> = {
  router: Router<AnyRoute, never>;
  navigate: NavigationMethods<TRoutes> & {
    to: (path: string, options?: NavigationOptions) => void;
    back: () => void;
    forward: () => void;
    replace: (path: string, options?: NavigationOptions) => void;
  };
  useRouter: () => Router<AnyRoute, never>;
  useNavigate: () => NavigationMethods<TRoutes> & {
    to: (path: string, options?: NavigationOptions) => void;
    back: () => void;
    forward: () => void;
    replace: (path: string, options?: NavigationOptions) => void;
  };
  useCurrentRoute: () => AnyRoute | undefined;
  useParams: <T = Record<string, string>>() => T;
  Link: ComponentType<LinkProps>;
};

export type NavigationOptions = {
  replace?: boolean;
  state?: unknown;
  search?: Record<string, unknown>;
  hash?: string;
};

export type LinkProps = {
  to: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  onClick?: (e: React.MouseEvent) => void;
  replace?: boolean;
  state?: unknown;
  search?: Record<string, unknown>;
  hash?: string;
};

export type CreateRouterOptions<TRoutes extends readonly RouteConfig[]> = {
  routes: TRoutes;
  basePath?: string;
  defaultPendingComponent?: RouteComponent;
  defaultErrorComponent?: RouteComponent;
  enableDevtools?: boolean;
};
