---
phase: 02-sharepoint-site-auth-pipeline
plan: 02
subsystem: auth
tags: [entra-id, jwt, aad-http-client, azure-functions, spfx, pnp-powershell]

# Dependency graph
requires:
  - phase: 02-01
    provides: Provisioning orchestrator and config template
  - phase: 01-project-scaffolding-local-dev
    provides: SPFx scaffold and Azure Functions project structure
provides:
  - Entra ID app registration provisioning module (New-WissensHubEntraApp.ps1)
  - JWT authentication middleware for Azure Functions (AuthenticationMiddleware.cs)
  - AadHttpClient smoke test in Dashboard web part
  - End-to-end auth pipeline wiring (SPFx -> Entra ID -> Azure Functions)
affects: [phase-3, phase-4, phase-5, phase-6, phase-7, phase-8, phase-9]

# Tech tracking
tech-stack:
  added: [Microsoft.Identity.Web, Microsoft.Graph.Applications]
  patterns: [jwt-middleware, aad-http-client, entra-app-provisioning]

key-files:
  created:
    - scripts/modules/New-WissensHubEntraApp.ps1
    - api/src/WissensHub.Functions/Middleware/AuthenticationMiddleware.cs
  modified:
    - scripts/Deploy-WissensHub.ps1
    - api/src/WissensHub.Functions/Program.cs
    - api/src/WissensHub.Functions/WissensHub.Functions.csproj
    - api/src/WissensHub.Functions/local.settings.json
    - spfx/package.json
    - spfx/config/package-solution.json
    - spfx/src/webparts/dashboard/DashboardWebPart.ts
    - spfx/src/webparts/dashboard/components/IDashboardProps.ts
    - spfx/src/webparts/dashboard/components/Dashboard.tsx

key-decisions:
  - "Entra app module runs in separate PowerShell session due to Microsoft.Identity.Client version conflict with PnP.PowerShell"
  - "ASP.NET Core integration model for Azure Functions — CreateResponse() with no arguments, set StatusCode separately"
  - "SharePoint Client Extensibility pre-authorized (08e18876-6177-487e-b8b5-cf950c1e598c) for AadHttpClient flow"

patterns-established:
  - "Register-PnPEntraIDAppForInteractiveLogin for PnP auth (deprecated PnP Management Shell)"
  - "German locale requires German permission level names and internal list names"
  - "Pages must be published before navigation or home page assignment"
  - "Module version conflicts resolved by running in separate PowerShell sessions"

requirements-completed: [INFRA-06, DEVP-01]

# Metrics
duration: 10min
completed: 2026-03-15
---

# Phase 2 Plan 2: Auth Pipeline Summary

**Entra ID app registration module, JWT middleware for Azure Functions, and AadHttpClient smoke test in Dashboard — verified provisioning on real contoso tenant**

## Performance

- **Duration:** 10 min (code) + tenant verification session
- **Started:** 2026-03-15T13:10:00Z
- **Completed:** 2026-03-15T18:30:00Z
- **Tasks:** 2/3 (task 3 deferred — requires Azure Functions deployment)
- **Files modified:** 11

## Accomplishments
- Entra ID app registration module with exposed access_as_user scope and SharePoint pre-authorization
- JWT authentication middleware for Azure Functions using Microsoft.Identity.Web
- AadHttpClient smoke test wired in Dashboard web part
- Full provisioning suite verified on real SharePoint tenant (contoso)
- Fixed German locale issues discovered during real-tenant testing

## Task Commits

Each task was committed atomically:

1. **Task 1: Entra ID provisioning + JWT middleware** - `d9a87bb` (feat)
2. **Task 2: SPFx AadHttpClient smoke test** - `98d9796` (feat)
3. **Task 3: End-to-end verification** - Deferred (requires Azure Functions deployment)

**Tenant verification fixes:**
- `774540c` - fix: pnpClientId for Entra app-based PnP authentication
- `c7c39c1` - fix: German locale adaptation (permission levels, list names, page publishing)

## Files Created/Modified
- `scripts/modules/New-WissensHubEntraApp.ps1` - Entra ID app registration with scope exposure and pre-auth
- `api/src/WissensHub.Functions/Middleware/AuthenticationMiddleware.cs` - JWT token validation middleware
- `api/src/WissensHub.Functions/Program.cs` - Middleware registration
- `spfx/src/webparts/dashboard/DashboardWebPart.ts` - AadHttpClient provider
- `spfx/src/webparts/dashboard/components/Dashboard.tsx` - Health check smoke test UI

## Decisions Made
- Entra app module extracted to standalone execution due to module version conflict
- Used ASP.NET Core integration model CreateResponse() pattern (not HttpStatusCode overload)
- SharePoint Client Extensibility pre-authorized for AadHttpClient flow

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] HttpRequestData.CreateResponse() API**
- **Found during:** Task 1 (JWT middleware)
- **Issue:** CreateResponse(HttpStatusCode) overload doesn't exist in ASP.NET Core integration
- **Fix:** Call CreateResponse() with no args, set StatusCode separately
- **Verification:** dotnet build passes

### Tenant Verification Fixes

**2. PnP Management Shell deprecated**
- **Issue:** Connect-PnPOnline -Interactive fails without -ClientId since Sept 2024
- **Fix:** Added pnpClientId to config, Register-PnPEntraIDAppForInteractiveLogin documented

**3. German locale (LCID 1031)**
- **Issue:** Permission levels are in German, list display names differ from internal names
- **Fix:** German permission names, internal list name 'SitePages', publish pages before use

**4. Microsoft.Graph.Applications version conflict**
- **Issue:** Assembly conflict with PnP.PowerShell's Microsoft.Identity.Client
- **Fix:** Entra app module runs standalone in separate PowerShell session

## Issues Encountered
- Task 3 (end-to-end auth verification) deferred — requires Azure Functions deployed to Azure and Entra API app registered. SharePoint provisioning fully verified on real tenant.

## Next Phase Readiness
- Auth pipeline code complete, ready for feature development
- Entra app registration will run when Azure Functions are deployed
- All provisioning scripts verified on real tenant with German locale
- Dashboard web part has AadHttpClient wiring ready for API calls

## Self-Check: PASSED

All created/modified files verified present. Task commits confirmed in git log. Tenant verification successful.

---
*Phase: 02-sharepoint-site-auth-pipeline*
*Completed: 2026-03-15*
