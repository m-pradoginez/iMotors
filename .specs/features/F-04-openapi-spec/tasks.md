# F-04 Tasks: OpenAPI Spec Design

**Spec**: `.specs/features/F-04-openapi-spec/spec.md`
**Status**: Ready for implementation

---

## Task List

| ID | Task | Est | Depends | Gate | Status |
|---|---|---|---|---|---|
| T1 | Create OpenAPI YAML file structure | 0.5h | - | quick | `[x] Complete` |
| T2 | Define vehicle catalog endpoints | 1h | T1 | quick | `[x] Complete` |
| T3 | Define recommendation endpoint | 1h | T1 | quick | `[x] Complete` |
| T4 | Define data models and schemas | 1h | T2, T3 | quick | `[x] Complete` |
| T5 | Define error responses and status codes | 0.5h | T2, T3 | quick | `[x] Complete` |
| T6 | Add examples and documentation | 1h | T4 | quick | `[x] Complete` |
| T7 | Validate OpenAPI spec | 0.5h | T6 | build | `[ ] Not started` |
| T8 | Generate server stub to verify | 0.5h | T7 | build | `[ ] Not started` |

---

## T1: Create OpenAPI YAML File Structure

**Files**: `api/openapi.yaml`

**Description**: Initialize the OpenAPI 3.0 YAML file with basic structure including info, servers, and paths sections.

**Done when**:
- OpenAPI version 3.0.3 declared
- Info section with title, version, description
- Servers section with development server URL
- Paths section initialized
- Components section initialized for schemas

**Gate check**: File exists and is valid YAML

---

## T2: Define Vehicle Catalog Endpoints

**Files**: `api/openapi.yaml`

**Description**: Define GET /vehicles and GET /vehicles/{fipe_code} endpoints with query parameters and response schemas.

**Done when**:
- GET /vehicles endpoint defined with all query parameters
- GET /vehicles/{fipe_code} endpoint defined
- Response schemas referenced from components
- Query parameters documented with descriptions and examples

**Gate check**: Endpoints are syntactically valid in OpenAPI spec

---

## T3: Define Recommendation Endpoint

**Files**: `api/openapi.yaml`

**Description**: Define POST /recommendations endpoint with request body and response schema.

**Done when**:
- POST /recommendations endpoint defined
- Request body schema with all required and optional fields
- Response schema with recommendations array
- Request/response examples provided

**Gate check**: Endpoint is syntactically valid in OpenAPI spec

---

## T4: Define Data Models and Schemas

**Files**: `api/openapi.yaml`

**Description**: Define all data models in components/schemas section with proper types, constraints, and enums.

**Done when**:
- Vehicle schema defined with all fields
- RecommendationRequest schema defined with validation constraints
- RecommendationResponse schema defined with nested breakdown
- All schemas have proper types (string, number, integer, enum)
- Enums defined for fuel_type, state, category, match_confidence

**Gate check**: All schemas reference correctly from endpoints

---

## T5: Define Error Responses and Status Codes

**Files**: `api/openapi.yaml`

**Description**: Standardize error responses across all endpoints with consistent structure and HTTP status codes.

**Done when**:
- Error schema defined with error, message, and code fields
- All endpoints include error responses for 400, 404, 500
- Error codes documented (VALIDATION_ERROR, NOT_FOUND, INTERNAL_ERROR)
- Description provided for each error response

**Gate check**: Error responses are consistent across endpoints

---

## T6: Add Examples and Documentation

**Files**: `api/openapi.yaml`

**Description**: Add example requests and responses for all endpoints, and document all parameters and fields.

**Done when**:
- GET /vehicles has example response with multiple vehicles
- GET /vehicles/{fipe_code} has example response
- POST /recommendations has example request and response
- All query parameters have descriptions
- All request body fields have descriptions
- All response fields have descriptions

**Gate check**: Examples are valid and match schemas

---

## T7: Validate OpenAPI Spec

**Files**: `api/openapi.yaml`

**Description**: Validate the OpenAPI spec using a validator tool to ensure it conforms to OpenAPI 3.0 specification.

**Done when**:
- Spec validated using openapi-validator or similar tool
- No validation errors
- All references resolve correctly
- All required fields are present

**Gate check**: Spec passes validation without errors

---

## T8: Generate Server Stub to Verify

**Files**: `api/openapi.yaml`

**Description**: Use openapi-generator to generate a server stub to verify the spec is complete and usable.

**Done when**:
- Server stub generated (e.g., Node.js Express)
- Generated stub compiles without errors
- All endpoints are present in generated code
- All schemas are present in generated code

**Gate check**: Server stub generation succeeds

---

## Completion Criteria

- All tasks marked complete
- OpenAPI spec validated successfully
- Server stub generated successfully
- ROADMAP updated to mark F-04 as Complete
- STATE.md updated with F-04 completion
