# Phase 10: Caching, Telemetry, UX Polish & i18n - Research

**Researched:** 2026-03-17
**Domain:** Cross-cutting production quality layer (caching, observability, error handling, internationalization) for SPFx 1.22.2 + PnPjs 4.18.0 + Fluent UI v8
**Confidence:** HIGH

## Summary

Phase 10 applies four cross-cutting concerns across all existing web parts and the Application Customizer: (1) multi-layer caching with PnPjs session cache and in-memory TTL, (2) Application Insights telemetry with cost-safe configuration, (3) UX polish including Error Boundaries, toast notifications, shimmer skeletons, responsive design, and accessibility, and (4) German/English internationalization using SPFx's built-in localization module pattern.

The project already has significant infrastructure in place: PnPjs 4.18.0 with `@pnp/queryable` (includes `Caching` behavior), Fluent UI v8 with `Shimmer` and `MessageBar` components, existing optimistic UI patterns in ReadStatusSection.tsx and Dashboard.tsx, existing `loc/` folder scaffolds in all web parts and the extension, and a well-established service container pattern. The main work is wiring new services (CacheService, ITelemetryService) into the existing architecture and systematically extracting ~200+ hardcoded German strings into localization files.

**Primary recommendation:** Follow the spec's code examples closely for CacheService and ITelemetryService implementations, adapting for project conventions (`undefined` instead of `null` per `@rushstack/no-new-null`). Use `@microsoft/applicationinsights-web@3.3.11` paired with `@microsoft/applicationinsights-react-js@17.3.6` (the React 17-compatible track). For i18n, use SPFx's native `define/require` localization module pattern already scaffolded in all web parts.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- PnPjs Caching behavior with uniform 5-minute session store TTL for all SharePoint queries (articles, groups, user info)
- CacheService as a singleton in IServiceContainer -- one shared in-memory Map with TTL, accessible by all hooks
- Stale-while-revalidate in query hooks: show cached data immediately, silently swap to fresh data when it arrives (no visual "refreshing" indicator)
- Cache invalidation on write commands only (mark-as-read, favorite, approve/reject) -- no window focus invalidation
- Per-data TTLs in CacheService follow the spec: unread count 60s, read stats 2min, favorites 5min, pending approvals 30s, dashboard stats 60s
- Application Insights connection string configured as a web part property in the property pane -- empty value falls back to ConsoleTelemetryService for local dev
- ITelemetryService interface added to IServiceContainer with two implementations: AppInsightsTelemetryService (production) and ConsoleTelemetryService (local dev)
- Cost-safe config: disableFetchTracking and disableAjaxTracking enabled to prevent SharePoint background HTTP call logging
- Telemetry wired at hook level: command hooks auto-track events on success/failure -- components don't call trackEvent directly
- 9 custom events: article_read, article_flagged, article_favorited, article_approved, article_rejected, dashboard_loaded, search_executed, error_api_call, error_sharepoint
- React Error Boundary wrapping each web part root -- shows simple "Something went wrong" card with "Reload" button, Fluent UI styled. No expandable error details.
- Toast notifications via Fluent UI MessageBar at top of each web part, auto-dismiss after 5 seconds. Success/error/warning types.
- Full shimmer skeletons for key surfaces: Dashboard (card grid + stats bar), Article Sidebar (metadata section), Freigabecenter (approval list), Admin Panel (report table). Smaller sub-components use Spinner.
- Optimistic UI scope stays as-is: mark-as-read and favorite toggle only. Approve/reject stays synchronous (high-stakes actions).
- Responsive design: fluid containers with breakpoints -- card grid switches 3-col to 2-col to 1-col, tables become card lists on narrow zones. Standard breakpoints for full-width, 2/3, and 1/3 column zones.
- WCAG AA essentials: ARIA labels on all interactive elements, keyboard navigation for cards/lists/dialogs, focus trap in flyouts/dialogs, skip-to-content where applicable.
- Debounced search (already exists as a pattern -- formalize across all search inputs).
- Shared strings module in src/shared/loc/ for common labels + per-web-part loc/ folders for component-specific strings
- Extension (Unread Badge) uses its own loc/ folder (already scaffolded, needs de-de.js and real strings)
- All ~200+ hardcoded German strings extracted in one pass -- German as de-de.js (default), English as en-us.js
- Language detection via SharePoint UI language setting (context.pageContext.cultureInfo.currentUICultureName), fallback to German
- SPFx built-in localization module pattern (define/require) -- no external i18n library needed

