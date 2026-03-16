# Phase 7: Approval Workflow & Freigabecenter - Research

**Researched:** 2026-03-16
**Domain:** SPFx approval workflow state machine, Freigabecenter web part (Fluent UI v8 Pivot + card layout), dual-store update pattern (Azure SQL + SharePoint)
**Confidence:** HIGH

## Summary

Phase 7 implements two tightly coupled capabilities: (1) the approval workflow state machine that transitions articles through Draft/InReview/Published/Archived states with dual-store persistence, and (2) the Freigabecenter web part that gives reviewers a dedicated workspace with tabbed views for pending approvals, flagged articles, and stale content alerts.

The existing codebase provides extensive scaffolding. The frontend has `IApprovalService` with `ApprovalService`, `MockApprovalService`, command hooks (`useApproveArticleCommand`, `useRejectArticleCommand`), query hooks (`usePendingApprovalsQuery`), domain models (`IApprovalAction`, `IArticlePage`), DTOs (`ApprovalDto`), and mappers (`approvalMapper`). The backend has the `ApproveArticleCommand` with validator and a stubbed handler that returns mock data, plus `IApprovalRepository`/`ApprovalRepository` with EF Core implementation and `IArticleMetadataRepository`/`ArticleMetadataRepository` with status query methods. The `FreigabecenterWebPart.ts` is fully wired with `WissensHubProvider`, PnPjs, and AadHttpClient.

**Primary recommendation:** Build Plan 07-01 (state machine + dual-store backend) first since Plan 07-02 (Freigabecenter UI) depends on working approve/reject APIs and needs new query endpoints for flagged articles and stale content. Follow the established FlagDialog pattern for approve/reject dialogs, ArticleCard pattern for Freigabecenter cards, and Dashboard Pivot/tab patterns for the tabbed layout.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Freigabecenter layout: Fluent UI Pivot with 3 tabs: "Ausstehend" (pending approvals), "Gemeldet" (flagged articles), "Veraltet" (stale content)
- Tab badges show item counts per tab
- Reviewer filter dropdown at top applies across all three tabs (FREI-06)
- Pending approvals tab: Rich card layout per pending article with inline "Genehmigen" and "Ablehnen" buttons
- Approve/reject UX: Both actions open Fluent UI Dialog (consistent with Phase 6 FlagDialog pattern)
- Approve dialog: optional comment field; Reject dialog: required comment field ("Begrundung")
- After successful action: card optimistically removed, tab count decrements, success toast
- Approval history display: shown in Article Sidebar only (not in Freigabecenter)
- Flagged articles tab: cards with warning icon, article title, who flagged, when, flag reason; "Artikel offnen" link
- Content freshness tab: stale = Published articles where (today - lastModified) > 90 days; hardcoded threshold; age-colored cards (yellow 90-120, orange 120-180, red 180+); sorted oldest first
- Status transitions: Draft->InReview (editor submits), InReview->Published (reviewer approves), InReview->Draft (reviewer rejects), Published->Archived (reviewer/admin), Archived->Published (reviewer/admin)
- Dual-store update: Azure Functions API updates SQL first (ApprovalHistory + ArticleMetadata.Status), then SharePoint WH_Status column; SQL is authoritative source
- Article Sidebar extensions: "Zur Prufung einreichen" (editor, status=Draft), "Archivieren" (reviewer, status=Published), "Wiederherstellen" (reviewer, status=Archived), approval history section

### Claude's Discretion
- Exact card spacing, typography, and divider styling
- Fluent UI Pivot styling customization
- Loading state implementation (shimmer for each tab)
- Error state handling for failed data fetches
- Empty state messages per tab
- How to fetch flagged articles (new API endpoint or extend existing)
- Toast notification wording and duration
- Exact color values for freshness age bands
- Whether archive/restore buttons need confirmation dialogs
- Animation style for optimistic card removal

