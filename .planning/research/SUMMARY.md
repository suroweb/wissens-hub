# Project Research Summary

**Project:** WissensHub — SPFx Knowledge Management Solution
**Domain:** SharePoint-based Enterprise Knowledge Management with Azure Functions Backend
**Researched:** 2026-03-14
**Confidence:** HIGH (stack verified against official Microsoft docs; features/architecture MEDIUM on domain market data)

## Executive Summary

WissensHub is a purpose-built SPFx solution for German enterprise knowledge management, distinguishing itself from generic SharePoint KM setups through a compliance-focused feature set: read confirmations, mandatory article tracking, approval workflows, and exportable audit reports. The architecture is a two-layer system — SharePoint Modern Pages for content, Azure SQL for tracking/management data — with Azure Functions as the authenticated bridge. This split is essential: SharePoint's 5,000-item threshold and lack of relational queries make it unsuitable for tracking data, while Azure SQL provides the JOINs, aggregations, and audit-grade storage that compliance requirements demand.

The recommended build approach is inside-out: infrastructure and shared types first, then service interfaces with mock implementations so frontend and backend can develop in parallel, then feature web parts, then polish and DevOps. The Heft-based SPFx 1.22 toolchain, React 17.0.1 (SPFx-locked), and .NET 10 Isolated Worker are non-negotiable — any deviation from these versions risks silent runtime failures or end-of-support exposure. The stack has exactly one significant constraint: React 17 means no React 18 features (no concurrent rendering, no createRoot, no useId), which rules out several third-party libraries that require React 18+.

The top risks are authentication configuration complexity (AadHttpClient permission model requires SharePoint admin consent and is tenant-wide, not per-app), the CORS + Entra ID double-configuration trap that silently kills all API calls in production, and data consistency between the two data stores. All three must be resolved in Phase 1 before any feature work begins. Application Insights auto-tracking is a documented cost explosion risk — disabling it is mandatory. Cross-web-part React Context isolation is an architectural constraint that requires a custom event bus pattern to keep UI state coherent when multiple WissensHub web parts are placed on the same page.

## Key Findings

### Recommended Stack

The stack is locked per the project spec. Research confirms all version choices are correct and mutually compatible as of March 2026. SPFx 1.22.2 (latest stable, Jan 28 2026) requires Node 22 LTS exclusively and locks React to 17.0.1 exact. The Heft toolchain replaces Gulp entirely — all Gulp-based documentation is now outdated. Fluent UI v8 (`@fluentui/react`) is the only compatible UI library; v9 (`@fluentui/react-components`) requires React 18+ and will fail in this SPFx context.

On the backend, .NET 10 LTS + Azure Functions 4.x Isolated Worker is the correct path forward. The in-process model ends support November 10, 2026. The Isolated Worker requires `Microsoft.Azure.Functions.Worker >= 2.50.0` and `.Sdk >= 2.0.5` for .NET 10 compatibility. One infrastructure constraint: .NET 10 cannot run on Linux Consumption plan — Flex Consumption or App Service plan is required on Linux (Windows Consumption works fine).

**Core technologies:**
- **SPFx 1.22.2 + Node 22 LTS**: Frontend framework — latest stable, Heft toolchain, verified compatibility
- **React 17.0.1 (exact)**: UI library — SPFx-locked, use `--save-exact`, no v18 features available
- **Fluent UI v8 (`@fluentui/react`)**: Component library — SPFx-native, v9 incompatible with React 17
- **PnPjs v4 (`@pnp/sp`)**: SharePoint REST wrapper — type-safe, built-in caching, SPFx-integrated
- **TypeScript 5.8**: Language — default for SPFx 1.22 scaffold
- **.NET 10 LTS + C# 14**: Backend runtime — LTS until Nov 2028, ships with EF Core 10
- **Azure Functions 4.x Isolated Worker**: API host — only supported model for new development
- **EF Core 10**: ORM — ships with .NET 10, named query filters, improved LINQ join support
- **MediatR 12.x + FluentValidation 11.x**: CQRS + validation — industry-standard pipeline pattern
- **Azure SQL Database**: Production database — relational tracking data, avoids SharePoint list limits
- **Azure SQL Edge (Docker)**: Local dev database — SQL-compatible, ARM64 support
- **Azure Bicep**: IaC — Azure-native, first-party, compiles to ARM
- **PnP PowerShell**: Site provisioning — community standard for SharePoint setup
- **GitHub Actions**: CI/CD — PR validation and merge-to-main deployment
- **Jest (Heft-integrated)**: Frontend unit tests — native to SPFx 1.22 toolchain
- **Application Insights**: Telemetry — MUST disable auto-dependency tracking to avoid cost explosion

