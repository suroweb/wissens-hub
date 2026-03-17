---
phase: 10-caching-telemetry-ux-polish-i18n
plan: 04
subsystem: ui
tags: [i18n, localization, spfx, react, sharepoint]

requires:
  - phase: 10-caching-telemetry-ux-polish-i18n
    provides: "Shared infrastructure (caching, telemetry, error handling)"
provides:
  - "SharedStrings loc module with common German/English strings registered in config.json"
  - "Dashboard per-web-part loc files (de-de, en-us, mystrings.d.ts) with component-specific strings"
  - "ArticleSidebar per-web-part loc files (de-de, en-us, mystrings.d.ts) with component-specific strings"
  - "All Dashboard components use loc references instead of hardcoded German strings"
  - "All ArticleSidebar components use loc references instead of hardcoded German strings"
  - "ErrorFallback uses SharedStrings references"
  - "formatRelativeDate uses SharedStrings for all date strings"
affects: [10-05, 10-06]

tech-stack:
  added: []
  patterns: ["SharedStrings + per-web-part loc pattern for SPFx i18n", "getStatusLabels/getStatusOptions functions for dynamic loc string access in FilterBar", "{0} placeholder replacement pattern for parameterized loc strings"]

key-files:
  created:
    - "spfx/src/shared/loc/de-de.js"
    - "spfx/src/shared/loc/en-us.js"
    - "spfx/src/shared/loc/mystrings.d.ts"
    - "spfx/src/webparts/dashboard/loc/de-de.js"
    - "spfx/src/webparts/articleSidebar/loc/de-de.js"
  modified:
    - "spfx/config/config.json"
    - "spfx/src/webparts/dashboard/loc/en-us.js"
    - "spfx/src/webparts/dashboard/loc/mystrings.d.ts"
    - "spfx/src/webparts/articleSidebar/loc/en-us.js"
    - "spfx/src/webparts/articleSidebar/loc/mystrings.d.ts"
    - "spfx/src/webparts/dashboard/components/Dashboard.tsx"
    - "spfx/src/webparts/dashboard/components/ArticleCard.tsx"
    - "spfx/src/webparts/dashboard/components/StatsBar.tsx"
    - "spfx/src/webparts/dashboard/components/FilterBar.tsx"
    - "spfx/src/webparts/dashboard/components/EmptyState.tsx"
    - "spfx/src/webparts/dashboard/components/ArticleListView.tsx"
    - "spfx/src/webparts/articleSidebar/components/ArticleSidebar.tsx"
    - "spfx/src/webparts/articleSidebar/components/MetadataSection.tsx"
    - "spfx/src/webparts/articleSidebar/components/ReadStatusSection.tsx"
    - "spfx/src/webparts/articleSidebar/components/FlagDialog.tsx"
    - "spfx/src/webparts/articleSidebar/components/TableOfContents.tsx"
    - "spfx/src/webparts/articleSidebar/components/ApprovalActions.tsx"
    - "spfx/src/webparts/articleSidebar/components/ApprovalHistory.tsx"
    - "spfx/src/shared/components/ErrorFallback.tsx"
    - "spfx/src/shared/utils/formatRelativeDate.ts"

key-decisions:
  - "SharedStrings module for cross-web-part common strings (buttons, statuses, labels, date strings) vs per-web-part only"
  - "getStatusLabels/getStatusOptions functions instead of const for FilterBar status strings (enables dynamic loc resolution)"
  - "dialogContentProps moved inside FlagDialog component body to access loc strings at render time"
  - "{0} placeholder pattern with .replace() for parameterized strings (ReadOn, PreviouslyReadOn, DaysAgo, etc.)"

patterns-established:
  - "SharedStrings import: import * as sharedStrings from 'SharedStrings' for common strings"
  - "Per-web-part import: import * as strings from 'DashboardWebPartStrings' for component-specific strings"
  - "Dual import pattern: both sharedStrings and strings when component uses both shared and specific strings"
  - "Placeholder replacement: strings.Key.replace('{0}', value) for parameterized loc strings"

