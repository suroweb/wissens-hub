# Phase 2: SharePoint Site & Auth Pipeline - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Provision the SharePoint Communication Site with custom columns, groups, navigation, and sample content. Register the Entra ID app for SPFx-to-Azure Functions authentication via AadHttpClient. Verify end-to-end auth with a smoke test. Feature web parts, service layer, and API logic are later phases.

</domain>

<decisions>
## Implementation Decisions

### Provisioning script design
- Modular with orchestrator: separate .ps1 files per concern (site, groups, columns, pages, navigation, sample data, Entra ID) with a main Deploy-WissensHub.ps1 that calls them in order
- Fully idempotent — each module checks if resources exist before creating. Safe to re-run after failures or when adding new resources
- Parameter file (config.json or .psd1) for tenant-specific values (tenant URL, admin UPN, group names). Gitignore-friendly for secrets
- Entra ID app registration included in the orchestrator as a module — not a separate script or manual step

### Sample content & demo data
- 8-10 sample articles covering all statuses: 3-4 Published, 2 Draft, 1 InReview, 1 Archived, 1 flagged as outdated
- Business-realistic German categories: IT-Sicherheit, Datenschutz, Onboarding, Arbeitsprozesse, Compliance
- Real-looking German article content with headings, lists, and paragraphs (e.g., "Passwort-Richtlinie" with actual password rules) — not lorem ipsum
- 3-4 target groups: Alle Mitarbeiter, IT-Abteilung, Management, Neue Mitarbeiter — mapped to corresponding SharePoint groups

### Hub site navigation
- Feature-based top navigation: Startseite (Dashboard), Wissensdatenbank (all articles), Freigabecenter (reviewers), Administration (admins)
- Dedicated Modern Pages per web part: Dashboard.aspx (home), Freigabecenter.aspx, Administration.aspx
- Dashboard page set as site home page — users land on the dashboard when visiting the hub
- Article pages use 2/3 + 1/3 column layout: article content left, Article Sidebar web part right
- All nav links visible to everyone; role-gated web parts handle visibility per role

### Entra ID & auth pipeline
- PnP PowerShell + Microsoft Graph for Entra ID app registration (same toolchain as SharePoint provisioning)
- Smoke test: Dashboard web part makes AadHttpClient call to /api/health on load, displays result — proves full auth chain
- After registration, provisioning script outputs app client ID and API scope URI to the parameter file for SPFx configuration
- Research-informed: AuthorizationLevel.Anonymous + in-code token validation on Azure Functions (avoids CORS + EasyAuth double-config)
- Research-informed: WH_ prefix on all custom SharePoint columns to avoid internal name mangling

### Claude's Discretion
- Single vs dual Entra ID app registration (user said "you decide" — pick based on AadHttpClient best practices)
- Exact column field types and configurations (Choice vs Managed Metadata, etc.)
- PowerShell module structure and naming conventions
- Sample article content topics and body text specifics
- Error handling verbosity in provisioning scripts

</decisions>

<specifics>
## Specific Ideas

- Categories should feel like a real German corporate knowledge base (IT-Sicherheit, Datenschutz, Onboarding, Arbeitsprozesse, Compliance)
- Sample articles need to be demo-ready for portfolio presentation — realistic content, not placeholders
- Target group names in German to match the enterprise context

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- SPFx solution with 4 web parts (Dashboard, ArticleSidebar, Freigabecenter, AdminPanel) and 1 Application Customizer (UnreadBadge) — all scaffolded as empty functional components
- Azure Functions project with Clean Architecture (Functions, Application, Domain, Infrastructure) — /api/health endpoint exists
- Docker Compose with SQL Server 2022 for local dev
- package-solution.json at spfx/config/ — needs webApiPermissionRequests added for Entra ID

### Established Patterns
- Side-by-side top-level folders: /spfx, /api, /docker — provisioning scripts go in /scripts (from Phase 1 decision)
- No class name prefixes: DashboardWebPart, not WissensHubDashboardWebPart
- EF Core code-first migrations for database schema
- SQL Server 2022 via Rosetta 2 with Colima --vz-rosetta

### Integration Points
- Dashboard web part will be modified for the auth smoke test (AadHttpClient call to /api/health)
- package-solution.json needs webApiPermissionRequests section for the Entra ID API scope
- Azure Functions /api/health endpoint is the smoke test target
- Parameter file outputs feed into SPFx and Azure Functions configuration

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-sharepoint-site-auth-pipeline*
*Context gathered: 2026-03-15*
