---
phase: 1
slug: project-scaffolding-local-dev
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (SPFx, bundled with Heft rig) + xUnit (API, WissensHub.Tests) |
| **Config file** | SPFx: auto-configured via Heft rig; API: WissensHub.Tests.csproj |
| **Quick run command** | `cd spfx && heft test --clean` / `cd api && dotnet test` |
| **Full suite command** | `cd spfx && heft test --clean && cd ../api && dotnet test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd spfx && heft build --clean` + `cd api && dotnet build`
- **After every plan wave:** Run `cd spfx && heft test --clean && cd ../api && dotnet test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | INFRA-01 | smoke | `cd spfx && heft build --clean` | N/A (build) | ⬜ pending |
| 01-01-02 | 01 | 1 | INFRA-01 | manual-only | `cd spfx && heft start --clean` → visit localhost:4321 | Manual | ⬜ pending |
| 01-01-03 | 01 | 1 | INFRA-02 | smoke | `grep -r "extends React.Component" spfx/src/**/*.tsx` → 0 matches | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | INFRA-03 | smoke | `cd api/src/WissensHub.Functions && func start & sleep 5 && curl http://localhost:7071/api/health` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | INFRA-04 | smoke | `npm run db:migrate` | N/A (command) | ⬜ pending |
| 01-02-03 | 02 | 1 | INFRA-04 | unit | `cd api && dotnet test --filter "DatabaseSchema"` | ❌ W0 | ⬜ pending |
| 01-02-04 | 02 | 1 | INFRA-05 | smoke | `docker compose -f docker/docker-compose.yml up -d && docker compose -f docker/docker-compose.yml ps` | N/A (command) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `api/tests/WissensHub.Tests/Infrastructure/DatabaseSchemaTests.cs` — verify all 8 tables exist after migration
- [ ] Smoke script: verify /api/health returns 200
- [ ] Smoke script: grep for `extends React.Component` in spfx/src/**/*.tsx to confirm functional conversion

*These must be created as part of the first plan wave before feature tasks execute.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SPFx serves to local workbench | INFRA-01 | Requires browser interaction with localhost:4321 workbench | Run `cd spfx && heft start --clean`, open browser to https://localhost:4321/temp/workbench.html, verify web parts render |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
