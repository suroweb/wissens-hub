---
phase: 3
slug: frontend-architecture-service-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (Heft-integrated, via @rushstack/heft-jest-plugin) |
| **Config file** | `spfx/node_modules/@microsoft/spfx-web-build-rig/profiles/default/config/jest.config.json` (rig-provided) |
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
| 03-01-01 | 01 | 1 | ARCH-01 | unit | `cd spfx && npx heft test --clean -- --testPathPattern context` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | ARCH-10, ROLE-01, ROLE-02, ROLE-03 | unit | `cd spfx && npx heft test --clean -- --testPathPattern role` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | ARCH-09, ROLE-04 | unit | `cd spfx && npx heft test --clean -- --testPathPattern RoleGate` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | ARCH-02, ARCH-05 | unit | `cd spfx && npx heft test --clean -- --testPathPattern Result` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | ARCH-03 | unit (type) | TypeScript strict compile check | N/A | ⬜ pending |
| 03-02-03 | 02 | 1 | ARCH-06 | unit | `cd spfx && npx heft test --clean -- --testPathPattern mapper` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 2 | ARCH-04 | unit | `cd spfx && npx heft test --clean -- --testPathPattern mocks` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 2 | ARCH-07, ARCH-08 | unit | `cd spfx && npx heft test --clean -- --testPathPattern hooks` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Confirm `cd spfx && npx heft test --clean` runs successfully with zero tests (baseline)
- [ ] Create first test file (e.g., `src/shared/models/Result.test.ts`) to validate test pipeline works
- [ ] Verify test file discovery: `**/*.test.ts` in `src/` compiles to `lib-commonjs/**/*.test.js` and is discovered by Jest

*Existing test infrastructure via Heft + Jest rig is present but no test files exist yet.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mock vs production auto-detection | ARCH-01 | AadHttpClient only available in SharePoint-hosted workbench | 1. Run `gulp serve` for local workbench → verify mock mode. 2. Deploy to app catalog → verify production mode. |
| Property pane mock role dropdown | ROLE-01 | Property pane rendering requires SPFx workbench | Open workbench → edit web part → verify dropdown shows Reader/Editor/Reviewer/Admin |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
