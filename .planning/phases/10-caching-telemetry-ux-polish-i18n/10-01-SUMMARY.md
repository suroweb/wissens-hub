---
phase: 10-caching-telemetry-ux-polish-i18n
plan: 01
subsystem: infra
tags: [caching, telemetry, application-insights, error-boundary, toast, pnpjs, fluent-ui]

# Dependency graph
requires:
  - phase: 09-admin-panel-reporting
    provides: IServiceContainer, WissensHubContext, existing 121 tests, admin services
provides:
  - CacheService with TTL-based in-memory cache and prefix invalidation
  - ITelemetryService interface with AppInsights and Console implementations
  - ErrorBoundary React class component for error catching
  - ErrorFallback recovery UI with Fluent UI MessageBar
  - ToastProvider context with auto-dismiss MessageBar notifications
  - useToast hook for consuming toast context
  - PnPjs session caching with 5-minute TTL
  - IServiceContainer extended with cache and telemetry fields
  - error_sharepoint telemetry event on SP init failures
affects: [10-02, 10-03, 10-04, 10-05]

# Tech tracking
tech-stack:
  added: ["@microsoft/applicationinsights-web@3.3.11", "@microsoft/applicationinsights-react-js@17.3.6", "history@5.3.0"]
  patterns: [ITelemetryService-interface, CacheService-singleton, ErrorBoundary-class-component, ToastProvider-context, createTelemetryService-factory]

key-files:
  created:
    - spfx/src/shared/services/CacheService.ts
    - spfx/src/shared/services/TelemetryService.ts
    - spfx/src/shared/components/ErrorBoundary.tsx
    - spfx/src/shared/components/ErrorFallback.tsx
    - spfx/src/shared/components/ErrorFallback.module.scss
    - spfx/src/shared/components/ToastProvider.tsx
    - spfx/src/shared/components/ToastProvider.module.scss
    - spfx/src/shared/hooks/useToast.ts
  modified:
    - spfx/src/shared/context/ServiceContainer.ts
    - spfx/src/shared/context/pnpSetup.ts
    - spfx/src/shared/context/WissensHubContext.tsx
    - spfx/src/shared/services/index.ts
    - spfx/src/shared/services/__mocks__/index.ts
    - spfx/src/shared/components/index.ts
    - spfx/src/shared/hooks/index.ts
    - spfx/src/shared/index.ts
    - spfx/package.json

key-decisions:
  - "Placeholder cache+telemetry in createProductionServices/createMockServices for type safety, overwritten by WissensHubContext spread"
  - "error_sharepoint tracked in both user/group catch blocks and top-level init catch for comprehensive SP failure tracking"
  - "ToastProvider uses window.setTimeout with ref-based cleanup map for memory leak prevention on unmount"

patterns-established:
  - "ITelemetryService factory pattern: createTelemetryService(connectionString) returns Console or AppInsights impl"
  - "CacheService prefix invalidation: invalidate('articles:') clears all keys starting with 'articles:'"
  - "ErrorBoundary wrapping pattern: class component with telemetry prop for trackException"
  - "ToastContext pattern: provider + useToast hook with auto-dismiss MessageBar"

requirements-completed: [CACH-01, CACH-02, TELE-01, TELE-02, TELE-04, TELE-05, TELE-06]

# Metrics
duration: 5min
completed: 2026-03-17
---

# Phase 10 Plan 01: Shared Infrastructure Summary

**CacheService with TTL + prefix invalidation, ITelemetryService with AppInsights/Console dual impl, ErrorBoundary, ToastProvider, and PnPjs session caching wired into IServiceContainer**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-17T12:48:06Z
- **Completed:** 2026-03-17T12:53:56Z
- **Tasks:** 2
- **Files modified:** 17 (8 created, 9 modified)

