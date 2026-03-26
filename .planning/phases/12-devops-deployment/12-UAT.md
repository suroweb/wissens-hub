---
status: complete
phase: 12-devops-deployment
source: [12-01-SUMMARY.md, 12-02-SUMMARY.md, 12-03-SUMMARY.md]
started: 2026-03-24T12:00:00Z
updated: 2026-03-26T12:10:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Bicep Infrastructure Modules
expected: The `infra/` directory contains 8 files: `main.bicep` orchestrator, 5 modules in `modules/` (storage.bicep, app-insights.bicep, sql.bicep, key-vault.bicep, function-app.bicep), and 2 parameter files in `parameters/` (dev.bicepparam, prod.bicepparam).
result: pass

### 2. CI Workflow — Parallel PR Jobs
expected: `.github/workflows/ci.yml` exists and defines two parallel jobs (one for SPFx build+test, one for API build+test) triggered on pull requests to main. SPFx job uses `npx heft` commands (never gulp).
result: pass

### 3. CD Workflow — Deployment Pipeline
expected: `.github/workflows/cd.yml` exists with 5 jobs in correct dependency chain: build → deploy-infra → deploy-migrations → deploy-functions, with deploy-spfx running in parallel (only depends on build). Triggered on push to main.
result: pass

### 4. OIDC Federated Identity — No Stored Secrets
expected: Both CI/CD workflows authenticate via OIDC federated identity (`azure/login@v2` with `id-token: write` permission). No client secret values stored — only `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID` as GitHub variables. Only `SQL_CONNECTION_STRING` and `SQL_ADMIN_PASSWORD` as actual secrets.
result: pass

### 5. Key Vault References in Function App
expected: `infra/modules/function-app.bicep` uses `@Microsoft.KeyVault(VaultName=...;SecretName=...)` syntax for app settings instead of hardcoded credentials. Function App has a managed identity with Key Vault Secrets User RBAC role assigned in `key-vault.bicep`.
result: pass

### 6. Dev/Prod Parameter Files
expected: `infra/parameters/dev.bicepparam` and `prod.bicepparam` both exist and use distinct environment names (e.g., `dev` vs `prod`) following the `wh-{environment}-{resource}` naming pattern. Both target `westeurope` region.
result: pass

### 7. Root README — Production Deployment Guide
expected: `README.md` includes a "Production Deployment" section covering: prerequisites, Bicep infrastructure provisioning command, CI/CD pipeline overview, GitHub variables/secrets configuration, and OIDC federated identity setup. Also includes API curl examples and a Testing section.
result: pass

### 8. SPFx README — Project-Specific Content
expected: `spfx/README.md` is no longer the SPFx boilerplate. It lists all 4 web parts and 1 application customizer with descriptions, documents the shared architecture, and includes Heft-based development instructions (`npm start`, not gulp).
result: pass

### 9. Project Scope Table Updated
expected: The root `README.md` no longer shows a WIP banner. The Project Scope table shows Phase 12 (DevOps & Deployment) marked as Complete.
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
