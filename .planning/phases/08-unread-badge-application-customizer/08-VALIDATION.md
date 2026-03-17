---
phase: 8
slug: unread-badge-application-customizer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 27 (via SPFx Heft) |
| **Config file** | Inherited from @microsoft/spfx-web-build-rig |
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
| 08-01-01 | 01 | 1 | BADGE-01 | unit | `cd spfx && npx heft test --clean` (bell icon renders with count) | ❌ W0 | ⬜ pending |
| 08-01-02 | 01 | 1 | BADGE-01 | unit | `cd spfx && npx heft test --clean` (badge hidden when count is 0) | ❌ W0 | ⬜ pending |
| 08-01-03 | 01 | 1 | BADGE-01 | unit | `cd spfx && npx heft test --clean` (count capped at 99+) | ❌ W0 | ⬜ pending |
| 08-01-04 | 01 | 1 | BADGE-02 | unit | `cd spfx && npx heft test --clean` (panel opens on bell click) | ❌ W0 | ⬜ pending |
| 08-01-05 | 01 | 1 | BADGE-02 | unit | `cd spfx && npx heft test --clean` (panel shows unread article list) | ❌ W0 | ⬜ pending |
| 08-01-06 | 01 | 1 | BADGE-02 | unit | `cd spfx && npx heft test --clean` (mandatory articles sorted to top) | ❌ W0 | ⬜ pending |
| 08-01-07 | 01 | 1 | BADGE-02 | unit | `cd spfx && npx heft test --clean` (empty state when no unread) | ❌ W0 | ⬜ pending |
| 08-01-08 | 01 | 1 | BADGE-03 | unit | `cd spfx && npx heft test --clean` (click article navigates to URL) | ❌ W0 | ⬜ pending |
| 08-01-09 | 01 | 1 | BADGE-03 | unit | `cd spfx && npx heft test --clean` (panel closes on article click) | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `spfx/src/extensions/unreadBadge/components/__tests__/UnreadBadgeHeader.test.tsx` — stubs for BADGE-01 (icon, badge, count cap)
- [ ] `spfx/src/extensions/unreadBadge/components/__tests__/UnreadFlyoutPanel.test.tsx` — stubs for BADGE-02, BADGE-03 (panel, articles, navigation)

*Shared test utilities already exist (@testing-library/react v12, @testing-library/jest-dom v5)*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Badge visually positioned in header bar | BADGE-01 | Layout/CSS visual positioning | Open workbench, verify bell icon appears in header area with correct alignment |
| Panel slides in from right side | BADGE-02 | Visual animation behavior | Click bell icon, verify panel slides from right edge |
| Light dismiss closes panel | BADGE-02 | Browser interaction behavior | Click outside panel or press Escape, verify panel closes |
| Cross-component real-time update | BADGE-01 | Requires both web part + customizer running | Mark article as read in sidebar, verify badge count decrements without page reload |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
