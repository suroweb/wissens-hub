---
phase: 10-caching-telemetry-ux-polish-i18n
plan: 05
subsystem: i18n
tags: [spfx, localization, i18n, loc, german, english]

requires:
  - phase: 10-00
    provides: "Test stubs for i18n infrastructure"
  - phase: 10-04
    provides: "Shared loc module and Dashboard/ArticleSidebar loc files"
provides:
  - "Freigabecenter per-web-part loc files (de-de.js, en-us.js, mystrings.d.ts)"
  - "AdminPanel per-web-part loc files (de-de.js, en-us.js, mystrings.d.ts)"
  - "UnreadBadge extension loc files (de-de.js, en-us.js, myStrings.d.ts)"
  - "All Freigabecenter components use loc references"
  - "All UnreadBadge components use loc references"
  - "Dashboard and shared components updated with loc references"
affects: [10-06]

tech-stack:
  added: []
  patterns: ["SPFx localization with per-webpart and shared loc modules", "jest virtual mock for loc modules in tests"]

key-files:
  created:
    - "spfx/src/webparts/freigabecenter/loc/de-de.js"
    - "spfx/src/webparts/adminPanel/loc/de-de.js"
    - "spfx/src/extensions/unreadBadge/loc/de-de.js"
    - "spfx/src/webparts/dashboard/loc/de-de.js"
    - "spfx/src/webparts/articleSidebar/loc/de-de.js"
  modified:
    - "spfx/src/webparts/freigabecenter/loc/en-us.js"
    - "spfx/src/webparts/freigabecenter/loc/mystrings.d.ts"
    - "spfx/src/webparts/adminPanel/loc/en-us.js"
    - "spfx/src/webparts/adminPanel/loc/mystrings.d.ts"
    - "spfx/src/extensions/unreadBadge/loc/en-us.js"
    - "spfx/src/extensions/unreadBadge/loc/myStrings.d.ts"
    - "spfx/src/webparts/freigabecenter/components/Freigabecenter.tsx"
    - "spfx/src/webparts/freigabecenter/components/ApprovalCard.tsx"
    - "spfx/src/webparts/freigabecenter/components/FlaggedCard.tsx"
    - "spfx/src/webparts/freigabecenter/components/StaleCard.tsx"
    - "spfx/src/webparts/freigabecenter/components/ApproveDialog.tsx"
    - "spfx/src/webparts/freigabecenter/components/RejectDialog.tsx"
    - "spfx/src/webparts/adminPanel/components/AdminPanel.tsx"
    - "spfx/src/extensions/unreadBadge/components/UnreadBadgeHeader.tsx"
    - "spfx/src/extensions/unreadBadge/components/UnreadFlyoutPanel.tsx"
    - "spfx/src/shared/loc/de-de.js"
    - "spfx/src/shared/loc/en-us.js"
    - "spfx/src/shared/loc/mystrings.d.ts"

key-decisions:
  - "Used {0} placeholder pattern in loc strings for dynamic values (e.g., FlaggedBy, LastModified, ShowAll)"
  - "jest.mock with { virtual: true } for loc module mocks in UnreadBadge tests"
  - "Added Add/Name/Description/Active/Actions to SharedStrings for cross-component column headers"

patterns-established:
  - "Freigabecenter import pattern: import * as strings from 'FreigabecenterWebPartStrings' + import * as sharedStrings from 'SharedStrings'"
  - "AdminPanel import pattern: import * as strings from 'AdminPanelWebPartStrings' + import * as sharedStrings from 'SharedStrings'"
  - "UnreadBadge import pattern: import * as strings from 'UnreadBadgeApplicationCustomizerStrings' + import * as sharedStrings from 'SharedStrings'"

requirements-completed: [I18N-01, I18N-02]

duration: 27min
completed: 2026-03-17
---

# Phase 10 Plan 05: i18n Extraction Summary

**Per-web-part loc files for Freigabecenter, AdminPanel, UnreadBadge with German/English strings and component-level loc reference replacements**

## Performance

- **Duration:** 27 min
- **Started:** 2026-03-17T12:57:31Z
- **Completed:** 2026-03-17T13:24:31Z
- **Tasks:** 2
- **Files modified:** 45+

