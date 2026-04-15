/**
 * Configuration for TCO calculation engine
 * Contains fuel prices, depreciation rates, IPVA rates, and other constants
 */

export const tcoConfig = {
  // Fuel prices in BRL per liter (2026 averages)
  fuelPrices: {
    gasolina: 5.5,
    etanol: 3.8,
    diesel: 6.2,
    hibrido: 5.5, // Uses gasolina price
    eletrico: 0.5, // Per kWh equivalent
  },

  // Depreciation rates by category (annual percentage)
  depreciationRates: {
    hatchback: 0.15,
    sedan: 0.12,
    suv: 0.10,
    pickup: 0.08,
    minivan: 0.12,
    coupe: 0.18,
    conversivel: 0.20,
  },

  // IPVA rates by state (annual percentage)
  ipvaRates: {
    SP: 0.04,
    RJ: 0.04,
    MG: 0.04,
    RS: 0.04,
    PR: 0.04,
    SC: 0.04,
    BA: 0.03,
    PE: 0.03,
    CE: 0.03,
    GO: 0.03,
    DF: 0.03,
    // Default rate for other states
    default: 0.02,
  },

  // Insurance configuration
  insurance: {
    baseRate: 2000, // BRL per year for 30-40 age group
  },

  // Maintenance configuration
  maintenance: {
    baseRate: 2400, // BRL per year
  },

  // Default efficiency (km/l) by category when data is missing
  defaultEfficiency: {
    hatchback: 12,
    sedan: 10,
    suv: 8,
    pickup: 6,
    minivan: 9,
    coupe: 9,
    conversivel: 9,
  },
};