### Expected Features

**Must have (table stakes):**
- Article browsing/discovery with card and list views — core purpose
- Search across titles and content — users won't browse without search
- Category/tag filtering with admin-configurable taxonomy — knowledge without taxonomy is unusable
- Role-based access (Reader, Editor, Reviewer, Admin mapped to SharePoint Groups) — different users, different permissions
- Content authoring via SharePoint Modern Pages — leverages native rich editor, no custom editor needed
- Article metadata sidebar (category, author, date, status) — users need context
- Approval workflow (Draft → InReview → Published → Archived) — content governance
- Responsive design — device-agnostic layouts
- Loading states with Shimmer skeletons — professional UX feedback
- Error handling (Result pattern, Error Boundaries, toast notifications) — graceful failures
- Localization (German default, English secondary) — mandatory for German enterprise market

**Should have (differentiators):**
- Read confirmations with full tracking — the killer feature; most KM solutions lack this
- Mandatory article tracking (IsMandatory + unread badges) — ISO 9001 compliance
- Unread Badge Application Customizer in header — persistent notification across entire hub site
- Flagging outdated content with reviewer resolution workflow — user-driven content freshness
- Favorites toggle stored in Azure SQL — personal bookmarking
- Content freshness alerts in Freigabecenter — proactive content quality management
- Freigabecenter (approval center web part) — dedicated reviewer workspace
- Admin Panel for categories, target groups, reminder intervals — self-service configuration
- Exportable read confirmation reports (CSV/Excel) — audit evidence for compliance
- Target group distribution (assign articles to specific SharePoint groups) — audience segmentation
- Optimistic UI updates for mark-as-read and favorites — professional UX feel
- Multi-layer caching (PnPjs session, in-memory TTL, stale-while-revalidate) — performance against slow APIs
- Application Insights telemetry with cost-safe configuration — production observability
- Infrastructure as Code (Bicep) — reproducible deployments, portfolio DevOps signal
- CI/CD with GitHub Actions — professional development workflow
- PnP PowerShell provisioning script — one-command site setup

**Defer (never for this project):**
- Custom rich text editor — SharePoint Modern Pages already provide this
- Real-time chat/comments — not KM-relevant
- Video hosting — out of scope; link to Stream/YouTube
- Mobile app — responsive web is sufficient
- AI-powered search or recommendations — massive scope, not the point
- Email/push notifications — SharePoint native alerts cover this
- Custom version diff viewer — SharePoint version history handles this
- Workflow engine/designer — hardcoded 4-state flow is sufficient; Power Automate if needed later
- Multi-tenant support — single-tenant deployment per instance
- Offline/PWA mode — knowledge management requires current content

**Open questions noted in research (for spec owner review):**
1. Search scope: "title and content" search may require SharePoint Search API, not just PnPjs list item queries
2. Read confirmation reset: should article updates invalidate prior read confirmations (compliance re-read requirement)?
3. Reminder intervals: how are reminders delivered beyond the Unread Badge count?

### Architecture Approach

The architecture is a two-layer hub site solution: SharePoint Site Pages as the content store (leveraging the native rich editor), Azure SQL as the tracking/management store (read confirmations, favorites, flags, approval history), with Azure Functions as the authenticated bridge. Four SPFx web parts (Dashboard, Article Sidebar, Freigabecenter, Admin Panel) plus one Application Customizer (Unread Badge in header) share a common `WissensHubContext` (React Context) within each web part's isolated React tree. Cross-web-part coordination uses a `CustomEvent` event bus on `window` since React Context does not cross web part boundaries. The Azure Functions backend uses Clean Architecture: thin HTTP function endpoints dispatch to MediatR CQRS handlers, with domain entities, repository interfaces, and EF Core infrastructure layers. AadHttpClient (not MSAL) handles all SPFx-to-API authentication — this is the only supported approach in SPFx v1.4.1+.

