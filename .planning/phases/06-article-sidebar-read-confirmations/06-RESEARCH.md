# Phase 6: Article Sidebar & Read Confirmations - Research

**Researched:** 2026-03-16
**Domain:** SPFx web part (React 17 + Fluent UI v8), sidebar UI with CQRS hooks, DOM scraping TOC, optimistic UI, Azure SQL persistence via API
**Confidence:** HIGH

## Summary

Phase 6 builds the Article Sidebar web part -- a vertically stacked panel placed in the 1/3 column zone of article pages. It displays article metadata, read confirmation controls, flag-as-outdated, favorite toggle, dynamic table of contents, and a version history link. The codebase already has all the foundational pieces: the ArticleSidebarWebPart.ts is fully wired with WissensHubProvider, all three command hooks (useMarkAsReadCommand, useFlagArticleCommand, useToggleFavoriteCommand) exist, all service interfaces and mock implementations are in place, and the domain models (IReadConfirmation, IFlag, IFavorite) are defined. The backend API endpoints (GET /api/articles/{pageId}/status, POST /api/articles/{pageId}/read, POST /api/articles/{pageId}/flag, POST /api/favorites/{pageId}) are all implemented as stub handlers.

The main implementation work is: (1) rebuilding ArticleSidebar.tsx from its current minimal scaffold into a full metadata/actions/TOC component, (2) creating a new useArticleStatusQuery hook to fetch sidebar data from the API, (3) implementing DOM-scraping TOC with IntersectionObserver for active section highlighting, (4) building the flag-as-outdated dialog, and (5) implementing read confirmation reset logic by comparing SharePoint page major version against the confirmed version stored in Azure SQL (the ContentVersion field already exists on the ReadConfirmation entity and the ArticleStatusDto).

**Primary recommendation:** Follow the established Phase 5 patterns exactly -- functional components, SCSS modules, optimistic UI with revert, QueryState/CommandState discriminated unions, German labels. The sidebar needs a new query hook (useArticleStatusQuery) since the data shape is different from useArticlesQuery. The DOM scraping for TOC should run in a useEffect after mount with MutationObserver fallback for late-rendering content.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Stacked vertical sections (no tabs, no accordions): Metadata -> Read Status/Actions -> TOC -> Version History link
- All sections always visible -- no interaction needed to reveal content
- Designed for 1/3 column zone placement (article content in 2/3 zone)
- Sections separated by subtle dividers
- Label-value pairs with Fluent UI Icons for metadata fields
- Fields displayed: Autor (author), Kategorie (category), Zuletzt aktualisiert (last updated), Version, Status, Zielgruppen (target groups)
- German labels throughout
- "Metadaten bearbeiten" button for Editors via RoleGate -- links to SharePoint's native page properties panel, no custom form
- Optimistic swap for mark-as-read: button instantly changes from "Als gelesen markieren" to "Gelesen am [date]" on click
- Mandatory unread articles show a prominent "Pflichtartikel" warning badge above the mark-as-read button
- Read confirmation reset triggered by major version change only (minor versions/drafts do NOT reset)
- API checks current page version vs. version at last confirmation
- Reset UX: yellow/orange warning banner with previous read date shown as strikethrough and "Erneut bestatigen" button
- DOM scraping approach for TOC: query `.CanvasZone h2, .CanvasZone h3` on component mount
- Two-level TOC: H2 as main sections, H3 as indented subsections
- Active section highlighting via IntersectionObserver
- If no headings found, TOC section is hidden entirely
- Flag-as-outdated opens Fluent UI Dialog with required freetext reason field + Abbrechen/Melden buttons
- One flag per user per article -- cannot re-flag until reviewer resolves
- Favorite toggle: filled/outline star icon, optimistic toggle using existing useToggleFavoriteCommand hook
- Version history link: simple link to SharePoint's built-in version history page

