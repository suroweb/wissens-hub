# Phase 11: Testing - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Comprehensive automated test coverage across all layers: Jest unit tests for frontend services, hooks, and components; .NET integration tests for all API endpoints against real SQL Server in Docker; Playwright E2E tests for critical user flows against SharePoint workbench with Edge SSO auth. No new features — testing only.

</domain>

<decisions>
## Implementation Decisions

### Frontend test scope
- Full coverage: replace ALL 29 existing stub test files with real assertions
- Test depth: render tests, user interaction (via @testing-library/user-event), hook behavior, service logic
- Covers all layers: services (CacheService, TelemetryService, mock/production services), hooks (all query/command hooks), and components (Dashboard, ArticleSidebar, Freigabecenter, AdminPanel, UnreadBadge)
- User events: simulate clicks, typing, toggles with @testing-library/user-event — not just render + props

### Frontend mocking strategy
- Mock at service interface boundary (IPageService, IApiClient, etc.) — components and hooks never see PnPjs/AadHttpClient directly
- Reuse existing mock services (MockPageService, MockApiClient, etc.) as test doubles — they already return realistic German test data and maintain session state
- Override specific methods with jest.spyOn() when tests need controlled return values
- SPFx-specific modules (PnPjs, sp-core-library) are NOT mocked directly — the service abstraction layer handles this

### Backend test strategy
- Real SQL Server in Docker (existing Docker Compose setup) — not EF Core InMemory
- HTTP endpoint level via WebApplicationFactory: tests send real HTTP requests through the full pipeline (auth middleware -> function trigger -> MediatR -> handler -> EF Core -> SQL Server)
- All 10 API endpoints tested: articles/status, articles/unread, read, flag, readstats, approve, favorites, favorites/toggle, dashboard/stats, admin/reports
- Each endpoint: at least one happy-path test + one error case

### Backend auth in tests
- Reuse existing dev-mode auth bypass (AZURE_FUNCTIONS_ENVIRONMENT=Development) — injects synthetic identity with all 4 WissensHub groups
- No fake auth middleware or custom test authentication handlers needed

### Backend test infrastructure
- xUnit IClassFixture with WebApplicationFactory-based fixture
- Connects to Docker SQL Server, applies migrations once
- Per-test database cleanup via transaction rollback or database reset

### E2E test approach
- Playwright CLI (`npx playwright test`) for automated execution
- Target: real SharePoint workbench with Edge SSO auth (same pattern as forge-spfx-webpart-project-management-00)
- global-setup.ts: reuse Edge persistent profile for SSO, cache auth state to .auth-state.json (8-hour validity), fallback to interactive login
- spfx-fixtures.ts: worker-scoped fixture — loads workbench once, adds specific web part, enters preview mode
- Separate fixture per web part (Dashboard, ArticleSidebar, Freigabecenter, AdminPanel) — isolates failures
- Chromium/Edge only (msedge channel) — SharePoint Online targets Edge/Chrome
- Headless by default for CI, with `test:e2e:headed` script for local debugging
- workers:1, fullyParallel:false — sequential execution with shared browser session

### E2E critical flows
- All 4 flows from roadmap:
  1. Browse dashboard: load, filter, search, toggle card/list view
  2. Mark as read: open article sidebar, click mark-as-read, verify status update
  3. Approve article: open Freigabecenter, approve/reject with comment
  4. Admin config: open admin panel, manage categories

### Test infrastructure
- Shared frontend test utilities: `test-utils.tsx` with renderWithContext() helper (provides mock services, WissensHubContext, ToastProvider)
- Mock data factories for articles, users, categories, etc.
- Code coverage with thresholds: Istanbul/Heft for Jest, coverlet for .NET (70% threshold for portfolio project)
- Unified npm scripts in root package.json: `test:frontend`, `test:backend`, `test:e2e`, `test:all`