requirements-completed: [I18N-01, I18N-02, I18N-03]

duration: 14min
completed: 2026-03-17
---

# Phase 10 Plan 04: i18n String Extraction (Dashboard, ArticleSidebar, Shared) Summary

**SharedStrings loc module with 40+ common German/English strings, Dashboard and ArticleSidebar per-web-part loc files, and full string extraction from 15 component files using {0} placeholder pattern**

## Performance

- **Duration:** 14 min
- **Started:** 2026-03-17T12:57:30Z
- **Completed:** 2026-03-17T13:11:57Z
- **Tasks:** 2
- **Files modified:** 25

## Accomplishments
- Created SharedStrings loc module (de-de, en-us, mystrings.d.ts) with 40+ common keys covering buttons, statuses, labels, messages, and relative date strings
- Created Dashboard and ArticleSidebar de-de.js files with component-specific German strings and updated en-us.js/mystrings.d.ts with matching English translations
- Replaced all hardcoded German UI strings in 15 component files with loc references using SharedStrings and per-web-part string imports
- Localized formatRelativeDate.ts to use SharedStrings for all German date phrases (gestern, vor X Tagen, etc.)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared loc module, Dashboard loc, ArticleSidebar loc, and register in config.json** - `a8b584f` (feat)
2. **Task 2: Replace hardcoded strings in Dashboard, ArticleSidebar, ErrorFallback, and formatRelativeDate with loc references** - `57366f0` (feat)

## Files Created/Modified
- `spfx/src/shared/loc/de-de.js` - Shared German strings (buttons, statuses, labels, messages, date strings)
- `spfx/src/shared/loc/en-us.js` - Shared English strings
- `spfx/src/shared/loc/mystrings.d.ts` - TypeScript interface for SharedStrings module
- `spfx/src/webparts/dashboard/loc/de-de.js` - Dashboard-specific German strings (stats, filters, empty states, columns)
- `spfx/src/webparts/dashboard/loc/en-us.js` - Dashboard-specific English strings
- `spfx/src/webparts/dashboard/loc/mystrings.d.ts` - Dashboard string type declarations
- `spfx/src/webparts/articleSidebar/loc/de-de.js` - ArticleSidebar-specific German strings (metadata, read status, approvals)
- `spfx/src/webparts/articleSidebar/loc/en-us.js` - ArticleSidebar-specific English strings
- `spfx/src/webparts/articleSidebar/loc/mystrings.d.ts` - ArticleSidebar string type declarations
- `spfx/config/config.json` - SharedStrings registration in localizedResources
- `spfx/src/webparts/dashboard/components/*.tsx` - 6 Dashboard components updated with loc imports
- `spfx/src/webparts/articleSidebar/components/*.tsx` - 7 ArticleSidebar components updated with loc imports
- `spfx/src/shared/components/ErrorFallback.tsx` - Uses SharedStrings for error message and reload button
- `spfx/src/shared/utils/formatRelativeDate.ts` - Uses SharedStrings for all relative date phrases

## Decisions Made
- SharedStrings module for cross-web-part common strings (buttons, statuses, labels, date strings) instead of duplicating in each web part
- getStatusLabels/getStatusOptions functions instead of const declarations in FilterBar to enable dynamic loc string resolution at render time
- dialogContentProps moved inside FlagDialog component body to access loc strings at render time (was previously a module-level const)
- {0} placeholder pattern with .replace() for parameterized strings (ReadOn, PreviouslyReadOn, DaysAgo, MonthsAgo, etc.)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- SharedStrings module ready for use by Freigabecenter, AdminPanel, and UnreadBadge web parts in plan 10-05
- Per-web-part loc pattern established for remaining web parts to follow
- German is the default locale loaded by SPFx; English available when SharePoint UI language is en-us

---
*Phase: 10-caching-telemetry-ux-polish-i18n*
*Completed: 2026-03-17*