### Claude's Discretion
- Exact shimmer skeleton layouts per component
- MessageBar positioning CSS within web parts
- Specific ARIA role assignments per interactive element
- CacheService key naming conventions
- Error Boundary class component implementation details (must be class component -- React limitation)
- Toast auto-dismiss timing adjustments if 5s feels too short/long

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CACH-01 | PnPjs session cache for SharePoint page queries (5 min TTL) | PnPjs `Caching` behavior from `@pnp/queryable` -- already installed. Apply to SP instance in SharePointPageService constructor with `store: "session"` and `expireFunc` returning Date + 5min. |
| CACH-02 | In-memory API cache with TTL for Azure Functions responses | CacheService class with Map<string, CacheEntry<T>> -- use `undefined` returns (not `null`) per @rushstack/no-new-null. Add to IServiceContainer. |
| CACH-03 | Stale-while-revalidate pattern in query hooks | Modify all 13 query hooks to check CacheService on mount (show stale data immediately), then fetch fresh and swap silently. Requires adding `isStale` flag to QueryState. |
| CACH-04 | Cache invalidation on write commands | All 13 command hooks invalidate relevant cache keys after successful execution via `services.cache.invalidate(pattern)`. |
| TELE-01 | Application Insights single instance for frontend + backend | Install `@microsoft/applicationinsights-web@3.3.11` + `@microsoft/applicationinsights-react-js@17.3.6` + `history@5.3.0`. Connection string via web part property pane. |
| TELE-02 | Cost-safe configuration | `disableFetchTracking: true`, `disableAjaxTracking: true`, `autoTrackPageVisitTime: false`, `enableAutoRouteTracking: false` in ApplicationInsights config. |
| TELE-03 | Custom events tracked (9 events) | Wire into command hooks at success/failure paths. Each hook calls `services.telemetry.trackEvent()`. |
| TELE-04 | ConsoleTelemetryService for local dev | ITelemetryService interface with console.log implementation. Chosen when connection string is empty/missing. |
| TELE-05 | React Error Boundary wrapping each web part root | Class component (React 17 limitation) wrapping each web part's render() output. Calls telemetry.trackException. |
| TELE-06 | Toast notifications via Fluent UI MessageBar | useToast hook + ToastProvider context. MessageBar with auto-dismiss. Positioned at top of web part container. |
| UX-01 | Optimistic UI updates for mark-as-read and favorite toggle | Already implemented in ReadStatusSection.tsx and Dashboard.tsx. Phase 10 formalizes and ensures all entry points use the pattern. |
| UX-02 | Loading skeletons with Fluent UI Shimmer | Fluent UI `Shimmer`, `ShimmerElementType` -- already partially used in Dashboard. Extend to Sidebar, Freigabecenter, AdminPanel. |
| UX-03 | Debounced search input | Already implemented in Dashboard.tsx (300ms). Ensure consistent debounce across all search inputs (AdminPanel search). |
| UX-04 | Responsive design for column zones | CSS media queries / container width breakpoints in SCSS modules. Dashboard already has `getGridColumns(width)`. Extend to all web parts. |
| UX-05 | Accessibility -- ARIA labels, keyboard navigation, focus management | ARIA attributes on interactive elements, tabIndex on custom cards, keyboard event handlers, FocusTrapZone in dialogs/flyouts. |
| I18N-01 | i18n framework with German as default language | SPFx built-in `define/require` loc pattern. Add `de-de.js` files alongside existing `en-us.js`. Register shared strings in config.json `localizedResources`. |
| I18N-02 | English as secondary language | `en-us.js` files with English translations. SPFx auto-selects based on `pageContext.cultureInfo.currentUICultureName`. |
| I18N-03 | All UI labels, messages, and tooltips localized | Extract ~200+ hardcoded German strings from ~40+ source files into loc modules. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @pnp/queryable | 4.18.0 | PnPjs Caching behavior for SP queries | Already installed. Exports `Caching` with `store: "session"` and `expireFunc` options. |
| @microsoft/applicationinsights-web | 3.3.11 | Application Insights SDK for browser | Official Microsoft SDK. v3.x is the current stable major. |
| @microsoft/applicationinsights-react-js | 17.3.6 | React plugin for Application Insights | v17.x track is specifically for React 17 (SPFx uses React 17.0.1). |
| history | 5.3.0 | Peer dependency for applicationinsights-react-js | Required peer dep (`>= 4.10.1`). |
| @fluentui/react | 8.106.4+ | Shimmer, MessageBar, FocusTrapZone, Spinner | Already installed. All needed components available in v8. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @pnp/sp | 4.18.0 | SharePoint operations with caching | Already installed. Caching applied via `.using(Caching({...}))`. |
| react | 17.0.1 | Error Boundary (class component) | Already installed. React 17 requires class components for Error Boundaries. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @microsoft/applicationinsights-react-js | Just @microsoft/applicationinsights-web alone | React plugin adds component tracking -- but since we disabled auto-tracking, the core SDK would suffice. However, the spec explicitly shows ReactPlugin usage and the Error Boundary integration benefits from it. Keep for spec compliance. |
| In-memory CacheService (Map) | External caching lib (e.g., lru-cache) | In-memory Map is simpler, no extra dependency. LRU eviction is unnecessary -- TTL-based expiry is sufficient for our data volumes. |
| SPFx built-in localization | react-intl / i18next | SPFx has a native localization system. External i18n libraries add complexity with no benefit in SPFx context. |

