# Phase 9: Admin Panel & Reporting - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Administrators can configure the system (categories, target groups, reminder intervals) and generate compliance reports — all without developer intervention. The Admin Panel web part provides CRUD management for categories and target groups, a per-article read confirmation report with CSV/Excel export, and an article overview with status/freshness/flag metrics. This phase does NOT include email notification sending (RMND-02 covers configuring reminder intervals only — the actual email integration is a separate concern).

</domain>

<decisions>
## Implementation Decisions

### Panel layout & navigation
- Pivot tabs (horizontal), consistent with Freigabecenter pattern
- Four tabs: Kategorien, Zielgruppen, Berichte, Übersicht
- Default tab on load: Übersicht (overview first for status snapshot)
- Access control: RoleGate hides entire web part for non-admins — renders empty. Page-level permissions on Admin.aspx also restrict access.

### Category & target group CRUD
- Inline table editing using Fluent UI DetailsList with editable cells
- CommandBar above table with Hinzufügen (Add) and Löschen (Delete) actions
- Categories: edit Name, Description, IsActive inline
- Target groups: dropdown picker from SharePoint groups via PnPjs `sp.web.siteGroups()` — Name auto-fills from SP group name
- Soft delete for categories with articles: set IsActive=false, category disappears from new assignments but existing articles retain it
- Same soft delete pattern for target groups

### Reminder interval configuration
- Global setting, not per-category
- Single configurable interval (e.g., 7/14/30 days) for all mandatory articles
- Stored as a system configuration value in Azure SQL

### Read confirmation reports
- Per-article drill-down: list of articles with read % progress bars
- Click article to see who read (with date) and who hasn't
- "Who didn't read" determined by cross-referencing article's assigned target groups with SharePoint group members
- No date range filtering — show current state (who has/hasn't read right now)
- Export via CommandBar button above the report
- Exports currently viewed data (article summary list or drill-down user list)
- Format options: CSV and Excel as dropdown choices

### Article overview dashboard
- Summary stats cards at top: Total articles, Published, Draft, InReview, Flagged count
- Sortable DetailsList table below with columns: Title, Status, Category, Freshness, Flag count
- Content freshness: color-coded age indicator — Green (<30 days), Yellow (30-90 days), Red (>90 days since last update)
- Basic status filter dropdown (All, Published, Draft, InReview, Archived)
- Clicking an article row navigates to the SharePoint page in a new tab (consistent with Dashboard)

### Claude's Discretion
- Exact SCSS styling and spacing
- DetailsList column widths and responsive behavior
- Progress bar component choice/implementation
- Excel export library choice
- Error states and loading states within each tab
- Mock data for workbench testing

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Admin Panel requirements
- `.planning/REQUIREMENTS.md` — ADMIN-01 through ADMIN-06 and RMND-02 define the acceptance criteria
- `.planning/ROADMAP.md` — Phase 9 success criteria (5 criteria)

### Spec (source of truth)
- `wissens-hub-spec.md` — Section "5. Admin Panel (dedicated web part)" defines features; Role table defines admin capabilities

### Existing backend entities
- `api/src/WissensHub.Domain/Entities/Category.cs` — Category entity (Id, Name, Description, IsActive)
- `api/src/WissensHub.Domain/Entities/TargetGroup.cs` — TargetGroup entity (Id, Name, SharePointGroupName, IsActive)
- `api/src/WissensHub.Application/Interfaces/ICategoryRepository.cs` — Existing CRUD interface for categories and target groups
- `api/src/WissensHub.Functions/Functions/AdminFunctions.cs` — Stub admin endpoint at `GET /api/management/reports`
- `api/src/WissensHub.Application/Queries/GetAdminReports/AdminReportDto.cs` — Existing report DTO structure

### Frontend patterns (consistency references)
- `spfx/src/webparts/freigabecenter/components/Freigabecenter.tsx` — Pivot tabs pattern to follow
- `spfx/src/webparts/dashboard/components/ArticleListView.tsx` — DetailsList usage pattern
- `spfx/src/shared/utils/getCategoryColor.ts` — Category color assignment (must remain consistent)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `WissensHubProvider` / `useWissensHub()`: Context with role, user, services — already wired in AdminPanelWebPart.ts
- `RoleGate` component: Can guard admin-only rendering
- `Fluent UI Pivot`: Already used in Freigabecenter — same pattern
- `Fluent UI DetailsList`: Already used in Dashboard ArticleListView — same pattern
- `getCategoryColor()`: Shared utility for consistent category badge colors
- `ICategoryRepository`: Backend already has GetAllActive, Add, Update, Remove methods
- `AdminFunctions.cs`: Backend stub at `/api/management/reports` — needs real implementation
- `AdminReportDto`: Existing DTO with ArticleReportDto (PageId, Title, Status, Category, ReadCount, TargetUserCount, FlagCount, LastUpdated)
- `SharePointPageService`: PnPjs service for fetching pages — can be extended for group member lookups
- `IApiClient` / `AzureApiClient`: Service pattern for calling Azure Functions API

### Established Patterns
- Pivot tabs for multi-section web parts (Freigabecenter)
- DetailsList for tabular data (Dashboard list view)
- CommandBar for actions above lists
- Result<T> pattern for all service calls
- CQRS with MediatR for backend (commands for writes, queries for reads)
- Mock services for workbench development
- `window.open` for article navigation (new tab)

### Integration Points
- AdminPanelWebPart.ts: Already scaffolded with WissensHubProvider, AadHttpClient, mock role support
- Dashboard FilterBar: Consumes categories — CRUD changes must propagate (via API refresh)
- AdminFunctions.cs: Needs new endpoints for category CRUD, target group CRUD, and detailed read stats
- ICategoryRepository: Needs target group CRUD methods (currently only has category methods + GetAllActiveTargetGroupsAsync)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Follow existing patterns (Freigabecenter Pivot, Dashboard DetailsList, CommandBar actions).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 09-admin-panel-reporting*
*Context gathered: 2026-03-17*
