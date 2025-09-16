// vite.config.ts
import { defineConfig } from "file:///Users/Ryan/Code/atomiton/node_modules/.pnpm/vite@7.1.5_@types+node@20.19.14_jiti@2.5.1_lightningcss@1.30.1_terser@5.44.0_tsx@4.20.5_yaml@2.8.1/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
import { visualizer } from "file:///Users/Ryan/Code/atomiton/node_modules/.pnpm/rollup-plugin-visualizer@6.0.3_rollup@4.50.1/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import dts from "file:///Users/Ryan/Code/atomiton/node_modules/.pnpm/vite-plugin-dts@4.5.4_@types+node@20.19.14_rollup@4.50.1_typescript@5.9.2_vite@7.1.5_@types+n_2etgoxbca4jscyxr7ni5ga2axm/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/Ryan/Code/atomiton/packages/@atomiton/utils";
var vite_config_default = defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.smoke.test.ts",
        "src/**/*.bench.ts"
      ]
    })
  ],
  build: {
    target: "es2020",
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "AtomitonUtils",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`
    },
    rollupOptions: {
      external: ["node:path", "node:fs", "node:url", "node:crypto"],
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
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
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.debug"]
      },
      mangle: {
        keep_classnames: true,
        keep_fnames: true
      }
    },
    sourcemap: true,
    reportCompressedSize: true
  },
  test: {
    environment: "node",
    globals: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvUnlhbi9Db2RlL2F0b21pdG9uL3BhY2thZ2VzL0BhdG9taXRvbi91dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL1J5YW4vQ29kZS9hdG9taXRvbi9wYWNrYWdlcy9AYXRvbWl0b24vdXRpbHMvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL1J5YW4vQ29kZS9hdG9taXRvbi9wYWNrYWdlcy9AYXRvbWl0b24vdXRpbHMvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiO1xuaW1wb3J0IGR0cyBmcm9tIFwidml0ZS1wbHVnaW4tZHRzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICBkdHMoe1xuICAgICAgaW5zZXJ0VHlwZXNFbnRyeTogdHJ1ZSxcbiAgICAgIGluY2x1ZGU6IFtcInNyYy8qKi8qLnRzXCJdLFxuICAgICAgZXhjbHVkZTogW1xuICAgICAgICBcInNyYy8qKi8qLnRlc3QudHNcIixcbiAgICAgICAgXCJzcmMvKiovKi5zbW9rZS50ZXN0LnRzXCIsXG4gICAgICAgIFwic3JjLyoqLyouYmVuY2gudHNcIixcbiAgICAgIF0sXG4gICAgfSksXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgdGFyZ2V0OiBcImVzMjAyMFwiLFxuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9pbmRleC50c1wiKSxcbiAgICAgIG5hbWU6IFwiQXRvbWl0b25VdGlsc1wiLFxuICAgICAgZm9ybWF0czogW1wiZXNcIiwgXCJjanNcIl0sXG4gICAgICBmaWxlTmFtZTogKGZvcm1hdCkgPT4gYGluZGV4LiR7Zm9ybWF0ID09PSBcImVzXCIgPyBcImpzXCIgOiBcImNqc1wifWAsXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogW1wibm9kZTpwYXRoXCIsIFwibm9kZTpmc1wiLCBcIm5vZGU6dXJsXCIsIFwibm9kZTpjcnlwdG9cIl0sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ2ZW5kb3JcIjtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcGx1Z2luczogW1xuICAgICAgICB2aXN1YWxpemVyKHtcbiAgICAgICAgICBmaWxlbmFtZTogXCJkaXN0L3N0YXRzLmh0bWxcIixcbiAgICAgICAgICBvcGVuOiBmYWxzZSxcbiAgICAgICAgICBnemlwU2l6ZTogdHJ1ZSxcbiAgICAgICAgICBicm90bGlTaXplOiB0cnVlLFxuICAgICAgICB9KSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICBtaW5pZnk6IFwidGVyc2VyXCIsXG4gICAgdGVyc2VyT3B0aW9uczoge1xuICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAgZHJvcF9jb25zb2xlOiB0cnVlLFxuICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlLFxuICAgICAgICBwdXJlX2Z1bmNzOiBbXCJjb25zb2xlLmxvZ1wiLCBcImNvbnNvbGUuZGVidWdcIl0sXG4gICAgICB9LFxuICAgICAgbWFuZ2xlOiB7XG4gICAgICAgIGtlZXBfY2xhc3NuYW1lczogdHJ1ZSxcbiAgICAgICAga2VlcF9mbmFtZXM6IHRydWUsXG4gICAgICB9LFxuICAgIH0sXG4gICAgc291cmNlbWFwOiB0cnVlLFxuICAgIHJlcG9ydENvbXByZXNzZWRTaXplOiB0cnVlLFxuICB9LFxuICB0ZXN0OiB7XG4gICAgZW52aXJvbm1lbnQ6IFwibm9kZVwiLFxuICAgIGdsb2JhbHM6IHRydWUsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1UsU0FBUyxvQkFBb0I7QUFDclcsU0FBUyxlQUFlO0FBQ3hCLFNBQVMsa0JBQWtCO0FBQzNCLE9BQU8sU0FBUztBQUhoQixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsTUFDRixrQkFBa0I7QUFBQSxNQUNsQixTQUFTLENBQUMsYUFBYTtBQUFBLE1BQ3ZCLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsS0FBSztBQUFBLE1BQ0gsT0FBTyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUN4QyxNQUFNO0FBQUEsTUFDTixTQUFTLENBQUMsTUFBTSxLQUFLO0FBQUEsTUFDckIsVUFBVSxDQUFDLFdBQVcsU0FBUyxXQUFXLE9BQU8sT0FBTyxLQUFLO0FBQUEsSUFDL0Q7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxhQUFhLFdBQVcsWUFBWSxhQUFhO0FBQUEsTUFDNUQsUUFBUTtBQUFBLFFBQ04sYUFBYSxJQUFJO0FBQ2YsY0FBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQy9CLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxXQUFXO0FBQUEsVUFDVCxVQUFVO0FBQUEsVUFDVixNQUFNO0FBQUEsVUFDTixVQUFVO0FBQUEsVUFDVixZQUFZO0FBQUEsUUFDZCxDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxNQUNiLFVBQVU7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLGVBQWU7QUFBQSxRQUNmLFlBQVksQ0FBQyxlQUFlLGVBQWU7QUFBQSxNQUM3QztBQUFBLE1BQ0EsUUFBUTtBQUFBLFFBQ04saUJBQWlCO0FBQUEsUUFDakIsYUFBYTtBQUFBLE1BQ2Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsSUFDWCxzQkFBc0I7QUFBQSxFQUN4QjtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0osYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLEVBQ1g7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
