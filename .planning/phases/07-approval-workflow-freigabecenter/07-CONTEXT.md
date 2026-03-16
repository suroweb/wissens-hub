# Phase 7: Approval Workflow & Freigabecenter - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Reviewers can manage article lifecycle through a dedicated approval center — approving, rejecting, and monitoring content quality. This includes the approval workflow state machine (Draft/InReview/Published/Archived transitions with dual-store updates), approve/reject actions with comment dialogs, and the Freigabecenter web part with pending approvals, flagged articles, and content freshness alerts. The submit-for-review action is added to the Article Sidebar for editors. Archive/restore actions are added to the Article Sidebar for reviewers. Approval history is displayed in the Article Sidebar. Email notifications and admin-configurable freshness thresholds belong in later phases.

</domain>

<decisions>
## Implementation Decisions

### Freigabecenter layout
- Fluent UI Pivot with 3 tabs: "Ausstehend" (pending approvals), "Gemeldet" (flagged articles), "Veraltet" (stale content)
- Tab badges show item counts per tab
- One section visible at a time — clean, focused view per concern
- Reviewer filter dropdown at top applies across all three tabs (FREI-06)
- Filter by assigned reviewer — filters "Ausstehend" by assigned reviewer, "Gemeldet" and "Veraltet" by articles where that person is the assigned reviewer
- Tab counts update dynamically when filter changes

### Pending approvals tab (Ausstehend)
- Rich card layout per pending article: category badge, title, author + submission date, assigned reviewer, target groups
- Inline "Genehmigen" and "Ablehnen" buttons on each card
- Consistent with Dashboard card pattern from Phase 5

### Approve/reject UX
- Both actions open a Fluent UI Dialog (consistent with Phase 6 FlagDialog pattern)
- Approve dialog: title "Artikel genehmigen", article name, optional comment field, Abbrechen/Genehmigen buttons
- Reject dialog: title "Artikel ablehnen", article name, required comment field ("Begründung"), Abbrechen/Ablehnen buttons
- After successful action: card is optimistically removed from list, tab count decrements, success toast ("Artikel genehmigt" or "Artikel abgelehnt")
- If API fails: card reappears, error toast

### Approval history display
- Shown in Article Sidebar only (not in Freigabecenter) — keeps Freigabecenter focused on actionable items
- Sidebar shows chronological history: action type, who, when, comment
- Reviewer navigates to article page to see full history

### Flagged articles tab (Gemeldet)
- Cards show: warning icon, article title, who flagged it, when, and the flag reason text
- "Artikel öffnen" link to navigate to the article page
- No inline resolve action — reviewer reads the article first, then decides what to do

### Content freshness tab (Veraltet)
- Stale = Published articles where (today - lastModified) > 90 days threshold
- Only Published articles are checked (not Archived, Draft, or InReview)
- Threshold hardcoded to 90 days for now — admin-configurable in Phase 9
- Age-colored cards: yellow border/icon (90-120 days), orange (120-180 days), red (180+ days)
- Cards show: article title, category badge, last modified date, days-since-modified count
- "Artikel öffnen" link to navigate
- Sorted oldest first (most urgent at top)

### Status transition state machine
- Draft → InReview: Editor clicks "Zur Prüfung einreichen" in Article Sidebar
- InReview → Published: Reviewer approves in Freigabecenter
- InReview → Draft: Reviewer rejects in Freigabecenter (editor must fix and resubmit)
- Published → Archived: Reviewer/Admin clicks "Archivieren" in Article Sidebar
- Archived → Published: Reviewer/Admin clicks "Wiederherstellen" in Article Sidebar
- No Published → Draft path — editors edit in-place and resubmit for review

### Dual-store update pattern (APPR-03)
- Frontend calls Azure Functions API for all status transitions
- Handler updates Azure SQL first (ApprovalHistory record + ArticleMetadata.Status)
- Handler then updates SharePoint WH_Status column
- If SharePoint update fails: SQL stays updated (source of truth), log warning, frontend shows success
- SQL is always the authoritative source for article status

### Article Sidebar extensions
- Editor view: "Zur Prüfung einreichen" button (visible when status=Draft, gated by RoleGate minimumRole="editor")
- Reviewer view: "Archivieren" button (visible when status=Published, gated by RoleGate minimumRole="reviewer")
- Reviewer view: "Wiederherstellen" button (visible when status=Archived, gated by RoleGate minimumRole="reviewer")
- Approval history section showing chronological actions list

