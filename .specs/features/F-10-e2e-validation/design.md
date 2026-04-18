# F-10: End-to-end Validation

## Overview
This feature implements end-to-end (E2E) testing for the entire iMotors funnel. We need to validate that a user can open the landing page, navigate through the Conversational Wizard, submit constraints, and receive an accurate Top 3 TCO recommendations report, including handling cases with 0 results.

## Scope
- Setup an E2E testing framework (Playwright recommended).
- Write E2E test scenarios covering the full funnel:
  1. Happy Path: standard budget (e.g. 3000), standard mileage, sedan.
  2. Edge Case: Extremely low budget (e.g. 500) where no vehicles match, ensuring the "No Vehicles Found" graceful UI handles it.
  3. High Budget / SUV Path: Confirm proper filtering and matching.
- Set up a Github Actions workflow or script to execute these E2E tests against a staged environment or local server.

## Architecture
- Tool: `Playwright` installed in `web/` or a new standalone `e2e/` folder.
- Playwright config sets the `baseURL` to the Vite dev server, and uses `webServer` to spin up both the Vite frontend and Node API backend before running the suite.
- Tests assert DOM elements, routing transitions, and API mock interception where necessary (though testing against the real API is preferred for true E2E).

## Acceptance Criteria
- [ ] Playwright is set up and configured.
- [ ] At least 3 full-funnel test scenarios are defined and passing.
- [ ] A local script `npm run test:e2e` spins up the environment and runs the suite successfully.
