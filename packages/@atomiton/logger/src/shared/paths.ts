import * as fs from "fs";
import * as path from "path";

export function getDefaultLogPath(): string {
  // Try multiple strategies to find the project root
  let projectRoot: string | null = null;

  // Strategy 1: Use __dirname and walk up (for bundled electron apps)
  if (typeof __dirname !== "undefined") {
    let currentDir = __dirname;
    while (currentDir !== path.dirname(currentDir)) {
      const packageJsonPath = path.join(currentDir, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, "utf-8"),
          );
          if (packageJson.name === "atomiton" || packageJson.workspaces) {
            projectRoot = currentDir;
            break;
          }
        } catch {
          // Continue searching
        }
      }
      currentDir = path.dirname(currentDir);
    }
  }

  // Strategy 2: Use process.cwd() (for development)
  if (!projectRoot) {
    let currentDir = process.cwd();
    while (currentDir !== path.dirname(currentDir)) {
      const packageJsonPath = path.join(currentDir, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, "utf-8"),
          );
          if (packageJson.name === "atomiton" || packageJson.workspaces) {
            projectRoot = currentDir;
            break;
          }
        } catch {
          // Continue searching
        }
      }
      currentDir = path.dirname(currentDir);
    }
  }

  // Strategy 3: Look for specific workspace structure indicators
  if (!projectRoot) {
    let currentDir = process.cwd();
    while (currentDir !== path.dirname(currentDir)) {
      const workspaceIndicators = [
        path.join(currentDir, "packages", "@atomiton"),
        path.join(currentDir, "apps", "desktop"),
        path.join(currentDir, "turbo.json"),
      ];

      if (workspaceIndicators.some((indicator) => fs.existsSync(indicator))) {
        projectRoot = currentDir;
        break;
      }
      currentDir = path.dirname(currentDir);
    }
  }

  // If we found the project root, use tmp/logs there
  if (projectRoot) {
    return path.join(projectRoot, "tmp", "logs", "atomiton.log");
  }

  // Fallback to OS temp directory
  const tmpDir = process.env.TMPDIR || process.env.TEMP || "/tmp";
  return path.join(tmpDir, "atomiton-logs", "atomiton.log");
}

export function ensureLogDirectory(logPath: string): void {
  const dir = path.dirname(logPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