### Deferred Ideas (OUT OF SCOPE)
- Admin-configurable freshness threshold -- Phase 9 (Admin Panel)
- Email notifications for overdue articles -- Phase 9 (RMND-02)
- Background sync job for SP/SQL reconciliation -- Phase 10
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| APPR-01 | Article status transitions: Draft -> InReview -> Published -> Archived | State machine with valid transitions map; backend handler validates transition legality; frontend hooks for submit/archive/restore actions |
| APPR-02 | Approval/rejection action saved to ApprovalHistory with ActionBy, ActionDate, Comment | Existing `ApprovalHistory` entity, `IApprovalRepository.AddAsync()`, `ApproveArticleHandler` (needs real implementation replacing mock) |
| APPR-03 | Status change updates both SharePoint page column and Azure SQL ArticleMetadata | Dual-store update: backend updates SQL via EF Core, frontend updates SP via PnPjs `items.getById().update()` |
| FREI-01 | Reviewer can see list of articles pending approval with status | `usePendingApprovalsQuery` + `IApprovalService.getPendingApprovals()` already exist; backend needs real query via `IArticleMetadataRepository.GetByStatusAsync("InReview")` |
| FREI-02 | Reviewer can approve an article with optional comment | `useApproveArticleCommand` + ApproveDialog (new, modeled on FlagDialog); backend `ApproveArticleHandler` updated with real SQL ops |
| FREI-03 | Reviewer can reject an article with comment | `useRejectArticleCommand` + RejectDialog (new, modeled on FlagDialog with required comment); backend uses same `ApproveArticleHandler` with action="Rejected" |
| FREI-04 | Reviewer can see list of articles flagged as outdated | New query: `IFlagRepository.GetUnresolvedAsync()` already exists on backend; need new frontend service method + query hook + API endpoint |
| FREI-05 | Reviewer can see content freshness alerts | Client-side calculation from article list: Published articles where (today - modifiedDate) > 90 days; no new API needed |
| FREI-06 | Reviewer can filter by assigned reviewer | Client-side filter on `IArticlePage.reviewerName`; Dropdown populated from unique reviewer names in current dataset |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @fluentui/react | 8.x | Pivot, Dialog, TextField, Dropdown, Icon, MessageBar | SPFx 1.22.2 locked to Fluent UI v8 |
| @pnp/sp | 4.x | SharePoint list item update (WH_Status column) | Already used in SharePointPageService; PnPjs is the standard SPFx data access layer |
| React | 17.x | Component framework | SPFx 1.22.2 locked to React 17 |
| MediatR | latest | CQRS command/query dispatch | Already registered in backend Program.cs |
| FluentValidation | latest | Request validation | Already registered in backend Program.cs |
| EF Core | 10.x | Data access for ApprovalHistory and ArticleMetadata | Already configured with all entities and repositories |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| SCSS Modules | - | Component styling | All component styles use `.module.scss` pattern |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Client-side freshness calc | New API endpoint for stale articles | Unnecessary -- Published articles already loaded from SP; date math is trivial client-side |
| Backend SP update via Graph | Frontend PnPjs SP update | Graph SDK adds backend dependency; PnPjs is already available on frontend and simpler |

## Architecture Patterns

