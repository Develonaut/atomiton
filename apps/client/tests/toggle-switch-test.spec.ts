import { test } from "@playwright/test";

test.use({
  viewport: { width: 1920, height: 1080 },
});

test("Debug toggle switch attributes", async ({ page }) => {
  await page.goto("/create");
  await page.waitForLoadState("networkidle");

  // Find the Show Frame toggle
  const toggleLabel = page.locator('text="Show Frame"').first();
  const toggle = toggleLabel
    .locator("..")
    .locator('button[role="switch"]')
    .first();

  // Get initial state
  const initialState = await toggle.evaluate((el) => {
    return {
      checked: el.getAttribute("aria-checked"),
      dataChecked: el.getAttribute("data-checked"),
      dataState: el.getAttribute("data-state"),
      dataHeadlessuiState: el.getAttribute("data-headlessui-state"),
      classList: Array.from(el.classList),
      computedStyles: {
        backgroundColor: window.getComputedStyle(el).backgroundColor,
        backgroundImage: window.getComputedStyle(el).backgroundImage,
      },
    };
  });

  console.error("Initial toggle state:", JSON.stringify(initialState, null, 2));

  // Click to toggle
  await toggle.click();
  await page.waitForTimeout(300);

  // Get state after click
  const afterClickState = await toggle.evaluate((el) => {
    return {
      checked: el.getAttribute("aria-checked"),
      dataChecked: el.getAttribute("data-checked"),
      dataState: el.getAttribute("data-state"),
      dataHeadlessuiState: el.getAttribute("data-headlessui-state"),
      classList: Array.from(el.classList),
      computedStyles: {
        backgroundColor: window.getComputedStyle(el).backgroundColor,
        backgroundImage: window.getComputedStyle(el).backgroundImage,
      },
    };
  });

  console.error("After click state:", JSON.stringify(afterClickState, null, 2));

  // Check if the inner span moved
  const innerSpan = toggle.locator("span").first();
  const initialSpanTransform = await innerSpan.evaluate((el) => {
    return {
      transform: window.getComputedStyle(el).transform,
      classList: Array.from(el.classList),
    };
  });

  console.error(
    "Initial inner span state:",
    JSON.stringify(initialSpanTransform, null, 2),
  );

  // Click again to toggle back
  await toggle.click();
  await page.waitForTimeout(300);

  const finalSpanTransform = await innerSpan.evaluate((el) => {
    return {
      transform: window.getComputedStyle(el).transform,
      classList: Array.from(el.classList),
    };
  });

  console.error(
    "Final inner span state:",
    JSON.stringify(finalSpanTransform, null, 2),
  );
});
