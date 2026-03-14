# Domain Pitfalls

**Domain:** SPFx + Azure Functions Knowledge Management Solution
**Researched:** 2026-03-14
**Overall Confidence:** HIGH (based on official Microsoft docs, SPFx framework documentation, and extensive domain experience)

> **Note:** Three pitfalls are already identified in the spec and are acknowledged here but NOT repeated as primary findings: (1) Application Insights cost explosion from auto-dependency tracking, (2) SPFx Yeoman generator scaffolding class components instead of functional components, (3) Fluent UI v9 incompatibility with SPFx's React 17. This document surfaces ADDITIONAL pitfalls not addressed in the spec.

---

## Critical Pitfalls

Mistakes that cause rewrites, major delays, or broken production deployments.

### Pitfall 1: AadHttpClient Permission Model Misunderstanding

**What goes wrong:** Developers build the entire SPFx-to-Azure Functions auth flow assuming they can use MSAL directly or that permissions are scoped to their app. In reality, SPFx uses `AadHttpClient` which obtains tokens via the "SharePoint Online Client Extensibility" Entra ID enterprise application. Permissions requested in `package-solution.json` via `webApiPermissionRequests` are granted tenant-wide, not per-app. A SharePoint or Global Admin must approve these permissions through the SharePoint Admin Center API access page. If the admin denies the permission, the solution still deploys but all API calls silently fail.

**Why it happens:** Developers familiar with standard SPA auth (MSAL.js) try to use the same patterns in SPFx. Microsoft explicitly states: "Directly using MSAL with SPFx is not supported with SPFx v1.4.1 and beyond. AadHttpClient is the recommended approach." The permission model is fundamentally different from standard OAuth -- permissions are stored on a shared service principal, not on your app registration.

**Consequences:**
- API calls return 401/403 with no clear error message if admin consent is missing
- Removing the SPFx solution does NOT revoke the permissions (must be done manually)
- Permissions apply tenant-wide, which can be a security concern for admins unfamiliar with the model
- Testing requires admin consent for every new permission scope, slowing development

**Prevention:**
- Register the Azure Functions app in Entra ID with a proper App ID URI (e.g., `api://<client-id>`) and expose an API scope
- Configure `webApiPermissionRequests` in `package-solution.json` using the app's `displayName` (NOT `objectId` -- using objectId causes approval errors)
- Document the admin consent requirement in the README and provisioning script
- Build the SPFx service layer to gracefully handle missing permissions: check the AadHttpClient response and show a clear "Admin approval required" message
- Never assume permissions are granted -- the spec's `AzureApiClient` should always check for 401/403 and surface actionable errors

**Detection:** API calls from SPFx return 401 Unauthorized despite correct code. No error in SPFx console beyond a generic fetch failure. Check SharePoint Admin Center > API access page for pending/denied requests.

**Confidence:** HIGH -- verified via official Microsoft documentation (AadHttpClient docs, updated October 2025)

**Phase relevance:** Must be addressed in Phase 1 (infrastructure/auth setup) before any API integration work begins.

---

### Pitfall 2: Azure Functions CORS + Entra ID Auth Double Configuration

**What goes wrong:** Developers configure either CORS or Entra ID authentication on Azure Functions, but not both correctly together. When Azure Functions has both EasyAuth (built-in App Service authentication) and custom CORS, preflight OPTIONS requests get blocked by the auth layer before CORS headers are added, causing all cross-origin API calls from SPFx to fail with opaque CORS errors.

**Why it happens:** Azure Functions CORS is configured at the platform level (Azure portal or Bicep), while authentication can be configured at both the platform level (EasyAuth) and in application code. SPFx web parts run in the SharePoint Online domain (`*.sharepoint.com`), which is always a different origin than the Azure Functions domain (`*.azurewebsites.net`). The AadHttpClient handles token acquisition, but the browser still enforces CORS.

**Consequences:**
- All API calls fail with `No 'Access-Control-Allow-Origin' header` errors
- Extremely confusing debugging because the auth layer returns 401 for preflight OPTIONS (which carry no auth headers by design)
- Works in local dev (same origin or CORS disabled) but breaks in production

