# Phase 5: Dashboard Web Part - Research

**Researched:** 2026-03-16
**Domain:** SPFx Dashboard UI (Fluent UI v8, PnPjs Search, SharePoint Search REST API, SCSS Modules)
**Confidence:** HIGH

## Summary

Phase 5 builds the central dashboard web part -- the primary user-facing surface of WissensHub. The foundation is solid: Phase 3 delivered all service interfaces, hooks (useArticlesQuery, useFavoritesQuery, useUnreadCountQuery, usePendingApprovalsQuery, useToggleFavoriteCommand), mock data with 10 German sample articles, RoleGate component, and the WissensHubContext provider. Phase 4 delivered all 10 API endpoints. The Dashboard.tsx is currently a minimal placeholder showing user info. This phase fully rebuilds it.

The implementation centers on Fluent UI v8 components (DetailsList for list view, SearchBox for search, Dropdown for filters, Shimmer for loading states, Icon for indicators) combined with custom React components (ArticleCard, StatsBar, FilterBar) styled via SCSS modules. SharePoint Search REST API via PnPjs `sp.search()` handles full-text search across page titles and body content. All other data filtering is client-side against the already-loaded article array from useArticlesQuery.

**Primary recommendation:** Build UI components in layers -- first static article display (card + list), then interactive features (search, filters, stats), then role-specific elements. Use the existing hook infrastructure directly; no new services or API endpoints needed. Responsive card grid uses CSS Grid with container-width detection via `this.width` / `onAfterResize` passed through context.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Rich card layout: category badge (colored), title, author + relative date, unread dot indicator, favorite star, mandatory "Pflichtartikel" badge
- Category badges use auto-assigned deterministic colors from a predefined palette (hash-based from category name)
- Unread articles distinguished by colored left border accent (theme primary) + filled dot indicator
- Read articles have no border accent, no dot
- Mandatory articles show warning-style "Pflichtartikel" badge at card bottom regardless of read status
- Compact list view: Fluent UI DetailsList style with sortable columns: unread indicator, favorite star, title, category, author, relative date, mandatory badge
- Dashboard layout top-to-bottom: Stats Bar -> Filter/Search Row -> Article Grid/List
- Single scrolling column layout, no sidebar
- Stats bar: "X Ungelesen", "Y Favoriten", "Z Offen" (reviewer/admin only)
- Filter row: search input, category dropdown, status dropdown, target group dropdown, card/list view toggle, "Neuer Artikel" button (editor/admin via RoleGate)
- Active filters displayed as dismissible pills below the filter row
- Stats bar items are clickable quick-filters, mutually exclusive with each other but AND-combine with dropdown filters
- Card grid: 3 columns full-width, 2 columns 2/3, 1 column 1/3 -- responsive to web part container width
- SharePoint Search REST API for full-text search across page titles AND body content
- Debounced input with 300ms delay
- Search results replace article grid in same card/list layout
- Category/status/target group as single-select dropdowns, combine with AND
- Client-side filtering on already-loaded article data
- Default sort: recently updated first (Modified date descending)
- No special sort priority for unread mandatory articles
- Article click: same-tab navigation via window.location = article.url
- Favorite toggle: optimistic UI with revert + error toast on failure
- "Neuer Artikel" button navigates to CreatePage.aspx
- RoleGate minimumRole="editor" for New Article button, minimumRole="reviewer" for "Offen" stat
- Empty states with contextual German messages

### Claude's Discretion
- Exact color palette for category badges
- Loading state implementation (shimmer vs skeleton)
- Exact spacing, typography, and card dimensions
- Error state handling for failed API/search calls
- SharePoint Search API query syntax details
- Whether to create ArticleCard/ArticleListRow as separate component files or inline
- Stats bar visual styling

