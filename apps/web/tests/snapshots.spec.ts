import { test, expect } from "@playwright/test";

const routes = [
  { path: "/", name: "home" },
  { path: "/create", name: "create" },
  { path: "/explore", name: "explore" },
  { path: "/explore/details", name: "explore-details" },
  { path: "/explore/designs", name: "explore-designs" },
  { path: "/explore/animations", name: "explore-animations" },
  { path: "/profile", name: "profile" },
  { path: "/pricing", name: "pricing" },
  { path: "/likes", name: "likes" },
  { path: "/updates", name: "updates" },
  { path: "/sign-in", name: "sign-in" },
  { path: "/create-account", name: "create-account" },
  { path: "/reset-password", name: "reset-password" },
  { path: "/assets/3d-objects", name: "assets-3d-objects" },
  { path: "/assets/materials", name: "assets-materials" },
];

test.describe("Visual Snapshots", () => {
  for (const route of routes) {
    test(route.name, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot(`${route.name}.png`);
    });
  }
});