**Prevention:**
- In Azure Functions `host.json` or Bicep, configure CORS to allow `https://<tenant>.sharepoint.com` origins explicitly. Never use wildcard `*` with authentication enabled -- if a wildcard is present alongside another domain entry, the wildcard is ignored per Microsoft docs
- For the Entra ID auth setup, ensure the Azure Function App's authentication settings allow anonymous access to OPTIONS requests. The recommended approach: use `AuthorizationLevel.Anonymous` on HTTP triggers and validate the bearer token in middleware/code instead of using EasyAuth, giving you full control
- In Bicep IaC, define CORS allowed origins as a parameter that varies by environment
- Test with the actual SharePoint Online origin (not localhost) before considering API integration complete

**Detection:** SPFx web part shows loading spinner indefinitely. Browser DevTools Network tab shows preflight OPTIONS returning 401 or missing CORS headers. Works locally with `func start` but fails when deployed.

**Confidence:** HIGH -- well-documented Azure Functions CORS behavior + SPFx cross-origin requirements

**Phase relevance:** Phase 1 (Azure infrastructure setup) and Phase 2 (first API integration). Must be validated with a smoke test before building feature endpoints.

---

### Pitfall 3: SharePoint Online API Throttling on Dashboard Load

**What goes wrong:** The Dashboard web part makes multiple PnPjs calls on mount (get site pages, get user groups, get user info) plus multiple Azure Functions API calls (get unread count, get favorites, get dashboard stats). When multiple users load the dashboard simultaneously, or a single user refreshes frequently, SharePoint Online throttles the tenant with HTTP 429/503 responses. PnPjs does NOT automatically retry on 429 -- calls just fail silently or throw.

**Why it happens:** SharePoint Online enforces strict throttling: 3,000 requests per user per 5 minutes, plus per-app and per-tenant resource unit limits. A single Dashboard load could easily make 5-8 SharePoint REST calls (page list, user groups, current user, page metadata). With 50+ users opening the dashboard in a short window (e.g., Monday morning), the aggregate exceeds limits. CSOM/REST calls consume MORE resource units than Microsoft Graph equivalents.

**Consequences:**
- Dashboard shows errors or empty state for some users
- Throttling escalates: failed retries still count against limits
- In extreme cases, Microsoft can block the entire app at the tenant level
- Worst case: the Application Customizer (Unread Badge Header) runs on EVERY page load across the hub, multiplying request volume

**Prevention:**
- Implement exponential backoff with jitter that honors the `Retry-After` header. PnPjs v4 does not handle this automatically -- you must wrap calls or use a custom fetch handler
- Batch SharePoint REST calls where possible using PnPjs batching (`createBatch()`)
- Move as much data as possible to Azure SQL/Functions API (which the spec already does for tracking data) to reduce SharePoint API calls
- The Application Customizer should make exactly ONE API call to Azure Functions (`GET /api/dashboard/stats`) rather than querying SharePoint directly
- Set the User-Agent header to `NONISV|WissensHub|WissensHub/1.0` as Microsoft explicitly prioritizes decorated traffic over undecorated traffic
- Cache aggressively: the spec's 3-layer caching strategy is good, but ensure PnPjs session cache is actually working (it requires `sessionStorage` which can be blocked by strict browser policies)

**Detection:** Intermittent "Request was throttled" errors in Application Insights. HTTP 429 or 503 responses in browser DevTools. Microsoft sends throttling notifications to the Office 365 Message Center if severe.

**Confidence:** HIGH -- verified via official Microsoft throttling documentation (updated October 2025), including exact rate limits

**Phase relevance:** Phase 2 (Dashboard implementation) and Phase 3 (Application Customizer). Must be designed into the service layer from the start, not bolted on later.

---

### Pitfall 4: Multiple Web Parts on Same Page with Isolated React Trees

**What goes wrong:** When the Dashboard web part and Article Sidebar web part (or any two WissensHub web parts) are placed on the same SharePoint page, each web part mounts its own independent React tree with its own `WissensHubContext`. This means each web part independently fetches user data, role information, and creates separate API client instances. State changes in one web part (e.g., marking an article as read in the Sidebar) are invisible to the other web part (Dashboard still shows old unread count).

**Why it happens:** SPFx web parts are intentionally isolated -- each is a separate React root mounted into its own DOM container. There is no built-in mechanism for cross-web-part communication in modern SPFx beyond the Dynamic Data API (which is cumbersome and limited) or DOM events. React Context does not cross web part boundaries.

