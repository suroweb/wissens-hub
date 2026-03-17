# Phase 10: Caching, Telemetry, UX Polish & i18n - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Cross-cutting production quality layer applied to all existing web parts and the Application Customizer. Adds multi-layer caching (PnPjs session + in-memory API + stale-while-revalidate hooks), Application Insights telemetry with cost-safe config, Error Boundaries + toast notifications, shimmer loading skeletons, responsive design, accessibility, and German/English internationalization. No new features or UI surfaces — this phase hardens what exists.

</domain>

<decisions>
## Implementation Decisions

### Caching strategy
- PnPjs Caching behavior with uniform 5-minute session store TTL for all SharePoint queries (articles, groups, user info)
- CacheService as a singleton in IServiceContainer — one shared in-memory Map with TTL, accessible by all hooks
- Stale-while-revalidate in query hooks: show cached data immediately, silently swap to fresh data when it arrives (no visual "refreshing" indicator)
- Cache invalidation on write commands only (mark-as-read, favorite, approve/reject) — no window focus invalidation
- Per-data TTLs in CacheService follow the spec: unread count 60s, read stats 2min, favorites 5min, pending approvals 30s, dashboard stats 60s

### Telemetry & error handling
- Application Insights connection string configured as a web part property in the property pane — empty value falls back to ConsoleTelemetryService for local dev
- ITelemetryService interface added to IServiceContainer with two implementations: AppInsightsTelemetryService (production) and ConsoleTelemetryService (local dev)
- Cost-safe config: disableFetchTracking and disableAjaxTracking enabled to prevent SharePoint background HTTP call logging
- Telemetry wired at hook level: command hooks (useMarkAsReadCommand, useFavoriteToggleCommand, etc.) auto-track events on success/failure — components don't call trackEvent directly
- 9 custom events: article_read, article_flagged, article_favorited, article_approved, article_rejected, dashboard_loaded, search_executed, error_api_call, error_sharepoint
- React Error Boundary wrapping each web part root — shows simple "Something went wrong" card with "Reload" button, Fluent UI styled. No expandable error details.
- Toast notifications via Fluent UI MessageBar at top of each web part, auto-dismiss after 5 seconds. Success/error/warning types.

### UX polish
- Full shimmer skeletons for key surfaces: Dashboard (card grid + stats bar), Article Sidebar (metadata section), Freigabecenter (approval list), Admin Panel (report table). Smaller sub-components use Spinner.
- Optimistic UI scope stays as-is: mark-as-read and favorite toggle only. Approve/reject stays synchronous (high-stakes actions).
- Responsive design: fluid containers with breakpoints — card grid switches 3-col to 2-col to 1-col, tables become card lists on narrow zones. Standard breakpoints for full-width, 2/3, and 1/3 column zones.
- WCAG AA essentials: ARIA labels on all interactive elements, keyboard navigation for cards/lists/dialogs, focus trap in flyouts/dialogs, skip-to-content where applicable.
- Debounced search (already exists as a pattern — formalize across all search inputs).

### Internationalization
- Shared strings module in src/shared/loc/ for common labels (buttons, statuses, roles, common terms like "Veroffentlicht", "Kategorie") + per-web-part loc/ folders for component-specific strings
- Extension (Unread Badge) uses its own loc/ folder (already scaffolded, needs de-de.js and real strings)
- All ~200+ hardcoded German strings extracted in one pass — German as de-de.js (default), English as en-us.js
- Language detection via SharePoint UI language setting (context.pageContext.cultureInfo.currentUICultureName), fallback to German
- SPFx built-in localization module pattern (define/require) — no external i18n library needed

### Claude's Discretion
- Exact shimmer skeleton layouts per component
- MessageBar positioning CSS within web parts
- Specific ARIA role assignments per interactive element
- CacheService key naming conventions
- Error Boundary class component implementation details (must be class component — React limitation)
- Toast auto-dismiss timing adjustments if 5s feels too short/long

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Caching
- `wissens-hub-spec.md` — Caching Strategy section: PnPjs Caching import, CacheService class, stale-while-revalidate hook pattern, invalidation strategy, TTL table, backend IMemoryCache
- `spfx/src/shared/context/pnpSetup.ts` — Current PnPjs setup (no caching yet — needs Caching behavior added)
- `spfx/src/shared/context/ServiceContainer.ts` — IServiceContainer interface (needs CacheService and ITelemetryService added)

### Telemetry & errors
- `wissens-hub-spec.md` — Application Insights section: ITelemetryService interface, AppInsightsTelemetryService, ConsoleTelemetryService, Error Boundary, useToast hook, cost-safe config, custom events list
- `spfx/src/shared/context/ServiceContainer.ts` — Service container to extend

### UX polish
- `wissens-hub-spec.md` — UX Quality section: shimmer, optimistic UI, debounced search, responsive, accessibility
- `spfx/src/webparts/articleSidebar/components/ReadStatusSection.tsx` — Existing optimistic UI pattern (mark-as-read + favorite toggle with rollback)
- `spfx/src/webparts/dashboard/components/Dashboard.tsx` — Existing optimistic favorite toggle pattern

### Internationalization
- `spfx/src/webparts/dashboard/loc/en-us.js` — Existing SPFx loc scaffold pattern (currently only scaffolding strings)
- `spfx/src/webparts/dashboard/loc/mystrings.d.ts` — TypeScript interface for loc strings
- `spfx/src/extensions/unreadBadge/loc/en-us.js` — Extension loc scaffold

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ServiceContainer.ts` (IServiceContainer): Add CacheService and ITelemetryService to the container interface
- `pnpSetup.ts` (getSP): Extend with PnPjs Caching behavior import
- `Result.ts` (Result<T> pattern): Already used by all services — toast and telemetry hook into success/failure paths
- `WissensHubContext.tsx`: Provider that initializes services — needs to create telemetry and cache service instances
- Per-web-part loc/ folders: Already scaffolded with en-us.js + mystrings.d.ts (need de-de.js and real strings)

### Established Patterns
- Optimistic UI with rollback: ReadStatusSection.tsx and Dashboard.tsx both use `setLocal → execute → revert on failure` pattern
- Command/query hook split: useMarkAsReadCommand, useFavoriteToggleCommand (commands), useArticlesQuery (queries) — telemetry hooks into commands
- React.createElement usage in web part roots (not JSX) — Error Boundary wraps at this level
- SCSS modules per component — responsive media queries go here
- Props-based children pattern for createElement (Phase 03-03 decision)

### Integration Points
- Each web part's .ts class (e.g., DashboardWebPart.ts): Add appInsightsConnectionString to property pane
- Each web part's render(): Wrap in ErrorBoundary, provide ToastProvider
- All query hooks: Add stale-while-revalidate with CacheService
- All command hooks: Add telemetry.trackEvent calls
- All components with hardcoded German strings: Replace with loc references

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Follow the spec's code examples closely for caching and telemetry implementation.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 10-caching-telemetry-ux-polish-i18n*
*Context gathered: 2026-03-17*
