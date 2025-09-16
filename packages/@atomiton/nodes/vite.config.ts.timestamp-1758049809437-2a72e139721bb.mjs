// vite.config.ts
import { defineConfig } from "file:///Users/Ryan/Code/atomiton/node_modules/.pnpm/vite@7.1.5_@types+node@20.19.14_jiti@2.5.1_lightningcss@1.30.1_terser@5.44.0_tsx@4.20.5_yaml@2.8.1/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
import { visualizer } from "file:///Users/Ryan/Code/atomiton/node_modules/.pnpm/rollup-plugin-visualizer@6.0.3_rollup@4.50.1/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import dts from "file:///Users/Ryan/Code/atomiton/node_modules/.pnpm/vite-plugin-dts@4.5.4_@types+node@20.19.14_rollup@4.50.1_typescript@5.9.2_vite@7.1.5_@types+n_2etgoxbca4jscyxr7ni5ga2axm/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/Ryan/Code/atomiton/packages/@atomiton/nodes";
var vite_config_default = defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"]
    })
  ],
  build: {
    target: "es2020",
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "AtomitonNodes",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`
    },
    rollupOptions: {
      external: [
        // Node.js built-ins
        "fs",
        "fs/promises",
        "path",
        "child_process",
        "os",
        "util",
        // Third-party libraries
        "zod",
        // Internal packages
        "@atomiton/yaml"
      ],
      output: {
        // Enable manual chunks for better tree shaking
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
          if (id.includes("src/atomic/")) {
            const nodeType = id.match(/src\/atomic\/([^/]+)/)?.[1];
            if (nodeType) {
              return `node-${nodeType}`;
            }
          }
          if (id.includes("src/composite/")) {
            return "composite";
          }
          if (id.includes("validation")) {
            return "validation";
          }
        }
      },
      plugins: [
        visualizer({
          filename: "dist/stats.html",
          open: false,
          gzipSize: true,
          brotliSize: true
        })
      ]
    },
    // Enable minification and compression
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ["console.log", "console.debug"]
      },
      mangle: {
        keep_classnames: true,
        // Keep class names for reflection
        keep_fnames: true
        // Keep function names for debugging
      }
    },
    sourcemap: true,
    // Enable compression
    reportCompressedSize: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvUnlhbi9Db2RlL2F0b21pdG9uL3BhY2thZ2VzL0BhdG9taXRvbi9ub2Rlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL1J5YW4vQ29kZS9hdG9taXRvbi9wYWNrYWdlcy9AYXRvbWl0b24vbm9kZXMvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL1J5YW4vQ29kZS9hdG9taXRvbi9wYWNrYWdlcy9AYXRvbWl0b24vbm9kZXMvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiO1xuaW1wb3J0IGR0cyBmcm9tIFwidml0ZS1wbHVnaW4tZHRzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICBkdHMoe1xuICAgICAgaW5zZXJ0VHlwZXNFbnRyeTogdHJ1ZSxcbiAgICAgIGluY2x1ZGU6IFtcInNyYy8qKi8qLnRzXCIsIFwic3JjLyoqLyoudHN4XCJdLFxuICAgICAgZXhjbHVkZTogW1wic3JjLyoqLyoudGVzdC50c1wiLCBcInNyYy8qKi8qLnRlc3QudHN4XCJdLFxuICAgIH0pLFxuICBdLFxuICBidWlsZDoge1xuICAgIHRhcmdldDogXCJlczIwMjBcIixcbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvaW5kZXgudHNcIiksXG4gICAgICBuYW1lOiBcIkF0b21pdG9uTm9kZXNcIixcbiAgICAgIGZvcm1hdHM6IFtcImVzXCIsIFwiY2pzXCJdLFxuICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IGBpbmRleC4ke2Zvcm1hdCA9PT0gXCJlc1wiID8gXCJqc1wiIDogXCJjanNcIn1gLFxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFtcbiAgICAgICAgLy8gTm9kZS5qcyBidWlsdC1pbnNcbiAgICAgICAgXCJmc1wiLFxuICAgICAgICBcImZzL3Byb21pc2VzXCIsXG4gICAgICAgIFwicGF0aFwiLFxuICAgICAgICBcImNoaWxkX3Byb2Nlc3NcIixcbiAgICAgICAgXCJvc1wiLFxuICAgICAgICBcInV0aWxcIixcbiAgICAgICAgLy8gVGhpcmQtcGFydHkgbGlicmFyaWVzXG4gICAgICAgIFwiem9kXCIsXG4gICAgICAgIC8vIEludGVybmFsIHBhY2thZ2VzXG4gICAgICAgIFwiQGF0b21pdG9uL3lhbWxcIixcbiAgICAgIF0sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgLy8gRW5hYmxlIG1hbnVhbCBjaHVua3MgZm9yIGJldHRlciB0cmVlIHNoYWtpbmdcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XG4gICAgICAgICAgLy8gS2VlcCBub2RlIG1vZHVsZXMgYXMgc2VwYXJhdGUgY2h1bmtzXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ2ZW5kb3JcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBTcGxpdCBhdG9taWMgbm9kZXMgaW50byBpbmRpdmlkdWFsIGNodW5rc1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInNyYy9hdG9taWMvXCIpKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlVHlwZSA9IGlkLm1hdGNoKC9zcmNcXC9hdG9taWNcXC8oW14vXSspLyk/LlsxXTtcbiAgICAgICAgICAgIGlmIChub2RlVHlwZSkge1xuICAgICAgICAgICAgICByZXR1cm4gYG5vZGUtJHtub2RlVHlwZX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFNwbGl0IGNvbXBvc2l0ZSBmdW5jdGlvbmFsaXR5XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwic3JjL2NvbXBvc2l0ZS9cIikpIHtcbiAgICAgICAgICAgIHJldHVybiBcImNvbXBvc2l0ZVwiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFNwbGl0IHZhbGlkYXRpb24gbG9naWNcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJ2YWxpZGF0aW9uXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ2YWxpZGF0aW9uXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgdmlzdWFsaXplcih7XG4gICAgICAgICAgZmlsZW5hbWU6IFwiZGlzdC9zdGF0cy5odG1sXCIsXG4gICAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgICAgZ3ppcFNpemU6IHRydWUsXG4gICAgICAgICAgYnJvdGxpU2l6ZTogdHJ1ZSxcbiAgICAgICAgfSksXG4gICAgICBdLFxuICAgIH0sXG4gICAgLy8gRW5hYmxlIG1pbmlmaWNhdGlvbiBhbmQgY29tcHJlc3Npb25cbiAgICBtaW5pZnk6IFwidGVyc2VyXCIsXG4gICAgdGVyc2VyT3B0aW9uczoge1xuICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAgZHJvcF9jb25zb2xlOiB0cnVlLCAvLyBSZW1vdmUgY29uc29sZS5sb2cgaW4gcHJvZHVjdGlvblxuICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlLFxuICAgICAgICBwdXJlX2Z1bmNzOiBbXCJjb25zb2xlLmxvZ1wiLCBcImNvbnNvbGUuZGVidWdcIl0sXG4gICAgICB9LFxuICAgICAgbWFuZ2xlOiB7XG4gICAgICAgIGtlZXBfY2xhc3NuYW1lczogdHJ1ZSwgLy8gS2VlcCBjbGFzcyBuYW1lcyBmb3IgcmVmbGVjdGlvblxuICAgICAgICBrZWVwX2ZuYW1lczogdHJ1ZSwgLy8gS2VlcCBmdW5jdGlvbiBuYW1lcyBmb3IgZGVidWdnaW5nXG4gICAgICB9LFxuICAgIH0sXG4gICAgc291cmNlbWFwOiB0cnVlLFxuICAgIC8vIEVuYWJsZSBjb21wcmVzc2lvblxuICAgIHJlcG9ydENvbXByZXNzZWRTaXplOiB0cnVlLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdVLFNBQVMsb0JBQW9CO0FBQ3JXLFNBQVMsZUFBZTtBQUN4QixTQUFTLGtCQUFrQjtBQUMzQixPQUFPLFNBQVM7QUFIaEIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLE1BQ0Ysa0JBQWtCO0FBQUEsTUFDbEIsU0FBUyxDQUFDLGVBQWUsY0FBYztBQUFBLE1BQ3ZDLFNBQVMsQ0FBQyxvQkFBb0IsbUJBQW1CO0FBQUEsSUFDbkQsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLEtBQUs7QUFBQSxNQUNILE9BQU8sUUFBUSxrQ0FBVyxjQUFjO0FBQUEsTUFDeEMsTUFBTTtBQUFBLE1BQ04sU0FBUyxDQUFDLE1BQU0sS0FBSztBQUFBLE1BQ3JCLFVBQVUsQ0FBQyxXQUFXLFNBQVMsV0FBVyxPQUFPLE9BQU8sS0FBSztBQUFBLElBQy9EO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUE7QUFBQSxRQUVSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQTtBQUFBLFFBRUE7QUFBQTtBQUFBLFFBRUE7QUFBQSxNQUNGO0FBQUEsTUFDQSxRQUFRO0FBQUE7QUFBQSxRQUVOLGFBQWEsSUFBSTtBQUVmLGNBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUMvQixtQkFBTztBQUFBLFVBQ1Q7QUFHQSxjQUFJLEdBQUcsU0FBUyxhQUFhLEdBQUc7QUFDOUIsa0JBQU0sV0FBVyxHQUFHLE1BQU0sc0JBQXNCLElBQUksQ0FBQztBQUNyRCxnQkFBSSxVQUFVO0FBQ1oscUJBQU8sUUFBUSxRQUFRO0FBQUEsWUFDekI7QUFBQSxVQUNGO0FBR0EsY0FBSSxHQUFHLFNBQVMsZ0JBQWdCLEdBQUc7QUFDakMsbUJBQU87QUFBQSxVQUNUO0FBR0EsY0FBSSxHQUFHLFNBQVMsWUFBWSxHQUFHO0FBQzdCLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxXQUFXO0FBQUEsVUFDVCxVQUFVO0FBQUEsVUFDVixNQUFNO0FBQUEsVUFDTixVQUFVO0FBQUEsVUFDVixZQUFZO0FBQUEsUUFDZCxDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsVUFBVTtBQUFBLFFBQ1IsY0FBYztBQUFBO0FBQUEsUUFDZCxlQUFlO0FBQUEsUUFDZixZQUFZLENBQUMsZUFBZSxlQUFlO0FBQUEsTUFDN0M7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLGlCQUFpQjtBQUFBO0FBQUEsUUFDakIsYUFBYTtBQUFBO0FBQUEsTUFDZjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQTtBQUFBLElBRVgsc0JBQXNCO0FBQUEsRUFDeEI7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
