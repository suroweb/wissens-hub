# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## phase7-workbench-bugs -- Three workbench testing bugs (stale tab empty, flagged reviewer missing, editor submit button hidden)
- **Date:** 2026-03-17
- **Error patterns:** stale tab empty, Veraltet no articles, flagged reviewer not in dropdown, editor submit button missing, Zur Prufung einreichen not visible, modifiedDate too recent, reviewerName missing, workbench pageId default wrong
- **Root cause:** (1) All mock published articles had modifiedDate within 90 days so none qualified as stale. (2) Flagged article had no reviewerName and reviewer dropdown only sourced from pending+published. (3) Workbench default pageId pointed to a Published article instead of a Draft one.
- **Fix:** (1) Set 3 published articles to 120/200/400 days old. (2) Added reviewerName to flagged article and extended dropdown to include flagged article reviewers. (3) Changed workbench fallback pageId from 1 to 5 (Draft).
- **Files changed:** spfx/src/shared/services/__mocks__/mockData.ts, spfx/src/webparts/freigabecenter/components/Freigabecenter.tsx, spfx/src/webparts/articleSidebar/ArticleSidebarWebPart.ts
---