**Major components:**
1. **Dashboard Web Part** — article card/list, filters, search, stats bar, unread badges; reads from both SharePoint (pages) and Azure Functions (tracking stats)
2. **Article Sidebar Web Part** — per-article metadata, mark-as-read, flag, favorite, TOC; deployed on individual article pages
3. **Freigabecenter Web Part** — reviewer workspace; pending approvals, flagged content, freshness alerts; all data from Azure Functions
4. **Admin Panel Web Part** — categories and target groups configuration, read confirmation reports; admin-only
5. **Unread Badge Application Customizer** — runs on every hub page, header placeholder, shows unread count + flyout; exactly one Azure Functions call per TTL window
6. **WissensHubContext + ServiceContainer** — composition root per web part; provides services, current user, role to all child components
7. **SharePoint Page Service (PnPjs v4)** — reads Site Pages library for article metadata; session-cached
8. **Azure API Client (AadHttpClient wrapper)** — typed, Result<T>-returning client for all Azure Functions calls
9. **Azure Functions API (MediatR CQRS)** — thin HTTP endpoints → MediatR commands/queries → EF Core repositories → Azure SQL
10. **Azure SQL Database** — source of truth for all tracking, management, and compliance data

**Key patterns:**
- `AadHttpClient` (never MSAL) for SPFx-to-API authentication
- `spfi().using(SPFx(context))` initialized in `onInit()`, never in constructor or component
- `window.CustomEvent` event bus for cross-web-part state sync
- `Result<T>` pattern on both TypeScript and C# sides for unified error handling
- `AuthorizationLevel.Anonymous` on Azure Functions triggers with Entra ID token validation in middleware
- Module-level singleton for CacheService, shared across web parts via import
- Path-based Fluent UI imports (`@fluentui/react/lib/Button`) to prevent bundle bloat

### Critical Pitfalls

1. **AadHttpClient permission model requires SharePoint admin consent** — `webApiPermissionRequests` in `package-solution.json` must use the app's `displayName` (not `objectId`); a SharePoint/Global Admin must approve in the Admin Center before any API call works; 401s are silent; removing the .sppkg does not revoke permissions. Address in Phase 1.

2. **CORS + Entra ID EasyAuth double configuration blocks all API calls** — preflight OPTIONS requests get rejected by the auth layer before CORS headers are added; use `AuthorizationLevel.Anonymous` on triggers with in-code bearer token validation, not EasyAuth; configure allowed CORS origins in Bicep parameterized by environment. Address in Phase 1 with smoke test against real SharePoint origin before any feature work.

3. **Application Insights auto-dependency tracking causes cost explosion** — SharePoint Online makes hundreds of background HTTP calls; auto-tracking logs every one; documented cases of thousands of dollars/month; MUST set `disableFetchTracking: true` and `disableAjaxTracking: true`; only track custom events and exceptions. Address at initialization time, not retrofitted.

4. **Multiple web parts on the same page have isolated React trees** — `WissensHubContext` does not cross web part boundaries; state mutations in one web part (mark as read in Sidebar) are invisible to another (Dashboard still shows old badge); solution is a `window.CustomEvent` event bus + module-level CacheService singleton; also causes duplicate SharePoint/API calls per web part instance. Must be designed in Phase 1, visible from Phase 2 onward.

5. **SharePoint custom column name collisions in Site Pages library** — system hidden columns (including "Status") can cause SPFx to silently create mangled internal names (`OData__x0053_tatus0`); all custom columns MUST be prefixed `WH_` with explicit `InternalName` set at provisioning time; PnPjs queries must use internal names. Address in Phase 1 provisioning script.