**Installation:**
```bash
cd spfx && npm install @microsoft/applicationinsights-web@3.3.11 @microsoft/applicationinsights-react-js@17.3.6 history@5.3.0
```

**Version verification:** Confirmed via `npm view` on 2026-03-17:
- `@microsoft/applicationinsights-web` latest: 3.3.11
- `@microsoft/applicationinsights-react-js` latest React 17 track: 17.3.6
- `history` latest: 5.3.0
- `@pnp/queryable`: 4.18.0 (already installed)

## Architecture Patterns

### Recommended Project Structure Changes
```
src/
  shared/
    services/
      CacheService.ts              # NEW: In-memory cache with TTL
      TelemetryService.ts          # NEW: ITelemetryService + AppInsightsTelemetryService + ConsoleTelemetryService
    components/
      ErrorBoundary.tsx            # NEW: React class component Error Boundary
      ErrorFallback.tsx            # NEW: "Something went wrong" recovery UI
      ToastProvider.tsx            # NEW: Toast context + MessageBar rendering
    hooks/
      useToast.ts                  # NEW: Toast hook consuming ToastProvider
      queries/                     # MODIFY: All 13 hooks get stale-while-revalidate
      commands/                    # MODIFY: All 13 hooks get telemetry + cache invalidation
    context/
      ServiceContainer.ts          # MODIFY: Add cacheService + telemetryService to IServiceContainer
      WissensHubContext.tsx         # MODIFY: Initialize CacheService + TelemetryService
      pnpSetup.ts                  # MODIFY: Add Caching behavior
    loc/                           # NEW: Shared localization strings
      de-de.js
      en-us.js
      mystrings.d.ts
  webparts/
    dashboard/
      loc/
        de-de.js                   # NEW: German strings (default)
        en-us.js                   # MODIFY: Replace scaffold strings with real UI strings
        mystrings.d.ts             # MODIFY: Extend with all UI string keys
    articleSidebar/loc/            # Same pattern
    freigabecenter/loc/            # Same pattern
    adminPanel/loc/                # Same pattern
  extensions/
    unreadBadge/loc/               # Same pattern
```

### Pattern 1: CacheService Singleton (in-memory TTL cache)
**What:** A generic Map-based cache with TTL and prefix-based invalidation, registered as a singleton in IServiceContainer.
**When to use:** All API responses and computed data that benefit from short-lived caching.
**Key adaptation from spec:** Return `undefined` instead of `null` for cache misses to comply with `@rushstack/no-new-null` lint rule.
```typescript
// src/shared/services/CacheService.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs: number = 60_000): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
  }

  invalidate(pattern: string): void {
    for (const key of Array.from(this.cache.keys())) {
      if (key.indexOf(pattern) === 0) this.cache.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
  }
}
```

### Pattern 2: PnPjs Session Caching
**What:** Apply PnPjs `Caching` behavior to the SP instance used in SharePointPageService.
**When to use:** All SharePoint list item queries.
```typescript
// In SharePointPageService constructor or pnpSetup.ts
import { Caching } from "@pnp/queryable";

// Apply to SP instance
const cachedSp = sp.using(Caching({
  store: "session",
  expireFunc: () => {
    const expire = new Date();
    expire.setMinutes(expire.getMinutes() + 5);
    return expire;
  }
}));
```

