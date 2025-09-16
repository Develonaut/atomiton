import { bench, describe } from "vitest";
import { createRouter } from "../createRouter";

describe("Router Performance", () => {
  const routes = [
    {
      name: "home",
      path: "/",
      component: () => Promise.resolve({ default: () => null }),
    },
    {
      name: "editor",
      path: "/editor/$id",
      component: () => Promise.resolve({ default: () => null }),
    },
    {
      name: "profile",
      path: "/profile/{-$id}",
      component: () => Promise.resolve({ default: () => null }),
    },
  ];

  bench("createRouter - simple config", () => {
    createRouter({ routes });
  });

  bench("createRouter - with options", () => {
    createRouter({
      routes,
      enableDevtools: false,
      defaultPendingComponent: () => null,
      defaultErrorComponent: () => null,
    });
  });

  bench("router.navigate calls", () => {
    const router = createRouter({ routes });
    router.navigate({ to: "/" });
    router.navigate({ to: "/editor/123" });
    router.navigate({ to: "/profile/456" });
  });
});
