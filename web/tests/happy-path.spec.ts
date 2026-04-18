import { test, expect } from '@playwright/test';

test('Happy path: Completes wizard and views Top 3 recommendations', async ({ page }) => {
  // Start at the home page or consultancy page
  await page.goto('/consultancy');

  // Step 1: Budget
  // Ensure the label is visible
  await expect(page.getByText('Qual seu potencial de investimento?')).toBeVisible();

  // Click continue (use the default 2500 and 15000 km)
  await page.getByRole('button', { name: /Continuar/i }).click();

  // Step 2: Usage Profile
  await expect(page.getByText('Qual o seu estilo de condução?')).toBeVisible();
  
  // Click continue to use defaults
  await page.getByRole('button', { name: /Continuar/i }).click();

  // Step 3: Location
  await expect(page.getByText('Detalhes finais')).toBeVisible();

  // Click submit
  await page.getByRole('button', { name: /Ver Recomendações/i }).click();

  // Skip loading assertion because it's too fast locally

  // Assert report page renders successfully
  await expect(page.getByText('As Melhores Oportunidades')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('#1 Recomendação')).toBeVisible();
});
