import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    globals: true,
    environment: 'node',
    testTimeout: 30000, // 30 seconds for integration tests
    hookTimeout: 30000,
    // Run integration tests sequentially to avoid race conditions
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    }
  }
});
