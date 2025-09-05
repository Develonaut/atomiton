import { defineConfig, mergeConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Create a Vite configuration for application packages
 * @param {Object} options - Configuration options
 * @param {string} options.rootDir - Root directory of the package
 * @param {number} [options.port=3000] - Dev server port
 * @param {string} [options.outDir='dist'] - Output directory
 * @param {Object} [options.overrides={}] - Additional Vite config overrides
 */
export function createAppConfig(options) {
  const {
    rootDir,
    port = 3000,
    outDir = 'dist',
    overrides = {}
  } = options;

  const baseConfig = defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
      port,
      host: true,
      fs: {
        allow: [
          resolve(rootDir, '../..'),
        ],
      },
    },
    build: {
      outDir,
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': resolve(rootDir, 'src'),
      },
    },
    define: {
      global: 'globalThis',
      'process.env': {},
    },
  });

  return mergeConfig(baseConfig, overrides);
}