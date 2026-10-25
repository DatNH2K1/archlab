import { expect, test } from '@playwright/test';

test.describe('I18n', () => {
  test('shows Vietnamese by default and switches to English', async ({ page }) => {
    await page.goto('/how-to-play');

    await expect(page.getByRole('heading', { name: 'Hướng dẫn' })).toBeVisible();

    await page.getByTitle('Đổi ngôn ngữ').click();

    await expect(page).toHaveURL(/\/en\/how-to-play$/u);
    await expect(page.getByRole('heading', { name: 'Guide' })).toBeVisible();
  });
});
