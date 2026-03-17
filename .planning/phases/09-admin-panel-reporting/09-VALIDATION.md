---
phase: 9
slug: admin-panel-reporting
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-17
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 27 via @rushstack/heft-jest-plugin (SPFx Heft) |
| **Config file** | Managed by SPFx Heft plugins (no separate jest.config) |
| **Quick run command** | `cd spfx && npx heft test --clean` |
| **Full suite command** | `cd spfx && npx heft test --clean` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd spfx && npx heft test --clean`
- **After every plan wave:** Run `cd spfx && npx heft test --clean`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-00-01 | 00 | 0 | ALL | stub | `cd spfx && npx heft test --clean` | Yes (Wave 0) | ⬜ pending |
| 09-01-01a | 01 | 1 | ADMIN-01,02,03 | build | `cd api && dotnet build --no-restore` | N/A (backend) | ⬜ pending |
| 09-01-01b | 01 | 1 | ADMIN-01,02,03,04,05,06 | build | `cd api && dotnet build --no-restore` | N/A (backend) | ⬜ pending |
| 09-01-02 | 01 | 1 | ADMIN-01,02,03,04,05,06 | unit | `cd spfx && npx heft test --clean` | Yes (Wave 0) | ⬜ pending |
| 09-02-01 | 02 | 2 | ADMIN-01,02,05 | unit | `cd spfx && npx heft test --clean -- --testPathPattern="(KategorienTab\|ZielgruppenTab\|exportUtils)"` | Yes (Wave 0) | ⬜ pending |
| 09-02-02 | 02 | 2 | ADMIN-03,04,06 | unit | `cd spfx && npx heft test --clean -- --testPathPattern="(AdminPanel\|BerichteTab\|UebersichtTab)"` | Yes (Wave 0) | ⬜ pending |
| 09-03-01 | 03 | 3 | ALL | checkpoint | `cd spfx && npx heft test --clean` | Yes (Wave 0) | ⬜ pending |

*Status: ⬜ pending -- ✅ green -- ❌ red -- ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `spfx/src/webparts/adminPanel/components/__tests__/AdminPanel.test.tsx` -- covers ADMIN-01, ADMIN-02, ADMIN-03 (top-level rendering)
- [x] `spfx/src/webparts/adminPanel/components/__tests__/KategorienTab.test.tsx` -- covers ADMIN-01 CRUD
- [x] `spfx/src/webparts/adminPanel/components/__tests__/ZielgruppenTab.test.tsx` -- covers ADMIN-02
- [x] `spfx/src/webparts/adminPanel/components/__tests__/BerichteTab.test.tsx` -- covers ADMIN-04, ADMIN-05
- [x] `spfx/src/webparts/adminPanel/components/__tests__/UebersichtTab.test.tsx` -- covers ADMIN-06
- [x] `spfx/src/shared/utils/__tests__/exportUtils.test.ts` -- covers ADMIN-05 CSV/Excel generation

*Created by Plan 09-00 (Wave 0).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SharePoint group picker loads real groups | ADMIN-02 | Requires live SP connection | Deploy to tenant, open Zielgruppen tab, verify group dropdown populates |
| CSV/Excel export downloads correct file | ADMIN-04 | Browser download dialog | Click export, verify file opens with correct data and German umlauts |
| Category changes reflect in Dashboard filters | ADMIN-01 | Cross-web-part integration | Add category in Admin, refresh Dashboard, verify new category in filter |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
