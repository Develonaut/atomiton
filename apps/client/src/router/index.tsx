import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { RouteErrorBoundary } from "../components/RouteErrorBoundary";

// Loading component for lazy loaded routes
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>
  );
}

// Lazy load all route components for code splitting
const HomePage = lazy(() => import("../templates/HomePage"));
const CreatePage = lazy(() => import("../templates/CreatePage"));
const ExplorePage = lazy(() => import("../templates/Explore/ExplorePage"));
const DetailsPageAdapter = lazy(
  () => import("../components/DetailsPageAdapter"),
);
const DesignsPage = lazy(() => import("../templates/Explore/DesignsPage"));
const AnimationsPage = lazy(
  () => import("../templates/Explore/AnimationsPage"),
);
const ProfilePage = lazy(() => import("../templates/ProfilePage"));
const PricingPage = lazy(() => import("../templates/PricingPage"));
const LikesPage = lazy(() => import("../templates/LikesPage"));
const UpdatesPage = lazy(() => import("../templates/UpdatesPage"));
const SignInPageAdapter = lazy(() => import("../components/SignInPageAdapter"));
const CreateAccountPageAdapter = lazy(
  () => import("../components/CreateAccountPageAdapter"),
);
const ResetPasswordPageAdapter = lazy(
  () => import("../components/ResetPasswordPageAdapter"),
);
const AssetsObjects3dPage = lazy(
  () => import("../templates/Assets/Objects3dPage"),
);
const AssetsMaterialsPage = lazy(
  () => import("../templates/Assets/MaterialsPage"),
);

// Wrapper component to handle suspense
function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

// Root layout for error boundary
const RootLayout = lazy(() => import("../layouts/RootLayout"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <SuspenseWrapper>
        <RootLayout />
      </SuspenseWrapper>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [],
  },
  {
    index: true,
    element: (
      <SuspenseWrapper>
        <HomePage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "create",
    element: (
      <SuspenseWrapper>
        <CreatePage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "explore",
    element: (
      <SuspenseWrapper>
        <ExplorePage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "explore/details",
    element: (
      <SuspenseWrapper>
        <DetailsPageAdapter />
      </SuspenseWrapper>
    ),
  },
  {
    path: "explore/designs",
    element: (
      <SuspenseWrapper>
        <DesignsPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "explore/animations",
    element: (
      <SuspenseWrapper>
        <AnimationsPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "profile",
    element: (
      <SuspenseWrapper>
        <ProfilePage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "pricing",
    element: (
      <SuspenseWrapper>
        <PricingPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "likes",
    element: (
      <SuspenseWrapper>
        <LikesPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "updates",
    element: (
      <SuspenseWrapper>
        <UpdatesPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "sign-in",
    element: (
      <SuspenseWrapper>
        <SignInPageAdapter />
      </SuspenseWrapper>
    ),
  },
  {
    path: "create-account",
    element: (
      <SuspenseWrapper>
        <CreateAccountPageAdapter />
      </SuspenseWrapper>
    ),
  },
  {
    path: "reset-password",
    element: (
      <SuspenseWrapper>
        <ResetPasswordPageAdapter />
      </SuspenseWrapper>
    ),
  },
  {
    path: "assets/3d-objects",
    element: (
      <SuspenseWrapper>
        <AssetsObjects3dPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "assets/materials",
    element: (
      <SuspenseWrapper>
        <AssetsMaterialsPage />
      </SuspenseWrapper>
    ),
  },
]);
