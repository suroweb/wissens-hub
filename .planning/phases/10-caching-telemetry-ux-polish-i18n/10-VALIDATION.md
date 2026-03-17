---
phase: 10
slug: caching-telemetry-ux-polish-i18n
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | @heft-jest (Jest 27 via SPFx Heft) |
| **Config file** | Managed by @microsoft/spfx-heft-plugins |
| **Quick run command** | `cd spfx && npx heft test --clean` |
| **Full suite command** | `cd spfx && npx heft test --clean` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd spfx && npx heft test --clean`
- **After every plan wave:** Run `cd spfx && npx heft test --clean`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | CACH-01 | unit | `npx heft test --clean` (verify pnpSetup imports Caching) | ❌ W0 | ⬜ pending |
| 10-01-02 | 01 | 1 | CACH-02 | unit | `npx heft test --clean` | ❌ W0 | ⬜ pending |
| 10-01-03 | 01 | 1 | CACH-03 | unit | `npx heft test --clean` | ❌ W0 | ⬜ pending |
| 10-01-04 | 01 | 1 | CACH-04 | unit | `npx heft test --clean` | ❌ W0 | ⬜ pending |
| 10-02-01 | 02 | 1 | TELE-01 | unit | `npx heft test --clean` | ❌ W0 | ⬜ pending |
| 10-02-02 | 02 | 1 | TELE-02 | unit | `npx heft test --clean` | ❌ W0 | ⬜ pending |
| 10-02-03 | 02 | 1 | TELE-03 | unit | `npx heft test --clean` | ❌ W0 | ⬜ pending |
| 10-02-04 | 02 | 1 | TELE-04 | unit | `npx heft test --clean` | ❌ W0 | ⬜ pending |
| 10-02-05 | 02 | 1 | TELE-05 | unit | `npx heft test --clean` | ❌ W0 | ⬜ pending |
| 10-02-06 | 02 | 1 | TELE-06 | unit | `npx heft test --clean` | ❌ W0 | ⬜ pending |
| 10-03-01 | 03 | 2 | UX-01 | unit | `npx heft test --clean` | ✅ partial (ReadStatusSection.test.tsx) | ⬜ pending |
| 10-03-02 | 03 | 2 | UX-02 | unit | `npx heft test --clean` | ✅ partial (Dashboard.test.tsx stub) | ⬜ pending |
| 10-03-03 | 03 | 2 | UX-03 | unit | `npx heft test --clean` | ✅ partial (FilterBar.test.tsx stub) | ⬜ pending |
| 10-04-01 | 04 | 2 | UX-04 | manual-only | Visual inspection in workbench | N/A | ⬜ pending |
| 10-04-02 | 04 | 2 | UX-05 | manual-only | Visual inspection + keyboard testing | N/A | ⬜ pending |
| 10-05-01 | 05 | 2 | I18N-01 | unit | `npx heft test --clean` | ❌ W0 | ⬜ pending |
| 10-05-02 | 05 | 2 | I18N-02 | unit | `npx heft test --clean` | ❌ W0 | ⬜ pending |
| 10-05-03 | 05 | 2 | I18N-03 | build | `cd spfx && npx heft test --clean --production` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/shared/services/__tests__/CacheService.test.ts` — stubs for CACH-02 (get/set/invalidate/TTL)
- [ ] `src/shared/services/__tests__/TelemetryService.test.ts` — stubs for TELE-01, TELE-02, TELE-04
- [ ] `src/shared/components/__tests__/ErrorBoundary.test.tsx` — stubs for TELE-05
- [ ] `src/shared/components/__tests__/ToastProvider.test.tsx` — stubs for TELE-06
- No new framework install needed — jest + @testing-library/react already configured

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Responsive breakpoints (3-col → 2-col → 1-col) | UX-04 | Layout requires visual inspection at different zone widths | Resize workbench zone widths to full/2-thirds/1-third, verify card grid adapts |
| ARIA labels and keyboard navigation | UX-05 | Accessibility requires keyboard + screen reader testing | Tab through cards/lists/dialogs, verify focus trap in flyouts, check ARIA labels with browser dev tools |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
