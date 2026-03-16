---
phase: 07-approval-workflow-freigabecenter
plan: 02
subsystem: ui
tags: [spfx, react, fluent-ui, pivot, dialog, role-gate, approval-workflow]

# Dependency graph
requires:
  - phase: 07-approval-workflow-freigabecenter
    provides: Extended IApprovalService (7 methods), IFlagService (2 methods), 5 new hooks, VALID_TRANSITIONS
  - phase: 06-article-sidebar-read-confirmations
    provides: ArticleSidebar container, FlagDialog pattern, ReadStatusSection
  - phase: 05-dashboard-webpart
    provides: ArticleCard pattern, getCategoryColor, formatRelativeDate utils
provides:
  - Freigabecenter web part with 3-tab Pivot (Ausstehend/Gemeldet/Veraltet)
  - ApprovalCard, FlaggedCard, StaleCard card components
  - ApproveDialog (optional comment) and RejectDialog (required comment) dialogs
  - Reviewer filter dropdown filtering all three tabs
  - Optimistic card removal on approve/reject with failure rollback
  - Article Sidebar ApprovalActions (submit/archive/restore) with RoleGate
  - Article Sidebar ApprovalHistory with chronological German-labeled history
  - 8 test stub files for Wave 0 validation
affects: [07-03-verification]

# Tech tracking
tech-stack:
  added: []
  patterns: [Pivot-based tabbed layout with badge counts, optimistic removal with rollback, RoleGate-wrapped action buttons]

key-files:
  created:
    - spfx/src/webparts/freigabecenter/components/PendingTab.tsx
    - spfx/src/webparts/freigabecenter/components/FlaggedTab.tsx
    - spfx/src/webparts/freigabecenter/components/StaleTab.tsx
    - spfx/src/webparts/freigabecenter/components/ApprovalCard.tsx
    - spfx/src/webparts/freigabecenter/components/FlaggedCard.tsx
    - spfx/src/webparts/freigabecenter/components/StaleCard.tsx
    - spfx/src/webparts/freigabecenter/components/ApproveDialog.tsx
    - spfx/src/webparts/freigabecenter/components/RejectDialog.tsx
    - spfx/src/webparts/articleSidebar/components/ApprovalActions.tsx
    - spfx/src/webparts/articleSidebar/components/ApprovalHistory.tsx
    - spfx/src/webparts/freigabecenter/components/__tests__/Freigabecenter.test.tsx
    - spfx/src/webparts/freigabecenter/components/__tests__/PendingTab.test.tsx
    - spfx/src/webparts/freigabecenter/components/__tests__/ApproveDialog.test.tsx
    - spfx/src/webparts/freigabecenter/components/__tests__/RejectDialog.test.tsx
    - spfx/src/webparts/freigabecenter/components/__tests__/FlaggedTab.test.tsx
    - spfx/src/webparts/freigabecenter/components/__tests__/StaleTab.test.tsx
    - spfx/src/webparts/articleSidebar/components/__tests__/ApprovalActions.test.tsx
    - spfx/src/webparts/articleSidebar/components/__tests__/ApprovalHistory.test.tsx
  modified:
    - spfx/src/webparts/freigabecenter/components/Freigabecenter.tsx
    - spfx/src/webparts/freigabecenter/components/Freigabecenter.module.scss
    - spfx/src/webparts/articleSidebar/components/ArticleSidebar.tsx
    - spfx/src/webparts/articleSidebar/components/ArticleSidebar.module.scss

key-decisions:
  - "Optimistic removal pattern for approve/reject: remove card from list immediately, rollback on API failure"
  - "Combined pendingArticles + publishedArticles for flagged tab join to ensure flag-to-article lookup works across statuses"

patterns-established:
  - "Pivot tabs with dynamic badge counts: headerText={'Label (' + count + ')'}"
  - "Optimistic removal: track removed IDs in state array, filter visible list, revert on failure"
  - "RoleGate-wrapped action buttons: conditionally render based on articleStatus + user role"

requirements-completed: [FREI-01, FREI-02, FREI-03, FREI-04, FREI-05, FREI-06, APPR-01, APPR-03]

