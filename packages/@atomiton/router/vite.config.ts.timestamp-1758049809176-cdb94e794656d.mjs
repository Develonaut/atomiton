// vite.config.ts
import react from "file:///Users/Ryan/Code/atomiton/node_modules/.pnpm/@vitejs+plugin-react@5.0.2_vite@6.3.6_@types+node@20.19.14_jiti@2.5.1_lightningcss@1.30.1_ter_ezcupzjoyerwrvxshywyjnaory/node_modules/@vitejs/plugin-react/dist/index.js";
import { resolve } from "path";
import { visualizer } from "file:///Users/Ryan/Code/atomiton/node_modules/.pnpm/rollup-plugin-visualizer@6.0.3_rollup@4.50.1/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { defineConfig } from "file:///Users/Ryan/Code/atomiton/node_modules/.pnpm/vite@6.3.6_@types+node@20.19.14_jiti@2.5.1_lightningcss@1.30.1_terser@5.44.0_tsx@4.20.5_yaml@2.8.1/node_modules/vite/dist/node/index.js";
import dts from "file:///Users/Ryan/Code/atomiton/node_modules/.pnpm/vite-plugin-dts@4.5.4_@types+node@20.19.14_rollup@4.50.1_typescript@5.9.2_vite@6.3.6_@types+n_dzhjllely4okncuzefha6mzlgy/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/Ryan/Code/atomiton/packages/@atomiton/router";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/**/*.smoke.test.ts",
        "src/**/*.bench.ts"
      ]
    })
  ],
  build: {
    target: "es2020",
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "AtomitonRouter",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "@tanstack/react-router",
        "@atomiton/store",
        "zustand"
      ],
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
    environment: "jsdom",
    globals: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvUnlhbi9Db2RlL2F0b21pdG9uL3BhY2thZ2VzL0BhdG9taXRvbi9yb3V0ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9SeWFuL0NvZGUvYXRvbWl0b24vcGFja2FnZXMvQGF0b21pdG9uL3JvdXRlci92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvUnlhbi9Db2RlL2F0b21pdG9uL3BhY2thZ2VzL0BhdG9taXRvbi9yb3V0ZXIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IGR0cyBmcm9tIFwidml0ZS1wbHVnaW4tZHRzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIGR0cyh7XG4gICAgICBpbnNlcnRUeXBlc0VudHJ5OiB0cnVlLFxuICAgICAgaW5jbHVkZTogW1wic3JjLyoqLyoudHNcIiwgXCJzcmMvKiovKi50c3hcIl0sXG4gICAgICBleGNsdWRlOiBbXG4gICAgICAgIFwic3JjLyoqLyoudGVzdC50c1wiLFxuICAgICAgICBcInNyYy8qKi8qLnRlc3QudHN4XCIsXG4gICAgICAgIFwic3JjLyoqLyouc21va2UudGVzdC50c1wiLFxuICAgICAgICBcInNyYy8qKi8qLmJlbmNoLnRzXCIsXG4gICAgICBdLFxuICAgIH0pLFxuICBdLFxuICBidWlsZDoge1xuICAgIHRhcmdldDogXCJlczIwMjBcIixcbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvaW5kZXgudHNcIiksXG4gICAgICBuYW1lOiBcIkF0b21pdG9uUm91dGVyXCIsXG4gICAgICBmb3JtYXRzOiBbXCJlc1wiLCBcImNqc1wiXSxcbiAgICAgIGZpbGVOYW1lOiAoZm9ybWF0KSA9PiBgaW5kZXguJHtmb3JtYXQgPT09IFwiZXNcIiA/IFwianNcIiA6IFwiY2pzXCJ9YCxcbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbXG4gICAgICAgIFwicmVhY3RcIixcbiAgICAgICAgXCJyZWFjdC1kb21cIixcbiAgICAgICAgXCJAdGFuc3RhY2svcmVhY3Qtcm91dGVyXCIsXG4gICAgICAgIFwiQGF0b21pdG9uL3N0b3JlXCIsXG4gICAgICAgIFwienVzdGFuZFwiLFxuICAgICAgXSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXNcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBcInZlbmRvclwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBwbHVnaW5zOiBbXG4gICAgICAgIHZpc3VhbGl6ZXIoe1xuICAgICAgICAgIGZpbGVuYW1lOiBcImRpc3Qvc3RhdHMuaHRtbFwiLFxuICAgICAgICAgIG9wZW46IGZhbHNlLFxuICAgICAgICAgIGd6aXBTaXplOiB0cnVlLFxuICAgICAgICAgIGJyb3RsaVNpemU6IHRydWUsXG4gICAgICAgIH0pLFxuICAgICAgXSxcbiAgICB9LFxuICAgIG1pbmlmeTogXCJ0ZXJzZXJcIixcbiAgICB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICBjb21wcmVzczoge1xuICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWUsXG4gICAgICAgIHB1cmVfZnVuY3M6IFtcImNvbnNvbGUubG9nXCIsIFwiY29uc29sZS5kZWJ1Z1wiXSxcbiAgICAgIH0sXG4gICAgICBtYW5nbGU6IHtcbiAgICAgICAga2VlcF9jbGFzc25hbWVzOiB0cnVlLFxuICAgICAgICBrZWVwX2ZuYW1lczogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IHRydWUsXG4gIH0sXG4gIHRlc3Q6IHtcbiAgICBlbnZpcm9ubWVudDogXCJqc2RvbVwiLFxuICAgIGdsb2JhbHM6IHRydWUsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMlUsT0FBTyxXQUFXO0FBQzdWLFNBQVMsZUFBZTtBQUN4QixTQUFTLGtCQUFrQjtBQUMzQixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFKaEIsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sSUFBSTtBQUFBLE1BQ0Ysa0JBQWtCO0FBQUEsTUFDbEIsU0FBUyxDQUFDLGVBQWUsY0FBYztBQUFBLE1BQ3ZDLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLEtBQUs7QUFBQSxNQUNILE9BQU8sUUFBUSxrQ0FBVyxjQUFjO0FBQUEsTUFDeEMsTUFBTTtBQUFBLE1BQ04sU0FBUyxDQUFDLE1BQU0sS0FBSztBQUFBLE1BQ3JCLFVBQVUsQ0FBQyxXQUFXLFNBQVMsV0FBVyxPQUFPLE9BQU8sS0FBSztBQUFBLElBQy9EO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxRQUFRO0FBQUEsUUFDTixhQUFhLElBQUk7QUFDZixjQUFJLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFDL0IsbUJBQU87QUFBQSxVQUNUO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNQLFdBQVc7QUFBQSxVQUNULFVBQVU7QUFBQSxVQUNWLE1BQU07QUFBQSxVQUNOLFVBQVU7QUFBQSxVQUNWLFlBQVk7QUFBQSxRQUNkLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsVUFBVTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsZUFBZTtBQUFBLFFBQ2YsWUFBWSxDQUFDLGVBQWUsZUFBZTtBQUFBLE1BQzdDO0FBQUEsTUFDQSxRQUFRO0FBQUEsUUFDTixpQkFBaUI7QUFBQSxRQUNqQixhQUFhO0FBQUEsTUFDZjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxJQUNYLHNCQUFzQjtBQUFBLEVBQ3hCO0FBQUEsRUFDQSxNQUFNO0FBQUEsSUFDSixhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsRUFDWDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