### Claude's Discretion
- Exact coverage threshold numbers (70% suggested but flexible)
- Test file organization within `__tests__` directories
- Specific test case names and grouping
- WebApplicationFactory configuration details
- Per-test cleanup strategy (transaction rollback vs database recreate)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Playwright SharePoint auth pattern (CRITICAL)
- `../../../forge-spfx-webpart-project-management-00/playwright.config.ts` — Playwright config with msedge channel, workers:1, private network request bypass args
- `../../../forge-spfx-webpart-project-management-00/verification-tests/global-setup.ts` — Edge SSO profile auth, auth state caching (8h), interactive login fallback
- `../../../forge-spfx-webpart-project-management-00/verification-tests/spfx-fixtures.ts` — Worker-scoped workbench fixture, loadWorkbench() with debug scripts + web part add + preview mode, resetWorkbenchState()
- `../../../forge-spfx-webpart-project-management-00/verification-tests/e2e/01-full-lifecycle.spec.ts` — Example E2E test using spfx-fixtures

### Existing test infrastructure
- `spfx/src/webparts/dashboard/components/__tests__/Dashboard.test.tsx` — Example stub test file (29 total across all web parts)
- `spfx/src/shared/services/__tests__/CacheService.test.ts` — Example it.todo() stub pattern
- `api/tests/WissensHub.Tests/WissensHub.Tests.csproj` — Existing .NET test project (xUnit, EF Core InMemory, coverlet)
- `api/tests/WissensHub.Tests/Infrastructure/DatabaseSchemaTests.cs` — Existing schema validation tests (6 tests)

### Backend auth bypass
- Phase 4 decision: AZURE_FUNCTIONS_ENVIRONMENT=Development injects synthetic identity with all 4 WissensHub groups (see STATE.md accumulated context)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **29 test stub files** across all web parts and shared services — ready to be replaced with real assertions
- **Mock services** (MockPageService, MockApiClient, MockReadConfirmationService, etc.) — return realistic German test data, reusable as test doubles
- **WissensHub.Tests project** — xUnit + EF Core InMemory already configured, coverlet included
- **Docker Compose** with SQL Server 2022 — available for real DB integration tests
- **@testing-library/react v12 + jest-dom v5** — already installed in spfx/package.json (React 17 compatible)

### Established Patterns
- **Heft test pipeline** — `heft test` runs Jest (not standalone jest CLI)
- **jest.mock with { virtual: true }** — used for loc module mocks in UnreadBadge tests
- **jest.mock before imports** — required by @rushstack/hoist-jest-mock lint rule
- **ES5 target constraints** — use indexOf/forEach instead of includes/flatMap
- **it.todo() pattern** — used in Phase 10 test stubs for cleaner skip reporting

### Integration Points
- Root `package.json` — needs unified test scripts (`test:frontend`, `test:backend`, `test:e2e`, `test:all`)
- `spfx/` — Heft pipeline handles Jest execution
- `api/tests/WissensHub.Tests/` — dotnet test execution
- New `e2e/` or `tests/e2e/` directory — Playwright tests, config, fixtures

</code_context>

<specifics>
## Specific Ideas

- Playwright E2E tests must follow the forge-spfx-webpart-project-management-00 pattern exactly: Edge SSO profile, auth state caching, workbench fixtures with "Load debug scripts" button handling (EN/DE), web part addition, preview mode
- Each E2E test uses Playwright CLI for automation (`npx playwright test`)
- The workbench URL pattern: `https://{tenant}.sharepoint.com/_layouts/15/workbench.aspx?debugManifestsFile=https%3A%2F%2Flocalhost%3A4321%2Ftemp%2Fbuild%2Fmanifests.js&debug=true&noredir=true`
- Browser args must include `--disable-features=BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights,PrivateNetworkAccessRespectPreflightResults` and `--allow-insecure-localhost` for localhost dev server access

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-testing*
*Context gathered: 2026-03-17*
