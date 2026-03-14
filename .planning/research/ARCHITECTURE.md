# Architecture Patterns

**Domain:** SPFx Knowledge Management Solution with Azure Functions Backend
**Researched:** 2026-03-14

## Recommended Architecture

The WissensHub architecture is a two-layer system: SharePoint for content (articles as Modern Pages), Azure SQL for tracking/management data, with Azure Functions as the API bridge between SPFx and Azure SQL. This architecture is locked per the spec.

```
+------------------------------------------------------------------+
|                    SharePoint Online Hub Site                      |
|                                                                    |
|  +--------------+  +-----------+  +-------------+  +----------+  |
|  |  Dashboard   |  |  Article  |  | Freigabe-   |  |  Admin   |  |
|  |  Web Part    |  |  Sidebar  |  | center WP   |  |  Panel   |  |
|  +--------------+  +-----------+  +-------------+  +----------+  |
|                                                                    |
|  +------------------------------------------------------------+  |
|  |        Unread Badge Application Customizer (Header)         |  |
|  +------------------------------------------------------------+  |
|                                                                    |
|  +------------------------------------------------------------+  |
|  |              WissensHubContext (React Context)               |  |
|  |  +------------------+  +------------------+                 |  |
|  |  | ServiceContainer |  | User/Role State  |                 |  |
|  |  +------------------+  +------------------+                 |  |
|  +------------------------------------------------------------+  |
|                                                                    |
|  +---------------------------+  +-----------------------------+  |
|  |   SharePoint Page Service |  |    Azure API Client         |  |
|  |   (PnPjs v4 -> SP REST)  |  |   (AadHttpClient -> API)    |  |
|  +---------------------------+  +-----------------------------+  |
+------------------------------------------------------------------+
          |                                  |
          | PnPjs (SharePoint REST API)      | AadHttpClient (Bearer Token)
          v                                  v
+-------------------+            +---------------------------+
| SharePoint Online |            |    Azure Functions App    |
|  Site Pages Lib   |            |  (.NET 10 Isolated Worker)|
|  Custom Columns   |            |                           |
|  Groups           |            |  Functions -> MediatR     |
+-------------------+            |  Application (CQRS)      |
                                 |  Domain (Entities)        |
                                 |  Infrastructure (EF Core) |
                                 +---------------------------+
                                              |
                                              | EF Core 10
                                              v
                                 +---------------------------+
                                 |     Azure SQL Database    |
                                 |  (Azure SQL Edge locally) |
                                 +---------------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Dashboard Web Part** | Main entry point. Shows article cards, filters, search, stats bar, favorites, unread badges. | SharePoint Page Service (article list), Azure API Client (unread/favorites/stats) |
| **Article Sidebar Web Part** | Placed on individual article pages. Shows metadata, mark-as-read, flag, favorite, TOC. | Azure API Client (read status, flag, favorite) |
| **Freigabecenter Web Part** | Approval workflow for editors/reviewers. Lists pending articles, flagged articles. | Azure API Client (pending approvals, flags, approve/reject actions) |
| **Admin Panel Web Part** | Admin configuration. Categories, target groups, read reports. | Azure API Client (admin config, reports) |
| **Unread Badge App Customizer** | Header notification badge across all hub pages. Flyout with unread summaries. | Azure API Client (unread count, unread summaries) |
| **WissensHubContext** | Composition root. Provides services, user info, role to all components. | Initialized by web part/extension `onInit`, consumed by all child components |
| **ServiceContainer** | DI container via React Context. Holds all service interfaces wired to implementations. | Created per web part/extension instance, consumed by hooks |
| **SharePoint Page Service** | Reads article content from Site Pages library via PnPjs. | SharePoint REST API |
| **Azure API Client** | Wraps AadHttpClient for authenticated calls to Azure Functions. | Azure Functions API endpoints |
| **Azure Functions** | Thin HTTP entry points. Deserializes requests, extracts user identity from token, dispatches to MediatR. | MediatR handlers |
| **Application Layer (MediatR)** | Business logic. Commands (write) and Queries (read) with pipeline behaviors. | Domain entities, Repository interfaces |
| **Domain Layer** | Pure C# entities with factory methods. Zero dependencies. | Nothing (innermost layer) |
| **Infrastructure Layer** | EF Core DbContext, repositories implementing Application interfaces. | Azure SQL Database |

### Data Flow

#### Read Flow: Dashboard loads articles with unread status

```
1. Dashboard mounts
2. WissensHubContext initializes (user, role, services)
3. useArticlesQuery hook fires:
   a. SharePointPageService.getPublishedArticles() -> PnPjs -> SP REST API
      Returns: page list (title, category, status, author, URL)
   b. AzureApiClient.get("/api/dashboard/stats") -> AadHttpClient -> Azure Functions
      -> MediatR GetDashboardStatsQuery -> ReadConfirmationRepository
      Returns: unread count, favorites count, pending reviews count
   c. AzureApiClient.get("/api/articles/unread") -> Azure Functions
      Returns: list of unread page IDs for current user
