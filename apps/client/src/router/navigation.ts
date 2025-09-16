// Navigation helper functions that use the TanStack Router navigate function
import { navigate, router } from "./index";
import { PATHS } from "./paths";

// Preloading functions for programmatic route preloading
export function preloadEditor(id: string) {
  return router.preloadRoute({ to: PATHS.EDITOR, params: { id } });
}

export function preloadHome() {
  return router.preloadRoute({ to: PATHS.HOME });
}

export function preloadExplore() {
  return router.preloadRoute({ to: PATHS.EXPLORE });
}

export function preloadExploreDetails() {
  return router.preloadRoute({ to: PATHS.EXPLORE_DETAILS });
}

export function preloadExploreDesigns() {
  return router.preloadRoute({ to: PATHS.EXPLORE_DESIGNS });
}

export function preloadExploreAnimations() {
  return router.preloadRoute({ to: PATHS.EXPLORE_ANIMATIONS });
}

export function preloadAssets3d() {
  return router.preloadRoute({ to: PATHS.ASSETS_3D });
}

export function preloadAssetsMaterials() {
  return router.preloadRoute({ to: PATHS.ASSETS_MATERIALS });
}

export function preloadProfile() {
  return router.preloadRoute({ to: PATHS.PROFILE });
}

export function preloadPricing() {
  return router.preloadRoute({ to: PATHS.PRICING });
}

export function preloadLikes() {
  return router.preloadRoute({ to: PATHS.LIKES });
}

export function preloadUpdates() {
  return router.preloadRoute({ to: PATHS.UPDATES });
}

export function preloadSignIn() {
  return router.preloadRoute({ to: PATHS.SIGN_IN });
}

export function preloadCreateAccount() {
  return router.preloadRoute({ to: PATHS.CREATE_ACCOUNT });
}

export function preloadResetPassword() {
  return router.preloadRoute({ to: PATHS.RESET_PASSWORD });
}

// Navigation functions that handle the complete navigation in one call
export function toEditor(
  id: string,
  state?: {
    defaultNodes?: unknown[]; // TODO: Replace with types from Editor Package
    defaultEdges?: unknown[]; // TODO: Replace with types from Editor Package
    blueprint?: unknown;
  },
) {
  navigate({ to: PATHS.EDITOR, params: { id }, state });
}

export function toHome() {
  navigate({ to: PATHS.HOME });
}

export function toExplore() {
  navigate({ to: PATHS.EXPLORE });
}

export function toExploreDetails() {
  navigate({ to: PATHS.EXPLORE_DETAILS });
}

export function toExploreDesigns() {
  navigate({ to: PATHS.EXPLORE_DESIGNS });
}

export function toExploreAnimations() {
  navigate({ to: PATHS.EXPLORE_ANIMATIONS });
}

export function toAssets3d() {
  navigate({ to: PATHS.ASSETS_3D });
}

export function toAssetsMaterials() {
  navigate({ to: PATHS.ASSETS_MATERIALS });
}

export function toProfile() {
  navigate({ to: PATHS.PROFILE });
}

export function toPricing() {
  navigate({ to: PATHS.PRICING });
}

export function toLikes() {
  navigate({ to: PATHS.LIKES });
}

export function toUpdates() {
  navigate({ to: PATHS.UPDATES });
}

export function toSignIn() {
  navigate({ to: PATHS.SIGN_IN });
}

export function toCreateAccount() {
  navigate({ to: PATHS.CREATE_ACCOUNT });
}

export function toResetPassword() {
  navigate({ to: PATHS.RESET_PASSWORD });
}
