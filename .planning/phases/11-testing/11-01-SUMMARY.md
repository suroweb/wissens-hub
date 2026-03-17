---
phase: 11-testing
plan: 01
subsystem: testing
tags: [jest, testing-library, heft, renderWithContext, mock-services, fluent-ui, fake-timers]

# Dependency graph
requires:
  - phase: 11-testing
    plan: 00
    provides: renderWithContext() helper, test-utils.tsx, createMockServices()
  - phase: 03-frontend-foundation
    provides: WissensHubContext, IServiceContainer, mock services, ToastProvider
  - phase: 05-dashboard
    provides: Dashboard, ArticleCard, FilterBar, StatsBar components
  - phase: 10-polish
    provides: SharedStrings loc module, ErrorBoundary, ToastProvider, CacheService, TelemetryService
provides:
  - 28 real assertion tests for shared services and components (CacheService, TelemetryService, exportUtils, ErrorBoundary, ToastProvider)
  - 28 real assertion tests for Dashboard web part (Dashboard, ArticleCard, FilterBar, StatsBar)
  - jest.config.json override resolving __mocks__ directory path conflict
  - Verified UnreadBadge extension tests (13 passing: UnreadBadgeHeader 6 + UnreadFlyoutPanel 7)
affects: [11-02-articleSidebar-tests, 11-03-freigabecenter-adminPanel-tests]

# Tech tracking
tech-stack:
  added: []
  patterns: [pnp-mock-block, shared-strings-with-relative-dates, jest-moduleNameMapper-for-mocks-dir]

key-files:
  created:
    - spfx/config/jest.config.json
  modified:
    - spfx/src/shared/services/__tests__/CacheService.test.ts
    - spfx/src/shared/services/__tests__/TelemetryService.test.ts
    - spfx/src/shared/utils/__tests__/exportUtils.test.ts
    - spfx/src/shared/components/__tests__/ErrorBoundary.test.tsx
    - spfx/src/shared/components/__tests__/ToastProvider.test.tsx
    - spfx/src/webparts/dashboard/components/__tests__/Dashboard.test.tsx
    - spfx/src/webparts/dashboard/components/__tests__/ArticleCard.test.tsx
    - spfx/src/webparts/dashboard/components/__tests__/FilterBar.test.tsx
    - spfx/src/webparts/dashboard/components/__tests__/StatsBar.test.tsx

key-decisions:
  - "Added jest.config.json with moduleNameMapper to resolve __mocks__ directory path conflict when importing renderWithContext"
  - "PnP/sp-http mock block required in all test files that use renderWithContext (WissensHubContext imports PnP)"
  - "SharedStrings mock must include all relative date strings (JustNow through InMonths) for ArticleCard formatRelativeDate"
  - "ErrorBoundary children passed via props object (not third createElement arg) per TypeScript strict overload"
  - "Fluent UI Dropdown placeholder text not accessible via getByText; use container.querySelectorAll for dropdown count assertions"
  - "saveAs from file-saver requires double cast (as unknown as jest.Mock) for TypeScript compatibility"

patterns-established:
  - "PnP mock block: 9 jest.mock calls for @pnp/sp, @pnp/queryable, and sub-modules required before any test importing renderWithContext"
  - "SharedStrings comprehensive mock: must include all 19 relative date string keys when testing components using formatRelativeDate"
  - "jest.config.json moduleNameMapper: resolves Jest __mocks__ directory interception for explicit __mocks__ imports in production code"

requirements-completed: [TEST-01]

# Metrics
duration: 44min
completed: 2026-03-17
---

# Phase 11 Plan 01: Shared Services, Components, and Dashboard Tests Summary

**56 real assertion tests replacing all stubs for CacheService, TelemetryService, exportUtils, ErrorBoundary, ToastProvider, Dashboard, ArticleCard, FilterBar, and StatsBar with jest.config.json override for __mocks__ path resolution**

## Performance

- **Duration:** 44 min
- **Started:** 2026-03-17T18:37:53Z
- **Completed:** 2026-03-17T19:22:04Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Replaced all 5 shared service/component test stubs with 28 real assertion tests (CacheService 7, TelemetryService 5, exportUtils 6, ErrorBoundary 4, ToastProvider 6)
- Replaced all 4 Dashboard web part test stubs with 28 real assertion tests (Dashboard 5, ArticleCard 8, FilterBar 8, StatsBar 7)
- Verified UnreadFlyoutPanel (7 tests) and UnreadBadgeHeader (6 tests) already pass with real assertions
- Created jest.config.json override to resolve Jest __mocks__ directory path conflict when using renderWithContext
- Total: 157 passing tests across all test suites (up from 121)

## Task Commits

Each task was committed atomically:

1. **Task 1: Shared services and components tests (5 files)** - `083e5bc` (test)
2. **Task 2: Dashboard web part tests + UnreadBadge verification (5 files)** - `0e5893c` (test)