4. Hook merges SP page data with API tracking data
5. Component renders cards with unread badges
```

#### Write Flow: Mark article as read (optimistic UI)

```
1. User clicks "Mark as Read" on Article Sidebar
2. useMarkAsReadCommand.execute(pageId):
   a. UI updates immediately (optimistic): badge removed, "Read on [date]" shown
   b. AzureApiClient.post("/api/articles/{pageId}/read") -> AadHttpClient -> Azure Functions
      -> MediatR MarkAsReadCommand -> ReadConfirmationRepository -> Azure SQL INSERT
   c. On success: invalidate caches (articles, unread, readstats)
   d. On failure: revert optimistic update, show error toast
3. Unread Badge App Customizer receives cache invalidation -> re-fetches count
```

#### Authentication Flow: SPFx to Azure Functions

```
1. SPFx web part onInit():
   a. this.context.aadHttpClientFactory.getClient("https://<functions-app>.azurewebsites.net")
   b. Returns AadHttpClient instance pre-configured with bearer token
   c. Token obtained via SharePoint Online Client Extensibility service principal
   d. OAuth implicit flow handled by SPFx framework (no MSAL needed)

2. AadHttpClient.get/post():
   a. Automatically attaches Bearer token to Authorization header
   b. Token contains user claims (oid, upn, name)

3. Azure Functions receives request:
   a. App Service Authentication validates JWT token
   b. Function extracts user identity from request claims
   c. User ID (oid) used to query per-user data in Azure SQL

Pre-requisites (configured once):
   - Entra ID App Registration for Azure Functions API
   - package-solution.json: webApiPermissionRequests for the API
   - SharePoint admin approves API permissions
   - Azure Functions CORS: allow SharePoint tenant domain
```

## Patterns to Follow

### Pattern 1: AadHttpClient Wrapper (API Client)

The SPFx `AadHttpClient` is the only supported way to call Entra ID-secured APIs from SPFx. Do NOT use MSAL directly -- it is explicitly not supported in SPFx v1.4.1+. Wrap `AadHttpClient` in a service class to centralize error handling and provide a typed interface.

**Confidence:** HIGH -- verified in Microsoft official docs (use-aadhttpclient, updated 2025-10-22)

**What:** Wrap the SPFx-provided `AadHttpClient` in a typed API client service.
**When:** Always, for all Azure Functions API calls.
**Why:** The AadHttpClient handles OAuth token acquisition automatically via the SharePoint Online Client Extensibility service principal. No custom token logic needed.

```typescript
// src/shared/interfaces/IApiClient.ts
export interface IApiClient {
  get<T>(url: string): Promise<Result<T>>;
  post<T>(url: string, body?: unknown): Promise<Result<T>>;
  put<T>(url: string, body?: unknown): Promise<Result<T>>;
  delete(url: string): Promise<Result<void>>;
}

