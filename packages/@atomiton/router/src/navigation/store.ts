import type { Router, AnyRoute } from "@tanstack/react-router";
import { createStore } from "@atomiton/store";
import type { NavigationOptions } from "../types";

type NavigationState = {
  currentPath: string;
  previousPath: string | null;
  history: string[];
  params: Record<string, unknown>;
  search: Record<string, unknown>;
  hash: string;
  isNavigating: boolean;
  router: Router<AnyRoute, never> | null;
};

type NavigationActions = {
  setRouter: (router: Router<AnyRoute, never>) => void;
  navigate: (path: string, options?: NavigationOptions) => void;
  back: () => void;
  forward: () => void;
  replace: (path: string, options?: NavigationOptions) => void;
  updateState: (updates: Partial<NavigationState>) => void;
};

export type NavigationStore = NavigationState & NavigationActions;

const initialState: NavigationState = {
  currentPath: "/",
  previousPath: null,
  history: ["/"],
  params: {},
  search: {},
  hash: "",
  isNavigating: false,
  router: null,
};

export const createNavigationStore = (enableDevtools = false) => {
  // Create the store using the simplified API
  const navigationStore = createStore<NavigationStore>(
    // Initial state creator function
    () => ({
      ...initialState,
      setRouter: () => {},
      navigate: () => {},
      back: () => {},
      forward: () => {},
      replace: () => {},
      updateState: () => {},
    }),
    // Configuration
    {
      name: enableDevtools ? "atomiton-navigation" : undefined,
    },
  );

  // Get store methods
  const setState = navigationStore.setState;
  const getState = navigationStore.getState;

  // Define actions and update the store
  setState({
    ...initialState,

    setRouter: (router) => {
      setState({ router });

      // Subscribe to router changes
      router.subscribe("onResolved", () => {
        const state = router.state;
        const currentRoute = state.location;
        setState({
          ...getState(),
          currentPath: currentRoute.pathname,
          previousPath:
            getState().currentPath !== currentRoute.pathname
              ? getState().currentPath
              : getState().previousPath,
          history: [...getState().history, currentRoute.pathname].slice(-50), // Keep last 50 entries
          params:
            ((state as unknown as Record<string, unknown>).params as Record<
              string,
              unknown
            >) || ({} as Record<string, unknown>),
          search: currentRoute.search || {},
          hash: currentRoute.hash || "",
          isNavigating: false,
        });
      });
    },

    navigate: (path, options) => {
      const { router } = getState();
      if (!router) {
        console.error("Router not initialized");
        return;
      }

      setState({ isNavigating: true });

      router.navigate({
        to: path,
        search: options?.search,
        hash: options?.hash,
        replace: options?.replace,
        state: options?.state as undefined,
      });
    },

    back: () => {
      const { router } = getState();
      if (!router) {
        console.error("Router not initialized");
        return;
      }
      router.history.go(-1);
    },

    forward: () => {
      const { router } = getState();
      if (!router) {
        console.error("Router not initialized");
        return;
      }
      router.history.go(1);
    },

    replace: (path, options) => {
      const { router } = getState();
      if (!router) {
        console.error("Router not initialized");
        return;
      }

      setState({ isNavigating: true });

      router.navigate({
        to: path,
        search: options?.search,
        hash: options?.hash,
        replace: true,
        state: options?.state as undefined,
      });
    },

    updateState: (updates) => {
      setState(updates);
    },
  });

  return navigationStore;
};
