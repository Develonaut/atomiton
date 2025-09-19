#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGES_DIR = path.join(__dirname, "../packages/@atomiton");

interface Package {
  name: string;
  path: string;
  packageJson: string;
}

interface PackageData {
  name: string;
  version: string;
  private: boolean;
  type: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

type LogType = "info" | "error" | "warning" | "success";

class PackageValidator {
  private errors: string[] = [];
  private warnings: string[] = [];
  private packages: Package[] = [];

  private log(message: string, type: LogType = "info"): void {
    const prefixes: Record<LogType, string> = {
      info: "📋",
      error: "❌",
      warning: "⚠️",
      success: "✅",
    };
    console.log(`${prefixes[type]} ${message}`);
  }

  private addError(pkg: string, message: string): void {
    this.errors.push(`${pkg}: ${message}`);
    this.log(`${pkg}: ${message}`, "error");
  }

  private addWarning(pkg: string, message: string): void {
    this.warnings.push(`${pkg}: ${message}`);
    this.log(`${pkg}: ${message}`, "warning");
  }

  private getPackages(): Package[] {
    try {
      return fs
        .readdirSync(PACKAGES_DIR)
        .filter((name) =>
          fs.statSync(path.join(PACKAGES_DIR, name)).isDirectory(),
        )
        .map((name) => ({
          name,
          path: path.join(PACKAGES_DIR, name),
          packageJson: path.join(PACKAGES_DIR, name, "package.json"),
        }));
    } catch (error) {
      this.log("Failed to read packages directory", "error");
      process.exit(1);
    }
  }

  private validatePackageJson(pkg: Package): PackageData | undefined {
    if (!fs.existsSync(pkg.packageJson)) {
      this.addError(pkg.name, "Missing package.json");
      return;
    }

    let packageData: PackageData;
    try {
      packageData = JSON.parse(
        fs.readFileSync(pkg.packageJson, "utf8"),
      ) as PackageData;
    } catch (error) {
      this.addError(pkg.name, "Invalid package.json format");
      return;
    }

    // Validate naming convention
    if (packageData.name !== `@atomiton/${pkg.name}`) {
      this.addError(
        pkg.name,
        `Name should be @atomiton/${pkg.name}, got ${packageData.name}`,
      );
    }

    // Validate required fields
    const requiredFields: (keyof PackageData)[] = [
      "name",
      "version",
      "private",
      "type",
    ];
    requiredFields.forEach((field) => {
      if (!packageData[field]) {
        this.addError(pkg.name, `Missing required field: ${field}`);
      }
    });

    // Validate type is "module"
    if (packageData.type !== "module") {
      this.addError(pkg.name, 'Package type should be "module"');
    }

    // Validate private is true
    if (packageData.private !== true) {
      this.addError(pkg.name, "Package should be private: true");
    }

    // Validate scripts consistency
    this.validateScripts(pkg.name, packageData.scripts || {});

    // Validate dependencies
    this.validateDependencies(pkg.name, packageData);

    return packageData;
  }

  private validateScripts(
    pkgName: string,
    scripts: Record<string, string>,
  ): void {
    // Required scripts for library packages
    const libraryPackages = [
      "ui",
      "core",
      "nodes",
      "editor",
      "conductor",
      "store",
      "events",
      "di",
      "storage",
      "form",
      "yaml",
      "router",
      "hooks",
      "utils",
    ];
    const configPackages = ["eslint-config", "typescript-config"];

    if (libraryPackages.includes(pkgName)) {
      const requiredScripts = ["build", "dev", "lint", "lint:fix", "typecheck"];
      const requiredTestScripts = ["test", "test:unit", "test:watch"];

      requiredScripts.forEach((script) => {
        if (!scripts[script]) {
          this.addError(pkgName, `Missing required script: ${script}`);
        }
      });

      // Validate test scripts - at least one should be present
      const hasTestScript = requiredTestScripts.some(
        (script) => scripts[script],
      );
      if (!hasTestScript) {
        this.addError(
          pkgName,
          `Missing test scripts. Must have at least one of: ${requiredTestScripts.join(", ")}`,
        );
      }

      // Validate dev script pattern
      if (scripts.dev && !scripts.dev.includes("vite build --watch")) {
        this.addWarning(
          pkgName,
          'Dev script should use "vite build --watch" pattern',
        );
      }

      // Validate build script
      if (scripts.build && scripts.build !== "vite build") {
        this.addWarning(pkgName, 'Build script should be "vite build"');
      }
    }

    // Config packages have minimal requirements
    if (configPackages.includes(pkgName)) {
      if (scripts.build) {
        this.addWarning(
          pkgName,
          "Config packages typically don't need build scripts",
        );
      }
    }
  }

  private hasSubpathExports(pkg: Package): boolean {
    try {
      const packageJson = JSON.parse(fs.readFileSync(pkg.packageJson, "utf8"));
      const exports = packageJson.exports;

      // Check if exports has multiple subpaths (not just main export)
      if (exports && typeof exports === "object") {
        const exportKeys = Object.keys(exports);
        // If exports has keys other than "." (main export), it uses subpaths
        return exportKeys.some(
          (key) => key !== "." && key !== "./package.json",
        );
      }

      return false;
    } catch {
      return false;
    }
  }

