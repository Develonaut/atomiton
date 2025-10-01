import {
  _electron as electron,
  type ElectronApplication,
  type Page,
} from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let electronApp: ElectronApplication;
let electronPage: Page;

async function globalSetup() {
  // Start the dev server and Electron once for all tests
  console.log("🚀 Starting Electron for all tests...");

  const electronMain = path.join(__dirname, "../desktop/out/main/index.js");

  electronApp = await electron.launch({
    args: [electronMain],
    env: {
      ...process.env,
      NODE_ENV: "test",
      ELECTRON_RENDERER_URL: "http://localhost:5173",
    },
    timeout: 30000,
  });

  electronPage = await electronApp.firstWindow();
  await electronPage.waitForLoadState("domcontentloaded");

  // Store the electron app and page globally
  (global as any).__ELECTRON_APP__ = electronApp;
  (global as any).__ELECTRON_PAGE__ = electronPage;

  console.log("✅ Electron started successfully");

  return async () => {
    // Teardown function
    console.log("🧹 Closing Electron...");
    await electronApp.close();
  };
}

export default globalSetup;
