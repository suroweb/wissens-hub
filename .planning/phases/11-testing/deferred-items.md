# Phase 11: Deferred Items

## Pre-existing Test Failures (Out of Scope)

**Discovered during:** Plan 11-01, Task 2
**Files affected:**
- `spfx/src/webparts/articleSidebar/components/__tests__/ReadStatusSection.test.tsx` (1 failing test)
- `spfx/src/webparts/articleSidebar/components/__tests__/TableOfContents.test.tsx` (3 failing tests)

**Root cause:** These files contain uncommitted changes from a previous plan execution (likely Plan 11-02 or 11-03). The tests have real assertions but some assertions reference DOM elements or props that don't match the component's current behavior. These files also have 7 siblings (ApprovalActions, ApprovalHistory, ArticleSidebar, FlagDialog, MetadataSection) with uncommitted changes that now successfully pass after the jest.config.json moduleNameMapper fix.

**Resolution:** Should be addressed in the plan that originally wrote these test files.