6. **Data consistency between SharePoint and Azure SQL** — article metadata lives in both stores; direct SharePoint edits outside the app will not sync to Azure SQL; treat SharePoint as source of truth for content metadata, Azure SQL as source of truth for tracking data; approval actions must update BOTH stores atomically in a single user-triggered operation. Architectural decision for Phase 1.

7. **Azure Functions cold starts on Consumption plan** — .NET 10 Isolated Worker has 5–15s cold starts; mitigate with stale-while-revalidate (already specced), Shimmer skeletons, and a `/api/health` warmup endpoint in CI/CD post-deployment. Premium plan (EP1, ~$150/month) eliminates cold starts if budget allows.

## Implications for Roadmap

Based on dependency analysis in FEATURES.md and ARCHITECTURE.md build order, plus Phase 1 requirements from PITFALLS.md, the following phase structure is recommended:

### Phase 1: Foundation, Auth, and Infrastructure

**Rationale:** Every single feature depends on this. Azure SQL and Azure Functions must exist before any tracking feature works. SharePoint site, groups, and custom columns must exist before any web part can be tested. The auth flow (AadHttpClient + Entra ID + admin consent) must be validated end-to-end before any feature integration begins. Column naming and data architecture decisions made here propagate through every subsequent phase.

**Delivers:** Working local dev environment (Docker SQL Edge), SPFx solution scaffold (Heft toolchain), Azure Functions skeleton with health endpoint, EF Core DbContext with initial migration, Entra ID app registration, provisioning script (PnP PowerShell), domain interfaces and models (TypeScript + C#), shared infrastructure types (Result<T>, AsyncState, AppError), CORS + auth smoke-tested against real SharePoint origin.

**Addresses:** Project scaffolding, database schema, Entra ID app setup, SharePoint site and custom columns

**Avoids:** Pitfalls 1 (AadHttpClient consent), 2 (CORS + auth), 9 (column name collisions), 10 (data architecture), 13 (bundle size conventions), 15 (anonymous auth misunderstanding)

**Research flag:** Standard patterns — well-documented by Microsoft. No phase-specific research needed.

### Phase 2: Service Layer and Dashboard (Read Path)

**Rationale:** Frontend and backend can develop in parallel once interfaces are defined. Mock services unblock UI development without a running API. The Dashboard is the "front door" — demonstrates the core browsing + search + filtering value before any write operations exist. Gets the most complex multi-API data merge working early.

**Delivers:** SharePoint Page Service (PnPjs v4 with session cache), AzureApiClient (AadHttpClient wrapper, Result<T>), mock service implementations for local dev, Azure Functions CRUD endpoints for stats and unread data, WissensHubContext + ServiceContainer, Dashboard Web Part (article cards, filters, search, stats bar), unread badge indicators.

**Uses:** PnPjs v4, AadHttpClient, MediatR GetDashboardStatsQuery, EF Core read queries, Fluent UI v8 components (path imports)

**Implements:** SharePoint Page Service, Azure API Client, WissensHubContext, Dashboard Web Part

**Avoids:** Pitfalls 3 (throttling — batch PnPjs calls, honor Retry-After), 4 (cross-web-part state — implement event bus), 5 (cold start UX — Shimmer + stale-while-revalidate), 7 (PnPjs cache fallback)

**Research flag:** Standard patterns — PnPjs and AadHttpClient patterns are well-documented. No phase-specific research needed.

### Phase 3: Article Sidebar, Read Confirmations, and Application Customizer

**Rationale:** Once browsing works, add the core interaction: reading and confirming articles. The Article Sidebar is the primary write-path entry point. The Unread Badge Application Customizer is a visible portfolio differentiator that demonstrates breadth (web parts + extensions). Optimistic UI for mark-as-read belongs here alongside the core confirmation flow.

**Delivers:** Article Sidebar Web Part (metadata display, mark-as-read, flag, favorite, TOC), Unread Badge Application Customizer (header badge, flyout, 60s TTL cache), read confirmation write path (MarkAsReadCommand, FlagCommand, FavoriteCommand in Azure Functions), optimistic UI updates with rollback on failure, cross-web-part event bus integration.

**Uses:** AzureApiClient (post endpoints), MediatR commands, EF Core write operations, Application Customizer lifecycle (PlaceholderName.Top)

**Implements:** Article Sidebar Web Part, Unread Badge Application Customizer, write-path Azure Functions handlers

**Avoids:** Pitfalls 4 (cross-web-part sync — event bus tested here with Dashboard + Sidebar on same page), 8 (Application Customizer per-page API calls — 60s TTL + debounce)

**Research flag:** Application Customizer placeholder lifecycle may need validation. Cross-web-part event bus pattern is documented but has edge cases worth verifying.

### Phase 4: Approval Workflow and Freigabecenter

**Rationale:** Content governance (approval workflow) is table stakes for any managed knowledge base. The Freigabecenter is the reviewer workspace and bundles pending approvals, flagged content, and freshness alerts into one web part. The approval action (transition status) must update both SharePoint and Azure SQL atomically — the data consistency pitfall manifests here.

**Delivers:** Freigabecenter Web Part (pending approvals list, flagged articles, freshness alerts, approve/reject with comments), approval workflow Azure Functions endpoints (ApproveDraftCommand, RejectDraftCommand, ResolveFlagCommand), dual-store update pattern (SharePoint column + Azure SQL in single user action), Freigabecenter role guard (Reviewer/Admin only).

**Uses:** PnPjs (update Site Pages column), AzureApiClient (approval commands), MediatR, EF Core, Fluent UI DetailsList

**Implements:** Freigabecenter Web Part, approval command handlers

**Avoids:** Pitfall 10 (data consistency — dual-store update implemented atomically in this phase)

**Research flag:** Approval workflow is a standard 4-state machine — no research needed. Dual-store update ordering (which store first on failure?) worth validating with the spec owner.

### Phase 5: Admin Panel and Target Groups

**Rationale:** Admin configuration (categories, target groups) is a dependency of the dashboard filters and article assignment, but its absence doesn't break core functionality — the provisioning script can seed initial values. The Admin Panel and exportable reports are admin-only features that can be built once the read and write paths are stable.

**Delivers:** Admin Panel Web Part (categories CRUD, target groups CRUD, reminder interval config), read confirmation reports with CSV/Excel export, target group assignment on articles, dashboard filter by target group.

**Uses:** Azure Functions admin endpoints (GetAdminConfigQuery, UpdateCategoryCommand, etc.), EF Core admin queries, CSV generation in .NET, Admin role guard

**Implements:** Admin Panel Web Part, admin Azure Functions handlers, report generation

**Avoids:** N/A (no new pitfalls introduced; inherits Phase 1-4 mitigations)

**Research flag:** CSV/Excel export in Azure Functions isolated worker — standard .NET; no research needed.

### Phase 6: Caching, Telemetry, and Error Handling Polish

**Rationale:** Caching layers (in-memory TTL, stale-while-revalidate), Application Insights telemetry (custom events only, cost-safe), comprehensive error handling (Error Boundaries, toast notifications, retry logic), and PnPjs sessionStorage fallback are polish that improve production quality and portfolio signal. These should be retrofitted once features are stable rather than premature-optimized.

**Delivers:** Full 3-layer caching (PnPjs session, in-memory TTL, stale-while-revalidate), Application Insights integration with cost-safe config (disableFetchTracking, disableAjaxTracking), Error Boundaries on all web parts, toast notification system, PnPjs sessionStorage fallback cache adapter, bundle size audit (path-based Fluent UI imports verified).

**Avoids:** Pitfall 3 (throttling mitigation complete), Pitfall 5 (cold start UX complete), Application Insights cost explosion (Pitfall in STACK.md + ARCHITECTURE.md)

**Research flag:** Standard patterns — no research needed.

### Phase 7: Testing, CI/CD, and DevOps

**Rationale:** Testing and CI/CD are deferred until features are stable to avoid test churn. GitHub Actions CI/CD, Bicep IaC, and comprehensive test coverage are portfolio-signal deliverables. EF Core migration ordering (migrations run before new code deployment) must be implemented here.

**Delivers:** Jest unit tests (Heft-integrated, web parts and hooks), .NET integration tests (xUnit + EF Core against Azure SQL Edge), Playwright E2E tests, GitHub Actions CI pipeline (PR validation), GitHub Actions CD pipeline (merge to main), Azure Bicep modules (all Azure resources parameterized by environment), i18n completeness validation script (German vs English key comparison), EF Core migration-first deployment ordering.

**Uses:** Jest (SPFx Heft-integrated), Playwright, xUnit, GitHub Actions, Bicep, PnP PowerShell (provisioning)

**Avoids:** Pitfall 6 (migration ordering — migrations before code deployment), Pitfall 14 (i18n completeness — build-time key check)

**Research flag:** Playwright + SPFx workbench integration may need research. Standard CI/CD and Bicep patterns are well-documented.

### Phase Ordering Rationale

- **Auth and infrastructure first** because the entire solution is gated on Entra ID admin consent — discovering this issue in Phase 5 is project-ending; discovering it in Phase 1 is a morning's work.
- **Read path before write path** because browsing (Dashboard) is the core user journey and demonstrates the two-layer data architecture; write operations (mark-as-read, approve) layer on top.
- **Application Customizer in Phase 3** (not Phase 6) because it is a portfolio differentiator that demonstrates SPFx extensions, not just web parts; it should be demonstrated early.
- **Admin Panel in Phase 5** because it depends on stable read/write paths and the provisioning script seeds enough initial data to unblock earlier phases.
- **DevOps in Phase 7** because building tests against a moving codebase is inefficient; CI/CD is meaningful once features are stable.
- **Cross-web-part event bus** must be designed in Phase 1 and implemented in Phase 2, even though it is not visibly tested until Phase 3 when Dashboard and Sidebar are both present.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Application Customizer):** Placeholder lifecycle and `changedEvent` behavior in modern SharePoint SPA navigation has nuances not fully covered in official docs. The cross-web-part CustomEvent pattern should be prototyped early.
- **Phase 7 (Playwright + SPFx):** Testing SPFx web parts in the SharePoint workbench with Playwright requires specific setup; community documentation is sparse.

