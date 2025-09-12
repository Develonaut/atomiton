import { test } from "@playwright/test";

test.use({
  viewport: { width: 1920, height: 1080 },
});

test("Debug HeadlessUI attributes", async ({ page }) => {
  await page.goto("/create");
  await page.waitForLoadState("networkidle");

  // Find and click the Inspiration dropdown
  const dropdown = page.locator('button:has-text("Inspiration")').first();
  await dropdown.click();
  await page.waitForTimeout(300);

  // Get the listbox element and all its attributes
  const listbox = page.locator('[role="listbox"]').first();
  const attributes = await listbox.evaluate((el) => {
    const attrs: Record<string, string> = {};
    for (const attr of el.attributes) {
      attrs[attr.name] = attr.value;
    }
    return {
      attributes: attrs,
      computedStyle: {
        display: window.getComputedStyle(el).display,
        opacity: window.getComputedStyle(el).opacity,
        visibility: window.getComputedStyle(el).visibility,
        transform: window.getComputedStyle(el).transform,
        position: window.getComputedStyle(el).position,
      },
      classList: Array.from(el.classList),
      innerHTML: el.innerHTML.substring(0, 200),
    };
  });

  console.error("Listbox details:", JSON.stringify(attributes, null, 2));
});
