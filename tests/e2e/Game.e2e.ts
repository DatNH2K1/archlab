import { expect, test } from '@playwright/test';

test.describe('Game', () => {
  test('opens the first round brief', async ({ page }) => {
    await page.goto('/en');

    await expect(page.getByRole('heading', { name: 'Closed beta' })).toBeVisible();
  });

  test('reports reads with nowhere to go', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('button', { name: 'Open the canvas' }).click();
    await page.getByRole('button', { name: /EC2/u }).click();

    const users = page.locator('[data-node-id="users"] [data-dot="right"]');
    const server = page.locator('[data-node-id^="ec2-"]');

    await users.dragTo(server);
    await page.getByRole('button', { name: /Run/u }).click();
    await page.getByRole('button', { name: /Fast-forward/u }).click();

    await expect(page.getByText('EC2 receives read requests but has no data source', { exact: false }).first()).toBeVisible();
  });
});