**Consequences:**
- Double API calls for shared data (user info, role, configuration)
- Stale data across web parts on the same page (user marks article as read in Sidebar, Dashboard still shows unread badge)
- Confusing UX where different web parts show contradictory information
- Higher SharePoint API throttling risk due to duplicate calls

**Prevention:**
- Implement a lightweight cross-web-part event bus using `CustomEvent` on `window` (or a shared singleton on `window.__wissensHub`). When one web part performs a mutation (mark-as-read, toggle favorite, approve), it dispatches a custom event that other web parts listen for and refetch relevant data
- Alternatively, use SPFx Dynamic Data (IDynamicDataSource) for the Application Customizer to consume data from the Dashboard web part. This is the "official" approach but has a significant learning curve
- For shared bootstrap data (current user, role), consider a shared initializer module that caches on `window` to avoid duplicate SharePoint calls
- Cache invalidation after mutations should trigger refetch in ALL web parts on the page, not just the one that performed the action
- The Application Customizer is a special case: it runs independently of web parts and MUST have its own lightweight data fetching, not depend on any web part being present

**Detection:** Place two WissensHub web parts on the same page. Perform an action in one (e.g., mark as read). Check if the other web part reflects the change without manual refresh. It will not, unless cross-web-part communication is implemented.

**Confidence:** HIGH -- fundamental SPFx architecture constraint, well-documented

**Phase relevance:** Must be designed in Phase 1 (architecture/shared services layer). Becomes visible when implementing Phase 2 (Dashboard + Article Sidebar on same page).

---

### Pitfall 5: Azure Functions Cold Start Delaying First User Interaction

**What goes wrong:** Azure Functions on the Consumption plan have cold starts of 5-15 seconds (sometimes longer for .NET isolated worker). The first user to open the Dashboard after a period of inactivity waits 10+ seconds for the unread count API call to complete. Combined with the SPFx web part initialization time and SharePoint page load, total time-to-interactive exceeds 15-20 seconds.

**Why it happens:** Consumption plan Azure Functions deallocate after ~20 minutes of inactivity. The .NET isolated worker model adds additional startup time because it runs in a separate process. EF Core initialization (model building, connection pooling) adds more time to the first request. The spec uses `.NET 10` with `Isolated Worker`, which has measurably slower cold starts than the in-process model.

**Consequences:**
- First user of the day sees loading spinners for 10-15 seconds on every API-dependent component
- Perceived as "the app is broken" rather than "it's starting up"
- Portfolio reviewers evaluating the project may hit cold starts and get a poor first impression

**Prevention:**
- Use Azure Functions **Premium plan (EP1)** instead of Consumption plan for always-warm instances. This costs ~$150/month but eliminates cold starts entirely. For a portfolio project, this may be overkill -- Consumption plan is fine with mitigations
- If using Consumption plan: implement the stale-while-revalidate pattern (already in the spec) so cached data shows immediately while the API warms up
- Show meaningful loading skeletons (already planned) with realistic shapes, not just spinners
- Consider adding a warmup endpoint (`GET /api/health`) and calling it from the CI/CD pipeline post-deployment
- Set `FUNCTIONS_WORKER_PROCESS_COUNT` appropriately (default 1 is fine for this project)
- In Bicep, if using Premium plan, configure `minimumElasticInstanceCount: 1` for always-ready instances

**Detection:** Open the Dashboard after not using the app for 30+ minutes. Measure time from page load to data appearing. If > 10 seconds, cold start is the cause.

**Confidence:** HIGH -- well-documented Azure Functions behavior, verified via official best practices (updated January 2026)

**Phase relevance:** Phase 1 (infrastructure decision) for hosting plan choice. Phase 2 (Dashboard) for UX mitigations. Can be deferred if Consumption plan is initially acceptable.

---

## Moderate Pitfalls

Issues that cause significant debugging time or suboptimal behavior but are recoverable.

### Pitfall 6: EF Core Migrations in Azure Functions Deployment Pipeline

**What goes wrong:** The CD pipeline runs `dotnet ef database update` against the production Azure SQL database as a separate step after deploying the Azure Functions code. If the migration adds a required column or changes a table schema, there is a window where the new code runs against the old schema (or vice versa), causing runtime exceptions. Additionally, `dotnet ef` CLI requires the project to be buildable at the migration path, which can fail if the pipeline checkout state is inconsistent.