Phases with standard patterns (skip research-phase):
- **Phase 1:** SPFx scaffold, Azure Functions init, EF Core setup — fully documented by Microsoft.
- **Phase 2:** PnPjs v4 data fetching, AadHttpClient wrapper — extensively documented with official examples.
- **Phase 4:** MediatR CQRS approval workflow — industry-standard .NET pattern.
- **Phase 5:** Admin CRUD, CSV export — standard patterns.
- **Phase 6:** Application Insights custom events, Fluent UI tree-shaking — well-documented best practices.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against official Microsoft docs as of March 2026. SPFx 1.22.2 compatibility matrix confirmed. .NET 10 isolated worker package versions confirmed. |
| Features | MEDIUM | Feature categorizations based on training data domain knowledge; web search unavailable for 2026 market verification. The spec itself (authoritative) was used as primary reference. |
| Architecture | HIGH | All patterns verified via official Microsoft docs (AadHttpClient, PnPjs with SPFx, Application Customizer lifecycle, Azure Functions isolated worker). Fundamental SPFx constraints (React tree isolation, constructor unavailability) are framework facts. |
| Pitfalls | HIGH | Most pitfalls verified via official documentation. CORS + EasyAuth, throttling, Fluent UI tree-shaking, and AadHttpClient permission model all confirmed. Two pitfalls (Pitfall 7 PnPjs sessionStorage, Pitfall 12 Azure SQL Edge ARM64) rated MEDIUM due to limited official documentation. |

