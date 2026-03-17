---
phase: 10-caching-telemetry-ux-polish-i18n
plan: 02
subsystem: ui
tags: [react-hooks, caching, telemetry, stale-while-revalidate, application-insights]

requires:
  - phase: 10-01
    provides: CacheService, TelemetryService, IServiceContainer with cache/telemetry

provides:
  - Stale-while-revalidate caching in all 14 query hooks
  - Telemetry tracking (9 custom events) in all 13 command hooks
  - Cache invalidation on all write operations
  - dashboard_loaded telemetry event on stats fetch

affects: [10-03, 10-04, 10-05, 10-06]

tech-stack:
  added: []
  patterns: [stale-while-revalidate with hasDataRef, telemetry+invalidation on commands]

key-files:
  created:
    - spfx/src/shared/hooks/queries/useDashboardStatsQuery.ts
  modified:
    - spfx/src/shared/hooks/queries/useArticlesQuery.ts
    - spfx/src/shared/hooks/queries/useUnreadCountQuery.ts
    - spfx/src/shared/hooks/queries/useReadStatsQuery.ts
    - spfx/src/shared/hooks/queries/useFavoritesQuery.ts
    - spfx/src/shared/hooks/queries/usePendingApprovalsQuery.ts
    - spfx/src/shared/hooks/queries/useArticleStatusQuery.ts
    - spfx/src/shared/hooks/queries/useFlaggedArticlesQuery.ts
    - spfx/src/shared/hooks/queries/useApprovalHistoryQuery.ts
    - spfx/src/shared/hooks/queries/useCategoriesQuery.ts
    - spfx/src/shared/hooks/queries/useTargetGroupsQuery.ts
    - spfx/src/shared/hooks/queries/useAdminReportsQuery.ts
    - spfx/src/shared/hooks/queries/useReminderConfigQuery.ts
    - spfx/src/shared/hooks/queries/useDetailedReadStatsQuery.ts
    - spfx/src/shared/hooks/commands/useMarkAsReadCommand.ts
    - spfx/src/shared/hooks/commands/useFlagArticleCommand.ts
    - spfx/src/shared/hooks/commands/useToggleFavoriteCommand.ts
    - spfx/src/shared/hooks/commands/useApproveArticleCommand.ts
    - spfx/src/shared/hooks/commands/useRejectArticleCommand.ts
    - spfx/src/shared/hooks/commands/useSubmitForReviewCommand.ts
    - spfx/src/shared/hooks/commands/useArchiveArticleCommand.ts
    - spfx/src/shared/hooks/commands/useRestoreArticleCommand.ts
    - spfx/src/shared/hooks/commands/useSaveCategoryCommand.ts
    - spfx/src/shared/hooks/commands/useDeleteCategoryCommand.ts
    - spfx/src/shared/hooks/commands/useSaveTargetGroupCommand.ts
    - spfx/src/shared/hooks/commands/useDeleteTargetGroupCommand.ts
    - spfx/src/shared/hooks/commands/useUpdateReminderConfigCommand.ts

key-decisions:
  - "hasDataRef pattern to avoid require-atomic-updates lint errors while preserving stale-while-revalidate behavior"
  - "eslint-disable-next-line for require-atomic-updates false positive on React ref mutations after await"
  - "Created separate useDashboardStatsQuery hook (not in existing codebase) for dashboard_loaded telemetry event"
  - "hadData snapshot captured before await to satisfy ESLint require-atomic-updates rule"

patterns-established:
  - "Stale-while-revalidate: lazy initializer reads cache, hasDataRef tracks data presence, hadData snapshot before await, cache.set on success"
  - "Command telemetry: trackEvent on success path, error_api_call on failure path, cache.invalidate for affected prefixes"

requirements-completed: [CACH-03, CACH-04, TELE-03]

duration: 13min
completed: 2026-03-17
---

# Phase 10 Plan 02: Hook Caching and Telemetry Wiring Summary

**Stale-while-revalidate caching on all 14 query hooks with correct TTLs, telemetry tracking (article_read, article_flagged, article_favorited, article_approved, article_rejected, dashboard_loaded, error_api_call) on all 13 command hooks with cache invalidation**

## Performance

- **Duration:** 13 min
- **Started:** 2026-03-17T12:57:27Z
- **Completed:** 2026-03-17T13:10:43Z
- **Tasks:** 2
- **Files modified:** 27

## Accomplishments
- All 14 query hooks show cached data immediately on mount, then silently swap to fresh data
- Created useDashboardStatsQuery with dashboard_loaded telemetry event (1 of 9 required custom events)
- All 13 command hooks track success/failure telemetry events and invalidate relevant cache prefixes
- Build passes with 0 errors, all 121 tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Stale-while-revalidate caching for 14 query hooks** - `a8b584f` (feat)
2. **Task 2: Telemetry + cache invalidation for 13 command hooks** - `fc80baf` (feat)

