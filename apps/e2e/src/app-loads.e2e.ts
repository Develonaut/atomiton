import { expect, test } from "#fixtures/electron";

test.describe("App Loading", () => {
  test("app loads successfully", async ({ sharedElectronPage }) => {
    // Wait for the app to load - look for any main content
    await sharedElectronPage.waitForSelector(
      'main, [role="main"], .pl-55, .pl-0',
      {
        timeout: 10000,
      },
    );

    // App should have loaded without errors
    const title = await sharedElectronPage.title();
    expect(title).toBeTruthy();

    // Verify atomitonRPC API is available
    const hasIPC = await sharedElectronPage.evaluate(() => {
      const hasAtomitonRPC = typeof (window as any).atomitonRPC !== "undefined";
      const hasNodeAPI =
        hasAtomitonRPC &&
        typeof (window as any).atomitonRPC.node !== "undefined" &&
        typeof (window as any).atomitonRPC.node.run === "function";
      const hasSystemAPI =
        hasAtomitonRPC &&
        typeof (window as any).atomitonRPC.system !== "undefined" &&
        typeof (window as any).atomitonRPC.system.health === "function";
      return hasAtomitonRPC && hasNodeAPI && hasSystemAPI;
    });
    expect(hasIPC).toBe(true);
  });
});