**Why it happens:** The spec's CD pipeline deploys the Azure Functions code first, then runs migrations. This creates a race condition. EF Core migrations also require the `Microsoft.EntityFrameworkCore.Design` package to be installed, and the `dotnet-ef` tool version must match the EF Core version in the project.

**Prevention:**
- Run migrations BEFORE deploying the new Azure Functions code, not after. Change the pipeline dependency order so `deploy-migrations` runs before `deploy-api`
- Use idempotent migrations: `dotnet ef database update` is already idempotent, but ensure migration scripts handle the "column already exists" case gracefully
- For breaking schema changes, use a two-phase deployment: (1) add new column as nullable, deploy code that handles both old and new schema, (2) backfill data, make column required
- Pin the `dotnet-ef` tool version in a `.config/dotnet-tools.json` manifest file
- Test migrations locally against Azure SQL Edge (Docker) before deploying to production

**Detection:** Runtime exceptions like `Invalid column name` or `Cannot insert the value NULL into column` immediately after deployment. EF Core logs these clearly via ILogger.

**Confidence:** MEDIUM -- standard EF Core deployment pattern, but the specific ordering issue depends on pipeline execution timing

**Phase relevance:** Phase 5 (CI/CD setup). But migration ordering should be decided in Phase 1 when designing the pipeline architecture.

---

### Pitfall 7: PnPjs v4 Caching with Session Storage Limitations

**What goes wrong:** PnPjs v4's `Caching` behavior uses `sessionStorage` by default. In SharePoint Online, `sessionStorage` can be blocked by browser privacy settings, corporate group policies, or Safari's Intelligent Tracking Prevention. When `sessionStorage` is unavailable, PnPjs caching silently fails (no cache, no error), causing every page load to make full API calls.

**Why it happens:** PnPjs v4 does not throw when the cache store is unavailable -- it falls through to making the actual API call. Developers test in Chrome with default settings where `sessionStorage` works fine, but corporate environments often have stricter browser policies.

**Prevention:**
- Implement a fallback cache store: try `sessionStorage`, fall back to an in-memory Map. PnPjs v4's `Caching` behavior accepts a custom `store` parameter -- provide an adapter that handles the fallback
- Do NOT rely solely on PnPjs caching for throttle protection. The in-memory cache layer (Layer 2 in the spec) acts as the real throttle guard since it is always available
- Test with `sessionStorage` disabled in browser DevTools (Storage tab > clear and block)
- Monitor cache hit rates in Application Insights custom events

**Detection:** Unexpectedly high SharePoint API call volume in Application Insights despite caching being "configured." Check `sessionStorage` availability in browser DevTools console: `try { sessionStorage.setItem('test', '1'); } catch(e) { console.error('blocked'); }`.

**Confidence:** MEDIUM -- PnPjs documentation does not explicitly warn about this, but `sessionStorage` limitations are well-known in corporate environments

**Phase relevance:** Phase 2 (Dashboard service layer). Implement the fallback when setting up the `SharePointPageService`.

---

### Pitfall 8: SPFx Application Customizer Running on Every Page Load

**What goes wrong:** The Unread Badge Application Customizer executes on every single page navigation within the hub site. If it makes API calls (e.g., `GET /api/dashboard/stats` for unread count), each page navigation triggers a new request. Users clicking through multiple articles rapidly generate a burst of API calls, potentially hitting Azure Functions rate limits and SharePoint throttling.

**Why it happens:** Application Customizers are designed to run on every page. They are not page-specific like web parts. The customizer's `onInit()` runs on every full page load, and `onNavigatedAway()`/page lifecycle varies. In modern SharePoint, page-to-page navigation within a hub can be either full page loads or SPA-style navigations, making lifecycle management unpredictable.

**Prevention:**
- Cache the unread count aggressively: use an in-memory variable scoped to the customizer instance with a 60-second TTL. Only make an API call if the cache has expired
- Use the stale-while-revalidate pattern: show the cached count immediately, fetch fresh data in the background
- Debounce the API call with a 500ms delay to handle rapid SPA navigations
- Listen for custom events from web parts (see Pitfall 4) to update the count without an API call when the user marks an article as read
- Do NOT query SharePoint directly from the Application Customizer -- only call the Azure Functions API for the aggregated unread count

**Detection:** Open browser DevTools Network tab, navigate between several pages within the hub. Count the number of API calls from the customizer. If more than 1 per page, optimization is needed.

