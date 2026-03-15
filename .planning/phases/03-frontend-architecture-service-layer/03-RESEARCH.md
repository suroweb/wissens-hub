# Phase 3: Frontend Architecture & Service Layer - Research

**Researched:** 2026-03-16
**Domain:** SPFx React architecture, dependency inversion, service layer, role-based access
**Confidence:** HIGH

## Summary

Phase 3 builds the shared frontend architecture that all WissensHub web parts will consume. The scope covers: WissensHubContext (React Context composition root), service interfaces with dependency inversion, mock implementations for workbench development, production service stubs, the Result<T> pattern, domain models and DTOs with mappers, CQRS-lite hooks (QueryState, CommandState), role detection from SharePoint groups, and the RoleGate component. No feature UI beyond architecture primitives.

The existing codebase has 4 web parts (Dashboard, ArticleSidebar, Freigabecenter, AdminPanel) as functional React components and 1 Application Customizer, all scaffolded with placeholder content. An empty `spfx/src/common/` skeleton exists (to be renamed to `shared/`). DashboardWebPart.ts already creates AadHttpClient in `onInit()` -- this is the pattern to replicate. PnPjs v4 is NOT yet installed (not in package.json dependencies); it must be added. The project uses SPFx 1.22.2 with Heft toolchain, React 17, TypeScript 5.8, and Fluent UI v8.

**Primary recommendation:** Build in three waves -- (1) Context, role detection, RoleGate; (2) Service interfaces, domain models, DTOs, mappers; (3) Mock implementations and CQRS-lite hooks. Each wave depends on the prior one and produces immediately testable artifacts.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Rename `spfx/src/common/` to `spfx/src/shared/` to match the spec exactly
- Subfolder layout per spec: `interfaces/`, `services/` (+ `__mocks__/`), `models/` (`domain/`, `dto/`), `mappers/`, `hooks/` (`queries/`, `commands/`), `context/`, `utils/`, `components/`
- Barrel exports (index.ts) in each folder for clean imports
- Phase 3 creates only architecture primitive components (RoleGate) -- feature-specific shared components deferred to Phase 5+
- `utils/` folder created but left empty -- permission helpers and formatting utilities deferred to feature phases
- Mock data uses German sample content matching Phase 2 provisioning (IT-Sicherheit, Datenschutz, Onboarding, Arbeitsprozesse, Compliance)
- Mock data volume: 8-10 articles covering all statuses (3-4 Published, 2 Draft, 1 InReview, 1 Archived, 1 flagged), 5 categories, 4 target groups
- Mock vs production toggle: automatic environment detection -- WissensHubContext checks if AadHttpClient is available. Available = production services. Not available (workbench) = mock services. Zero-config for developer.
- Mock services simulate network latency (~300ms configurable delay) to test loading states
- IPageService: build real SharePointPageService now (PnPjs only, no API dependency)
- API-dependent services: build interface + mock + real implementation (real implementations delegate to IApiClient)
- IApiClient: build real AzureApiClient wrapping AadHttpClient with Result<T> error handling. MockApiClient for workbench.
- ArticleCategory modeled as dynamic `string` (not hardcoded union type) -- categories are admin-configurable
- ArticleStatus remains union type (`'Draft' | 'InReview' | 'Published' | 'Archived'`) -- fixed workflow states
- Default to Reader when user is not in any WissensHub group
- Fall back to Reader on role detection failure (network error) -- log error, don't block
- Role detection happens once on WissensHubContext initialization, cached in context state
- Mock role configurable via web part property pane dropdown (Reader/Editor/Reviewer/Admin) -- only visible when using mock services

