# Phase 11: Testing - Research

**Researched:** 2026-03-17
**Domain:** Frontend unit testing (Jest/Heft), .NET integration testing (xUnit/SQL Server), E2E testing (Playwright/SharePoint)
**Confidence:** HIGH

## Summary

Phase 11 covers three distinct testing layers for the WissensHub application: (1) Jest unit tests for the SPFx frontend running through the Heft pipeline, (2) .NET integration tests for Azure Functions API endpoints against real SQL Server 2022 in Docker, and (3) Playwright E2E tests against the SharePoint workbench with Edge SSO authentication.

The most critical research finding is that **WebApplicationFactory does NOT work with Azure Functions Isolated Worker** (confirmed by Microsoft -- GitHub issue #2424 closed as "by design"). The CONTEXT.md mentions "HTTP endpoint level via WebApplicationFactory" but this is architecturally impossible. The correct approach is to test MediatR handlers directly through a custom `IClassFixture` that builds a service provider with real SQL Server, bypassing the Azure Functions hosting layer entirely. This tests the full pipeline (MediatR -> behaviors -> handlers -> EF Core -> SQL Server) without needing the Azure Functions runtime.

A secondary finding is that `@testing-library/user-event` v14 has known compatibility issues with `@testing-library/react` v12 + React 17 (fake timer conflicts). The safer choice is `@testing-library/user-event` v13.5.0, which is stable with this stack, or use `fireEvent` from `@testing-library/react` directly (already proven working in the UnreadBadgeHeader tests).

**Primary recommendation:** Test MediatR handlers directly via xUnit fixture with real SQL Server (not WebApplicationFactory); use user-event v13.5.0 or fireEvent for frontend interaction tests; replicate the forge-spfx-webpart-project-management-00 Playwright pattern exactly for E2E.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Full coverage: replace ALL 29 existing stub test files with real assertions
- Test depth: render tests, user interaction (via @testing-library/user-event), hook behavior, service logic
- Mock at service interface boundary (IPageService, IApiClient, etc.) -- components and hooks never see PnPjs/AadHttpClient directly
- Reuse existing mock services (MockPageService, MockApiClient, etc.) as test doubles
- Override specific methods with jest.spyOn() when tests need controlled return values
- Real SQL Server in Docker (existing Docker Compose setup) -- not EF Core InMemory
- HTTP endpoint level via WebApplicationFactory [NOTE: NOT POSSIBLE -- see research findings]
- All 10 API endpoints tested with at least one happy-path + one error case
- Reuse existing dev-mode auth bypass (AZURE_FUNCTIONS_ENVIRONMENT=Development)
- xUnit IClassFixture with WebApplicationFactory-based fixture [NOTE: use custom ServiceProvider fixture instead]
- Per-test database cleanup via transaction rollback or database reset
- Playwright CLI for automated execution targeting real SharePoint workbench
- Edge SSO persistent profile auth pattern from forge-spfx-webpart-project-management-00
- 4 E2E flows: browse dashboard, mark as read, approve article, admin config
- Shared test-utils.tsx with renderWithContext() helper
- Mock data factories for articles, users, categories
- Code coverage with thresholds (70% suggested)
- Unified npm scripts: test:frontend, test:backend, test:e2e, test:all

### Claude's Discretion
- Exact coverage threshold numbers (70% suggested but flexible)
- Test file organization within __tests__ directories
- Specific test case names and grouping
- Custom fixture configuration details (replacing WebApplicationFactory)
- Per-test cleanup strategy (transaction rollback vs database recreate)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TEST-01 | Jest unit tests for frontend services, hooks, and components | Heft pipeline runs Jest from lib-commonjs; 29 stub files to replace; use @testing-library/react v12 + jest-dom v5 + user-event v13.5.0; mock at service interface boundary via createMockServices(); renderWithContext() helper pattern |
| TEST-02 | .NET integration tests for Azure Functions API layer | WebApplicationFactory incompatible -- use custom xUnit IClassFixture with ServiceCollection building real DI container (MediatR + EF Core + SQL Server in Docker); synthetic dev identity injection; per-test transaction rollback |
| TEST-03 | Playwright E2E tests for critical user flows | Exact replication of forge-spfx-webpart-project-management-00 pattern; global-setup.ts with Edge SSO; spfx-fixtures.ts with worker-scoped workbench; 4 test files for 4 flows; msedge channel, workers:1, fullyParallel:false |

</phase_requirements>

## Standard Stack

### Core -- Frontend Testing
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @testing-library/react | 12.1.5 | React component rendering/queries | Already installed; v12 required for React 17 |
| @testing-library/jest-dom | 5.17.0 | DOM matchers (toBeInTheDocument, etc.) | Already installed; v5 required for Jest 27 (Heft) |
| @testing-library/user-event | 13.5.0 | User interaction simulation | v14 has fake-timer issues with React 17 + RTL 12; v13 is stable |
| @types/heft-jest | 1.0.2 | Jest type definitions for Heft | Already installed |
| @rushstack/heft | 1.1.2 | Build/test pipeline (runs Jest) | Already installed; `heft test` is the entry point |

### Core -- Backend Testing
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| xunit | 2.9.3 | Test framework | Already in WissensHub.Tests.csproj |
| xunit.runner.visualstudio | 3.1.4 | Test runner | Already in WissensHub.Tests.csproj |
| Microsoft.NET.Test.Sdk | 17.14.1 | Test SDK | Already in WissensHub.Tests.csproj |
| Microsoft.EntityFrameworkCore.SqlServer | 10.0.3 | Real SQL Server provider for tests | Replace InMemory with real SQL; match production provider |
| coverlet.collector | 6.0.4 | Code coverage collection | Already in WissensHub.Tests.csproj |
| MediatR | (transitive) | CQRS pipeline testing | Already available via Application project reference |
| FluentValidation | (transitive) | Validation behavior testing | Already available via Application project reference |

### Core -- E2E Testing
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @playwright/test | 1.58.2 | E2E browser automation | Latest stable; supports msedge channel, persistent context SSO |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| user-event v13 | user-event v14 | v14 has async API (better DX) but fake-timer conflicts with React 17/RTL 12 |
| user-event v13 | fireEvent (RTL) | fireEvent is lower-level but already proven in existing tests (UnreadBadgeHeader) |
| Custom xUnit fixture | WebApplicationFactory | WebApplicationFactory is incompatible with Azure Functions Isolated Worker |
| Custom xUnit fixture | Testcontainers for Functions host | Overly complex; testing MediatR handlers directly is sufficient for this project |
| Real SQL Server | EF Core InMemory | InMemory lacks SQL Server constraints, indexes, stored procedures; CONTEXT.md explicitly requires real SQL |

**Installation:**
```bash
# Frontend (from spfx/ directory)
npm install --save-dev @testing-library/user-event@13.5.0

# E2E (from project root)
npm install --save-dev @playwright/test@1.58.2
npx playwright install msedge

# Backend (no new packages needed -- but replace InMemory with SqlServer)
# Remove Microsoft.EntityFrameworkCore.InMemory from WissensHub.Tests.csproj
# The SqlServer provider is already transitively available via Infrastructure project reference
```

## Architecture Patterns

### Frontend Test Structure
```
spfx/src/
├── shared/
│   ├── services/__tests__/
│   │   ├── CacheService.test.ts         # Service unit tests
│   │   └── TelemetryService.test.ts     # Service unit tests
│   ├── services/__mocks__/              # Existing mock services (test doubles)
│   │   ├── MockPageService.ts
│   │   ├── MockApiClient.ts
│   │   ├── MockReadConfirmationService.ts
│   │   ├── MockFavoriteService.ts
│   │   ├── MockFlagService.ts
│   │   ├── MockApprovalService.ts
│   │   ├── MockAdminService.ts
│   │   ├── mockData.ts                  # German test data
│   │   └── index.ts                     # createMockServices()
│   ├── utils/__tests__/
│   │   └── exportUtils.test.ts          # Utility tests
│   ├── components/__tests__/
│   │   ├── ErrorBoundary.test.tsx        # Error boundary tests
│   │   └── ToastProvider.test.tsx        # Toast tests
│   └── test-utils.tsx                   # NEW: renderWithContext() helper
├── webparts/
│   ├── dashboard/components/__tests__/  # 4 test files
│   ├── articleSidebar/components/__tests__/ # 7 test files
│   ├── freigabecenter/components/__tests__/ # 6 test files
│   └── adminPanel/components/__tests__/ # 5 test files
└── extensions/
    └── unreadBadge/components/__tests__/ # 2 test files (already have real tests)
```

### Backend Test Structure
```
api/tests/WissensHub.Tests/
├── Infrastructure/
│   ├── DatabaseSchemaTests.cs           # Existing (keep)
│   ├── IntegrationTestFixture.cs        # NEW: IAsyncLifetime fixture
│   └── IntegrationTestBase.cs           # NEW: base class with fixture + cleanup
├── Endpoints/
│   ├── ArticleEndpointTests.cs          # Tests for article status, unread, read, flag
│   ├── FavoriteEndpointTests.cs         # Tests for favorites, toggle
│   ├── ApprovalEndpointTests.cs         # Tests for approve/reject, history
│   ├── DashboardEndpointTests.cs        # Tests for dashboard stats
│   ├── ReadStatsEndpointTests.cs        # Tests for read stats
│   └── AdminEndpointTests.cs            # Tests for reports, categories, target groups, reminders
└── WissensHub.Tests.csproj
```

### E2E Test Structure
```
e2e/
├── playwright.config.ts                 # Config (msedge, workers:1)
├── global-setup.ts                      # Edge SSO auth
├── fixtures/
│   └── spfx-fixtures.ts                 # Worker-scoped workbench fixture
├── tests/
│   ├── 01-dashboard.spec.ts             # Browse, filter, search, toggle view
│   ├── 02-mark-as-read.spec.ts          # Open sidebar, mark as read, verify
│   ├── 03-approve-article.spec.ts       # Freigabecenter approve/reject
│   └── 04-admin-config.spec.ts          # Admin panel, manage categories
├── .auth-state.json                     # Cached auth (gitignored)
├── package.json                         # Playwright dependency
└── tsconfig.json                        # TypeScript config for E2E
```

### Pattern 1: renderWithContext() Test Helper
**What:** Shared utility that wraps components in WissensHubContext with mock services
**When to use:** Every component test that uses useWissensHub()
**Example:**
```typescript
// spfx/src/shared/test-utils.tsx
import * as React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { WissensHubContext, IWissensHubContext } from './context/WissensHubContext';
import { createMockServices } from './services/__mocks__';
import { MOCK_CURRENT_USER } from './services/__mocks__/mockData';
import { IServiceContainer } from './context/ServiceContainer';
import { UserRole } from './models/domain/types';
import { ToastProvider } from './components/ToastProvider';

interface RenderOptions {
  services?: Partial<IServiceContainer>;
  role?: UserRole;
}

export function renderWithContext(
  ui: React.ReactElement,
  options: RenderOptions = {}
): RenderResult {
  const mockServices = createMockServices();
  const services = { ...mockServices, ...options.services } as IServiceContainer;
  const contextValue: IWissensHubContext = {
    services,
    currentUser: MOCK_CURRENT_USER,
    role: options.role || 'admin',
    isLoading: false,
  };

  return render(
    React.createElement(
      WissensHubContext.Provider,
      { value: contextValue },
      React.createElement(ToastProvider, null, ui)
    )
  );
}
```

### Pattern 2: MediatR Handler Integration Test Fixture (replaces WebApplicationFactory)
**What:** xUnit IClassFixture that builds a real DI container with MediatR, EF Core, and SQL Server
**When to use:** All backend integration tests
**Example:**
```csharp
// api/tests/WissensHub.Tests/Infrastructure/IntegrationTestFixture.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using FluentValidation;
using WissensHub.Application.Commands.MarkAsRead;
using WissensHub.Application.Common.Behaviors;
using WissensHub.Application.Interfaces;
using WissensHub.Infrastructure.Data;
using WissensHub.Infrastructure.Repositories;
using WissensHub.Infrastructure.Services;

public class IntegrationTestFixture : IAsyncLifetime
{
    public IServiceProvider ServiceProvider { get; private set; } = null!;
    private readonly string _connectionString =
        "Server=localhost,1433;Database=WissensHub_Test;User Id=sa;Password=WissensHub_Dev2026!;TrustServerCertificate=true";

    public async Task InitializeAsync()
    {
        var services = new ServiceCollection();

        // EF Core with real SQL Server
        services.AddDbContext<WissensHubDbContext>(options =>
            options.UseSqlServer(_connectionString));

        // MediatR + pipeline behaviors (same order as Program.cs)
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(MarkAsReadCommand).Assembly);
            cfg.AddOpenBehavior(typeof(ExceptionBehavior<,>));
            cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
            cfg.AddOpenBehavior(typeof(AuthorizationBehavior<,>));
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        // FluentValidation
        services.AddValidatorsFromAssembly(typeof(MarkAsReadCommand).Assembly);

        // Repositories
        services.AddScoped<IReadConfirmationRepository, ReadConfirmationRepository>();
        services.AddScoped<IFavoriteRepository, FavoriteRepository>();
        services.AddScoped<IFlagRepository, FlagRepository>();
        services.AddScoped<IApprovalRepository, ApprovalRepository>();
        services.AddScoped<IArticleMetadataRepository, ArticleMetadataRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<ITargetGroupRepository, TargetGroupRepository>();
        services.AddScoped<ISystemConfigurationRepository, SystemConfigurationRepository>();
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<WissensHubDbContext>());

        // Synthetic dev identity (same as Development mode)
        services.AddScoped<ICurrentUser>(_ =>
        {
            var user = new CurrentUser();
            // Inject synthetic identity matching dev auth bypass
            user.SetFromClaimsPrincipal(CreateDevPrincipal());
            return user;
        });

        ServiceProvider = services.BuildServiceProvider();

        // Apply migrations once
        using var scope = ServiceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<WissensHubDbContext>();
        await db.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        if (ServiceProvider is IDisposable disposable)
            disposable.Dispose();
    }

    private static ClaimsPrincipal CreateDevPrincipal() { /* ... */ }
}
```

### Pattern 3: Playwright SPFx Workbench Fixture
**What:** Worker-scoped fixture that loads workbench once and shares across all tests
**When to use:** All E2E tests
**Example:** Exact replication of forge-spfx-webpart-project-management-00 pattern (see Canonical References in CONTEXT.md). Key adaptations for WissensHub:
- WORKBENCH_URL uses the correct tenant URL
- loadWorkbench() adds each WissensHub web part by name (Dashboard, ArticleSidebar, Freigabecenter, AdminPanel)
- Separate fixture per web part for failure isolation

### Anti-Patterns to Avoid
- **WebApplicationFactory with Azure Functions:** Azure Functions Isolated Worker cannot be hosted by WebApplicationFactory. The function host runtime is required and cannot be replicated in-process. Test MediatR handlers directly instead.
- **Mocking MediatR in integration tests:** The point of integration tests is to exercise the real pipeline. Mock at the database boundary (seed data), not at the handler level.
- **Using `jest` CLI directly in SPFx:** Always use `heft test` which handles the build -> test pipeline (compiles TS to lib-commonjs, then runs Jest against compiled JS).
- **Using EF Core InMemory for integration tests:** InMemory does not enforce constraints, doesn't support SQL-specific features. CONTEXT.md explicitly requires real SQL Server.
- **Testing hook behavior in isolation without context:** Hooks call useWissensHub() which throws without a provider. Always use renderWithContext() or a custom hook wrapper.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Component rendering with context | Manual WissensHubContext.Provider setup | renderWithContext() helper | Consistent mock services, role, toast across all tests |
| Mock service creation | Per-test mock object construction | createMockServices() from __mocks__/index.ts | Already returns full IServiceContainer with realistic German data |
| SQL Server test container | Custom Docker management | Existing docker-compose.yml | Already configured with correct credentials and port |
| Auth state in E2E | Manual login automation | global-setup.ts with Edge SSO profile | Proven pattern from reference project, 8-hour cache |
| Workbench loading in E2E | Per-test workbench navigation | Worker-scoped fixture (sharedPage) | Loads once, reuses across all tests |

**Key insight:** The existing codebase already provides most test infrastructure. Mock services with German data exist. Docker Compose with SQL Server exists. The reference Playwright project provides a proven E2E pattern. The main work is writing the actual test assertions, not building infrastructure.

## Common Pitfalls

### Pitfall 1: WebApplicationFactory with Azure Functions
**What goes wrong:** Tests fail with "The gRPC channel URI 'http://:' could not be parsed"
**Why it happens:** Azure Functions Isolated Worker requires the Azure Functions host runtime to inject gRPC configuration, environment variables, and middleware pipeline. WebApplicationFactory cannot replicate this.
**How to avoid:** Build a ServiceCollection manually that mirrors Program.cs DI registrations (MediatR, EF Core, repositories, validators). Send MediatR requests directly via IMediator.Send().
**Warning signs:** Any reference to `WebApplicationFactory<Program>` or `Microsoft.AspNetCore.Mvc.Testing` in an Azure Functions project.

### Pitfall 2: user-event v14 Fake Timer Conflicts
**What goes wrong:** Tests hang or time out when using `userEvent.click()` with React 17 + @testing-library/react v12
**Why it happens:** user-event v14 uses real timers internally but conflicts with Jest's fake timer implementation in certain React 17 scenarios
**How to avoid:** Use `@testing-library/user-event@13.5.0` or fall back to `fireEvent` from `@testing-library/react` (already proven working in UnreadBadgeHeader tests)
**Warning signs:** Test hangs after `await userEvent.click()`, works with `fireEvent.click()`

### Pitfall 3: Heft Jest Runs Against lib-commonjs
**What goes wrong:** Tests import from src/ paths but Jest actually runs against compiled JS in lib-commonjs/
**Why it happens:** The Heft pipeline compiles TypeScript first, then Jest runs against the output. The jest.config.json in the rig sets `roots: ["<rootDir>/lib-commonjs"]` and `testMatch: ["<rootDir>/lib-commonjs/**/*.test.js"]`
**How to avoid:** Always run tests via `heft test` (never standalone `jest`). SCSS module imports resolve to empty objects in compiled output. `jest.mock()` must use module names that match the compiled output (not source paths).
**Warning signs:** "Cannot find module" errors, SCSS-related failures

### Pitfall 4: jest.mock Must Come Before Imports (rushstack/hoist-jest-mock)
**What goes wrong:** ESLint error `@rushstack/hoist-jest-mock` blocks compilation
**Why it happens:** The @rushstack/eslint-config enforces that jest.mock() calls appear before any import statements (Heft requirement for correct mock hoisting)
**How to avoid:** Place ALL jest.mock() calls at the top of the test file, before any import statements. Use `{ virtual: true }` for non-existent modules (like loc string modules).
**Warning signs:** ESLint errors mentioning `hoist-jest-mock`

### Pitfall 5: ES5 Target Constraints in Test Code
**What goes wrong:** Build fails with "Property 'includes' does not exist on type 'string[]'"
**Why it happens:** SPFx tsconfig targets ES5; Array.includes, flatMap, Object.entries are not available
**How to avoid:** Use `indexOf() !== -1` instead of `includes()`, `forEach` instead of `flatMap`, manual iteration instead of `Object.entries`
**Warning signs:** TypeScript errors on modern array/object methods

### Pitfall 6: SQL Server Not Running for Backend Tests
**What goes wrong:** Integration tests fail with connection timeout
**Why it happens:** Docker SQL Server container must be running before `dotnet test` executes
**How to avoid:** Add prerequisite check in test scripts. Use a separate `WissensHub_Test` database to avoid corrupting dev data.
**Warning signs:** "Cannot connect to SQL Server" in test output

### Pitfall 7: loc Module Mocks in SPFx Tests
**What goes wrong:** "Cannot find module 'DashboardWebPartStrings'" or similar
**Why it happens:** SPFx localization modules are virtual (resolved by webpack at build time, not by Node module resolution)
**How to avoid:** Use `jest.mock('DashboardWebPartStrings', () => ({ ... }), { virtual: true })` with all needed string keys. Also mock 'SharedStrings' module. See existing UnreadBadgeHeader.test.tsx for the pattern.
**Warning signs:** Module not found errors for `*Strings` modules

## Code Examples

### Frontend: Service Unit Test (CacheService)
```typescript
// Source: CacheService.ts implementation + existing stub pattern
describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns undefined for cache miss', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('returns stored value for cache hit within TTL', () => {
    cache.set('key', { value: 42 }, 60000);
    expect(cache.get('key')).toEqual({ value: 42 });
  });

  it('returns undefined for expired entry', () => {
    cache.set('key', 'data', 1000);
    jest.advanceTimersByTime(1001);
    expect(cache.get('key')).toBeUndefined();
  });

  it('invalidates entries matching prefix', () => {
    cache.set('articles:all', []);
    cache.set('articles:page1', {});
    cache.set('favorites:all', []);
    cache.invalidate('articles:');
    expect(cache.get('articles:all')).toBeUndefined();
    expect(cache.get('articles:page1')).toBeUndefined();
    expect(cache.get('favorites:all')).toEqual([]);
  });
});
```

### Frontend: Component Test with renderWithContext()
```typescript
// Source: Pattern derived from existing UnreadBadgeHeader test + context provider
jest.mock('DashboardWebPartStrings', () => ({
  CardView: 'Kartenansicht',
  ListView: 'Listenansicht',
  SearchPlaceholder: 'Artikel suchen...',
  // ... other strings
}), { virtual: true });

jest.mock('SharedStrings', () => ({
  MandatoryArticle: 'Pflichtartikel',
  // ... other shared strings
}), { virtual: true });

import * as React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithContext } from '../../../../shared/test-utils';
import { Dashboard } from '../Dashboard';

describe('Dashboard', () => {
  it('renders article cards', async () => {
    renderWithContext(React.createElement(Dashboard, {}));
    // MockPageService returns 10 German articles, 6 are Published
    // Wait for async effect to complete
    // Assert rendered cards
  });
});
```

### Backend: Integration Test with Custom Fixture
```csharp
// Source: Pattern from Azure Functions community + CONTEXT.md decisions
public class ArticleEndpointTests : IClassFixture<IntegrationTestFixture>
{
    private readonly IntegrationTestFixture _fixture;

    public ArticleEndpointTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task MarkAsRead_ValidPageId_ReturnsSuccess()
    {
        using var scope = _fixture.ServiceProvider.CreateScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
        var db = scope.ServiceProvider.GetRequiredService<WissensHubDbContext>();

        // Seed article metadata
        db.ArticleMetadata.Add(new ArticleMetadata { PageId = 100, Title = "Test", Status = "Published" });
        await db.SaveChangesAsync();

        // Act
        var result = await mediator.Send(new MarkAsReadCommand(100));

        // Assert
        Assert.True(result.IsSuccess); // or check ApiResponse

        // Verify in database
        var confirmation = await db.ReadConfirmations.FirstOrDefaultAsync(r => r.ArticleMetadata.PageId == 100);
        Assert.NotNull(confirmation);

        // Cleanup
        db.ReadConfirmations.RemoveRange(db.ReadConfirmations);
        db.ArticleMetadata.RemoveRange(db.ArticleMetadata);
        await db.SaveChangesAsync();
    }
}
```

### E2E: Playwright SPFx Test
```typescript
// Source: forge-spfx-webpart-project-management-00 pattern
import { test, expect, resetWorkbenchState } from '../fixtures/spfx-fixtures';

test.describe.serial('Dashboard Flow', () => {
  test.beforeEach(async ({ workbenchPage }) => {
    await resetWorkbenchState(workbenchPage);
  });

  test('web part renders on workbench', async ({ workbenchPage }) => {
    const webpart = workbenchPage.locator('[class*="dashboard"]');
    await expect(webpart).toBeVisible({ timeout: 15_000 });
  });

  test('filter by category', async ({ workbenchPage }) => {
    const filterDropdown = workbenchPage.getByRole('combobox', { name: /kategorie/i });
    await filterDropdown.click();
    // Select a category, verify filtered results
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| WebApplicationFactory for Functions | Custom ServiceCollection fixture | Always (for Isolated Worker) | Must build DI container manually |
| EF Core InMemory testing | Real SQL Server via Docker | Best practice since EF Core 7+ | Catches constraint violations, SQL-specific behaviors |
| user-event v13 (sync) | user-event v14 (async) | 2022 | v14 preferred for React 18+; stay on v13 for React 17 |
| @testing-library/react-hooks | renderHook from @testing-library/react v13+ | 2022 | For React 17, use renderHook pattern manually or test hooks via component tests |
| gulp-based SPFx testing | Heft pipeline testing | SPFx 1.18+ | `heft test` replaces `gulp test`; Jest runs against lib-commonjs |

**Deprecated/outdated:**
- `@testing-library/react-hooks`: Merged into `@testing-library/react` v13+, but v13 requires React 18. For React 17, test hooks through component rendering or a custom renderHook wrapper.
- `gulp test` for SPFx: Replaced by `heft test` in SPFx 1.18+. Never use gulp.
- `Microsoft.AspNetCore.Mvc.Testing` for Azure Functions: Not compatible with Isolated Worker model.

## Open Questions

1. **Per-test cleanup strategy**
   - What we know: CONTEXT.md allows transaction rollback or database recreate. Transaction rollback is faster but requires wrapping each test in a transaction.
   - What's unclear: Whether MediatR handlers that call SaveChangesAsync() will conflict with an ambient test transaction.
   - Recommendation: Use Respawn library or manual DELETE statements for cleanup. Alternatively, use database per test class with a fresh migration. Transaction rollback is simplest if handlers don't use TransactionScope internally (they don't in this codebase -- EF Core manages the transaction via SaveChangesAsync).

2. **Hook testing approach without @testing-library/react-hooks**
   - What we know: React 17 + RTL 12 don't include renderHook. The dedicated `@testing-library/react-hooks` package exists but is deprecated.
   - What's unclear: Whether to add the deprecated package or test hooks indirectly via component tests.
   - Recommendation: Test hooks indirectly via component tests. Hooks use useWissensHub() context, so testing a component that uses the hook exercises the hook behavior. This is the more maintainable approach.

3. **Coverage threshold configuration in Heft**
   - What we know: Jest coverage is configured in the rig's jest.config.json with v8 provider. The rig uses cobertura + html + json-summary reporters.
   - What's unclear: Whether coverageThreshold can be set in a local jest.config.json override or needs rig modification.
   - Recommendation: Create a local `config/jest.config.json` in the spfx directory that extends the rig config and adds `coverageThreshold`. This is the standard Heft override pattern.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Frontend Framework | Jest 27 via @rushstack/heft-jest-plugin (Heft pipeline) |
| Backend Framework | xUnit 2.9.3 + .NET 10 Test SDK 17.14.1 |
| E2E Framework | Playwright 1.58.2 |
| Frontend Config | rig: @microsoft/spfx-web-build-rig jest.config.json |
| Backend Config | api/tests/WissensHub.Tests/WissensHub.Tests.csproj |
| E2E Config | e2e/playwright.config.ts |
| Frontend Quick Run | `cd spfx && npx heft test --clean` |
| Backend Quick Run | `cd api && dotnet test tests/WissensHub.Tests -e AZURE_FUNCTIONS_ENVIRONMENT=Development` |
| E2E Quick Run | `cd e2e && npx playwright test` |
| Full Suite | `npm run test:all` (from root) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TEST-01 | Jest unit tests for frontend services | unit | `cd spfx && npx heft test --clean` | 29 stubs exist, need real assertions |
| TEST-02 | .NET integration tests for API | integration | `cd api && dotnet test tests/WissensHub.Tests` | Schema tests exist, endpoint tests needed |
| TEST-03 | Playwright E2E for user flows | e2e | `cd e2e && npx playwright test` | No -- Wave 0 gap |

### Sampling Rate
- **Per task commit:** `cd spfx && npx heft test --clean` (frontend), `cd api && dotnet test` (backend)
- **Per wave merge:** Full suite via `npm run test:all`
- **Phase gate:** All three test suites green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `spfx/src/shared/test-utils.tsx` -- renderWithContext() helper
- [ ] `api/tests/WissensHub.Tests/Infrastructure/IntegrationTestFixture.cs` -- Custom xUnit fixture with real SQL Server
- [ ] `api/tests/WissensHub.Tests/Infrastructure/IntegrationTestBase.cs` -- Base class with cleanup
- [ ] `e2e/playwright.config.ts` -- Playwright config for WissensHub
- [ ] `e2e/global-setup.ts` -- Edge SSO auth setup
- [ ] `e2e/fixtures/spfx-fixtures.ts` -- Worker-scoped workbench fixture
- [ ] `e2e/package.json` -- Playwright dependency
- [ ] `e2e/tsconfig.json` -- TypeScript config
- [ ] `@testing-library/user-event@13.5.0` install in spfx/package.json
- [ ] Root package.json scripts: `test:frontend`, `test:backend`, `test:e2e`, `test:all`
- [ ] Remove `Microsoft.EntityFrameworkCore.InMemory` from WissensHub.Tests.csproj (replace with real SQL Server)

## Sources

### Primary (HIGH confidence)
- Existing codebase: spfx/src/**/*.test.tsx (29 stub files examined)
- Existing codebase: api/tests/WissensHub.Tests/ (6 schema tests examined)
- Existing codebase: spfx/node_modules/@microsoft/spfx-web-build-rig jest.config.json and heft.json
- forge-spfx-webpart-project-management-00: playwright.config.ts, global-setup.ts, spfx-fixtures.ts, 01-full-lifecycle.spec.ts (complete E2E reference)
- Azure Functions middleware: AuthenticationMiddleware.cs dev-mode bypass (lines 63-80)

### Secondary (MEDIUM confidence)
- [Azure Functions dotnet worker #2424](https://github.com/Azure/azure-functions-dotnet-worker/issues/2424) -- Confirmed WebApplicationFactory incompatibility with Isolated Worker (closed as by-design)
- [user-event #1123](https://github.com/testing-library/user-event/issues/1123) -- user-event 14.x fake timer issues with React 17
- [Azure Functions dotnet worker #1642](https://github.com/Azure/azure-functions-dotnet-worker/issues/1642) -- Community discussion on testing alternatives
- npm registry: @playwright/test@1.58.2, @testing-library/user-event@13.5.0

### Tertiary (LOW confidence)
- Medium article on integration testing Azure Functions Isolated Worker (403 -- could not verify full content)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages verified against npm registry and existing codebase; version constraints verified (React 17 -> RTL 12, jest-dom 5, user-event 13)
- Architecture: HIGH -- WebApplicationFactory incompatibility confirmed via GitHub issue; MediatR direct testing pattern derived from codebase analysis; Playwright pattern proven in reference project
- Pitfalls: HIGH -- identified from real codebase constraints (ES5 target, Heft pipeline, jest.mock hoisting rule, loc module mocking) and verified GitHub issues (WebApplicationFactory, user-event timers)
- E2E: HIGH -- exact reference implementation available in forge-spfx-webpart-project-management-00

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (30 days -- stable libraries, no fast-moving concerns)
