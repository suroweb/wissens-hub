---
phase: 11-testing
plan: 00
subsystem: testing
tags: [jest, playwright, xunit, testing-library, sql-server, e2e, integration-tests]

# Dependency graph
requires:
  - phase: 03-frontend-foundation
    provides: WissensHubContext, IServiceContainer, mock services, ToastProvider
  - phase: 04-backend-core
    provides: MediatR pipeline, repositories, EF Core DbContext, domain entities
provides:
  - renderWithContext() test helper for frontend component testing
  - IntegrationTestFixture with real SQL Server for backend integration tests
  - IntegrationTestBase with cleanup and seed helpers
  - Playwright E2E scaffold with Edge SSO auth and workbench fixtures
  - Unified npm test scripts (test:frontend, test:backend, test:e2e, test:all)
affects: [11-01-frontend-tests, 11-02-backend-tests, 11-03-e2e-tests, 11-04-e2e-tests]

# Tech tracking
tech-stack:
  added: ["@testing-library/user-event@13.5.0", "@playwright/test@1.58.2"]
  patterns: [renderWithContext-helper, integration-test-fixture, worker-scoped-e2e-fixtures, edge-sso-auth]

key-files:
  created:
    - spfx/src/shared/test-utils.tsx
    - api/tests/WissensHub.Tests/Infrastructure/IntegrationTestFixture.cs
    - api/tests/WissensHub.Tests/Infrastructure/IntegrationTestBase.cs
    - e2e/playwright.config.ts
    - e2e/global-setup.ts
    - e2e/fixtures/spfx-fixtures.ts
    - e2e/package.json
    - e2e/tsconfig.json
    - e2e/.gitignore
    - e2e/tests/.gitkeep
  modified:
    - spfx/package.json
    - package.json
    - api/tests/WissensHub.Tests/WissensHub.Tests.csproj
    - api/tests/WissensHub.Tests/Infrastructure/DatabaseSchemaTests.cs

key-decisions:
  - "Used @testing-library/user-event v13.5.0 (not v14) to avoid fake-timer conflicts with React 17 + RTL 12"
  - "IntegrationTestFixture uses WissensHub_Test database (not WissensHub dev) to avoid corrupting dev data"
  - "EnsureCreatedAsync instead of MigrateAsync for faster test database setup"
  - "createWebPartFixture() factory pattern for per-web-part E2E test fixtures"
  - "Updated DatabaseSchemaTests to use SqlServer provider (dummy connection) after removing InMemory"

patterns-established:
  - "renderWithContext: wraps component in WissensHubContext.Provider + ToastProvider with mock services"
  - "IntegrationTestBase: abstract base class with CleanupAsync, SeedArticle, scope/mediator/dbcontext helpers"
  - "createWebPartFixture: factory returning Playwright test with worker-scoped workbench for specific web part"
  - "Edge SSO auth: persistent profile with 8-hour validity window and interactive fallback"

requirements-completed: [TEST-01, TEST-02, TEST-03]

# Metrics
duration: 5min
completed: 2026-03-17
---

# Phase 11 Plan 00: Test Infrastructure Summary

**renderWithContext() frontend helper, SQL Server integration test fixture, Playwright E2E scaffold with Edge SSO, and unified npm test scripts**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-17T18:29:41Z
- **Completed:** 2026-03-17T18:34:57Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- Created renderWithContext() helper that wraps components in WissensHubContext.Provider with mock services and ToastProvider
- Built IntegrationTestFixture with real SQL Server (WissensHub_Test database), full MediatR pipeline, all 8 repositories, and dev claims principal
- Scaffolded complete Playwright E2E directory with Edge SSO auth, worker-scoped workbench fixtures, and createWebPartFixture() factory
- Added unified test scripts to root package.json (test:frontend, test:backend, test:e2e, test:all)

## Task Commits

Each task was committed atomically:

1. **Task 1: Frontend test infrastructure + E2E scaffold + npm scripts** - `ce7e534` (feat)
2. **Task 2: Backend integration test fixture + csproj update** - `0b56427` (feat)

Additional:
- **e2e package-lock.json** - `ba148b0` (chore)

## Files Created/Modified
- `spfx/src/shared/test-utils.tsx` - renderWithContext() helper with mock services and context
- `spfx/package.json` - Added @testing-library/user-event@13.5.0
- `e2e/package.json` - E2E project with @playwright/test@1.58.2
- `e2e/tsconfig.json` - TypeScript config for E2E tests
- `e2e/playwright.config.ts` - Playwright config with Edge, workers:1, fullyParallel:false
- `e2e/global-setup.ts` - Edge SSO auth with persistent profile and interactive fallback
- `e2e/fixtures/spfx-fixtures.ts` - Worker-scoped workbench fixtures with createWebPartFixture()
- `e2e/.gitignore` - Ignores auth state, test results, node_modules
- `e2e/tests/.gitkeep` - Empty tests directory placeholder
- `package.json` - Added test:frontend, test:backend, test:e2e, test:all scripts
- `api/tests/WissensHub.Tests/WissensHub.Tests.csproj` - Removed InMemory provider
- `api/tests/WissensHub.Tests/Infrastructure/IntegrationTestFixture.cs` - xUnit IAsyncLifetime fixture with real SQL Server
- `api/tests/WissensHub.Tests/Infrastructure/IntegrationTestBase.cs` - Abstract base with CleanupAsync and SeedArticle
- `api/tests/WissensHub.Tests/Infrastructure/DatabaseSchemaTests.cs` - Updated to use SqlServer provider

## Decisions Made
- Used @testing-library/user-event v13.5.0 (not v14) to avoid fake-timer conflicts with React 17 + RTL 12
- IntegrationTestFixture uses WissensHub_Test database (not WissensHub dev) to avoid corrupting dev data
- EnsureCreatedAsync instead of MigrateAsync for faster test database setup without migration history issues
- createWebPartFixture() factory pattern so each E2E spec can target a specific web part by name
- Updated existing DatabaseSchemaTests to use SqlServer provider with dummy connection string for model inspection

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated DatabaseSchemaTests to use SqlServer provider**
- **Found during:** Task 2 (Backend integration test fixture)
- **Issue:** Removing Microsoft.EntityFrameworkCore.InMemory broke DatabaseSchemaTests.cs which used UseInMemoryDatabase
- **Fix:** Changed CreateContext() to use UseSqlServer with a dummy connection string (tests only inspect EF model metadata, no actual DB connection)
- **Files modified:** api/tests/WissensHub.Tests/Infrastructure/DatabaseSchemaTests.cs
- **Verification:** dotnet build succeeds with 0 errors
- **Committed in:** 0b56427 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix was necessary to maintain build integrity after removing InMemory provider. No scope creep.

## Issues Encountered
None

## User Setup Required

Backend integration tests require SQL Server 2022 running in Docker:
- Run: `docker-compose -f docker/docker-compose.yml up -d`
- The test fixture automatically creates/drops the `WissensHub_Test` database

## Next Phase Readiness
- Test infrastructure ready for Plans 01-04 to implement actual tests
- Frontend: renderWithContext() available for component tests
- Backend: IntegrationTestFixture/Base available for MediatR handler tests
- E2E: Playwright scaffold with auth ready for workbench tests

## Self-Check: PASSED

All 6 created files verified on disk. All 3 commit hashes verified in git log.

---
*Phase: 11-testing*
*Completed: 2026-03-17*
