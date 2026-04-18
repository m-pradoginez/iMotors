import { test, expect } from '@playwright/test';

test('Smoke: consultancy page renders and allows entering the flow', async ({ page }) => {
  await page.goto('/consultancy');

  await expect(page.getByText('Qual seu potencial de investimento?')).toBeVisible();
  await expect(page.getByRole('button', { name: /Continuar/i })).toBeVisible();
});
