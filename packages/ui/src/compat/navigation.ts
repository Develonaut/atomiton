import { useNavigate, useLocation, useParams } from "react-router-dom";

export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    pathname: location.pathname,
    query: Object.fromEntries(new URLSearchParams(location.search)),
  };
}

export function usePathname() {
  const location = useLocation();
  return location.pathname;
}

export function useSearchParams() {
  const location = useLocation();
  return new URLSearchParams(location.search);
}

export { useParams };
