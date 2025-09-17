import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RouterProvider, router, usePathname } from "../../index";

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

// Mock the main blueprint store hooks
vi.mock("@/stores/blueprint", () => ({
  useBlueprints: () => ({
    blueprints: [
      { id: "test-1", name: "Test Blueprint 1" },
      { id: "test-2", name: "Test Blueprint 2" },
    ],
    isLoading: false,
  }),
}));

// Mock LayoutEditor to avoid editor dependencies
vi.mock("@/components/LayoutEditor", () => ({
  default: () => <div data-testid="layout-editor">Layout Editor</div>,
}));

// Mock Layout component to avoid dependencies
vi.mock("@/components/Layout", () => ({
  default: ({ children, ...props }: React.ComponentProps<"div">) => (
    <div {...props}>{children}</div>
  ),
}));

// Mock Catalog component to avoid dependencies
vi.mock("@/components/Catalog", () => ({
  default: ({
    title,
    ...props
  }: React.ComponentProps<"div"> & { title: string }) => (
    <div {...props}>
      <h2>{title}</h2>
      <div>Catalog Content</div>
    </div>
  ),
}));

// Mock console.warn to avoid router warnings in tests
const originalWarn = console.warn;
beforeEach(() => {
  console.warn = vi.fn();
});

afterEach(() => {
  console.warn = originalWarn;
});

// Removed unused test components since RouterProvider doesn't accept children

describe("Router Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the RouterProvider without errors", () => {
    render(<RouterProvider />);
    // RouterProvider should render successfully
    expect(document.body).toBeInTheDocument();
  });

  it("should handle route changes", async () => {
    const { router } = await import("../../index");

    render(<RouterProvider />);

    // Test that router can navigate
    await router.navigate({ to: "/explore" });

    await waitFor(() => {
      expect(window.location.pathname).toBe("/explore");
    });
  });

  describe("Router API", () => {
    it("should expose router instance for direct access", () => {
      expect(router).toBeDefined();
      expect(router.navigate).toBeDefined();
    });

    it("should provide navigation function", async () => {
      const { navigate } = await import("../../index");
      expect(navigate).toBeDefined();
      expect(typeof navigate).toBe("function");
    });

    it("should provide usePathname hook", () => {
      expect(usePathname).toBeDefined();
      expect(typeof usePathname).toBe("function");
    });
  });
});