## Accomplishments
- CacheService with TTL-based expiry, prefix invalidation, and CACHE_TTLS constants for all data types
- ITelemetryService interface with AppInsightsTelemetryService (cost-safe: disableFetchTracking + disableAjaxTracking) and ConsoleTelemetryService
- ErrorBoundary class component catching React render errors with telemetry tracking via trackException
- ToastProvider with auto-dismiss (5s) MessageBar notifications and memory-leak-safe timer cleanup
- PnPjs Caching behavior applied globally with 5-minute session store TTL
- IServiceContainer extended with cache and telemetry, all factories and mocks updated
- error_sharepoint telemetry event tracked on SharePoint service initialization failures

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CacheService, TelemetryService, ErrorBoundary, ToastProvider, and install npm dependencies** - `0a889c0` (feat)
2. **Task 2: Extend ServiceContainer, WissensHubContext, pnpSetup, and barrel exports** - `7bce4da` (feat)

## Files Created/Modified
- `spfx/src/shared/services/CacheService.ts` - In-memory TTL cache with prefix invalidation and CACHE_TTLS constants
- `spfx/src/shared/services/TelemetryService.ts` - ITelemetryService interface + AppInsights + Console implementations + factory
- `spfx/src/shared/components/ErrorBoundary.tsx` - React class component Error Boundary with telemetry tracking
- `spfx/src/shared/components/ErrorFallback.tsx` - Recovery UI with "Etwas ist schiefgelaufen" message and reload button
- `spfx/src/shared/components/ErrorFallback.module.scss` - Centered error container styles
- `spfx/src/shared/components/ToastProvider.tsx` - Toast context + MessageBar rendering with auto-dismiss
- `spfx/src/shared/components/ToastProvider.module.scss` - Absolute-positioned toast container styles
- `spfx/src/shared/hooks/useToast.ts` - Hook consuming ToastProvider context
- `spfx/src/shared/context/ServiceContainer.ts` - Added cache: CacheService and telemetry: ITelemetryService
- `spfx/src/shared/context/pnpSetup.ts` - Added PnPjs Caching behavior with session store + 5-min TTL
- `spfx/src/shared/context/WissensHubContext.tsx` - Creates cache+telemetry services, tracks error_sharepoint
- `spfx/src/shared/services/index.ts` - Added CacheService/TelemetryService exports + placeholder in factory
- `spfx/src/shared/services/__mocks__/index.ts` - Added cache+telemetry to mock service container
- `spfx/src/shared/components/index.ts` - Added ErrorBoundary, ErrorFallback, ToastProvider exports
- `spfx/src/shared/hooks/index.ts` - Added useToast export
- `spfx/src/shared/index.ts` - Added CacheService, CACHE_TTLS, createTelemetryService to services re-export
- `spfx/package.json` - Added applicationinsights-web, applicationinsights-react-js, history deps

## Decisions Made
- Placeholder cache+telemetry instances in createProductionServices/createMockServices factories ensure type safety; WissensHubContext spreads real instances on top
- error_sharepoint tracked in user fetch catch, group fetch catch, and top-level init catch for comprehensive coverage
- ToastProvider uses window.setTimeout with a ref-based timer map for cleanup on unmount, preventing memory leaks

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added cache+telemetry placeholders to createProductionServices factory**
- **Found during:** Task 2 (ServiceContainer extension)
- **Issue:** IServiceContainer now requires cache+telemetry fields, but createProductionServices return was missing them, causing TypeScript error
- **Fix:** Added placeholder CacheService and ConsoleTelemetryService to the factory return; WissensHubContext overwrites with real instances via spread
- **Files modified:** spfx/src/shared/services/index.ts
- **Verification:** Build passes with 0 errors
- **Committed in:** 7bce4da (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Type safety fix required by TypeScript -- no scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CacheService and ITelemetryService are available in IServiceContainer for all subsequent plans
- ErrorBoundary and ToastProvider ready for web part integration (Plan 05)
- PnPjs session caching active globally for all SharePoint queries
- Query hooks (Plan 02) can now use CacheService for stale-while-revalidate
- Command hooks (Plan 03) can now use ITelemetryService for event tracking and CacheService for invalidation

## Self-Check: PASSED

- All 8 created files verified on disk
- Both task commits (0a889c0, 7bce4da) verified in git log
- Build: 0 errors
- Tests: 121/121 passing

---
*Phase: 10-caching-telemetry-ux-polish-i18n*
*Completed: 2026-03-17*