### Deferred Ideas (OUT OF SCOPE)
None

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DASH-01 | View published articles in card grid or compact list view (toggle) | ArticleCard component + DetailsList + CSS Grid responsive layout + view toggle state |
| DASH-02 | See unread mandatory articles with reminder badges | Cross-reference useUnreadCountQuery data with articles; left border accent + "Pflichtartikel" badge |
| DASH-03 | See recently updated articles | Default sort by Modified descending already in useArticlesQuery / SharePointPageService |
| DASH-04 | Toggle favorites from dashboard | useToggleFavoriteCommand hook + optimistic UI pattern with star icon |
| DASH-05 | Stats bar showing unread count, favorites count, pending reviews count | useUnreadCountQuery returns DashboardStatsDto; StatsBar component with clickable items |
| DASH-06 | Filter by category, status, target group | Fluent UI Dropdown components + client-side array filtering + dismissible pills |
| DASH-07 | Search across titles and page body via SharePoint Search API | PnPjs sp.search() with contentclass:STS_SitePage + path scoping + selectProperties |
| DASH-08 | Click article to navigate to SharePoint page | window.location.href = article.url on card/row click |
| DASH-09 | Editor sees "New Article" button | RoleGate minimumRole="editor" wrapping button that navigates to CreatePage.aspx |
| DASH-10 | Reviewer sees "Pending Reviews" section | RoleGate minimumRole="reviewer" around "Offen" stat item in StatsBar; clicking filters to InReview |
| RMND-01 | Dashboard badges for unread mandatory articles | Unread mandatory articles: left accent border + filled dot + "Pflichtartikel" warning badge |

</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @fluentui/react | ^8.106.4 | UI components: DetailsList, SearchBox, Dropdown, Icon, Shimmer | SPFx 1.22.2 bundled; locked to v8 |
| @pnp/sp | 4.18.0 | SharePoint REST + Search API client | PnPjs v4 for SPFx 1.22.x; already initialized in project |
| React | 17.0.1 | Component framework | Locked by SPFx 1.22.2 |
| TypeScript | ~5.8.0 | Type system | Already configured |

### Supporting (no new dependencies)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @pnp/sp/search | 4.18.0 (submodule) | `sp.search()` for full-text search | Import `@pnp/sp/search` for search API access |
| Intl.RelativeTimeFormat | Native API | "vor 2 Tagen" relative date formatting | German locale `de-DE`; no library needed |
| CSS Grid | Native CSS | Responsive card grid layout | 3/2/1 column layouts based on container width |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| PnPjs sp.search() | Direct REST call to /_api/search | PnPjs wraps the REST call with typed results; no reason to go lower level |
| CSS Grid | Fluent UI Stack with breakpoints | CSS Grid is simpler for card grids; Stack is better for linear layouts |
| Intl.RelativeTimeFormat | date-fns/timeago.js | Native API has full German locale support; zero bundle impact |

**Installation:** No new packages needed. All dependencies exist in the project.

## Architecture Patterns

### Recommended Project Structure
```
spfx/src/
├── webparts/dashboard/
│   ├── DashboardWebPart.ts              # Existing: passes width to context
│   └── components/
│       ├── Dashboard.tsx                 # Main orchestrator: data loading, state, layout
│       ├── Dashboard.module.scss         # Existing: will be significantly expanded
│       ├── IDashboardProps.ts            # Existing: needs width prop added
│       ├── StatsBar.tsx                  # Stats bar: unread, favorites, pending reviews
│       ├── FilterBar.tsx                 # Search + dropdowns + view toggle + pills
│       ├── ArticleCard.tsx              # Card grid item component
│       ├── ArticleListView.tsx          # DetailsList wrapper with sortable columns
│       └── EmptyState.tsx               # Contextual empty state messages
```

### Pattern 1: Container Width Propagation for Responsive Grid
**What:** DashboardWebPart.ts detects container width via `this.width` and `onAfterResize()` (SPFx 1.12+ API), passes it as a prop through to Dashboard.tsx. Dashboard determines column count (3/2/1) based on width breakpoints.
**When to use:** For responsive card grid that adapts to SharePoint section column width.
**Example:**
```typescript
// DashboardWebPart.ts - add to existing class
protected onAfterResize(newWidth: number): void {
  // Re-render with new width
  this.render();
}

public render(): void {
  const child = React.createElement(Dashboard, {
    ...existingProps,
    containerWidth: this.width, // pass current width
  });
  // ... wrap in WissensHubProvider as before
}

// Dashboard.tsx - determine grid columns
function getGridColumns(width: number): number {
  if (width > 800) return 3;   // Full-width zone
  if (width > 480) return 2;   // 2/3 column zone
  return 1;                     // 1/3 column zone
}
```
Source: [Microsoft Learn - Determine web part width](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/basics/determine-web-part-width)

