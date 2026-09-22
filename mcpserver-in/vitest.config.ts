// vitest.config.ts
// Vitest configuration for unit and integration tests

import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules', 'tests/e2e'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['lib/**/*.ts', 'packages/**/*.ts'],
      exclude: ['lib/**/*.type.ts', 'lib/**/types.ts'],
    },
    // Run tests sequentially to avoid database conflicts
    sequence: {
      concurrent: false,
    },
    // Test timeout
    testTimeout: 30000,
    // Hook timeout
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
