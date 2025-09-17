import { createRouter } from "@atomiton/router";
import { LoadingFallback, RouteErrorBoundary } from "./components";
import { routes } from "./routes";
import NotFoundPage from "@/templates/NotFoundPage";
import "./types"; // Import type augmentations

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

export { useLink } from "./hooks/useLink";
export type { UseLinkOptions } from "./hooks/useLink";
