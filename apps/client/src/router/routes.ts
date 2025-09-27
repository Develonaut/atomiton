import type { RouteConfig } from "@atomiton/router";

export const routes: RouteConfig[] = [
  {
    name: "home",
    path: "/",
    component: () => import("../templates/HomePage"),
  },
  {
    name: "explore",
    path: "/explore",
    component: () => import("../templates/Explore/ExplorePage"),
  },
  {
    name: "exploreDetails",
    path: "/explore/details",
    component: () => import("../components/DetailsPageAdapter"),
  },
  {
    name: "exploreDesigns",
    path: "/explore/designs",
    component: () => import("../templates/Explore/DesignsPage"),
  },
  {
    name: "exploreAnimations",
    path: "/explore/animations",
    component: () => import("../templates/Explore/AnimationsPage"),
  },
  {
    name: "profile",
    path: "/profile",
    component: () => import("../templates/ProfilePage"),
  },
  {
    name: "pricing",
    path: "/pricing",
    component: () => import("../templates/PricingPage"),
  },
  {
    name: "likes",
    path: "/likes",
    component: () => import("../templates/LikesPage"),
  },
  {
    name: "updates",
    path: "/updates",
    component: () => import("../templates/UpdatesPage"),
  },
  {
    name: "signIn",
    path: "/sign-in",
    component: () => import("../components/SignInPageAdapter"),
  },
  {
    name: "createAccount",
    path: "/create-account",
    component: () => import("../components/CreateAccountPageAdapter"),
  },
  {
    name: "resetPassword",
    path: "/reset-password",
    component: () => import("../components/ResetPasswordPageAdapter"),
  },
  {
    name: "editor",
    path: "/editor/$id",
    component: () => import("../templates/EditorPage"),
  },
  {
    name: "assets3d",
    path: "/assets/3d-objects",
    component: () => import("../templates/Assets/Objects3dPage"),
  },
  {
    name: "assetsMaterials",
    path: "/assets/materials",
    component: () => import("../templates/Assets/MaterialsPage"),
  },
  // Debug route only available in development
  ...(import.meta.env.DEV
    ? [
        {
          name: "debug",
          path: "/debug",
          component: () => import("../templates/DebugPage"),
        },
      ]
    : []),
  {
    name: "notFound",
    path: "*",
    component: () => import("../templates/NotFoundPage"),
  },
];
