import { defineConfig } from '@playwright/test';

const PORT = process.env.CRM_PORT ?? '3001';
const baseURL = process.env.CRM_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    cwd: '.',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 180_000,
    env: {
      // Default to MongoDB so `pnpm test:e2e` (without the wrapper script)
      // still works against a local mongod. The driver-acceptance wrapper
      // script (`scripts/run-driver-acceptance.sh`) overrides this by
      // booting `pnpm dev` itself with each driver's URL — Playwright
      // then reuses that server (`reuseExistingServer: true`).
      OS_DATABASE_URL:
        process.env.OS_DATABASE_URL ??
        'mongodb://localhost:27017/objectstack_crm_test',
      OS_PROJECT_ID: process.env.OS_PROJECT_ID ?? 'proj_crm',
    },
  },
});