### Claude's Discretion
- Exact mock data factory implementation details
- Internal structure of the service container initialization
- Error message wording for role detection failures
- Exact delay implementation for mock latency simulation
- Whether to use a single mock data module or per-service mock data files

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ARCH-01 | WissensHubContext providing current user info, role, and service container to all web parts | Context composition root pattern (Pattern 2), PnPjs user/groups API, environment detection for mock/prod toggle |
| ARCH-02 | Service container with dependency-inverted interfaces (IPageService, IApiClient, IReadConfirmationService, IFavoriteService, IFlagService, IApprovalService) | IServiceContainer interface pattern from spec, barrel exports pattern |
| ARCH-03 | Production service implementations (SharePointPageService, AzureApiClient, ReadConfirmationService, FavoriteService, FlagService, ApprovalService) | PnPjs v4 SP REST API for PageService, AadHttpClient wrapper for ApiClient, Result<T> pattern for all returns |
| ARCH-04 | Mock service implementations for testing and local dev | Mock factory pattern, configurable latency, German sample data aligned with Phase 2 provisioning |
| ARCH-05 | Result<T> pattern for all service calls -- no thrown exceptions for expected failures | Discriminated union type (success/failure), AppError type with error codes |
| ARCH-06 | Domain models separate from DTOs with mapper layer (dto -> domain transformers) | SharePoint FieldValuesAsText DTO shapes, WH_-prefixed column internal names, proper type coercion in mappers |
| ARCH-07 | CQRS-lite hooks -- separate query hooks from command hooks | useArticlesQuery/useUnreadCountQuery for reads, useMarkAsReadCommand/useToggleFavoriteCommand for writes |
| ARCH-08 | QueryState<T> and CommandState types for consistent async state handling | Discriminated union types with idle/loading/success/error states |
| ARCH-09 | RoleGate wrapper component for role-based UI visibility | Simple component checking role from context, renders children or null |
| ARCH-10 | Role detection via sp.web.currentUser.groups() -- highest applicable role stored in context | PnPjs v4 currentUser.groups() API, role hierarchy resolution logic |
| ROLE-01 | Reader: browse dashboard, read articles, mark as read, flag outdated, manage favorites | Default role -- context provides Reader when no group match. Service interfaces enable all reader operations. |
| ROLE-02 | Editor: everything Reader can + create/edit pages, set metadata, assign target groups, submit for review | Role hierarchy makes Editor > Reader. RoleGate gates editor-only UI sections. |
| ROLE-03 | Reviewer: everything Reader can + approve/reject articles, view read confirmation reports | RoleGate with minimumRole="reviewer" pattern. Reviewer-only service methods in interfaces. |
| ROLE-04 | Admin: everything above + access admin panel, configure categories/target groups/reminders, export reports | Admin is highest role. RoleGate with minimumRole="admin" pattern. |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @pnp/sp | 4.x (latest) | SharePoint REST API wrapper | Type-safe, fluent API, built-in caching, SPFx integration via `spfi().using(SPFx(context))` |
| @pnp/queryable | 4.x (latest) | PnPjs query pipeline | Peer dependency of @pnp/sp, provides Caching behavior |
| @pnp/logging | 4.x (latest) | PnPjs logging | Lightweight logging for PnPjs operations |
| @microsoft/sp-http | 1.22.2 | AadHttpClient | SPFx-native authenticated HTTP client for Entra ID-secured APIs |
| @fluentui/react | 8.x | UI components | SPFx-native Fluent UI, only v8 is compatible with React 17 |
| react | 17.0.1 | UI framework | Locked by SPFx 1.22.2 |

### Supporting (already in project)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @microsoft/sp-webpart-base | 1.22.2 | BaseClientSideWebPart | Web part class inheritance |
| @microsoft/sp-property-pane | 1.22.2 | Property pane controls | PropertyPaneDropdown for mock role selector |
| @microsoft/sp-core-library | 1.22.2 | Core SPFx utilities | Version, Environment types |
| @microsoft/sp-component-base | 1.22.2 | Theme support | IReadonlyTheme for dark mode |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom hooks | React Query/TanStack Query | Adds bundle size, SPFx web parts have independent lifecycles that complicate shared query caches. Custom hooks are lighter. |
| React Context | Zustand/MobX | Overkill for per-web-part scope. No cross-tab state needed. Context + hooks is sufficient. |
| Manual fetch | Axios | SPFx already provides AadHttpClient with automatic token management. Axios adds nothing. |

**Installation (new dependencies only):**
```bash
cd spfx
npm install @pnp/sp @pnp/queryable @pnp/logging --save-exact
```

## Architecture Patterns

