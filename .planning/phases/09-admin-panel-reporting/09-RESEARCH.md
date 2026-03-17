# Phase 9: Admin Panel & Reporting - Research

**Researched:** 2026-03-17
**Domain:** SPFx Admin UI (CRUD tables, reporting, Excel export), Azure Functions API (admin endpoints, CQRS)
**Confidence:** HIGH

## Summary

Phase 9 builds the Admin Panel web part -- a Pivot-tabbed interface (Kategorien, Zielgruppen, Berichte, Ubersicht) that lets administrators manage categories and target groups via inline-editable DetailsLists, view per-article read confirmation reports with drill-down, and see an article overview dashboard. The backend requires new CQRS commands/queries for category CRUD, target group CRUD, a SystemConfiguration entity for reminder intervals, and real implementations for the existing stub admin reports handler.

The codebase already has strong foundations: AdminPanelWebPart.ts is scaffolded with WissensHubProvider/AadHttpClient, Category and TargetGroup entities exist with EF Core configurations, ICategoryRepository has partial CRUD methods, AdminFunctions.cs has a stub endpoint, and the Freigabecenter Pivot pattern is the exact template for the tab layout. The main new technical domains are: (1) inline-editable DetailsList for CRUD, (2) ExcelJS for browser-side .xlsx export, (3) PnPjs siteGroups for target group picker, and (4) a new SystemConfiguration entity for reminder intervals.

**Primary recommendation:** Follow the Freigabecenter Pivot + Dashboard DetailsList patterns exactly. Use ExcelJS 4.4.0 for Excel export (browser-side, no server involvement). Extend ICategoryRepository with target group CRUD methods and add a new ISystemConfigurationRepository for reminder interval settings.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Pivot tabs (horizontal), consistent with Freigabecenter pattern
- Four tabs: Kategorien, Zielgruppen, Berichte, Ubersicht
- Default tab on load: Ubersicht (overview first for status snapshot)
- Access control: RoleGate hides entire web part for non-admins -- renders empty. Page-level permissions on Admin.aspx also restrict access.
- Inline table editing using Fluent UI DetailsList with editable cells
- CommandBar above table with Hinzufugen (Add) and Loschen (Delete) actions
- Categories: edit Name, Description, IsActive inline
- Target groups: dropdown picker from SharePoint groups via PnPjs sp.web.siteGroups() -- Name auto-fills from SP group name
- Soft delete for categories with articles: set IsActive=false, category disappears from new assignments but existing articles retain it
- Same soft delete pattern for target groups
- Global reminder interval setting (not per-category), single configurable interval (7/14/30 days) for all mandatory articles, stored in Azure SQL
- Per-article drill-down: list of articles with read % progress bars
- Click article to see who read (with date) and who hasn't
- "Who didn't read" determined by cross-referencing article's assigned target groups with SharePoint group members
- No date range filtering -- show current state
- Export via CommandBar button above the report
- Exports currently viewed data (article summary list or drill-down user list)
- Format options: CSV and Excel as dropdown choices
- Summary stats cards at top: Total articles, Published, Draft, InReview, Flagged count
- Sortable DetailsList table below with columns: Title, Status, Category, Freshness, Flag count
- Content freshness: color-coded age indicator -- Green (<30 days), Yellow (30-90 days), Red (>90 days since last update)
- Basic status filter dropdown (All, Published, Draft, InReview, Archived)
- Clicking an article row navigates to the SharePoint page in a new tab