### Recommended Project Structure
```
spfx/src/webparts/freigabecenter/
├── components/
│   ├── Freigabecenter.tsx          # Main container with Pivot tabs + reviewer filter
│   ├── Freigabecenter.module.scss  # Styles (exists, needs expansion)
│   ├── IFreigabecenterProps.ts     # Props interface (exists, needs update)
│   ├── PendingTab.tsx              # Ausstehend tab content
│   ├── FlaggedTab.tsx              # Gemeldet tab content
│   ├── StaleTab.tsx                # Veraltet tab content
│   ├── ApprovalCard.tsx            # Card for pending approval item
│   ├── FlaggedCard.tsx             # Card for flagged article
│   ├── StaleCard.tsx               # Card for stale article
│   ├── ApproveDialog.tsx           # Approve confirmation dialog
│   └── RejectDialog.tsx            # Reject with required comment dialog

spfx/src/webparts/articleSidebar/
├── components/
│   ├── ApprovalActions.tsx         # Submit/Archive/Restore buttons (role-gated)
│   └── ApprovalHistory.tsx         # Chronological approval history list

spfx/src/shared/
├── interfaces/
│   ├── IApprovalService.ts         # Extend with getApprovalHistory(), getArticlesByStatus()
│   └── IFlagService.ts             # Extend with getFlaggedArticles()
├── hooks/
│   ├── queries/
│   │   ├── useFlaggedArticlesQuery.ts    # New: fetch unresolved flags
│   │   └── useApprovalHistoryQuery.ts    # New: fetch approval history for a page
│   └── commands/
│       ├── useSubmitForReviewCommand.ts  # New: Draft -> InReview
│       ├── useArchiveArticleCommand.ts   # New: Published -> Archived
│       └── useRestoreArticleCommand.ts   # New: Archived -> Published

api/src/WissensHub.Application/
├── Commands/
│   └── ApproveArticle/
│       └── ApproveArticleHandler.cs      # Replace mock with real SQL + ApprovalHistory
├── Queries/
│   ├── GetFlaggedArticles/               # New: returns unresolved ArticleFlags
│   └── GetApprovalHistory/               # New: returns ApprovalHistory for a pageId
```

### Pattern 1: Dual-Store Update (SQL-First, SP-Second)
**What:** Status transitions update Azure SQL as the authoritative store, then update SharePoint as a read-optimized projection.
**When to use:** Every status transition (submit, approve, reject, archive, restore).
**Example:**
```typescript
// Frontend orchestrates dual-store update
const handleApprove = async (pageId: number, comment?: string): Promise<void> => {
  // Step 1: Optimistic UI -- remove card from list immediately
  setPendingArticles(prev => prev.filter(a => a.id !== pageId));

  // Step 2: Backend API updates SQL (ArticleMetadata.Status + ApprovalHistory)
  const result = await approveCommand.execute(pageId, comment);

  if (result) {
    // Step 3: Update SharePoint WH_Status column via PnPjs
    try {
      await sp.web.lists.getByTitle('SitePages').items
        .getById(pageId).update({ WH_Status: 'Published' });
    } catch (spError) {
      // SP update failed -- SQL is source of truth, log warning
      console.warn('SharePoint status update failed:', spError);
    }
    // Show success toast regardless of SP result
  } else {
    // API failed -- revert optimistic removal
    refetchPending();
  }
};
```

### Pattern 2: Approval Dialog (FlagDialog Pattern)
**What:** Fluent UI Dialog with optional/required comment field, action buttons, and command hook integration.
**When to use:** Approve and reject actions.
**Example:**
```typescript
// Source: Phase 6 FlagDialog.tsx pattern
const dialogContentProps = {
  type: DialogType.normal,
  title: 'Artikel genehmigen',
  subText: articleTitle,
};

// Dialog with optional comment for approve, required comment for reject
<Dialog hidden={!isOpen} onDismiss={onDismiss} dialogContentProps={dialogContentProps} minWidth={400}>
  <TextField label="Kommentar" multiline rows={3} value={comment}
    onChange={(_, v) => setComment(v || '')} />
  <DialogFooter>
    <PrimaryButton text="Genehmigen" onClick={handleApprove}
      disabled={approveCommand.state.status === 'executing'} />
    <DefaultButton text="Abbrechen" onClick={onDismiss} />
  </DialogFooter>
</Dialog>
```

### Pattern 3: Tabbed Layout with Pivot and Badge Counts
**What:** Fluent UI Pivot component with tab items showing item counts.
**When to use:** Freigabecenter main layout.
**Example:**
```typescript
// Fluent UI Pivot with count badges
<Pivot>
  <PivotItem headerText={'Ausstehend (' + pendingCount + ')'} itemIcon="Clock">
    <PendingTab articles={filteredPending} onApprove={handleApprove} onReject={handleReject} />
  </PivotItem>
  <PivotItem headerText={'Gemeldet (' + flaggedCount + ')'} itemIcon="Warning">
    <FlaggedTab flags={filteredFlagged} />
  </PivotItem>
  <PivotItem headerText={'Veraltet (' + staleCount + ')'} itemIcon="Clock">
    <StaleTab articles={filteredStale} />
  </PivotItem>
</Pivot>
```

