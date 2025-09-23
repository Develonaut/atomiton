#!/usr/bin/env tsx

import fkill from 'fkill';

interface KillOptions {
  ports: boolean;
  electron: boolean;
  all: boolean;
}

const PORTS = [5173, 5174, 5175, 3000, 8080];

function parseArgs(): KillOptions {
  const args = process.argv.slice(2);

  return {
    ports: args.includes("--ports") || args.includes("ports"),
    electron: args.includes("--electron") || args.includes("electron"),
    all: args.includes("--all") || args.includes("all") || args.length === 0,
  };
}

async function killPorts(): Promise<void> {
  console.log(`Killing processes on ports: ${PORTS.join(", ")}`);

  for (const port of PORTS) {
    try {
      await fkill(`:${port}`, {
        force: true,
        silent: true
      });
      console.log(`✅ Killed process on port ${port}`);
    } catch {
      // Port not in use, silently continue
    }
  }

  console.log("✅ Port cleanup completed");
}

async function killElectron(): Promise<void> {
  console.log("Killing Atomiton Electron desktop processes...");

  try {
    // Target specific Electron processes related to Atomiton, not VS Code or other Electron apps
    // These patterns are designed to match our specific app instances
    const processPatterns = [
      // Match our custom app name
      'AtomitonDesktop',
      // Match processes with our environment variable
      'electron.*ATOMITON_DESKTOP=true',
      // Match electron-vite dev processes in our desktop directory
      'electron.*apps/desktop.*electron-vite',
      // Match our specific userData directory in dev
      'electron.*AtomitonDev',
      // Match built app executables
      'Atomiton.exe',
      'Atomiton.app',
      'atomiton-desktop'
    ];

    let killed = false;
    for (const pattern of processPatterns) {
      try {
        await fkill(pattern, {
          force: true,
          ignoreCase: true,
          tree: process.platform === 'win32'
        });
        killed = true;
        console.log(`✅ Killed process matching: ${pattern}`);
      } catch {
        // This pattern didn't match any processes
      }
    }

    if (!killed) {
      console.log("ℹ️  No Atomiton Electron processes found");
    } else {
      console.log("✅ All Atomiton Electron processes terminated");
    }
  } catch (error) {
    console.log("ℹ️  Error killing Electron processes:", error);
  }
}

async function main(): Promise<void> {
  const options = parseArgs();

  console.log("🧹 Cross-platform process cleanup");

  if (options.all || options.ports) {
    await killPorts();
  }

  if (options.all || options.electron) {
    await killElectron();
  }

  console.log("✨ Cleanup complete");
}

if (require.main === module) {
  main().catch(console.error);
}