### Pattern 2: Composite Filter State with useMemo
**What:** All filter state (search, category, status, targetGroup, statFilter, viewMode) managed in Dashboard.tsx. Filtered articles computed via useMemo to avoid re-filtering on every render.
**When to use:** When multiple filters combine (AND logic) over a loaded dataset.
**Example:**
```typescript
interface IDashboardFilters {
  search: string;
  category: string;          // '' = all
  status: ArticleStatus | ''; // '' = all
  targetGroup: string;        // '' = all
  statFilter: 'unread' | 'favorites' | 'pending' | '';
  viewMode: 'card' | 'list';
}

// In Dashboard.tsx
const filteredArticles = React.useMemo(() => {
  let result = articles;
  if (filters.category) result = result.filter(a => a.category === filters.category);
  if (filters.status) result = result.filter(a => a.status === filters.status);
  if (filters.targetGroup) result = result.filter(a => a.targetGroups.includes(filters.targetGroup));
  if (filters.statFilter === 'unread') result = result.filter(a => !readPageIds.has(a.id));
  if (filters.statFilter === 'favorites') result = result.filter(a => favoritePageIds.has(a.id));
  if (filters.statFilter === 'pending') result = result.filter(a => a.status === 'InReview');
  return result;
}, [articles, filters, readPageIds, favoritePageIds]);
```

### Pattern 3: SharePoint Search with PnPjs
**What:** Full-text search using `sp.search()` with content class filtering to scope to Site Pages only within the current site.
**When to use:** When user types in search box (after 300ms debounce).
**Example:**
```typescript
import '@pnp/sp/search';
import { SearchResults } from '@pnp/sp/search';

async function searchArticles(sp: SPFI, queryText: string, siteUrl: string): Promise<IArticlePage[]> {
  const results: SearchResults = await sp.search({
    Querytext: `${queryText} contentclass:STS_SitePage path:${siteUrl}/SitePages`,
    SelectProperties: ['Title', 'Path', 'LastModifiedTime', 'Author', 'ListItemID'],
    RowLimit: 50,
    TrimDuplicates: false,
  });

  return results.PrimarySearchResults.map(item => ({
    id: parseInt(item.ListItemID, 10),
    title: item.Title,
    url: item.Path,
    // Other fields need to be enriched from the loaded articles array
  }));
}
```

### Pattern 4: Optimistic Favorite Toggle
**What:** Immediately update UI (fill/empty star), fire API call in background, revert on failure.
**When to use:** For the favorite star toggle on cards and list rows.
**Example:**
```typescript
const handleToggleFavorite = React.useCallback(async (pageId: number) => {
  // Optimistic: toggle local state immediately
  setLocalFavorites(prev => {
    const has = prev.has(pageId);
    const next = new Set(prev);
    has ? next.delete(pageId) : next.add(pageId);
    return next;
  });

  // Fire command
  const success = await toggleFavorite.execute(pageId);
  if (!success) {
    // Revert on failure
    setLocalFavorites(prev => {
      const next = new Set(prev);
      next.has(pageId) ? next.delete(pageId) : next.add(pageId);
      return next;
    });
    // Show error toast (Phase 10 adds ToastProvider; for now console.warn)
  }
}, [toggleFavorite]);
```

### Pattern 5: Deterministic Category Color Palette
**What:** Hash-based color assignment from category name so the same category always gets the same color.
**When to use:** Category badges on cards and list rows.
**Example:**
```typescript
const CATEGORY_COLORS: string[] = [
  '#0078d4', // blue
  '#107c10', // green
  '#d83b01', // orange
  '#5c2d91', // purple
  '#008272', // teal
  '#b4009e', // magenta
  '#e3008c', // pink
  '#004e8c', // dark blue
  '#498205', // olive
  '#986f0b', // gold
];

function getCategoryColor(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = ((hash << 5) - hash + category.charCodeAt(i)) | 0;
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}
```

