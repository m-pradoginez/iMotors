import type { Page, Route } from '@playwright/test';

const recommendationsPayload = {
  recommendations: [
    {
      rank: 1,
      vehicle: {
        fipe_code: '001001-1',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2022,
        fuel_type: 'flex',
        price: 125000,
        city_km_l: 10.8,
        highway_km_l: 13.6,
        efficiency_rating: 'A',
        match_confidence: 'exact',
      },
      tco_monthly: 2450,
      breakdown: {
        depreciation_monthly: 900,
        fuel_cost_monthly: 750,
        ipva_monthly: 300,
        insurance_monthly: 350,
        maintenance_monthly: 150,
      },
    },
    {
      rank: 2,
      vehicle: {
        fipe_code: '002002-2',
        brand: 'Honda',
        model: 'Civic',
        year: 2021,
        fuel_type: 'flex',
        price: 119000,
        city_km_l: 10.1,
        highway_km_l: 13.0,
        efficiency_rating: 'A',
        match_confidence: 'exact',
      },
      tco_monthly: 2520,
      breakdown: {
        depreciation_monthly: 940,
        fuel_cost_monthly: 770,
        ipva_monthly: 295,
        insurance_monthly: 360,
        maintenance_monthly: 155,
      },
    },
    {
      rank: 3,
      vehicle: {
        fipe_code: '003003-3',
        brand: 'Chevrolet',
        model: 'Onix',
        year: 2023,
        fuel_type: 'flex',
        price: 98000,
        city_km_l: 12.4,
        highway_km_l: 15.1,
        efficiency_rating: 'A',
        match_confidence: 'fuzzy',
      },
      tco_monthly: 2300,
      breakdown: {
        depreciation_monthly: 860,
        fuel_cost_monthly: 680,
        ipva_monthly: 240,
        insurance_monthly: 330,
        maintenance_monthly: 190,
      },
    },
  ],
};

function isLowBudget(body: unknown): boolean {
  if (!body || typeof body !== 'object' || !('budget_monthly' in body)) {
    return false;
  }

  const budget = Number((body as { budget_monthly?: number }).budget_monthly);
  return Number.isFinite(budget) && budget <= 500;
}

export async function mockRecommendationsApi(page: Page) {
  await page.route('**/api/v1/recommendations', async (route: Route) => {
    const request = route.request();

    if (request.method() !== 'POST') {
      await route.continue();
      return;
    }

    const body = request.postDataJSON();

    if (isLowBudget(body)) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Not Found',
          code: 'NO_VEHICLES_FOUND',
          message: 'No vehicles found for given constraints',
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(recommendationsPayload),
    });
  });
}
