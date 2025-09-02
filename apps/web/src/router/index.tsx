import React from "react";
import { createBrowserRouter } from "react-router-dom";

// Import template components - using relative paths for Vite
import HomePage from "../templates/HomePage";
import CreatePage from "../templates/CreatePage";
import ExplorePage from "../templates/Explore/ExplorePage";
import DetailsPageAdapter from "../components/DetailsPageAdapter";
import DesignsPage from "../templates/Explore/DesignsPage";
import AnimationsPage from "../templates/Explore/AnimationsPage";
import ProfilePage from "../templates/ProfilePage";
import PricingPage from "../templates/PricingPage";
import LikesPage from "../templates/LikesPage";
import UpdatesPage from "../templates/UpdatesPage";
import SignInPageAdapter from "../components/SignInPageAdapter";
import CreateAccountPageAdapter from "../components/CreateAccountPageAdapter";
import ResetPasswordPageAdapter from "../components/ResetPasswordPageAdapter";
import AssetsObjects3dPage from "../templates/Assets/Objects3dPage";
import AssetsMaterialsPage from "../templates/Assets/MaterialsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/create",
    element: <CreatePage />,
  },
  {
    path: "/explore",
    element: <ExplorePage />,
  },
  {
    path: "/explore/details",
    element: <DetailsPageAdapter />,
  },
  {
    path: "/explore/designs",
    element: <DesignsPage />,
  },
  {
    path: "/explore/animations",
    element: <AnimationsPage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/pricing",
    element: <PricingPage />,
  },
  {
    path: "/likes",
    element: <LikesPage />,
  },
  {
    path: "/updates",
    element: <UpdatesPage />,
  },
  {
    path: "/sign-in",
    element: <SignInPageAdapter />,
  },
  {
    path: "/create-account",
    element: <CreateAccountPageAdapter />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPageAdapter />,
  },
  {
    path: "/assets/3d-objects",
    element: <AssetsObjects3dPage />,
  },
  {
    path: "/assets/materials",
    element: <AssetsMaterialsPage />,
  },
]);