// src/shared/services/AzureApiClient.ts
import { AadHttpClient, HttpClientResponse } from '@microsoft/sp-http';

export class AzureApiClient implements IApiClient {
  constructor(
    private readonly client: AadHttpClient,
    private readonly baseUrl: string
  ) {}

  async get<T>(endpoint: string): Promise<Result<T>> {
    try {
      const response: HttpClientResponse = await this.client.get(
        `${this.baseUrl}${endpoint}`,
        AadHttpClient.configurations.v1
      );
      if (!response.ok) {
        return { success: false, error: this.mapError(response) };
      }
      const data = await response.json() as T;
      return { success: true, data };
    } catch (e) {
      return { success: false, error: { code: 'NETWORK_ERROR', message: (e as Error).message } };
    }
  }

  // post, put, delete follow same pattern...
}
```

### Pattern 2: PnPjs Initialization with SPFx Context

PnPjs v4 requires SPFx context for authentication. The `spfi().using(SPFx(context))` pattern must be called from the web part/extension `onInit()` method -- never from a constructor or component.

**Confidence:** HIGH -- verified in official Microsoft docs (use-sp-pnp-js-with-spfx-web-parts, updated 2026-01-02)

**What:** Initialize PnPjs once per web part/extension in `onInit()`, store the configured instance.
**When:** Every web part and the Application Customizer.

```typescript
// src/shared/config/pnpjsConfig.ts
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFI, SPFx } from "@pnp/sp";
import { Caching } from "@pnp/queryable";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-groups/web";

let _sp: SPFI | null = null;

export const getSP = (context?: WebPartContext): SPFI => {
  if (context != null) {
    _sp = spfi().using(SPFx(context)).using(
      Caching({ store: "session" })
    );
  }
  return _sp!;
};
```

**Critical detail for multi-web-part solutions:** Each web part instance calls `getSP(this.context)` in its `onInit()`. The module-level `_sp` variable means the last initializer wins, which is fine because all web parts on the same page share the same SPFx context. However, the Application Customizer has a different context type (`ApplicationCustomizerContext`), so it needs its own initialization path.

### Pattern 3: Web Part onInit as Composition Root

The web part class (`extends BaseClientSideWebPart`) is the bridge between SPFx platform and React. It must handle all platform-specific initialization in `onInit()`, then pass clean dependencies to React via props or Context.

**Confidence:** HIGH -- verified in official docs (build-a-hello-world-web-part, updated 2026-01-02)

**What:** Create all services and the context provider in the web part's `onInit()`, pass them as props to the root React component.
**When:** Every web part.

```typescript
export default class WissensHubDashboardWebPart extends BaseClientSideWebPart<IWissensHubDashboardProps> {
  private apiClient: AzureApiClient;
  private sp: SPFI;

  protected async onInit(): Promise<void> {
    await super.onInit();

    // 1. Initialize PnPjs with SPFx context
    this.sp = getSP(this.context);

    // 2. Create AadHttpClient for Azure Functions
    const aadClient = await this.context.aadHttpClientFactory
      .getClient(this.properties.apiAppId);

    this.apiClient = new AzureApiClient(aadClient, this.properties.apiBaseUrl);
  }

