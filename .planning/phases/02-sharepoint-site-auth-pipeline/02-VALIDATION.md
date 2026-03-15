---
phase: 2
slug: sharepoint-site-auth-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Pester 5.x (PowerShell) + manual smoke test (SPFx/Azure Functions) |
| **Config file** | None — Wave 0 installs Pester and creates scripts/tests/ |
| **Quick run command** | `Invoke-Pester scripts/tests/ -Tag Unit` |
| **Full suite command** | `Invoke-Pester scripts/tests/` |
| **Estimated runtime** | ~10 seconds (unit/smoke), manual smoke test adds ~2 minutes |

---

## Sampling Rate

- **After every task commit:** Run `Invoke-Pester scripts/tests/ -Tag Unit`
- **After every plan wave:** Run `Invoke-Pester scripts/tests/`
- **Before `/gsd:verify-work`:** Full suite must be green + manual AadHttpClient smoke test
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | DEVP-01 | unit | `pwsh -c "& { . ./scripts/modules/New-WissensHubSite.ps1 }"` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | INFRA-08 | smoke | `Invoke-Pester scripts/tests/New-WissensHubGroups.Tests.ps1` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | INFRA-07 | smoke | `Invoke-Pester scripts/tests/New-WissensHubColumns.Tests.ps1` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | DEVP-01 | unit | `pwsh -c "& { . ./scripts/modules/New-WissensHubPages.ps1 }"` | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | DEVP-01 | unit | `pwsh -c "& { . ./scripts/modules/New-WissensHubNavigation.ps1 }"` | ❌ W0 | ⬜ pending |
| 02-01-06 | 01 | 1 | DEVP-01 | unit | `pwsh -c "& { . ./scripts/modules/New-WissensHubSampleData.ps1 }"` | ❌ W0 | ⬜ pending |
| 02-01-07 | 01 | 1 | DEVP-01 | integration | `./scripts/Deploy-WissensHub.ps1 -ConfigPath ./scripts/config.json` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | INFRA-06 | smoke | `Invoke-Pester scripts/tests/New-WissensHubEntraApp.Tests.ps1` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | INFRA-06 | unit | `dotnet build src/api/WissensHub.Api` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | INFRA-06 | manual | Deploy .sppkg, navigate to Dashboard page, verify /api/health response | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/tests/New-WissensHubSite.Tests.ps1` — stubs for DEVP-01 site creation verification
- [ ] `scripts/tests/New-WissensHubColumns.Tests.ps1` — stubs for INFRA-07 column verification
- [ ] `scripts/tests/New-WissensHubGroups.Tests.ps1` — stubs for INFRA-08 group verification
- [ ] `scripts/tests/New-WissensHubEntraApp.Tests.ps1` — stubs for INFRA-06 app registration verification
- [ ] Pester module installation: `Install-Module -Name Pester -MinimumVersion 5.0.0 -Force`

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| AadHttpClient smoke test from Dashboard web part calls /api/health | INFRA-06 | Requires deployed SharePoint site with admin-approved API permissions; AadHttpClient only works in real SharePoint context | 1. Deploy .sppkg to app catalog 2. Approve API permission in SharePoint Admin Center 3. Navigate to Dashboard page 4. Verify /api/health response is displayed in Dashboard component |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
