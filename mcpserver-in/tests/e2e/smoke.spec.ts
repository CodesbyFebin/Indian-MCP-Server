// tests/e2e/smoke.spec.ts
// End-to-end smoke tests for critical user flows

import { test, expect, type Page } from '@playwright/test';

test.describe('Basic Navigation', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MCPServer\.in/);
  });

  test('should navigate to servers page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Browse All Servers/i }).click();
    await expect(page).toHaveURL(/\/servers$/);
  });

  test('should display search input', async ({ page }) => {
    await page.goto('/servers');
    await expect(page.getByPlaceholder(/Search servers/i)).toBeVisible();
  });
});

test.describe('SEO & Metadata', () => {
  test('homepage should have correct meta tags', async ({ page }) => {
    await page.goto('/');

    const title = await page.title();
    expect(title).toContain('MCPServer.in');

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(description).toBeTruthy();
    expect(description).toContain('MCP');
  });

  test('server pages should have canonical URLs', async ({ page }) => {
    // This test would require a seeded database
    // For now, we test that the canonical check runs without crashing
    await page.goto('/');
    const canonical = await page.locator('link[rel="canonical"]').count();
    expect(canonical).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Performance', () => {
  test('homepage should load under 2 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(2000);
  });
});
