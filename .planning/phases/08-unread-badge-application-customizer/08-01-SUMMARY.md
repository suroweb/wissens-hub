---
phase: 08-unread-badge-application-customizer
plan: 01
subsystem: ui
tags: [spfx, application-customizer, react, fluent-ui, panel, notification-badge, custom-event]

# Dependency graph
requires:
  - phase: 01-spfx-scaffold
    provides: Application Customizer shell, extension manifest, serve.json configuration
  - phase: 03-frontend-architecture-service-layer
    provides: Domain models (IArticlePage), service interfaces, mock data
  - phase: 05-dashboard-web-part
    provides: getCategoryColor utility, formatRelativeDate utility, ArticleCard patterns
  - phase: 06-article-sidebar-read-confirmations
    provides: ReadStatusSection mark-as-read flow (CustomEvent dispatch target)
provides:
  - Unread Badge Application Customizer with React placeholder rendering
  - Bell icon with red badge overlay showing unread count (capped at 99+)
  - Flyout panel with unread article summaries, mandatory sort, category badges
  - Shared utils (getCategoryColor, formatRelativeDate) in shared/utils for cross-component reuse
  - IUnreadArticle frontend model
  - CustomEvent dispatch in Article Sidebar for cross-component unread count updates
  - CustomEvent listener in header component for real-time badge decrement
affects: [08-02-PLAN, admin-panel]

# Tech tracking
tech-stack:
  added: []
  patterns: [application-customizer-react-placeholder, cross-component-custom-event, shared-utils-re-export]

key-files:
  created:
    - spfx/src/shared/utils/getCategoryColor.ts
    - spfx/src/shared/utils/formatRelativeDate.ts
    - spfx/src/shared/utils/index.ts
    - spfx/src/extensions/unreadBadge/models/IUnreadArticle.ts
    - spfx/src/extensions/unreadBadge/components/UnreadBadgeHeader.tsx
    - spfx/src/extensions/unreadBadge/components/UnreadBadgeHeader.module.scss
    - spfx/src/extensions/unreadBadge/components/UnreadFlyoutPanel.tsx
    - spfx/src/extensions/unreadBadge/components/UnreadFlyoutPanel.module.scss
    - spfx/src/extensions/unreadBadge/components/__tests__/UnreadBadgeHeader.test.tsx
    - spfx/src/extensions/unreadBadge/components/__tests__/UnreadFlyoutPanel.test.tsx
  modified:
    - spfx/src/webparts/dashboard/components/utils/getCategoryColor.ts
    - spfx/src/webparts/dashboard/components/utils/formatRelativeDate.ts
    - spfx/src/extensions/unreadBadge/UnreadBadgeApplicationCustomizer.ts
    - spfx/src/webparts/articleSidebar/components/ReadStatusSection.tsx

key-decisions:
  - "jest.mock calls placed before imports to satisfy @rushstack/hoist-jest-mock lint rule"
  - "Dashboard utils converted to re-exports from shared/utils for backward compatibility"
  - "Mock data fallback via try/catch around AadHttpClient (workbench has no AAD context)"

patterns-established:
  - "Application Customizer React rendering: tryCreateContent(PlaceholderName.Top) + ReactDOM.render"
  - "Cross-component CustomEvent: dispatch in web part, listen in application customizer"
  - "Shared utils in shared/utils/ with re-export wrappers in original locations"

requirements-completed: [BADGE-01, BADGE-02, BADGE-03]

# Metrics
duration: 6min
completed: 2026-03-17
---

# Phase 8 Plan 01: Unread Badge Application Customizer Summary

**Bell icon notification badge with flyout panel in SPFx header placeholder, using shared utils, CustomEvent cross-component wiring, and 13 unit tests**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-17T08:50:23Z
- **Completed:** 2026-03-17T08:57:10Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- Extracted getCategoryColor and formatRelativeDate to shared/utils with backward-compatible re-exports in dashboard
- Built UnreadBadgeHeader with Ringer bell icon, red badge overlay (99+ cap), CustomEvent listener for real-time count decrement
- Built UnreadFlyoutPanel with Fluent UI Panel, mandatory-first sorting, category badges, relative dates, empty state, "Alle N anzeigen" link
- Rewrote UnreadBadgeApplicationCustomizer with PlaceholderName.Top rendering, AadHttpClient with mock fallback, React mount/unmount lifecycle
- Added CustomEvent dispatch to ReadStatusSection for cross-component unread count updates
- Created 13 passing unit tests covering all BADGE requirements

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract shared utilities and create IUnreadArticle model** - `6b6cee7` (feat)
2. **Task 2: Implement Application Customizer, React components, styles, and tests** - `bff906e` (feat)

## Files Created/Modified
- `spfx/src/shared/utils/getCategoryColor.ts` - Shared category color utility (moved from dashboard)
- `spfx/src/shared/utils/formatRelativeDate.ts` - Shared relative date formatting utility (moved from dashboard)
- `spfx/src/shared/utils/index.ts` - Barrel export for shared utils
- `spfx/src/webparts/dashboard/components/utils/getCategoryColor.ts` - Re-export wrapper for backward compatibility
- `spfx/src/webparts/dashboard/components/utils/formatRelativeDate.ts` - Re-export wrapper for backward compatibility
- `spfx/src/extensions/unreadBadge/models/IUnreadArticle.ts` - Frontend model for unread article items
- `spfx/src/extensions/unreadBadge/UnreadBadgeApplicationCustomizer.ts` - Extension entry point with placeholder rendering, React lifecycle, mock data fallback
- `spfx/src/extensions/unreadBadge/components/UnreadBadgeHeader.tsx` - Bell icon with badge overlay, panel toggle, CustomEvent listener
- `spfx/src/extensions/unreadBadge/components/UnreadBadgeHeader.module.scss` - Header badge styles
- `spfx/src/extensions/unreadBadge/components/UnreadFlyoutPanel.tsx` - Panel with article list, empty state, mandatory sort
- `spfx/src/extensions/unreadBadge/components/UnreadFlyoutPanel.module.scss` - Flyout panel styles
- `spfx/src/webparts/articleSidebar/components/ReadStatusSection.tsx` - Added CustomEvent dispatch on mark-as-read
- `spfx/src/extensions/unreadBadge/components/__tests__/UnreadBadgeHeader.test.tsx` - 6 tests for header badge
- `spfx/src/extensions/unreadBadge/components/__tests__/UnreadFlyoutPanel.test.tsx` - 7 tests for flyout panel

## Decisions Made
- jest.mock calls placed before imports to satisfy @rushstack/hoist-jest-mock lint rule
- Dashboard utils converted to re-exports from shared/utils for backward compatibility (no import path changes needed in ArticleCard or ArticleListView)
- Mock data fallback via try/catch around AadHttpClient (workbench has no AAD context)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Application Customizer fully functional with mock data in workbench
- Plan 02 (verification) can proceed to validate all requirements via build, tests, and workbench inspection
- All 95 tests pass (82 existing + 13 new)
- Build succeeds with 0 errors, 0 warnings

## Self-Check: PASSED

All 12 created/modified files verified on disk. Both task commits (6b6cee7, bff906e) confirmed in git log.

---
*Phase: 08-unread-badge-application-customizer*
*Completed: 2026-03-17*