### Claude's Discretion
- Exact spacing, typography, and section divider styling
- Icon choices for each metadata field (Fluent UI icon names)
- Loading state implementation (shimmer for metadata section)
- Error state handling for failed API calls
- Exact CanvasZone DOM selector refinement for heading extraction
- IntersectionObserver threshold tuning for TOC active state
- Toast notification wording and duration

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SIDE-01 | User can see article metadata (author, category, version, last updated, status, target groups) | IArticlePage model has most fields; version needs PnPjs OData__UIVersionString select; new useArticleStatusQuery hook to combine SP page data with API status |
| SIDE-02 | User can mark article as read via button -- saves to Azure SQL via API | useMarkAsReadCommand hook exists; optimistic UI pattern from Phase 5 Dashboard favorites |
| SIDE-03 | User can see their read status ("You confirmed this on [date]" or unread badge) | ReadConfirmationService.getReadStatus(pageId) returns IReadConfirmation with readDate; API ArticleStatusDto has HasRead + ReadDate fields |
| SIDE-04 | User can flag article as outdated with reason -- saves to Azure SQL via API | useFlagArticleCommand hook exists; Fluent UI Dialog + TextField for reason input |
| SIDE-05 | User can toggle favorite from sidebar | useToggleFavoriteCommand hook exists; optimistic toggle pattern from Dashboard ArticleCard |
| SIDE-06 | User can see dynamic table of contents generated from page headings | DOM scraping .CanvasZone h2/h3 in useEffect; IntersectionObserver for active state; smooth scroll via element.scrollIntoView |
| SIDE-07 | User can access version history link | URL pattern: `{siteUrl}/_layouts/15/Versions.aspx?list={listId}&ID={itemId}` -- needs listId + itemId from page context |
| SIDE-08 | Editor can see "Edit Metadata" button on sidebar | RoleGate component with minimumRole="editor"; link opens SP page properties panel |
| READ-01 | Read confirmation saved to Azure SQL with PageId, UserId, UserDisplayName, ReadDate | Backend MarkAsReadCommand handler exists (stub); ReadConfirmation entity has ContentVersion field |
| READ-02 | Read confirmations reset when article is significantly updated | Backend ArticleStatusDto returns ContentVersion; frontend compares page major version vs confirmed version; reset UX shows warning banner |
| READ-03 | Unread count cross-referenced between Site Pages and ReadConfirmations table | API GET /api/articles/unread endpoint exists; not directly sidebar scope but sidebar contributes to mark-as-read flow |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @fluentui/react | 8.106.4 | UI components (Dialog, TextField, Icon, DefaultButton, PrimaryButton, Shimmer, MessageBar) | Already installed, locked by SPFx 1.22.2 |
| @pnp/sp | 4.18.0 | SharePoint page queries (version info, list ID, page properties) | Already installed and initialized via pnpSetup.ts singleton |
| React 17 | 17.0.2 | Component framework | Locked by SPFx 1.22.2 |
| TypeScript | 5.8 | Type system | Locked by SPFx 1.22.2, target: ES5 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @microsoft/sp-http | 1.22.2 | AadHttpClient for Azure Functions API | Already used by AzureApiClient |
| @microsoft/sp-webpart-base | 1.22.2 | WebPartContext for page context (listId, itemId, siteUrl) | Already used in ArticleSidebarWebPart.ts |

### Alternatives Considered
No alternatives needed -- all libraries are locked by the existing stack.

**Installation:**
No new packages needed. Everything required is already installed.

## Architecture Patterns

### Recommended Component Structure
```
spfx/src/webparts/articleSidebar/
├── ArticleSidebarWebPart.ts              (existing -- passes pageId to component)
├── components/
│   ├── ArticleSidebar.tsx                (existing shell -- rebuild as container)
│   ├── ArticleSidebar.module.scss        (existing -- expand with section styles)
│   ├── IArticleSidebarProps.ts           (existing -- add pageId prop)
│   ├── MetadataSection.tsx               (new -- label/value pairs with icons)
│   ├── ReadStatusSection.tsx             (new -- mark-as-read button/status + flag/fav)
│   ├── TableOfContents.tsx               (new -- DOM-scraped heading list)
│   └── FlagDialog.tsx                    (new -- Dialog wrapper for flag reason)
spfx/src/shared/
├── hooks/queries/
│   └── useArticleStatusQuery.ts          (new -- GET /api/articles/{pageId}/status)
```

