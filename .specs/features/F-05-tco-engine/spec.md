# F-05 Spec: TCO Calculation Engine

**Status**: Ready for implementation

## Overview

Implement the Total Cost of Ownership (TCO) calculation engine for Brazilian vehicles. This engine will calculate the monthly cost of owning a vehicle based on depreciation, fuel costs, taxes (IPVA), insurance, and maintenance.

## Functional Requirements

### TCO Components

#### 1. Depreciation
- Calculate monthly depreciation based on vehicle purchase price and expected useful life
- Use Brazilian market depreciation rates by vehicle category
- Formula: `depreciation_monthly = (price * depreciation_rate) / 12`

Depreciation rates by category:
- Hatchback: 15% per year
- Sedan: 12% per year
- SUV: 10% per year
- Pickup: 8% per year
- Minivan: 12% per year
- Coupe: 18% per year
- Conversível: 20% per year

#### 2. Fuel Cost
- Calculate monthly fuel cost based on:
  - Annual mileage (km/year)
  - City/highway driving ratio
  - Fuel efficiency (km/l) from Inmetro data
  - Fuel price (gasolina, etanol, diesel)
- Formula: `fuel_cost_monthly = (mileage_annual_km / 12) * fuel_price / efficiency`

Fuel prices (BRL per liter, average for 2026):
- Gasolina: R$ 5.50
- Etanol: R$ 3.80
- Diesel: R$ 6.20
- Hibrido: Uses gasolina price
- Eletrico: R$ 0.50 per kWh equivalent

Efficiency calculation:
- For flex vehicles: use weighted average based on city/highway ratio
- For other fuel types: use city_km_l and highway_km_l from Inmetro data
- If efficiency data is missing: use category defaults (hatchback: 12 km/l, sedan: 10 km/l, suv: 8 km/l, pickup: 6 km/l)

#### 3. IPVA (Imposto sobre Propriedade de Veículos Automotores)
- Calculate annual IPVA based on vehicle price and state tax rate
- Formula: `ipva_monthly = (price * state_ipva_rate) / 12`

IPVA rates by state:
- SP, RJ, MG, RS, PR, SC: 4%
- BA, PE, CE, GO, DF: 3%
- Others: 2%

Special rules:
- Electric vehicles: 50% discount in most states
- Vehicles > 20 years old: exemption
- Vehicles > R$ 150,000: higher rate (add 1%)

#### 4. Insurance
- Estimate monthly insurance cost based on:
  - Vehicle price (higher price = higher insurance)
  - Vehicle category (sports cars = higher insurance)
  - Driver age (not implemented in v1 - use default 30-40 age group)
  - State (urban states = higher insurance)
- Formula: `insurance_monthly = base_rate * price_factor * category_factor * state_factor`

Base rate: R$ 2,000 per year (default for 30-40 age group)

Price factors:
- < R$ 50,000: 0.8
- R$ 50,000 - R$ 100,000: 1.0
- R$ 100,000 - R$ 150,000: 1.2
- > R$ 150,000: 1.5

Category factors:
- Hatchback, Sedan, Minivan: 1.0
- SUV, Pickup: 1.2
- Coupe, Conversível: 1.5

State factors:
- SP, RJ, MG: 1.3
- RS, PR, SC, BA, PE: 1.1
- Others: 1.0

#### 5. Maintenance
- Estimate monthly maintenance cost based on:
  - Vehicle age (older = higher maintenance)
  - Vehicle category (luxury = higher maintenance)
  - Mileage (higher mileage = higher maintenance)
- Formula: `maintenance_monthly = base_maintenance * age_factor * category_factor * mileage_factor`

Base maintenance: R$ 2,400 per year (R$ 200/month)

Age factors (assume new vehicle for v1):
- 0-2 years: 0.8
- 3-5 years: 1.0
- 6-10 years: 1.3
- > 10 years: 1.8

Category factors:
- Hatchback, Sedan: 1.0
- SUV, Pickup: 1.2
- Minivan: 1.1
- Coupe, Conversível: 1.4

Mileage factors:
- < 10,000 km/year: 0.8
- 10,000 - 20,000 km/year: 1.0
- > 20,000 km/year: 1.2

### TCO Calculation Interface

```typescript
interface TCOInput {
  vehicle: {
    fipe_code: string;
    price: number;
    category: string;
    fuel_type: string;
    city_km_l?: number;
    highway_km_l?: number;
  };
  user: {
    budget_monthly: number;
    mileage_annual_km: number;
    city_highway_ratio: number;
    state: string;
  };
}

interface TCOOutput {
  tco_monthly: number;
  breakdown: {
    depreciation_monthly: number;
    fuel_cost_monthly: number;
    ipva_monthly: number;
    insurance_monthly: number;
    maintenance_monthly: number;
  };
}
```

### TCO Calculator Class

```typescript
class TCOCalculator {
  calculate(input: TCOInput): TCOOutput;
  calculateDepreciation(price: number, category: string): number;
  calculateFuelCost(mileage: number, ratio: number, efficiency: number, fuelType: string, state: string): number;
  calculateIPVA(price: number, state: string, fuelType: string): number;
  calculateInsurance(price: number, category: string, state: string): number;
  calculateMaintenance(mileage: number, category: string): number;
}
```

## Non-Functional Requirements

### Accuracy
- TCO calculations should be within ±10% of real-world values
- Use Brazilian market-specific rates and prices
- Update fuel prices annually (configurable)

### Performance
- Single TCO calculation: < 10ms
- Batch calculation for 100 vehicles: < 500ms

### Testability
- Unit tests for each component calculation
- Integration tests for full TCO calculation
- Test with real-world examples to validate accuracy

## Acceptance Criteria

1. TCOCalculator class implemented with all calculation methods
2. Unit tests for each component (depreciation, fuel, IPVA, insurance, maintenance)
3. Integration tests for full TCO calculation
4. Tests validate against manual calculations for sample vehicles
5. All calculations use Brazilian market-specific rates
6. Configuration file for fuel prices and tax rates (easy to update)

## Dependencies

- F-03: Vehicle catalog cross-reference (provides vehicle data)
- F-04: OpenAPI spec (defines request/response schemas)

## Notes

- v1 assumes new vehicles (0-2 years old) for simplicity
- Driver age not considered in v1 (use default 30-40 age group)
- Fuel prices should be configurable and updateable
- IPVA rates may vary by municipality - use state averages for v1
