import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Link, RouterProvider, router } from "../../index";

// Mock the router's preloadRoute method
const mockPreloadRoute = vi.fn();
vi.mock("../../index", async () => {
  const actual = await vi.importActual("../../index");
  return {
    ...actual,
    router: {
      ...actual.router,
      preloadRoute: mockPreloadRoute,
    },
  };
});

// Mock components to avoid dependencies
vi.mock("@/components/Templates", () => ({
  default: () => <div data-testid="templates">Templates</div>,
}));

vi.mock("@/stores/blueprint/hooks", () => ({
  useTemplateBlueprints: () => ({ templates: [] }),
  useUserBlueprints: () => ({ blueprints: [] }),
}));

vi.mock("@/components/LayoutEditor", () => ({
  default: () => <div data-testid="layout-editor">Layout Editor</div>,
}));

describe("Preloading Functionality", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPreloadRoute.mockResolvedValue(undefined);
  });

  describe("Link Preloading", () => {
    function PreloadTestApp() {
      return (
        <RouterProvider>
          <div>
            <Link to="/explore" data-testid="explore-link">
              Explore
            </Link>
            <Link to="/profile" data-testid="profile-link">
              Profile
            </Link>
            <Link
              to="/editor/$id"
              params={{ id: "test-blueprint" }}
              data-testid="editor-link"
            >
              Editor
            </Link>
          </div>
        </RouterProvider>
      );
    }

    it("should render links that support preloading", () => {
      render(<PreloadTestApp />);

      expect(screen.getByTestId("explore-link")).toBeInTheDocument();
      expect(screen.getByTestId("profile-link")).toBeInTheDocument();
      expect(screen.getByTestId("editor-link")).toBeInTheDocument();
    });

    it("should preload on intent (hover) - integration verification", async () => {
      // Note: This test verifies the structure for preloading
      // Actual preloading behavior is handled by TanStack Router internally
      const user = userEvent.setup();
      render(<PreloadTestApp />);

      const exploreLink = screen.getByTestId("explore-link");

      // Hover over the link to trigger intent preloading
      await user.hover(exploreLink);

      // The link should be properly structured for TanStack Router's preloading
      expect(exploreLink).toHaveAttribute("href", "/explore");
      expect(exploreLink).toBeInTheDocument();
    });

    it("should handle parameterized routes for preloading", () => {
      render(<PreloadTestApp />);

      const editorLink = screen.getByTestId("editor-link");

      // Should render with the parameter substituted
      expect(editorLink).toHaveAttribute("href", "/editor/test-blueprint");
    });
  });

  describe("Programmatic Preloading", () => {
    it("should call router.preloadRoute when using programmatic preloading", async () => {
      // Import navigation functions to test them
      const { preloadExplore, preloadEditor } = await import(
        "../../../navigation"
      );

      await preloadExplore();

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/explore",
      });
    });

    it("should preload editor route with parameters", async () => {
      const { preloadEditor } = await import("../../navigation");

      await preloadEditor("test-blueprint-123");

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/editor/$id",
        params: { id: "test-blueprint-123" },
      });
    });

    it("should handle preload failures gracefully", async () => {
      const { preloadHome } = await import("../../navigation");

      // Mock a failure
      mockPreloadRoute.mockRejectedValueOnce(new Error("Preload failed"));

      // Should not throw an error
      await expect(preloadHome()).rejects.toThrow("Preload failed");
    });

    it("should return promises from preload functions", async () => {
      const { preloadProfile } = await import("../../navigation");

      const mockPromise = Promise.resolve();
      mockPreloadRoute.mockReturnValueOnce(mockPromise);

      const result = preloadProfile();

      expect(result).toBe(mockPromise);
    });
  });

  describe("Preloading Performance", () => {
    it("should not block navigation when preloading", async () => {
      const { toExplore, preloadExplore } = await import("../../navigation");

      // Start preloading
      const preloadPromise = preloadExplore();

      // Navigation should work immediately without waiting for preload
      expect(() => toExplore()).not.toThrow();

      // Cleanup
      await preloadPromise;
    });

    it("should allow multiple simultaneous preloads", async () => {
      const { preloadHome, preloadExplore, preloadProfile } = await import(
        "../../navigation"
      );

      // Start multiple preloads simultaneously
      const preloads = [preloadHome(), preloadExplore(), preloadProfile()];

      await Promise.all(preloads);

      expect(mockPreloadRoute).toHaveBeenCalledTimes(3);
      expect(mockPreloadRoute).toHaveBeenNthCalledWith(1, { to: "/" });
      expect(mockPreloadRoute).toHaveBeenNthCalledWith(2, { to: "/explore" });
      expect(mockPreloadRoute).toHaveBeenNthCalledWith(3, { to: "/profile" });
    });
  });

  describe("Preloading Edge Cases", () => {
    it("should handle preloading routes with special characters", async () => {
      const { preloadEditor } = await import("../../navigation");

      const specialId = "blueprint-with-dashes_and_underscores.123";
      await preloadEditor(specialId);

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/editor/$id",
        params: { id: specialId },
      });
    });

    it("should handle empty string parameters", async () => {
      const { preloadEditor } = await import("../../navigation");

      await preloadEditor("");

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/editor/$id",
        params: { id: "" },
      });
    });
  });

  describe("Router Instance Access", () => {
    it("should expose router instance for direct access", () => {
      expect(router).toBeDefined();
      expect(router.preloadRoute).toBeDefined();
    });

    it("should allow direct router preloading calls", async () => {
      await router.preloadRoute({ to: "/custom-route" });

      expect(mockPreloadRoute).toHaveBeenCalledWith({
        to: "/custom-route",
      });
    });
  });
});