### Pattern 1: Container + Sections
**What:** ArticleSidebar.tsx acts as a container that fetches data via hooks and distributes to presentational section components.
**When to use:** Always -- consistent with Dashboard pattern where Dashboard.tsx is the data-fetching container.
**Example:**
```typescript
// ArticleSidebar.tsx -- container pattern
const ArticleSidebar: React.FC<IArticleSidebarProps> = ({ pageId }) => {
  const { role } = useWissensHub();
  const articleQuery = useArticleStatusQuery(pageId);
  const markAsRead = useMarkAsReadCommand();
  const flagArticle = useFlagArticleCommand();
  const toggleFavorite = useToggleFavoriteCommand();

  // Render sections vertically with dividers
  return (
    <section className={styles.articleSidebar}>
      <MetadataSection article={...} isLoading={...} />
      <div className={styles.divider} />
      <ReadStatusSection ... />
      <div className={styles.divider} />
      <TableOfContents />
      <div className={styles.divider} />
      <VersionHistoryLink ... />
    </section>
  );
};
```

### Pattern 2: Optimistic UI with Revert (established in Phase 5)
**What:** State changes immediately on user action; API call runs in background; revert on failure.
**When to use:** For mark-as-read and favorite toggle.
**Example:**
```typescript
// From Dashboard.tsx -- favorite toggle pattern
const handleFavoriteToggle = React.useCallback(async (pageId: number) => {
  setLocalFavorites(prev => { /* optimistic toggle */ });
  const success = await toggleFavorite.execute(pageId);
  if (!success) {
    setLocalFavorites(prev => { /* revert */ });
  }
}, [toggleFavorite]);
```

### Pattern 3: Query Hook with QueryState<T>
**What:** Hook that fetches data on mount, returns QueryState discriminated union.
**When to use:** For useArticleStatusQuery -- follows useArticlesQuery pattern exactly.
**Example:**
```typescript
// New hook -- useArticleStatusQuery.ts
export function useArticleStatusQuery(pageId: number): {
  state: QueryState<IArticleStatus>;
  refetch: () => void;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<QueryState<IArticleStatus>>({ status: 'idle' });

  const fetch = React.useCallback(async () => {
    setState({ status: 'loading' });
    const result = await services.readConfirmationService.getReadStatus(pageId);
    // ... set success or error
  }, [services, pageId]);

  React.useEffect(() => { fetch().catch(() => {}); }, [fetch]);
  return { state, refetch: fetch };
}
```

### Pattern 4: DOM Scraping TOC with IntersectionObserver
**What:** Query `.CanvasZone h2, .CanvasZone h3` on mount, build heading list, track active section.
**When to use:** TableOfContents component.
**Key considerations:**
- SPFx renders web parts inside `.CanvasZone` containers; the article content zone is a sibling to the sidebar zone
- Use `document.querySelectorAll('.CanvasZone h2, .CanvasZone h3')` -- the sidebar's own CanvasZone won't have h2/h3 content
- Headings may render late (SPFx lazy loading) -- use a short setTimeout or MutationObserver as fallback
- IntersectionObserver with `rootMargin: '-10% 0px -85% 0px'` gives good "currently reading" detection
- Assign `id` attributes to headings if they don't have them (for scroll-to-anchor)
- Use `element.scrollIntoView({ behavior: 'smooth', block: 'start' })` for click-to-scroll

### Pattern 5: Page Context for pageId and Version History URL
**What:** Extract current page's item ID and version from SharePoint page context.
**When to use:** ArticleSidebarWebPart.ts needs to pass pageId to the component.
**Key details:**
- `this.context.pageContext.listItem?.id` gives the current page's list item ID (the pageId)
- `this.context.pageContext.list?.id.toString()` gives the list GUID for version history URL
- `this.context.pageContext.web.absoluteUrl` gives the site URL base
- SharePoint version history URL: `${siteUrl}/_layouts/15/Versions.aspx?list=${listId}&ID=${itemId}`
- For page version (major version number): query PnPjs `sp.web.lists.getByTitle('SitePages').items.getById(pageId).select('OData__UIVersionString')()` -- returns "2.0" format where parseInt gives major version
- In workbench mode, `this.context.pageContext.listItem` is undefined -- use a mock pageId prop

