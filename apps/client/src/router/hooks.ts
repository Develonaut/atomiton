// Navigation hooks for Vite/React Router compatibility
// These provide the same API as Next.js navigation hooks

import { useNavigate, useLocation } from "react-router-dom";

export const useRouter = () => {
  const navigate = useNavigate();

  return {
    push: (url: string) => navigate(url),
    replace: (url: string) => navigate(url, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
  };
};

export const usePathname = () => {
  const location = useLocation();
  return location.pathname;
};