### Pattern 4: State Machine Transition Map
**What:** A typed transition map that validates whether a state change is allowed before executing it.
**When to use:** All status transitions on both frontend and backend.
**Example:**
```typescript
// Valid transitions map
const VALID_TRANSITIONS: Record<ArticleStatus, ArticleStatus[]> = {
  'Draft': ['InReview'],
  'InReview': ['Published', 'Draft'],
  'Published': ['Archived'],
  'Archived': ['Published'],
};

function isValidTransition(from: ArticleStatus, to: ArticleStatus): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed !== undefined && allowed.indexOf(to) >= 0;
}
```

### Anti-Patterns to Avoid
- **Direct SP column update without SQL update:** Never update SharePoint WH_Status without first updating Azure SQL -- SQL is the source of truth. If only SP is updated, the dashboard stats and approval history will be inconsistent.
- **Backend-initiated SharePoint calls:** The backend Azure Functions project has no SharePoint client configured. All SP updates must go through the frontend PnPjs instance. Do not add Graph SDK to the backend for this phase.
- **Hardcoding reviewer names:** The reviewer filter dropdown must be dynamically populated from the data, not hardcoded. Use unique values from `IArticlePage.reviewerName` across the loaded article set.
- **Fetching all articles for freshness check:** Stale articles are a subset of Published articles. Reuse the articles already loaded by `useArticlesQuery()` or `IPageService.getPublishedArticles()` -- do not create a separate full-load query.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dialog with comment field | Custom modal/overlay | Fluent UI Dialog + DialogFooter | Accessibility, focus trap, keyboard handling, consistent with FlagDialog |
| Tabbed layout | Custom tab switching | Fluent UI Pivot + PivotItem | Built-in ARIA roles, keyboard nav, styling consistency |
| Dropdown filter | Custom select element | Fluent UI Dropdown | Accessible, searchable, consistent styling |
| Toast notifications | Custom notification system | Fluent UI MessageBar (temporary) | Consistent with Phase 5/6 pattern, accessible |
| Date calculations | Manual date parsing | Simple arithmetic on Date objects | `Math.floor((now - modified) / (1000 * 60 * 60 * 24))` for days-since; no library needed |

**Key insight:** Every UI element in this phase has a Fluent UI v8 equivalent already used in prior phases. The FlagDialog pattern is the exact template for ApproveDialog and RejectDialog. The ArticleCard pattern is the template for approval/flagged/stale cards.

## Common Pitfalls

### Pitfall 1: Race Condition in Dual-Store Update
**What goes wrong:** User approves article, SQL updates, but SP update fails silently. Next page load shows Published in dashboard (reads from SP) but SQL says InReview.
**Why it happens:** SP REST API can fail due to throttling, concurrent edits, or network issues.
**How to avoid:** SQL is always updated first and is the source of truth. If SP fails, log a warning but treat the operation as successful. The dashboard already reads status from SP for display, but approval actions and history always use SQL. A background reconciliation job is deferred to Phase 10.
**Warning signs:** SP update returning 429 (throttled) or 412 (conflict).

### Pitfall 2: Stale Tab Count After Optimistic Removal
**What goes wrong:** After approving an article, the "Ausstehend" tab badge still shows the old count because the badge reads from a different state variable than the filtered list.
**Why it happens:** Tab counts and filtered lists are derived from different sources or cached values.
**How to avoid:** Derive tab counts from the same filtered data arrays that the tabs display. When an article is optimistically removed from `pendingArticles`, the count should be `filteredPending.length`, not a separate counter.

