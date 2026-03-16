---
phase: 05-dashboard-web-part
plan: 01
subsystem: ui
tags: [react, spfx, fluent-ui, dashboard, article-card, list-view, favorites, responsive-grid]

# Dependency graph
requires:
  - phase: 03-shared-infrastructure
    provides: "Service layer (IReadConfirmationService, IPageService, IFavoriteService), hooks (useArticlesQuery, useFavoritesQuery, useToggleFavoriteCommand), WissensHubContext, domain models"
  - phase: 05-dashboard-web-part
    provides: "05-00 scaffolded DashboardWebPart.ts, Dashboard.tsx skeleton, IDashboardProps, test infrastructure"
provides:
  - "ArticleCard component with category badge, favorite star, unread dot, Pflichtartikel badge"
  - "ArticleListView component with Fluent UI DetailsList sortable columns"
  - "EmptyState component with 3 contextual German messages"
  - "getCategoryColor utility with hash-based deterministic color palette"
  - "formatRelativeDate utility with German locale date strings"
  - "Dashboard orchestrator with data loading, view toggle, optimistic favorites, responsive grid"
  - "Container width propagation from DashboardWebPart to Dashboard"
affects: [05-02-filter-search-stats, 05-03-reminder-panel]

# Tech tracking
tech-stack:
  added: []
  patterns: [optimistic-ui, responsive-grid-breakpoints, hash-based-color-assignment, useReadPageIds-hook]

key-files:
  created:
    - spfx/src/webparts/dashboard/components/ArticleCard.tsx
    - spfx/src/webparts/dashboard/components/ArticleListView.tsx
    - spfx/src/webparts/dashboard/components/EmptyState.tsx
    - spfx/src/webparts/dashboard/components/utils/getCategoryColor.ts
    - spfx/src/webparts/dashboard/components/utils/formatRelativeDate.ts
    - spfx/src/webparts/dashboard/components/utils/index.ts
  modified:
    - spfx/src/webparts/dashboard/components/Dashboard.tsx
    - spfx/src/webparts/dashboard/components/IDashboardProps.ts
    - spfx/src/webparts/dashboard/DashboardWebPart.ts
    - spfx/src/webparts/dashboard/components/Dashboard.module.scss

key-decisions:
  - "Manual German date formatting instead of Intl.RelativeTimeFormat due to ES5 target"
  - "onColumnClick parameters optional to match Fluent UI DetailsList callback signature"

patterns-established:
  - "Optimistic UI: toggle local state immediately, revert on server failure"
  - "useReadPageIds: local hook pattern iterating service calls per article ID"
  - "Hash-based color: deterministic category-to-color mapping via char code hash"
  - "Responsive grid: 3/2/1 columns at 800/480px breakpoints"

requirements-completed: [DASH-01, DASH-02, DASH-03, DASH-04, DASH-08, RMND-01]

# Metrics
duration: 5min
completed: 2026-03-16
---

# Phase 05 Plan 01: Article Display Foundation Summary

**Article card grid and list view with responsive layout, unread/mandatory indicators, optimistic favorite toggle, and view mode switching**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-16T15:42:27Z
- **Completed:** 2026-03-16T15:47:52Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- ArticleCard renders category badge with hash-based color, title with 2-line clamp, author/date, unread dot, favorite star, Pflichtartikel badge
- ArticleListView with Fluent UI DetailsList supporting 7 columns with sorting (title, category, author, modified date) and default modified-desc sort
- Dashboard orchestrator loads articles via useArticlesQuery, resolves read status via useReadPageIds, manages optimistic favorites, and switches between card grid and list view
- Responsive 3/2/1 column grid based on container width breakpoints
- EmptyState component with 3 contextual German messages for empty hub, no results, no filter match

## Task Commits

Each task was committed atomically:

1. **Task 1: Create article display sub-components and utilities** - `8c5751b` (feat)
2. **Task 2: Rebuild Dashboard.tsx as orchestrator with data loading and article display** - `d17b5c2` (feat)

## Files Created/Modified
- `spfx/src/webparts/dashboard/components/utils/getCategoryColor.ts` - Deterministic hash-based color assignment for category badges (10-color palette)
- `spfx/src/webparts/dashboard/components/utils/formatRelativeDate.ts` - German locale relative date formatting ("vor 2 Tagen", "gestern")
- `spfx/src/webparts/dashboard/components/utils/index.ts` - Barrel exports for utility functions
- `spfx/src/webparts/dashboard/components/ArticleCard.tsx` - Rich article card with category, title, author, date, unread, favorite, mandatory badge
- `spfx/src/webparts/dashboard/components/ArticleListView.tsx` - Fluent UI DetailsList with 7 sortable columns
- `spfx/src/webparts/dashboard/components/EmptyState.tsx` - Contextual empty state in German with 3 variants
- `spfx/src/webparts/dashboard/components/Dashboard.module.scss` - Expanded with card grid, card, badge, favorite button, empty state, shimmer, list view styles
- `spfx/src/webparts/dashboard/components/IDashboardProps.ts` - Added containerWidth prop
- `spfx/src/webparts/dashboard/DashboardWebPart.ts` - Added onAfterResize and containerWidth propagation
- `spfx/src/webparts/dashboard/components/Dashboard.tsx` - Complete rebuild as orchestrator with data loading, view toggle, favorites, read status

## Decisions Made
- Used manual German date strings instead of Intl.RelativeTimeFormat because SPFx tsconfig targets ES5 and the lib array does not include es2020.intl
- Made onColumnClick parameters optional to match Fluent UI DetailsList's callback type signature where ev and column can be undefined
- Used "ae/oe/ue" style for German characters in source code (matching existing codebase convention from mockData.ts)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Replaced Intl.RelativeTimeFormat with manual German date formatting**
- **Found during:** Task 1 (formatRelativeDate utility)
- **Issue:** TypeScript compilation failed because Intl.RelativeTimeFormat is not available with the project's ES5 target and limited lib array
- **Fix:** Implemented manual German date string formatting with the same output (vor X Tagen, gestern, etc.)
- **Files modified:** spfx/src/webparts/dashboard/components/utils/formatRelativeDate.ts
- **Verification:** Build passes cleanly
- **Committed in:** 8c5751b (Task 1 commit)

**2. [Rule 1 - Bug] Fixed onColumnClick parameter types in ArticleListView**
- **Found during:** Task 1 (ArticleListView component)
- **Issue:** Fluent UI DetailsList's onColumnHeaderClick callback type has optional parameters (ev?, column?) but the handler declared them as required
- **Fix:** Made parameters optional and added early return guard for undefined column
- **Files modified:** spfx/src/webparts/dashboard/components/ArticleListView.tsx
- **Verification:** Build passes cleanly
- **Committed in:** 8c5751b (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both auto-fixes necessary for TypeScript compilation. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Article display foundation complete, ready for Plan 02 (filter bar, search, stats bar)
- Dashboard.tsx has placeholder comment for StatsBar integration point
- EmptyState supports no-filter-match type for Plan 02's filter functionality
- All shared hooks (useArticlesQuery, useFavoritesQuery, useToggleFavoriteCommand) proven working

## Self-Check: PASSED

All 10 created/modified files verified present. Both task commits (8c5751b, d17b5c2) verified in git log.

---
*Phase: 05-dashboard-web-part*
*Completed: 2026-03-16*