### Recommended Project Structure
```
spfx/src/shared/
├── interfaces/                  (contracts -- the "ports")
│   ├── IPageService.ts
│   ├── IApiClient.ts
│   ├── IReadConfirmationService.ts
│   ├── IFavoriteService.ts
│   ├── IFlagService.ts
│   ├── IApprovalService.ts
│   └── index.ts                 (barrel export)
├── services/                    (implementations -- the "adapters")
│   ├── SharePointPageService.ts
│   ├── AzureApiClient.ts
│   ├── ReadConfirmationService.ts
│   ├── FavoriteService.ts
│   ├── FlagService.ts
│   ├── ApprovalService.ts
│   ├── __mocks__/
│   │   ├── MockPageService.ts
│   │   ├── MockApiClient.ts
│   │   ├── MockReadConfirmationService.ts
│   │   ├── MockFavoriteService.ts
│   │   ├── MockFlagService.ts
│   │   ├── MockApprovalService.ts
│   │   ├── mockData.ts          (shared German sample data)
│   │   └── index.ts
│   └── index.ts
├── models/
│   ├── domain/                  (clean domain types)
│   │   ├── IArticlePage.ts
│   │   ├── IReadConfirmation.ts
│   │   ├── IFlag.ts
│   │   ├── IFavorite.ts
│   │   ├── IApprovalAction.ts
│   │   ├── IUser.ts
│   │   ├── types.ts             (ArticleStatus, UserRole unions)
│   │   └── index.ts
│   ├── dto/                     (API/SP response shapes)
│   │   ├── ArticlePageDto.ts
│   │   ├── ReadConfirmationDto.ts
│   │   ├── FavoriteDto.ts
│   │   ├── FlagDto.ts
│   │   ├── ApprovalDto.ts
│   │   ├── DashboardStatsDto.ts
│   │   └── index.ts
│   ├── Result.ts                (Result<T> type + AppError)
│   ├── AsyncState.ts            (QueryState<T>, CommandState)
│   └── index.ts
├── mappers/
│   ├── articleMapper.ts
│   ├── readConfirmationMapper.ts
│   ├── favoriteMapper.ts
│   ├── flagMapper.ts
│   ├── approvalMapper.ts
│   └── index.ts
├── hooks/
│   ├── queries/                 (read operations)
│   │   ├── useArticlesQuery.ts
│   │   ├── useUnreadCountQuery.ts
│   │   ├── useReadStatsQuery.ts
│   │   ├── useFavoritesQuery.ts
│   │   ├── usePendingApprovalsQuery.ts
│   │   └── index.ts
│   ├── commands/                (write operations)
│   │   ├── useMarkAsReadCommand.ts
│   │   ├── useFlagArticleCommand.ts
│   │   ├── useToggleFavoriteCommand.ts
│   │   ├── useApproveArticleCommand.ts
│   │   ├── useRejectArticleCommand.ts
│   │   └── index.ts
│   └── index.ts
├── context/
│   ├── WissensHubContext.tsx     (composition root + provider)
│   ├── ServiceContainer.ts      (IServiceContainer interface + factory)
│   └── index.ts
├── utils/                       (empty -- deferred to feature phases)
│   └── .gitkeep
└── components/
    ├── RoleGate.tsx
    └── index.ts
```

### Pattern 1: WissensHubContext as Composition Root

**What:** A React Context that provides the service container, current user info, and resolved role to all child components within a web part's React tree.
**When to use:** Every web part wraps its root component in `<WissensHubProvider>`.
**Key details:**
- Each web part creates its own WissensHubProvider (React Context does NOT cross web part boundaries)
- Provider initialization detects environment (AadHttpClient available = production, otherwise = mock)
- Role detection happens once during provider initialization, result is cached in state
- Services are instantiated once and stored in context

```typescript
// Source: wissens-hub-spec.md "Service Container via React Context"
interface IWissensHubContext {
  services: IServiceContainer;
  currentUser: ICurrentUser;
  role: UserRole;
  isLoading: boolean;
}

// Provider props -- passed from WebPart.ts onInit()
interface IWissensHubProviderProps {
  spContext: WebPartContext;
  aadClient?: AadHttpClient;    // undefined in workbench
  apiBaseUrl?: string;
  mockRole?: UserRole;          // from property pane, only in mock mode
  children: React.ReactNode;
}
```

### Pattern 2: Environment Detection for Mock/Production Toggle

**What:** WissensHubProvider automatically selects mock or production services based on AadHttpClient availability.
**When to use:** During context initialization.
**Detection logic:**

```typescript
// Source: CONTEXT.md locked decision
// AadHttpClient is obtained in WebPart.ts onInit() via try/catch.
// If it succeeds, pass it to WissensHubProvider. If it fails (workbench), pass undefined.
// WissensHubProvider checks: aadClient !== undefined ? production : mock

// In WebPart.ts:
try {
  this._apiClient = await this.context.aadHttpClientFactory.getClient('api://{client-id}');
} catch (error) {
  console.warn('AadHttpClient not available (expected in workbench):', error);
  // this._apiClient remains undefined
}
```

**Critical note:** `isServedFromLocalhost` (already used in existing web parts) is NOT a reliable proxy for mock mode. The hosted workbench runs on SharePoint Online but may still lack AadHttpClient permissions. Use AadHttpClient availability directly.

