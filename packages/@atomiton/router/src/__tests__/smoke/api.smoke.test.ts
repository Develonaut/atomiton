import { describe, expect, it } from "vitest";
import { createRouter } from "../../createRouter";

describe("Router API Smoke Test", () => {
  const routes = [
    { name: "home", path: "/", component: () => null },
    { name: "editor", path: "/editor/$id", component: () => null },
  ];

  it("exports createRouter function", () => {
    expect(createRouter).toBeDefined();
    expect(typeof createRouter).toBe("function");
  });

  it("returns object with expected API structure", () => {
    const routerInstance = createRouter({ routes });

    // Check that it returns an object with expected properties
    expect(routerInstance).toBeDefined();
    expect(typeof routerInstance).toBe("object");

    // Check core properties exist
    expect(routerInstance.router).toBeDefined();
    expect(routerInstance.navigate).toBeDefined();
    expect(routerInstance.useRouter).toBeDefined();
    expect(routerInstance.useNavigate).toBeDefined();
    expect(routerInstance.useCurrentRoute).toBeDefined();
    expect(routerInstance.useParams).toBeDefined();
    expect(routerInstance.usePathname).toBeDefined();
    expect(routerInstance.useLocation).toBeDefined();
    expect(routerInstance.Link).toBeDefined();
    expect(routerInstance.RouterProvider).toBeDefined();
  });

  it("has functional navigate method", () => {
    const routerInstance = createRouter({ routes });

    expect(typeof routerInstance.navigate).toBe("function");
    expect(typeof routerInstance.router.navigate).toBe("function");
  });

  it("has working hook factories", () => {
    const routerInstance = createRouter({ routes });

    expect(typeof routerInstance.useRouter).toBe("function");
    expect(typeof routerInstance.useNavigate).toBe("function");
    expect(typeof routerInstance.useParams).toBe("function");
  });
});
