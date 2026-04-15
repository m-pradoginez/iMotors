# F-04 Spec: OpenAPI Spec Design

**Status**: Ready for implementation

## Overview

Define the OpenAPI 3.0 specification for the iMotors REST API. This spec will serve as the contract between frontend and backend, and will be used to generate server stubs, client SDKs, and documentation.

## Functional Requirements

### Endpoints

#### 1. Vehicle Catalog Endpoints

**GET /vehicles**
- Query vehicles from the unified catalog
- Query parameters:
  - `brand` (optional): Filter by vehicle brand
  - `category` (optional): Filter by vehicle category (hatchback, sedan, suv, pickup, etc.)
  - `fuel_type` (optional): Filter by fuel type (gasolina, etanol, flex, diesel, hibrido, eletrico)
  - `year_min` (optional): Minimum model year
  - `year_max` (optional): Maximum model year
  - `price_min` (optional): Minimum price
  - `price_max` (optional): Maximum price
  - `limit` (optional): Number of results to return (default: 50, max: 200)
  - `offset` (optional): Pagination offset (default: 0)
- Response: Paginated list of vehicles with price and efficiency data
- Authentication: Not required (public endpoint)

**GET /vehicles/{fipe_code}**
- Get a single vehicle by FIPE code
- Response: Vehicle details with price and efficiency data
- Authentication: Not required (public endpoint)

#### 2. Recommendations Endpoint

**POST /recommendations**
- Accept user constraints and return ranked vehicle recommendations
- Request body:
  ```json
  {
    "budget_monthly": 3000,
    "mileage_annual_km": 15000,
    "city_highway_ratio": 0.7,
    "state": "SP",
    "category": "hatchback",
    "fuel_preference": "flex"
  }
  ```
- Response: Top 3 ranked vehicles with TCO breakdown
  ```json
  {
    "recommendations": [
      {
        "rank": 1,
        "vehicle": { /* vehicle details */ },
        "tco_monthly": 2850,
        "breakdown": {
          "depreciation_monthly": 1200,
          "fuel_cost_monthly": 800,
          "ipva_monthly": 150,
          "insurance_monthly": 500,
          "maintenance_monthly": 200
        }
      },
      /* ... 2 more recommendations */
    ]
  }
  ```
- Authentication: Not required (public endpoint)

#### 3. Health Check Endpoint

**GET /health**
- Health check endpoint for monitoring
- Response: Service status and database connectivity
- Authentication: Not required (public endpoint)

### Data Models

#### Vehicle
```yaml
Vehicle:
  type: object
  properties:
    fipe_code:
      type: string
      example: "001001-0"
    brand:
      type: string
      example: "TOYOTA"
    model:
      type: string
      example: "COROLLA"
    year:
      type: integer
      example: 2023
    fuel_type:
      type: string
      enum: [gasolina, etanol, flex, diesel, hibrido, eletrico]
      example: "flex"
    price:
      type: number
      format: float
      example: 120000
      nullable: true
    city_km_l:
      type: number
      format: float
      example: 12.5
      nullable: true
    highway_km_l:
      type: number
      format: float
      example: 15.2
      nullable: true
    efficiency_rating:
      type: string
      example: "A"
      nullable: true
    match_confidence:
      type: string
      enum: [exact, fuzzy, manual]
      example: "exact"
```

#### RecommendationRequest
```yaml
RecommendationRequest:
  type: object
  required: [budget_monthly, mileage_annual_km, city_highway_ratio, state]
  properties:
    budget_monthly:
      type: number
      format: float
      minimum: 500
      maximum: 20000
      example: 3000
    mileage_annual_km:
      type: number
      format: integer
      minimum: 1000
      maximum: 100000
      example: 15000
    city_highway_ratio:
      type: number
      format: float
      minimum: 0
      maximum: 1
      example: 0.7
    state:
      type: string
      enum: [AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO]
      example: "SP"
    category:
      type: string
      enum: [hatchback, sedan, suv, pickup, minivan, coupe, conversivel]
      example: "hatchback"
    fuel_preference:
      type: string
      enum: [gasolina, etanol, flex, diesel, hibrido, eletrico]
      example: "flex"
```

#### RecommendationResponse
```yaml
RecommendationResponse:
  type: object
  properties:
    recommendations:
      type: array
      maxItems: 3
      items:
        type: object
        properties:
          rank:
            type: integer
            minimum: 1
            maximum: 3
          vehicle:
            $ref: '#/components/schemas/Vehicle'
          tco_monthly:
            type: number
            format: float
            example: 2850
          breakdown:
            type: object
            properties:
              depreciation_monthly:
                type: number
                format: float
              fuel_cost_monthly:
                type: number
                format: float
              ipva_monthly:
                type: number
                format: float
              insurance_monthly:
                type: number
                format: float
              maintenance_monthly:
                type: number
                format: float
```

### Error Responses

All endpoints return consistent error responses:

```yaml
Error:
  type: object
  properties:
    error:
      type: string
      example: "Invalid request"
    message:
      type: string
      example: "budget_monthly must be between 500 and 20000"
    code:
      type: string
      example: "VALIDATION_ERROR"
```

HTTP status codes:
- 200: Success
- 400: Bad Request (validation error)
- 404: Not Found (vehicle not found)
- 500: Internal Server Error

## Non-Functional Requirements

### Performance
- Vehicle query endpoint: < 200ms response time for typical queries
- Recommendations endpoint: < 500ms response time
- Health check: < 50ms response time

### Scalability
- Support at least 100 concurrent requests
- No stateful sessions required (stateless REST API)

### Documentation
- Auto-generated API documentation from OpenAPI spec
- Include example requests and responses for all endpoints
- Document all query parameters and request body fields

## Acceptance Criteria

1. OpenAPI 3.0 spec file created in `api/openapi.yaml`
2. All endpoints defined with complete request/response schemas
3. All data models documented with examples
4. Error responses standardized across all endpoints
5. Spec validates successfully using OpenAPI validator
6. Spec can be used to generate server stubs (e.g., using openapi-generator)
7. Spec includes examples for all endpoints

## Dependencies

- F-03: Vehicle catalog cross-reference (provides data model reference)