### Pattern 3: Stale-While-Revalidate in Query Hooks
**What:** Check in-memory cache on mount, show stale data immediately, fetch fresh in background.
**When to use:** All 13 query hooks.
**Key detail:** QueryState needs an `isStale` field. When stale data exists, skip showing loading state.
```typescript
// Modified useArticlesQuery pattern
const [state, setState] = React.useState<QueryState<IArticlePage[]>>(() => {
  const cached = services.cache.get<IArticlePage[]>(cacheKey);
  return cached
    ? { status: 'success', data: cached }
    : { status: 'loading' };
});

const fetch = React.useCallback(async (): Promise<void> => {
  // Only show loading if no cached data
  if (state.status !== 'success') {
    setState({ status: 'loading' });
  }
  const result = await services.pageService.getPublishedArticles();
  if (result.success) {
    services.cache.set(cacheKey, result.data, TTL);
    setState({ status: 'success', data: result.data });
  } else if (state.status !== 'success') {
    setState({ status: 'error', error: result.error });
  }
  // If fetch fails but we have stale data, keep showing it silently
}, [services]);
```

### Pattern 4: Telemetry in Command Hooks
**What:** Track custom events in command hooks at the service level, not in components.
**When to use:** All 13 command hooks that perform write operations.
```typescript
// Modified useMarkAsReadCommand pattern
const execute = React.useCallback(async (pageId: number): Promise<boolean> => {
  setState({ status: 'executing' });
  const result = await services.readConfirmationService.markAsRead(pageId);
  if (result.success) {
    setState({ status: 'success' });
    services.telemetry.trackEvent('article_read', { pageId: String(pageId) });
    services.cache.invalidate('articles:');
    services.cache.invalidate('unread:');
    services.cache.invalidate('readstats:' + pageId);
    return true;
  } else {
    setState({ status: 'error', error: result.error });
    services.telemetry.trackEvent('error_api_call', {
      endpoint: 'markAsRead',
      errorMessage: result.error.message
    });
    return false;
  }
}, [services]);
```

### Pattern 5: Error Boundary as Class Component
**What:** React Error Boundary wrapping each web part root. Must be a class component (React 17 limitation).
**When to use:** Every web part's render() method and the Application Customizer.
```typescript
// React.createElement usage at web part level (existing pattern)
const element = React.createElement(
  ErrorBoundary,
  {
    telemetry: telemetryService,
    fallback: React.createElement(ErrorFallback, { onRetry: () => window.location.reload() }),
    children: React.createElement(
      WissensHubProvider,
      { spContext: this.context, /* ... */ children: child }
    )
  }
);
```

### Pattern 6: SPFx Localization Module Pattern
**What:** SPFx's built-in `define()` / `require()` localization system.
**When to use:** All UI-facing strings.
```javascript
// loc/de-de.js (German -- default language)
define([], function() {
  return {
    "MarkAsRead": "Als gelesen markieren",
    "Favorites": "Favoriten",
    "Unread": "Ungelesen",
    // ...
  }
});

// loc/en-us.js (English)
define([], function() {
  return {
    "MarkAsRead": "Mark as read",
    "Favorites": "Favorites",
    "Unread": "Unread",
    // ...
  }
});

// loc/mystrings.d.ts
declare interface ISharedStrings {
  MarkAsRead: string;
  Favorites: string;
  Unread: string;
}
declare module 'SharedStrings' {
  const strings: ISharedStrings;
  export = strings;
}
```

**Registration in config.json:**
```json
{
  "localizedResources": {
    "SharedStrings": "lib/shared/loc/{locale}.js",
    "DashboardWebPartStrings": "lib/webparts/dashboard/loc/{locale}.js"
  }
}
```

### Anti-Patterns to Avoid
- **Using `null` returns in CacheService:** Project uses `undefined` per `@rushstack/no-new-null` (ESLint warning). Use `undefined` for cache misses.
- **Auto-dependency tracking in Application Insights:** CRITICAL cost trap. SharePoint generates huge volumes of background HTTP calls. Must disable `fetchTracking` and `ajaxTracking`.
- **Using `Array.includes()` or `Array.flatMap()`:** SPFx tsconfig targets ES5. Use `indexOf` and `forEach` instead.
- **Using `var` declarations:** ESLint `no-var` rule is active. Use `const`/`let`.
- **Using JSX in web part .ts files:** Web part root files use `React.createElement`. Only `.tsx` files use JSX.
- **Putting telemetry calls in components:** Wire telemetry at the hook level (command hooks). Components stay clean.
- **Using arrow function components for Error Boundary:** React 17 requires class components for `getDerivedStateFromError` and `componentDidCatch`.
- **Iterating cache.keys() with for...of during deletion:** Convert to `Array.from()` first to avoid iterator invalidation.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SharePoint response caching | Custom session storage wrapper | `@pnp/queryable` `Caching` behavior | PnPjs handles cache key generation, serialization, session storage management. Built-in, tested, zero config. |
| Browser telemetry | Custom fetch interceptor / event sender | `@microsoft/applicationinsights-web` | Handles batching, retry, sampling, correlation IDs. Custom implementations miss edge cases. |
| Localization | Custom string lookup system | SPFx built-in `localizedResources` + `define/require` | SPFx's build system handles locale resolution, bundling, fallback. It's the standard. |
| Focus trapping in dialogs | Manual focus management code | Fluent UI `FocusTrapZone` | Already available in @fluentui/react. Handles edge cases (nested traps, restore on unmount). |
| Toast auto-dismiss | Custom setTimeout management | useToast hook with cleanup | Encapsulate timer lifecycle in hook; cleanup on unmount to prevent memory leaks. |