### Anti-Patterns to Avoid
- **Direct service calls in components:** Always use hooks (useMarkAsReadCommand, etc.) -- never import services directly.
- **Using null instead of undefined:** The codebase uses `undefined` for optional values due to @rushstack/no-new-null lint rule.
- **Using Array.includes/flatMap:** Target is ES5 -- use indexOf and forEach instead.
- **Using Intl APIs:** ES5 target does not support Intl.DateTimeFormat/RelativeTimeFormat -- use manual German date formatting.
- **Using JSX syntax:** The codebase uses React.createElement pattern in some contexts (RoleGate, WissensHubProvider) -- follow the same pattern for consistency where needed, but JSX is fine in component render methods.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date formatting | Custom date parser | Reuse `formatRelativeDate` from Dashboard utils or simple `toLocaleDateString('de-DE')` | Already exists; German locale handling is tricky |
| Loading skeletons | Custom placeholders | `Shimmer` from `@fluentui/react/lib/Shimmer` | Established pattern in Dashboard ShimmerGrid |
| Modal dialogs | Custom overlay/backdrop | `Dialog` from `@fluentui/react/lib/Dialog` | Handles focus trap, ESC close, backdrop, accessibility |
| Role-based visibility | Manual role checks | `RoleGate` component with `minimumRole` prop | Already built and tested in Phase 3 |
| Scroll to element | Custom scroll calculation | `element.scrollIntoView({ behavior: 'smooth' })` | Native browser API, well-supported |
| Favorite toggle | New toggle logic | `useToggleFavoriteCommand` + optimistic pattern from Dashboard | Exact same interaction as ArticleCard |
| Error display | Custom error rendering | `MessageBar` from `@fluentui/react/lib/MessageBar` with `MessageBarType.error` | SPFx standard for inline error messages |

**Key insight:** Phase 6 is primarily a composition exercise -- almost all building blocks (hooks, services, models, patterns) already exist from Phases 3-5. The work is assembling them into the sidebar layout, adding the TOC DOM scraping, and the flag dialog.

## Common Pitfalls

### Pitfall 1: pageId is undefined in Workbench
**What goes wrong:** `this.context.pageContext.listItem` is undefined in local workbench, causing crashes when trying to get pageId.
**Why it happens:** Workbench is not a real SharePoint page, so there's no list item context.
**How to avoid:** Use a fallback mock pageId (e.g., 1) in workbench mode. Check `this.context.isServedFromLocalhost` or `!this.context.pageContext.listItem` and default to the first mock article's ID.
**Warning signs:** TypeError: Cannot read property 'id' of undefined.

### Pitfall 2: CanvasZone Headings Not Found on Mount
**What goes wrong:** `document.querySelectorAll('.CanvasZone h2, .CanvasZone h3')` returns empty NodeList because the article content hasn't rendered yet.
**Why it happens:** SPFx web parts can render in any order; the sidebar might mount before the content web parts finish rendering.
**How to avoid:** Use a short `setTimeout` (500ms) for initial scan, then optionally use `MutationObserver` on the page body to detect late-rendering headings. Also run on component mount as first attempt.
**Warning signs:** TOC section never appears even when the article has headings.

### Pitfall 3: ES5 Target API Restrictions
**What goes wrong:** Build fails with "Property 'includes' does not exist on type 'string[]'" or similar.
**Why it happens:** SPFx tsconfig targets ES5 which lacks Array.prototype.includes, Array.prototype.flatMap, Object.entries, etc.
**How to avoid:** Use `indexOf(x) >= 0` instead of `includes(x)`, `forEach` instead of `flatMap`, `for...in` instead of `Object.entries`. This is a well-established pattern in the codebase (Phase 05-02 decision).
**Warning signs:** TypeScript compilation errors referencing ES2015+ methods.

### Pitfall 4: IntersectionObserver Cleanup
**What goes wrong:** Memory leak and stale callbacks if IntersectionObserver is not disconnected on unmount.
**Why it happens:** IntersectionObserver persists beyond component lifecycle unless explicitly disconnected.
**How to avoid:** Store observer ref and call `observer.disconnect()` in the useEffect cleanup function.
**Warning signs:** Console warnings about state updates on unmounted components.

### Pitfall 5: Read Confirmation Version Comparison
**What goes wrong:** Read confirmation never shows as "needs re-confirmation" or always shows it.
**Why it happens:** Comparing version strings vs numbers incorrectly. SharePoint's `OData__UIVersionString` returns "2.0" format; the API returns integer ContentVersion.
**How to avoid:** Parse the major version from OData__UIVersionString: `parseInt(versionString.split('.')[0], 10)`. Compare this integer against the ReadConfirmation's ContentVersion. If page major version > confirmed version, show reset warning.
**Warning signs:** Version comparison logic produces unexpected boolean results.