  public render(): void {
    const element = React.createElement(WissensHubProvider, {
      sp: this.sp,
      apiClient: this.apiClient,
      spContext: this.context,
      children: React.createElement(WissensHubDashboard)
    });

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
}
```

### Pattern 4: Shared Context Across Components (Not Across Web Parts)

React Context in SPFx is scoped to a single web part's React tree. Multiple web parts on the same page do NOT share React Context -- each has its own React root. Cross-web-part communication requires alternative approaches.

**Confidence:** HIGH -- fundamental SPFx architecture constraint

**What:** Each web part creates its own `WissensHubProvider` wrapping its React tree. Shared state between web parts on the same page is limited to:
- SPFx Dynamic Data (built-in event system)
- Custom browser events
- Shared module-level singletons (like the CacheService)

**When:** When the Dashboard and Article Sidebar need to coordinate (e.g., marking as read on the sidebar should update the dashboard's unread count).

```typescript
// Option 1: Shared CacheService singleton (simplest for this project)
// The CacheService is a module-level singleton. When Article Sidebar
// invalidates the cache, the Dashboard's next query fetches fresh data.
// This works because both web parts import the same module.

// Option 2: Custom DOM events for real-time cross-web-part sync
window.dispatchEvent(new CustomEvent('wissenshub:article-read', {
  detail: { pageId: 123 }
}));

// Dashboard listens:
useEffect(() => {
  const handler = (e: CustomEvent) => {
    // refetch unread count
    refetchUnreadCount();
  };
  window.addEventListener('wissenshub:article-read', handler);
  return () => window.removeEventListener('wissenshub:article-read', handler);
}, []);
```

### Pattern 5: Application Customizer Lifecycle

Application Customizers extend `BaseApplicationCustomizer` (not `BaseClientSideWebPart`). They run on every page of the site/hub and render into page placeholders (Top, Bottom). They have their own context type and their own initialization lifecycle.

**Confidence:** HIGH -- verified in official docs (build-a-hello-world-extension, updated 2026-01-15)

**What:** The Unread Badge renders into the `Top` placeholder. It initializes its own AadHttpClient and PnPjs in `onInit()`, then renders a React component into the placeholder DOM element.
**When:** The Application Customizer.

```typescript
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';

export default class UnreadBadgeApplicationCustomizer
  extends BaseApplicationCustomizer<IUnreadBadgeProperties> {

  private topPlaceholder: PlaceholderContent | undefined;

  public async onInit(): Promise<void> {
    await super.onInit();

    // Context is ApplicationCustomizerContext, not WebPartContext
    // But aadHttpClientFactory is available on both
    const aadClient = await this.context.aadHttpClientFactory
      .getClient(this.properties.apiAppId);

    this.context.placeholderProvider.changedEvent.add(
      this, this.renderPlaceholders
    );
  }

  private renderPlaceholders(): void {
    if (!this.topPlaceholder) {
      this.topPlaceholder = this.context.placeholderProvider
        .tryCreateContent(PlaceholderName.Top);

      if (this.topPlaceholder) {
        ReactDom.render(
          React.createElement(UnreadBadgeHeader, {
            apiClient: this.apiClient,
            context: this.context
          }),
          this.topPlaceholder.domElement
        );
      }
    }
  }
}
```

### Pattern 6: Azure Functions Isolated Worker with Clean Architecture

The Azure Functions Isolated Worker model (.NET 10) runs functions in a separate process from the host. This enables full control over the DI container and middleware pipeline. The `FunctionsApplication.CreateBuilder(args)` pattern is the modern entry point.

**Confidence:** HIGH -- verified in official Azure docs (dotnet-isolated-process-guide, updated 2026-03-05)

**What:** Functions are thin HTTP entry points. They deserialize requests, extract user claims from the JWT token, dispatch to MediatR, and return results. All business logic lives in MediatR handlers.
**When:** All Azure Functions endpoints.

```csharp
// Program.cs - Composition Root
var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

// Middleware for extracting user identity from JWT claims
builder.UseMiddleware<UserContextMiddleware>();

// Application Insights
builder.Services
    .AddApplicationInsightsTelemetryWorkerService()
    .ConfigureFunctionsApplicationInsights();

// MediatR + pipeline behaviors
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
});

// EF Core
builder.Services.AddDbContext<WissensHubDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("WissensHubDb")));

// Repositories
builder.Services.AddScoped<IReadConfirmationRepository, ReadConfirmationRepository>();
// ... other repositories

