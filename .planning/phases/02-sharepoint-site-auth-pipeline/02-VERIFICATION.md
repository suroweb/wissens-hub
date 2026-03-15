---
phase: 02-sharepoint-site-auth-pipeline
verified: 2026-03-15T18:45:00Z
status: gaps_found
score: 9/11 truths verified
re_verification: false
gaps:
  - truth: "Azure Functions validates JWT bearer tokens in middleware -- unauthenticated requests to protected endpoints return 401"
    status: partial
    reason: "AuthenticationMiddleware.cs is fully implemented and registered in Program.cs. However the solution build has not been confirmed in this verification session — prior confirmation is from the SUMMARY self-check only. More critically, the end-to-end smoke test (Plan 02-02 Task 3) was explicitly deferred because Azure Functions are not yet deployed."
    artifacts:
      - path: "api/src/WissensHub.Functions/Middleware/AuthenticationMiddleware.cs"
        issue: "Code is substantive and correct; cannot confirm runtime 401 behaviour without deployment"
    missing:
      - "Deploy Azure Functions and run the smoke test to confirm 401 on unauthenticated requests"
  - truth: "Dashboard web part obtains a bearer token via AadHttpClient and calls /api/health"
    status: partial
    reason: "Code wiring is complete and correct. The resource URI in DashboardWebPart.ts still contains the placeholder string 'api://{client-id-placeholder}' -- this must be replaced with the real client ID from config.json after provisioning runs. Until replaced, AadHttpClient.getClient() will fail silently (caught by console.warn). The smoke test is therefore not exercisable without this substitution."
    artifacts:
      - path: "spfx/src/webparts/dashboard/DashboardWebPart.ts"
        issue: "Line 52: resource URI is 'api://{client-id-placeholder}' -- placeholder not replaced with real client ID"
    missing:
      - "Replace {client-id-placeholder} with actual client ID after running New-WissensHubEntraApp.ps1"
      - "Replace {function-app-placeholder} in apiBaseUrl with actual Azure Functions URL"
human_verification:
  - test: "Deploy Azure Functions and verify 401 on unauthenticated request"
    expected: "GET /api/articles (any protected endpoint) without Authorization header returns HTTP 401 Unauthorized"
    why_human: "Requires deployed Azure environment -- cannot verify JWT middleware runtime behaviour from static code analysis alone"
  - test: "Add Dashboard web part to Dashboard page and observe health status"
    expected: "After replacing client-id-placeholder and deploying .sppkg, the Dashboard displays 'API: healthy (timestamp)' fetched via AadHttpClient"
    why_human: "Requires real SharePoint tenant with deployed SPFx package and running Azure Functions instance"
  - test: "Re-run Deploy-WissensHub.ps1 on provisioned site to confirm idempotency"
    expected: "All modules print Yellow 'already exists. Skipping.' messages, no errors, no duplicate resources created"
    why_human: "Idempotency is code-verified per logic analysis; runtime confirmation on real tenant is definitive"
---

# Phase 2: SharePoint Site & Auth Pipeline Verification Report