### Anti-Patterns to Avoid
- **Fetching data in child components:** All data fetching via hooks happens in Dashboard.tsx (the orchestrator). Child components (ArticleCard, StatsBar, FilterBar) receive data as props. This prevents waterfall requests and makes state management predictable.
- **Re-creating filter functions on every render:** Use useMemo for filtered arrays and useCallback for handlers. React 17 does not have automatic memoization.
- **Direct service access in components:** Always go through hooks (useArticlesQuery, etc.), never import services directly.
- **Using viewport media queries for responsiveness:** SPFx web parts must respond to container width, not viewport width. A full-width zone and a 1/3 zone can exist on the same page at the same viewport width.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Relative date formatting | Custom "X days ago" logic | `Intl.RelativeTimeFormat('de-DE', { numeric: 'auto' })` | Handles German locale, pluralization, "gestern"/"vor 2 Tagen" automatically |
| Sortable data table | Custom table with sort headers | Fluent UI `DetailsList` with `onColumnClick` + `IColumn.isSorted/isSortedDescending` | Column headers, sort indicators, selection, keyboard nav all built-in |
| Search input with clear | Custom input + X button | Fluent UI `SearchBox` with `onSearch`/`onClear`/`onChange` | Built-in clear button, search icon, ARIA labels, focus management |
| Dropdown filters | Custom select elements | Fluent UI `Dropdown` with `IDropdownOption[]` | Consistent Fluent styling, keyboard nav, label association |
| Loading placeholders | Custom CSS pulse animation | Fluent UI `Shimmer` with `ShimmerElementsGroup` | Matches SharePoint native loading pattern, configurable shapes |
| Full-text search | Custom list item text scanning | SharePoint Search REST API via `sp.search()` | Indexes page body content, handles stemming, relevance ranking |

**Key insight:** The Fluent UI v8 component library and PnPjs search API cover all interactive UI needs. The only custom components needed are the ArticleCard (layout/styling) and the StatsBar (custom clickable stat items). Everything else composes existing Fluent UI primitives.

## Common Pitfalls

### Pitfall 1: MockApiClient Returns Errors for Dashboard Stats
**What goes wrong:** `useUnreadCountQuery` calls `services.apiClient.get<DashboardStatsDto>('/api/dashboard/stats')` but `MockApiClient.get()` always returns `fail({ code: 'UNKNOWN', message: 'use service-specific mocks' })`. In workbench mode, the stats bar will always show an error state.
**Why it happens:** MockApiClient was designed as a passthrough that tells developers to use service-specific mocks, but useUnreadCountQuery bypasses service-specific mocks and calls apiClient directly.
**How to avoid:** Either (a) update MockApiClient to handle the `/api/dashboard/stats` endpoint and return mock DashboardStatsDto, or (b) create a dedicated useDashboardStatsQuery hook that computes stats from existing service calls (count unread from articles + read confirmations, count favorites, count pending approvals) instead of calling the API endpoint directly. Option (b) is more resilient for workbench development.
**Warning signs:** Stats bar showing error/loading forever in workbench.

### Pitfall 2: Search Results Missing Article Metadata
**What goes wrong:** SharePoint Search API returns standard managed properties (Title, Path, Author, LastModifiedTime) but NOT custom WH_ columns (WH_Category, WH_Status, WH_IsMandatory, WH_TargetGroups). Search results lack the metadata needed for cards.
**Why it happens:** Custom site columns are not automatically mapped to managed properties in search schema without explicit configuration, which requires tenant admin access.
**How to avoid:** Use search only for ID matching. When search results return, match `ListItemID` values against the already-loaded articles array (from useArticlesQuery). The search API identifies WHICH articles match; the loaded array provides full metadata. This also means filters still work on search results.
**Warning signs:** Cards showing blank category/status after search.

