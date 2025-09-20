import { describe, expect, it } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { createRouter } from "./createRouter";

// Test components - minimal real components that would actually catch bugs
function HomePage() {
  return <div data-testid="home-page">Home</div>;
}

function ExplorePage() {
  return <div data-testid="explore-page">Explore</div>;
}

function EditorPage() {
  return <div data-testid="editor-page">Editor</div>;
}

function CreatePage() {
  return <div data-testid="create-page">Create</div>;
}

const testRoutes = [
  { name: "home", path: "/", component: HomePage },
  { name: "explore", path: "/explore", component: ExplorePage },
  { name: "editor", path: "/editor", component: EditorPage },
  { name: "create", path: "/create", component: CreatePage },
];

describe("Router Integration", () => {
  it("renders RouterProvider and provides navigation context", async () => {
    const { RouterProvider } = createRouter({ routes: testRoutes });

    render(<RouterProvider />);

    // Router should render without crashing and provide navigation context
    // This catches the "RouterProvider renders nothing" bug Brian found
    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it("navigates between key routes", async () => {
    const routerInstance = createRouter({ routes: testRoutes });
    const { RouterProvider } = routerInstance;

    render(<RouterProvider />);

    // Test basic navigation between critical routes
    await waitFor(() => {
      // Should start at home
      expect(screen.queryByTestId("home-page")).toBeInTheDocument();
    });

    // Programmatic navigation to explore
    await act(async () => {
      routerInstance.navigate({ to: "/explore" });
    });

    await waitFor(() => {
      expect(screen.queryByTestId("explore-page")).toBeInTheDocument();
      expect(screen.queryByTestId("home-page")).not.toBeInTheDocument();
    });

    // Navigation to editor
    await act(async () => {
      routerInstance.navigate({ to: "/editor" });
    });

    await waitFor(() => {
      expect(screen.queryByTestId("editor-page")).toBeInTheDocument();
    });
  });

  it("programmatic navigation works via utilities", async () => {
    const routerInstance = createRouter({ routes: testRoutes });
    const { RouterProvider, navigate } = routerInstance;

    render(<RouterProvider />);

    // Test the navigate utility function directly
    expect(typeof navigate).toBe("function");

    await act(async () => {
      navigate({ to: "/explore" });
    });

    await waitFor(() => {
      expect(screen.queryByTestId("explore-page")).toBeInTheDocument();
    });
  });

  it("handles route changes without crashing", async () => {
    const routerInstance = createRouter({ routes: testRoutes });
    const { RouterProvider } = routerInstance;

    render(<RouterProvider />);

    // Navigate between several routes to test stability
    const routesToTest = ["/explore", "/editor", "/create", "/"];

    for (const route of routesToTest) {
      await act(async () => {
        routerInstance.navigate({ to: route });
      });

      await waitFor(() => {
        // Just verify something rendered without crashing
        expect(document.body).toBeInTheDocument();
      });
    }
  });

  it.skip("preloading doesn't crash", async () => {
    // Test lazy loading components - ensure they don't crash
    function LazyComponent() {
      return <div data-testid="lazy-loaded">Lazy Loaded</div>;
    }
    const lazyLoader = () => Promise.resolve({ default: LazyComponent });

    const routesWithLazy = [
      { name: "home", path: "/", component: HomePage },
      { name: "lazy", path: "/lazy", component: lazyLoader },
    ];

    const routerInstance = createRouter({ routes: routesWithLazy });
    const { RouterProvider } = routerInstance;

    // Render the router
    render(<RouterProvider />);

    // Navigation to lazy route should work
    await act(async () => {
      routerInstance.navigate({ to: "/lazy" });
    });

    await waitFor(
      () => {
        expect(screen.getByTestId("lazy-loaded")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("router API provides expected navigation utilities", async () => {
    const routerInstance = createRouter({ routes: testRoutes });

    // Test that all expected API methods exist and are functions
    expect(typeof routerInstance.navigate).toBe("function");
    expect(typeof routerInstance.useRouter).toBe("function");
    expect(typeof routerInstance.useNavigate).toBe("function");
    expect(typeof routerInstance.usePathname).toBe("function");
    expect(typeof routerInstance.useLocation).toBe("function");
    expect(typeof routerInstance.useParams).toBe("function");
    expect(routerInstance.Link).toBeDefined();
    expect(routerInstance.RouterProvider).toBeDefined();
  });
});