## Files Created/Modified
- `spfx/config/jest.config.json` - Jest config override with moduleNameMapper for __mocks__ resolution
- `spfx/src/shared/services/__tests__/CacheService.test.ts` - 7 tests: get/set/TTL/invalidate/clear/defaults/CACHE_TTLS
- `spfx/src/shared/services/__tests__/TelemetryService.test.ts` - 5 tests: trackEvent/trackException/trackPageView/no-props/factory
- `spfx/src/shared/utils/__tests__/exportUtils.test.ts` - 6 tests: CSV with BOM/escaping/empty/German headers, Excel export/empty
- `spfx/src/shared/components/__tests__/ErrorBoundary.test.tsx` - 4 tests: children/fallback/trackException/componentStack
- `spfx/src/shared/components/__tests__/ToastProvider.test.tsx` - 6 tests: children/show/error/auto-dismiss/onDismiss/container
- `spfx/src/webparts/dashboard/components/__tests__/Dashboard.test.tsx` - 5 tests: render/shimmer/cards/error/empty
- `spfx/src/webparts/dashboard/components/__tests__/ArticleCard.test.tsx` - 8 tests: title/category/author/mandatory/no-mandatory/unread/read/click
- `spfx/src/webparts/dashboard/components/__tests__/FilterBar.test.tsx` - 8 tests: search/3 dropdowns/card toggle/list toggle/search change/new article
- `spfx/src/webparts/dashboard/components/__tests__/StatsBar.test.tsx` - 7 tests: unread/favorites/pending/reader gate/aria-pressed/active/click

## Decisions Made
- Added `spfx/config/jest.config.json` with `moduleNameMapper` to resolve Jest's `__mocks__` directory path interception when `WissensHubContext.tsx` explicitly imports from `services/__mocks__/mockData`
- All Dashboard test files require a PnP mock block (9 `jest.mock` calls) because `renderWithContext` -> `test-utils` -> `WissensHubContext` imports `@pnp/sp` and related packages
- SharedStrings mock must include all 19 relative date string keys when testing components that use `formatRelativeDate` (ArticleCard, Dashboard)
- ErrorBoundary children passed via props object instead of third `createElement` arg per project convention for TypeScript strict overload matching
- Fluent UI Dropdown placeholder text is not directly accessible via `getByText`; used container query for dropdown count assertions instead
- `saveAs` from file-saver requires `as unknown as jest.Mock` double cast for TypeScript compatibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added jest.config.json moduleNameMapper for __mocks__ path resolution**
- **Found during:** Task 2 (Dashboard web part tests)
- **Issue:** Jest's automatic mocking system intercepts module resolution for paths containing `__mocks__` directories. `WissensHubContext.tsx` explicitly imports from `../services/__mocks__/mockData` and `../services/__mocks__/index`, causing "Cannot find module" errors when `renderWithContext` is used in test files.
- **Fix:** Created `spfx/config/jest.config.json` extending the rig config with `moduleNameMapper` entries that resolve `__mocks__` paths to their `.js` files in `lib-commonjs`
- **Files modified:** spfx/config/jest.config.json (new)
- **Verification:** All test suites that use renderWithContext now resolve correctly
- **Committed in:** 0e5893c (Task 2 commit)

**2. [Rule 3 - Blocking] Added PnP mock block to Dashboard test files**
- **Found during:** Task 2 (Dashboard web part tests)
- **Issue:** `renderWithContext` imports chain through `WissensHubContext` which imports `@pnp/sp`, `@pnp/queryable`, and related packages. These are ESM modules that Jest cannot parse without transformation.
- **Fix:** Added 9 `jest.mock()` calls for PnP/sp-http packages at top of each Dashboard test file (same pattern as existing ArticleSidebar tests)
- **Files modified:** Dashboard.test.tsx, ArticleCard.test.tsx, FilterBar.test.tsx, StatsBar.test.tsx
- **Verification:** All 4 Dashboard test suites pass
- **Committed in:** 0e5893c (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes were necessary to use renderWithContext in Dashboard tests. The PnP mock block will be needed in all future test files that use renderWithContext. No scope creep.

## Issues Encountered
- Pre-existing uncommitted articleSidebar test files (from a previous plan execution) have 4 failing tests in ReadStatusSection and TableOfContents. Logged to deferred-items.md as out of scope.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All shared service and Dashboard web part tests complete with real assertions
- renderWithContext pattern proven: requires PnP mock block + comprehensive SharedStrings mock
- jest.config.json override established for __mocks__ path resolution
- Ready for Plan 11-02 (ArticleSidebar tests) and Plan 11-03 (Freigabecenter/AdminPanel tests)

## Self-Check: PASSED

All 10 modified/created files verified on disk. Both commit hashes (083e5bc, 0e5893c) verified in git log.

---
*Phase: 11-testing*
*Completed: 2026-03-17*
