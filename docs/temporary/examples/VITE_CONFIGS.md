# Vite Configuration Examples

## Apps/Client Configuration (Recommended)

```typescript
// apps/client/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite"; // Add this for Tailwind 4 compatibility
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(), // Add Tailwind plugin
  ],

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      // Direct aliasing to UI package source for development
      "@atomiton/ui": resolve(__dirname, "../../packages/ui/src"),
      "@atomiton/theme": resolve(__dirname, "../../packages/theme/src"),
    },
  },

  server: {
    port: 3001,
    host: true,
    fs: {
      // Allow serving files from workspace packages
      allow: ["../..", "../../packages"],
    },
    watch: {
      // Watch UI package changes for hot reload
      ignored: ["!**/packages/ui/src/**", "!**/packages/theme/src/**"],
    },
  },

  optimizeDeps: {
    // Include workspace packages for optimization
    include: [
      "@atomiton/ui",
      "@atomiton/theme",
      "react",
      "react-dom",
      "react-router-dom",
    ],
    // Exclude from pre-bundling during development
    exclude: ["@atomiton/ui", "@atomiton/theme"],
  },

  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor chunks
          vendor: ["react", "react-dom", "react-router-dom"],
          // UI framework chunks
          ui: ["@atomiton/ui", "@atomiton/theme"],
          // Animation and interaction
          motion: ["framer-motion", "react-animate-height"],
          // Utility libraries
          utils: ["clsx", "tailwind-merge", "class-variance-authority"],
        },
      },
    },
  },
});
```

## Package/UI Configuration (Already Configured)

```typescript
// packages/ui/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@atomiton/theme": resolve(__dirname, "../theme/src/index.ts"),
    },
  },

  server: {
    host: true,
    fs: {
      allow: ["..", "../../packages/theme"],
    },
    watch: {
      ignored: ["!**/packages/theme/src/**"],
    },
  },

  optimizeDeps: {
    exclude: ["@atomiton/theme"],
    include: ["react", "react-dom"],
  },

  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AtomitonUI",
      formats: ["es", "cjs"],
      fileName: (format) => `atomiton-ui.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "@atomiton/theme"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
```

## Development-Specific Configuration

```typescript
// vite.config.development.ts
import { defineConfig } from "vite";
import baseConfig from "./vite.config";

export default defineConfig({
  ...baseConfig,

  // Development-specific overrides
  server: {
    ...baseConfig.server,
    hmr: {
      overlay: true,
      protocol: "ws",
      host: "localhost",
    },
  },

  // Faster builds in development
  esbuild: {
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    jsxInject: `import React from 'react'`,
  },

  // Development-only optimizations
  optimizeDeps: {
    ...baseConfig.optimizeDeps,
    force: true, // Force re-optimization on changes
  },
});
```

## Production-Specific Configuration

```typescript
// vite.config.production.ts
import { defineConfig } from "vite";
import baseConfig from "./vite.config";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  ...baseConfig,

  plugins: [
    ...baseConfig.plugins,
    // Bundle analysis
    visualizer({
      template: "treemap",
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: "analyze.html",
    }),
  ],

  build: {
    ...baseConfig.build,

    // Production optimizations
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    // Advanced chunking
    rollupOptions: {
      ...baseConfig.build.rollupOptions,
      output: {
        ...baseConfig.build.rollupOptions.output,

        // Optimize chunk sizes
        manualChunks: (id) => {
          // Node modules chunking
          if (id.includes("node_modules")) {
            // React ecosystem
            if (id.includes("react")) return "react";

            // UI libraries
            if (id.includes("@atomiton/ui")) return "ui-core";
            if (id.includes("@headlessui") || id.includes("@radix"))
              return "ui-headless";

            // Utilities
            if (id.includes("lodash") || id.includes("date-fns"))
              return "utils";

            // Everything else
            return "vendor";
          }

          // Application code chunking
          if (id.includes("/src/components/")) {
            if (id.includes("/Comments/")) return "comments";
            if (id.includes("/Layout/")) return "layout";
            return "components";
          }
        },
      },
    },

    // Report compressed size
    reportCompressedSize: true,

    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
});
```

## Environment-Specific Configurations

```typescript
// vite.config.ts with environment detection
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // Base configuration
    plugins: [react(), tsconfigPaths(), tailwindcss()],

    // Environment-specific settings
    server: {
      port: parseInt(env.VITE_PORT || "3001"),
      host: env.VITE_HOST === "true",
      proxy:
        mode === "development"
          ? {
              "/api": {
                target: env.VITE_API_URL || "http://localhost:3000",
                changeOrigin: true,
              },
            }
          : undefined,
    },

    // Conditional optimizations
    optimizeDeps: {
      include: mode === "production" ? ["@atomiton/ui", "@atomiton/theme"] : [],
    },

    // Build settings
    build: {
      sourcemap: mode === "development" ? "inline" : false,
      minify: mode === "production" ? "terser" : false,
    },
  };
});
```

## Monorepo-Specific Considerations

```typescript
// Root vite config for workspace
export default defineConfig({
  // Shared settings for all packages
  define: {
    __DEV__: process.env.NODE_ENV !== "production",
    __VERSION__: JSON.stringify(process.env.npm_package_version),
  },

  // Shared resolve configuration
  resolve: {
    conditions: ["development", "browser"],
    mainFields: ["module", "jsnext:main", "jsnext"],
  },

  // Workspace optimization
  optimizeDeps: {
    entries: ["packages/*/src/**/*.{ts,tsx}", "apps/*/src/**/*.{ts,tsx}"],
    // Link workspace packages
    link: ["@atomiton/*"],
  },
});
```

## Tailwind Integration

### For Tailwind 3.x (Current apps/client)

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
});
```

### For Tailwind 4.x (packages/ui approach)

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss({
      // Tailwind 4 configuration
      content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
    }),
  ],
});
```

## Performance Monitoring

```typescript
// vite.config.ts with performance monitoring
import { defineConfig } from "vite";
import { ViteBuildReporter } from "vite-plugin-build-reporter";

export default defineConfig({
  plugins: [
    // ... other plugins
    ViteBuildReporter({
      enableBuildReport: true,
      enableServerReport: true,
      serverReportInterval: 5000,
    }),
  ],

  // Log build performance
  build: {
    logLevel: "info",
    rollupOptions: {
      onwarn(warning, warn) {
        console.log(`Build warning: ${warning.message}`);
        warn(warning);
      },
    },
  },
});
```
