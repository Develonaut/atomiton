#!/usr/bin/env tsx

import { execSync } from "child_process";

const PORTS = [5173, 5174, 5175, 3000, 8080];

interface KillOptions {
  ports: boolean;
  electron: boolean;
  all: boolean;
}

function parseArgs(): KillOptions {
  const args = process.argv.slice(2);

  return {
    ports: args.includes("--ports") || args.includes("ports"),
    electron: args.includes("--electron") || args.includes("electron"),
    all: args.includes("--all") || args.includes("all") || args.length === 0,
  };
}

function killPorts(): void {
  console.log(`Killing processes on ports: ${PORTS.join(", ")}`);

  try {
    const portList = PORTS.join(",");
    execSync(`npx kill-port --port ${portList}`, { stdio: "inherit" });
    console.log("✅ Port cleanup completed");
  } catch (error) {
    console.log("ℹ️  No processes found on specified ports");
  }
}

function killElectron(): void {
  console.log("Killing Electron processes...");

  try {
    if (process.platform === "win32") {
      execSync("taskkill /f /im electron.exe", { stdio: "pipe" });
    } else {
      execSync("pkill -f electron", { stdio: "pipe" });
    }
    console.log("✅ Electron processes terminated");
  } catch (error) {
    console.log("ℹ️  No Electron processes found");
  }
}

function main(): void {
  const options = parseArgs();

  console.log("🧹 Cross-platform process cleanup");

  if (options.all || options.ports) {
    killPorts();
  }

  if (options.all || options.electron) {
    killElectron();
  }

  console.log("✨ Cleanup complete");
}

if (require.main === module) {
  main();
}