### Pitfall 3: ES5 Target Compatibility
**What goes wrong:** Using `Array.includes()`, `Array.flatMap()`, `Object.values()`, or `Array.from()` causes runtime errors in IE11 or build failures with SPFx ES5 target.
**Why it happens:** SPFx tsconfig targets ES5.
**How to avoid:** Use `indexOf() >= 0` instead of `includes()`, `forEach` with push instead of `flatMap`, `for...in` loops instead of `Object.values()`. This is a recurring pattern from Phases 5 and 6.

### Pitfall 4: Approval History Missing ArticleMetadataId
**What goes wrong:** Creating an `ApprovalHistory` record fails with FK constraint violation because `ArticleMetadataId` is not set.
**Why it happens:** The handler knows `PageId` but `ApprovalHistory` has a required FK `ArticleMetadataId` pointing to `ArticleMetadata.Id` (the surrogate key, not `PageId`).
**How to avoid:** In the backend handler, first look up `ArticleMetadata` by `PageId` using `IArticleMetadataRepository.GetByPageIdAsync()`, then use the returned entity's `Id` as `ArticleMetadataId` when creating the `ApprovalHistory` record.

### Pitfall 5: No Pending Approvals Query Endpoint
**What goes wrong:** `ApprovalService.getPendingApprovals()` calls `this.api.get('/api/articles?status=InReview')` but no such endpoint exists in the backend.
**Why it happens:** The current implementation was a placeholder. The backend only has individual article status endpoints, not a filtered list endpoint.
**How to avoid:** Two options: (a) add a new backend query endpoint `GET /api/articles?status=InReview` that uses `IArticleMetadataRepository.GetByStatusAsync("InReview")`, or (b) use the frontend `IPageService.getPublishedArticles()` with broader status filtering. Recommendation: option (b) for the pending tab -- extend `SharePointPageService` to support status-filtered queries since article display data (title, author, category) comes from SharePoint anyway. For the mock, filter `MOCK_ARTICLES` by status.

### Pitfall 6: Missing Flagged Articles API Endpoint
**What goes wrong:** The Freigabecenter needs to show flagged articles (FREI-04) but there is no frontend service method or API endpoint to fetch unresolved flags.
**Why it happens:** `IFlagService` only has `flagArticle()` (write), no read method. Backend `IFlagRepository` has `GetUnresolvedAsync()` but it is not exposed through any query or endpoint.
**How to avoid:** Add a new `GetFlaggedArticlesQuery` on the backend with a new endpoint (e.g., `GET /api/articles/flagged`), extend `IFlagService` with `getFlaggedArticles()`, and create `useFlaggedArticlesQuery` hook.

## Code Examples

### Existing Assets Inventory

**Frontend services and hooks (ready to use):**
```typescript
// IApprovalService -- fully defined
interface IApprovalService {
  getPendingApprovals(): Promise<Result<IArticlePage[]>>;
  approveArticle(pageId: number, comment?: string): Promise<Result<void>>;
  rejectArticle(pageId: number, comment: string): Promise<Result<void>>;
}

// Command hooks -- wired to service
useApproveArticleCommand(): { state: CommandState; execute: (pageId, comment?) => Promise<boolean> }
useRejectArticleCommand(): { state: CommandState; execute: (pageId, comment) => Promise<boolean> }
usePendingApprovalsQuery(): { state: QueryState<IArticlePage[]>; refetch: () => void }

// Domain models
interface IApprovalAction {
  id: number; pageId: number; actionBy: string; actionByDisplayName: string;
  actionDate: Date; fromStatus: ArticleStatus; toStatus: ArticleStatus; comment?: string;
}

interface IArticlePage {
  id: number; title: string; category: string; status: ArticleStatus;
  isMandatory: boolean; targetGroups: string[]; modifiedDate: Date;
  author: IUser; reviewerName?: string; reviewByDate?: Date; url: string;
}
```