### Pattern 3: Role Detection from SharePoint Groups

**What:** Query current user's group memberships via PnPjs, map group names to roles, return highest applicable role.
**When to use:** Once during WissensHubContext initialization.

```typescript
// Source: PnPjs v4 official docs (pnp.github.io/pnpjs/sp/site-users/)
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups/web";

const groups = await sp.web.currentUser.groups();
// groups is ISiteGroupInfo[] with Title, Id, etc.

// Role resolution (highest wins):
const roleMap: Record<string, UserRole> = {
  'WissensHub Owners': 'admin',
  'WissensHub Reviewers': 'reviewer',
  'WissensHub Editors': 'editor',
  'WissensHub Members': 'reader',
};

const ROLE_HIERARCHY: UserRole[] = ['reader', 'editor', 'reviewer', 'admin'];

function resolveRole(groupTitles: string[]): UserRole {
  let highest: UserRole = 'reader'; // default
  for (const title of groupTitles) {
    const role = roleMap[title];
    if (role && ROLE_HIERARCHY.indexOf(role) > ROLE_HIERARCHY.indexOf(highest)) {
      highest = role;
    }
  }
  return highest;
}
```

**Imports required for PnPjs current user groups:**
```typescript
import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups/web";
```

### Pattern 4: RoleGate Component

**What:** A thin wrapper that conditionally renders children based on the user's resolved role meeting a minimum role threshold.
**When to use:** Any UI section that should only be visible to certain roles.

```typescript
// Source: wissens-hub-spec.md "RoleGate component"
interface IRoleGateProps {
  minimumRole: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;  // optional: what to show if role insufficient
}

const RoleGate: React.FC<IRoleGateProps> = ({ minimumRole, children, fallback = null }) => {
  const { role } = useWissensHub();
  const roleIndex = ROLE_HIERARCHY.indexOf(role);
  const requiredIndex = ROLE_HIERARCHY.indexOf(minimumRole);
  return roleIndex >= requiredIndex ? <>{children}</> : <>{fallback}</>;
};
```

### Pattern 5: Result<T> Discriminated Union

**What:** All service methods return `Result<T>` instead of throwing exceptions for expected failures.
**When to use:** Every service interface method return type.

```typescript
// Source: wissens-hub-spec.md "Result Pattern"
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

export type AppError =
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'UNAUTHORIZED'; message: string }
  | { code: 'NETWORK_ERROR'; message: string }
  | { code: 'VALIDATION_ERROR'; message: string; fields?: Record<string, string> }
  | { code: 'UNKNOWN'; message: string };

// Helper functions for ergonomic creation:
export const ok = <T>(data: T): Result<T> => ({ success: true, data });
export const fail = <T>(error: AppError): Result<T> => ({ success: false, error });
```

### Pattern 6: CQRS-Lite Hooks

**What:** Separate query hooks (read) from command hooks (write). Queries return data + refetch. Commands return execute function + state.
**When to use:** Every data operation in the frontend.

```typescript
// Source: wissens-hub-spec.md "CQRS-Lite"
// QueryState for read operations:
export type QueryState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: AppError };

// CommandState for write operations:
export type CommandState =
  | { status: 'idle' }
  | { status: 'executing' }
  | { status: 'success' }
  | { status: 'error'; error: AppError };
```

### Pattern 7: PnPjs Initialization Singleton

**What:** PnPjs SPFI instance initialized once per page, shared across all web parts.
**When to use:** Module-level singleton pattern for sp instance.

```typescript
// Source: ARCHITECTURE.md research, verified with official docs
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups/web";

let _sp: SPFI | null = null;

export const getSP = (context?: WebPartContext): SPFI => {
  if (context !== undefined) {
    _sp = spfi().using(SPFx(context));
  }
  if (_sp === null) {
    throw new Error('PnPjs not initialized. Call getSP(context) from onInit() first.');
  }
  return _sp;
};
```

**Note:** Do NOT add Caching behavior here. Caching is a Phase 10 concern (CACH-01). Keep it simple now.

### Anti-Patterns to Avoid