builder.Build().Run();
```

### Pattern 7: webApiPermissionRequests in package-solution.json

The SPFx solution must declare which Entra ID-secured APIs it needs access to. This triggers a permission approval flow in the SharePoint admin center.

**Confidence:** HIGH -- verified in official docs (use-aadhttpclient, use-aadhttpclient-enterpriseapi)

**What:** Declare the Azure Functions API app registration as a `webApiPermissionRequest` in the SPFx package configuration.
**When:** During SPFx project setup, before first deployment.

```json
// config/package-solution.json
{
  "solution": {
    "name": "wissens-hub-client-side-solution",
    "webApiPermissionRequests": [
      {
        "resource": "WissensHub-API",
        "scope": "user_impersonation"
      }
    ]
  }
}
```

**Critical note:** Permissions are granted tenant-wide, not per-solution. Once a SharePoint admin approves `user_impersonation` for the WissensHub-API, any SPFx solution on that tenant can use it. This is by design in the SharePoint Framework.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Using MSAL Directly in SPFx

**What:** Importing and configuring MSAL (Microsoft Authentication Library) directly in SPFx web parts or extensions.
**Why bad:** Explicitly not supported by Microsoft since SPFx v1.4.1. The SPFx framework provides `AadHttpClient` and `MSGraphClient` which handle token acquisition through the `SharePoint Online Client Extensibility` service principal. Using MSAL bypasses this and will fail in production.
**Instead:** Use `this.context.aadHttpClientFactory.getClient()` for custom APIs and `this.context.msGraphClientFactory.getClient()` for Microsoft Graph.

### Anti-Pattern 2: Data Fetching in React Components

**What:** Calling PnPjs or the API client directly in component `useEffect` hooks or render methods.
**Why bad:** Violates Clean Architecture. Components become untestable, logic is scattered, and error handling is inconsistent.
**Instead:** All data fetching lives in custom hooks (`useArticlesQuery`, `useMarkAsReadCommand`). Components receive data as props or from hooks and only handle rendering.

### Anti-Pattern 3: Sharing React Context Across Web Parts

**What:** Expecting `WissensHubContext` to be shared between the Dashboard web part and the Article Sidebar web part on the same page.
**Why bad:** Each web part has its own React root (`ReactDom.render`). React Context does not cross these boundaries. Attempting to share leads to stale state and race conditions.
**Instead:** Use module-level singletons (CacheService) for shared caching, or DOM CustomEvents for cross-web-part coordination.

### Anti-Pattern 4: Storing Secrets in SPFx Web Part Properties

**What:** Putting the Azure Functions API key, connection strings, or client secrets in web part property pane configuration.
**Why bad:** Web part properties are visible in the page source and stored in the SharePoint content database unencrypted.
**Instead:** Use Entra ID authentication (AadHttpClient) which requires no secrets on the client side. API base URL can be in web part properties (not a secret). Connection strings and API keys belong in Azure Key Vault, accessed by Azure Functions.

### Anti-Pattern 5: Application Insights Auto-Tracking in SPFx

**What:** Leaving `disableFetchTracking: false` and `disableAjaxTracking: false` in Application Insights configuration within SPFx.
**Why bad:** SharePoint makes hundreds of background HTTP calls (Graph, search, telemetry, etc.). Auto-tracking logs every single one to Application Insights, causing massive cost explosion (documented cases of thousands of dollars/month in unexpected charges).
**Instead:** Disable all auto-tracking. Only log custom events and exceptions manually via the `ITelemetryService` interface.

### Anti-Pattern 6: Initializing Services in the Constructor

**What:** Creating PnPjs instances, AadHttpClient, or other context-dependent objects in the web part constructor or React component constructor.
**Why bad:** `this.context` and `this.properties` are undefined in the web part constructor. The SPFx lifecycle guarantees they are available only in `onInit()` and later.
**Instead:** All service initialization happens in `onInit()` (for web parts) or `onInit()` (for application customizers).

## SPFx-Specific Lifecycle Considerations

### Web Part Lifecycle

```
1. constructor()         -- DO NOT use. this.context is undefined.
2. onInit()              -- Initialize services, PnPjs, AadHttpClient.
                            Returns Promise -- async work is supported.
