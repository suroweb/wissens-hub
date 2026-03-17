---
phase: 9
slug: admin-panel-reporting
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x |
| **Config file** | `spfx/jest.config.js` |
| **Quick run command** | `cd spfx && npx jest --passWithNoTests` |
| **Full suite command** | `cd spfx && npx jest --passWithNoTests` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd spfx && npx jest --passWithNoTests`
- **After every plan wave:** Run `cd spfx && npx jest --passWithNoTests`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | ADMIN-01 | unit | `cd spfx && npx jest --passWithNoTests` | ❌ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | ADMIN-02 | unit | `cd spfx && npx jest --passWithNoTests` | ❌ W0 | ⬜ pending |
| 09-01-03 | 01 | 1 | RMND-02 | unit | `cd spfx && npx jest --passWithNoTests` | ❌ W0 | ⬜ pending |
| 09-02-01 | 02 | 1 | ADMIN-03 | unit | `cd spfx && npx jest --passWithNoTests` | ❌ W0 | ⬜ pending |
| 09-02-02 | 02 | 1 | ADMIN-04 | unit | `cd spfx && npx jest --passWithNoTests` | ❌ W0 | ⬜ pending |
| 09-02-03 | 02 | 1 | ADMIN-05 | unit | `cd spfx && npx jest --passWithNoTests` | ❌ W0 | ⬜ pending |
| 09-02-04 | 02 | 1 | ADMIN-06 | unit | `cd spfx && npx jest --passWithNoTests` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test stubs for admin panel components (category CRUD, target group CRUD)
- [ ] Test stubs for report components (read confirmation, export, overview)
- [ ] Mock service layer for admin API calls

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SharePoint group picker loads real groups | ADMIN-02 | Requires live SP connection | Deploy to tenant, open Zielgruppen tab, verify group dropdown populates |
| CSV/Excel export downloads correct file | ADMIN-04 | Browser download dialog | Click export, verify file opens with correct data and German umlauts |
| Category changes reflect in Dashboard filters | ADMIN-01 | Cross-web-part integration | Add category in Admin, refresh Dashboard, verify new category in filter |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
