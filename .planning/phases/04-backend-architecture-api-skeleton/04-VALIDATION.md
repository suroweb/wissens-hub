---
phase: 04
slug: backend-architecture-api-skeleton
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | xUnit 2.x + FluentAssertions |
| **Config file** | `api/WissensHub.Tests/WissensHub.Tests.csproj` |
| **Quick run command** | `dotnet test api/WissensHub.Tests --filter "Category!=Integration"` |
| **Full suite command** | `dotnet test api/WissensHub.Tests` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `dotnet test api/WissensHub.Tests --filter "Category!=Integration"`
- **After every plan wave:** Run `dotnet test api/WissensHub.Tests`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | BACK-01 | unit | `dotnet test --filter "MediatR"` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | BACK-02 | unit | `dotnet test --filter "Pipeline"` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | BACK-03 | unit | `dotnet test --filter "Validation"` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | BACK-04 | unit | `dotnet test --filter "Repository"` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | BACK-05 | unit | `dotnet test --filter "Entity"` | ❌ W0 | ⬜ pending |
| 04-02-03 | 02 | 1 | BACK-06 | unit | `dotnet test --filter "DbContext"` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | API-01..API-10 | unit | `dotnet test --filter "Endpoint"` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 2 | BACK-04 | unit | `dotnet test --filter "Auth"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `api/WissensHub.Tests/WissensHub.Tests.csproj` — test project with xUnit, FluentAssertions, Moq
- [ ] `api/WissensHub.Tests/Application/Behaviors/` — stubs for pipeline behavior tests
- [ ] `api/WissensHub.Tests/Application/Validators/` — stubs for FluentValidation tests
- [ ] `api/WissensHub.Tests/Infrastructure/Repositories/` — stubs for repository tests
- [ ] `api/WissensHub.Tests/Functions/` — stubs for endpoint tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Entra ID token rejection | BACK-04 | Requires real Entra ID token | Send request without Bearer token, verify 401 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
