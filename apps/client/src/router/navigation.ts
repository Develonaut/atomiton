// Navigation helper functions that use the navigate object
import { navigate } from "./index";
import { PATHS } from "./paths";

// Navigation functions that handle the complete navigation in one call
export function toEditor(
  id: string,
  state?: {
    defaultNodes?: unknown[]; // TODO: Replace with types from Editor Package
    defaultEdges?: unknown[]; // TODO: Replace with types from Editor Package
    blueprint?: unknown;
  },
) {
  navigate.to(PATHS.EDITOR, { params: { id }, state });
}

export function toHome() {
  navigate.to(PATHS.HOME);
}

export function toExplore() {
  navigate.to(PATHS.EXPLORE);
}

export function toExploreDetails() {
  navigate.to(PATHS.EXPLORE_DETAILS);
}

export function toExploreDesigns() {
  navigate.to(PATHS.EXPLORE_DESIGNS);
}

export function toExploreAnimations() {
  navigate.to(PATHS.EXPLORE_ANIMATIONS);
}

export function toAssets3d() {
  navigate.to(PATHS.ASSETS_3D);
}

export function toAssetsMaterials() {
  navigate.to(PATHS.ASSETS_MATERIALS);
}

export function toProfile(id?: string) {
  navigate.to(PATHS.PROFILE, id ? { params: { id } } : {});
}

export function toPricing() {
  navigate.to(PATHS.PRICING);
}

export function toLikes() {
  navigate.to(PATHS.LIKES);
}

export function toUpdates() {
  navigate.to(PATHS.UPDATES);
}

export function toSignIn() {
  navigate.to(PATHS.SIGN_IN);
}

export function toCreateAccount() {
  navigate.to(PATHS.CREATE_ACCOUNT);
}

export function toResetPassword() {
  navigate.to(PATHS.RESET_PASSWORD);
}
