---
phase: 12
slug: devops-deployment
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest via Heft (frontend), xUnit (backend), Playwright (E2E) |
| **Config file** | `spfx/config/jest.config.json`, `api/tests/WissensHub.Tests/WissensHub.Tests.csproj`, `e2e/playwright.config.ts` |
| **Quick run command** | `cd spfx && npx heft test --clean` |
| **Full suite command** | `npm run test:all` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:all`
- **After every plan wave:** Run `npm run test:all` + `az bicep build --file infra/main.bicep` (if az CLI available)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 1 | DEVP-02 | manual | `az bicep build --file infra/main.bicep` | N/A — Bicep validation | ⬜ pending |
| 12-02-01 | 02 | 2 | DEVP-03 | manual | Trigger via PR creation; verify in GitHub Actions UI | N/A — workflow validation | ⬜ pending |
| 12-02-02 | 02 | 2 | DEVP-04 | manual | Trigger via merge; verify in GitHub Actions UI | N/A — workflow validation | ⬜ pending |
| 12-02-03 | 02 | 2 | DEVP-05 | manual | Verify app in tenant app catalog after CD run | N/A — integration validation | ⬜ pending |
| 12-02-04 | 02 | 2 | DEVP-06 | manual | Verify migration bundle runs in CD logs | N/A — CD step validation | ⬜ pending |
| 12-03-01 | 03 | 2 | DEVP-07 | manual | Verify no client secrets in GitHub secrets; OIDC login succeeds | N/A — security audit | ⬜ pending |
| 12-03-02 | 03 | 2 | DEVP-08 | manual | Visual inspection of README.md content | N/A — documentation review | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. This phase creates infrastructure-as-code and documentation files, not application code. Existing test suites (161 frontend + 49 backend + 4 E2E) serve as regression validation.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bicep modules are valid and deployable | DEVP-02 | Requires Azure subscription for full validation; `az bicep build` is a compile check | Run `az bicep build --file infra/main.bicep` locally |
| CI pipeline blocks failing PRs | DEVP-03 | Requires GitHub Actions runner | Create a test PR and verify checks block merge |
| CD deploys on merge to main | DEVP-04 | Requires GitHub Actions + Azure + M365 | Merge to main and verify deployment completes |
| SPFx appears in tenant app catalog | DEVP-05 | Requires M365 tenant | Check SharePoint admin center app catalog after CD |
| Migrations run before code deployment | DEVP-06 | Requires Azure SQL and CD pipeline | Verify migration bundle step precedes deployment in CD logs |
| No stored secrets in repository | DEVP-07 | Security audit | Verify GitHub repository has no client secret vars; only OIDC config |
| README has all required sections | DEVP-08 | Documentation review | Check README.md for architecture diagram, setup guides, API docs |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