**Backend entities and repositories (ready to use):**
```csharp
// ApprovalHistory entity -- complete with FK to ArticleMetadata
class ApprovalHistory {
  int Id, int ArticleMetadataId, int PageId, string Action,
  string ActionBy, string ActionByDisplayName, DateTime ActionDate, string? Comment
}

// IApprovalRepository -- all methods implemented in ApprovalRepository
GetByPageIdAsync(int pageId, CancellationToken ct) -> List<ApprovalHistory>
GetLatestByPageIdAsync(int pageId, CancellationToken ct) -> ApprovalHistory?
AddAsync(ApprovalHistory entity, CancellationToken ct)

// IArticleMetadataRepository -- key methods for this phase
GetByPageIdAsync(int pageId, CancellationToken ct) -> ArticleMetadata?
GetByStatusAsync(string status, CancellationToken ct) -> List<ArticleMetadata>
Update(ArticleMetadata entity) // for status changes

// IFlagRepository -- GetUnresolvedAsync already exists
GetUnresolvedAsync(CancellationToken ct) -> List<ArticleFlag>

// ApproveArticleCommand -- exists with validator
record ApproveArticleCommand(int PageId, string Action, string? Comment)
// Validator: Action must be "Approved" or "Rejected"; Comment required when Action="Rejected"
```

### Real ApproveArticleHandler Implementation (replacing mock)
```csharp
// Pattern follows existing handler structure (MarkAsReadHandler, FlagArticleHandler)
public class ApproveArticleHandler(
    ICurrentUser currentUser,
    IApprovalRepository approvalRepo,
    IArticleMetadataRepository metadataRepo,
    WissensHubDbContext db)
    : IRequestHandler<ApproveArticleCommand, ApiResponse<ApprovalHistoryDto>>
{
    public async Task<ApiResponse<ApprovalHistoryDto>> Handle(
        ApproveArticleCommand request, CancellationToken ct)
    {
        var metadata = await metadataRepo.GetByPageIdAsync(request.PageId, ct)
            ?? throw new KeyNotFoundException($"Article {request.PageId} not found");

        var newStatus = request.Action == "Approved" ? "Published" : "Draft";
        metadata.Status = newStatus;
        metadata.UpdatedAt = DateTime.UtcNow;
        metadataRepo.Update(metadata);

        var history = new ApprovalHistory {
            ArticleMetadataId = metadata.Id,
            PageId = request.PageId,
            Action = request.Action,
            ActionBy = currentUser.UserId,
            ActionByDisplayName = currentUser.DisplayName,
            ActionDate = DateTime.UtcNow,
            Comment = request.Comment
        };
        await approvalRepo.AddAsync(history, ct);
        await db.SaveChangesAsync(ct);

        return ApiResponse<ApprovalHistoryDto>.Ok(new ApprovalHistoryDto(
            history.Id, history.PageId, history.Action,
            history.ActionBy, history.ActionByDisplayName,
            history.ActionDate, history.Comment));
    }
}
```

### PnPjs SharePoint Status Update (Frontend)
```typescript
// Update WH_Status column on a SharePoint page item
// Source: PnPjs list item update pattern (consistent with SharePointPageService read pattern)
import { SPFI } from '@pnp/sp';
import '@pnp/sp/items';

async function updateSharePointStatus(sp: SPFI, pageId: number, status: ArticleStatus): Promise<void> {
  await sp.web.lists.getByTitle('SitePages').items
    .getById(pageId).update({ WH_Status: status });
}
```

