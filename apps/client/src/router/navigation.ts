// Navigation helper functions that use the TanStack Router navigate function
import { navigate, router } from "#router";

// Preloading functions for programmatic route preloading
export function preloadEditor(id: string) {
  return router.preloadRoute({
    to: "/editor/$id" as any,
    params: { id } as any,
  });
}

export function preloadHome() {
  return router.preloadRoute({ to: "/" as any });
}

export function preloadExplore() {
  return router.preloadRoute({ to: "/explore" as any });
}

export function preloadExploreDetails() {
  return router.preloadRoute({ to: "/explore/details" as any });
}

export function preloadExploreDesigns() {
  return router.preloadRoute({ to: "/explore/designs" as any });
}

export function preloadExploreAnimations() {
  return router.preloadRoute({ to: "/explore/animations" as any });
}

export function preloadAssets3d() {
  return router.preloadRoute({ to: "/assets/3d-objects" as any });
}

export function preloadAssetsMaterials() {
  return router.preloadRoute({ to: "/assets/materials" as any });
}

export function preloadProfile() {
  return router.preloadRoute({ to: "/profile" as any });
}

export function preloadPricing() {
  return router.preloadRoute({ to: "/pricing" as any });
}

export function preloadLikes() {
  return router.preloadRoute({ to: "/likes" as any });
}

export function preloadUpdates() {
  return router.preloadRoute({ to: "/updates" as any });
}

export function preloadSignIn() {
  return router.preloadRoute({ to: "/sign-in" as any });
}

export function preloadCreateAccount() {
  return router.preloadRoute({ to: "/create-account" as any });
}

export function preloadResetPassword() {
  return router.preloadRoute({ to: "/reset-password" as any });
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
  navigate({
    to: "/editor/$id" as any,
    params: { id } as any,
    state: state as any,
  });
}

export function toHome() {
  navigate({ to: "/" as any });
}

export function toExplore() {
  navigate({ to: "/explore" as any });
}

export function toExploreDetails() {
  navigate({ to: "/explore/details" as any });
}

export function toExploreDesigns() {
  navigate({ to: "/explore/designs" as any });
}

export function toExploreAnimations() {
  navigate({ to: "/explore/animations" as any });
}

export function toAssets3d() {
  navigate({ to: "/assets/3d-objects" as any });
}

export function toAssetsMaterials() {
  navigate({ to: "/assets/materials" as any });
}

export function toProfile() {
  navigate({ to: "/profile" as any });
}

export function toPricing() {
  navigate({ to: "/pricing" as any });
}

export function toLikes() {
  navigate({ to: "/likes" as any });
}

export function toUpdates() {
  navigate({ to: "/updates" as any });
}

export function toSignIn() {
  navigate({ to: "/sign-in" as any });
}

export function toCreateAccount() {
  navigate({ to: "/create-account" as any });
}

export function toResetPassword() {
  navigate({ to: "/reset-password" as any });
}
