import { test } from "@playwright/test";

test.use({
  viewport: { width: 1920, height: 1080 },
});

test("Debug dropdown CSS classes", async ({ page }) => {
  await page.goto("http://localhost:3001/create");
  await page.waitForLoadState("networkidle");

  // Click the dropdown
  const dropdown = page.locator('button:has-text("Inspiration")').first();
  await dropdown.click();
  await page.waitForTimeout(300);

  // Get the listbox and check its computed styles
  const listbox = page.locator('[role="listbox"]').first();

  // Get the actual CSS classes and computed styles
  const styles = await listbox.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();

    // Check if data-[closed] selector is working
    const testEl = document.createElement("div");
    testEl.className = "data-[closed]:opacity-0";
    testEl.setAttribute("data-closed", "");
    document.body.appendChild(testEl);
    const testComputed = window.getComputedStyle(testEl);
    const testOpacity = testComputed.opacity;
    document.body.removeChild(testEl);

    return {
      classList: Array.from(el.classList),
      attributes: {
        "data-open": el.getAttribute("data-open"),
        "data-closed": el.getAttribute("data-closed"),
        "data-headlessui-state": el.getAttribute("data-headlessui-state"),
      },
      computedStyles: {
        opacity: computed.opacity,
        transform: computed.transform,
        scale: computed.scale,
        position: computed.position,
        top: computed.top,
        display: computed.display,
        visibility: computed.visibility,
      },
      boundingBox: {
        top: rect.top,
        bottom: rect.bottom,
        isVisible: rect.bottom > 0 && rect.top < window.innerHeight,
      },
      testDataClosedSelector: {
        opacity: testOpacity,
        working: testOpacity === "0",
      },
    };
  });

  console.log("Dropdown CSS analysis:", JSON.stringify(styles, null, 2));
});