- **Data fetching in React components:** All data access goes through hooks, never direct PnPjs/API calls in components.
- **Sharing React Context across web parts:** Each web part has its own React root and its own WissensHubProvider instance. Do NOT expect shared state.
- **Throwing exceptions for expected failures:** Use Result<T> pattern. Exceptions are for unexpected/programming errors only.
- **Importing Fluent UI barrel:** Use path imports: `import { Dropdown } from '@fluentui/react/lib/Dropdown'`, never `import { Dropdown } from '@fluentui/react'`.
- **Initializing PnPjs in constructor:** `this.context` is undefined in the web part constructor. Initialize in `onInit()` only.
- **Using `any` type:** Strict TypeScript -- no `any`, use proper generics and discriminated unions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SharePoint REST API calls | Raw fetch/XMLHttpRequest | PnPjs v4 `@pnp/sp` | Type-safe, fluent API, handles ODATA parsing, retry headers |
| Entra ID token acquisition | MSAL.js / manual OAuth | `AadHttpClient` from `@microsoft/sp-http` | SPFx-native, automatic token management via SP Online Client Extensibility principal. MSAL explicitly not supported in SPFx. |
| HTTP client for Azure Functions | Axios / node-fetch | `AzureApiClient` wrapping `AadHttpClient` | Token handled by SPFx framework, no CORS token issues |
| Role hierarchy comparison | Nested if/else chains | Array-indexed hierarchy lookup | `ROLE_HIERARCHY.indexOf()` is O(1) readable, no branching |

**Key insight:** SPFx provides AadHttpClient specifically for this purpose. Using any other HTTP client for authenticated Azure Functions calls will fail because SPFx controls the token lifecycle through the SharePoint Online Client Extensibility service principal.

## Common Pitfalls

### Pitfall 1: PnPjs Not Installed
**What goes wrong:** PnPjs v4 is listed in the spec but is NOT in the current package.json. Attempting to import `@pnp/sp` without installing it causes build failures.
**Why it happens:** Phase 1 scaffolded the SPFx project with default dependencies. PnPjs is an additional dependency.
**How to avoid:** Install PnPjs as the first action in Phase 3: `npm install @pnp/sp @pnp/queryable @pnp/logging --save-exact`
**Warning signs:** `Cannot find module '@pnp/sp'` errors during build.

### Pitfall 2: PnPjs Import Side-Effects
**What goes wrong:** PnPjs v4 uses selective imports via side-effect modules. Calling `sp.web.currentUser.groups()` without importing `@pnp/sp/site-users/web` and `@pnp/sp/site-groups/web` causes runtime errors ("Property 'currentUser' does not exist" or undefined at runtime).
**Why it happens:** PnPjs v4's tree-shaking design requires explicit submodule imports to register functionality on the `sp` object.
**How to avoid:** Always import the exact submodules needed. For role detection:
```typescript
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups/web";
```
**Warning signs:** Runtime TypeError on `sp.web.currentUser` or `groups is not a function`.

### Pitfall 3: Renaming common/ to shared/ Breaking Existing Imports
**What goes wrong:** The existing `spfx/src/common/` directory contains only `.gitkeep` files, but if any web part already imports from it, renaming breaks builds.
**Why it happens:** Phase 1 scaffolding created the skeleton.
**How to avoid:** Verify no existing imports reference `common/` before renaming. In this project the common/ directory only has `.gitkeep` files with no code, so the rename is safe. Delete `common/` entirely and create `shared/` fresh.
**Warning signs:** Build errors with "Cannot find module '../common/...'".

### Pitfall 4: AadHttpClient.getClient() Failing Silently in Workbench
**What goes wrong:** In the local workbench, `this.context.aadHttpClientFactory.getClient()` throws an error. If the error is not caught, the entire web part fails to render.
**Why it happens:** AadHttpClient requires the SharePoint Online Client Extensibility service principal, which is unavailable in local workbench.
**How to avoid:** DashboardWebPart.ts already has the correct try/catch pattern. Replicate this pattern in all 4 web parts. Pass `undefined` for the AadHttpClient when it fails.
**Warning signs:** Blank web part in workbench, console error about "experimental feature not supported".

### Pitfall 5: SPFx Heft Build with Relative Imports from shared/
**What goes wrong:** SPFx 1.22's Heft toolchain has different TypeScript path resolution than typical TS projects. Deep relative imports from web parts to shared/ (e.g., `../../../../shared/interfaces/IPageService`) are fragile and error-prone.
**Why it happens:** Heft's TypeScript compilation resolves paths differently; `paths` aliases in tsconfig.json may not work without additional Heft plugin configuration.
**How to avoid:** Use relative imports (`../../shared/...`) for now. Keep import paths short by using barrel exports (index.ts) in each shared subfolder. Do NOT attempt tsconfig path aliases without testing the Heft build.
**Warning signs:** `heft test --clean` succeeds but `heft build --clean --production` fails with module resolution errors.

