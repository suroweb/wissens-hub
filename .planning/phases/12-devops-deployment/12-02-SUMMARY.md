---
phase: 12-devops-deployment
plan: 02
subsystem: infra
tags: [github-actions, ci-cd, oidc, bicep, ef-core-migrations, cli-microsoft365, heft]

# Dependency graph
requires:
  - phase: 01-project-scaffolding-local-dev
    provides: "Repository layout (spfx/, api/), .NET Clean Architecture, SPFx Heft toolchain"
  - phase: 12-devops-deployment plan 01
    provides: "Bicep infrastructure modules referenced by CD deploy-infra job"
provides:
  - "CI workflow triggered on PR to main (build + test SPFx and API)"
  - "CD workflow triggered on push to main (build, test, deploy infra, migrate DB, deploy Functions, deploy SPFx)"
  - "OIDC federated identity for Azure and M365 (no stored client secrets)"
affects: [12-devops-deployment]

# Tech tracking
tech-stack:
  added: [github-actions, azure-login-v2, functions-action-v1, cli-microsoft365, ef-core-migration-bundles]
  patterns: [oidc-federated-identity, artifact-passing-between-jobs, parallel-spfx-deploy, migration-bundle-pre-deploy]

key-files:
  created:
    - .github/workflows/ci.yml
    - .github/workflows/cd.yml
  modified: []

key-decisions:
  - "Two parallel CI jobs (SPFx + API) for faster PR feedback"
  - "CD job dependency chain: build -> deploy-infra -> deploy-migrations -> deploy-functions, with deploy-spfx parallel after build"
  - "OIDC federated identity via azure/login@v2 and m365 login --authType federated"
  - "Self-contained EF Core migration bundle for DB updates without .NET SDK at runtime"
  - "GitHub vars for non-sensitive values, secrets only for SQL_CONNECTION_STRING and SQL_ADMIN_PASSWORD"

patterns-established:
  - "OIDC auth: Separate Entra ID apps for Azure (AZURE_CLIENT_ID) and M365 (M365_CLIENT_ID)"
  - "Artifact flow: build job produces spfx-package, api-publish, migration-bundle consumed by downstream jobs"
  - "SPFx build: npx heft test --clean --production and npx heft package-solution --production (never gulp)"

requirements-completed: [DEVP-03, DEVP-04, DEVP-05, DEVP-06, DEVP-07]

# Metrics
duration: 2min
completed: 2026-03-24
---

# Phase 12 Plan 02: CI/CD Pipelines Summary

**GitHub Actions CI (PR quality gates) and CD (automated deployment) workflows with OIDC federated identity for Azure and M365**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-23T23:34:25Z
- **Completed:** 2026-03-23T23:36:20Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments
- CI workflow with two parallel jobs (SPFx build+test, API build+test) triggered on PR to main
- CD workflow with five jobs and correct dependency chain: build, deploy infrastructure, run migrations, deploy Functions, deploy SPFx
- OIDC federated identity for both Azure (via azure/login@v2) and M365 (via m365 login --authType federated) -- no stored client secrets
- Self-contained EF Core migration bundle built and executed before Functions code deployment
- SPFx package deployed to tenant-wide app catalog via CLI for Microsoft 365

## Task Commits

Each task was committed atomically:

1. **Task 1: Create GitHub Actions CI workflow** - `b9919cb` (feat)
2. **Task 2: Create GitHub Actions CD workflow** - `40f2dba` (feat)

## Files Created/Modified
- `.github/workflows/ci.yml` - CI pipeline: 2 parallel jobs (SPFx + API) build and test on every PR to main
- `.github/workflows/cd.yml` - CD pipeline: 5 jobs with dependency chain for full deployment on push to main

## Decisions Made
- Two parallel CI jobs for maximum feedback speed on PRs
- CD build job produces 3 artifacts (spfx-package, api-publish, migration-bundle) consumed by downstream deploy jobs
- deploy-spfx runs in parallel with deploy-infra/deploy-migrations/deploy-functions since it only needs build artifacts
- GitHub vars (not secrets) for non-sensitive values (client IDs, tenant ID, subscription ID, resource group, function app name, app catalog URL)
- Only SQL_CONNECTION_STRING and SQL_ADMIN_PASSWORD stored as GitHub secrets

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

**External services require manual configuration before pipelines can run:**

### Azure Deployment (OIDC)
1. Create Entra ID app registration "WissensHub GitHub Deploy"
2. Add federated credential for main branch (GitHub Actions deploying Azure resources)
3. Grant Contributor role on target resource group
4. Store as GitHub Actions variables: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_RESOURCE_GROUP`
5. Store `AZURE_FUNCTION_APP_NAME` as GitHub Actions variable

### M365 Deployment (Federated Identity)
1. Create Entra ID app registration "WissensHub M365 CI/CD"
2. Add API permission: SharePoint > Sites.Selected (Application) + admin consent
3. Add federated credential for main branch
4. Store as GitHub Actions variables: `M365_CLIENT_ID`, `SPO_APP_CATALOG_URL`

### Database
1. After Bicep deploys Azure SQL, store connection string as GitHub Actions secret: `SQL_CONNECTION_STRING`
2. Store SQL admin password as GitHub Actions secret: `SQL_ADMIN_PASSWORD`

## Next Phase Readiness
- CI/CD pipelines ready -- pending user setup of Entra ID apps, federated credentials, and GitHub variables/secrets
- Plan 01 (Bicep infrastructure) provides the infra/main.bicep referenced by the CD workflow
- Plan 03 (README documentation) is the final plan in the phase

## Self-Check: PASSED

- [x] `.github/workflows/ci.yml` exists
- [x] `.github/workflows/cd.yml` exists
- [x] `12-02-SUMMARY.md` exists
- [x] Commit `b9919cb` (Task 1) found
- [x] Commit `40f2dba` (Task 2) found

---
*Phase: 12-devops-deployment*
*Completed: 2026-03-24*