### Pitfall 6: Workbench DOM Structure Differs from Live SharePoint
**What goes wrong:** TOC heading extraction works in production but fails in workbench (or vice versa).
**Why it happens:** Workbench doesn't have the same `.CanvasZone` DOM structure as a live SharePoint page. In workbench, the web part is rendered in isolation.
**How to avoid:** In workbench mode, provide mock headings or skip the TOC entirely. Check if `.CanvasZone` exists before attempting heading extraction.
**Warning signs:** TOC works in one environment but not the other.

### Pitfall 7: SharePoint Page Properties Panel URL
**What goes wrong:** "Metadaten bearbeiten" button doesn't open the page properties panel.
**Why it happens:** SharePoint's page properties panel is triggered via client-side page API, not a simple URL.
**How to avoid:** Use the SharePoint page properties panel URL pattern: `javascript:void(0)` with `window.dispatchEvent` or simply use the Edit Properties URL: `${pageUrl}?Mode=Edit&FieldsToEdit=[fields]`. Simpler approach: link to the page's information panel via `{siteUrl}/_layouts/15/listform.aspx?PageType=6&ListId=${listId}&ID=${itemId}`. Even simpler: open the standard SharePoint list item edit form URL.
**Warning signs:** Link clicks do nothing or navigate away from the page.

## Code Examples

### Getting pageId from WebPart Context
```typescript
// In ArticleSidebarWebPart.ts render() method
const pageId = this.context.pageContext.listItem?.id ?? 1; // fallback for workbench
const listId = this.context.pageContext.list?.id.toString() ?? '';
const siteUrl = this.context.pageContext.web.absoluteUrl;

const child = React.createElement(ArticleSidebar, {
  pageId,
  listId,
  siteUrl,
  hasTeamsContext: !!this.context.sdks.microsoftTeams,
});
```

### Version History URL Construction
```typescript
// Source: SharePoint standard URL pattern
const versionHistoryUrl = `${siteUrl}/_layouts/15/Versions.aspx?list=${encodeURIComponent(listId)}&ID=${pageId}`;
```

### Fluent UI Dialog for Flag-as-Outdated
```typescript
// Source: @fluentui/react Dialog documentation
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { TextField } from '@fluentui/react/lib/TextField';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';

const dialogContentProps = {
  type: DialogType.normal,
  title: 'Als veraltet melden',
  subText: 'Bitte beschreiben Sie, warum dieser Artikel veraltet ist.',
};

<Dialog
  hidden={!isDialogOpen}
  onDismiss={handleDismiss}
  dialogContentProps={dialogContentProps}
  minWidth={400}
>
  <TextField
    label="Grund"
    multiline
    rows={3}
    required
    value={reason}
    onChange={(_, v) => setReason(v || '')}
  />
  <DialogFooter>
    <PrimaryButton
      text="Melden"
      onClick={handleSubmitFlag}
      disabled={!reason.trim()}
    />
    <DefaultButton text="Abbrechen" onClick={handleDismiss} />
  </DialogFooter>
</Dialog>
```

### IntersectionObserver for TOC Active State
```typescript
// IntersectionObserver for tracking which heading is currently visible
React.useEffect(() => {
  if (headings.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (entry.isIntersecting) {
          setActiveHeadingId(entry.target.id);
        }
      }
    },
    {
      rootMargin: '-10% 0px -85% 0px',
      threshold: 0,
    }
  );

  headings.forEach(h => observer.observe(h.element));

  return () => observer.disconnect();
}, [headings]);
```

### DOM Heading Extraction with Delayed Retry
```typescript
// Extract headings from CanvasZone content
function extractHeadings(): IHeadingItem[] {
  const elements = document.querySelectorAll('.CanvasZone h2, .CanvasZone h3');
  const items: IHeadingItem[] = [];
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLElement;
    if (!el.id) {
      el.id = 'toc-heading-' + i;
    }
    items.push({
      id: el.id,
      text: el.textContent || '',
      level: el.tagName === 'H2' ? 2 : 3,
      element: el,
    });
  }
  return items;
}
```

### German Date Formatting for Read Confirmation
```typescript
// Manual German date formatting (ES5 safe)
function formatGermanDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const pad = (n: number): string => n < 10 ? '0' + n : '' + n;
  return pad(day) + '.' + pad(month) + '.' + year;
}
// Usage: "Gelesen am 15.03.2026"
```

