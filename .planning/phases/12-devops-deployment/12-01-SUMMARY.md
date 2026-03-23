---
phase: 12-devops-deployment
plan: 01
subsystem: infra
tags: [bicep, azure, iac, key-vault, functions, sql, app-insights, storage]

# Dependency graph
requires:
  - phase: 01-project-scaffolding-local-dev
    provides: Repository layout with /infra directory convention
provides:
  - Bicep modules for all Azure resources (Storage, App Insights, SQL, Key Vault, Function App)
  - Main orchestrator with output chaining across modules
  - Environment parameter files for dev/prod differentiation
affects: [12-devops-deployment]

# Tech tracking
tech-stack:
  added: [Azure Bicep]
  patterns: [modular-bicep-with-output-chaining, deterministic-name-circular-dep-resolution, key-vault-reference-pattern]

key-files:
  created:
    - infra/main.bicep
    - infra/modules/storage.bicep
    - infra/modules/app-insights.bicep
    - infra/modules/sql.bicep
    - infra/modules/key-vault.bicep
    - infra/modules/function-app.bicep
    - infra/parameters/dev.bicepparam
    - infra/parameters/prod.bicepparam

key-decisions:
  - "Circular dep between Function App and Key Vault resolved via deterministic KV name string interpolation"
  - "Linux Consumption plan (Y1/Dynamic) for cost-effective portfolio deployment"
  - "Basic SQL tier for minimal cost in portfolio project"
  - "westeurope region for both dev and prod environments"

patterns-established:
  - "Modular Bicep: main.bicep orchestrates child modules in modules/ subdirectory"
  - "Output chaining: modules pass outputs to dependent modules via main.bicep parameters"
  - "Key Vault references: @Microsoft.KeyVault(VaultName=;SecretName=) in Function App settings for zero-secret app config"
  - "Environment naming: wh-{environment}-{resource} pattern for all resources (except storage: wh{environment}st)"

requirements-completed: [DEVP-02]

# Metrics
duration: 2min
completed: 2026-03-24
---

# Phase 12 Plan 01: Azure Bicep Infrastructure Summary

**Modular Bicep IaC with 5 resource modules, main orchestrator, and dev/prod parameter files for full Azure environment provisioning**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-23T23:33:40Z
- **Completed:** 2026-03-23T23:36:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- All Azure resources defined as modular Bicep templates (Storage, App Insights, SQL, Key Vault, Function App)
- Main orchestrator deploys all modules with output chaining for cross-module dependencies
- Function App uses @Microsoft.KeyVault() references for secrets -- no hardcoded credentials in app settings
- Managed identity with Key Vault Secrets User RBAC role for secure secret access
- Environment parameter files enable dev/prod differentiation with single template set

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Bicep resource modules** - `a80773e` (feat)
2. **Task 2: Create main.bicep orchestrator and parameter files** - `591282b` (feat)

## Files Created/Modified
- `infra/modules/storage.bicep` - Storage Account for Functions runtime (TLS 1.2, no public blob access)
- `infra/modules/app-insights.bicep` - Log Analytics workspace + Application Insights (DisableIpMasking: false)
- `infra/modules/sql.bicep` - Azure SQL Server + WissensHub database (Basic tier) + Azure firewall rule
- `infra/modules/key-vault.bicep` - Key Vault with RBAC auth, 3 secrets, Secrets User role assignment
- `infra/modules/function-app.bicep` - Linux Consumption Function App with managed identity + Key Vault refs
- `infra/main.bicep` - Orchestrator deploying all 5 modules with output chaining
- `infra/parameters/dev.bicepparam` - Dev environment parameters (westeurope)
- `infra/parameters/prod.bicepparam` - Production environment parameters (westeurope)

## Decisions Made
- Circular dependency between Function App and Key Vault resolved via deterministic Key Vault name (`wh-${environment}-kv`) as string interpolation in main.bicep, avoiding Bicep module dependency cycle
- Linux Consumption plan (Y1/Dynamic SKU) chosen for cost-effective portfolio deployment
- Basic SQL tier selected for minimal cost (portfolio project, not production-scale)
- westeurope region for both environments (user has German locale, standard Azure region)
- Storage account naming uses `wh${environment}st` (no hyphens, max 24 chars per Azure constraint)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required. Infrastructure is deployed via `az deployment group create` in the CD pipeline (Plan 02).

## Next Phase Readiness
- All Bicep modules ready for CI/CD pipeline integration (Plan 02)
- `az deployment group create --template-file infra/main.bicep --parameters infra/parameters/dev.bicepparam` deploys entire environment
- Function App Key Vault references will self-resolve after RBAC propagation (expected 1-2 minute delay on first deploy)

## Self-Check: PASSED

All 8 created files verified present. Both task commits (a80773e, 591282b) verified in git log.

---
*Phase: 12-devops-deployment*
*Completed: 2026-03-24*
