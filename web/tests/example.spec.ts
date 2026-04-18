import { test, expect } from '@playwright/test';
import { mockRecommendationsApi } from './helpers/mockRecommendations';

test('Smoke: consultancy page renders and allows entering the flow', async ({ page }) => {
  await mockRecommendationsApi(page);
  await page.goto('/consultancy');

  await expect(page.getByText('Qual seu potencial de investimento?')).toBeVisible();
  await expect(page.getByRole('button', { name: /Continuar/i })).toBeVisible();
});
