import { beforeEach, describe, expect, it, vi } from "vitest";
import * as navigationModule from "./navigation";
import { navigate, router } from "./index";

// Mock the router exports
vi.mock("./index", () => ({
  navigate: vi.fn(),
  router: {
    preloadRoute: vi.fn(),
  },
}));

const mockNavigate = vi.mocked(navigate);
const mockPreloadRoute = vi.mocked(router.preloadRoute);

describe("Navigation Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Navigation Functions", () => {
    it("should navigate to editor with correct parameters", () => {
      const testId = "test-blueprint-123";
      const testState = {
        defaultNodes: [{ id: "node1" }],
        defaultEdges: [{ id: "edge1" }],
      };

      navigationModule.toEditor(testId, testState);

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/editor/$id",
        params: { id: testId },
        state: testState,
      });
    });

    it("should navigate to editor without state", () => {
      const testId = "test-blueprint-456";

      navigationModule.toEditor(testId);

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/editor/$id",
        params: { id: testId },
        state: undefined,
      });
    });

    it("should navigate to home", () => {
      navigationModule.toHome();

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/",
      });
    });

    it("should navigate to explore", () => {
      navigationModule.toExplore();

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/explore",
      });
    });

    it("should navigate to explore details", () => {
      navigationModule.toExploreDetails();

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/explore/details",
      });
    });

    it("should navigate to explore designs", () => {
      navigationModule.toExploreDesigns();

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/explore/designs",
      });
    });

    it("should navigate to explore animations", () => {
      navigationModule.toExploreAnimations();

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/explore/animations",
      });
    });

    it("should navigate to assets 3d", () => {
      navigationModule.toAssets3d();

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/assets/3d-objects",
      });
    });

    it("should navigate to assets materials", () => {
      navigationModule.toAssetsMaterials();

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/assets/materials",
      });
    });

    it("should navigate to profile", () => {
      navigationModule.toProfile();

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/profile",
      });
    });

    it("should navigate to pricing", () => {
      navigationModule.toPricing();

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/pricing",
      });
    });

    it("should navigate to likes", () => {
      navigationModule.toLikes();

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/likes",
      });
    });

    it("should navigate to updates", () => {
      navigationModule.toUpdates();

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/updates",
      });
    });

    it("should navigate to sign in", () => {
      navigationModule.toSignIn();

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/sign-in",
      });
    });

    it("should navigate to create account", () => {
      navigationModule.toCreateAccount();

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/create-account",
      });
    });

    it("should navigate to reset password", () => {
      navigationModule.toResetPassword();

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/reset-password",
      });
    });
  });

  describe("Preloading Functions", () => {
    it("should preload editor route with id", () => {
      const testId = "test-blueprint-789";

      navigationModule.preloadEditor(testId);

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/editor/$id",
        params: { id: testId },
      });
    });

    it("should preload home route", () => {
      navigationModule.preloadHome();

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/",
      });
    });

    it("should preload explore route", () => {
      navigationModule.preloadExplore();

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/explore",
      });
    });

    it("should preload explore details route", () => {
      navigationModule.preloadExploreDetails();

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/explore/details",
      });
    });

    it("should preload explore designs route", () => {
      navigationModule.preloadExploreDesigns();

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/explore/designs",
      });
    });

    it("should preload explore animations route", () => {
      navigationModule.preloadExploreAnimations();

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/explore/animations",
      });
    });

    it("should preload assets 3d route", () => {
      navigationModule.preloadAssets3d();

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/assets/3d-objects",
      });
    });

    it("should preload assets materials route", () => {
      navigationModule.preloadAssetsMaterials();

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/assets/materials",
      });
    });

    it("should preload profile route", () => {
      navigationModule.preloadProfile();

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/profile",
      });
    });

    it("should preload pricing route", () => {
      navigationModule.preloadPricing();

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/pricing",
      });
    });

    it("should preload likes route", () => {
      navigationModule.preloadLikes();

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/likes",
      });
    });

    it("should preload updates route", () => {
      navigationModule.preloadUpdates();

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/updates",
      });
    });

    it("should preload sign in route", () => {
      navigationModule.preloadSignIn();

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/sign-in",
      });
    });

    it("should preload create account route", () => {
      navigationModule.preloadCreateAccount();

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/create-account",
      });
    });

    it("should preload reset password route", () => {
      navigationModule.preloadResetPassword();

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/reset-password",
      });
    });
  });

  describe("Return Values", () => {
    it("should return promises from preload functions", () => {
      const mockPromise = Promise.resolve();
      mockPreloadRoute.mockReturnValue(mockPromise);

      const result = navigationModule.preloadHome();

      expect(result).toBe(mockPromise);
    });
  });
});
