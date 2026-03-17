---
phase: 11-testing
plan: 02
subsystem: testing
tags: [jest, testing-library, fluent-ui, react, articleSidebar, pnp-sp-mock]

# Dependency graph
requires:
  - phase: 11-testing
    provides: renderWithContext() test helper, jest.config.json moduleNameMapper for __mocks__
  - phase: 06-article-sidebar
    provides: ArticleSidebar, MetadataSection, ReadStatusSection, TableOfContents, FlagDialog, ApprovalActions, ApprovalHistory components
provides:
  - 7 ArticleSidebar component test files with real assertions covering metadata, read status, TOC, flagging, approval actions, and approval history
affects: [11-testing]

# Tech tracking
tech-stack:
  added: []
  patterns: [pnp-sp-jest-mock, pnpSetup-mock, IntersectionObserver-jsdom-mock, MessageBar-css-class-assertion]

key-files:
  modified:
    - spfx/src/webparts/articleSidebar/components/__tests__/ArticleSidebar.test.tsx
    - spfx/src/webparts/articleSidebar/components/__tests__/MetadataSection.test.tsx
    - spfx/src/webparts/articleSidebar/components/__tests__/ReadStatusSection.test.tsx
    - spfx/src/webparts/articleSidebar/components/__tests__/TableOfContents.test.tsx
    - spfx/src/webparts/articleSidebar/components/__tests__/FlagDialog.test.tsx
    - spfx/src/webparts/articleSidebar/components/__tests__/ApprovalActions.test.tsx
    - spfx/src/webparts/articleSidebar/components/__tests__/ApprovalHistory.test.tsx

key-decisions:
  - "Mock @pnp/sp + pnpSetup at module level to prevent ESM parse errors in Jest CJS mode"
  - "Use CSS class selectors (.ms-MessageBar--error, .ms-MessageBar--warning) for Fluent UI MessageBar assertions instead of getByText (MessageBar renders children in nested spans that may be empty in test env)"
  - "Mock IntersectionObserver on window for jsdom TableOfContents tests"
  - "Use getAllByRole('button') to distinguish TOC list items from CanvasZone heading elements"

patterns-established:
  - "PnP mock pattern: jest.mock @pnp/sp, @pnp/queryable, all sub-modules + jest.mock pnpSetup before imports"
  - "SharedStrings mock required for any component importing from shared/components (ErrorFallback dependency)"
  - "IntersectionObserver polyfill: window.IntersectionObserver mock class in beforeAll for jsdom"

requirements-completed: [TEST-01]

# Metrics
duration: 46min
completed: 2026-03-17
---

# Phase 11 Plan 02: ArticleSidebar Tests Summary

**7 ArticleSidebar component test files with real assertions covering metadata display, read status, table of contents, flagging dialog, approval actions, and approval history**

## Performance

- **Duration:** 46 min
- **Started:** 2026-03-17T18:37:49Z
- **Completed:** 2026-03-17T19:23:56Z
- **Tasks:** 1
- **Files modified:** 7

## Accomplishments
- Replaced all 7 ArticleSidebar stub test files with real assertions (40 total test cases)
- Established PnP mock pattern for components using renderWithContext with WissensHubContext
- All 161 project tests pass (0 failures) including 40 new ArticleSidebar tests

## Task Commits

Each task was committed atomically:

1. **Task 1: ArticleSidebar tests (7 files)** - `07a53e1` (feat)

## Files Created/Modified
- `spfx/src/webparts/articleSidebar/components/__tests__/ArticleSidebar.test.tsx` - Shimmer loading, error state, metadata rendering, version history link, aria-label (5 tests)
- `spfx/src/webparts/articleSidebar/components/__tests__/MetadataSection.test.tsx` - Author, category, status, target groups, date, version, edit button role-gating (9 tests)
- `spfx/src/webparts/articleSidebar/components/__tests__/ReadStatusSection.test.tsx` - Unread/read state, Pflichtartikel badge, version reset, mark-as-read, flag, favorite (11 tests)
- `spfx/src/webparts/articleSidebar/components/__tests__/TableOfContents.test.tsx` - Empty state, heading extraction, clickable items, scroll-to-heading (4 tests)
- `spfx/src/webparts/articleSidebar/components/__tests__/FlagDialog.test.tsx` - Open/closed state, submit disabled, submit/dismiss callbacks (7 tests)
- `spfx/src/webparts/articleSidebar/components/__tests__/ApprovalActions.test.tsx` - Draft submit, Published archive, Archived restore, role-based visibility (7 tests)
- `spfx/src/webparts/articleSidebar/components/__tests__/ApprovalHistory.test.tsx` - Action list, dates, comments, empty state, loading/error states (7 tests)