  private validateDependencies(
    pkgName: string,
    packageData: PackageData,
  ): void {
    const devDeps = packageData.devDependencies || {};

    // Check for shared configs (but not for config packages themselves)
    const configPackages = ["eslint-config", "typescript-config"];
    if (
      !configPackages.includes(pkgName) &&
      !devDeps["@atomiton/eslint-config"] &&
      !devDeps["@atomiton/typescript-config"]
    ) {
      this.addWarning(pkgName, "Should use shared @atomiton configs");
    }

    // Check workspace dependencies use workspace: protocol
    const deps = { ...packageData.dependencies, ...devDeps };
    Object.entries(deps).forEach(([name, version]) => {
      if (name.startsWith("@atomiton/") && !version.startsWith("workspace:")) {
        this.addError(
          pkgName,
          `Internal dependency ${name} should use workspace: protocol, got ${version}`,
        );
      }
    });
  }

  private validateFileStructure(pkg: Package): void {
    // Config packages don't need vite.config.ts or doc files
    const isConfigPackage = pkg.name.includes("-config");

    // Check if package uses subpath exports (like @atomiton/nodes)
    const hasSubpathExports = this.hasSubpathExports(pkg);

    const requiredFiles = [
      "tsconfig.json",
      ...(!isConfigPackage ? ["vite.config.ts"] : []),
      "package.json",
      "README.md",
      // Only require src/index.ts if not using subpath exports
      ...(!hasSubpathExports ? ["src/index.ts"] : []),
      ...(!isConfigPackage
        ? [
            "CURRENT.md",
            "NEXT.md",
            "COMPLETED.md",
            "ROADMAP.md",
            "CHANGELOG.md",
          ]
        : []),
    ];

    requiredFiles.forEach((file) => {
      const filePath = path.join(pkg.path, file);
      if (!fs.existsSync(filePath)) {
        this.addError(pkg.name, `Missing required file: ${file}`);
      }
    });

    // Validate CHANGELOG.md has content (only for non-config packages)
    if (!isConfigPackage) {
      const changelogPath = path.join(pkg.path, "CHANGELOG.md");
      if (fs.existsSync(changelogPath)) {
        const changelogContent = fs.readFileSync(changelogPath, "utf8");
        if (changelogContent.trim().length < 50) {
          this.addWarning(
            pkg.name,
            "CHANGELOG.md appears to be empty or minimal",
          );
        }
      }
    }

    // Check for src directory
    const srcPath = path.join(pkg.path, "src");
    if (!fs.existsSync(srcPath)) {
      this.addError(pkg.name, "Missing src directory");
    }
  }

  private validateTypeScriptConfig(pkg: Package): void {
    const tsconfigPath = path.join(pkg.path, "tsconfig.json");
    if (!fs.existsSync(tsconfigPath)) {
      return;
    }

    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));

      // Should extend shared config (except for typescript-config itself)
      if (
        pkg.name !== "typescript-config" &&
        (!tsconfig.extends ||
          !tsconfig.extends.includes("@atomiton/typescript-config"))
      ) {
        this.addWarning(
          pkg.name,
          "TypeScript config should extend @atomiton/typescript-config",
        );
      }
    } catch (error) {
      this.addError(pkg.name, "Invalid tsconfig.json format");
    }
  }

  public async run(): Promise<void> {
    this.log("🔍 Validating package consistency across monorepo...", "info");

    this.packages = this.getPackages();
    this.log(`Found ${this.packages.length} packages to validate`, "info");

    for (const pkg of this.packages) {
      this.log(`Validating ${pkg.name}...`, "info");

      const packageData = this.validatePackageJson(pkg);
      if (packageData) {
        this.validateFileStructure(pkg);
        this.validateTypeScriptConfig(pkg);
      }
    }

    // Summary
    const isGitHook = process.env.HUSKY === "1";

    if (!isGitHook) {
      console.log("\n📊 Validation Summary:");
      this.log(`Packages validated: ${this.packages.length}`, "info");
      this.log(
        `Errors found: ${this.errors.length}`,
        this.errors.length > 0 ? "error" : "success",
      );
      this.log(
        `Warnings: ${this.warnings.length}`,
        this.warnings.length > 0 ? "warning" : "info",
      );
    }

    if (this.errors.length > 0) {
      console.log("\n❌ Critical Issues:");
      this.errors.forEach((error) => console.log(`  • ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠️  Recommendations:");
      this.warnings.forEach((warning) => console.log(`  • ${warning}`));
    }

    if (this.errors.length === 0) {
      this.log("All packages pass consistency validation! 🎉", "success");
    } else {
      this.log(
        `Found ${this.errors.length} critical issues that need fixing`,
        "error",
      );
      process.exit(1);
    }
  }
}

// Run validation if this is the main module
if (import.meta.url === `file://${__filename}`) {
  new PackageValidator().run().catch(console.error);
}

export default PackageValidator;