**Confidence:** HIGH -- fundamental Application Customizer behavior in SPFx

**Phase relevance:** Phase 3 (Application Customizer implementation). Design the caching strategy before writing the customizer code.

---

### Pitfall 9: SharePoint Site Pages Column Schema Conflicts

**What goes wrong:** The spec adds custom columns to the Site Pages library (Category, Status, TargetGroups, IsMandatory, Reviewer, ReviewByDate). SharePoint Site Pages is a special system library. Adding custom columns can conflict with existing internal columns, behave unexpectedly with Modern Page editing, or cause issues with SharePoint search indexing. Column internal names get auto-mangled (e.g., "Status" might become "Status0" if a hidden "Status" column already exists).

**Why it happens:** SharePoint's Site Pages library has many hidden system columns. The column internal name is set on creation and cannot be changed. If "Status" is taken (it often is by a hidden system column), SharePoint silently creates `OData__x0053_tatus0` or similar mangled internal name, but the display name shows "Status." PnPjs queries using the internal name, so code breaks.

**Prevention:**
- Prefix all custom columns with `WH_` (the spec already does this for `WH_Status`, `WH_IsMandatory` -- ensure ALL columns follow this convention)
- In the provisioning script, explicitly set both `DisplayName` and `InternalName` using `Add-PnPField -InternalName "WH_Category" -DisplayName "Category"`
- After provisioning, verify internal names by querying the field collection: `Get-PnPField -List "Site Pages" | Where-Object { $_.InternalName -like "WH_*" }`
- In PnPjs queries, always use the internal name, never the display name
- Consider using a SharePoint Content Type for WissensHub articles to encapsulate all custom columns cleanly

**Detection:** PnPjs queries return `undefined` for custom column values. Check the actual internal name via `_api/web/lists/getByTitle('Site Pages')/fields?$filter=Title eq 'Category'` -- compare `InternalName` vs `Title`.

**Confidence:** HIGH -- well-known SharePoint development issue

**Phase relevance:** Phase 1 (provisioning script). Getting column internal names right from the start prevents cascading issues in every subsequent phase.

---

### Pitfall 10: Data Consistency Between SharePoint and Azure SQL

**What goes wrong:** Article metadata exists in two places: SharePoint Site Pages (content, status column values, page URL) and Azure SQL (tracking data, read confirmations, flags, favorites). When an editor changes an article's status directly in SharePoint (e.g., editing the page properties), Azure SQL is not notified. The Dashboard shows stale status from Azure SQL while the actual page in SharePoint has a different status.

**Why it happens:** The spec's two-layer data architecture intentionally splits data between SharePoint and Azure SQL. But there is no real-time sync mechanism. SharePoint does not natively push change notifications to Azure SQL. The spec's `ArticleMetadata` table in SQL duplicates some SharePoint data (`Status`, `SharePointPageUrl`) which can drift.

**Prevention:**
- Treat SharePoint as the source of truth for content metadata (title, status, author, modified date) and Azure SQL as the source of truth for tracking data (read confirmations, flags, favorites, approval history)
- Do NOT store `Status` in Azure SQL's `ArticleMetadata` table -- query it from SharePoint via PnPjs at read time and join with Azure SQL data in the frontend. This eliminates the sync problem entirely
- If `Status` must be in Azure SQL for efficient queries (e.g., "all published articles with unread count"), implement a lightweight sync: when the Freigabecenter approves/rejects an article, the API call updates BOTH SharePoint column AND Azure SQL in the same user action
- Never allow status changes outside the application (e.g., directly editing SharePoint page properties). Use SharePoint column validation or read-only columns to prevent accidental manual changes
- Add a `LastSyncedAt` column to `ArticleMetadata` for debugging data freshness

**Detection:** An article shows "Published" in the Freigabecenter but "InReview" in the Article Sidebar, or vice versa. Compare the `WH_Status` column value in SharePoint with the `Status` column in `ArticleMetadata`.

**Confidence:** HIGH -- inherent challenge in any two-datasource architecture

**Phase relevance:** Phase 1 (data architecture decisions). This is an architectural decision that affects every feature phase.

---

## Minor Pitfalls

Issues that waste a few hours of debugging time but have straightforward fixes.

### Pitfall 11: SPFx Heft Build Errors with Path Aliases