3. render()              -- Create React element, call ReactDom.render().
                            Called on initial load AND when properties change.
4. onPropertyPaneFieldChanged() -- Handle property pane changes.
5. onDispose()           -- Cleanup. Call ReactDom.unmountComponentAtNode().
```

**Key insight:** `render()` is called every time web part properties change (reactive property pane). If service instances are created in `render()`, they will be recreated unnecessarily. Initialize in `onInit()`, use in `render()`.

### Application Customizer Lifecycle

```
1. constructor()         -- DO NOT use.
2. onInit()              -- Initialize services. Subscribe to placeholderProvider.changedEvent.
3. Placeholder available -- Render React component into placeholder DOM element.
4. onDispose()           -- Cleanup subscriptions and React trees.
```

**Key difference from web parts:** Application Customizers do not have a `render()` method. They render via `PlaceholderContent` objects obtained from `this.context.placeholderProvider.tryCreateContent()`. The placeholder may not be available immediately -- use the `changedEvent` to know when it is ready.

### Context Propagation Path

```
SPFx Platform
  -> BaseClientSideWebPart.context (WebPartContext)
     -> aadHttpClientFactory  (creates AadHttpClient for any Entra ID app)
     -> pageContext           (site URL, page details, user info)
     -> msGraphClientFactory  (creates MSGraphClient)
     -> serviceScope          (SPFx-native DI, but limited -- prefer React Context)

  -> Web Part onInit()
     -> Creates: SPFI (PnPjs), AadHttpClient, all service instances
     -> Wires into: IServiceContainer

  -> Web Part render()
     -> Creates: WissensHubProvider (React Context Provider)
        -> Provides: IServiceContainer, ICurrentUser, UserRole
        -> Children: Feature component tree

  -> React Component Tree
     -> useWissensHub() hook  -> accesses services, user, role
     -> useArticlesQuery()   -> calls services.pageService
     -> useMarkAsReadCommand() -> calls services.readConfirmationService
```

## Build Order (Dependencies Between Components)

Based on the architecture, components should be built in this order to minimize blocking dependencies:

### Phase 1: Foundation (no dependencies on each other)

Build these in parallel:

1. **Project scaffolding** -- SPFx solution with Heft toolchain, Azure Functions project
2. **Domain models** -- TypeScript interfaces (IArticlePage, IReadConfirmation, etc.) and C# entities
3. **Database schema** -- Docker Compose with Azure SQL Edge, EF Core DbContext, initial migration
4. **Shared infrastructure** -- Result<T> type (both TS and C#), AsyncState types, AppError types

### Phase 2: Service Layer (depends on Phase 1)

5. **Interfaces** -- IPageService, IApiClient, IReadConfirmationService, etc.
6. **Mock implementations** -- MockPageService, MockApiClient for local development without API
7. **Azure Functions skeleton** -- Program.cs composition root, MediatR setup, one sample endpoint
8. **PnPjs PageService** -- SharePoint page queries with caching

### Phase 3: Core Features (depends on Phase 2)

9. **WissensHubContext** -- React Context provider, service container, role detection
10. **AzureApiClient** -- AadHttpClient wrapper with Result<T> error handling
11. **Azure Functions CRUD** -- All MediatR commands/queries with repository implementations
12. **Custom hooks** -- queries (useArticlesQuery, useUnreadCountQuery) and commands (useMarkAsReadCommand, etc.)

### Phase 4: Web Parts (depends on Phase 3)

13. **Dashboard Web Part** -- Article list, filters, search, stats bar
14. **Article Sidebar Web Part** -- Metadata, mark-as-read, flag, favorite, TOC
15. **Freigabecenter Web Part** -- Approval workflow UI
16. **Unread Badge Application Customizer** -- Header badge, flyout

### Phase 5: Admin and Polish (depends on Phase 4)

17. **Admin Panel Web Part** -- Categories/target groups config, reports
18. **Error handling** -- Error boundaries, toast notifications, retry logic
19. **Caching layers** -- PnPjs session cache, in-memory API cache, stale-while-revalidate
20. **Optimistic UI** -- Mark-as-read and favorite toggle

### Phase 6: DevOps and Testing (can start in parallel from Phase 2)

21. **Provisioning script** -- PnP PowerShell for site, groups, columns, pages
22. **Azure Bicep** -- Infrastructure as code
23. **CI/CD** -- GitHub Actions pipelines
24. **Tests** -- Jest unit tests, .NET integration tests, Playwright E2E

### Dependency Graph

```
Phase 1: Scaffolding + Models + DB + Shared Types
    |