### Freigabecenter Pivot Layout
```typescript
// Fluent UI v8 Pivot with PivotItem tabs
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';

// Reviewer filter dropdown options derived from data
const reviewerOptions: IDropdownOption[] = [
  { key: 'all', text: 'Alle Pruefer' },
  ...uniqueReviewerNames.map(name => ({ key: name, text: name }))
];

<Dropdown
  label="Pruefer"
  options={reviewerOptions}
  selectedKey={selectedReviewer}
  onChange={(_, option) => setSelectedReviewer(option?.key as string)}
/>
<Pivot>
  <PivotItem headerText={'Ausstehend (' + pendingCount + ')'}>
    {/* PendingTab content */}
  </PivotItem>
  <PivotItem headerText={'Gemeldet (' + flaggedCount + ')'}>
    {/* FlaggedTab content */}
  </PivotItem>
  <PivotItem headerText={'Veraltet (' + staleCount + ')'}>
    {/* StaleTab content */}
  </PivotItem>
</Pivot>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Graph SDK in backend for SP updates | PnPjs in frontend for SP updates | Project architecture decision | No Graph SDK dependency in backend; frontend orchestrates dual-store |
| Separate approve/reject endpoints | Single POST /api/articles/{pageId}/approve with action field | Phase 4 scaffold | Validator handles action-specific rules (comment required for reject) |
| Mock handler with static data | Real EF Core handler with repository pattern | This phase | All status transition handlers become fully functional |

**Deprecated/outdated:**
- Mock data in `ApproveArticleHandler` -- replaced with real DB operations in this phase
- `ApprovalService.getPendingApprovals()` calling `/api/articles?status=InReview` -- this endpoint does not exist; implementation needs adjustment

## Open Questions

1. **Submit-for-review API endpoint**
   - What we know: Editors click "Zur Prufung einreichen" to transition Draft->InReview. This requires a backend endpoint.
   - What's unclear: Whether to reuse the existing `POST /api/articles/{pageId}/approve` with action="Submitted", or create a separate command.
   - Recommendation: Reuse the existing endpoint. Extend `ApproveArticleValidator` to accept action values "Submitted", "Approved", "Rejected". The handler checks the current status and validates the transition. Extend the validator to accept all three action types.

2. **Archive/restore API endpoints**
   - What we know: Reviewers click "Archivieren" (Published->Archived) and "Wiederherstellen" (Archived->Published) in the Article Sidebar.
   - What's unclear: Whether these are separate endpoints or reuse the approve endpoint.
   - Recommendation: Reuse the same `POST /api/articles/{pageId}/approve` endpoint with action values "Archived" and "Restored". The handler validates the transition based on current status. This keeps one endpoint for all status transitions.

3. **How to fetch flagged articles for Freigabecenter**
   - What we know: `IFlagRepository.GetUnresolvedAsync()` exists in the backend. No frontend service method or API endpoint exists.
   - What's unclear: Whether to create a new dedicated endpoint or extend an existing one.
   - Recommendation: Create a new `GET /api/articles/flagged` endpoint with `GetFlaggedArticlesQuery` and handler. Extend `IFlagService` with `getFlaggedArticles(): Promise<Result<IFlag[]>>`. Create `useFlaggedArticlesQuery` hook.

4. **How to get approval history for Article Sidebar**
   - What we know: `IApprovalRepository.GetByPageIdAsync()` exists. No frontend service method or API endpoint for fetching history.
   - What's unclear: Whether to extend the existing `GET /api/articles/{pageId}/status` response to include approval history, or create a separate endpoint.
   - Recommendation: Extend `GET /api/articles/{pageId}/status` response to include an `approvalHistory` array. This avoids a separate API call when the sidebar loads. Extend `IArticleStatus` on the frontend accordingly.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 27 (SPFx Heft built-in) |
| Config file | `spfx/node_modules/@microsoft/spfx-web-build-rig/profiles/default/config/jest.config.json` (framework-managed) |
| Quick run command | `cd spfx && npx jest --testPathPattern="freigabecenter\|articleSidebar" --passWithNoTests` |
| Full suite command | `cd spfx && npx heft test --clean` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| APPR-01 | Status transitions follow valid state machine | unit | `cd spfx && npx jest --testPathPattern="statusTransitions" -x` | No -- Wave 0 |
| APPR-02 | Approval/rejection recorded in ApprovalHistory | unit | `cd spfx && npx jest --testPathPattern="ApproveDialog\|RejectDialog" -x` | No -- Wave 0 |
| APPR-03 | Dual-store update (SQL + SP) | unit | `cd spfx && npx jest --testPathPattern="dualStore\|ApprovalActions" -x` | No -- Wave 0 |
| FREI-01 | Pending approvals list displays | unit | `cd spfx && npx jest --testPathPattern="PendingTab\|Freigabecenter" -x` | No -- Wave 0 |
| FREI-02 | Approve with optional comment | unit | `cd spfx && npx jest --testPathPattern="ApproveDialog" -x` | No -- Wave 0 |
| FREI-03 | Reject with required comment | unit | `cd spfx && npx jest --testPathPattern="RejectDialog" -x` | No -- Wave 0 |
| FREI-04 | Flagged articles list displays | unit | `cd spfx && npx jest --testPathPattern="FlaggedTab" -x` | No -- Wave 0 |
| FREI-05 | Content freshness alerts display | unit | `cd spfx && npx jest --testPathPattern="StaleTab" -x` | No -- Wave 0 |
| FREI-06 | Filter by assigned reviewer | unit | `cd spfx && npx jest --testPathPattern="Freigabecenter" -x` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `cd spfx && npx jest --testPathPattern="freigabecenter\|articleSidebar" --passWithNoTests`
- **Per wave merge:** `cd spfx && npx heft test --clean`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `spfx/src/webparts/freigabecenter/components/__tests__/Freigabecenter.test.tsx` -- covers FREI-01, FREI-06
- [ ] `spfx/src/webparts/freigabecenter/components/__tests__/PendingTab.test.tsx` -- covers FREI-01
- [ ] `spfx/src/webparts/freigabecenter/components/__tests__/ApproveDialog.test.tsx` -- covers FREI-02
- [ ] `spfx/src/webparts/freigabecenter/components/__tests__/RejectDialog.test.tsx` -- covers FREI-03
- [ ] `spfx/src/webparts/freigabecenter/components/__tests__/FlaggedTab.test.tsx` -- covers FREI-04
- [ ] `spfx/src/webparts/freigabecenter/components/__tests__/StaleTab.test.tsx` -- covers FREI-05
- [ ] `spfx/src/webparts/articleSidebar/components/__tests__/ApprovalActions.test.tsx` -- covers APPR-01, APPR-03
- [ ] `spfx/src/webparts/articleSidebar/components/__tests__/ApprovalHistory.test.tsx` -- covers APPR-02

*(All tests need to be created -- existing test files cover Phase 5 and 6 components only)*

## Sources

### Primary (HIGH confidence)
- Codebase inspection: all source files in `spfx/src/shared/`, `spfx/src/webparts/freigabecenter/`, `spfx/src/webparts/articleSidebar/`, `api/src/` -- verified current state of all interfaces, services, hooks, models, entities, repositories, handlers, and validators
- `07-CONTEXT.md` -- all locked decisions and discretion areas
- `REQUIREMENTS.md` -- APPR-01..03, FREI-01..06 requirement definitions
- `wissens-hub-spec.md` -- ApprovalHistory table schema, API endpoint contracts, Freigabecenter feature spec

### Secondary (MEDIUM confidence)
- `.planning/research/SUMMARY.md` -- dual-store update pattern (PnPjs frontend + Azure SQL backend), phase dependencies
- Phase 3/4/5/6 CONTEXT.md files -- established patterns for services, hooks, components, testing

### Tertiary (LOW confidence)
- None -- all findings verified against codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in use in prior phases, versions locked by SPFx
- Architecture: HIGH -- patterns directly derived from existing Phase 5 (Dashboard) and Phase 6 (Article Sidebar) implementations
- Pitfalls: HIGH -- identified from actual codebase gaps (missing endpoints, FK constraints, ES5 target issues documented in STATE.md)
- Dual-store pattern: MEDIUM -- the frontend-orchestrated approach is architecturally sound but has not been implemented before in this codebase; the specific error handling behavior (SP failure = warning, not error) is a locked decision from CONTEXT.md

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable -- no external library changes expected)