**What goes wrong:** SPFx 1.22's Heft-based toolchain has different TypeScript path resolution than the old Gulp-based build. `paths` aliases in `tsconfig.json` (e.g., `@shared/*`) may not work out of the box, causing build failures with "Cannot find module" errors.

**Prevention:**
- Use relative imports initially. If path aliases are needed, configure them in both `tsconfig.json` AND the Heft configuration
- Test the build (`npm run build`) after adding any path alias configuration
- The Heft toolchain may require `@rushstack/heft-typescript-plugin` configuration for path mapping

**Detection:** `npm run build` fails with TypeScript module resolution errors. Imports compile in VS Code (which reads `tsconfig.json`) but fail during Heft build.

**Confidence:** MEDIUM -- Heft behavior with path aliases is not extensively documented for SPFx

**Phase relevance:** Phase 1 (project scaffolding). Decide on import strategy early.

---

### Pitfall 12: Docker Azure SQL Edge Differences from Azure SQL Database

**What goes wrong:** Azure SQL Edge (used in local Docker dev) is a subset of Azure SQL Database. Some T-SQL features available in Azure SQL Database are not available in Azure SQL Edge, including some CLR functions, Linked Servers, and certain advanced query hints. More importantly, Azure SQL Edge on ARM64 Macs (Apple Silicon) can have stability issues.

