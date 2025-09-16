import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Link, RouterProvider, usePathname } from "../../index";

// Mock the templates to avoid store dependencies
vi.mock("@/components/Templates", () => ({
  default: () => <div data-testid="templates">Templates Component</div>,
}));

// Mock the blueprint store to avoid dependencies
vi.mock("@/stores/blueprint/store", () => ({
  blueprintStore: {
    getBlueprint: vi.fn(() => ({
      id: "test-id",
      nodes: [],
      edges: [],
    })),
  },
}));

// Mock the hooks to avoid store dependencies
vi.mock("@/stores/blueprint/hooks", () => ({
  useTemplateBlueprints: () => ({ templates: [] }),
  useUserBlueprints: () => ({ blueprints: [] }),
}));

// Mock LayoutEditor to avoid editor dependencies
vi.mock("@/components/LayoutEditor", () => ({
  default: () => <div data-testid="layout-editor">Layout Editor</div>,
}));

// Create a test component that shows current pathname
function CurrentPath() {
  const pathname = usePathname();
  return <div data-testid="current-path">{pathname}</div>;
}

// Test component with router and current path display
function TestApp() {
  return (
    <RouterProvider>
      <div>
        <CurrentPath />
        <nav>
          <Link to="/" data-testid="home-link">
            Home
          </Link>
          <Link to="/explore" data-testid="explore-link">
            Explore
          </Link>
          <Link to="/explore/designs" data-testid="designs-link">
            Designs
          </Link>
          <Link to="/explore/animations" data-testid="animations-link">
            Animations
          </Link>
          <Link to="/profile" data-testid="profile-link">
            Profile
          </Link>
        </nav>
      </div>
    </RouterProvider>
  );
}

describe("Router Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the RouterProvider without errors", () => {
    render(<TestApp />);
    expect(screen.getByTestId("current-path")).toBeInTheDocument();
  });

  it("should show current pathname", async () => {
    render(<TestApp />);

    // Should start at home route
    await waitFor(() => {
      expect(screen.getByTestId("current-path")).toHaveTextContent("/");
    });
  });

  it("should navigate when clicking links", async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    // Click explore link
    await user.click(screen.getByTestId("explore-link"));

    await waitFor(() => {
      expect(screen.getByTestId("current-path")).toHaveTextContent("/explore");
    });
  });

  it("should navigate to nested routes", async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    // Click designs link
    await user.click(screen.getByTestId("designs-link"));

    await waitFor(() => {
      expect(screen.getByTestId("current-path")).toHaveTextContent(
        "/explore/designs",
      );
    });
  });

  it("should navigate to animations route", async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    // Click animations link
    await user.click(screen.getByTestId("animations-link"));

    await waitFor(() => {
      expect(screen.getByTestId("current-path")).toHaveTextContent(
        "/explore/animations",
      );
    });
  });

  it("should navigate back to home", async () => {
    const user = userEvent.setup();
    render(<TestApp />);

    // Navigate away first
    await user.click(screen.getByTestId("profile-link"));
    await waitFor(() => {
      expect(screen.getByTestId("current-path")).toHaveTextContent("/profile");
    });

    // Then navigate back to home
    await user.click(screen.getByTestId("home-link"));
    await waitFor(() => {
      expect(screen.getByTestId("current-path")).toHaveTextContent("/");
    });
  });

  describe("Router Hooks", () => {
    function HooksTestComponent() {
      const pathname = usePathname();

      return (
        <div>
          <div data-testid="hook-pathname">{pathname}</div>
        </div>
      );
    }

    it("should provide pathname through usePathname hook", async () => {
      render(
        <RouterProvider>
          <HooksTestComponent />
          <Link to="/explore" data-testid="nav-link">
            Navigate
          </Link>
        </RouterProvider>,
      );

      const user = userEvent.setup();

      // Should start at root
      expect(screen.getByTestId("hook-pathname")).toHaveTextContent("/");

      // Navigate and check hook updates
      await user.click(screen.getByTestId("nav-link"));

      await waitFor(() => {
        expect(screen.getByTestId("hook-pathname")).toHaveTextContent(
          "/explore",
        );
      });
    });
  });

  describe("Link Component", () => {
    it("should render links with correct href attributes", () => {
      render(<TestApp />);

      const homeLink = screen.getByTestId("home-link");
      const exploreLink = screen.getByTestId("explore-link");

      expect(homeLink).toHaveAttribute("href", "/");
      expect(exploreLink).toHaveAttribute("href", "/explore");
    });

    it("should apply custom className to links", () => {
      render(
        <RouterProvider>
          <Link to="/" className="custom-class" data-testid="styled-link">
            Styled Link
          </Link>
        </RouterProvider>,
      );

      expect(screen.getByTestId("styled-link")).toHaveClass("custom-class");
    });
  });
});