### Claude's Discretion
- Exact card spacing, typography, and divider styling
- Fluent UI Pivot styling customization
- Loading state implementation (shimmer for each tab)
- Error state handling for failed data fetches
- Empty state messages per tab ("Keine ausstehenden Genehmigungen", etc.)
- How to fetch flagged articles (new API endpoint or extend existing)
- Toast notification wording and duration
- Exact color values for freshness age bands (yellow/orange/red)
- Whether archive/restore buttons need confirmation dialogs
- Animation style for optimistic card removal

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Approval workflow & Freigabecenter requirements
- `wissens-hub-spec.md` §"Web Part: Freigabecenter (Approval Center)" — Full Freigabecenter feature spec: pending approvals, approve/reject, flagged articles, freshness alerts, reviewer filter
- `.planning/REQUIREMENTS.md` §"Freigabecenter Web Part" (FREI-01 through FREI-06) — All Freigabecenter requirements
- `.planning/REQUIREMENTS.md` §"Approval Workflow" (APPR-01 through APPR-03) — Status transitions, approval history, dual-store update

### Frontend architecture (Phase 3 foundation)
- `.planning/phases/03-frontend-architecture-service-layer/03-CONTEXT.md` — Service interfaces, hooks, models, mock data, role detection, WissensHubContext

### Dashboard patterns (Phase 5 reference)
- `.planning/phases/05-dashboard-web-part/05-CONTEXT.md` — Card layout pattern, category badge colors, German label conventions, optimistic UI, stats bar pattern

### Article Sidebar patterns (Phase 6 reference)
- `.planning/phases/06-article-sidebar-read-confirmations/06-CONTEXT.md` — FlagDialog pattern (Fluent UI Dialog with required comment), sidebar section layout, optimistic UI for actions, RoleGate usage

### Backend API (Phase 4 foundation)
- `.planning/phases/04-backend-architecture-api-skeleton/04-CONTEXT.md` — API response format, MediatR CQRS, endpoint contracts
- `wissens-hub-spec.md` §"Azure Functions API" — POST /api/articles/{pageId}/approve endpoint contract

### Data models
- `wissens-hub-spec.md` §"Data Architecture" — ApprovalHistory table schema, ArticleMetadata status field, SharePoint WH_Status column

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `IApprovalService`: `getPendingApprovals()`, `approveArticle(pageId, comment?)`, `rejectArticle(pageId, comment)` — fully defined
- `ApprovalService` + `MockApprovalService`: production and mock implementations ready
- `useApproveArticleCommand`, `useRejectArticleCommand`: command hooks wired to approval service
- `usePendingApprovalsQuery`: query hook for fetching pending approvals
- `IApprovalAction` model + `ApprovalDto` + `approvalMapper`: domain model, DTO, and mapper for approval history
- `ArticleStatus` type: `'Draft' | 'InReview' | 'Published' | 'Archived'` — all four states defined
- `IArticlePage`: includes `reviewerName` and `reviewByDate` fields for reviewer assignment
- `RoleGate` component: role-based visibility wrapper
- `FreigabecenterWebPart.ts`: scaffold with WissensHubProvider, PnPjs, AadHttpClient, mockRole property pane
- Phase 6 `FlagDialog` component: reusable pattern for Fluent UI Dialog with comment field

### Established Patterns
- Functional components with hooks, SCSS modules
- Fluent UI v8 (Pivot, Dialog, TextField, Icon, DetailsList, etc.)
- Optimistic UI: update state immediately, API in background, revert on failure
- QueryState<T> / CommandState discriminated unions for async handling
- Result<T> for error propagation
- Service calls via hooks, never direct service access
- German labels throughout ("Genehmigen", "Ablehnen", "Archivieren", etc.)

### Integration Points
- FreigabecenterWebPart.ts render() wraps Freigabecenter in WissensHubProvider (already set up)
- Backend `ApproveArticleCommand` with MediatR handler (currently stubbed — needs real implementation)
- Backend `ApproveArticleValidator`: validates action is 'Approved'/'Rejected', requires comment on reject
- `IApprovalRepository` with EF Core implementation: `GetByPageIdAsync`, `GetLatestByPageIdAsync`, `AddAsync`
- `ApprovalHistory` entity with EF Core config (cascade delete, index on PageId)
- Backend handler needs: update ArticleMetadata.Status + create ApprovalHistory + update SharePoint column
- Mock data: article ID 7 ("Datensicherung-Konzept") has status='InReview' for testing

</code_context>

<specifics>
## Specific Ideas

No specific requirements — user consistently chose the recommended/conventional option across all areas, indicating a preference for clean, standard patterns with consistent card-based UI and optimistic interactions.

</specifics>

<deferred>
## Deferred Ideas

- Admin-configurable freshness threshold — Phase 9 (Admin Panel)
- Email notifications for overdue articles — Phase 9 (RMND-02)
- Background sync job for SP/SQL reconciliation — Phase 10

</deferred>

---

*Phase: 07-approval-workflow-freigabecenter*
*Context gathered: 2026-03-16*