**Phase Goal:** SPFx web parts can authenticate to Azure Functions via AadHttpClient against a real SharePoint tenant
**Verified:** 2026-03-15T18:45:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Running Deploy-WissensHub.ps1 creates a SharePoint Communication Site with German locale | VERIFIED | New-WissensHubSite.ps1 L25-29: `New-PnPSite -Type CommunicationSite -Lcid 1031`, idempotent check present. Tenant verification confirmed in 02-02-SUMMARY. |
| 2 | Running Deploy-WissensHub.ps1 creates 4 SharePoint groups (Members, Editors, Reviewers, Owners) | VERIFIED | New-WissensHubGroups.ps1 creates all 4 groups from config with German permission levels (Lesen, Bearbeiten, Vollzugriff). Idempotent check on each. |
| 3 | Running Deploy-WissensHub.ps1 adds 6 WH_-prefixed custom columns to Site Pages library | VERIFIED | New-WissensHubColumns.ps1: WH_Category, WH_Status, WH_TargetGroups, WH_IsMandatory, WH_Reviewer, WH_ReviewByDate. All use `Add-PnPField -InternalName "WH_*"` with idempotent guards. |
| 4 | Running Deploy-WissensHub.ps1 creates Dashboard, Freigabecenter, and Administration pages with Dashboard as home | VERIFIED | New-WissensHubPages.ps1 L18-60: all 3 pages with correct LayoutType, publishes all, sets Dashboard as home via `Set-PnPHomePage`. |
| 5 | Running Deploy-WissensHub.ps1 sets up feature-based top navigation in German | VERIFIED | New-WissensHubNavigation.ps1: 4 nodes — Startseite, Wissensdatenbank, Freigabecenter, Administration. Clear-and-rebuild strategy for idempotency. |
| 6 | Running Deploy-WissensHub.ps1 creates 8-10 sample articles with realistic German content across all statuses | VERIFIED | New-WissensHubSampleData.ps1: 10 articles, all statuses covered (6 Published, 2 Draft, 1 InReview, 1 Archived). Each has 2-4 headings, bullet lists, paragraphs, and WH_ metadata. |
| 7 | All modules are idempotent — re-running the script makes no changes if resources already exist | VERIFIED (code) | All 6 modules use `-ErrorAction SilentlyContinue` existence checks before creating. Navigation uses clear-rebuild. Needs human confirmation on real tenant (see Human Verification). |
| 8 | Entra ID app registration exists with exposed access_as_user scope | VERIFIED (code) | New-WissensHubEntraApp.ps1 L117-158: creates app, sets `api://{appId}` URI, exposes `access_as_user` scope, pre-authorizes `08e18876-6177-487e-b8b5-cf950c1e598c` (SharePoint Client Extensibility). Tenant verification confirmed in 02-02-SUMMARY. |
| 9 | SPFx package-solution.json requests the WissensHub API permission | VERIFIED | package-solution.json L28-33: `"webApiPermissionRequests": [{"resource": "WissensHub API", "scope": "access_as_user"}]`. |
| 10 | Azure Functions validates JWT bearer tokens in middleware — unauthenticated requests return 401 | PARTIAL | AuthenticationMiddleware.cs (141 lines) is fully implemented with JsonWebTokenHandler, OpenID Connect config fetch, and 401 responses. Registered in Program.cs L19. Code is correct but runtime confirmation requires deployment. |
| 11 | Dashboard web part obtains a bearer token via AadHttpClient and calls /api/health | PARTIAL | DashboardWebPart.ts acquires AadHttpClient via `aadHttpClientFactory.getClient(...)` in onInit; Dashboard.tsx calls `${apiBaseUrl}/api/health`. Wiring is correct but resource URI contains literal placeholder `api://{client-id-placeholder}` — token acquisition will fail until replaced. |

**Score:** 9/11 truths verified (2 partial — code complete, runtime unconfirmable)

---

### Required Artifacts