### Metadata Section with Icons
```typescript
// Fluent UI icon names for metadata fields
const METADATA_ICONS: Record<string, string> = {
  author: 'Contact',
  category: 'Tag',
  lastUpdated: 'Clock',
  version: 'History',
  status: 'StatusCircleCheckmark',
  targetGroups: 'People',
};
```

### Shimmer Loading State (following Dashboard pattern)
```typescript
import { Shimmer, ShimmerElementType } from '@fluentui/react/lib/Shimmer';

const MetadataShimmer: React.FC = () => (
  <div className={styles.shimmerContainer}>
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className={styles.shimmerRow}>
        <Shimmer shimmerElements={[
          { type: ShimmerElementType.circle, height: 16 },
          { type: ShimmerElementType.gap, width: 8 },
          { type: ShimmerElementType.line, width: '40%', height: 14 },
          { type: ShimmerElementType.gap, width: 8 },
          { type: ShimmerElementType.line, width: '50%', height: 14 },
        ]} />
      </div>
    ))}
  </div>
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Class components | Functional components with hooks | Phase 1 decision | All new components use FC pattern |
| Generic CRUD hooks | CQRS-lite (separate query/command hooks) | Phase 3 architecture | useArticleStatusQuery (read) vs useMarkAsReadCommand (write) |
| Server-wait UI | Optimistic UI with revert | Phase 5 implementation | Mark-as-read button swaps immediately |
| null for optional | undefined for optional | Phase 3-01 decision | @rushstack/no-new-null lint rule |

**Deprecated/outdated:**
- Class components: All new code must be functional components
- null returns: Use undefined for optional values (lint enforced)
- ES2015+ array methods in component code: Must use ES5-compatible alternatives (indexOf, forEach)

## Open Questions

1. **Page Version Query in Workbench**
   - What we know: Production can query `OData__UIVersionString` via PnPjs. Workbench has no real page data.
   - What's unclear: Whether MockReadConfirmationService should simulate version mismatch for reset testing.
   - Recommendation: Add a mock version field to mock data (e.g., mock article at version 2, mock read confirmation at version 1) so the reset warning banner can be tested in workbench. The sidebar should show "Version 1.0" as mock version if pageContext.listItem is unavailable.

2. **Edit Metadata Button Target URL**
   - What we know: CONTEXT.md says "links to SharePoint's native page properties panel, no custom form."
   - What's unclear: The exact URL/mechanism to open the SP page properties panel from a web part context.
   - Recommendation: Use the standard list item edit form URL pattern: `${siteUrl}/_layouts/15/listform.aspx?PageType=6&ListId=${listId}&ID=${itemId}`. This opens the item's property editing form. For a more integrated approach, could also use `window.location.href = pageUrl + '?Mode=Edit'` but the list form approach is more reliable.

3. **Flag Status Check on Sidebar Load**
   - What we know: MockFlagService only has `flagArticle()` method, no `getFlagStatus()` method. The IFlagService interface only has flagArticle.
   - What's unclear: How to show "Gemeldet am [date]" (already flagged state) on sidebar load without a flag status query method.
   - Recommendation: The ArticleStatusDto from the API could potentially include flag status, or we need to add a `getFlagStatus(pageId)` method to IFlagService. Alternatively, track flag state locally after successful flag submission and persist it in the sidebar component state. For workbench/mock mode, check MOCK_FLAGS for the current user's flag on the page. Best approach: add `userFlagDate?: Date` to the article status response and the corresponding mock data.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 27 (via SPFx Heft) |
| Config file | `spfx/node_modules/@microsoft/spfx-web-build-rig/profiles/default/config/jest.config.json` (inherited) |
| Quick run command | `cd spfx && npx heft test --clean 2>&1 \| tail -30` |
| Full suite command | `cd spfx && npx heft test --clean` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SIDE-01 | Metadata section renders all fields with icons | unit | `cd spfx && npx heft test --clean -- --testPathPattern="ArticleSidebar"` | -- Wave 0 |
| SIDE-02 | Mark-as-read button triggers useMarkAsReadCommand | unit | `cd spfx && npx heft test --clean -- --testPathPattern="ReadStatus"` | -- Wave 0 |
| SIDE-03 | Read status shows "Gelesen am [date]" or unread state | unit | `cd spfx && npx heft test --clean -- --testPathPattern="ReadStatus"` | -- Wave 0 |
| SIDE-04 | Flag dialog opens, validates required reason, submits | unit | `cd spfx && npx heft test --clean -- --testPathPattern="FlagDialog"` | -- Wave 0 |
| SIDE-05 | Favorite star toggle with optimistic UI | unit | `cd spfx && npx heft test --clean -- --testPathPattern="ReadStatus"` | -- Wave 0 |
| SIDE-06 | TOC renders headings with correct levels and scroll | unit | `cd spfx && npx heft test --clean -- --testPathPattern="TableOfContents"` | -- Wave 0 |
| SIDE-07 | Version history link has correct URL format | unit | `cd spfx && npx heft test --clean -- --testPathPattern="ArticleSidebar"` | -- Wave 0 |
| SIDE-08 | Edit metadata button visible only for editors+ | unit | `cd spfx && npx heft test --clean -- --testPathPattern="MetadataSection"` | -- Wave 0 |
| READ-01 | Read confirmation calls API with correct pageId | unit | `cd spfx && npx heft test --clean -- --testPathPattern="ReadStatus"` | -- Wave 0 |
| READ-02 | Reset warning shown when page version > confirmed version | unit | `cd spfx && npx heft test --clean -- --testPathPattern="ReadStatus"` | -- Wave 0 |
| READ-03 | Unread count cross-reference (sidebar contributes via mark-as-read) | unit | `cd spfx && npx heft test --clean -- --testPathPattern="ArticleSidebar"` | -- Wave 0 |

### Sampling Rate
- **Per task commit:** `cd spfx && npx heft test --clean -- --testPathPattern="articleSidebar" 2>&1 | tail -30`
- **Per wave merge:** `cd spfx && npx heft test --clean`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `spfx/src/webparts/articleSidebar/components/__tests__/ArticleSidebar.test.tsx` -- covers SIDE-01, SIDE-07, SIDE-08
- [ ] `spfx/src/webparts/articleSidebar/components/__tests__/ReadStatusSection.test.tsx` -- covers SIDE-02, SIDE-03, SIDE-05, READ-01, READ-02
- [ ] `spfx/src/webparts/articleSidebar/components/__tests__/TableOfContents.test.tsx` -- covers SIDE-06
- [ ] `spfx/src/webparts/articleSidebar/components/__tests__/FlagDialog.test.tsx` -- covers SIDE-04

NOTE: Existing test files (Dashboard tests) follow stub pattern with `expect(true).toBe(true)` placeholder assertions. Phase 6 tests will follow this same convention -- test structure and descriptions defined, assertions can be filled in during Phase 11 (Testing).

## Sources

### Primary (HIGH confidence)
- Codebase inspection: ArticleSidebarWebPart.ts, ArticleSidebar.tsx, all shared hooks/services/models
- Codebase inspection: Dashboard.tsx, ArticleCard.tsx -- Phase 5 optimistic UI patterns
- Codebase inspection: Backend API -- ArticleFunctions.cs, GetArticleStatusHandler.cs, MarkAsReadHandler.cs
- Codebase inspection: ReadConfirmation.cs entity -- ContentVersion field confirmed

### Secondary (MEDIUM confidence)
- SharePoint page context API: pageContext.listItem.id, pageContext.list.id (standard SPFx APIs)
- SharePoint version history URL pattern: `/_layouts/15/Versions.aspx?list={listId}&ID={itemId}`
- OData__UIVersionString field for page version number via PnPjs

### Tertiary (LOW confidence)
- IntersectionObserver rootMargin tuning values -- will need empirical testing in workbench
- Exact `.CanvasZone` DOM selector -- may need refinement based on actual SharePoint page structure

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries locked, no choices to make
- Architecture: HIGH -- follows Phase 5 patterns exactly, all hooks/services exist
- Pitfalls: HIGH -- ES5 target, null vs undefined, and workbench limitations are well-documented from prior phases
- TOC/DOM scraping: MEDIUM -- IntersectionObserver thresholds and CanvasZone selectors need empirical validation
- Version reset logic: HIGH -- ContentVersion field exists on both frontend DTO and backend entity

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable stack, no expected changes)