## Decisions Made
- Mock @pnp/sp and all sub-modules at the package level, PLUS mock pnpSetup at relative path, to prevent ESM-only @pnp/sp from causing Jest CJS parse errors via the WissensHubContext -> pnpSetup -> @pnp/sp import chain
- Use Fluent UI CSS class selectors (.ms-MessageBar--error, .ms-MessageBar--warning, .ms-MessageBar--severeWarning) for MessageBar presence assertions because MessageBar renders string children inside nested spans that appear empty in the jsdom test environment
- Mock IntersectionObserver on `window` (not `global`) for ES5 target compatibility in TableOfContents tests
- Use `getAllByRole('button')` to distinguish TOC list items from CanvasZone heading elements when both share the same text content
- Add SharedStrings mock to ApprovalActions test because the component imports RoleGate from shared/components which transitively imports ErrorFallback which requires SharedStrings

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] ESM @pnp/sp module resolution in Jest CJS mode**
- **Found during:** Task 1 (ArticleSidebar tests)
- **Issue:** renderWithContext imports WissensHubContext which imports pnpSetup which imports @pnp/sp (ESM-only package). Jest in CJS mode cannot parse ESM export syntax.
- **Fix:** Added jest.mock for @pnp/sp, @pnp/queryable, all @pnp/sp/* sub-modules, @microsoft/sp-http, and pnpSetup module before all imports in every test file
- **Files modified:** All 7 test files
- **Verification:** All 161 tests pass with 0 failures
- **Committed in:** 07a53e1

**2. [Rule 3 - Blocking] IntersectionObserver not available in jsdom**
- **Found during:** Task 1 (TableOfContents tests)
- **Issue:** TableOfContents component uses IntersectionObserver for active heading highlighting. jsdom does not implement IntersectionObserver.
- **Fix:** Added IntersectionObserver mock class on window in beforeAll hook
- **Files modified:** TableOfContents.test.tsx
- **Verification:** All 4 TableOfContents tests pass
- **Committed in:** 07a53e1

**3. [Rule 1 - Bug] MessageBar text not accessible via getByText in jsdom**
- **Found during:** Task 1 (ReadStatusSection, ArticleSidebar tests)
- **Issue:** Fluent UI MessageBar renders string children inside nested span elements. In jsdom, the innerText span appears empty, making getByText fail for MessageBar content.
- **Fix:** Changed assertions to use CSS class selectors (.ms-MessageBar--error, .ms-MessageBar--severeWarning, .ms-MessageBar--warning) instead of text content
- **Files modified:** ReadStatusSection.test.tsx, ArticleSidebar.test.tsx
- **Verification:** All affected tests pass
- **Committed in:** 07a53e1

**4. [Rule 3 - Blocking] SharedStrings mock missing for ApprovalActions**
- **Found during:** Task 1 (ApprovalActions tests)
- **Issue:** ApprovalActions imports RoleGate from shared/components, which also exports ErrorFallback, which imports SharedStrings. Without the SharedStrings mock, module resolution fails.
- **Fix:** Added SharedStrings mock with ErrorOccurred and Reload keys to ApprovalActions.test.tsx
- **Files modified:** ApprovalActions.test.tsx
- **Verification:** All 7 ApprovalActions tests pass
- **Committed in:** 07a53e1

---

**Total deviations:** 4 auto-fixed (1 bug, 3 blocking)
**Impact on plan:** All auto-fixes were necessary to make the test infrastructure work with the ESM-only PnP modules and jsdom limitations. No scope creep.

## Issues Encountered
- Fluent UI MessageBar renders children text inside deeply nested spans that appear empty in jsdom. Worked around by asserting on CSS class presence instead of text content.
- Jest's __mocks__ directory convention required moduleNameMapper entries in jest.config.json (configured in Plan 11-01) to resolve WissensHubContext's explicit imports from services/__mocks__/mockData.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ArticleSidebar test coverage complete with 40 assertions across 7 files
- PnP mock pattern established for future test files that use renderWithContext
- Ready for Plan 11-03 (backend integration tests) or remaining frontend test plans

## Self-Check: PASSED

All 7 modified files verified on disk. Commit hash 07a53e1 verified in git log.

---
*Phase: 11-testing*
*Completed: 2026-03-17*
