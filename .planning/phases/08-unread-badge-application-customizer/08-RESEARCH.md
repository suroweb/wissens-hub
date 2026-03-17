# Phase 8: Unread Badge Application Customizer - Research

**Researched:** 2026-03-17
**Domain:** SPFx Application Customizer with React, Fluent UI Panel, AadHttpClient, cross-component CustomEvent
**Confidence:** HIGH

## Summary

Phase 8 implements the Unread Badge Application Customizer -- a persistent header notification bell icon showing the user's unread article count across every page in the WissensHub site. Clicking the bell opens a Fluent UI Panel flyout listing unread article summaries with direct navigation. The customizer listens for `CustomEvent('wissenshub:article-read')` from the Article Sidebar to update the count in real time without polling.

The existing scaffold (`UnreadBadgeApplicationCustomizer.ts`) is a bare shell with only `console.log` in `onInit()`. The Phase 1 registration (elements.xml, ClientSideInstance.xml, serve.json) is already wired correctly with component ID `20c7774b-e3ff-4f8b-8495-67dc37e9c038`. The implementation pattern follows the official Microsoft docs: use `this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top)` to get a DOM element, then `ReactDOM.render()` to mount a React component tree into that element.

**Primary recommendation:** Build three files: (1) the updated `UnreadBadgeApplicationCustomizer.ts` that obtains the placeholder and AadHttpClient, mounts/unmounts React, and listens for CustomEvent; (2) an `UnreadBadgeHeader.tsx` React component containing the bell icon + badge + click handler; (3) an `UnreadFlyoutPanel.tsx` React component with the Fluent UI Panel listing unread articles. Reuse `getCategoryColor` and `formatRelativeDate` utilities from the Dashboard by moving them to `shared/utils/`. Also add the CustomEvent dispatch to the Article Sidebar's mark-as-read flow, since it was specified in Phase 6 context but never implemented.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Fluent UI Ringer (bell) icon in the header -- familiar notification pattern matching Teams/Outlook
- Red circle badge overlay showing exact unread count, capped at "99+"
- Positioned in SPFx PlaceholderContent.Top, right-aligned in the header bar
- When unread count is zero: icon remains visible, red badge hidden. Icon still clickable -- flyout shows empty state
- Badge uses standard red (#D13438 or theme error color) with white text
- Fluent UI Panel component (side drawer) sliding in from the right
- Header: "X ungelesene Artikel" with count
- Each item shows: article title, category badge (colored, matching dashboard pattern), relative date ("vor 2 Std.")
- Mandatory (Pflichtartikel) articles sorted to top with "Pflichtartikel" badge -- consistent with dashboard pattern from Phase 5
- Maximum 10 items displayed. If more exist, "Alle X anzeigen" link at bottom navigates to dashboard with unread filter active
- Empty state: checkmark icon + "Alle Artikel gelesen!" message
- Fetch unread data once on page load via GET /api/articles/unread -- no polling
- Count updates naturally on next page navigation (SharePoint page load triggers onInit again)
- Direct AadHttpClient from Application Customizer's own SPFx context -- no dependency on web part service container
- Cross-web-part update: Article Sidebar dispatches CustomEvent('wissenshub:article-read', { detail: { pageId } }) on document after mark-as-read. Application Customizer listens, decrements count, and removes article from flyout list
- Click article: navigate in same tab (window.location), panel auto-closes. Browser back returns to previous page
- No mark-as-read from flyout -- click-to-navigate only
- Light dismiss enabled (isLightDismiss=true) -- clicking outside panel or pressing Escape closes it
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

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BADGE-01 | User can see notification icon with unread count in header on every page in the hub | PlaceholderName.Top rendering via tryCreateContent, Ringer icon with badge overlay, AadHttpClient GET /api/articles/unread for count |
| BADGE-02 | User can click notification icon to open flyout panel with unread article summaries | Fluent UI Panel (isLightDismiss), article list with category badge + relative date + mandatory badge, max 10 items |
| BADGE-03 | User can click article in flyout to navigate directly to the article page | window.location navigation, panel auto-close on navigate, article URL from UnreadArticleDto mapping |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @microsoft/sp-application-base | 1.22.2 | BaseApplicationCustomizer, PlaceholderContent, PlaceholderName | SPFx extension base -- already installed |
| @microsoft/sp-http | 1.22.2 | AadHttpClient for authenticated API calls | SPFx standard HTTP client -- already installed |
| @fluentui/react | 8.106.4 | Panel, Icon components | Project standard UI library -- already installed |
| react | 17.0.1 | Component rendering | SPFx 1.22.2 locked version -- already installed |
| react-dom | 17.0.1 | ReactDOM.render/unmountComponentAtNode | SPFx 1.22.2 locked version -- already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @microsoft/sp-core-library | 1.22.2 | Log utility | Already installed, for diagnostic logging |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Direct AadHttpClient | Shared IApiClient via WissensHubContext | Customizer has ApplicationCustomizerContext not WebPartContext -- WissensHubProvider expects WebPartContext. Direct AadHttpClient is simpler and avoids context type mismatch. |
| ReactDOM.render | innerHTML + event listeners | ReactDOM.render enables Fluent UI Panel component which requires React lifecycle. No alternative. |

**Installation:**
No new packages needed. All dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure
```
spfx/src/extensions/unreadBadge/
  UnreadBadgeApplicationCustomizer.ts       # Extension entry point (existing, needs full implementation)
  UnreadBadgeApplicationCustomizer.manifest.json  # Manifest (existing, no changes)
  components/
    UnreadBadgeHeader.tsx                    # Bell icon + badge overlay + click handler
    UnreadFlyoutPanel.tsx                    # Panel with unread article list
    UnreadBadgeHeader.module.scss            # Styles for header badge
    UnreadFlyoutPanel.module.scss            # Styles for panel content
  models/
    IUnreadArticle.ts                        # Frontend model for unread article
  loc/
    en-us.js                                 # (existing, update strings)
    myStrings.d.ts                            # (existing, update types)

spfx/src/shared/utils/
  getCategoryColor.ts                        # Moved from dashboard/components/utils/
  formatRelativeDate.ts                      # Moved from dashboard/components/utils/
```

### Pattern 1: Application Customizer with React Placeholder Rendering
**What:** Mount a React component tree into the PlaceholderName.Top DOM element
**When to use:** Any time an Application Customizer needs interactive UI
**Example:**
```typescript
// Source: Microsoft Learn official docs (2026-01-12) + project established patterns
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export default class UnreadBadgeApplicationCustomizer
  extends BaseApplicationCustomizer<IUnreadBadgeApplicationCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;

  public async onInit(): Promise<void> {
    // Subscribe to placeholder availability
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceholder);
    // Try immediately in case placeholders are already available
    this._renderPlaceholder();
  }

  private _renderPlaceholder(): void {
    if (this._topPlaceholder) return;

    this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
      PlaceholderName.Top,
      { onDispose: this._onDispose.bind(this) }
    );

    if (!this._topPlaceholder) {
      console.warn('Top placeholder not available');
      return;
    }

    // Mount React component into placeholder DOM
    const element = React.createElement(UnreadBadgeHeader, { /* props */ });
    ReactDOM.render(element, this._topPlaceholder.domElement);
  }

  private _onDispose(): void {
    if (this._topPlaceholder?.domElement) {
      ReactDOM.unmountComponentAtNode(this._topPlaceholder.domElement);
    }
  }
}
```

### Pattern 2: Direct AadHttpClient in Application Customizer (No Service Container)
**What:** Use `this.context.aadHttpClientFactory.getClient()` directly in the customizer instead of through WissensHubProvider
**When to use:** Application Customizers where WebPartContext-based WissensHubProvider is unavailable
**Example:**
```typescript
// Source: Microsoft Learn AadHttpClient docs + project AzureApiClient pattern
import { AadHttpClient } from '@microsoft/sp-http';

// In onInit or _renderPlaceholder:
let aadClient: AadHttpClient | undefined;
try {
  aadClient = await this.context.aadHttpClientFactory.getClient(
    'api://{client-id-placeholder}'
  );
} catch (error) {
  console.warn('AadHttpClient not available:', error);
  // Fall back to mock data for workbench
}
```

### Pattern 3: Cross-Component CustomEvent Communication
**What:** DOM-level CustomEvent for decoupled communication between web parts and extensions
**When to use:** When the Article Sidebar marks an article as read, the badge count should decrement without page reload
**Example:**
```typescript
// SENDER (Article Sidebar ReadStatusSection - add after successful mark-as-read):
document.dispatchEvent(
  new CustomEvent('wissenshub:article-read', {
    detail: { pageId: 123 }
  })
);

// RECEIVER (Application Customizer - in React component):
React.useEffect(() => {
  const handler = (e: Event): void => {
    const pageId = (e as CustomEvent).detail.pageId;
    // Remove article from list, decrement count
  };
  document.addEventListener('wissenshub:article-read', handler);
  return () => document.removeEventListener('wissenshub:article-read', handler);
}, []);
```

### Pattern 4: Workbench Mock Detection for Application Customizer
**What:** Detect workbench mode and provide mock data when AadHttpClient is unavailable
**When to use:** When the Application Customizer runs during `npm start` on the hosted workbench
**Example:**
```typescript
// Detection: same pattern as WebParts use
const isWorkbench = this.context.isServedFromLocalhost;

// In workbench: AadHttpClient will throw, provide inline mock unread articles
// In production: use real AadHttpClient
```

**Note on workbench limitations:** Application Customizers cannot run on the local workbench (localhost:4321/temp/workbench.html). They require a real SharePoint page. The serve.json is already configured with `pageUrl` pointing to the tenant. When testing via `npm start`, the developer loads the real SharePoint page with `?loadSPFX=true&debugManifestsFile=...` query string. Placeholders are available on real SharePoint pages.

### Anti-Patterns to Avoid
- **Using WissensHubProvider in the customizer:** WissensHubProvider expects `WebPartContext` (from `@microsoft/sp-webpart-base`), but Application Customizers have `ApplicationCustomizerContext` (from `@microsoft/sp-application-base`). These are different types. Use direct AadHttpClient instead.
- **Polling for unread count updates:** The CONTEXT.md explicitly forbids polling. Count updates happen on page navigation (fresh onInit) or via CustomEvent from the sidebar.
- **Creating a shared context between customizer and web parts:** Keep the customizer self-contained. The only cross-component communication is the CustomEvent.
- **Using var instead of const/let:** ESLint no-var rule is enforced (Phase 6-01 decision).
- **Using Array.includes/flatMap:** ES5 target -- use indexOf/forEach instead (Phase 5-02 decision).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Category badge colors | Custom color assignment logic | `getCategoryColor()` from shared/utils | Already deterministic hash-based, matches dashboard exactly |
| Relative date formatting | Custom date formatter | `formatRelativeDate()` from shared/utils | Already handles German locale, same "vor X Std." format |
| Side panel flyout | Custom overlay/modal | Fluent UI `Panel` component | Handles light dismiss, keyboard accessibility, animation, scrolling |
| Badge icon | Custom SVG/CSS icon | Fluent UI `Icon` with `iconName="Ringer"` | Consistent with Teams/Outlook, theme-aware |
| API authentication | Custom OAuth flow | `AadHttpClient` from SPFx | OAuth implicit flow is built into SPFx framework |

**Key insight:** The Application Customizer is largely an assembly of existing patterns and shared utilities from the project. The only truly new code is the placeholder rendering lifecycle and the CustomEvent listener.

## Common Pitfalls

### Pitfall 1: Placeholder Not Available on First onInit Call
**What goes wrong:** `tryCreateContent(PlaceholderName.Top)` returns undefined because placeholders aren't rendered yet when `onInit()` first runs.
**Why it happens:** SharePoint renders page chrome asynchronously. The placeholder DOM elements may not exist when the extension initializes.
**How to avoid:** Subscribe to `this.context.placeholderProvider.changedEvent` and call `tryCreateContent` from the event handler. Also try on first call (may succeed immediately). Guard with `if (this._topPlaceholder) return;` to avoid double-rendering.
**Warning signs:** Console error "The expected placeholder (Top) was not found." on initial page load.

### Pitfall 2: React Component Not Unmounted on Dispose
**What goes wrong:** Memory leaks and event listener zombies when navigating between pages in an SPA-like SharePoint experience.
**Why it happens:** SharePoint Modern pages use client-side routing. The customizer's `onDispose` callback fires when the placeholder is disposed, but React components keep running if not explicitly unmounted.
**How to avoid:** Call `ReactDOM.unmountComponentAtNode(this._topPlaceholder.domElement)` in the `onDispose` callback. Also remove the CustomEvent listener in the React component's cleanup function.
**Warning signs:** Multiple event listeners accumulating, badge count jumping unexpectedly.

### Pitfall 3: ApplicationCustomizerContext vs WebPartContext Type Mismatch
**What goes wrong:** TypeScript compilation error when passing `this.context` to WissensHubProvider which expects `WebPartContext`.
**Why it happens:** `BaseApplicationCustomizer.context` is `ApplicationCustomizerContext`, not `WebPartContext`. They share some properties but are different types.
**How to avoid:** Don't use WissensHubProvider or the shared service container. Instead, use `this.context.aadHttpClientFactory.getClient()` directly and pass the AadHttpClient instance as a prop to the React component.
**Warning signs:** TypeScript error: "Type 'ApplicationCustomizerContext' is not assignable to type 'WebPartContext'".

### Pitfall 4: CustomEvent Not Dispatched by Article Sidebar Yet
**What goes wrong:** The Application Customizer listens for `wissenshub:article-read` but it never fires.
**Why it happens:** The Phase 6 CONTEXT.md specified this cross-component event, but the implementation was deferred. The Article Sidebar's `ReadStatusSection.tsx` calls `onReadStatusChange()` (which triggers `articleStatus.refetch()`) but does NOT dispatch a CustomEvent.
**How to avoid:** Phase 8 must add the CustomEvent dispatch to the Article Sidebar's mark-as-read success path. Add `document.dispatchEvent(new CustomEvent(...))` after the successful `markAsRead.execute(pageId)` call in `ReadStatusSection.tsx`.
**Warning signs:** Badge count never decrements in real time on article pages.

### Pitfall 5: ES5 Target Restrictions
**What goes wrong:** Runtime errors or build failures from using ES2015+ APIs.
**Why it happens:** SPFx tsconfig extends a base that targets ES5. Methods like `Array.includes`, `Array.flatMap`, `Array.find` may not be available.
**How to avoid:** Use `indexOf`, `forEach`, manual loops. This is an established project constraint (Phase 5-02 decision). Note: `Array.find` IS available via polyfills in SPFx, but `includes` and `flatMap` are not.
**Warning signs:** Build errors about property not existing on type, or runtime "X is not a function" errors.

### Pitfall 6: Panel Light Dismiss Interfering with Badge Click
**What goes wrong:** Clicking the bell icon to close the panel reopens it because the light dismiss closes it first, then the click handler opens it again.
**Why it happens:** Event bubbling: the Panel's light dismiss fires on any outside click, then the bell icon's click handler toggles the panel state to open.
**How to avoid:** Track panel state carefully. When the panel is open, a bell click should toggle it closed (not rely on light dismiss). One approach: use a ref or timestamp to debounce rapid open/close cycles, or simply let the bell toggle: if open, close; if closed, open.
**Warning signs:** Panel rapidly opens and closes when clicking the bell icon.

## Code Examples

### UnreadArticle Frontend Model
```typescript
// New model for the flyout panel items
export interface IUnreadArticle {
  pageId: number;
  title: string;
  category: string;
  isMandatory: boolean;
  updatedAt: Date;
  url: string;  // Constructed from pageId + site URL pattern
}
```

### API Response DTO Mapping
```typescript
// Backend returns: { pageId, title, category, isMandatory, updatedAt }
// Note: the backend returns a List<UnreadArticleDto>, NOT wrapped in ApiResponse
// (based on handler returning ApiResponse<List<UnreadArticleDto>>.Ok(articles))
// The AadHttpClient response.json() will yield the list directly.

export interface UnreadArticleDto {
  pageId: number;
  title: string;
  category: string;
  isMandatory: boolean;
  updatedAt: string; // ISO date string from JSON
}

function mapToUnreadArticle(dto: UnreadArticleDto, siteUrl: string): IUnreadArticle {
  return {
    pageId: dto.pageId,
    title: dto.title,
    category: dto.category,
    isMandatory: dto.isMandatory,
    updatedAt: new Date(dto.updatedAt),
    url: siteUrl + '/SitePages/' + dto.title.replace(/\s+/g, '-') + '.aspx',
    // Note: URL construction may need refinement. The backend currently doesn't
    // return a URL field. Consider using pageId-based lookup or extending the DTO.
  };
}
```

**Important note on article URLs:** The `UnreadArticleDto` from the backend does NOT include a URL field. The frontend mock data (`MOCK_ARTICLES`) has URLs like `/sites/WissensHub/SitePages/Passwort-Richtlinie.aspx`. Options for the real implementation:
1. Construct URL from title (fragile -- titles with special characters break)
2. Have the backend include URL in the DTO (requires API change -- out of Phase 8 scope since API is complete)
3. Cross-reference with `MOCK_ARTICLES` by pageId in mock mode; in production, the unread articles endpoint should be extended in a future phase

For Phase 8 (mock-focused workbench development), use the mock articles' URL by matching pageId. For production, the URL construction can use the SharePoint site URL + page ID lookup. This is a known limitation to address when connecting to the real API.

### Bell Icon with Badge (React Component)
```typescript
// Source: Fluent UI v8 Icon + custom badge overlay
import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from './UnreadBadgeHeader.module.scss';

interface IUnreadBadgeHeaderProps {
  unreadCount: number;
  isLoading: boolean;
  onBellClick: () => void;
}

const UnreadBadgeHeader: React.FC<IUnreadBadgeHeaderProps> = ({
  unreadCount,
  isLoading,
  onBellClick,
}) => {
  const displayCount = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <div className={styles.container}>
      <button
        className={styles.bellButton}
        onClick={onBellClick}
        aria-label={'Ungelesene Artikel: ' + displayCount}
        type="button"
      >
        <Icon iconName="Ringer" className={styles.bellIcon} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{displayCount}</span>
        )}
      </button>
    </div>
  );
};
```

### Flyout Panel with Article List
```typescript
// Source: Fluent UI v8 Panel component
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { Icon } from '@fluentui/react/lib/Icon';
import { getCategoryColor } from '../../../shared/utils/getCategoryColor';
import { formatRelativeDate } from '../../../shared/utils/formatRelativeDate';

// Panel usage:
<Panel
  isOpen={isPanelOpen}
  onDismiss={onClose}
  type={PanelType.smallFixedFar}
  headerText={unreadCount + ' ungelesene Artikel'}
  isLightDismiss={true}
  closeButtonAriaLabel="Schliessen"
>
  {articles.length === 0 ? (
    <div className={styles.emptyState}>
      <Icon iconName="CheckMark" className={styles.emptyIcon} />
      <span>Alle Artikel gelesen!</span>
    </div>
  ) : (
    <>
      {sortedArticles.map(article => (
        <div
          key={article.pageId}
          className={styles.articleItem}
          onClick={() => handleArticleClick(article.url)}
          role="button"
          tabIndex={0}
        >
          <span
            className={styles.categoryBadge}
            style={{ backgroundColor: getCategoryColor(article.category) }}
          >
            {article.category}
          </span>
          <div className={styles.articleTitle}>{article.title}</div>
          <div className={styles.articleMeta}>
            {formatRelativeDate(article.updatedAt)}
          </div>
          {article.isMandatory && (
            <span className={styles.mandatoryBadge}>Pflichtartikel</span>
          )}
        </div>
      ))}
      {totalUnread > 10 && (
        <a href={dashboardUrl + '?filter=unread'} className={styles.showAllLink}>
          Alle {totalUnread} anzeigen
        </a>
      )}
    </>
  )}
</Panel>
```

### CustomEvent Dispatch Addition to Article Sidebar
```typescript
// Add to ReadStatusSection.tsx handleMarkAsRead callback, after success:
const handleMarkAsRead = React.useCallback(async () => {
  const previousDate = localReadDate;
  setLocalReadDate(new Date()); // optimistic
  const success = await markAsRead.execute(pageId);
  if (!success) {
    setLocalReadDate(previousDate); // revert
  } else {
    onReadStatusChange();
    // Dispatch cross-component event for Application Customizer
    document.dispatchEvent(
      new CustomEvent('wissenshub:article-read', {
        detail: { pageId: pageId }
      })
    );
  }
}, [pageId, markAsRead, localReadDate, onReadStatusChange]);
```

### Mock Data for Workbench
```typescript
// Inline mock unread articles derived from existing MOCK_ARTICLES
// Filter: Published articles where pageId not in MOCK_READ_CONFIRMATIONS
// This gives a consistent workbench experience matching the dashboard
import { MOCK_ARTICLES, MOCK_READ_CONFIRMATIONS } from '../../../shared/services/__mocks__/mockData';

const readPageIds = MOCK_READ_CONFIRMATIONS.map(r => r.pageId);
const mockUnreadArticles = MOCK_ARTICLES
  .filter(a => a.status === 'Published' && readPageIds.indexOf(a.id) < 0)
  .map(a => ({
    pageId: a.id,
    title: a.title,
    category: a.category,
    isMandatory: a.isMandatory,
    updatedAt: a.modifiedDate,
    url: a.url,
  }));
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| innerHTML in placeholders | ReactDOM.render into placeholder.domElement | SPFx 1.4+ | Full React lifecycle, Fluent UI components work correctly |
| Local workbench for extensions | Hosted workbench (real SharePoint page) only | SPFx 1.11+ | Must use serve.json pageUrl, cannot use localhost workbench |
| Custom OAuth in extensions | AadHttpClient via context.aadHttpClientFactory | SPFx 1.4.1+ | No manual token management needed |
| UserCustomAction JavaScript injection | SPFx Application Customizer | SPFx 1.0+ | Type-safe, lifecycle-managed, placeholder-based |

**Deprecated/outdated:**
- Local workbench for testing extensions: removed in SPFx 1.13+, extensions always require a hosted workbench
- `context.httpClient` for authenticated API calls: use `context.aadHttpClientFactory.getClient()` instead

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 27 (via SPFx Heft) |
| Config file | Inherited from @microsoft/spfx-web-build-rig |
| Quick run command | `cd spfx && npx heft test --clean` |
| Full suite command | `cd spfx && npx heft test --clean` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BADGE-01 | Bell icon renders with unread count badge | unit | `cd spfx && npx heft test --clean` (component renders with count) | No - Wave 0 |
| BADGE-01 | Badge hidden when count is zero | unit | `cd spfx && npx heft test --clean` (renders without badge at 0) | No - Wave 0 |
| BADGE-01 | Count capped at "99+" | unit | `cd spfx && npx heft test --clean` (displays 99+ for 100+) | No - Wave 0 |
| BADGE-02 | Panel opens on bell click | unit | `cd spfx && npx heft test --clean` (panel isOpen state) | No - Wave 0 |
| BADGE-02 | Panel shows unread article list | unit | `cd spfx && npx heft test --clean` (article items rendered) | No - Wave 0 |
| BADGE-02 | Mandatory articles sorted to top | unit | `cd spfx && npx heft test --clean` (sort order) | No - Wave 0 |
| BADGE-02 | Empty state when no unread | unit | `cd spfx && npx heft test --clean` (empty message) | No - Wave 0 |
| BADGE-03 | Click article navigates to URL | unit | `cd spfx && npx heft test --clean` (window.location mock) | No - Wave 0 |
| BADGE-03 | Panel closes on article click | unit | `cd spfx && npx heft test --clean` (panel state after click) | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `cd spfx && npx heft test --clean`
- **Per wave merge:** `cd spfx && npx heft test --clean`
- **Phase gate:** Full suite green before /gsd:verify-work

### Wave 0 Gaps
- [ ] `spfx/src/extensions/unreadBadge/components/__tests__/UnreadBadgeHeader.test.tsx` -- covers BADGE-01 (icon, badge, count cap)
- [ ] `spfx/src/extensions/unreadBadge/components/__tests__/UnreadFlyoutPanel.test.tsx` -- covers BADGE-02, BADGE-03 (panel, articles, navigation)
- [ ] Shared test utilities already exist (@testing-library/react v12, @testing-library/jest-dom v5)

## Open Questions

1. **Article URL construction from UnreadArticleDto**
   - What we know: Backend `UnreadArticleDto` returns `PageId, Title, Category, IsMandatory, UpdatedAt` but no URL field
   - What's unclear: How to reliably construct article page URL from pageId alone in production
   - Recommendation: For Phase 8 (workbench-focused), use mock article URLs matched by pageId. For production, the URL can be constructed as `{siteUrl}/SitePages/{pageTitle}.aspx` (matching SharePoint's default URL pattern from page title). This works for the provisioned sample data. If the URL contains special characters, SharePoint normalizes them (spaces to hyphens, umlauts preserved). A future phase could extend the backend DTO to include the URL directly.

2. **"Alle X anzeigen" dashboard URL with filter**
   - What we know: Dashboard supports stat-bar quick filters ("Ungelesen" click filters to unread)
   - What's unclear: Whether the dashboard reads a query parameter to activate the unread filter on load
   - Recommendation: Construct URL as `{siteUrl}/SitePages/Home.aspx?filter=unread`. The dashboard does not currently read URL query parameters for filter state. This feature can be added as a small enhancement in a later phase, or can be skipped for now (link navigates to dashboard without pre-applied filter). For Phase 8, the link should still exist and navigate to the dashboard page -- pre-filtering is a nice-to-have enhancement.

## Sources

### Primary (HIGH confidence)
- [Microsoft Learn: Use page placeholders from Application Customizer](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/using-page-placeholder-with-extensions) - Placeholder API, tryCreateContent, changedEvent, onDispose pattern (updated 2026-01-12)
- [Microsoft Learn: Connect to Entra ID-secured APIs](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient) - AadHttpClient in SPFx solutions, context.aadHttpClientFactory (updated 2025-10-22)
- Project codebase: `DashboardWebPart.ts` - AadHttpClient initialization pattern
- Project codebase: `WissensHubContext.tsx` - Service container pattern (reference, NOT to use in customizer)
- Project codebase: `AzureApiClient.ts` - API call pattern with Result<T>
- Project codebase: `ArticleCard.tsx` - Category badge, relative date, mandatory badge patterns
- Project codebase: `ReadStatusSection.tsx` - Mark-as-read flow (where to add CustomEvent dispatch)
- Backend: `UnreadArticleDto.cs` - API response shape: PageId, Title, Category, IsMandatory, UpdatedAt
- Project codebase: `mockData.ts` - Mock articles and read confirmations for workbench consistency

### Secondary (MEDIUM confidence)
- [Microsoft Learn: Build first SPFx Extension](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/build-a-hello-world-extension) - Extension lifecycle, onInit, testing with serve.json
- [C# Corner: React Components in SPFx Application Customizer](https://www.c-sharpcorner.com/article/using-react-components-in-spfx-extension-application-customizer/) - ReactDOM.render pattern in placeholder

### Tertiary (LOW confidence)
- None -- all findings verified against official docs or project code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages already installed, versions confirmed from package.json
- Architecture: HIGH - Placeholder pattern verified against Microsoft Learn docs (Jan 2026), AadHttpClient pattern verified against project code and official docs
- Pitfalls: HIGH - Identified from official docs warnings, project decisions log, and code review of existing components
- Code examples: HIGH - Based on existing project code patterns and official documentation

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable SPFx 1.22.2 platform, no breaking changes expected)
