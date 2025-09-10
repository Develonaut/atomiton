module.exports = {
  // Format all code and markdown files
  "*.{ts,tsx,js,jsx,md}": ["prettier --write"],

  // Run ESLint fix and tests on TypeScript/JavaScript files
  "*.{ts,tsx,js,jsx}": (filenames) => {
    // Group files by their package directory
    const commands = [];
    const packageFiles = {};
    const packagesWithChanges = new Set();

    filenames.forEach((file) => {
      // Extract package path (e.g., "apps/client" or "packages/@atomiton/ui")
      const match = file.match(/^((?:apps|packages)\/(?:@[^/]+\/)?[^/]+)\//);
      if (match) {
        const packagePath = match[1];
        if (!packageFiles[packagePath]) {
          packageFiles[packagePath] = [];
        }
        packageFiles[packagePath].push(file);
        packagesWithChanges.add(packagePath);
      }
    });

    // Run ESLint and tests for each package with changed files
    Object.entries(packageFiles).forEach(([packagePath, files]) => {
      // Run ESLint from the package directory with the specific files
      commands.push(
        `(cd ${packagePath} && npx eslint --fix --max-warnings 0 ${files.map((f) => f.replace(packagePath + "/", "")).join(" ")} 2>/dev/null || true)`,
      );
    });

    // Run tests for packages that have changes (fast mode with bail)
    packagesWithChanges.forEach((packagePath) => {
      // Check if the package has a test script
      const packageJsonPath = `${packagePath}/package.json`;
      try {
        const packageJson = require(`./${packageJsonPath}`);
        if (packageJson.scripts && packageJson.scripts.test) {
          // Get package name for cleaner output
          const packageName = packagePath.split("/").pop();

          // Run tests with --bail to stop on first failure (faster)
          // and --no-coverage to skip coverage collection (faster)
          commands.push(
            `echo "🧪 Testing ${packageName}..." && (cd ${packagePath} && npx vitest run --bail --no-coverage --reporter=dot 2>/dev/null || (echo "❌ Tests failed in ${packageName}. Fix tests before committing." && exit 1))`,
          );
        }
      } catch (e) {
        // Package.json not found or no test script - skip tests for this package
      }
    });

    // Handle root-level files
    const rootFiles = filenames.filter((f) => !f.match(/^(apps|packages)\//));
    if (rootFiles.length > 0) {
      commands.push(`prettier --write ${rootFiles.join(" ")}`);
    }

    return commands;
  },
};
