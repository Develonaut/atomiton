// Central path definitions for routes
export const PATHS = {
  HOME: "/",
  EXPLORE: "/explore",
  EXPLORE_DETAILS: "/explore/details",
  EXPLORE_DESIGNS: "/explore/designs",
  EXPLORE_ANIMATIONS: "/explore/animations",
  EDITOR: "/editor/$id",
  ASSETS_3D: "/assets/3d-objects",
  ASSETS_MATERIALS: "/assets/materials",
  PROFILE: "/profile/$id?", // Optional param for viewing specific profiles
  PRICING: "/pricing",
  LIKES: "/likes",
  UPDATES: "/updates",
  SIGN_IN: "/sign-in",
  CREATE_ACCOUNT: "/create-account",
  RESET_PASSWORD: "/reset-password",
} as const;