### Claude's Discretion
- Exact SCSS styling and spacing
- DetailsList column widths and responsive behavior
- Progress bar component choice/implementation
- Excel export library choice
- Error states and loading states within each tab
- Mock data for workbench testing

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ADMIN-01 | Admin can add, edit, and remove article categories | Inline-editable DetailsList with CommandBar CRUD. Backend: new CreateCategory, UpdateCategory, DeleteCategory commands via CQRS + ICategoryRepository methods already exist |
| ADMIN-02 | Admin can configure target groups (select from SharePoint groups) | PnPjs `sp.web.siteGroups()` for dropdown picker. Backend: new target group CRUD commands, extend ICategoryRepository or create ITargetGroupRepository |
| ADMIN-03 | Admin can configure reminder intervals | New SystemConfiguration entity + EF migration. New CQRS query/command for get/set. Single global integer value (days) |
| ADMIN-04 | Admin can view read confirmation report per article (who read, who didn't, when) | Existing ReadStatsDto has UserReadStatusDto with HasRead/ReadDate. Frontend: drill-down UI from article list to user list. Backend: GetAdminReports handler needs real implementation |
| ADMIN-05 | Admin can export read confirmation reports (CSV/Excel) | ExcelJS 4.4.0 for .xlsx generation, native CSV via Blob. Client-side export of currently displayed data |
| ADMIN-06 | Admin can see overview of all articles by status, freshness, and flag count | Existing AdminReportDto with ArticleReportDto has all needed fields. Backend needs real implementation. Frontend: stats cards + sortable DetailsList |
| RMND-02 | Email notifications sent for overdue mandatory articles (configurable intervals) | This phase covers the "configurable intervals" part only (admin UI + storage). Actual email sending is out of scope for Phase 9 |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @fluentui/react | ^8.106.4 | Pivot, DetailsList, CommandBar, ProgressIndicator, Dropdown | Already in project; SPFx 1.22.2 standard |
| @pnp/sp | 4.18.0 | SharePoint group lookup for target group picker | Already in project; siteGroups import already registered |
| ExcelJS | 4.4.0 | Browser-side .xlsx file generation | MIT, 3M+ weekly downloads, browser bundle included, no Node.js fs dependency |
| file-saver | 2.0.5 | Trigger browser download of generated Blob | Standard companion for ExcelJS browser export |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/file-saver | 2.0.7 | TypeScript types for file-saver | Development dependency |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ExcelJS | SheetJS (xlsx) | SheetJS has known CVEs; community edition is limited; ExcelJS has better styling/formatting support and no security concerns |
| file-saver | Native `<a>` download | file-saver handles IE/Edge quirks and Content-Disposition; minimal size (2KB) |
| Client-side export | Server-side export endpoint | Unnecessary complexity; data already on client; no large datasets (admin panel, not analytics) |

**Installation:**
```bash
cd spfx && npm install exceljs file-saver && npm install --save-dev @types/file-saver
```

**Version verification:** ExcelJS 4.4.0 verified via npm registry (2026-03-17). file-saver 2.0.5 verified. @types/file-saver 2.0.7 verified.

## Architecture Patterns

### Recommended Project Structure
```
spfx/src/webparts/adminPanel/
  components/
    AdminPanel.tsx            # Main component with Pivot tabs, RoleGate guard
    AdminPanel.module.scss    # Shared styles (extend existing)
    IAdminPanelProps.ts       # Props interface (extend existing)
    KategorienTab.tsx         # Category CRUD tab
    ZielgruppenTab.tsx        # Target group CRUD tab
    BerichteTab.tsx           # Reports tab (article list with drill-down)
    ReadReportDrilldown.tsx   # Per-article user read status detail
    UebersichtTab.tsx         # Overview dashboard tab
    StatsCards.tsx             # Summary stats cards component
    ExportButton.tsx          # CSV/Excel export CommandBar button

spfx/src/shared/
  interfaces/
    IAdminService.ts          # New service interface for admin operations
  services/
    AdminService.ts           # Production admin service (API calls)
    __mocks__/
      MockAdminService.ts     # Mock admin service for workbench
      mockData.ts             # Extend with admin mock data
  hooks/
    queries/
      useAdminReportsQuery.ts    # Query hook for admin reports
      useCategoriesQuery.ts      # Query hook for all categories (incl inactive)
      useTargetGroupsQuery.ts    # Query hook for all target groups
      useReminderConfigQuery.ts  # Query hook for reminder interval
    commands/
      useSaveCategoryCommand.ts  # Create/update category
      useDeleteCategoryCommand.ts
      useSaveTargetGroupCommand.ts
      useDeleteTargetGroupCommand.ts
      useUpdateReminderConfigCommand.ts
  utils/
    exportUtils.ts            # CSV/Excel export helper functions

api/src/WissensHub.Domain/Entities/
    SystemConfiguration.cs    # New entity for key-value config storage

api/src/WissensHub.Application/
  Interfaces/
    ITargetGroupRepository.cs     # New repo interface (split from ICategoryRepository)
    ISystemConfigurationRepository.cs  # New repo interface
  Commands/
    CreateCategory/               # New CQRS command
    UpdateCategory/               # New CQRS command
    DeleteCategory/               # New CQRS command (soft delete)
    CreateTargetGroup/            # New CQRS command
    UpdateTargetGroup/            # New CQRS command
    DeleteTargetGroup/            # New CQRS command (soft delete)
    UpdateReminderInterval/       # New CQRS command
  Queries/
    GetAllCategories/             # New query (includes inactive for admin)
    GetAllTargetGroups/           # New query (includes inactive for admin)
    GetReminderInterval/          # New query
    GetAdminReports/              # Existing -- needs real implementation
    GetDetailedReadStats/         # New query for per-article drill-down with target group cross-ref

api/src/WissensHub.Functions/Functions/
    AdminFunctions.cs             # Extend with new endpoints
```

### Pattern 1: Pivot Tabs (from Freigabecenter)
**What:** Horizontal Pivot component with tab components as children
**When to use:** Multi-section web parts
**Example:**
```typescript
// Source: spfx/src/webparts/freigabecenter/components/Freigabecenter.tsx
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';

<Pivot defaultSelectedKey="uebersicht">
  <PivotItem headerText="Ubersicht" itemKey="uebersicht" itemIcon="ViewDashboard">
    <UebersichtTab />
  </PivotItem>
  <PivotItem headerText="Kategorien" itemKey="kategorien" itemIcon="Tag">
    <KategorienTab />
  </PivotItem>
  <PivotItem headerText="Zielgruppen" itemKey="zielgruppen" itemIcon="Group">
    <ZielgruppenTab />
  </PivotItem>
  <PivotItem headerText="Berichte" itemKey="berichte" itemIcon="ReportDocument">
    <BerichteTab />
  </PivotItem>
</Pivot>
```

### Pattern 2: Inline-Editable DetailsList
**What:** DetailsList with text fields / dropdowns rendered in cells for inline editing
**When to use:** CRUD tables where modal dialogs are overkill
**Example:**
```typescript
// Source: Fluent UI v8 DetailsList documentation
import { DetailsList, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';

// Columns with onRender that conditionally show edit controls
const columns: IColumn[] = [
  {
    key: 'name',
    name: 'Name',
    fieldName: 'name',
    minWidth: 150,
    onRender: (item: ICategory, index?: number) => {
      if (item.isEditing) {
        return (
          <TextField
            value={item.name}
            onChange={(_, val) => onCellChange(item.id, 'name', val || '')}
          />
        );
      }
      return <span>{item.name}</span>;
    },
  },
  {
    key: 'isActive',
    name: 'Aktiv',
    minWidth: 60,
    onRender: (item: ICategory) => (
      <Toggle
        checked={item.isActive}
        onChange={(_, checked) => onToggleActive(item.id, !!checked)}
      />
    ),
  },
];
```

### Pattern 3: CommandBar Actions
**What:** CommandBar above a DetailsList providing Add/Delete/Export actions
**When to use:** List management with action buttons
**Example:**
```typescript
// Source: Fluent UI v8 CommandBar
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';

const items: ICommandBarItemProps[] = [
  {
    key: 'add',
    text: 'Hinzufugen',
    iconProps: { iconName: 'Add' },
    onClick: onAddCategory,
  },
  {
    key: 'delete',
    text: 'Loschen',
    iconProps: { iconName: 'Delete' },
    onClick: onDeleteSelected,
    disabled: selectedCount === 0,
  },
];

<CommandBar items={items} />
```

### Pattern 4: CQRS Command with MediatR (existing project pattern)
**What:** Separate commands from queries, RequireGroup attribute for authorization
**When to use:** All backend operations
**Example:**
```csharp
// Source: api/src/WissensHub.Application/Commands/ApproveArticle/ApproveArticleCommand.cs
[RequireGroup("WissensHub Owners")]
public record CreateCategoryCommand(string Name, string? Description)
    : IRequest<ApiResponse<CategoryDto>>;

// Handler follows existing pattern with IUnitOfWork for SaveChanges
public class CreateCategoryHandler(
    ICategoryRepository categoryRepo,
    IUnitOfWork unitOfWork,
    ICurrentUser currentUser)
    : IRequestHandler<CreateCategoryCommand, ApiResponse<CategoryDto>>
{
    public async Task<ApiResponse<CategoryDto>> Handle(
        CreateCategoryCommand request, CancellationToken ct)
    {
        var entity = new Category { Name = request.Name, Description = request.Description };
        await categoryRepo.AddCategoryAsync(entity, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return ApiResponse<CategoryDto>.Ok(new CategoryDto(entity.Id, entity.Name, entity.Description, entity.IsActive));
    }
}
```

### Pattern 5: Client-Side Export (ExcelJS + file-saver)
**What:** Generate .xlsx or .csv in the browser from currently displayed data
**When to use:** Report export without server roundtrip
**Example:**
```typescript
// Source: ExcelJS official docs (https://github.com/exceljs/exceljs)
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

async function exportToExcel(data: IArticleReport[], filename: string): Promise<void> {
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet('Bericht');

  sheet.columns = [
    { header: 'Titel', key: 'title', width: 30 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Kategorie', key: 'category', width: 20 },
    { header: 'Gelesen', key: 'readCount', width: 10 },
    { header: 'Gesamt', key: 'targetUserCount', width: 10 },
  ];

  for (let i = 0; i < data.length; i++) {
    sheet.addRow(data[i]);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, filename + '.xlsx');
}

function exportToCsv(data: IArticleReport[], filename: string): void {
  const headers = ['Titel', 'Status', 'Kategorie', 'Gelesen', 'Gesamt'];
  const rows = data.map(d => [d.title, d.status, d.category, d.readCount, d.targetUserCount].join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, filename + '.csv');
}
```
Note: CSV uses BOM (`\uFEFF`) prefix for proper Excel/German locale encoding of umlauts.

### Pattern 6: ProgressIndicator for Read Percentage
**What:** Fluent UI v8 ProgressIndicator with percentComplete prop
**When to use:** Showing read completion percentage per article
**Example:**
```typescript
// Source: @fluentui/react ProgressIndicator
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';

<ProgressIndicator
  label={readCount + ' / ' + totalCount}
  percentComplete={totalCount > 0 ? readCount / totalCount : 0}
  barHeight={4}
/>
```

### Anti-Patterns to Avoid
- **Server-side export:** Don't create a backend endpoint for Excel generation. Data is small and already on the client. Server-side adds latency and complexity.
- **Full delete for categories with articles:** Always soft-delete (IsActive=false) when articles reference the category. Hard delete causes FK constraint violations.
- **Polling for group members on every render:** Cache the SP group member list per session. Group membership rarely changes mid-session.
- **Using Array.includes/flatMap:** ES5 target in SPFx tsconfig requires indexOf/forEach patterns (consistent with existing codebase).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Excel file generation | Custom XML/ZIP builder | ExcelJS 4.4.0 | OOXML is extraordinarily complex; ExcelJS handles styles, sheets, cell types |
| File download trigger | Custom blob URL management | file-saver 2.0.5 | Handles browser quirks (IE, Safari), cleanup of object URLs |
| Progress bar visualization | Custom CSS progress bar | Fluent UI ProgressIndicator | Theme-aware, accessible, consistent with design system |
| SharePoint group enumeration | REST API calls | PnPjs `sp.web.siteGroups()` | Already imported in pnpSetup.ts, fluent API, handles auth |
| Inline edit state management | Complex form library | Local React state with isEditing flag per row | Inline edit is simple enough; formik/react-hook-form adds overhead |

**Key insight:** The only genuinely new library needed is ExcelJS + file-saver for export. Everything else uses existing project dependencies.

## Common Pitfalls

### Pitfall 1: ExcelJS `fs` Module Error in Webpack
**What goes wrong:** ExcelJS imports Node.js `fs` module which doesn't exist in browser bundles, causing webpack build errors.
**Why it happens:** ExcelJS has both Node.js and browser entry points; SPFx webpack may resolve to the wrong one.
**How to avoid:** Import from `exceljs` directly (not `exceljs/dist/exceljs.browser`). If webpack fails, add to config/config.json externals or webpack config: `{ node: { fs: 'empty' } }`. SPFx 1.22.2 Heft toolchain should handle this via the browser field in package.json.
**Warning signs:** Build error mentioning "Module not found: Error: Can't resolve 'fs'".

### Pitfall 2: Soft Delete vs Hard Delete Race Condition
**What goes wrong:** Admin deletes a category while another user is creating an article with that category, causing inconsistent state.
**Why it happens:** No optimistic concurrency on category assignment.
**How to avoid:** Soft delete (IsActive=false) is inherently safe. Frontend category dropdowns filter by IsActive=true, but existing articles retain the category reference. The UI should show inactive categories in a dimmed/disabled state in the admin list.
**Warning signs:** Articles showing "Unknown Category" after deletion.

### Pitfall 3: Target Group Member Count Mismatch
**What goes wrong:** The "who didn't read" list shows wrong users because SP group membership changed after article was assigned.
**Why it happens:** Read stats are based on current group membership, not membership at time of article publication.
**How to avoid:** This is by design (CONTEXT.md says "show current state"). Document this behavior. The report shows current group members vs current read confirmations.
**Warning signs:** Users appear in "didn't read" who weren't in the group when article was published.

### Pitfall 4: ES5 Target Compatibility
**What goes wrong:** Using Array.includes, Array.flatMap, Object.entries, or other ES6+ methods causes runtime errors in older browsers.
**Why it happens:** SPFx tsconfig targets ES5 for IE11 compatibility.
**How to avoid:** Use indexOf, forEach, manual iteration (consistent with all existing codebase patterns). See Phase 05-02 decision.
**Warning signs:** "X is not a function" errors in IE11 or older Edge.

### Pitfall 5: CSV Encoding with German Characters
**What goes wrong:** Exported CSV shows garbled umlauts (a, o, u, ss) when opened in Excel.
**Why it happens:** Excel defaults to ANSI encoding when opening CSV files without BOM.
**How to avoid:** Prepend UTF-8 BOM (`\uFEFF`) to CSV string before creating Blob. Set charset=utf-8 in MIME type.
**Warning signs:** Characters like "Ubersicht" appearing as "Ã\u0178bersicht" in Excel.

### Pitfall 6: SystemConfiguration Entity Migration
**What goes wrong:** New entity requires EF Core migration that must be applied to existing databases.
**Why it happens:** Adding SystemConfiguration table is a schema change.
**How to avoid:** Create migration with `dotnet ef migrations add AddSystemConfiguration`. Seed default reminder interval (e.g., 7 days) in migration. Test migration against existing database with data.
**Warning signs:** Application crash on startup with "Invalid object name 'SystemConfigurations'".

## Code Examples

### SharePoint Group Lookup for Target Group Picker
```typescript
// Source: PnPjs official docs (https://pnp.github.io/pnpjs/sp/site-groups/)
import { SPFI } from '@pnp/sp';
import '@pnp/sp/site-groups/web';

interface ISPGroup {
  Id: number;
  Title: string;
  Description: string;
}

async function getSharePointGroups(sp: SPFI): Promise<ISPGroup[]> {
  const groups = await sp.web.siteGroups();
  return groups as ISPGroup[];
}

async function getGroupMembers(sp: SPFI, groupId: number): Promise<{ Id: number; Title: string; Email: string }[]> {
  const users = await sp.web.siteGroups.getById(groupId).users();
  return users as { Id: number; Title: string; Email: string }[];
}
```

### IAdminService Interface
```typescript
// New service interface for admin operations
import { Result } from '../models/Result';

export interface ICategory {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface ITargetGroupConfig {
  id: number;
  name: string;
  sharePointGroupName: string;
  isActive: boolean;
}

export interface IArticleReport {
  pageId: number;
  title: string;
  status: string;
  category: string;
  readCount: number;
  targetUserCount: number;
  flagCount: number;
  lastUpdated: Date;
}

export interface IAdminReport {
  articles: IArticleReport[];
  totalArticles: number;
  publishedCount: number;
  draftCount: number;
  inReviewCount: number;
}

export interface IAdminService {
  getCategories(): Promise<Result<ICategory[]>>;
  createCategory(name: string, description: string): Promise<Result<ICategory>>;
  updateCategory(id: number, name: string, description: string, isActive: boolean): Promise<Result<void>>;
  deleteCategory(id: number): Promise<Result<void>>;

  getTargetGroups(): Promise<Result<ITargetGroupConfig[]>>;
  createTargetGroup(name: string, sharePointGroupName: string): Promise<Result<ITargetGroupConfig>>;
  updateTargetGroup(id: number, name: string, isActive: boolean): Promise<Result<void>>;
  deleteTargetGroup(id: number): Promise<Result<void>>;

  getReminderInterval(): Promise<Result<number>>;
  updateReminderInterval(days: number): Promise<Result<void>>;

  getAdminReports(): Promise<Result<IAdminReport>>;
}
```

### Backend Admin Endpoints Pattern
```csharp
// Source: api/src/WissensHub.Functions/Functions/AdminFunctions.cs (extend existing)
// All admin endpoints use route prefix "administration" (Phase 04-05 decision)

// GET  /api/administration/categories       -- all categories (incl inactive)
// POST /api/administration/categories       -- create category
// PUT  /api/administration/categories/{id}  -- update category
// DELETE /api/administration/categories/{id} -- soft delete category

// GET  /api/administration/target-groups       -- all target groups
// POST /api/administration/target-groups       -- create
// PUT  /api/administration/target-groups/{id}  -- update
// DELETE /api/administration/target-groups/{id} -- soft delete

// GET  /api/administration/reminder-interval   -- get interval
// PUT  /api/administration/reminder-interval   -- update interval

// GET  /api/management/reports                 -- already exists (stub)
// GET  /api/management/reports/{pageId}        -- new: detailed per-article read stats
```

### Freshness Color Calculation
```typescript
// Utility for content freshness color coding
function getFreshnessColor(lastUpdated: Date): 'green' | 'yellow' | 'red' {
  const now = Date.now();
  const daysSince = Math.floor((now - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince < 30) return 'green';
  if (daysSince <= 90) return 'yellow';
  return 'red';
}

function getFreshnessLabel(lastUpdated: Date): string {
  const now = Date.now();
  const daysSince = Math.floor((now - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince < 30) return 'Aktuell (' + daysSince + ' Tage)';
  if (daysSince <= 90) return 'Alternd (' + daysSince + ' Tage)';
  return 'Veraltet (' + daysSince + ' Tage)';
}
```

### SystemConfiguration Entity
```csharp
// New domain entity for key-value system settings
namespace WissensHub.Domain.Entities;

public class SystemConfiguration
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SheetJS (xlsx) for Excel export | ExcelJS 4.4.0 | 2023+ | ExcelJS has no CVEs, better browser support, MIT license |
| Server-side report generation | Client-side export via ExcelJS | Modern pattern | Eliminates backend endpoint, reduces latency |
| Modal dialogs for CRUD | Inline-editable DetailsList | Fluent UI v8 pattern | Fewer clicks, faster workflow for admin |
| gulp-based SPFx build | Heft-based build (SPFx 1.22.2) | SPFx 1.22+ | No gulp commands; `npm start` to serve |

**Deprecated/outdated:**
- gulp commands: SPFx 1.22.2 uses Heft toolchain exclusively; use `npm start`
- SheetJS community edition: Security vulnerabilities documented; use ExcelJS instead

## Open Questions

1. **ExcelJS webpack compatibility with SPFx Heft**
   - What we know: ExcelJS has a browser entry point in package.json. SPFx 1.22.2 webpack should resolve it correctly.
   - What's unclear: Whether SPFx Heft's webpack config handles the `fs` polyfill automatically or needs manual config.
   - Recommendation: Install and test build immediately. If `fs` error occurs, add webpack node polyfill config. This is a LOW risk -- most SPFx projects using ExcelJS report success with standard npm install.

2. **IApiClient needs PUT and DELETE methods**
   - What we know: Current IApiClient only has `get<T>` and `post<T>` methods. Admin CRUD requires PUT and DELETE HTTP methods.
   - What's unclear: Whether to extend IApiClient or use post with action parameters.
   - Recommendation: Extend IApiClient with `put<T>(endpoint, body?)` and `delete<T>(endpoint)` methods. Also extend AzureApiClient and MockApiClient. This is the clean approach -- POST-only workarounds are hacky.

3. **Target group member count for read stats**
   - What we know: The backend ReadStatsDto has TotalTargetUsers. The frontend needs to cross-reference SP group members.
   - What's unclear: Whether member resolution happens on frontend (PnPjs) or backend.
   - Recommendation: Backend should resolve target user count via stored target group assignments. For the detailed drill-down ("who didn't read"), the frontend can fetch SP group members via PnPjs and cross-reference with read confirmations from the API. This avoids the backend needing SharePoint access.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 27 via @types/heft-jest (SPFx Heft) |
| Config file | Managed by SPFx Heft plugins (no separate jest.config) |
| Quick run command | `cd spfx && npx heft test --clean` |
| Full suite command | `cd spfx && npx heft test --clean` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMIN-01 | Category CRUD renders and handles add/edit/delete | unit | `cd spfx && npx heft test --clean -- --testPathPattern="KategorienTab"` | No -- Wave 0 |
| ADMIN-02 | Target group picker renders with SP groups | unit | `cd spfx && npx heft test --clean -- --testPathPattern="ZielgruppenTab"` | No -- Wave 0 |
| ADMIN-03 | Reminder interval setting renders and saves | unit | `cd spfx && npx heft test --clean -- --testPathPattern="AdminPanel"` | No -- Wave 0 |
| ADMIN-04 | Read report drill-down renders article list and user list | unit | `cd spfx && npx heft test --clean -- --testPathPattern="BerichteTab"` | No -- Wave 0 |
| ADMIN-05 | Export functions generate correct CSV/Excel | unit | `cd spfx && npx heft test --clean -- --testPathPattern="exportUtils"` | No -- Wave 0 |
| ADMIN-06 | Overview dashboard renders stats and sortable table | unit | `cd spfx && npx heft test --clean -- --testPathPattern="UebersichtTab"` | No -- Wave 0 |
| RMND-02 | Reminder interval config UI and storage | unit | Covered by ADMIN-03 test | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `cd spfx && npx heft test --clean`
- **Per wave merge:** `cd spfx && npx heft test --clean`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `spfx/src/webparts/adminPanel/components/__tests__/AdminPanel.test.tsx` -- covers ADMIN-01, ADMIN-02, ADMIN-03 (top-level rendering)
- [ ] `spfx/src/webparts/adminPanel/components/__tests__/KategorienTab.test.tsx` -- covers ADMIN-01 CRUD
- [ ] `spfx/src/webparts/adminPanel/components/__tests__/ZielgruppenTab.test.tsx` -- covers ADMIN-02
- [ ] `spfx/src/webparts/adminPanel/components/__tests__/BerichteTab.test.tsx` -- covers ADMIN-04, ADMIN-05
- [ ] `spfx/src/webparts/adminPanel/components/__tests__/UebersichtTab.test.tsx` -- covers ADMIN-06
- [ ] `spfx/src/shared/utils/__tests__/exportUtils.test.ts` -- covers ADMIN-05 CSV/Excel generation

## Sources

### Primary (HIGH confidence)
- Project codebase -- Freigabecenter.tsx, ArticleListView.tsx, AdminPanel.tsx, AdminPanelWebPart.ts, Category.cs, TargetGroup.cs, ICategoryRepository.cs, AdminFunctions.cs, AdminReportDto.cs, ReadStatsDto.cs, WissensHubDbContext.cs, ServiceContainer.ts, pnpSetup.ts
- [PnPjs Site Groups documentation](https://pnp.github.io/pnpjs/sp/site-groups/) -- siteGroups API, getByName, getById, users()
- [ExcelJS npm package](https://www.npmjs.com/package/exceljs) -- v4.4.0, browser support confirmed
- [ExcelJS GitHub](https://github.com/exceljs/exceljs) -- browser bundle, API reference

### Secondary (MEDIUM confidence)
- [Fluent UI v8 ProgressIndicator](https://github.com/microsoft/fluentui/blob/master/packages/react/src/ProgressIndicator.ts) -- percentComplete prop API
- [file-saver npm](https://www.npmjs.com/package/file-saver) -- v2.0.5, saveAs API

### Tertiary (LOW confidence)
- ExcelJS webpack/SPFx compatibility -- based on community reports, not tested in this specific project

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - ExcelJS is well-established, all other libs already in project
- Architecture: HIGH - Directly follows existing Freigabecenter/Dashboard patterns
- Pitfalls: HIGH - Based on codebase analysis and established project decisions (ES5, soft delete, BOM encoding)
- Backend patterns: HIGH - Existing CQRS/MediatR/Repository patterns well documented in codebase

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable domain, no fast-moving dependencies)
