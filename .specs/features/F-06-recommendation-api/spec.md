# F-06 Spec: Recommendation API

**Status**: Ready for implementation

## Overview

Implement the POST /recommendations endpoint that accepts user constraints, queries the vehicle catalog, calculates TCO for matching vehicles, ranks them by lowest TCO, and returns the Top 3 recommendations with cost breakdown.

## Functional Requirements

### 1. Recommendation Request Processing

**Input Validation:**
- Validate required fields: budget_monthly, mileage_annual_km, city_highway_ratio, state
- Validate optional fields: category, fuel_preference
- Enforce constraints:
  - budget_monthly: 500-20000
  - mileage_annual_km: 1000-100000
  - city_highway_ratio: 0-1
  - state: Valid Brazilian state code (2 letters)
  - category: Valid vehicle category if provided
  - fuel_preference: Valid fuel type if provided

**Vehicle Query:**
- Query the unified vehicles table (from F-03)
- Apply filters based on user constraints:
  - Filter by category if specified
  - Filter by fuel_type if fuel_preference specified
  - Exclude vehicles with missing price or efficiency data
- Limit query to vehicles within reasonable price range (optional: 2x budget_monthly * 12)

### 2. TCO Calculation

**For Each Matching Vehicle:**
- Use the TCO calculator (from F-05) to calculate monthly TCO
- Input: vehicle data + user constraints
- Output: TCO breakdown (depreciation, fuel cost, IPVA, insurance, maintenance)
- Filter out vehicles where TCO exceeds budget_monthly (optional: soft filter)

### 3. Ranking Logic

**Rank by Lowest TCO:**
- Sort vehicles by tco_monthly ascending
- Handle ties: Prefer vehicles with better fuel efficiency rating
- Handle ties: Prefer vehicles with lower price
- Return Top 3 ranked vehicles

### 4. Response Formatting

**Response Structure:**
```json
{
  "recommendations": [
    {
      "rank": 1,
      "vehicle": {
        "fipe_code": "001001-0",
        "brand": "TOYOTA",
        "model": "COROLLA",
        "year": 2023,
        "fuel_type": "flex",
        "category": "sedan",
        "price": 120000,
        "city_km_l": 10,
        "highway_km_l": 12,
        "efficiency_rating": "A",
        "match_confidence": "exact"
      },
      "tco_monthly": 2625.25,
      "breakdown": {
        "depreciation_monthly": 1200,
        "fuel_cost_monthly": 648.58,
        "ipva_monthly": 400,
        "insurance_monthly": 216.67,
        "maintenance_monthly": 160
      }
    },
    /* ... 2 more recommendations */
  ]
}
```

**Error Handling:**
- Return 400 for invalid input
- Return 404 if no vehicles match constraints
- Return 500 for calculation errors

### 5. Edge Cases

**No Matching Vehicles:**
- Return 404 with message: "No vehicles found matching the specified constraints"
- Suggest relaxing filters in error message

**Budget Exceeded:**
- Option A: Filter out vehicles exceeding budget and return 404 if none remain
- Option B: Return vehicles even if they exceed budget, with a warning flag
- Decision: Option A - filter out vehicles exceeding budget

**Missing Data:**
- Skip vehicles with missing price or efficiency data
- Log skipped vehicles for debugging

## Non-Functional Requirements

### Performance
- Response time: < 500ms for typical queries
- Support at least 100 concurrent requests

### Scalability
- Stateless REST API design
- No session management required

### Reliability
- Graceful degradation if TCO calculation fails for some vehicles
- Return partial results if possible

## Data Flow

```
User Request
  ↓
Input Validation
  ↓
Query Vehicle Catalog (PostgreSQL)
  ↓
Filter by Constraints
  ↓
For Each Vehicle:
  - Calculate TCO using TCOCalculator
  - Check budget constraint
  ↓
Rank by TCO (ascending)
  ↓
Return Top 3 with breakdown
```

## Acceptance Criteria

1. POST /recommendations endpoint implemented
2. Input validation with proper error messages
3. Vehicle catalog query with optional filters
4. TCO calculation using F-05 calculator
5. Ranking logic returns Top 3 lowest TCO vehicles
6. Response format matches OpenAPI spec from F-04
7. Error handling for no matching vehicles
8. Unit tests for recommendation logic
9. Integration tests with sample data
10. Performance: < 500ms response time

## Dependencies

- F-03: Vehicle catalog cross-reference (provides data source)
- F-04: OpenAPI spec (defines API contract)
- F-05: TCO calculation engine (provides TCO calculation logic)

## Implementation Notes

- Use PostgreSQL client to query vehicles table
- Import TCOCalculator from F-05
- Implement ranking logic in service layer
- Add input validation middleware
- Consider caching for frequent queries (optional)
- Log recommendations for analytics (optional)