### Pitfall 6: Mock Service Delay Blocking Tests
**What goes wrong:** Mock services with `setTimeout`-based latency simulation cause Jest tests to hang or time out.
**Why it happens:** Jest runs in a Node.js environment where `setTimeout` delays are real unless mocked.
**How to avoid:** Make the delay configurable with a default of 0ms in test environments. Use a `MOCK_DELAY` constant that can be set to 0 in test setup. Alternatively, use `Promise.resolve()` with no delay for the base mock, and only add latency in a "workbench-mode" wrapper.
**Warning signs:** Jest tests timing out after 5000ms on simple mock service calls.

## Code Examples

Verified patterns from the spec and official sources:

### Service Interface Definition
```typescript
// Source: wissens-hub-spec.md "Dependency Inversion"
// spfx/src/shared/interfaces/IPageService.ts
import { Result } from '../models/Result';
import { IArticlePage } from '../models/domain/IArticlePage';

export interface IPageService {
  getPublishedArticles(): Promise<Result<IArticlePage[]>>;
  getArticleById(pageId: number): Promise<Result<IArticlePage>>;
}
```

### AzureApiClient (Production IApiClient)
```typescript
// Source: ARCHITECTURE.md research + spec
// spfx/src/shared/services/AzureApiClient.ts
import { AadHttpClient, AadHttpClientConfiguration } from '@microsoft/sp-http';
import { IApiClient } from '../interfaces/IApiClient';
import { Result, ok, fail } from '../models/Result';
import { AppError } from '../models/Result';

export class AzureApiClient implements IApiClient {
  constructor(
    private readonly client: AadHttpClient,
    private readonly baseUrl: string
  ) {}

  async get<T>(endpoint: string): Promise<Result<T>> {
    try {
      const response = await this.client.get(
        `${this.baseUrl}${endpoint}`,
        AadHttpClient.configurations.v1
      );
      if (!response.ok) {
        return fail(this.mapHttpError(response.status));
      }
      const data = await response.json() as T;
      return ok(data);
    } catch (e) {
      return fail({ code: 'NETWORK_ERROR', message: (e as Error).message });
    }
  }

  async post<T>(endpoint: string, body?: unknown): Promise<Result<T>> {
    try {
      const response = await this.client.post(
        `${this.baseUrl}${endpoint}`,
        AadHttpClient.configurations.v1,
        {
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        }
      );
      if (!response.ok) {
        return fail(this.mapHttpError(response.status));
      }
      const text = await response.text();
      const data = text ? JSON.parse(text) as T : undefined as unknown as T;
      return ok(data);
    } catch (e) {
      return fail({ code: 'NETWORK_ERROR', message: (e as Error).message });
    }
  }

  private mapHttpError(status: number): AppError {
    switch (status) {
      case 401: return { code: 'UNAUTHORIZED', message: 'Authentication required' };
      case 403: return { code: 'UNAUTHORIZED', message: 'Insufficient permissions' };
      case 404: return { code: 'NOT_FOUND', message: 'Resource not found' };
      default: return { code: 'UNKNOWN', message: `HTTP ${status}` };
    }
  }
}
```

### WebPart onInit Pattern (Updated for WissensHubContext)
```typescript
// Source: Existing DashboardWebPart.ts pattern + spec requirements
// Each WebPart.ts follows this pattern:
protected async onInit(): Promise<void> {
  await super.onInit();

  // 1. Initialize PnPjs singleton
  this._sp = getSP(this.context);

  // 2. Try to get AadHttpClient (fails gracefully in workbench)
  try {
    this._apiClient = await this.context.aadHttpClientFactory
      .getClient('api://{client-id}');  // from config
  } catch (error) {
    console.warn('AadHttpClient not available (workbench mode):', error);
  }
}

public render(): void {
  const element = React.createElement(WissensHubProvider, {
    spContext: this.context,
    aadClient: this._apiClient,     // undefined in workbench = mock mode
    apiBaseUrl: this.properties.apiBaseUrl,
    mockRole: this.properties.mockRole, // from property pane
    children: React.createElement(Dashboard)
  });
  ReactDom.render(element, this.domElement);
}
```

