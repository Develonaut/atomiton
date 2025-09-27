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

    // Verify Electron IPC bridge is available
    const hasIPC = await sharedElectronPage.evaluate(() => {
      const hasElectron = typeof (window as any).electron !== "undefined";
      const hasIPC =
        hasElectron &&
        typeof (window as any).electron.ipcRenderer !== "undefined";
      return hasElectron && hasIPC;
    });
    expect(hasIPC).toBe(true);
  });
});