### Pitfall 3: Unread State Requires Cross-Referencing Two Data Sources
**What goes wrong:** There is no single "isUnread" property on articles. Unread status is determined by comparing the article list (from IPageService/SharePoint) with read confirmations (from Azure SQL via API). A naive implementation might forget to cross-reference.
**Why it happens:** Two-layer data architecture: SharePoint stores content, Azure SQL stores tracking data.
**How to avoid:** In Dashboard.tsx, load both `useArticlesQuery` and unread data (from stats endpoint or read confirmations). Build a `Set<number>` of read page IDs. An article is "unread" if its ID is NOT in the read set AND it targets the current user's groups (or isMandatory). For Phase 5, use the stats endpoint's unreadCount for the number and infer unread articles as mandatory articles not in the read set.
**Warning signs:** All articles showing as unread, or no articles showing unread indicators.

### Pitfall 4: DetailsList Column Sorting State Management
**What goes wrong:** Sorting appears to work on first click but breaks after switching columns or toggling sort direction.
**Why it happens:** Fluent UI DetailsList requires you to manually manage `isSorted` and `isSortedDescending` on ALL column definitions, not just the active one. Forgetting to reset other columns' sort state causes visual glitches.
**How to avoid:** On column click, map through ALL columns: set `isSorted: true` + toggle `isSortedDescending` for the clicked column, set `isSorted: false` for all others. Sort the data array and update both columns and items state together.
**Warning signs:** Multiple columns showing sort arrows, or sort direction not changing on click.

### Pitfall 5: Search Debounce Fires Stale Requests
**What goes wrong:** User types "test", pauses (fires search for "test"), types "testing" (fires search for "testing"), but "test" response arrives after "testing" response and overwrites correct results.
**Why it happens:** Race condition between debounced search requests. Earlier request resolves after later request.
**How to avoid:** Use an abort pattern or a request counter. Simplest: increment a `searchVersion` ref on each search call; when results arrive, only apply them if the version matches the current version. Alternatively, ignore search results if the current search query has changed since the request was made.
**Warning signs:** Search results flickering or showing results for wrong query.

### Pitfall 6: SPFx Width Property Returns 0 on Initial Render
**What goes wrong:** `this.width` may return 0 during the first render cycle before the web part container is measured.
**Why it happens:** SPFx measures the container after the DOM is mounted. The first `render()` call may happen before measurement.
**How to avoid:** Default to a sensible fallback (e.g., 3 columns) when width is 0 or undefined. The `onAfterResize` callback will fire with the correct width shortly after mount.
**Warning signs:** Cards rendering in single column briefly before snapping to correct layout.

## Code Examples

### Fluent UI DetailsList with Sortable Columns
```typescript
// Source: Fluent UI v8 documentation pattern
import { DetailsList, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList';

const [sortedItems, setSortedItems] = React.useState<IArticlePage[]>(articles);
const [columns, setColumns] = React.useState<IColumn[]>(initialColumns);

const onColumnClick = React.useCallback(
  (_ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    const newColumns = columns.map(col => ({
      ...col,
      isSorted: col.key === column.key,
      isSortedDescending: col.key === column.key ? !col.isSortedDescending : false,
    }));
    const sortKey = column.fieldName as keyof IArticlePage;
    const descending = newColumns.find(c => c.key === column.key)!.isSortedDescending;
    const sorted = [...sortedItems].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal < bVal) return descending ? 1 : -1;
      if (aVal > bVal) return descending ? -1 : 1;
      return 0;
    });
    setColumns(newColumns);
    setSortedItems(sorted);
  },
  [columns, sortedItems]
);
```

### PnPjs Search API for Site Pages
```typescript
// Source: https://pnp.github.io/pnpjs/sp/search/
import '@pnp/sp/search';
import { SearchResults } from '@pnp/sp/search';

const results: SearchResults = await sp.search({
  Querytext: `${queryText} contentclass:STS_SitePage path:"${siteUrl}/SitePages"`,
  SelectProperties: ['Title', 'Path', 'LastModifiedTime', 'AuthorOWSUSER', 'ListItemID'],
  RowLimit: 50,
  TrimDuplicates: false,
  EnableQueryRules: false,
});

// Match search results against loaded articles by ID
const matchedIds = new Set(
  results.PrimarySearchResults
    .map(r => parseInt(r.ListItemID, 10))
    .filter(id => !isNaN(id))
);
const searchFiltered = articles.filter(a => matchedIds.has(a.id));
```