## Files Created/Modified
- `spfx/src/shared/hooks/queries/useDashboardStatsQuery.ts` - New hook for dashboard stats with dashboard_loaded event
- `spfx/src/shared/hooks/queries/useArticlesQuery.ts` - Stale-while-revalidate with articles:all cache key
- `spfx/src/shared/hooks/queries/useUnreadCountQuery.ts` - Stale-while-revalidate with unread:count cache key
- `spfx/src/shared/hooks/queries/useReadStatsQuery.ts` - Stale-while-revalidate with readstats:pageId cache key
- `spfx/src/shared/hooks/queries/useFavoritesQuery.ts` - Stale-while-revalidate with favorites:all cache key
- `spfx/src/shared/hooks/queries/usePendingApprovalsQuery.ts` - Stale-while-revalidate with pending:all cache key
- `spfx/src/shared/hooks/queries/useArticleStatusQuery.ts` - Stale-while-revalidate with articlestatus:pageId cache key
- `spfx/src/shared/hooks/queries/useFlaggedArticlesQuery.ts` - Stale-while-revalidate with flagged:all cache key
- `spfx/src/shared/hooks/queries/useApprovalHistoryQuery.ts` - Stale-while-revalidate with approvalhistory:pageId cache key
- `spfx/src/shared/hooks/queries/useCategoriesQuery.ts` - Stale-while-revalidate with categories:all cache key
- `spfx/src/shared/hooks/queries/useTargetGroupsQuery.ts` - Stale-while-revalidate with targetgroups:all cache key
- `spfx/src/shared/hooks/queries/useAdminReportsQuery.ts` - Stale-while-revalidate with adminreports:all cache key
- `spfx/src/shared/hooks/queries/useReminderConfigQuery.ts` - Stale-while-revalidate with reminderconfig:all cache key
- `spfx/src/shared/hooks/queries/useDetailedReadStatsQuery.ts` - Stale-while-revalidate with detailedreadstats:pageId cache key
- `spfx/src/shared/hooks/commands/useMarkAsReadCommand.ts` - article_read event + 5 cache invalidations
- `spfx/src/shared/hooks/commands/useFlagArticleCommand.ts` - article_flagged event + 3 cache invalidations
- `spfx/src/shared/hooks/commands/useToggleFavoriteCommand.ts` - article_favorited event + 2 cache invalidations
- `spfx/src/shared/hooks/commands/useApproveArticleCommand.ts` - article_approved event + 4 cache invalidations
- `spfx/src/shared/hooks/commands/useRejectArticleCommand.ts` - article_rejected event + 4 cache invalidations
- `spfx/src/shared/hooks/commands/useSubmitForReviewCommand.ts` - article_submitted event + 3 cache invalidations
- `spfx/src/shared/hooks/commands/useArchiveArticleCommand.ts` - article_archived event + 2 cache invalidations
- `spfx/src/shared/hooks/commands/useRestoreArticleCommand.ts` - article_restored event + 2 cache invalidations
- `spfx/src/shared/hooks/commands/useSaveCategoryCommand.ts` - category_saved event + categories: invalidation
- `spfx/src/shared/hooks/commands/useDeleteCategoryCommand.ts` - category_deleted event + categories: invalidation
- `spfx/src/shared/hooks/commands/useSaveTargetGroupCommand.ts` - targetgroup_saved event + targetgroups: invalidation
- `spfx/src/shared/hooks/commands/useDeleteTargetGroupCommand.ts` - targetgroup_deleted event + targetgroups: invalidation
- `spfx/src/shared/hooks/commands/useUpdateReminderConfigCommand.ts` - reminder_updated event + reminderconfig: invalidation

## Decisions Made
- Used hasDataRef (React.useRef) pattern instead of state.status in useCallback dependency array to prevent infinite re-render loops
- Used hadData snapshot (const captured before await) to satisfy ESLint require-atomic-updates rule
- Added eslint-disable-next-line for require-atomic-updates on React ref mutations (known false positive)
- Created separate useDashboardStatsQuery hook for dashboard_loaded telemetry since no existing hook loaded dashboard stats with that event

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ESLint require-atomic-updates false positive on hasDataRef.current**
- **Found during:** Task 1 (query hook caching)
- **Issue:** ESLint require-atomic-updates rule (severity 2) flagged hasDataRef.current = true after await as race condition
- **Fix:** Captured hadData snapshot before await, used eslint-disable-next-line for the assignment
- **Files modified:** All 14 query hook files
- **Verification:** Build passes with 0 errors
- **Committed in:** a8b584f (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug/lint)
**Impact on plan:** Lint-only fix, no behavioral change. Stale-while-revalidate pattern works as designed.

## Issues Encountered
- Parallel execution environment caused Task 1 and Task 2 commits to be bundled with other plan work (10-04 and 10-05 loc file commits), resulting in combined commit messages. The hook changes are correctly included.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All query hooks ready for UI components to benefit from instant cached loads
- All command hooks tracked in Application Insights for observability
- Cache invalidation ensures fresh data after write operations
- Ready for Plans 03-06 (UX polish, i18n, testing, verification)

---
*Phase: 10-caching-telemetry-ux-polish-i18n*
*Completed: 2026-03-17*
