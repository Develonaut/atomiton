import { test } from "@playwright/test";

test.describe("Baseline Screenshots - Full Page Capture", () => {
  const pages = [
    { name: "Home", path: "/", splitSections: false },
    { name: "Buttons", path: "/buttons", splitSections: true },
    { name: "Cards", path: "/cards", splitSections: true },
    { name: "Colors", path: "/colors", splitSections: false },
    { name: "Comment", path: "/comment", splitSections: false },
    { name: "Depths", path: "/depths", splitSections: false },
    { name: "Dropdown", path: "/dropdown", splitSections: false },
    { name: "Iconography", path: "/iconography", splitSections: true },
    { name: "Inputs", path: "/inputs", splitSections: true },
    { name: "Menu", path: "/menu", splitSections: false },
    { name: "Modal", path: "/modal", splitSections: true },
    { name: "Notifications", path: "/notifications", splitSections: true },
    { name: "Prompt Input", path: "/prompt-input", splitSections: false },
    { name: "Sidebar", path: "/sidebar", splitSections: true },
    { name: "Toolbar", path: "/toolbar", splitSections: false },
    { name: "Topbar", path: "/topbar", splitSections: false },
    { name: "Typography", path: "/typography", splitSections: true },
  ];

  for (const page of pages) {
    test(`Capture ${page.name} page - Full Page`, async ({
      page: browserPage,
    }) => {
      // Navigate to the page
      await browserPage.goto(page.path);

      // Wait for the page to be fully loaded
      await browserPage.waitForLoadState("networkidle");

      // Wait a bit more for any animations to complete
      await browserPage.waitForTimeout(1000);

      // Get the full page dimensions
      const dimensions = await browserPage.evaluate(() => {
        return {
          width: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight,
        };
      });

      // Set viewport to capture the full page
      await browserPage.setViewportSize({
        width: Math.max(1280, dimensions.width),
        height: dimensions.height,
      });

      // Take full page screenshot
      await browserPage.screenshot({
        path: `screenshots/baseline-${page.name.toLowerCase().replace(/\s+/g, "-")}.png`,
        fullPage: true,
      });

      console.log(
        `✅ Captured full page screenshot for ${page.name} (${dimensions.width}x${dimensions.height}px)`,
      );

      // For tall pages (>2500px), also capture viewport sections
      if (page.splitSections && dimensions.height > 2500) {
        const viewportHeight = 1200;
        const sections = Math.ceil(dimensions.height / viewportHeight);

        console.log(`📸 Capturing ${sections} sections for ${page.name}`);

        for (let i = 0; i < sections; i++) {
          const yPosition = i * viewportHeight;

          // Scroll to section
          await browserPage.evaluate((y) => window.scrollTo(0, y), yPosition);
          await browserPage.waitForTimeout(500); // Wait for scroll to complete

          // Capture section screenshot
          await browserPage.screenshot({
            path: `screenshots/baseline-${page.name.toLowerCase().replace(/\s+/g, "-")}-section-${i + 1}.png`,
            clip: {
              x: 0,
              y: yPosition,
              width: 1280,
              height: Math.min(viewportHeight, dimensions.height - yPosition),
            },
          });

          console.log(`  ✅ Section ${i + 1}/${sections} captured`);
        }
      }
    });
  }
});