| Artifact | Expected | Lines | Status | Details |
|----------|----------|-------|--------|---------|
| `scripts/Deploy-WissensHub.ps1` | Main orchestrator calling all modules | 152 (min 30) | VERIFIED | Loads config, validates fields, dot-sources all 7 modules, calls 6 in order (Entra runs standalone), try/catch, summary output |
| `scripts/config.template.json` | Parameter file template with placeholders | 31 (min 15) | VERIFIED | tenantName, siteUrl, adminUpn, pnpClientId, azureFunctionUrl, entraApp, groups, categories, targetGroups all present |
| `scripts/modules/New-WissensHubSite.ps1` | Communication Site creation with LCID 1031 | 36 (min 15) | VERIFIED | Idempotent check, `New-PnPSite -Lcid 1031`, reconnects to site URL after creation |
| `scripts/modules/New-WissensHubGroups.ps1` | 4 SharePoint groups with permission levels | 36 (min 20) | VERIFIED | 4 groups from config, German permission levels, per-group idempotency |
| `scripts/modules/New-WissensHubColumns.ps1` | 6 custom columns on Site Pages with WH_ prefix | 110 (min 30) | VERIFIED | All 6 columns: Category (Choice), Status (Choice), TargetGroups (Note), IsMandatory (Boolean), Reviewer (User), ReviewByDate (DateTime) |
| `scripts/modules/New-WissensHubPages.ps1` | Modern pages creation and home page setting | 61 (min 20) | VERIFIED | Dashboard (Home layout), Freigabecenter, Administration; publishes all; sets Dashboard as home |
| `scripts/modules/New-WissensHubNavigation.ps1` | Feature-based German top navigation | 43 (min 15) | VERIFIED | 4 German nodes via clear-and-rebuild; derives site-relative paths from config.siteUrl |
| `scripts/modules/New-WissensHubSampleData.ps1` | 8-10 sample articles with German content | 351 (min 80) | VERIFIED | 10 articles, foreach-loop pattern, CAML query for metadata, all 4 statuses represented |
| `scripts/modules/New-WissensHubEntraApp.ps1` | Entra ID app registration with scope and pre-auth | 193 (min 40) | VERIFIED | Creates app, sets Application ID URI, exposes access_as_user, pre-authorizes SharePoint Client Extensibility (08e18876), writes clientId/scopeUri back to config |
| `api/src/WissensHub.Functions/Middleware/AuthenticationMiddleware.cs` | JWT token validation middleware | 141 (min 50) | VERIFIED | IFunctionsWorkerMiddleware, skips Health, extracts Bearer token, validates with JsonWebTokenHandler + OpenID Connect keys, stores claims in context.Items["User"] |
| `api/src/WissensHub.Functions/Program.cs` | Middleware registration and MicrosoftIdentityOptions | 26 (min 15) | VERIFIED | Configures MicrosoftIdentityOptions from "AzureAd" section, registers `builder.UseMiddleware<AuthenticationMiddleware>()` |
| `spfx/config/package-solution.json` | webApiPermissionRequests for WissensHub API | present | VERIFIED | Contains `webApiPermissionRequests` array with correct resource and scope |
| `spfx/src/webparts/dashboard/DashboardWebPart.ts` | AadHttpClient factory passed to Dashboard component | present | VERIFIED | Imports AadHttpClient, acquires via `aadHttpClientFactory.getClient(...)` in onInit, passes `httpClient` and `apiBaseUrl` props |
| `spfx/src/webparts/dashboard/components/Dashboard.tsx` | Smoke test calling /api/health via AadHttpClient | present | VERIFIED (partial) | useEffect calls `httpClient.get(${apiBaseUrl}/api/health)` on mount; displays result or workbench fallback. Resource URI placeholder not substituted. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `scripts/Deploy-WissensHub.ps1` | `scripts/modules/*.ps1` | dot-sourcing and function calls | VERIFIED | Lines 70-76: `. (Join-Path $modulesPath "New-WissensHub*.ps1")` for all 7 modules |
| `scripts/Deploy-WissensHub.ps1` | `scripts/config.template.json` (config.json at runtime) | ConvertFrom-Json parameter loading | VERIFIED | Line 47: `$config = Get-Content $ConfigPath -Raw \| ConvertFrom-Json` |
| `scripts/modules/New-WissensHubColumns.ps1` | Site Pages library | Add-PnPField with WH_ prefix | VERIFIED | `WH_` appears as InternalName on all 6 columns |
| `scripts/modules/New-WissensHubEntraApp.ps1` | `spfx/config/package-solution.json` | Client ID and scope name matching | VERIFIED | Both use `access_as_user`; scope URI pattern `api://{appId}/access_as_user` set in Entra module; `webApiPermissionRequests` matches by display name "WissensHub API" |
| `scripts/Deploy-WissensHub.ps1` | `New-WissensHubEntraApp` function | Orchestrator calls New-WissensHubEntraApp | PARTIAL | Module is dot-sourced (line 76) but function call is commented out (lines 95-97). Intentional: module version conflict with PnP.PowerShell requires separate session. Usage: `pwsh ./scripts/modules/New-WissensHubEntraApp.ps1 -ConfigPath ./scripts/config.json`. Documented in script comments and SUMMARY. |
| `spfx/src/webparts/dashboard/DashboardWebPart.ts` | `api/.../Functions/HealthFunction.cs` | AadHttpClient GET to /api/health | VERIFIED (code) | Dashboard.tsx L15: `httpClient.get(${apiBaseUrl}/api/health, ...)`. HealthFunction.cs has `Route = "health"`, `[Function("Health")]`. Wired correctly; runtime confirmation needs deployment. |
| `api/.../Middleware/AuthenticationMiddleware.cs` | `api/.../Program.cs` | UseMiddleware registration | VERIFIED | Program.cs L19: `builder.UseMiddleware<AuthenticationMiddleware>();` |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| INFRA-07 | 02-01-PLAN | SharePoint Communication Site with custom WH_ columns on Site Pages | SATISFIED | New-WissensHubSite.ps1 + New-WissensHubColumns.ps1. Tenant-verified per 02-02-SUMMARY. |
| INFRA-08 | 02-01-PLAN | SharePoint Groups created (Members, Editors, Reviewers, Owners) | SATISFIED | New-WissensHubGroups.ps1 creates all 4 groups. Tenant-verified. |
| DEVP-01 | 02-01-PLAN + 02-02-PLAN | PnP PowerShell provisioning script for site, groups, columns, pages, navigation, sample data | SATISFIED | Complete 8-file provisioning suite (1 orchestrator + 7 modules). REQUIREMENTS.md checkbox [x] confirmed. |
| INFRA-06 | 02-02-PLAN | Entra ID app registration with AadHttpClient for SPFx-to-Azure Functions authentication | PARTIAL | Code complete: app registration module, JWT middleware, AadHttpClient wiring. End-to-end smoke test deferred (Azure Functions not deployed). REQUIREMENTS.md still shows `[ ]` (pending) — needs update when smoke test passes. |