**Key insight:** This phase is almost entirely wiring existing infrastructure together. PnPjs caching, Application Insights, Fluent UI components (Shimmer, MessageBar, FocusTrapZone), and SPFx localization are all purpose-built for these exact use cases.

## Common Pitfalls

### Pitfall 1: Application Insights Cost Explosion
**What goes wrong:** SharePoint makes hundreds of background HTTP calls per page load. With auto-dependency tracking enabled, each call generates a telemetry event. This can cost thousands of dollars per month.
**Why it happens:** Application Insights enables fetch/XHR tracking by default.
**How to avoid:** Set `disableFetchTracking: true` and `disableAjaxTracking: true` in the ApplicationInsights config. Only log custom events and exceptions.
**Warning signs:** Application Insights dependency table growing rapidly in Azure portal.

### Pitfall 2: @rushstack/no-new-null Lint Rule
**What goes wrong:** Spec's CacheService returns `null` for cache misses. Project's ESLint config warns on `null` usage.
**Why it happens:** The `@rushstack/no-new-null` rule at warning level (1) discourages new null introductions.
**How to avoid:** Return `undefined` instead of `null` from `CacheService.get()`. All existing code already uses `undefined` for optional values.
**Warning signs:** ESLint warnings during build.

### Pitfall 3: ES5 Target Compatibility
**What goes wrong:** Using ES6+ features like `Array.includes()`, `Array.flatMap()`, `for...of` on iterators, optional chaining in some contexts.
**Why it happens:** SPFx tsconfig extends a base that targets ES5.
**How to avoid:** Use `indexOf` instead of `includes`, `forEach` instead of `flatMap`, `Array.from()` before iterating Maps/Sets. This is an established project convention (see Phase 05-02, 06-01 decisions).
**Warning signs:** Build errors about property not existing on type.

### Pitfall 4: React 17 Limitations for Error Boundary
**What goes wrong:** Trying to use hooks or functional components for Error Boundaries.
**Why it happens:** React 17 (and even 18) only supports Error Boundaries as class components with `getDerivedStateFromError` and `componentDidCatch`.
**How to avoid:** Error Boundary must be a class component. This is the one exception to the project's "functional components with hooks" rule.
**Warning signs:** TypeScript errors about missing lifecycle methods.

### Pitfall 5: applicationinsights-react-js Version Mismatch
**What goes wrong:** Installing latest `@microsoft/applicationinsights-react-js` (v19.x) which requires React 18.
**Why it happens:** The package's major version now tracks React version. v19.x = React 19, v18.x = React 18, v17.x = React 17.
**How to avoid:** Pin to `@microsoft/applicationinsights-react-js@17.3.6` specifically. This is the latest in the React 17-compatible track.
**Warning signs:** Peer dependency warnings about React version mismatch.

### Pitfall 6: SPFx Localization Default Language
**What goes wrong:** Assuming SPFx defaults to English. If the SharePoint site UI language is German, SPFx loads `de-de.js` automatically.
**Why it happens:** SPFx resolves locale from `pageContext.cultureInfo.currentUICultureName`, not from a hardcoded default.
**How to avoid:** Create `de-de.js` as the primary/complete translation. `en-us.js` as secondary. SPFx falls back to the first file found if the locale doesn't match any file -- ensure `en-us.js` (the scaffold default) always exists as fallback.
**Warning signs:** Missing strings when switching languages.

### Pitfall 7: Shared Loc Module Registration
**What goes wrong:** Creating a shared `loc/` folder under `src/shared/` but forgetting to register it in `config/config.json` `localizedResources`.
**Why it happens:** Per-web-part loc folders are auto-registered by scaffolding, but shared modules need manual registration.
**How to avoid:** Add `"SharedStrings": "lib/shared/loc/{locale}.js"` to `config/config.json` `localizedResources`. Import as `import * as sharedStrings from 'SharedStrings';`.
**Warning signs:** Build error: "Cannot find module 'SharedStrings'".

