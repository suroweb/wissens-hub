---
status: resolved
phase: 04-backend-architecture-api-skeleton
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md, 04-04-SUMMARY.md]
started: 2026-03-16T09:00:00Z
updated: 2026-03-16T17:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running Azure Functions host. Run `cd api/src/WissensHub.Functions && func start` from scratch. The host boots without errors, lists 11 functions (10 API + 1 Health), and `curl http://localhost:7071/api/health` returns a 200 response.
result: issue
reported: "GetAdminReports function fails to register: 'The specified route conflicts with one or more built in routes.' Only 10/11 functions loaded. Storage health check also reports unhealthy (timeout)."
severity: major

### 2. Solution Build & Test Suite
expected: Running `dotnet build api/WissensHub.slnx` completes with 0 errors. Running `dotnet test api/WissensHub.slnx` passes all 14 tests with 0 failures.
result: pass

### 3. Get Article Status Endpoint
expected: With the Functions host running, `curl http://localhost:7071/api/articles/1/status` returns a JSON response wrapped in ApiResponse envelope with `succeeded: true` and data containing mock German article metadata (e.g. IT-Sicherheit category).
result: issue
reported: "Auth middleware blocks all unauthenticated requests with 'Missing or invalid Authorization header.' No way to test endpoints locally without a valid Entra ID token."
severity: major

### 4. Get Unread Articles Endpoint
expected: `curl http://localhost:7071/api/articles/unread` returns an ApiResponse with a list of 3 mock German unread articles including titles and categories.
result: skipped
reason: Same auth middleware block as test 3

### 5. Mark As Read Endpoint
expected: `curl -X POST http://localhost:7071/api/articles/1/read` returns an ApiResponse with a read confirmation DTO containing the page ID and timestamp.
result: skipped
reason: Same auth middleware block as test 3

### 6. Flag Article Endpoint
expected: `curl -X POST -H "Content-Type: application/json" -d '{"pageId":1,"reason":"Veraltet"}' http://localhost:7071/api/articles/1/flag` returns an ApiResponse with a flag confirmation DTO.
result: skipped
reason: Same auth middleware block as test 3

### 7. Toggle Favorite Endpoint
expected: `curl -X POST http://localhost:7071/api/articles/1/favorite` returns an ApiResponse with a toggle result showing the new favorite state (true/false).
result: skipped
reason: Same auth middleware block as test 3

### 8. Get Favorites Endpoint
expected: `curl http://localhost:7071/api/favorites` returns an ApiResponse with a list of mock favorite articles with German titles and categories.
result: skipped
reason: Same auth middleware block as test 3

### 9. Dashboard Stats Endpoint
expected: `curl http://localhost:7071/api/dashboard/stats` returns an ApiResponse with dashboard statistics including UnreadCount, FavoritesCount, and PendingReviewsCount (mock values: 3, 2, 1).
result: skipped
reason: Same auth middleware block as test 3

## Summary

total: 9
passed: 1
issues: 2
pending: 0
skipped: 6

## Gaps

- truth: "All 11 functions register and host boots without errors"
  status: resolved
  reason: "User reported: GetAdminReports function fails to register: 'The specified route conflicts with one or more built in routes.' Only 10/11 functions loaded. Storage health check also reports unhealthy (timeout)."
  severity: major
  test: 1
  root_cause: "AdminFunctions.cs line 13 uses Route = \"admin/reports\". Azure Functions reserves the /admin prefix for built-in management APIs, causing a route collision."
  artifacts:
    - path: "api/src/WissensHub.Functions/Functions/AdminFunctions.cs"
      issue: "Route = \"admin/reports\" collides with reserved /admin prefix"
  missing:
    - "Change route to \"administration/reports\" or \"reports/admin\" to avoid reserved prefix"
  debug_session: ""

- truth: "API endpoints return mock data when called locally"
  status: resolved
  reason: "User reported: Auth middleware blocks all unauthenticated requests with 'Missing or invalid Authorization header.' No way to test endpoints locally without a valid Entra ID token."
  severity: major
  test: 3
  root_cause: "AuthenticationMiddleware.cs lines 65-71 unconditionally reject requests without Bearer token. No IHostEnvironment check for Development mode. local.settings.json missing AZURE_FUNCTIONS_ENVIRONMENT setting."
  artifacts:
    - path: "api/src/WissensHub.Functions/Middleware/AuthenticationMiddleware.cs"
      issue: "Hard 401 at lines 65-71 with no dev bypass"
    - path: "api/src/WissensHub.Functions/local.settings.json"
      issue: "Missing AZURE_FUNCTIONS_ENVIRONMENT=Development"
  missing:
    - "Add IHostEnvironment injection to AuthenticationMiddleware"
    - "Add dev bypass: if IsDevelopment(), seed synthetic ClaimsPrincipal and skip token validation"
    - "Add AZURE_FUNCTIONS_ENVIRONMENT=Development to local.settings.json"
  debug_session: ".planning/debug/auth-middleware-blocks-local.md"
