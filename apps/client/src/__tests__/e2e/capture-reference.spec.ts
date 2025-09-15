import { test } from "@playwright/test";

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

test.describe("Reference App Screenshots", () => {
  for (const route of routes) {
    test(route.name, async ({ page }) => {
      // Navigate to the reference app (Brainwave)
      await page.goto(`https://brainwave2-app.vercel.app${route.path}`);
      await page.waitForLoadState("networkidle");

      // Save directly to comparison folder with -reference suffix
      const platform = test.info().project.name.includes("mobile")
        ? "mobile"
        : "desktop";
      await page.screenshot({
        path: `tests/snapshots/comparison/${platform}/${route.name}-reference.png`,
        fullPage: false, // Match the same setting as our app
      });
    });
  }
});