### Pitfall 8: History Package Peer Dependency
**What goes wrong:** `@microsoft/applicationinsights-react-js@17.3.6` requires `history >= 4.10.1` as a peer dependency. Missing it causes npm warnings and potentially runtime errors.
**Why it happens:** The React plugin uses history for route tracking (even though we disable auto-route tracking).
**How to avoid:** Install `history@5.3.0` alongside the AI packages.
**Warning signs:** npm WARN peer dep missing.

## Code Examples

### CacheService with IServiceContainer Integration
```typescript
// src/shared/context/ServiceContainer.ts -- MODIFIED
import { CacheService } from '../services/CacheService';
import { ITelemetryService } from '../services/TelemetryService';

export interface IServiceContainer {
  pageService: IPageService;
  apiClient: IApiClient;
  readConfirmationService: IReadConfirmationService;
  favoriteService: IFavoriteService;
  flagService: IFlagService;
  approvalService: IApprovalService;
  adminService: IAdminService;
  cache: CacheService;          // NEW
  telemetry: ITelemetryService; // NEW
}
```

### PnPjs Caching Integration
```typescript
// src/shared/context/pnpSetup.ts -- MODIFIED
import { Caching } from "@pnp/queryable";

export const getSP = (context?: WebPartContext): SPFI => {
  if (context !== undefined) {
    _sp = spfi().using(SPFx(context), Caching({
      store: "session",
      expireFunc: () => {
        const expire = new Date();
        expire.setMinutes(expire.getMinutes() + 5);
        return expire;
      }
    }));
  }
  // ...
};
```

### ITelemetryService Interface
```typescript
// src/shared/services/TelemetryService.ts
export interface ITelemetryService {
  trackEvent(name: string, properties?: Record<string, string>): void;
  trackException(error: Error, properties?: Record<string, string>): void;
  trackPageView(name: string): void;
}
```

### AppInsightsTelemetryService (Production)
```typescript
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

export class AppInsightsTelemetryService implements ITelemetryService {
  private appInsights: ApplicationInsights;

  constructor(connectionString: string) {
    const reactPlugin = new ReactPlugin();
    this.appInsights = new ApplicationInsights({
      config: {
        connectionString,
        extensions: [reactPlugin],
        disableFetchTracking: true,
        disableAjaxTracking: true,
        disableExceptionTracking: false,
        autoTrackPageVisitTime: false,
        enableAutoRouteTracking: false,
      }
    });
    this.appInsights.loadAppInsights();
  }

  trackEvent(name: string, properties?: Record<string, string>): void {
    this.appInsights.trackEvent({ name }, properties);
  }

  trackException(error: Error, properties?: Record<string, string>): void {
    this.appInsights.trackException({ exception: error }, properties);
  }

  trackPageView(name: string): void {
    this.appInsights.trackPageView({ name });
  }
}
```

### Error Boundary Class Component
```typescript
// src/shared/components/ErrorBoundary.tsx
import * as React from 'react';
import { ITelemetryService } from '../services/TelemetryService';

interface IErrorBoundaryProps {
  children: React.ReactNode;
  telemetry: ITelemetryService;
  fallback: React.ReactNode;
}

interface IErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
  public state: IErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.telemetry.trackException(error, {
      componentStack: info.componentStack || 'unknown'
    });
  }

  public render(): React.ReactNode {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
```

### Web Part Render Pattern with ErrorBoundary + appInsightsConnectionString
```typescript
// In DashboardWebPart.ts render() -- MODIFIED
public render(): void {
  const child = React.createElement(Dashboard, { /* existing props */ });

  const provider = React.createElement(WissensHubProvider, {
    spContext: this.context,
    aadClient: this._apiClient,
    apiBaseUrl: this.properties.apiBaseUrl || '...',
    appInsightsConnectionString: this.properties.appInsightsConnectionString || '',
    mockRole: this.properties.mockRole as UserRole,
    children: child,
  });

  // ErrorBoundary wraps the entire provider tree
  // Note: telemetry instance created outside provider since ErrorBoundary
  // needs it before WissensHubProvider initializes
  const element = React.createElement(ErrorBoundary, {
    telemetry: this._telemetryService,
    fallback: React.createElement(ErrorFallback, {
      onRetry: () => { this.render(); }
    }),
    children: provider,
  });

  ReactDom.render(element, this.domElement);
}
```

