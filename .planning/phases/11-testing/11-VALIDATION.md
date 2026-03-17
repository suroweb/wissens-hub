---
phase: 11
slug: testing
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Frontend Framework** | Jest 27 via @rushstack/heft-jest-plugin (Heft pipeline) |
| **Backend Framework** | xUnit 2.9.3 + .NET 10 Test SDK 17.14.1 |
| **E2E Framework** | Playwright 1.58.2 |
| **Frontend Config** | rig: @microsoft/spfx-web-build-rig jest.config.json |
| **Backend Config** | api/tests/WissensHub.Tests/WissensHub.Tests.csproj |
| **E2E Config** | e2e/playwright.config.ts |
| **Frontend Quick Run** | `cd spfx && npx heft test --clean` |
| **Backend Quick Run** | `cd api && dotnet test tests/WissensHub.Tests -e AZURE_FUNCTIONS_ENVIRONMENT=Development` |
| **E2E Quick Run** | `cd e2e && npx playwright test` |
| **Full Suite** | `npm run test:all` (from root) |
| **Estimated runtime** | ~120 seconds (frontend ~30s, backend ~40s, E2E ~50s) |

---

## Sampling Rate

- **After every task commit:** Run relevant quick command (frontend or backend depending on task)
- **After every plan wave:** Run `npm run test:all`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | TEST-01 | unit | `cd spfx && npx heft test --clean` | 29 stubs exist | ⬜ pending |
| 11-02-01 | 02 | 1 | TEST-02 | integration | `cd api && dotnet test tests/WissensHub.Tests` | Schema tests exist | ⬜ pending |
| 11-03-01 | 03 | 2 | TEST-03 | e2e | `cd e2e && npx playwright test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `spfx/src/shared/test-utils.tsx` — renderWithContext() helper with mock services, WissensHubContext, ToastProvider
- [ ] `api/tests/WissensHub.Tests/Infrastructure/IntegrationTestFixture.cs` — Custom xUnit fixture with real SQL Server via Docker
- [ ] `api/tests/WissensHub.Tests/Infrastructure/IntegrationTestBase.cs` — Base class with per-test cleanup
- [ ] `e2e/playwright.config.ts` — Playwright config for WissensHub (msedge channel, workers:1)
- [ ] `e2e/global-setup.ts` — Edge SSO auth setup with auth state caching
- [ ] `e2e/fixtures/spfx-fixtures.ts` — Worker-scoped workbench fixture
- [ ] `e2e/package.json` — Playwright dependency
- [ ] `e2e/tsconfig.json` — TypeScript config
- [ ] `@testing-library/user-event@13.5.0` install in spfx/package.json
- [ ] Root package.json scripts: `test:frontend`, `test:backend`, `test:e2e`, `test:all`
- [ ] Remove `Microsoft.EntityFrameworkCore.InMemory` from WissensHub.Tests.csproj (replace with real SQL Server)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| E2E auth with Edge SSO | TEST-03 | Requires active SharePoint tenant + local dev server | Run `npm start` in spfx/, then `cd e2e && npx playwright test --headed` with Edge profile logged into tenant |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