# Metrics
duration: 7min
completed: 2026-03-16
---

# Phase 7 Plan 02: Freigabecenter Web Part UI Summary

**Tabbed Freigabecenter with Pivot (Ausstehend/Gemeldet/Veraltet), approval/reject dialogs, age-colored stale cards, reviewer filter, and Article Sidebar extensions for submit/archive/restore actions with approval history**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-16T20:21:05Z
- **Completed:** 2026-03-16T20:28:00Z
- **Tasks:** 2
- **Files modified:** 22

## Accomplishments
- Freigabecenter container with 3 Pivot tabs (Ausstehend/Gemeldet/Veraltet) showing dynamic badge counts, reviewer filter dropdown, and shimmer/error states
- ApprovalCard with category badge, author, reviewer info, and inline approve/reject buttons; FlaggedCard with warning icon and reason display; StaleCard with age-colored borders (yellow/orange/red)
- ApproveDialog (optional comment) and RejectDialog (required comment) following FlagDialog pattern with reset on target change
- Article Sidebar extended with RoleGate-wrapped ApprovalActions (submit for review, archive, restore) and chronological ApprovalHistory with German action labels
- 8 test stub files created (6 Freigabecenter + 2 Sidebar), full test suite passes at 82 tests

## Task Commits

Each task was committed atomically:

1. **Task 1: Freigabecenter core -- Pivot tabs with cards, dialogs, reviewer filter, SCSS** - `03724b0` (feat)
2. **Task 2: Article Sidebar extensions -- approval actions, history, 8 test stubs** - `56778d4` (feat)

## Files Created/Modified
- `spfx/src/webparts/freigabecenter/components/Freigabecenter.tsx` - Main container with Pivot tabs, reviewer filter, optimistic approve/reject
- `spfx/src/webparts/freigabecenter/components/Freigabecenter.module.scss` - Card, badge, filter, empty state, and shimmer styles
- `spfx/src/webparts/freigabecenter/components/PendingTab.tsx` - Pending approvals tab with ApprovalCard rendering
- `spfx/src/webparts/freigabecenter/components/FlaggedTab.tsx` - Flagged articles tab with article-flag join
- `spfx/src/webparts/freigabecenter/components/StaleTab.tsx` - Stale content tab with age calculation
- `spfx/src/webparts/freigabecenter/components/ApprovalCard.tsx` - Card with category badge, meta, action buttons
- `spfx/src/webparts/freigabecenter/components/FlaggedCard.tsx` - Card with warning icon, flag reason, article link
- `spfx/src/webparts/freigabecenter/components/StaleCard.tsx` - Card with age-colored border and modification date
- `spfx/src/webparts/freigabecenter/components/ApproveDialog.tsx` - Approval dialog with optional comment
- `spfx/src/webparts/freigabecenter/components/RejectDialog.tsx` - Rejection dialog with required comment
- `spfx/src/webparts/articleSidebar/components/ApprovalActions.tsx` - Submit/archive/restore buttons with RoleGate
- `spfx/src/webparts/articleSidebar/components/ApprovalHistory.tsx` - Chronological approval history display
- `spfx/src/webparts/articleSidebar/components/ArticleSidebar.tsx` - Integrated ApprovalActions and ApprovalHistory
- `spfx/src/webparts/articleSidebar/components/ArticleSidebar.module.scss` - History item, comment, date styles

## Decisions Made
- **Optimistic removal pattern**: Approve/reject immediately removes card from visible list using a tracked removal array. On API failure, the ID is removed from the array and data is refetched, restoring the card.
- **Combined article pool for flagged join**: Merged pending (InReview) and published articles into a single array for the flagged tab's pageId-to-article lookup, since flags can exist on articles of any status.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Freigabecenter web part fully functional with all three tabs, dialogs, and reviewer filter
- Article Sidebar shows role-appropriate approval action buttons and full history
- 82 tests passing (56 existing + 26 new stubs)
- Ready for Plan 03 verification with end-to-end workbench testing

## Self-Check: PASSED

All 18 created files verified present. Both task commits (03724b0, 56778d4) verified in git log.

---
*Phase: 07-approval-workflow-freigabecenter*
*Completed: 2026-03-16*
