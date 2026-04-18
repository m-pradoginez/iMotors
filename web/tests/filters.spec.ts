import { test, expect } from '@playwright/test';

test('Filters: Selects specific category and fuel type successfully', async ({ page }) => {
  await page.goto('/consultancy');

  // Step 1
  await page.getByRole('button', { name: /Continuar/i }).click();

  // Step 2: Category
  // Click category select trigger
  await page.getByText('Selecione uma preferência').click();
  // Select 'sedan'
  await page.getByRole('option', { name: /sedan/i }).click();
  
  await page.getByRole('button', { name: /Continuar/i }).click();

  // Step 3: Fuel Type and Region
  await page.getByText('Qualquer um').click();
  await page.getByRole('option', { name: /flex/i }).click();

  await page.getByRole('button', { name: /Ver Recomendações/i }).click();

  // Assert report page renders successfully
  await expect(page.getByText('As Melhores Oportunidades')).toBeVisible({ timeout: 10000 });
});
