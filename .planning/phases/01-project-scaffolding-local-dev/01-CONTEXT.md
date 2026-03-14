# Phase 1: Project Scaffolding & Local Dev - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Get a developer running SPFx + Azure Functions + Azure SQL locally with a working database. Scaffold all web parts as empty shells, set up Clean Architecture .NET backend, create the database schema via EF Core migrations, and wire up Docker Compose for local SQL Edge. No feature code, no auth, no SharePoint provisioning — those are later phases.

</domain>

<decisions>
## Implementation Decisions

### Repository layout
- Side-by-side top-level folders: /spfx (SPFx solution), /api (.NET backend), /docker, /scripts, /infra, /.github, /.planning
- No shared types folder — SPFx defines its own TypeScript interfaces, API defines its own C# DTOs. HTTP interface is the contract.
- Top-level /scripts for PowerShell provisioning (Phase 2), /infra for Bicep (Phase 12), /docker for Docker Compose

### .NET backend structure
- Clean Architecture from day one: 4 projects under /api/src/
  - WissensHub.Functions (entry point, DI config)
  - WissensHub.Application (MediatR, CQRS — Phase 4 fills this in)
  - WissensHub.Domain (entities, enums)
  - WissensHub.Infrastructure (EF Core, repositories)
- Test project: /api/tests/WissensHub.Tests/
- Solution file: /api/WissensHub.sln

### SPFx scaffold scope
- Scaffold ALL 4 web parts + 1 Application Customizer as empty shells in Phase 1:
  - webparts: Dashboard, ArticleSidebar, Freigabecenter, AdminPanel
  - extensions: UnreadBadge (Application Customizer)
- Each scaffolded component converted to functional component with hooks immediately (INFRA-02)
- Minimal placeholder content: component name, Fluent UI icon, property pane title config — no feature code
- No prefix on class names: DashboardWebPart, ArticleSidebarWebPart (not WissensHubDashboardWebPart)

### SPFx folder structure
- Create empty common folder skeleton for Phase 3:
  - spfx/src/common/models/
  - spfx/src/common/services/
  - spfx/src/common/hooks/
  - spfx/src/common/components/

### Database schema
- 7 tables total (5 core + 2 admin config):
  - ArticleMetadata — tracking-only, NOT mirroring SharePoint page fields. Stores PageId, Status, CategoryId (FK), IsMandatory, ReviewById, ReviewByDate, ContentVersion, timestamps
  - ReadConfirmations — PageId (FK), UserId (Entra Object ID, nvarchar(36)), UserDisplayName, ReadDate, ContentVersion
  - ArticleFlags — flag-as-outdated data
  - Favorites — user favorites
  - ApprovalHistory — approval/rejection actions with ActionBy, ActionDate, Comment
  - Categories — admin-configurable article categories (included now for proper FK on ArticleMetadata.CategoryId)
  - TargetGroups — admin-configurable target groups mapped to SharePoint group names
- ArticleTargetGroups junction table for many-to-many (ArticleMetadataId + TargetGroupId composite PK)
- User identity: Entra Object ID (GUID string) as UserId across all tables, with UserDisplayName stored for reporting convenience
- SharePoint remains source of truth for page content (title, author, body) — Azure SQL only stores tracking/management data

### Local dev workflow
- Docker Compose runs Azure SQL Edge ONLY — SPFx and Azure Functions run natively on host
- Root package.json with convenience scripts: npm run dev (starts all), npm run db:up, npm run db:migrate, npm run spfx:serve, npm run api:start
- Uses concurrently package for npm run dev
- EF Core migrations are a manual step (npm run db:migrate / dotnet ef database update) — NOT auto-applied on startup
- First-time setup: docker compose up → db:migrate → dev

### Claude's Discretion
- Azure Functions local port assignment (likely 7071 default)
- SQL Edge container configuration details (SA password, container name)
- Exact EF Core entity configuration specifics (index strategies, cascade behaviors)
- SPFx solution name and package metadata
- .gitignore contents
- Root package.json exact concurrently configuration

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User consistently chose the recommended/conventional option across all areas, indicating a preference for well-established patterns over novel approaches.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project. Only wissens-hub-spec.md exists at root.

### Established Patterns
- None yet — Phase 1 establishes the foundational patterns that all subsequent phases build on.

### Integration Points
- SPFx workbench (localhost:4321) will be the primary frontend dev surface
- Azure Functions (/api/health endpoint) must be callable from SPFx once auth is set up (Phase 2)
- Docker Compose SQL Edge must be accessible from Azure Functions for EF Core connections

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-project-scaffolding-local-dev*
*Context gathered: 2026-03-14*
