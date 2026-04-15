# F-06 Tasks: Recommendation API

**Spec**: `.specs/features/F-06-recommendation-api/spec.md`
**Status**: Ready for implementation

---

## Task List

| ID | Task | Est | Depends | Gate | Status |
|---|---|---|---|---|---|
| T1 | Create recommendation service structure | 0.5h | - | quick | `[ ] Not started` |
| T2 | Implement input validation | 1h | T1 | quick | `[ ] Not started` |
| T3 | Implement vehicle catalog query | 1h | T1 | quick | `[ ] Not started` |
| T4 | Integrate TCO calculator | 1h | T1, F-05 | quick | `[ ] Not started` |
| T5 | Implement ranking logic | 1h | T3, T4 | quick | `[ ] Not started` |
| T6 | Implement POST /recommendations endpoint | 1h | T2, T5 | quick | `[ ] Not started` |
| T7 | Write unit tests for recommendation logic | 2h | T2-T5 | build | `[ ] Not started` |
| T8 | Write integration tests for endpoint | 1h | T6, T7 | build | `[ ] Not started` |
| T9 | Validate against OpenAPI spec | 0.5h | T6 | build | `[ ] Not started` |

---

## T1: Create recommendation service structure

**Files**: `api/src/recommendations/recommendationService.ts`, `api/src/recommendations/types.ts`

**Description**: Create the recommendation service with TypeScript interfaces for request/response.

**Done when**:
- RecommendationRequest interface created with validation rules
- RecommendationResponse interface created
- RecommendationService class created with placeholder methods
- Types exported and ready for use

---

## T2: Implement input validation

**Files**: `api/src/recommendations/validation.ts`

**Description**: Implement validation logic for recommendation request parameters.

**Done when**:
- validateRecommendationRequest function implemented
- Validates budget_monthly (500-20000)
- Validates mileage_annual_km (1000-100000)
- Validates city_highway_ratio (0-1)
- Validates state code (2 letters, valid Brazilian state)
- Validates category if provided
- Validates fuel_preference if provided
- Returns detailed error messages for invalid input
- Unit tests for validation logic

---

## T3: Implement vehicle catalog query

**Files**: `api/src/recommendations/vehicleQuery.ts`

**Description**: Implement query logic to fetch vehicles from PostgreSQL with optional filters.

**Done when**:
- queryVehicles function implemented
- Connects to PostgreSQL database
- Applies category filter if specified
- Applies fuel_type filter if fuel_preference specified
- Excludes vehicles with missing price or efficiency data
- Optional: Price range filter (2x budget_monthly * 12)
- Unit tests for query logic with mock database

---

## T4: Integrate TCO calculator

**Files**: `api/src/recommendations/tcoIntegration.ts`

**Description**: Integrate the TCO calculator from F-05 to calculate TCO for each vehicle.

**Done when**:
- calculateVehicleTCO function implemented
- Imports TCOCalculator from F-05
- Maps vehicle data to TCOInput format
- Calls TCOCalculator.calculate for each vehicle
- Returns TCOOutput with breakdown
- Filters out vehicles exceeding budget_monthly
- Unit tests for TCO integration

---

## T5: Implement ranking logic

**Files**: `api/src/recommendations/ranking.ts`

**Description**: Implement ranking logic to sort vehicles by lowest TCO.

**Done when**:
- rankVehicles function implemented
- Sorts vehicles by tco_monthly ascending
- Tie-breaking: Prefer better efficiency rating
- Tie-breaking: Prefer lower price
- Returns Top 3 ranked vehicles
- Handles case when fewer than 3 vehicles match
- Unit tests for ranking logic

---

## T6: Implement POST /recommendations endpoint

**Files**: `api/src/recommendations/recommendationController.ts`, `api/src/recommendations/recommendationService.ts`

**Description**: Implement the REST API endpoint for recommendations.

**Done when**:
- POST /recommendations endpoint created
- Uses validation from T2
- Queries vehicles from T3
- Calculates TCO from T4
- Ranks vehicles from T5
- Returns Top 3 with breakdown in correct format
- Error handling for no matching vehicles (404)
- Error handling for invalid input (400)
- Error handling for calculation errors (500)

---

## T7: Write unit tests for recommendation logic

**Files**: `api/src/recommendations/validation.test.ts`, `api/src/recommendations/ranking.test.ts`

**Description**: Write unit tests for validation and ranking logic.

**Done when**:
- Validation tests for all input fields
- Validation tests for edge cases (boundary values)
- Ranking tests for normal case
- Ranking tests for tie-breaking logic
- Ranking tests for fewer than 3 vehicles
- All tests passing

---

## T8: Write integration tests for endpoint

**Files**: `api/src/recommendations/recommendationController.test.ts`

**Description**: Write integration tests for the full recommendation endpoint.

**Done when**:
- Integration test with sample vehicle data
- Test happy path: valid request returns 3 recommendations
- Test no matches: returns 404
- Test invalid input: returns 400
- Test with category filter
- Test with fuel_preference filter
- All tests passing

---

## T9: Validate against OpenAPI spec

**Files**: Manual validation

**Description**: Validate that the implementation matches the OpenAPI spec from F-04.

**Done when**:
- Request format matches OpenAPI spec
- Response format matches OpenAPI spec
- Error responses match OpenAPI spec
- HTTP status codes match OpenAPI spec
- Document any discrepancies
