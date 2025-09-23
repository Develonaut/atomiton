import { createRouter } from "@atomiton/router";
import { LoadingFallback, RouteErrorBoundary } from "#router/components";
import { routes } from "#router/routes";
import NotFoundPage from "#templates/NotFoundPage";
import "#router/types"; // Import type augmentations

export const {
  router,
  navigate,
  useRouter,
  useNavigate,
  useCurrentRoute,
  useParams,
  usePathname,
  useLocation,
  Link,
  RouterProvider,
} = createRouter({
  routes,
  defaultPendingComponent: LoadingFallback,
  defaultErrorComponent: RouteErrorBoundary,
  defaultNotFoundComponent: NotFoundPage,
});

export { useLink } from "#router/hooks/useLink";
export type {
  UseLinkOptions,
  AppNavigateOptions,
} from "#router/hooks/useLink";
export type { EditorRouteState, AppRouteState } from "#router/types";
