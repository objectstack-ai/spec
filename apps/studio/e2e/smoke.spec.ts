import { test, expect } from '@playwright/test';

test('studio loads home page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Studio|ObjectStack/i);
});
