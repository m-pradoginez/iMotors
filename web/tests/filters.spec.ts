import { test, expect } from '@playwright/test';
import { mockRecommendationsApi } from './helpers/mockRecommendations';

test('Filters: Selects specific category and fuel type successfully', async ({ page }) => {
  await mockRecommendationsApi(page);
  await page.goto('/consultancy');

  // Step 1
  await page.getByRole('button', { name: /Continuar/i }).click();

  // Step 2: Category
  // Click category select trigger
  await page.getByRole('button', { name: /Selecione uma preferência/i }).click();
  // Select 'sedan'
  await page.getByRole('button', { name: /sedan/i }).click();
  
  await page.getByRole('button', { name: /Continuar/i }).click();

  // Step 3: Fuel Type and Region
  await page.getByRole('button', { name: /Qualquer um/i }).click();
  await page.getByRole('button', { name: /flex/i }).click();

  await page.getByRole('button', { name: /Ver Recomendações/i }).click();

  // Assert report page renders successfully
  await expect(page.getByRole('heading', { name: /As Melhores/i })).toBeVisible({ timeout: 10000 });
});
