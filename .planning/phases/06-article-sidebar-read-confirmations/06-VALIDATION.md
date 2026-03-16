---
phase: 6
slug: article-sidebar-read-confirmations
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 27 (via SPFx Heft) |
| **Config file** | `spfx/node_modules/@microsoft/spfx-web-build-rig/profiles/default/config/jest.config.json` (inherited) |
| **Quick run command** | `cd spfx && npx heft test --clean -- --testPathPattern="articleSidebar" 2>&1 \| tail -30` |
| **Full suite command** | `cd spfx && npx heft test --clean` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd spfx && npx heft test --clean -- --testPathPattern="articleSidebar" 2>&1 | tail -30`
- **After every plan wave:** Run `cd spfx && npx heft test --clean`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | SIDE-01 | unit | `cd spfx && npx heft test --clean -- --testPathPattern="ArticleSidebar"` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | SIDE-07 | unit | `cd spfx && npx heft test --clean -- --testPathPattern="ArticleSidebar"` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 1 | SIDE-08 | unit | `cd spfx && npx heft test --clean -- --testPathPattern="MetadataSection"` | ❌ W0 | ⬜ pending |
| 06-01-04 | 01 | 1 | SIDE-06 | unit | `cd spfx && npx heft test --clean -- --testPathPattern="TableOfContents"` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 1 | SIDE-02 | unit | `cd spfx && npx heft test --clean -- --testPathPattern="ReadStatus"` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 1 | SIDE-03 | unit | `cd spfx && npx heft test --clean -- --testPathPattern="ReadStatus"` | ❌ W0 | ⬜ pending |
| 06-02-03 | 02 | 1 | READ-01 | unit | `cd spfx && npx heft test --clean -- --testPathPattern="ReadStatus"` | ❌ W0 | ⬜ pending |
| 06-02-04 | 02 | 1 | READ-02 | unit | `cd spfx && npx heft test --clean -- --testPathPattern="ReadStatus"` | ❌ W0 | ⬜ pending |
| 06-03-01 | 03 | 1 | SIDE-04 | unit | `cd spfx && npx heft test --clean -- --testPathPattern="FlagDialog"` | ❌ W0 | ⬜ pending |
| 06-03-02 | 03 | 1 | SIDE-05 | unit | `cd spfx && npx heft test --clean -- --testPathPattern="ReadStatus"` | ❌ W0 | ⬜ pending |
| 06-03-03 | 03 | 1 | READ-03 | unit | `cd spfx && npx heft test --clean -- --testPathPattern="ArticleSidebar"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `spfx/src/webparts/articleSidebar/components/__tests__/ArticleSidebar.test.tsx` — stubs for SIDE-01, SIDE-07, READ-03
- [ ] `spfx/src/webparts/articleSidebar/components/__tests__/ReadStatusSection.test.tsx` — stubs for SIDE-02, SIDE-03, SIDE-05, READ-01, READ-02
- [ ] `spfx/src/webparts/articleSidebar/components/__tests__/TableOfContents.test.tsx` — stubs for SIDE-06
- [ ] `spfx/src/webparts/articleSidebar/components/__tests__/FlagDialog.test.tsx` — stubs for SIDE-04

*Existing test files follow stub pattern with `expect(true).toBe(true)` placeholder assertions. Phase 6 tests follow this same convention.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| TOC scroll-to-section in live SharePoint | SIDE-06 | DOM scraping requires real page CanvasZone | Deploy to dev site, verify heading links scroll correctly |
| IntersectionObserver active highlighting | SIDE-06 | Requires real viewport intersection | Scroll through article, verify active TOC item updates |
| Version history link opens correct page | SIDE-07 | Requires SharePoint page context | Click version history link on deployed article, verify correct page opens |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
