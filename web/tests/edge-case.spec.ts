import { test, expect } from '@playwright/test';
import { mockRecommendationsApi } from './helpers/mockRecommendations';

test('Edge case: Displays no vehicles found error when budget is too low', async ({ page }) => {
  await mockRecommendationsApi(page);
  await page.goto('/consultancy');

  await expect(page.getByText('Qual seu potencial de investimento?')).toBeVisible();

  // Find the slider input or simulate dragging
  // Since it's a "framer-motion" customized slider, we can focus the input[type=range] visually hidden or interact directly.
  // We can just rely on the fallback API mock for this or actually try to manipulate the slider.
  // Actually, there is a numeric input for the display value we can type into!
  const inputs = page.locator('input[type="text"]');
  // The first text input is the budget
  await inputs.nth(0).fill('500'); // set budget to 500

  await page.getByRole('button', { name: /Continuar/i }).click();

  // Step 2
  await page.getByRole('button', { name: /Continuar/i }).click();

  // Step 3
  await page.getByRole('button', { name: /Ver Recomendações/i }).click();

  // Expect fallback message
  await expect(page.getByText('Ops! Algo deu errado.')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/No vehicles found|Não encontramos veículos/i)).toBeVisible();
});
