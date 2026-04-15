# F-05 Tasks: TCO Calculation Engine

**Spec**: `.specs/features/F-05-tco-engine/spec.md`
**Status**: Ready for implementation

---

## Task List

| ID | Task | Est | Depends | Gate | Status |
|---|---|---|---|---|---|
| T1 | Create TCO calculator class structure | 0.5h | - | quick | `[x] Complete` |
| T2 | Implement depreciation calculation | 1h | T1 | quick | `[x] Complete` |
| T3 | Implement fuel cost calculation | 1h | T1 | quick | `[x] Complete` |
| T4 | Implement IPVA calculation | 1h | T1 | quick | `[x] Complete` |
| T5 | Implement insurance calculation | 1h | T1 | quick | `[x] Complete` |
| T6 | Implement maintenance calculation | 1h | T1 | quick | `[x] Complete` |
| T7 | Implement main TCO calculation method | 1h | T2-T6 | quick | `[x] Complete` |
| T8 | Add configuration for rates and prices | 0.5h | T1 | quick | `[x] Complete` |
| T9 | Write unit tests for each component | 2h | T2-T8 | build | `[ ] Not started` |
| T10 | Write integration tests for TCO calculation | 1h | T7, T9 | build | `[ ] Not started` |
| T11 | Validate against manual calculations | 1h | T10 | build | `[ ] Not started` |

---

## T1: Create TCO Calculator Class Structure

**Files**: `api/src/tco/tcoCalculator.ts`, `api/src/tco/types.ts`

**Description**: Create the TCOCalculator class with TypeScript interfaces for input/output.

**Done when**:
- TCOCalculator class created with method signatures
- TCOInput interface defined
- TCOOutput interface defined
- Types file exported

**Gate check**: TypeScript compiles without errors

---

## T2: Implement Depreciation Calculation

**Files**: `api/src/tco/tcoCalculator.ts`

**Description**: Implement depreciation calculation with category-specific rates.

**Done when**:
- `calculateDepreciation` method implemented
- Depreciation rates by category defined
- Formula: `(price * depreciation_rate) / 12`
- Unit tests written for each category

**Gate check**: Tests pass for all categories

---

## T3: Implement Fuel Cost Calculation

**Files**: `api/src/tco/tcoCalculator.ts`

**Description**: Implement fuel cost calculation based on mileage, efficiency, and fuel prices.

**Done when**:
- `calculateFuelCost` method implemented
- Fuel prices defined (gasolina, etanol, diesel, etc.)
- Efficiency calculation handles city/highway ratio
- Handles missing efficiency data with category defaults
- Unit tests written for each fuel type

**Gate check**: Tests pass for all fuel types

---

## T4: Implement IPVA Calculation

**Files**: `api/src/tco/tcoCalculator.ts`

**Description**: Implement IPVA tax calculation with state-specific rates and special rules.

**Done when**:
- `calculateIPVA` method implemented
- IPVA rates by state defined
- Electric vehicle discount applied
- High-value vehicle surcharge applied
- Unit tests written for each state and special case

**Gate check**: Tests pass for all states and edge cases

---

## T5: Implement Insurance Calculation

**Files**: `api/src/tco/tcoCalculator.ts`

**Description**: Implement insurance cost estimation based on price, category, and state.

**Done when**:
- `calculateInsurance` method implemented
- Base rate, price factors, category factors, state factors defined
- Formula applied correctly
- Unit tests written for each factor combination

**Gate check**: Tests pass for all factor combinations

---

## T6: Implement Maintenance Calculation

**Files**: `api/src/tco/tcoCalculator.ts`

**Description**: Implement maintenance cost estimation based on mileage and category.

**Done when**:
- `calculateMaintenance` method implemented
- Base maintenance, age factors, category factors, mileage factors defined
- Formula applied correctly (assume new vehicle for v1)
- Unit tests written for each category and mileage range

**Gate check**: Tests pass for all categories

---

## T7: Implement Main TCO Calculation Method

**Files**: `api/src/tco/tcoCalculator.ts`

**Description**: Implement the main `calculate` method that combines all component calculations.

**Done when**:
- `calculate` method implemented
- Calls all component calculation methods
- Returns TCOOutput with breakdown
- Handles missing vehicle data gracefully
- Integration test written

**Gate check**: Integration test passes

---

## T8: Add Configuration for Rates and Prices

**Files**: `api/src/tco/config.ts`

**Description**: Create configuration file for fuel prices, depreciation rates, IPVA rates, etc.

**Done when**:
- Configuration file created with all rates
- Exported as constants or config object
- Easy to update without code changes
- Documented with comments

**Gate check**: Config file imports correctly

---

## T9: Write Unit Tests for Each Component

**Files**: `api/src/tco/tcoCalculator.test.ts`

**Description**: Write comprehensive unit tests for each calculation method.

**Done when**:
- Unit tests for depreciation (7 tests for each category)
- Unit tests for fuel cost (5 tests for each fuel type)
- Unit tests for IPVA (tests for each state and special case)
- Unit tests for insurance (tests for factor combinations)
- Unit tests for maintenance (tests for categories and mileage)
- All tests pass

**Gate check**: All unit tests pass

---

## T10: Write Integration Tests for TCO Calculation

**Files**: `api/src/tco/tcoCalculator.test.ts`

**Description**: Write integration tests for the full TCO calculation.

**Done when**:
- Integration test with sample vehicle data
- Test validates breakdown sums to total
- Test handles missing data gracefully
- Test uses real-world vehicle examples

**Gate check**: Integration tests pass

---

## T11: Validate Against Manual Calculations

**Files**: `api/src/tco/tcoCalculator.test.ts`

**Description**: Validate TCO calculations against manual calculations for sample vehicles.

**Done when**:
- Manual calculations for 3-5 sample vehicles
- TCO engine results match manual calculations within ±10%
- Document validation results
- Any discrepancies investigated and explained

**Gate check**: Validation passes within tolerance

---

## Completion Criteria

- All tasks marked complete
- All unit tests pass
- All integration tests pass
- Validation against manual calculations passes
- ROADMAP updated to mark F-05 as Complete
- STATE.md updated with F-05 completion
