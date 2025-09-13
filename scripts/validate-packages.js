#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PACKAGES_DIR = path.join(__dirname, "../packages/@atomiton");
const GUIDE_PATH = path.join(
  __dirname,
  "../docs/development/PACKAGE_CREATION_GUIDE.md",
);

class PackageValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.packages = [];
  }

  log(message, type = "info") {
    const prefix = {
      info: "📋",
      error: "❌",
      warning: "⚠️",
      success: "✅",
    }[type];
    console.log(`${prefix} ${message}`);
  }

  addError(pkg, message) {
    this.errors.push(`${pkg}: ${message}`);
    this.log(`${pkg}: ${message}`, "error");
  }

  addWarning(pkg, message) {
    this.warnings.push(`${pkg}: ${message}`);
    this.log(`${pkg}: ${message}`, "warning");
  }

  getPackages() {
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

  validatePackageJson(pkg) {
    if (!fs.existsSync(pkg.packageJson)) {
      this.addError(pkg.name, "Missing package.json");
      return;
    }

    let packageData;
    try {
      packageData = JSON.parse(fs.readFileSync(pkg.packageJson, "utf8"));
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
    const requiredFields = ["name", "version", "private", "type"];
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

  validateScripts(pkgName, scripts) {
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
    ];
    const configPackages = ["eslint-config", "typescript-config"];

    if (libraryPackages.includes(pkgName)) {
      const requiredScripts = ["build", "dev", "lint", "lint:fix", "typecheck"];
      requiredScripts.forEach((script) => {
        if (!scripts[script]) {
          this.addError(pkgName, `Missing required script: ${script}`);
        }
      });

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

  validateDependencies(pkgName, packageData) {
    const devDeps = packageData.devDependencies || {};

    // Check for shared configs
    if (
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

  validateFileStructure(pkg) {
    const requiredFiles = ["package.json", "README.md", "src/index.ts"];

    const optionalFiles = [
      "tsconfig.json",
      "vite.config.ts",
      "CURRENT.md",
      "NEXT.md",
      "COMPLETED.md",
    ];

    requiredFiles.forEach((file) => {
      const filePath = path.join(pkg.path, file);
      if (!fs.existsSync(filePath)) {
        this.addError(pkg.name, `Missing required file: ${file}`);
      }
    });

    optionalFiles.forEach((file) => {
      const filePath = path.join(pkg.path, file);
      if (!fs.existsSync(filePath)) {
        this.addWarning(pkg.name, `Consider adding: ${file}`);
      }
    });

    // Check for src directory
    const srcPath = path.join(pkg.path, "src");
    if (!fs.existsSync(srcPath)) {
      this.addError(pkg.name, "Missing src directory");
    }
  }

  validateTypeScriptConfig(pkg) {
    const tsconfigPath = path.join(pkg.path, "tsconfig.json");
    if (!fs.existsSync(tsconfigPath)) {
      return;
    }

    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));

      // Should extend shared config
      if (
        !tsconfig.extends ||
        !tsconfig.extends.includes("@atomiton/typescript-config")
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

  async run() {
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

// Run validation
if (require.main === module) {
  new PackageValidator().run().catch(console.error);
}

module.exports = PackageValidator;