## Accomplishments
- Created de-de.js, en-us.js, and mystrings.d.ts for Freigabecenter, AdminPanel, and UnreadBadge loc folders
- Replaced hardcoded German strings in all Freigabecenter components (Freigabecenter, ApprovalCard, FlaggedCard, StaleCard, ApproveDialog, RejectDialog)
- Updated AdminPanel.tsx with loc references for tab headers and title
- Replaced all hardcoded German strings in UnreadBadgeHeader and UnreadFlyoutPanel
- Extended SharedStrings with common terms (Add, Name, Description, Active, Actions, NotAssigned, OpenArticle)
- Added jest virtual mocks for loc modules in UnreadBadge test suites
- Build 0 errors, all 121 tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Create loc files** - `fc80baf` (feat)
2. **Task 2: Replace hardcoded strings** - `a296129` (feat)

## Files Created/Modified
- `spfx/src/webparts/freigabecenter/loc/de-de.js` - German strings for Freigabecenter (tabs, dialogs, cards)
- `spfx/src/webparts/adminPanel/loc/de-de.js` - German strings for AdminPanel (tabs, forms, errors)
- `spfx/src/extensions/unreadBadge/loc/de-de.js` - German strings for UnreadBadge (flyout, badge)
- `spfx/src/webparts/freigabecenter/loc/en-us.js` - English strings for Freigabecenter
- `spfx/src/webparts/adminPanel/loc/en-us.js` - English strings for AdminPanel
- `spfx/src/extensions/unreadBadge/loc/en-us.js` - English strings for UnreadBadge
- `spfx/src/webparts/freigabecenter/loc/mystrings.d.ts` - TypeScript declarations
- `spfx/src/webparts/adminPanel/loc/mystrings.d.ts` - TypeScript declarations
- `spfx/src/extensions/unreadBadge/loc/myStrings.d.ts` - TypeScript declarations (capital S)
- `spfx/src/shared/loc/*.js` and `mystrings.d.ts` - Extended shared strings
- `spfx/src/webparts/freigabecenter/components/*.tsx` - All 6 components updated
- `spfx/src/webparts/adminPanel/components/AdminPanel.tsx` - Updated with loc refs
- `spfx/src/extensions/unreadBadge/components/*.tsx` - Both components updated
- `spfx/src/extensions/unreadBadge/components/__tests__/*.test.tsx` - Added loc mocks

## Decisions Made
- Used `{0}` placeholder pattern for dynamic values in loc strings (e.g., `FlaggedBy: "Gemeldet von: {0} am {1}"`)
- Added `{ virtual: true }` to jest.mock for loc module mocks since they're virtual AMD modules
- Extended SharedStrings with table column header terms (Add, Name, Description, Active, Actions) for cross-component reuse
- Kept UnreadBadge `myStrings.d.ts` with capital S to match existing file naming convention

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created shared loc module (Plan 04 dependency)**
- **Found during:** Task 1
- **Issue:** Plan 10-04 had not created the shared loc module yet, which Plan 10-05 depends on
- **Fix:** Created shared loc files (de-de.js, en-us.js, mystrings.d.ts) and registered SharedStrings in config.json as part of Task 1
- **Files modified:** spfx/src/shared/loc/*, spfx/config/config.json
- **Verification:** Build passes with 0 errors
- **Committed in:** fc80baf

**2. [Rule 3 - Blocking] Added jest virtual mocks for loc modules**
- **Found during:** Task 2 (test failures)
- **Issue:** UnreadBadge tests couldn't resolve newly imported loc modules
- **Fix:** Added jest.mock with { virtual: true } for UnreadBadgeApplicationCustomizerStrings and SharedStrings
- **Files modified:** UnreadBadgeHeader.test.tsx, UnreadFlyoutPanel.test.tsx
- **Verification:** All 121 tests pass
- **Committed in:** a296129

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary for build/test correctness. No scope creep.

## Issues Encountered
- Linter repeatedly reverted changes to UnreadBadge loc files (en-us.js, myStrings.d.ts) -- required multiple re-applications
- Linter auto-applied i18n changes to some Dashboard/ArticleSidebar components as side effects of loc file creation

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All per-web-part loc files complete for all 5 web parts/extensions
- SharedStrings module provides common strings for cross-component use
- Ready for Plan 06 (final verification)

---
*Phase: 10-caching-telemetry-ux-polish-i18n*
*Completed: 2026-03-17*