**Overall confidence:** HIGH

### Gaps to Address

- **Search implementation scope:** The spec says "search across page titles and content." PnPjs list item queries only search metadata columns, not page body content. If full-text search of article body is required, the SharePoint Search API (`_api/search/query`) or Microsoft Graph Search API must be used. This affects Phase 2 Dashboard design. Clarify with spec owner before implementing search.

- **Read confirmation reset on article update:** If an article is significantly updated after a user confirmed it, should the confirmation be invalidated? The `ReadConfirmations.ReadDate` and `ArticleMetadata.UpdatedAt` timestamps support this comparison, but the logic is unspecced. This affects the compliance value proposition. Clarify with spec owner before implementing read confirmations.

- **Reminder delivery mechanism:** The Admin Panel configures "reminder intervals" but how reminders are delivered (in-app badge only? email? timed notifications?) is unspecced. Clarify with spec owner before implementing Admin Panel.

- **Azure Functions hosting plan:** Consumption vs. Flex Consumption vs. Premium EP1 is an unresolved infrastructure decision. Consumption plan cold starts (~5–15s for .NET 10 isolated worker) may be acceptable for portfolio use with UX mitigations; Premium plan (~$150/month) eliminates the problem. Decide in Phase 1.

- **MediatR and FluentValidation exact versions:** npm/NuGet versions for MediatR 12.x and FluentValidation 11.x were inferred from training data; web package registries were unavailable. Verify latest patch versions before scaffolding the backend.