### Cache TTL Constants
```typescript
// src/shared/services/CacheService.ts -- TTL constants
export const CACHE_TTLS = {
  ARTICLES: 5 * 60_000,          // 5 minutes
  UNREAD_COUNT: 60_000,           // 60 seconds
  READ_STATS: 2 * 60_000,        // 2 minutes
  FAVORITES: 5 * 60_000,         // 5 minutes
  PENDING_APPROVALS: 30_000,     // 30 seconds
  DASHBOARD_STATS: 60_000,       // 60 seconds
  CATEGORIES: 5 * 60_000,        // 5 minutes
  TARGET_GROUPS: 5 * 60_000,     // 5 minutes
  ADMIN_REPORTS: 2 * 60_000,     // 2 minutes
  REMINDER_CONFIG: 5 * 60_000,   // 5 minutes
};
```

### Cache Invalidation Mapping
```typescript
// Which caches to invalidate per command:
// markAsRead     -> 'articles:', 'unread:', 'readstats:{pageId}', 'dashstats:'
// toggleFavorite -> 'favorites:', 'dashstats:'
// flagArticle    -> 'flagged:', 'articles:'
// approve        -> 'pending:', 'articles:', 'dashstats:'
// reject         -> 'pending:', 'articles:', 'dashstats:'
// saveCategory   -> 'categories:'
// deleteCategory -> 'categories:'
// saveTargetGrp  -> 'targetgroups:'
// deleteTargetGrp-> 'targetgroups:'
// updateReminder -> 'reminderconfig:'
// submitForReview-> 'articles:', 'pending:'
// archive        -> 'articles:'
// restore        -> 'articles:'
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PnPjs v3 caching (Storage behavior) | PnPjs v4 `Caching` from `@pnp/queryable` | PnPjs v4 (2023) | Import path changed. `Caching` is now from `@pnp/queryable`, not `@pnp/sp`. |
| App Insights Instrumentation Key | Connection String | 2024 | Instrumentation keys deprecated. Must use `connectionString` config property. |
| applicationinsights-react-js v3.x | v17.x (React 17 track) | 2024 | Major version now tracks supported React version. v17.x for React 17, v18.x for React 18, v19.x for React 19. |
| SPFx class components | Functional components + hooks | Convention since React 16.8 | Error Boundary is the sole exception -- React limitation. |

**Deprecated/outdated:**
- Application Insights `instrumentationKey`: Deprecated in favor of `connectionString`. Always use `connectionString`.
- `@microsoft/applicationinsights-react-js@3.x`: Replaced by version-tracked releases (17.x, 18.x, 19.x).

## Open Questions

1. **Application Customizer ErrorBoundary integration**
   - What we know: Web parts use React.createElement to wrap in ErrorBoundary. The Application Customizer renders to a placeholder DOM element.
   - What's unclear: The Application Customizer doesn't go through WissensHubProvider -- it manages its own state. ErrorBoundary wrapping works the same way via React.createElement.
   - Recommendation: Wrap the Application Customizer's React tree with ErrorBoundary the same way, creating a standalone telemetry service instance in onInit.

2. **Shared strings scope vs per-web-part strings**
   - What we know: Decision is shared strings in `src/shared/loc/` + per-web-part strings in `src/webparts/*/loc/`.
   - What's unclear: Exact boundary of which strings go where. Many strings like "Gelesen", "Favoriten", "Kategorie" appear in multiple web parts.
   - Recommendation: Strings used by 2+ web parts go to SharedStrings. Component-specific labels (tab names, dialog titles) stay in per-web-part loc.

3. **Telemetry service initialization order**
   - What we know: ErrorBoundary needs ITelemetryService. WissensHubProvider creates services. ErrorBoundary wraps WissensHubProvider.
   - What's unclear: Telemetry must be available before WissensHubProvider renders.
   - Recommendation: Create telemetry service in web part's onInit() (before render), pass to both ErrorBoundary and WissensHubProvider. Simple conditional: empty connection string -> ConsoleTelemetryService.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | @heft-jest (Jest 27 via SPFx Heft) |
| Config file | Managed by @microsoft/spfx-heft-plugins |
| Quick run command | `cd spfx && npx heft test --clean` |
| Full suite command | `cd spfx && npx heft test --clean` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CACH-01 | PnPjs caching configured on SP instance | unit | `npx heft test --clean` (verify pnpSetup imports Caching) | No -- Wave 0 |
| CACH-02 | CacheService get/set/invalidate/TTL | unit | `npx heft test --clean` | No -- Wave 0 |
| CACH-03 | Query hooks use stale-while-revalidate | unit | `npx heft test --clean` | No -- Wave 0 |
| CACH-04 | Command hooks invalidate related caches | unit | `npx heft test --clean` | No -- Wave 0 |
| TELE-01 | AppInsightsTelemetryService initializes with connection string | unit | `npx heft test --clean` | No -- Wave 0 |
| TELE-02 | Cost-safe config (disableFetchTracking etc.) | unit | `npx heft test --clean` | No -- Wave 0 |
| TELE-03 | Command hooks track 9 custom events | unit | `npx heft test --clean` | No -- Wave 0 |
| TELE-04 | ConsoleTelemetryService logs to console | unit | `npx heft test --clean` | No -- Wave 0 |
| TELE-05 | ErrorBoundary catches errors, calls trackException | unit | `npx heft test --clean` | No -- Wave 0 |
| TELE-06 | Toast shows MessageBar with auto-dismiss | unit | `npx heft test --clean` | No -- Wave 0 |
| UX-01 | Optimistic UI for mark-as-read and favorite | unit | `npx heft test --clean` | Partially -- existing ReadStatusSection.test.tsx |
| UX-02 | Shimmer loading states render correctly | unit | `npx heft test --clean` | Partially -- Dashboard.test.tsx stub |
| UX-03 | Debounced search delays execution | unit | `npx heft test --clean` | Partially -- FilterBar.test.tsx stub |
| UX-04 | Responsive breakpoints applied | manual-only | Visual inspection in workbench | N/A |
| UX-05 | ARIA labels and keyboard navigation | manual-only | Visual inspection + keyboard testing | N/A |
| I18N-01 | German strings load as default | unit | `npx heft test --clean` | No -- Wave 0 |
| I18N-02 | English strings available | unit | `npx heft test --clean` | No -- Wave 0 |
| I18N-03 | All hardcoded strings extracted to loc modules | build | `cd spfx && npx heft test --clean --production` (build passes = strings resolve) | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `cd spfx && npx heft test --clean`
- **Per wave merge:** `cd spfx && npx heft test --clean`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/shared/services/__tests__/CacheService.test.ts` -- covers CACH-02
- [ ] `src/shared/services/__tests__/TelemetryService.test.ts` -- covers TELE-01, TELE-02, TELE-04
- [ ] `src/shared/components/__tests__/ErrorBoundary.test.tsx` -- covers TELE-05
- [ ] `src/shared/components/__tests__/ToastProvider.test.tsx` -- covers TELE-06
- [ ] No new framework install needed -- jest + @testing-library/react already configured

## Sources

### Primary (HIGH confidence)
- PnPjs `@pnp/queryable` v4.18.0 installed in project -- `Caching` behavior verified via `node_modules/@pnp/queryable/behaviors/caching.d.ts`. Interface: `ICachingProps { store?: "local" | "session"; keyFactory?: CacheKeyFactory; expireFunc?: CacheExpireFunc; }`
- `@microsoft/applicationinsights-web@3.3.11` -- verified via `npm view` on 2026-03-17
- `@microsoft/applicationinsights-react-js@17.3.6` -- verified via `npm view`. Peer deps: `react >= 17.0.1`, `history >= 4.10.1`, `tslib *`
- Project spec `wissens-hub-spec.md` lines 882-1320 -- CacheService, ITelemetryService, ErrorBoundary, useToast, custom events table, cost-safe config
- Existing codebase -- ServiceContainer.ts, WissensHubContext.tsx, pnpSetup.ts, query hooks, command hooks, loc/ folder scaffolds

### Secondary (MEDIUM confidence)
- [applicationinsights-react-js GitHub](https://github.com/microsoft/applicationinsights-react-js) -- v17.x track for React 17 compatibility
- `npm view` registry data for version verification

### Tertiary (LOW confidence)
- None -- all findings verified against installed packages and official docs.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages verified via npm view, peer dependencies confirmed, React 17 compatibility confirmed
- Architecture: HIGH -- patterns directly from project spec with adaptations for existing codebase conventions
- Pitfalls: HIGH -- derived from project's accumulated decisions (ES5 target, no-new-null, React 17 class components) and known Application Insights cost issues
- Caching: HIGH -- PnPjs Caching behavior verified in installed node_modules
- Telemetry: HIGH -- versions and peer deps verified, React 17-specific track confirmed
- i18n: HIGH -- SPFx built-in localization pattern already scaffolded in all web parts, just needs de-de.js files and real strings

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable domain -- PnPjs, Application Insights, Fluent UI v8, SPFx 1.22.2 are all mature)