Phase 2: Interfaces + Mocks + API Skeleton + PnPjs Service
    |
Phase 3: Context + API Client + API CRUD + Hooks
    |
Phase 4: Dashboard + Sidebar + Freigabecenter + Badge
    |
Phase 5: Admin + Error Handling + Caching + Optimistic UI
    |
Phase 6: Provisioning + Bicep + CI/CD + Tests
```

**Key dependency insight:** The Azure Functions API and the SPFx frontend can be developed in parallel after Phase 2. The mock services allow frontend development without a running API. The API can be tested independently with HTTP tools. They converge in Phase 3 when the real AzureApiClient replaces mocks.

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **SP list threshold** | No issue | Custom columns on Site Pages approach limits | Azure SQL handles tracking; SP only stores articles (well under 5000) |
| **Azure Functions cold start** | Noticeable (1-3s) on Consumption plan | Use Premium plan for warm instances | Premium plan with auto-scaling |
| **Azure SQL** | Basic tier sufficient | Standard tier with proper indexing | Standard/Premium tier, read replicas |
| **Unread count query** | Simple query | Index on (UserId, PageId) essential | Materialized view or pre-computed counts |
| **Application Insights cost** | Minimal with manual tracking | Monitor ingestion volume | Sampling may be needed |
| **PnPjs caching** | Session storage sufficient | Session storage per user is fine | CDN for static assets, session cache still per-user |

## CORS Configuration

Azure Functions must allow the SharePoint tenant domain for cross-origin requests. In the Azure portal, or via Bicep:

```bicep
resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  // ...
  properties: {
    siteConfig: {
      cors: {
        allowedOrigins: [
          'https://${tenantName}.sharepoint.com'
        ]
      }
    }
  }
}
```

## Entra ID App Registration Requirements

The Azure Functions API requires an Entra ID (Azure AD) App Registration:

1. **App Registration** -- Create in Azure AD for the WissensHub API
2. **Application ID URI** -- Set to `api://<app-id>` or custom URI
3. **Expose an API** -- Add `user_impersonation` scope
4. **App Service Authentication** -- Enable on the Function App, configure Azure AD provider
5. **SPFx package-solution.json** -- Add `webApiPermissionRequests` referencing the app name
6. **Admin approval** -- SharePoint admin must approve the permission request after .sppkg deployment

## Sources

- [Connect to Entra ID-secured APIs (AadHttpClient)](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient) -- HIGH confidence, updated 2025-10-22
- [Consume Enterprise APIs with AadHttpClient](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient-enterpriseapi) -- HIGH confidence, updated 2026-03-05
- [Consume Microsoft Graph / AadHttpClient Tutorial](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aad-tutorial) -- HIGH confidence, updated 2026-01-14
- [Use PnPjs with SPFx Web Parts](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/use-sp-pnp-js-with-spfx-web-parts) -- HIGH confidence, updated 2026-01-02
- [Build First SPFx Web Part](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/build-a-hello-world-web-part) -- HIGH confidence, updated 2026-01-02
- [Build First SPFx Extension (Application Customizer)](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/build-a-hello-world-extension) -- HIGH confidence, updated 2026-01-15
- [Azure Functions .NET Isolated Worker Guide](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide) -- HIGH confidence, updated 2026-03-05
- WissensHub spec (wissens-hub-spec.md) -- Source of truth for all architectural decisions
