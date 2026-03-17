---
phase: 11-testing
plan: 04
subsystem: testing
tags: [xunit, mediatr, integration-tests, sql-server, ef-core, fluent-validation]

# Dependency graph
requires:
  - phase: 11-testing/00
    provides: IntegrationTestFixture, IntegrationTestBase, SQL Server Docker setup
  - phase: 04-backend
    provides: MediatR handlers, commands, queries, pipeline behaviors
provides:
  - 36 endpoint integration tests covering all 10 API endpoints
  - Full MediatR pipeline validation (behaviors + handlers + EF Core + SQL Server)
  - Categories CRUD, target groups, and reminder interval admin tests
affects: [11-testing]

# Tech tracking
tech-stack:
  added: []
  patterns: [collection-fixture-sharing, per-test-cleanup, seed-then-assert]

key-files:
  created:
    - api/tests/WissensHub.Tests/Endpoints/ArticleEndpointTests.cs
    - api/tests/WissensHub.Tests/Endpoints/FavoriteEndpointTests.cs
    - api/tests/WissensHub.Tests/Endpoints/ApprovalEndpointTests.cs
    - api/tests/WissensHub.Tests/Endpoints/DashboardEndpointTests.cs
    - api/tests/WissensHub.Tests/Endpoints/ReadStatsEndpointTests.cs
    - api/tests/WissensHub.Tests/Endpoints/AdminEndpointTests.cs
    - api/tests/WissensHub.Tests/Infrastructure/IntegrationTestCollection.cs
  modified:
    - api/tests/WissensHub.Tests/Infrastructure/IntegrationTestBase.cs

key-decisions:
  - "IntegrationTestCollection with [Collection(\"Integration\")] replaces IClassFixture to share single fixture across all test classes"
  - "SystemConfigurations added to CleanupAsync for reminder interval test isolation"

patterns-established:
  - "Collection fixture sharing: all endpoint test classes share one IntegrationTestFixture instance via [Collection(\"Integration\")]"
  - "Per-test cleanup: constructor calls CleanupAsync().GetAwaiter().GetResult() for data isolation"

requirements-completed: [TEST-02]

# Metrics
duration: 12min
completed: 2026-03-17
---

# Phase 11 Plan 04: Endpoint Integration Tests Summary

**36 MediatR integration tests covering all 10 API endpoints with happy-path and error-case coverage against real SQL Server**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-17T18:38:01Z
- **Completed:** 2026-03-17T18:50:20Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Created 6 endpoint test files covering all 10 API endpoints (GET/POST article status, unread, read, flag, favorites, approve, dashboard, read stats, admin reports, categories CRUD, target groups, reminder interval)
- All 49 backend tests pass (13 schema + 36 endpoint) with 0 failures against Docker SQL Server
- Fixed concurrent fixture initialization by converting to xUnit collection fixtures
- Deleted default UnitTest1.cs placeholder

## Task Commits

Each task was committed atomically:

1. **Task 1: Article, Favorite, and Approval endpoint tests** - `27da830` (feat)
2. **Task 2: Dashboard, ReadStats, and Admin endpoint tests** - `c04b90d` (feat)

## Files Created/Modified
- `api/tests/WissensHub.Tests/Endpoints/ArticleEndpointTests.cs` - 10 tests for API-01 through API-05 (GetArticleStatus, GetUnreadArticles, MarkAsRead, FlagArticle, GetReadStats)
- `api/tests/WissensHub.Tests/Endpoints/FavoriteEndpointTests.cs` - 5 tests for API-07, API-08 (GetFavorites, ToggleFavorite)
- `api/tests/WissensHub.Tests/Endpoints/ApprovalEndpointTests.cs` - 4 tests for API-06 (ApproveArticle with real DB state transitions)
- `api/tests/WissensHub.Tests/Endpoints/DashboardEndpointTests.cs` - 3 tests for API-09 (GetDashboardStats)
- `api/tests/WissensHub.Tests/Endpoints/ReadStatsEndpointTests.cs` - 3 tests for API-05 detailed (GetDetailedReadStats with real DB queries)
- `api/tests/WissensHub.Tests/Endpoints/AdminEndpointTests.cs` - 11 tests for API-10 (GetAdminReports), categories CRUD, target groups, reminder interval
- `api/tests/WissensHub.Tests/Infrastructure/IntegrationTestCollection.cs` - xUnit collection definition for shared fixture
- `api/tests/WissensHub.Tests/Infrastructure/IntegrationTestBase.cs` - Updated to use collection fixture, added SystemConfigurations cleanup
- `api/tests/WissensHub.Tests/UnitTest1.cs` - Deleted (default template)

## Decisions Made
- Used `[Collection("Integration")]` collection fixture instead of `IClassFixture<IntegrationTestFixture>` to prevent concurrent database creation/deletion conflicts when all test classes run in parallel
- Added SystemConfigurations table to CleanupAsync to support reminder interval test isolation
- Handlers with mock implementations (GetArticleStatus, GetUnreadArticles, MarkAsRead, FlagArticle, ToggleFavorite, GetFavorites, GetDashboardStats, GetReadStats) test MediatR pipeline flow including authorization behaviors and validation
- Handlers with real repository implementations (ApproveArticle, GetDetailedReadStats, GetAdminReports, categories CRUD, target groups, reminder interval) test full DB round-trip with seed data

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added IntegrationTestCollection for shared fixture**
- **Found during:** Task 1 (running all endpoint tests together)
- **Issue:** `IClassFixture<IntegrationTestFixture>` creates separate fixture instances per test class, causing concurrent `EnsureCreatedAsync`/`EnsureDeletedAsync` database conflicts (9 failures when tests run in parallel)
- **Fix:** Created `IntegrationTestCollection.cs` with `[CollectionDefinition("Integration")]` and updated `IntegrationTestBase` to use `[Collection("Integration")]` instead of implementing `IClassFixture`
- **Files modified:** `IntegrationTestBase.cs`, new `IntegrationTestCollection.cs`
- **Verification:** All 49 tests pass together with 0 failures
- **Committed in:** 27da830 (Task 1 commit)

**2. [Rule 2 - Missing Critical] Added SystemConfigurations cleanup**
- **Found during:** Task 1 (preparing for Task 2 reminder interval tests)
- **Issue:** `CleanupAsync()` did not clear `SystemConfigurations` table, which would cause test pollution for reminder interval tests
- **Fix:** Added `db.SystemConfigurations.RemoveRange(db.SystemConfigurations)` to `CleanupAsync()`
- **Files modified:** `IntegrationTestBase.cs`
- **Verification:** Reminder interval tests pass with clean state
- **Committed in:** 27da830 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical)
**Impact on plan:** Both auto-fixes necessary for correct test execution. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - Docker SQL Server must be running (same requirement as Plan 00).

## Next Phase Readiness
- All 10 API endpoints have integration test coverage
- 49 total backend tests provide regression safety net
- Test infrastructure is ready for additional test plans in Phase 11

## Self-Check: PASSED

- All 6 endpoint test files exist in `Endpoints/`
- `UnitTest1.cs` confirmed deleted
- `IntegrationTestCollection.cs` exists
- Commit `27da830` exists (Task 1)
- Commit `c04b90d` exists (Task 2)
- SUMMARY.md created at `.planning/phases/11-testing/11-04-SUMMARY.md`

---
*Phase: 11-testing*
*Completed: 2026-03-17*
