import { defineConfig, mergeConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

/**
 * Create a Vite configuration for library packages
 * @param {Object} options - Configuration options
 * @param {string} options.name - Library name for UMD builds
 * @param {string} options.rootDir - Root directory of the package
 * @param {string} [options.entry='src/index.ts'] - Entry point
 * @param {string[]} [options.external=[]] - Additional external dependencies
 * @param {string} [options.target='es2020'] - Build target
 * @param {boolean} [options.react=false] - Include React plugin
 * @param {Object} [options.overrides={}] - Additional Vite config overrides
 */
export function createLibConfig(options) {
  const {
    name,
    rootDir,
    entry = 'src/index.ts',
    external = [],
    target = 'es2020',
    react: includeReact = false,
    overrides = {}
  } = options;

  const baseConfig = defineConfig({
    build: {
      target,
      lib: {
        entry: resolve(rootDir, entry),
        name,
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
      },
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          /^node:/,
          ...external,
        ],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
      sourcemap: true,
      minify: false,
    },
    plugins: includeReact ? [react()] : [],
    resolve: {
      alias: {
        '@': resolve(rootDir, 'src'),
      },
    },
  });

  return mergeConfig(baseConfig, overrides);
}