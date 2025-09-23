#!/usr/bin/env tsx

import { execSync, spawn } from "child_process";

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

function killPortsOnMac(): void {
  for (const port of PORTS) {
    try {
      // Use a more robust approach that won't hang
      const result = execSync(`netstat -anv | grep LISTEN | grep ":${port} " | awk '{print $9}' | head -1`, {
        stdio: "pipe",
        encoding: "utf-8",
        timeout: 2000
      });

      if (result.trim()) {
        // Try to kill using port directly with a timeout
        try {
          execSync(`pkill -f ":${port}"`, { stdio: "pipe", timeout: 1000 });
          console.log(`✅ Killed process on port ${port}`);
        } catch {
          // If that fails, try a more targeted approach
          try {
            const pids = execSync(`ps aux | grep ":${port}" | grep -v grep | awk '{print $2}'`, {
              stdio: "pipe",
              encoding: "utf-8",
              timeout: 1000
            }).trim().split('\n').filter(pid => pid && /^\d+$/.test(pid));

            for (const pid of pids) {
              execSync(`kill -9 ${pid}`, { stdio: "pipe", timeout: 1000 });
              console.log(`✅ Killed process ${pid} on port ${port}`);
            }
          } catch {
            // Final fallback - just try to kill common dev server processes
            try {
              execSync(`pkill -f "vite.*${port}|webpack.*${port}|next.*${port}|react-scripts.*${port}"`, {
                stdio: "pipe",
                timeout: 1000
              });
              console.log(`✅ Attempted to kill dev server on port ${port}`);
            } catch {
              // Silently continue
            }
          }
        }
      }
    } catch {
      // Silently continue - no process on this port or command failed
    }
  }
}

function killPortsOnWindows(): void {
  for (const port of PORTS) {
    try {
      const result = execSync(`netstat -ano | findstr :${port}`, {
        stdio: "pipe",
        encoding: "utf-8",
        timeout: 2000
      });
      const lines = result.split('\n').filter(line => line.includes('LISTENING'));

      for (const line of lines) {
        const pid = line.trim().split(/\s+/).pop();
        if (pid && /^\d+$/.test(pid)) {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "pipe", timeout: 2000 });
          console.log(`✅ Killed process ${pid} on port ${port}`);
        }
      }
    } catch {
      // Silently continue - no process on this port
    }
  }
}

function killPorts(): void {
  console.log(`Killing processes on ports: ${PORTS.join(", ")}`);

  if (process.platform === "win32") {
    killPortsOnWindows();
  } else {
    killPortsOnMac();
  }

  console.log("✅ Port cleanup completed");
}

function killElectron(): void {
  console.log("Killing Electron processes...");

  try {
    if (process.platform === "win32") {
      execSync("taskkill /f /im electron.exe", {
        stdio: "pipe",
        timeout: 3000
      });
    } else {
      execSync("pkill -f electron", {
        stdio: "pipe",
        timeout: 3000
      });
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