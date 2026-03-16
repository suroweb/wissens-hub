# Phase 5: Dashboard Web Part - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the Dashboard Web Part as the central article browsing surface: article card grid and compact list views with toggle, search via SharePoint Search API, category/status/target group filters, stats bar with clickable quick-filters, unread mandatory article badges, favorite toggle, and role-specific elements (Editor: New Article button, Reviewer: pending reviews via stats bar filter). Feature-specific shared components (ArticleCard, SearchBar, StatsBar, FilterBar, etc.) are created here as they were deferred from Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Article card design
- Rich card layout: category badge (colored), title, author + relative date, unread dot indicator, favorite star, mandatory "Pflichtartikel" badge
- Category badges use auto-assigned deterministic colors from a predefined palette (hash-based from category name) — IT-Sicherheit always gets the same color, Datenschutz another, etc.
- Unread articles distinguished by colored left border accent (theme primary) + filled dot indicator
- Read articles have no border accent, no dot — clean/neutral appearance
- Mandatory articles show a warning-style "Pflichtartikel" badge at card bottom regardless of read status

### Compact list view
- Fluent UI DetailsList style with sortable columns: unread indicator, favorite star, title, category, author, relative date, mandatory badge
- Same visual indicators as card view (dot, star, mandatory badge) in compact row format
- Column sorting supported (click header to sort)

### Dashboard page layout
- Top-to-bottom structure: Stats Bar → Filter/Search Row → Article Grid/List
- Single scrolling column layout, no sidebar
- Stats bar at top showing: "X Ungelesen", "Y Favoriten", "Z Offen" (pending reviews, reviewer/admin only)
- Filter row contains: search input, category dropdown, status dropdown, target group dropdown, card/list view toggle, and "Neuer Artikel" button (editor/admin only via RoleGate)
- Active filters displayed as dismissible pills below the filter row

### Stats bar behavior
- Each stat item is clickable — acts as a quick-filter
- "Ungelesen" click filters to unread articles only
- "Favoriten" click filters to user's favorited articles
- "Offen" click filters to InReview status articles (reviewer/admin only, hidden for readers)
- Active stat filter highlighted visually; click again to clear
- Stats bar items are mutually exclusive with each other (clicking one clears the other stat filters) but combine with dropdown filters via AND

### Card grid responsiveness
- 3 columns in full-width zone, 2 columns in 2/3 column zone, 1 column in 1/3 zone
- Responsive to the web part's container width, not browser viewport
- Standard SharePoint section width detection pattern

### Search behavior
- SharePoint Search REST API for full-text search across page titles AND body content (DASH-07)
- Debounced input with 300ms delay
- Search results replace the article grid in same card/list layout
- Clearing search returns to normal article list
- Search combines with active filters via AND

### Filter behavior
- Category, status, target group as dropdown selectors (single-select per dropdown)
- Filters combine with AND across types: Category=X AND Status=Y AND TargetGroup=Z
- Client-side filtering on already-loaded article data (useArticlesQuery loads all published articles once)
- Active filters shown as dismissible pills; click × to remove individual filter
- "Filter zurücksetzen" link clears all active filters

### Sort order
- Default sort: recently updated first (Modified date descending)
- No special sort priority for unread mandatory articles — they're visually distinguished by accent border + badge instead
- List view supports click-to-sort on column headers

### Navigation & interactions
- Article click: same-tab navigation to SharePoint page URL (window.location = article.url). Browser back returns to dashboard.
- Favorite toggle: optimistic UI — star fills/empties instantly, API call in background, revert + error toast on failure
- "Neuer Artikel" button: navigates to SharePoint's native CreatePage.aspx URL. No custom form — leverages SharePoint's built-in page editor.
- Role-specific visibility: "Neuer Artikel" button gated by RoleGate minimumRole="editor". "Offen" stat gated by RoleGate minimumRole="reviewer".

### Empty states
- Contextual messages based on situation:
  - Search no results: "Keine Ergebnisse für '[query]'"
  - Filters no match: "Keine Artikel für diese Filter" with "Filter zurücksetzen" link
  - Empty hub: "Noch keine Artikel vorhanden" (editors see New Article button)

### Claude's Discretion
- Exact color palette for category badges
- Loading state implementation (shimmer vs skeleton)
- Exact spacing, typography, and card dimensions
- Error state handling for failed API/search calls
- SharePoint Search API query syntax details
- Whether to create ArticleCard/ArticleListRow as separate component files or inline
- Stats bar visual styling (Fluent UI MessageBar, custom, etc.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Dashboard requirements
- `wissens-hub-spec.md` §"Dashboard Web Part" — Full dashboard feature spec, card/list views, search, filters, stats bar, role sections
- `.planning/REQUIREMENTS.md` §"Dashboard Web Part" (DASH-01 through DASH-10) — All dashboard requirements
- `.planning/REQUIREMENTS.md` §"Reminders" (RMND-01) — Dashboard badges for unread mandatory articles

### Frontend architecture (Phase 3 foundation)
- `.planning/phases/03-frontend-architecture-service-layer/03-CONTEXT.md` — Service interfaces, hooks, models, mock data, role detection, WissensHubContext
- `wissens-hub-spec.md` §"Clean Architecture & Clean Code Principles" — Frontend layer structure, CQRS-lite hooks, Result pattern, QueryState/CommandState

### Backend API (Phase 4 foundation)
- `.planning/phases/04-backend-architecture-api-skeleton/04-CONTEXT.md` — API response format, endpoint contracts, ICurrentUser
- `wissens-hub-spec.md` §"Azure Functions API" — All 10 endpoint routes and contracts

### Data models
- `wissens-hub-spec.md` §"Data Architecture" — Two-layer data model, SharePoint columns (WH_ prefixed), Azure SQL tables

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `WissensHubContext` + `useWissensHub()` hook: provides services, currentUser, role to all components
- `RoleGate` component: role-based visibility wrapper (minimumRole prop)
- `useArticlesQuery()`: fetches all published articles via IPageService
- `useUnreadCountQuery()`: gets unread count via IApiClient → GET /api/articles/unread
- `useFavoritesQuery()`: gets user's favorites via IFavoriteService
- `usePendingApprovalsQuery()`: gets pending approvals via IApprovalService (reviewer/admin)
- `useToggleFavoriteCommand()`: toggles favorite via IFavoriteService
- `DashboardStatsDto`: { unreadCount, favoritesCount, pendingReviewsCount }
- `IArticlePage` domain model: id, title, category, status, isMandatory, targetGroups, modifiedDate, author, url
- All mock services with German sample data ready for workbench development

### Established Patterns
- Functional components with hooks (no class components in React)
- SCSS modules for styling (Dashboard.module.scss pattern)
- Fluent UI v8 components (DetailsList, Dropdown, SearchBox, Icon, etc.)
- QueryState<T> discriminated union for async state handling
- Result<T> for error propagation
- Service calls via hooks, never direct service access in components

### Integration Points
- Dashboard.tsx currently minimal (just displays user info) — will be fully rebuilt
- DashboardWebPart.ts already wraps Dashboard in WissensHubProvider
- AadHttpClient available in production mode for API calls
- PnPjs sp instance initialized in context for SharePoint queries
- SharePoint Search API accessible via PnPjs sp.search() or direct REST call

</code_context>

<specifics>
## Specific Ideas

No specific requirements — user consistently chose the recommended/conventional option across all areas, indicating a preference for clean, standard patterns with good information density.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-dashboard-web-part*
*Context gathered: 2026-03-16*