### Debounced Search with Stale Request Protection
```typescript
// Source: React pattern for debounced search with race condition protection
const searchVersionRef = React.useRef(0);
const timerRef = React.useRef<ReturnType<typeof setTimeout>>();

const handleSearchChange = React.useCallback(
  (_ev?: React.ChangeEvent<HTMLInputElement>, newValue?: string): void => {
    const query = newValue ?? '';
    setFilters(prev => ({ ...prev, search: query }));

    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setSearchResultIds(undefined); // Clear search filter
      return;
    }

    timerRef.current = setTimeout(async () => {
      const version = ++searchVersionRef.current;
      const ids = await executeSearch(query);
      if (version === searchVersionRef.current) {
        setSearchResultIds(ids); // Only apply if still current
      }
    }, 300);
  },
  [executeSearch]
);
```

### Relative Date Formatting (German Locale)
```typescript
// Source: MDN Intl.RelativeTimeFormat
const rtf = new Intl.RelativeTimeFormat('de-DE', { numeric: 'auto' });

function formatRelativeDate(date: Date): string {
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (Math.abs(diffDay) >= 30) return rtf.format(Math.round(diffDay / 30), 'month');
  if (Math.abs(diffDay) >= 1) return rtf.format(diffDay, 'day');
  if (Math.abs(diffHr) >= 1) return rtf.format(diffHr, 'hour');
  if (Math.abs(diffMin) >= 1) return rtf.format(diffMin, 'minute');
  return rtf.format(diffSec, 'second');
}
// "vor 2 Tagen", "gestern", "vor 3 Stunden"
```

