import { createRouter } from "@atomiton/router";
import { LoadingFallback, RouteErrorBoundary } from "./components";
import { routes } from "./routes";

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
});
