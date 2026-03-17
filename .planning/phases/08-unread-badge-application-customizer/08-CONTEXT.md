# Phase 8: Unread Badge Application Customizer - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the Unread Badge Application Customizer that renders a persistent notification icon with unread article count in the SharePoint site header across every page in the hub. Clicking the icon opens a flyout panel listing unread article summaries with direct navigation to article pages. Cross-web-part communication via DOM CustomEvent allows the badge count to update when articles are marked as read in the Article Sidebar. Admin Panel, caching, and telemetry are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Badge & icon design
- Fluent UI Ringer (bell) icon in the header — familiar notification pattern matching Teams/Outlook
- Red circle badge overlay showing exact unread count, capped at "99+"
- Positioned in SPFx PlaceholderContent.Top, right-aligned in the header bar
- When unread count is zero: icon remains visible, red badge hidden. Icon still clickable — flyout shows empty state
- Badge uses standard red (#D13438 or theme error color) with white text

### Flyout panel content
- Fluent UI Panel component (side drawer) sliding in from the right
- Header: "X ungelesene Artikel" with count
- Each item shows: article title, category badge (colored, matching dashboard pattern), relative date ("vor 2 Std.")
- Mandatory (Pflichtartikel) articles sorted to top with "Pflichtartikel" badge — consistent with dashboard pattern from Phase 5
- Maximum 10 items displayed. If more exist, "Alle X anzeigen" link at bottom navigates to dashboard with unread filter active
- Empty state: checkmark icon + "Alle Artikel gelesen!" message

### Data loading & refresh
- Fetch unread data once on page load via GET /api/articles/unread — no polling
- Count updates naturally on next page navigation (SharePoint page load triggers onInit again)
- Direct AadHttpClient from Application Customizer's own SPFx context — no dependency on web part service container
- Cross-web-part update: Article Sidebar dispatches CustomEvent('wissenshub:article-read', { detail: { pageId } }) on document after mark-as-read. Application Customizer listens, decrements count, and removes article from flyout list

### Flyout interactions
- Click article: navigate in same tab (window.location), panel auto-closes. Browser back returns to previous page. Consistent with Phase 5 dashboard navigation
- No mark-as-read from flyout — click-to-navigate only. Mark-as-read happens on the article page via sidebar
- Light dismiss enabled (isLightDismiss=true) — clicking outside panel or pressing Escape closes it
- Panel close button (X) in header

### Claude's Discretion
- Panel width (small or custom width)
- Exact badge positioning offset relative to the bell icon
- Loading state while fetching unread data (shimmer or spinner)
- Error state handling for failed API calls
- Mock data approach for workbench testing (inline mock vs mock service)
- Exact SCSS styling and spacing
- Whether to render React component tree via ReactDOM.render in the placeholder DOM element or use createElement approach
- "Alle X anzeigen" dashboard URL construction (with unread filter query parameter)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Application Customizer requirements
- `wissens-hub-spec.md` §"Application Customizer: Unread Badge Header" — Feature spec: header notification icon, flyout panel, article navigation
- `.planning/REQUIREMENTS.md` §"Unread Badge Application Customizer" (BADGE-01 through BADGE-03) — All badge requirements

### Frontend architecture (Phase 3 foundation)
- `.planning/phases/03-frontend-architecture-service-layer/03-CONTEXT.md` — Service interfaces, domain models, Result pattern, QueryState/CommandState
- `wissens-hub-spec.md` §"Clean Architecture & Clean Code Principles" — Frontend layer structure

### Dashboard patterns (Phase 5 reference)
- `.planning/phases/05-dashboard-web-part/05-CONTEXT.md` — Category badge colors, Pflichtartikel badge, relative date formatting, article navigation pattern

### Article Sidebar (Phase 6 — event source)
- `.planning/phases/06-article-sidebar-read-confirmations/06-CONTEXT.md` — Mark-as-read flow, optimistic UI pattern — sidebar will dispatch CustomEvent for cross-component update

### Backend API
- `.planning/phases/04-backend-architecture-api-skeleton/04-CONTEXT.md` — API response format, endpoint contracts
- `wissens-hub-spec.md` §"Azure Functions API" — GET /api/articles/unread endpoint contract

### SPFx Application Customizer
- `spfx/src/extensions/unreadBadge/UnreadBadgeApplicationCustomizer.ts` — Existing shell (Phase 1 scaffold, console.log only)
- `spfx/src/extensions/unreadBadge/UnreadBadgeApplicationCustomizer.manifest.json` — Extension manifest with component ID

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `UnreadBadgeApplicationCustomizer.ts`: bare shell extending BaseApplicationCustomizer — needs full implementation with placeholder rendering and React component tree
- `useUnreadCountQuery` hook: fetches DashboardStatsDto via IApiClient — pattern reference, but customizer will use direct AadHttpClient instead
- `DashboardStatsDto`: { unreadCount, favoritesCount, pendingReviewsCount } — badge count comes from unreadCount
- `IArticlePage` domain model: id, title, category, status, isMandatory, targetGroups, modifiedDate, author, url — flyout items map to this
- Category badge coloring logic from Dashboard ArticleCard — reuse deterministic color palette
- Relative date formatting utility from Dashboard — reuse "vor X Std/Tagen" formatter

### Established Patterns
- Functional React components with hooks, SCSS modules
- Fluent UI v8 (Panel, Icon, etc.)
- SPFx Application Customizer uses `this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top)` to render into header
- ReactDOM.render() to mount React component tree into placeholder DOM element
- German labels throughout (consistent with Phases 5-7)

### Integration Points
- `this.context.aadHttpClientFactory` for API authentication — same pattern as web parts but accessed from extension context
- PlaceholderContent.Top placeholder for header rendering
- Document-level CustomEvent('wissenshub:article-read') — Article Sidebar dispatches, customizer listens
- Dashboard page URL for "Alle X anzeigen" link with filter parameter

</code_context>

<specifics>
## Specific Ideas

No specific requirements — user consistently chose the recommended/conventional option across all areas, indicating a preference for standard, clean patterns with good information density and familiar notification UX.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-unread-badge-application-customizer*
*Context gathered: 2026-03-17*