- **PnPjs v4 exact minor version:** `@pnp/sp` v4.x latest minor was not confirmed via npm. Check `npm show @pnp/sp version` after scaffolding.

## Sources

### Primary (HIGH confidence)
- [SPFx 1.22.2 Release Notes](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/release-1.22.2) — stack versions, Heft toolchain
- [SPFx Compatibility Matrix](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility) (updated Mar 11, 2026) — Node 22, React 17, TypeScript 5.8
- [SPFx Heft Toolchain](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/sharepoint-framework-toolchain-rushstack-heft) — Heft replaces Gulp details
- [Connect to Entra ID-secured APIs (AadHttpClient)](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient) (updated Oct 2025) — auth patterns, MSAL prohibition, permission model
- [Consume Enterprise APIs with AadHttpClient](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient-enterpriseapi) (updated Mar 5, 2026) — webApiPermissionRequests, tenant-wide consent
- [Use PnPjs with SPFx Web Parts](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/use-sp-pnp-js-with-spfx-web-parts) (updated Jan 2, 2026) — PnPjs initialization pattern
- [Build First SPFx Extension (Application Customizer)](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/build-a-hello-world-extension) (updated Jan 15, 2026) — customizer lifecycle, placeholder rendering
- [Azure Functions .NET Isolated Worker Guide](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide) (updated Mar 5, 2026) — .NET 10 package versions, FunctionsApplication.CreateBuilder
- [.NET 10 Overview](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-10/overview) (updated Jan 23, 2026) — runtime, C# 14 features
- [EF Core 10 What's New](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-10.0/whatsnew) (updated Jan 22, 2026) — named query filters, LeftJoin LINQ
- [Avoid SharePoint Throttling](https://learn.microsoft.com/en-us/sharepoint/dev/general-development/how-to-avoid-getting-throttled-or-blocked-in-sharepoint-online) (updated Oct 2025) — rate limits, Retry-After, traffic decoration
- [Azure Bicep Overview](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview) (updated Jan 8, 2026) — IaC choice rationale
- [Azure Functions Best Practices](https://learn.microsoft.com/en-us/azure/azure-functions/functions-best-practices) (updated Jan 2026) — cold start mitigations
- WissensHub spec (wissens-hub-spec.md) — authoritative source for all feature and architectural decisions

### Secondary (MEDIUM confidence)
- Training data knowledge of SharePoint Framework, enterprise KM patterns, Microsoft 365 ecosystem — feature categorization, competitive landscape
- Domain knowledge of ISO 9001 quality management requirements for read confirmations in German enterprise environments — business context
- PnPjs v4 documentation (training data) — sessionStorage caching behavior, fallback patterns
- Azure SQL Edge vs Azure SQL Database feature comparison (training data) — local dev considerations

### Tertiary (LOW confidence)
- MediatR 12.x and FluentValidation 11.x version numbers — inferred from training data, not confirmed via NuGet; verify before use
- PnPjs v4 exact latest minor version — not confirmed via npm registry; verify before use

---
*Research completed: 2026-03-14*
*Ready for roadmap: yes*