**Note on REQUIREMENTS.md discrepancy:** INFRA-06 is marked `[ ]` in REQUIREMENTS.md and "Pending" in the traceability table despite 02-02-SUMMARY claiming completion. The SUMMARY is accurate that the code pipeline is fully implemented; however the plan's own Task 3 (end-to-end checkpoint) was deferred. REQUIREMENTS.md should only be updated to `[x]` after the deployed smoke test passes. No orphaned requirements found — all 4 phase-2 requirements are accounted for across the two plans.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `spfx/src/webparts/dashboard/DashboardWebPart.ts` | 52 | `api://{client-id-placeholder}` — unsubstituted placeholder in AadHttpClient resource URI | Warning | AadHttpClient.getClient() silently fails; token acquisition not functional until replaced. Caught by console.warn so workbench does not break. |
| `spfx/src/webparts/dashboard/DashboardWebPart.ts` | 37 | `https://{function-app-placeholder}.azurewebsites.net` — unsubstituted placeholder in apiBaseUrl | Warning | /api/health call targets a non-existent URL. Expected: both placeholders are intentional pending-deployment markers documented with TODO comments. |
| `scripts/Deploy-WissensHub.ps1` | 95-97 | Entra ID module call commented out | Info | Intentional design decision (module version conflict). Documented in script header, in comments on lines 95-97, and in 02-02-SUMMARY. Standalone invocation documented. |

No blocker anti-patterns found. Both placeholder warnings are intentional pending-deployment markers with TODO comments.

---

### Human Verification Required

#### 1. Azure Functions JWT Middleware — 401 on Unauthenticated Request

**Test:** Deploy Azure Functions to Azure. Send `GET https://{app}.azurewebsites.net/api/articles` (or any protected endpoint) without an Authorization header.
**Expected:** HTTP 401 Unauthorized with body "Missing or invalid Authorization header."
**Why human:** Requires deployed Azure environment. Code is correct but runtime JWT validation cannot be confirmed statically.

#### 2. AadHttpClient End-to-End Smoke Test

**Test:** Replace `{client-id-placeholder}` in `DashboardWebPart.ts` with the real client ID from `scripts/config.json` after running `New-WissensHubEntraApp.ps1`. Replace `{function-app-placeholder}` with the Azure Functions URL. Deploy SPFx `.sppkg` to app catalog, approve the API permission in SharePoint Admin Center (Advanced -> API access -> approve "WissensHub API / access_as_user"). Add Dashboard web part to the Dashboard page.
**Expected:** Dashboard displays "API: healthy (timestamp)" from the /api/health endpoint.
**Why human:** Full smoke test requires real tenant, deployed Azure Functions, and approved API permission. SPFx AadHttpClient cannot be exercised from workbench.

#### 3. Provisioning Idempotency on Real Tenant

**Test:** On an already-provisioned site, re-run `./scripts/Deploy-WissensHub.ps1 -ConfigPath ./scripts/config.json`.
**Expected:** All module output lines show Yellow "already exists. Skipping." messages. No new resources created, no errors.
**Why human:** Code logic is verified; runtime confirmation on real tenant is definitive for idempotency claims.

---

### Gaps Summary

Two truths are partial, not failed — the code for both is correct and complete. The gaps are execution gaps, not implementation gaps:

1. **INFRA-06 runtime confirmation (Truth 10):** AuthenticationMiddleware is a full, correct implementation. Program.cs registers it correctly. Microsoft.Identity.Web 3.8.0 is in the .csproj. The gap is that Plan 02-02 Task 3 (end-to-end checkpoint) was explicitly deferred because Azure Functions have not been deployed to Azure. Once deployed, a 401 test confirms closure.

2. **Client ID placeholder substitution (Truth 11):** DashboardWebPart.ts wiring is architecturally correct (AadHttpClient factory, correct useEffect, correct /api/health endpoint). The gap is operational: the two placeholder strings `{client-id-placeholder}` and `{function-app-placeholder}` are hardcoded pending-deployment markers that must be replaced before the smoke test is runnable. This is a one-time manual step documented in Plan 02-02 Task 3.

Both gaps will close together when Azure Functions are deployed and the smoke test is executed. The SharePoint provisioning half of Phase 2 (site, groups, columns, pages, navigation, sample data) is fully verified on a real tenant. REQUIREMENTS.md INFRA-06 checkbox should remain `[ ]` until the smoke test passes.

---

_Verified: 2026-03-15T18:45:00Z_
_Verifier: Claude (gsd-verifier)_
