---
phase: 5
slug: dashboard-web-part
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (via Heft, @types/heft-jest) |
| **Config file** | Inherited from SPFx Heft build rig (no explicit jest.config) |
| **Quick run command** | `cd spfx && npx heft test --clean` |
| **Full suite command** | `cd spfx && npx heft test --clean --production` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd spfx && npx heft test --clean`
- **After every plan wave:** Run `cd spfx && npx heft test --clean --production`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | DASH-01 | unit | `cd spfx && npx heft test --clean` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | DASH-02, RMND-01 | unit | `cd spfx && npx heft test --clean` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | DASH-03 | unit | `cd spfx && npx heft test --clean` | ❌ W0 | ⬜ pending |
| 05-01-04 | 01 | 1 | DASH-04 | unit | `cd spfx && npx heft test --clean` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 1 | DASH-05 | unit | `cd spfx && npx heft test --clean` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 1 | DASH-06 | unit | `cd spfx && npx heft test --clean` | ❌ W0 | ⬜ pending |
| 05-02-03 | 02 | 1 | DASH-07 | unit | `cd spfx && npx heft test --clean` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 2 | DASH-08 | unit | `cd spfx && npx heft test --clean` | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | 2 | DASH-09 | unit | `cd spfx && npx heft test --clean` | ❌ W0 | ⬜ pending |
| 05-03-03 | 03 | 2 | DASH-10 | unit | `cd spfx && npx heft test --clean` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `spfx/src/webparts/dashboard/components/__tests__/Dashboard.test.tsx` — integration test stubs for DASH-01, DASH-08
- [ ] `spfx/src/webparts/dashboard/components/__tests__/ArticleCard.test.tsx` — card rendering for DASH-01, DASH-02, DASH-03, DASH-04, RMND-01
- [ ] `spfx/src/webparts/dashboard/components/__tests__/StatsBar.test.tsx` — stats bar rendering for DASH-05, DASH-10
- [ ] `spfx/src/webparts/dashboard/components/__tests__/FilterBar.test.tsx` — filter logic for DASH-06, DASH-07
- [ ] Test infrastructure: @types/heft-jest already in devDependencies. May need React test renderer or simple DOM assertions.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Card grid responsive columns (3/2/1) | DASH-01 | Requires visual verification of container-width breakpoints in SharePoint zones | Deploy to tenant, place web part in full/2-3/1-3 column sections, verify column count |
| Search across page body content | DASH-07 | SharePoint Search API unavailable in local workbench | Deploy to tenant, create articles with known body text, verify search finds them |
| Favorite toggle optimistic UI revert | DASH-04 | Requires simulating API failure scenario | Use browser DevTools to block API call, verify star reverts and error toast appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
