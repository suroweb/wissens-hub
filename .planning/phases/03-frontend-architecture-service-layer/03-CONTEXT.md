# Phase 3: Frontend Architecture & Service Layer - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the shared frontend architecture that all web parts consume: WissensHubContext (React Context composition root), service interfaces with dependency inversion, mock implementations for workbench development, production service stubs, Result<T> pattern, domain models, CQRS-lite hooks, role detection from SharePoint groups, and RoleGate component. No feature UI beyond architecture primitives — feature web parts are Phase 5+.

</domain>

<decisions>
## Implementation Decisions

### Folder naming & structure
- Rename `spfx/src/common/` to `spfx/src/shared/` to match the spec exactly
- Subfolder layout per spec: `interfaces/`, `services/` (+ `__mocks__/`), `models/` (`domain/`, `dto/`), `mappers/`, `hooks/` (`queries/`, `commands/`), `context/`, `utils/`, `components/`
- Barrel exports (index.ts) in each folder for clean imports
- Phase 3 creates only architecture primitive components (RoleGate) — feature-specific shared components (ArticleCard, SearchBar, StatusBadge, CategoryFilter, etc.) are built in Phase 5+ when features need them
- `utils/` folder created but left empty — permission helpers and formatting utilities deferred to feature phases

### Mock data & dev mode
- Mock data uses German sample content matching Phase 2 provisioning: categories (IT-Sicherheit, Datenschutz, Onboarding, Arbeitsprozesse, Compliance), realistic German article titles and content
- Mock data volume matches Phase 2 sample set: 8-10 articles covering all statuses (3-4 Published, 2 Draft, 1 InReview, 1 Archived, 1 flagged), 5 categories, 4 target groups, realistic read confirmation spread
- Mock vs production toggle: automatic environment detection — WissensHubContext checks if AadHttpClient is available. Available → production services. Not available (workbench) → mock services. Zero-config for the developer.
- Mock services simulate network latency (~300ms configurable delay) to test loading states and shimmer skeletons in the workbench

### Service scope boundary
- IPageService: build real SharePointPageService now (PnPjs only, no API dependency). Phase 5 Dashboard can immediately render real SharePoint pages.
- API-dependent services (ReadConfirmationService, FavoriteService, FlagService, ApprovalService): build interface + mock + real implementation. Real implementations delegate to IApiClient and are structurally complete, but need the working API from Phase 4.
- IApiClient: build real AzureApiClient wrapping AadHttpClient with Result<T> error handling, base URL config, and JSON parsing. MockApiClient for workbench.
- ArticleCategory modeled as dynamic `string` (not hardcoded union type) — categories are admin-configurable per ADMIN-01. Mock data uses the German categories from Phase 2.
- ArticleStatus remains a union type (`'Draft' | 'InReview' | 'Published' | 'Archived'`) — these are fixed workflow states, not configurable.

### Role detection
- Default to Reader when user is not in any WissensHub group — SharePoint site permissions already control page access, so if they're on the page they should see basic content
- Fall back to Reader on role detection failure (network error) — log the error, don't block the web part. Admin/reviewer features hidden by default.
- Role detection happens once on WissensHubContext initialization (first web part mount), cached in context state. All web parts on the page read from context — one API call per page load.
- Mock role configurable via web part property pane dropdown (Reader/Editor/Reviewer/Admin). Only visible when using mock services. Developer can switch roles instantly in the workbench.

### Claude's Discretion
- Exact mock data factory implementation details
- Internal structure of the service container initialization
- Error message wording for role detection failures
- Exact delay implementation for mock latency simulation
- Whether to use a single mock data module or per-service mock data files

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Clean Code
- `wissens-hub-spec.md` §"Clean Architecture & Clean Code Principles" — Complete frontend layer structure, dependency inversion rules, CQRS-lite hook patterns, Result pattern, QueryState/CommandState types, domain model vs DTO separation, service container via React Context
- `wissens-hub-spec.md` §"Architecture" — Full folder structure showing shared/ layout with all subfolders and files

### Role Model
- `wissens-hub-spec.md` §"Role Model" — 4 roles (Reader/Editor/Reviewer/Admin), SharePoint group mapping, WissensHubContext group membership check, RoleGate component usage, per-web-part role visibility rules

### Data Architecture
- `wissens-hub-spec.md` §"Data Architecture" — Two-layer data model (SharePoint for content, Azure SQL for tracking), API endpoints, table schemas

### Sample Data (for mock alignment)
- `.planning/phases/02-sharepoint-site-auth-pipeline/02-CONTEXT.md` §"Sample content & demo data" — 8-10 sample articles, German categories, target group names, status distribution

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 4 web parts (Dashboard, ArticleSidebar, Freigabecenter, AdminPanel) as functional React components — each needs WissensHubProvider wrapper
- DashboardWebPart.ts already creates AadHttpClient in onInit — pattern to replicate across all web parts for AzureApiClient
- Empty `spfx/src/common/` skeleton (to be renamed to `shared/`) with models/, services/, hooks/, components/ subfolders

### Established Patterns
- WebPart .ts classes stay as classes; React .tsx components are functional with hooks (Phase 1 decision)
- AadHttpClient obtained from `this.context.aadHttpClientFactory.getClient()` in WebPart onInit
- Fluent UI v8 imports: `import { Icon } from '@fluentui/react/lib/Icon'` (tree-shaking friendly)
- SCSS modules for component styling (Dashboard.module.scss pattern)

### Integration Points
- Each WebPart.ts render() must wrap its React component in WissensHubProvider
- AadHttpClient instance passed from WebPart class into the context/service container
- PnPjs sp instance needs initialization in WissensHubContext or WebPart onInit
- WebPart property pane needs "Mock Role" dropdown property for workbench development

</code_context>

<specifics>
## Specific Ideas

No specific requirements — user consistently chose the recommended/conventional option across all areas, indicating a preference for well-established patterns and consistency with the spec.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-frontend-architecture-service-layer*
*Context gathered: 2026-03-16*