### SharePoint Page DTO and Domain Model
```typescript
// Source: wissens-hub-spec.md "Domain Models separate from DTOs"
// spfx/src/shared/models/dto/ArticlePageDto.ts
export interface ArticlePageDto {
  Id: number;
  Title: string;
  FileLeafRef: string;  // filename.aspx
  FieldValuesAsText: {
    WH_Category: string;
    WH_Status: string;
    WH_IsMandatory: string;    // "Yes" / "No" -- SharePoint returns strings for Boolean
    WH_TargetGroups: string;   // semicolon-separated or plain text
    WH_Reviewer: string;
    WH_ReviewByDate: string;   // date string
  };
  Modified: string;             // ISO date string
  Author: { Title: string; EMail: string };
}

// spfx/src/shared/models/domain/IArticlePage.ts
export interface IArticlePage {
  id: number;
  title: string;
  category: string;           // dynamic string, not union (ADMIN-01)
  status: ArticleStatus;
  isMandatory: boolean;
  targetGroups: string[];
  modifiedDate: Date;
  author: IUser;
  reviewerName?: string;
  reviewByDate?: Date;
  url: string;
}
```

### Mock Data Factory (German Content)
```typescript
// Source: Phase 2 provisioning script New-WissensHubSampleData.ps1
// spfx/src/shared/services/__mocks__/mockData.ts

import { IArticlePage } from '../../models/domain/IArticlePage';
import { ArticleStatus } from '../../models/domain/types';

export const MOCK_CATEGORIES = [
  'IT-Sicherheit', 'Datenschutz', 'Onboarding',
  'Arbeitsprozesse', 'Compliance'
];

export const MOCK_TARGET_GROUPS = [
  'Alle Mitarbeiter', 'IT-Abteilung', 'Management', 'Neue Mitarbeiter'
];

export const MOCK_ARTICLES: IArticlePage[] = [
  {
    id: 1,
    title: 'Passwort-Richtlinie',
    category: 'IT-Sicherheit',
    status: 'Published',
    isMandatory: true,
    targetGroups: ['Alle Mitarbeiter'],
    modifiedDate: new Date('2026-02-15'),
    author: { displayName: 'Anna Schmidt', email: 'anna.schmidt@contoso.de' },
    url: '/sites/wissenshub/SitePages/Passwort-Richtlinie.aspx'
  },
  // ... 9 more matching Phase 2 sample data
];
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PnPjs v3 `sp.setup()` global | PnPjs v4 `spfi().using(SPFx(context))` factory | PnPjs v4 (2023) | Module-level singleton, explicit context binding |
| Gulp build toolchain | Heft build toolchain | SPFx 1.22 (Dec 2025) | Config-driven builds, `npm run build` instead of `gulp build` |
| Class components + setState | Functional components + hooks | React 16.8+ (2019) | Hooks for all state management, no class components in React layer |
| Direct service calls in components | Custom hooks wrapping services | Modern React pattern | Clean separation of data access from presentation |
| `EnvironmentType` enum for detection | AadHttpClient availability check | Practical pattern | More reliable than EnvironmentType for mock/prod toggle |

**Deprecated/outdated:**
- `sp.setup()` global configuration (PnPjs v3) -- replaced by `spfi()` factory
- Gulp-based SPFx builds -- Heft is the only supported toolchain from SPFx 1.22+
- `ReactDOM.render()` -- still required in React 17 (SPFx lock), but `createRoot` is the modern API in React 18+

## Open Questions

1. **PnPjs exact version compatibility with SPFx 1.22.2**
   - What we know: PnPjs v4.x works with SPFx 1.18+. The spec specifies v4.
   - What's unclear: Exact latest v4 minor version. npm will resolve this at install time.
   - Recommendation: Install with `--save-exact` flag after checking `npm view @pnp/sp version`.

2. **PropertyPaneDropdown for mock role selector type compatibility**
   - What we know: `PropertyPaneDropdown` exists in `@microsoft/sp-property-pane` and is already used in SPFx.
   - What's unclear: Whether the property pane dropdown can be conditionally shown/hidden based on mock mode detection at property pane render time.
   - Recommendation: Use `getPropertyPaneConfiguration()` which is called each time the pane opens. Check `this._apiClient === undefined` to conditionally include the dropdown group.

3. **SharePoint Boolean field FieldValuesAsText representation**
   - What we know: SharePoint returns Boolean columns as strings via `FieldValuesAsText`. The exact string depends on the site's language.
   - What's unclear: Whether a German-locale site returns "Ja"/"Nein" or "Yes"/"No" in `FieldValuesAsText`.
   - Recommendation: Use `FieldValuesForEdit` or the raw item value (which returns `1`/`0` or `true`/`false`) instead of `FieldValuesAsText` for Boolean fields. The mapper should handle both string and boolean inputs defensively.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (Heft-integrated, via @rushstack/heft-jest-plugin) |
| Config file | `spfx/node_modules/@microsoft/spfx-web-build-rig/profiles/default/config/jest.config.json` (rig-provided) |
| Quick run command | `cd spfx && npx heft test --clean` |
| Full suite command | `cd spfx && npx heft test --clean --production` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ARCH-01 | WissensHubContext provides user, role, services | unit | `cd spfx && npx heft test --clean -- --testPathPattern context` | No -- Wave 0 |
| ARCH-02 | IServiceContainer has all service properties | unit (type-level) | Compile-time check via TypeScript strict mode | No -- type-only |
| ARCH-05 | Result<T> typed success/failure | unit | `cd spfx && npx heft test --clean -- --testPathPattern Result` | No -- Wave 0 |
| ARCH-08 | QueryState/CommandState discriminated unions | unit (type-level) | Compile-time check via TypeScript strict mode | No -- type-only |
| ARCH-09 | RoleGate renders/hides based on role | unit | `cd spfx && npx heft test --clean -- --testPathPattern RoleGate` | No -- Wave 0 |
| ARCH-10 | Role detection resolves highest applicable role | unit | `cd spfx && npx heft test --clean -- --testPathPattern role` | No -- Wave 0 |
| ARCH-03 | Production services return Result<T> | unit | `cd spfx && npx heft test --clean -- --testPathPattern services` | No -- Wave 0 |
| ARCH-04 | Mock services return realistic test data | unit | `cd spfx && npx heft test --clean -- --testPathPattern mocks` | No -- Wave 0 |
| ARCH-06 | Mappers transform DTO to domain correctly | unit | `cd spfx && npx heft test --clean -- --testPathPattern mapper` | No -- Wave 0 |
| ARCH-07 | Query/Command hooks manage state transitions | unit | `cd spfx && npx heft test --clean -- --testPathPattern hooks` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `cd spfx && npx heft test --clean`
- **Per wave merge:** `cd spfx && npx heft test --clean --production`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

**Critical:** The SPFx Heft build rig includes a default jest.config.json, but tests run against `lib-commonjs/` (compiled output), not source `.ts` files directly. The `heft test` command compiles first, then runs Jest. Test files should be `.test.ts` files co-located with source or in a `__tests__/` directory.

- [ ] Confirm `heft test --clean` runs successfully with zero tests (baseline)
- [ ] Create first test file (e.g., `src/shared/models/Result.test.ts`) to validate the test pipeline works
- [ ] Verify test file discovery pattern: files matching `**/*.test.ts` in `src/` should compile to `lib-commonjs/**/*.test.js` and be discovered by Jest

*(The existing test infrastructure via Heft + Jest rig is present but no test files exist yet. First test file confirms the pipeline works.)*

## Sources

### Primary (HIGH confidence)
- [PnPjs v4 Site Users docs](https://pnp.github.io/pnpjs/sp/site-users/) -- `sp.web.currentUser.groups()` API
- [PnPjs v4 Site Groups docs](https://pnp.github.io/pnpjs/sp/site-groups/) -- `sp.web.siteGroups.getByName()`, associated groups
- [PnPjs SPFx integration](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/use-sp-pnp-js-with-spfx-web-parts) -- `spfi().using(SPFx(context))` pattern
- [AadHttpClient docs](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient) -- token acquisition, API permissions
- wissens-hub-spec.md -- Clean Architecture section, Role Model section, Data Architecture section
- ARCHITECTURE.md (project research) -- Full architecture patterns with code examples
- PITFALLS.md (project research) -- 15 pitfalls with prevention strategies

### Secondary (MEDIUM confidence)
- [SPFx Compatibility Matrix](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility) -- React 17, TypeScript 5.8, Node 22 LTS
- [SPFx Heft Toolchain docs](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/sharepoint-framework-toolchain-rushstack-heft) -- Build system details
- STACK.md (project research) -- Verified versions and compatibility notes

### Tertiary (LOW confidence)
- SharePoint Boolean `FieldValuesAsText` locale behavior -- needs validation on German-locale tenant

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries verified via official docs, versions locked by SPFx
- Architecture: HIGH -- patterns come directly from the spec and are standard SPFx/React patterns
- Pitfalls: HIGH -- existing PITFALLS.md research covers all critical issues, PnPjs import side-effects verified
- Mock data alignment: HIGH -- Phase 2 provisioning script provides exact article data to mirror
- Test infrastructure: MEDIUM -- Heft Jest integration exists but no test files to confirm pipeline works

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable -- SPFx 1.22.2 is current, PnPjs v4 is mature)
