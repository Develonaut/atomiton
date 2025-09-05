import { mergeConfig } from 'vite';
import { resolve } from 'path';

/**
 * Create a Vitest configuration for test environments
 * @param {Object} options - Configuration options
 * @param {string} options.rootDir - Root directory of the package
 * @param {Object} [options.overrides={}] - Additional Vitest config overrides
 */
export function createTestConfig(options) {
  const { rootDir, overrides = {} } = options;

  const baseConfig = {
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [resolve(rootDir, 'src/test-setup.ts')],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test-setup.ts',
          '**/*.spec.ts',
          '**/*.test.ts',
        ],
      },
    },
    resolve: {
      alias: {
        '@': resolve(rootDir, 'src'),
      },
    },
  };

  return mergeConfig(baseConfig, overrides);
}