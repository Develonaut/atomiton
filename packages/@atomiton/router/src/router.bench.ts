import { createRouter } from "#createRouter";
import { bench, describe } from "vitest";

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

  bench("router initialization performance", () => {
    // Test router creation overhead
    createRouter({ routes });
    createRouter({ routes, enableDevtools: false });
    createRouter({ routes, defaultPendingComponent: () => null });
  });
});
