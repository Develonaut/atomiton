module.exports = {
  // Format all code and markdown files
  "*.{ts,tsx,js,jsx,md}": ["prettier --write"],

  // Run ESLint fix on TypeScript/JavaScript files
  "*.{ts,tsx,js,jsx}": (filenames) => {
    // Group files by their package directory
    const commands = [];
    const packageFiles = {};

    filenames.forEach((file) => {
      // Extract package path (e.g., "apps/client" or "packages/@atomiton/ui")
      const match = file.match(/^((?:apps|packages)\/(?:@[^/]+\/)?[^/]+)\//);
      if (match) {
        const packagePath = match[1];
        if (!packageFiles[packagePath]) {
          packageFiles[packagePath] = [];
        }
        packageFiles[packagePath].push(file);
      }
    });

    // Run ESLint for each package with changed files
    Object.entries(packageFiles).forEach(([packagePath, files]) => {
      // Run ESLint from the package directory with the specific files
      commands.push(
        `(cd ${packagePath} && npx eslint --fix --max-warnings 0 ${files.map((f) => f.replace(packagePath + "/", "")).join(" ")} 2>/dev/null || true)`,
      );
    });

    // Handle root-level files
    const rootFiles = filenames.filter((f) => !f.match(/^(apps|packages)\//));
    if (rootFiles.length > 0) {
      commands.push(`prettier --write ${rootFiles.join(" ")}`);
    }

    return commands;
  },
};