**Prevention:**
- Stick to standard T-SQL that works in both environments (the spec's schema uses only basic features, which is fine)
- Test EF Core migrations against both Azure SQL Edge locally AND Azure SQL Database in CI before deploying to production
- For Apple Silicon Macs, use the `mcr.microsoft.com/azure-sql-edge:latest` image which has ARM64 support. If stability issues persist, consider using the `mcr.microsoft.com/mssql/server:2022-latest` image with Rosetta emulation
- Do NOT use any SQL Server features beyond what Azure SQL Edge supports in migrations

**Detection:** EF Core migration applies locally but fails on Azure SQL Database (or vice versa). Docker container crashes or hangs on Apple Silicon.

**Confidence:** MEDIUM -- Azure SQL Edge limitations are documented but not exhaustively compared to Azure SQL Database

**Phase relevance:** Phase 1 (local dev environment setup).

---

### Pitfall 13: SPFx Bundle Size Explosion from Fluent UI v8

**What goes wrong:** Fluent UI v8 (`@fluentui/react`) is a monolithic package. Importing components like `import { Button } from '@fluentui/react'` pulls in the entire library tree, ballooning the SPFx bundle to 500KB+ and causing slow page loads.

**Prevention:**
- Use path-based imports: `import { PrimaryButton } from '@fluentui/react/lib/Button'` instead of `import { PrimaryButton } from '@fluentui/react'`
- This is explicitly recommended in Fluent UI v8 documentation for tree-shaking
- Run `npm run bundle -- --ship` and check the generated stats to verify bundle size
- Set up a bundle size budget in CI (fail if bundle exceeds threshold)

**Detection:** SPFx `*.sppkg` file is unusually large (> 1MB). Page load time is slow even with warm Azure Functions. Check `dist/` folder for bundle analysis.

**Confidence:** HIGH -- well-documented Fluent UI v8 best practice

**Phase relevance:** Phase 1 (project setup). Establish import conventions before writing any components.

---

### Pitfall 14: i18n String Key Mismatches Between German and English

**What goes wrong:** The spec requires German as default language with English as secondary. SPFx localization uses `loc/` folders with `mystrings.d.ts` type definitions and separate `.js` files per language. Missing keys in one language file cause runtime errors (undefined string) rather than build errors. Since German is the primary development language, English translations are often forgotten or have stale/missing keys.

**Prevention:**
- Define all string keys in the TypeScript declaration file (`mystrings.d.ts`) and treat it as the contract
- Write a build-time script that compares keys between `de-de.js` and `en-us.js` and fails the build if any keys are missing
- Or use a shared constants object and derive both language files from it
- Test the application in both languages during development, not just before release

**Detection:** Switching to English shows `undefined` or raw key names instead of translated text. Only visible when locale is changed.

**Confidence:** HIGH -- standard SPFx i18n pattern, common oversight

**Phase relevance:** Phase 2+ (any phase adding UI strings). Establish the validation script in Phase 1.

---

### Pitfall 15: Azure Functions `AuthorizationLevel.Anonymous` Misunderstood as "No Auth"

**What goes wrong:** The spec uses `AuthorizationLevel.Anonymous` on HTTP triggers, which developers (or code reviewers) interpret as "no authentication required." In reality, this just means no Azure Functions host key is required. Actual authentication is handled by the Entra ID bearer token validated in middleware. But if token validation middleware is misconfigured or missing, the endpoints are genuinely open to the internet.

**Prevention:**
- Add explicit middleware (or a MediatR pipeline behavior) that validates the Entra ID bearer token on every request
- Comment the `AuthorizationLevel.Anonymous` attribute clearly: "Anonymous to Functions host keys; auth via Entra ID bearer token in middleware"
- Add integration tests that verify unauthenticated requests return 401
- In the Bicep template, do NOT enable EasyAuth as a secondary auth layer if you're handling auth in code -- this creates the double-auth CORS problem (Pitfall 2)

**Detection:** Call any Azure Functions endpoint without a bearer token using `curl`. If it returns 200 instead of 401, token validation is missing.

**Confidence:** HIGH -- common Azure Functions misconception

**Phase relevance:** Phase 1 (API authentication setup).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Project Setup & Auth | AadHttpClient permission model (Pitfall 1) | Register Entra ID app, configure `webApiPermissionRequests`, document admin consent flow |
| Phase 1: Project Setup & Auth | CORS + Auth double config (Pitfall 2) | Configure CORS in Bicep, use code-level auth not EasyAuth, smoke test with real SP origin |
| Phase 1: Project Setup & Auth | Column name conflicts (Pitfall 9) | Prefix all columns with `WH_`, verify internal names after provisioning |
| Phase 1: Project Setup & Auth | Data consistency design (Pitfall 10) | Decide single source of truth per field, minimize data duplication across SP and SQL |
| Phase 1: Project Setup & Auth | Bundle size conventions (Pitfall 13) | Establish path-based Fluent UI imports from day one |
| Phase 1: Project Setup & Auth | Anonymous auth misunderstanding (Pitfall 15) | Implement Entra ID token validation middleware immediately |
| Phase 2: Dashboard | SharePoint throttling (Pitfall 3) | Batch PnPjs calls, decorate traffic, honor Retry-After |
| Phase 2: Dashboard | Cross-web-part state (Pitfall 4) | Implement event bus for cross-web-part communication |
| Phase 2: Dashboard | PnPjs cache fallback (Pitfall 7) | Implement sessionStorage fallback for PnPjs caching |
| Phase 2: Dashboard | Cold start UX (Pitfall 5) | Stale-while-revalidate, loading skeletons, warmup endpoint |
| Phase 3: Application Customizer | Per-page API calls (Pitfall 8) | Aggressive caching with TTL, debounce, event bus integration |
| Phase 4: Freigabecenter & Admin | Data sync on approval (Pitfall 10) | Update both SharePoint and Azure SQL in single user action |
| Phase 5: CI/CD & Deployment | Migration ordering (Pitfall 6) | Run migrations before deploying new code |
| Phase 5: CI/CD & Deployment | i18n completeness (Pitfall 14) | Build-time key comparison script |

---

## Sources

- [AadHttpClient / Connect to Entra ID-secured APIs -- Microsoft Learn](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient) (updated October 2025) -- HIGH confidence
- [Avoid getting throttled or blocked in SharePoint Online -- Microsoft Learn](https://learn.microsoft.com/en-us/sharepoint/dev/general-development/how-to-avoid-getting-throttled-or-blocked-in-sharepoint-online) (updated October 2025) -- HIGH confidence
- [Azure Functions best practices -- Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-functions/functions-best-practices) (updated January 2026) -- HIGH confidence
- [Configure function app settings / CORS -- Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings) (updated October 2025) -- HIGH confidence
- [SPFx Extensions overview -- Microsoft Learn](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/overview-extensions) (updated March 2026) -- HIGH confidence
- [SPFx Known Issues and FAQ -- Microsoft Learn](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/known-issues-and-common-questions) -- MEDIUM confidence (older page)
- SPFx architecture constraints (React tree isolation, web part independence) -- HIGH confidence (fundamental framework design)
- Azure SQL Edge vs Azure SQL Database feature comparison -- MEDIUM confidence (training data)
- Fluent UI v8 tree-shaking / path imports -- HIGH confidence (well-documented best practice)
