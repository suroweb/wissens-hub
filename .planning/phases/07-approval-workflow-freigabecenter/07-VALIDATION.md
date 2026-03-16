---
phase: 7
slug: approval-workflow-freigabecenter
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 27 (SPFx Heft built-in) |
| **Config file** | `spfx/node_modules/@microsoft/spfx-web-build-rig/profiles/default/config/jest.config.json` (framework-managed) |
| **Quick run command** | `cd spfx && npx jest --testPathPattern="freigabecenter\|articleSidebar" --passWithNoTests` |
| **Full suite command** | `cd spfx && npx heft test --clean` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd spfx && npx jest --testPathPattern="freigabecenter\|articleSidebar" --passWithNoTests`
- **After every plan wave:** Run `cd spfx && npx heft test --clean`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | APPR-01 | unit | `cd spfx && npx jest --testPathPattern="statusTransitions" -x` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | APPR-02 | unit | `cd spfx && npx jest --testPathPattern="ApproveDialog\|RejectDialog" -x` | ❌ W0 | ⬜ pending |
| 07-01-03 | 01 | 1 | APPR-03 | unit | `cd spfx && npx jest --testPathPattern="dualStore\|ApprovalActions" -x` | ❌ W0 | ⬜ pending |
| 07-02-01 | 02 | 2 | FREI-01 | unit | `cd spfx && npx jest --testPathPattern="PendingTab\|Freigabecenter" -x` | ❌ W0 | ⬜ pending |
| 07-02-02 | 02 | 2 | FREI-02 | unit | `cd spfx && npx jest --testPathPattern="ApproveDialog" -x` | ❌ W0 | ⬜ pending |
| 07-02-03 | 02 | 2 | FREI-03 | unit | `cd spfx && npx jest --testPathPattern="RejectDialog" -x` | ❌ W0 | ⬜ pending |
| 07-02-04 | 02 | 2 | FREI-04 | unit | `cd spfx && npx jest --testPathPattern="FlaggedTab" -x` | ❌ W0 | ⬜ pending |
| 07-02-05 | 02 | 2 | FREI-05 | unit | `cd spfx && npx jest --testPathPattern="StaleTab" -x` | ❌ W0 | ⬜ pending |
| 07-02-06 | 02 | 2 | FREI-06 | unit | `cd spfx && npx jest --testPathPattern="Freigabecenter" -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `spfx/src/webparts/freigabecenter/components/__tests__/Freigabecenter.test.tsx` — covers FREI-01, FREI-06
- [ ] `spfx/src/webparts/freigabecenter/components/__tests__/PendingTab.test.tsx` — covers FREI-01
- [ ] `spfx/src/webparts/freigabecenter/components/__tests__/ApproveDialog.test.tsx` — covers FREI-02
- [ ] `spfx/src/webparts/freigabecenter/components/__tests__/RejectDialog.test.tsx` — covers FREI-03
- [ ] `spfx/src/webparts/freigabecenter/components/__tests__/FlaggedTab.test.tsx` — covers FREI-04
- [ ] `spfx/src/webparts/freigabecenter/components/__tests__/StaleTab.test.tsx` — covers FREI-05
- [ ] `spfx/src/webparts/articleSidebar/components/__tests__/ApprovalActions.test.tsx` — covers APPR-01, APPR-03
- [ ] `spfx/src/webparts/articleSidebar/components/__tests__/ApprovalHistory.test.tsx` — covers APPR-02

*(All tests need to be created — existing test files cover Phase 5 and 6 components only)*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dual-store SP column update | APPR-03 | PnPjs requires authenticated SharePoint context | 1. Approve an article 2. Check SP list item WH_Status column is updated 3. Verify SQL ArticleMetadata.Status matches |
| Toast notification appears | FREI-02, FREI-03 | Visual feedback requires browser rendering | 1. Approve/reject article 2. Verify success MessageBar appears temporarily |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
