# Phase 6: Article Sidebar & Read Confirmations - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the Article Sidebar web part that displays article metadata, read confirmation tracking, flag-as-outdated, favorite toggle, and dynamic table of contents. Read confirmations persist to Azure SQL via API with reset-on-major-version logic. The sidebar is placed on individual article pages (typically 1/3 column zone) alongside the article content. Approval workflow and Freigabecenter are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Sidebar layout & sections
- Stacked vertical sections (no tabs, no accordions): Metadata → Read Status/Actions → TOC → Version History link
- All sections always visible — no interaction needed to reveal content
- Designed for 1/3 column zone placement (article content in 2/3 zone)
- Sections separated by subtle dividers

### Metadata display
- Label-value pairs with Fluent UI Icons: each metadata field as icon + label + value
- Fields displayed: Autor (author), Kategorie (category), Zuletzt aktualisiert (last updated), Version, Status, Zielgruppen (target groups)
- German labels throughout (consistent with Phase 5)
- "Metadaten bearbeiten" button for Editors (SIDE-08) via RoleGate — links to SharePoint's native page properties panel, no custom form

### Mark-as-read UX
- Optimistic swap: button instantly changes from "Als gelesen markieren" to "Gelesen am [date]" on click
- API call (useMarkAsReadCommand) runs in background; revert + error toast on failure
- Consistent with Phase 5 optimistic UI pattern for favorites
- Mandatory unread articles show a prominent "Pflichtartikel" warning badge above the mark-as-read button
- Optional unread articles show the button without extra badge

### Read confirmation reset (READ-02)
- Reset triggered by major version change: when SharePoint page major version increments (re-publish after edit)
- Minor versions (drafts/autosave) do NOT reset confirmations
- API checks current page version vs. version at last confirmation — resets if major version > confirmed version
- Reset UX: yellow/orange warning banner "Dieser Artikel wurde aktualisiert. Bitte erneut bestatigen." with previous read date shown as strikethrough and "Erneut bestatigen" button

### Table of contents
- DOM scraping approach: query `.CanvasZone h2, .CanvasZone h3` on component mount
- Two levels: H2 as main sections, H3 as indented subsections
- H1 excluded (page title)
- Click-to-scroll with smooth scrolling to heading element
- Active section highlighting via IntersectionObserver — currently visible section highlighted in TOC
- If no headings found, TOC section is hidden entirely (not rendered)

### Flag-as-outdated flow (SIDE-04)
- Clicking "Als veraltet melden" opens a Fluent UI Dialog
- Dialog has a required freetext reason field (multi-line TextField) + Abbrechen/Melden buttons
- After submit: success toast + button changes to "Gemeldet am [date]" (disabled)
- One flag per user per article — cannot re-flag until reviewer resolves the flag
- Uses existing useFlagArticleCommand hook

### Favorite toggle (SIDE-05)
- Star icon button in actions section alongside flag button
- Filled star when favorited, outline star when not
- Optimistic toggle using existing useToggleFavoriteCommand hook
- Consistent with dashboard card favorite star

### Version history link (SIDE-07)
- Simple link at bottom of sidebar pointing to SharePoint's built-in version history page
- Standard SharePoint version history URL pattern

### Claude's Discretion
- Exact spacing, typography, and section divider styling
- Icon choices for each metadata field (Fluent UI icon names)
- Loading state implementation (shimmer for metadata section)
- Error state handling for failed API calls
- Exact CanvasZone DOM selector refinement for heading extraction
- IntersectionObserver threshold tuning for TOC active state
- Toast notification wording and duration

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Article Sidebar requirements
- `wissens-hub-spec.md` §"Web Part: Article Sidebar" — Full sidebar feature spec: metadata display, mark-as-read, flag, favorite, TOC, version history
- `.planning/REQUIREMENTS.md` §"Article Sidebar Web Part" (SIDE-01 through SIDE-08) — All sidebar requirements
- `.planning/REQUIREMENTS.md` §"Read Confirmations" (READ-01 through READ-03) — Read confirmation persistence, reset, unread count cross-reference

### Frontend architecture (Phase 3 foundation)
- `.planning/phases/03-frontend-architecture-service-layer/03-CONTEXT.md` — Service interfaces, hooks, models, mock data, role detection, WissensHubContext
- `wissens-hub-spec.md` §"Clean Architecture & Clean Code Principles" — Frontend layer structure, CQRS-lite hooks, Result pattern

### Dashboard patterns (Phase 5 reference)
- `.planning/phases/05-dashboard-web-part/05-CONTEXT.md` — Optimistic UI pattern for favorites, Pflichtartikel badge design, German label conventions, category badge colors

### Backend API (Phase 4 foundation)
- `.planning/phases/04-backend-architecture-api-skeleton/04-CONTEXT.md` — API response format, endpoint contracts
- `wissens-hub-spec.md` §"Azure Functions API" — Endpoint routes: GET /api/articles/{pageId}/status, POST /api/articles/{pageId}/read, POST /api/articles/{pageId}/flag

### Data models
- `wissens-hub-spec.md` §"Data Architecture" — Two-layer data model, SharePoint columns (WH_ prefixed), Azure SQL tables (ReadConfirmations, ArticleFlags, Favorites)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ArticleSidebar.tsx`: minimal scaffold (shows user info only) — needs full rebuild
- `ArticleSidebarWebPart.ts`: fully wired with WissensHubProvider, PnPjs, AadHttpClient, mockRole property pane
- `useMarkAsReadCommand`: command hook for POST /api/articles/{pageId}/read
- `useFlagArticleCommand`: command hook for POST /api/articles/{pageId}/flag with reason
- `useToggleFavoriteCommand`: command hook for POST /api/favorites/{pageId}
- `IReadConfirmationService`: getReadStatus(pageId), markAsRead(pageId), getReadStats(pageId)
- `IFlagService`: flagArticle(pageId, reason)
- `IFavoriteService`: getFavorites(), toggleFavorite(pageId)
- `MockReadConfirmationService`, `MockFlagService`, `MockFavoriteService`: mock implementations with German data
- `IReadConfirmation` model: pageId, userId, userDisplayName, readDate
- `RoleGate` component: role-based visibility wrapper (minimumRole prop)

### Established Patterns
- Functional components with hooks, SCSS modules
- Fluent UI v8 (Dialog, TextField, Icon, DefaultButton, etc.)
- Optimistic UI: toggle state immediately, API in background, revert on failure (Phase 5 favorites)
- CommandState/QueryState discriminated unions for async handling
- Result<T> for error propagation
- Service calls via hooks, never direct service access

### Integration Points
- ArticleSidebarWebPart.ts render() wraps ArticleSidebar in WissensHubProvider (already set up)
- PnPjs sp instance available for SharePoint page queries (version info, page properties)
- AadHttpClient available for Azure Functions API calls
- DOM access for CanvasZone heading extraction (same page context)
- SharePoint page version history URL: `{siteUrl}/_layouts/15/Versions.aspx?list={listId}&ID={itemId}`

</code_context>

<specifics>
## Specific Ideas

No specific requirements — user consistently chose the recommended/conventional option across all areas, indicating a preference for clean, standard patterns with good information density and optimistic UI interactions.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-article-sidebar-read-confirmations*
*Context gathered: 2026-03-16*
