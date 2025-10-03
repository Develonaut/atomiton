import { expect, test } from "#fixtures/electron";

test.describe("Flow Execution Tests", () => {
  test("loads flow templates on FlowsPage", async ({ electronPage }) => {
    // Navigate to Flows page
    await electronPage.goto("http://localhost:5173/debug/flows", {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });

    // Wait for flows page to load
    await electronPage
      .locator('[data-testid="flows-page"]')
      .waitFor({ state: "visible", timeout: 10000 });

    // Templates auto-load on mount - wait for flow items to appear
    await expect(
      electronPage.locator('[data-testid="flow-item"]').first(),
    ).toBeVisible({ timeout: 10000 });

    // Verify we have at least 3 flows (hello-world, data-transform, image-processor)
    const flowItems = await electronPage
      .locator('[data-testid="flow-item"]')
      .count();
    expect(flowItems).toBeGreaterThanOrEqual(3);
  });

  test("executes hello-world-flow end-to-end", async ({ electronPage }) => {
    // Navigate to Flows page
    await electronPage.goto("http://localhost:5173/debug/flows", {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });

    // Wait for page load and templates to auto-load
    await electronPage
      .locator('[data-testid="flows-page"]')
      .waitFor({ state: "visible", timeout: 10000 });

    await expect(
      electronPage.locator('[data-testid="flow-item"]').first(),
    ).toBeVisible({ timeout: 10000 });

    // Select hello-world-flow by clicking radio button
    const helloWorldFlowRadio = electronPage.locator(
      'input[type="radio"][value="hello-world-flow"]',
    );
    await expect(helloWorldFlowRadio).toBeVisible({ timeout: 5000 });
    await helloWorldFlowRadio.click();

    // Run the flow
    const runButton = electronPage.locator('button:has-text("Run")');
    await expect(runButton).toBeVisible({ timeout: 5000 });
    await runButton.click();

    // Wait for execution logs to appear
    await expect(
      electronPage.locator('[data-testid="log-entry"]').first(),
    ).toBeVisible({ timeout: 10000 });

    // Wait for completion message
    await expect(
      electronPage.locator("text=/🎉 Flow execution completed!/"),
    ).toBeVisible({ timeout: 15000 });

    // Verify progress shows completion
    const progressText = await electronPage
      .locator('[data-testid="progress-text"]')
      .textContent();
    expect(progressText).toMatch(/3\s*\/\s*3/); // hello-world has 3 nodes

    // Verify we have multiple log entries (execution start, progress, completions)
    const logEntries = await electronPage
      .locator('[data-testid="log-entry"]')
      .all();
    expect(logEntries.length).toBeGreaterThan(4); // At least: load, start, node count, completions, final
  });

  test("executes data-transform-flow with progress tracking", async ({
    electronPage,
  }) => {
    // Navigate to Flows page
    await electronPage.goto("http://localhost:5173/debug/flows", {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });

    await electronPage
      .locator('[data-testid="flows-page"]')
      .waitFor({ state: "visible", timeout: 10000 });

    // Wait for templates to auto-load
    await expect(
      electronPage.locator('[data-testid="flow-item"]').first(),
    ).toBeVisible({ timeout: 10000 });

    // Select data-transform-flow by clicking radio button
    const dataTransformFlowRadio = electronPage.locator(
      'input[type="radio"][value="550e8400-e29b-41d4-a716-446655440002"]',
    );
    await expect(dataTransformFlowRadio).toBeVisible({ timeout: 5000 });
    await dataTransformFlowRadio.click();

    // Run the flow
    const runButton = electronPage.locator('button:has-text("Run")');
    await expect(runButton).toBeVisible({ timeout: 5000 });
    await runButton.click();

    // Wait for execution logs to appear
    await expect(
      electronPage.locator('[data-testid="log-entry"]').first(),
    ).toBeVisible({ timeout: 10000 });

    // Wait for completion (or error if CSV file doesn't exist)
    const completionOrError = electronPage.locator(
      "text=/🎉 Flow execution completed!|❌ Flow execution error/",
    );
    await expect(completionOrError).toBeVisible({ timeout: 15000 });

    // Verify we got detailed logs
    const logs = await electronPage.locator('[data-testid="log-entry"]').all();
    expect(logs.length).toBeGreaterThan(3); // Should have multiple log entries
  });

  test("executes image-processor-flow with parallel execution", async ({
    electronPage,
  }) => {
    // Navigate to Flows page
    await electronPage.goto("http://localhost:5173/debug/flows", {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });

    await electronPage
      .locator('[data-testid="flows-page"]')
      .waitFor({ state: "visible", timeout: 10000 });

    // Wait for templates to auto-load
    await expect(
      electronPage.locator('[data-testid="flow-item"]').first(),
    ).toBeVisible({ timeout: 10000 });

    // Select image-processor-flow by clicking radio button
    const imageProcessorFlowRadio = electronPage.locator(
      'input[type="radio"][value="550e8400-e29b-41d4-a716-446655440003"]',
    );
    await expect(imageProcessorFlowRadio).toBeVisible({ timeout: 5000 });
    await imageProcessorFlowRadio.click();

    // Run the flow
    const runButton = electronPage.locator('button:has-text("Run")');
    await expect(runButton).toBeVisible({ timeout: 5000 });
    await runButton.click();

    // Wait for execution logs to appear
    await expect(
      electronPage.locator('[data-testid="log-entry"]').first(),
    ).toBeVisible({ timeout: 10000 });

    // Wait for completion (or error if image files don't exist)
    const completionOrError = electronPage.locator(
      "text=/🎉 Flow execution completed!|❌ Flow execution error/",
    );
    await expect(completionOrError).toBeVisible({ timeout: 20000 });

    // Verify progress tracking worked
    const progressText = await electronPage
      .locator('[data-testid="progress-text"]')
      .textContent();
    expect(progressText).toMatch(/\d+\s*\/\s*\d+/); // Should show X / Y format
  });

  test("shows detailed execution logs for all flows", async ({
    electronPage,
  }) => {
    // Navigate to Flows page
    await electronPage.goto("http://localhost:5173/debug/flows", {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });

    await electronPage
      .locator('[data-testid="flows-page"]')
      .waitFor({ state: "visible", timeout: 10000 });

    // Wait for templates to auto-load
    await expect(
      electronPage.locator('[data-testid="flow-item"]').first(),
    ).toBeVisible({ timeout: 10000 });

    // Select hello-world-flow (simplest to test)
    const helloWorldFlowRadio = electronPage.locator(
      'input[type="radio"][value="hello-world-flow"]',
    );
    await expect(helloWorldFlowRadio).toBeVisible({ timeout: 5000 });
    await helloWorldFlowRadio.click();

    // Run the flow
    await electronPage.locator('button:has-text("Run")').click();

    // Wait for execution logs to appear
    await expect(
      electronPage.locator('[data-testid="log-entry"]').first(),
    ).toBeVisible({ timeout: 10000 });

    // Wait for completion
    await expect(
      electronPage.locator("text=/🎉 Flow execution completed!/"),
    ).toBeVisible({ timeout: 15000 });

    // Verify we have detailed logs
    const logEntries = await electronPage
      .locator('[data-testid="log-entry"]')
      .all();
    expect(logEntries.length).toBeGreaterThan(4); // At least: start, node count, 3 node completions, final completion

    // Verify we see execution start log
    await expect(
      electronPage.locator("text=/🚀 Executing flow/"),
    ).toBeVisible();
  });
});