### Fluent UI Shimmer for Card Loading State
```typescript
// Source: Fluent UI v8 Shimmer component
import { Shimmer, ShimmerElementType } from '@fluentui/react/lib/Shimmer';

const ArticleCardShimmer: React.FC = () => (
  <div className={styles.card}>
    <Shimmer shimmerElements={[
      { type: ShimmerElementType.line, width: '60%', height: 16 }, // category badge
    ]} />
    <Shimmer shimmerElements={[
      { type: ShimmerElementType.line, width: '90%', height: 20 }, // title
    ]} />
    <Shimmer shimmerElements={[
      { type: ShimmerElementType.circle, height: 24 },             // avatar
      { type: ShimmerElementType.gap, width: 8 },
      { type: ShimmerElementType.line, width: '40%', height: 14 }, // author + date
    ]} />
  </div>
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ResizeObserver / DOM inspection for width | `this.width` + `onAfterResize()` on WebPart class | SPFx 1.12 (2021) | Official API; no DOM hacking needed |
| moment.js for relative dates | `Intl.RelativeTimeFormat` (native) | All modern browsers 2020+ | Zero bundle cost, full i18n support |
| Office UI Fabric React | @fluentui/react v8 | Rebrand 2020 | Same package, different name; v8 is SPFx current |
| @pnp/sp v3 search | @pnp/sp v4 search | PnPjs v4 (2023) | Same API surface; new import pattern |

**Deprecated/outdated:**
- `@pnp/sp/search` v3 import paths (v4 uses same `@pnp/sp/search` but different initialization)
- Office UI Fabric Core class names (use `@fluentui/react` components instead)
- `this.context.domElement.clientWidth` for width detection (use `this.width` since SPFx 1.12)

## Open Questions

1. **Unread Article Identification in Workbench**
   - What we know: The stats endpoint (GET /api/dashboard/stats) returns aggregate counts. MockApiClient returns errors. Individual read confirmations are tracked in MockReadConfirmationService.
   - What's unclear: Whether to compute unread status from MockReadConfirmationService data (checking each article against read confirmations) or to add a mock route to MockApiClient for `/api/dashboard/stats`.
   - Recommendation: Compute mock stats locally in a useDashboardStats hook that wraps the three data sources. In production, still use the API endpoint. This gives accurate workbench behavior and avoids patching MockApiClient.

2. **Search API Availability in Workbench**
   - What we know: SharePoint Search REST API is only available when connected to a real SharePoint site. In workbench, PnPjs is not connected.
   - What's unclear: How to handle search in mock mode.
   - Recommendation: In mock mode, implement client-side title-only search (filter articles where title includes search text). This provides a functional search experience in workbench without the Search API.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (via Heft, @types/heft-jest) |
| Config file | Inherited from SPFx Heft build rig (no explicit jest.config) |
| Quick run command | `cd spfx && npx heft test --clean` |
| Full suite command | `cd spfx && npx heft test --clean --production` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | Card/list view toggle renders correct view | unit | `cd spfx && npx heft test --clean` | No - Wave 0 |
| DASH-02 | Unread mandatory articles show badge | unit | `cd spfx && npx heft test --clean` | No - Wave 0 |
| DASH-03 | Articles sorted by Modified descending | unit | `cd spfx && npx heft test --clean` | No - Wave 0 |
| DASH-04 | Favorite toggle calls service and updates UI | unit | `cd spfx && npx heft test --clean` | No - Wave 0 |
| DASH-05 | Stats bar renders counts from query data | unit | `cd spfx && npx heft test --clean` | No - Wave 0 |
| DASH-06 | Filters narrow article list correctly | unit | `cd spfx && npx heft test --clean` | No - Wave 0 |
| DASH-07 | Search dispatches PnPjs search query | unit | `cd spfx && npx heft test --clean` | No - Wave 0 |
| DASH-08 | Article click sets window.location | unit | `cd spfx && npx heft test --clean` | No - Wave 0 |
| DASH-09 | New Article button visible only for editor+ | unit | `cd spfx && npx heft test --clean` | No - Wave 0 |
| DASH-10 | Pending reviews stat visible only for reviewer+ | unit | `cd spfx && npx heft test --clean` | No - Wave 0 |
| RMND-01 | Mandatory unread articles have accent + badge | unit | `cd spfx && npx heft test --clean` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `cd spfx && npx heft test --clean` (runs all tests)
- **Per wave merge:** `cd spfx && npx heft test --clean --production`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `spfx/src/webparts/dashboard/components/__tests__/Dashboard.test.tsx` -- main integration test
- [ ] `spfx/src/webparts/dashboard/components/__tests__/ArticleCard.test.tsx` -- card rendering
- [ ] `spfx/src/webparts/dashboard/components/__tests__/StatsBar.test.tsx` -- stats bar with role gating
- [ ] `spfx/src/webparts/dashboard/components/__tests__/FilterBar.test.tsx` -- filter logic
- [ ] Test infrastructure: SPFx Heft includes Jest; @types/heft-jest already in devDependencies. May need React test renderer or simple DOM assertions depending on approach.

## Sources

### Primary (HIGH confidence)
- PnPjs v4 search documentation: [pnp.github.io/pnpjs/sp/search](https://pnp.github.io/pnpjs/sp/search/) -- sp.search() API, SearchQueryInit, paging
- Microsoft Learn - Determine web part width: [learn.microsoft.com](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/basics/determine-web-part-width) -- this.width, onAfterResize
- MDN Intl.RelativeTimeFormat: [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat) -- Native relative date API
- Existing codebase: All hooks, services, models, context verified by reading source files directly

### Secondary (MEDIUM confidence)
- Fluent UI v8 DetailsList sortable columns: [StudyRaid](https://app.studyraid.com/en/read/15049/520761/using-fluent-uis-detailslist-component) + [Perficient blog](https://blogs.perficient.com/2026/02/04/enhancing-fluent-ui-detailslist-with-custom-sorting-filtering-lazy-loading-and-filter-chips/) -- sorting pattern verified against multiple sources
- SharePoint Search contentclass filtering: [Microsoft Learn archive](https://learn.microsoft.com/en-us/archive/blogs/mvpawardprogram/sharepoint-power-searching-using-contentclass) -- STS_SitePage contentclass

### Tertiary (LOW confidence)
- None -- all findings verified against official sources or existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and proven in Phases 1-4
- Architecture: HIGH -- extends existing patterns (hooks, services, context) with well-documented Fluent UI components
- Pitfalls: HIGH -- identified through codebase analysis (MockApiClient issue) and known SharePoint Search behavior
- Search API: MEDIUM -- PnPjs search docs are clear but custom managed property availability depends on tenant config

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable -- no moving parts in SPFx 1.22.2 or Fluent UI v8)
