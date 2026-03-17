---
status: fixing
trigger: "Debug three remaining issues from Phase 7 workbench testing"
created: 2026-03-17T00:00:00Z
updated: 2026-03-17T00:00:00Z
---

## Current Focus

hypothesis: Three bugs confirmed through code analysis — all root causes identified
test: Apply minimal fixes to mockData.ts and Freigabecenter.tsx reviewer dropdown
expecting: Build passes, tests pass, all three workbench scenarios work
next_action: Apply all three fixes

## Symptoms

expected: (1) Stale tab shows articles older than 90 days. (2) Flagged article's reviewer appears in filter dropdown. (3) Editor role sees "Zur Prufung einreichen" button for Draft articles.
actual: (1) Stale tab empty. (2) Selecting any individual reviewer shows 0 flagged articles. (3) No submit button visible as editor.
errors: No runtime errors — logic/data issues
reproduction: Open each web part in SPFx workbench
started: Phase 7 workbench testing

## Eliminated

(none — all three hypotheses confirmed on first analysis)

## Evidence

- timestamp: 2026-03-17T00:01:00Z
  checked: MOCK_ARTICLES modifiedDate values
  found: All published articles have dates within the last 90 days (Jan-Mar 2026). Today is March 17, 2026. The oldest published article (id:1) is from Jan 15 — only ~61 days ago. None exceed the 90-day STALE_THRESHOLD_DAYS.
  implication: Bug 1 confirmed — need stale mock data.

- timestamp: 2026-03-17T00:02:00Z
  checked: MOCK_FLAGS references pageId 9 (Homeoffice-Regelung). That article has NO reviewerName field. The reviewer dropdown is built from pendingArticles + publishedArticles reviewerName values. Only 3 reviewers exist: Klaus Weber, Anna Schmidt, Thomas Mueller — none associated with article 9.
  found: Filtering by any individual reviewer correctly excludes article 9 because it has no reviewer. The "Alle Prufer" filter works because it bypasses reviewer matching.
  implication: Bug 2 confirmed — article 9 needs a reviewerName, AND the dropdown should also consider flagged articles' reviewers.

- timestamp: 2026-03-17T00:03:00Z
  checked: ArticleSidebarWebPart.ts line 34: `const pageId = this.context.pageContext.listItem?.id ?? 1`. In workbench, listItem is undefined, so pageId=1. Article 1 (Passwort-Richtlinie) has status='Published'. The ApprovalActions component only shows "Zur Prufung einreichen" when articleStatus==='Draft'.
  found: Default pageId 1 is Published, not Draft. The button requires Draft status. With mockRole='editor' the RoleGate passes, but the status check fails.
  implication: Bug 3 confirmed — need the workbench default pageId to point to a Draft article.

## Resolution

root_cause: |
  Bug 1: All mock published articles have modifiedDate within 90 days of current date. The stale filter requires >90 days.
  Bug 2: The flagged article (pageId 9, Homeoffice-Regelung) has no reviewerName. The reviewer dropdown only sources names from pending+published articles, not flagged article joins.
  Bug 3: In workbench mode, pageId defaults to 1 (a Published article). The "Zur Prufung einreichen" button requires Draft status.
fix: |
  Bug 1: Add reviewerName to existing published articles that lack them (ids 4, 9), and make 2-3 published articles have old modifiedDate values (120, 200, 400 days ago).
  Bug 2: Add reviewerName to article 9, and update Freigabecenter.tsx reviewer dropdown to also include reviewer names from flagged articles' joined article data.
  Bug 3: Change the workbench fallback pageId in ArticleSidebarWebPart.ts from 1 to 5 (Reisekostenabrechnung, a Draft article).
verification: Build + test pass
files_changed:
  - spfx/src/shared/services/__mocks__/mockData.ts
  - spfx/src/webparts/freigabecenter/components/Freigabecenter.tsx
  - spfx/src/webparts/articleSidebar/ArticleSidebarWebPart.ts
