# Technology Stack

**Project:** WissensHub -- SPFx Knowledge Management Solution
**Researched:** 2026-03-14
**Overall Confidence:** HIGH (verified against official Microsoft documentation as of March 2026)

---

## Recommended Stack

The stack below is LOCKED per the project spec. This document verifies compatibility, confirms versions, and documents known issues -- it does not propose alternatives.

### Frontend: SPFx Solution

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| SPFx | 1.22.2 | Web part/extension framework | Latest stable (released Jan 28, 2026). Uses Heft-based toolchain. Monthly security patches via minor releases. | HIGH -- verified via [MS Docs release notes](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/release-1.22.2) |
| Node.js | 22 LTS ("Jod") | Runtime for dev toolchain | Required by SPFx 1.22.x. The ONLY supported Node version for this SPFx release. | HIGH -- verified via [MS Docs compatibility matrix](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility) |
| React | 17.0.1 | UI component library | Locked by SPFx 1.22.x. Must use `--save-exact` flag when installing. React 18 is NOT supported. | HIGH -- verified via compatibility matrix. MS warns: "Using incompatible React versions can cause silent runtime failures." |
| TypeScript | 5.8 | Type-safe JavaScript | SPFx 1.22.x supports v2.9 through v5.8. Default scaffolding uses 5.8. | HIGH -- verified via compatibility matrix and release notes |
| @fluentui/react | 8.x (latest 8.x) | UI component library | SPFx-native Fluent UI library. v9 (@fluentui/react-components) has TypeScript/React 17 compatibility issues in SPFx context. | HIGH -- v8 is the only officially supported Fluent UI for SPFx |
| @pnp/sp | 4.x | SharePoint REST API wrapper | Type-safe, built-in caching, community standard. v4 aligns with modern SPFx. | MEDIUM -- version verified from spec; exact latest minor not confirmed via npm (WebFetch blocked) |
| @pnp/spfx-controls-react | Latest 3.x | SharePoint-specific React controls | Provides ready-made controls like ListView, PeoplePicker, FilePicker etc. tailored for SPFx. | MEDIUM -- exact latest version not confirmed via npm |
| @microsoft/applicationinsights-web | Latest | Frontend telemetry | Application Insights SDK for browser-side tracking. MUST disable auto-dependency tracking. | HIGH -- pattern well-documented in SPFx community |
| @microsoft/applicationinsights-react-js | Latest | React integration for App Insights | ReactPlugin for component-level telemetry. | MEDIUM |
| @rushstack/heft | Latest | Build toolchain | Replaces Gulp as of SPFx 1.22. Config-driven build orchestrator. Installed globally + per-project. | HIGH -- verified via [Heft toolchain docs](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/sharepoint-framework-toolchain-rushstack-heft) |
| Webpack | (bundled by Heft) | Module bundler | Underlying bundling technology remains webpack, now orchestrated by Heft instead of Gulp. | HIGH |

### Backend: Azure Functions API

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| .NET | 10 LTS | Runtime | Released November 2025. LTS release (supported until Nov 2028). Uses C# 14. | HIGH -- verified via [.NET 10 overview](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-10/overview) |
| C# | 14 | Language | Ships with .NET 10. Features: field-backed properties, extension blocks, null-conditional assignment, partial constructors. | HIGH |
| Azure Functions | 4.x (Isolated Worker) | Serverless API host | Runtime v4.x GA. .NET 10 isolated worker requires `Microsoft.Azure.Functions.Worker` >= 2.50.0 and `Microsoft.Azure.Functions.Worker.Sdk` >= 2.0.5. | HIGH -- verified via [Azure Functions isolated worker guide](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide) |
| EF Core | 10 | ORM / data access | Ships with .NET 10 LTS. New features: named query filters, LeftJoin/RightJoin LINQ, improved parameterized collections. | HIGH -- verified via [EF Core 10 whatsnew](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-10.0/whatsnew) |
| MediatR | 12.x (latest) | CQRS mediator | Industry-standard .NET mediator. Pipeline behaviors for cross-cutting concerns (validation, logging, caching). | MEDIUM -- version inferred from training data; exact latest not confirmed |
| FluentValidation | 11.x (latest) | Input validation | Fluent API for validation rules. Integrates with MediatR pipeline. | MEDIUM -- version inferred from training data |
| Microsoft.ApplicationInsights.WorkerService | Latest | Backend telemetry | Application Insights for Azure Functions isolated worker. | HIGH |

### Database

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Azure SQL Database | Latest | Production database | Managed SQL Server. Handles tracking data (read confirmations, favorites, flags, approvals). Avoids SharePoint 5000-item threshold. | HIGH |
| Azure SQL Edge | Latest | Local dev database | Docker container for local development. SQL Server-compatible. Runs on ARM and x64. | HIGH |

### Infrastructure

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Azure Bicep | Latest | IaC (Infrastructure as Code) | Declarative Azure resource deployment. First-class VS Code support. Compiles to ARM templates. | HIGH -- verified via [Bicep overview](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview) |
| GitHub Actions | N/A | CI/CD pipeline | CI on PR, CD on merge to main. Standard for GitHub-hosted repos. | HIGH |
| Docker Compose | Latest | Local dev orchestration | Runs Azure SQL Edge container for local database. | HIGH |
| Azure Functions Core Tools | v4 | Local Functions runtime | `func start` for local API development. Matches Functions v4.x runtime. | HIGH |

### Testing

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Jest | Latest (Heft-integrated) | Frontend unit tests | SPFx 1.22 Heft toolchain integrates Jest natively. | HIGH |
| Playwright | Latest | E2E tests | Cross-browser testing. Works with SharePoint workbench and deployed sites. | MEDIUM |
| .NET Integration Tests | Built-in | Backend integration tests | xUnit/NUnit with WebApplicationFactory pattern for Azure Functions testing. | HIGH |

### Provisioning

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| PnP PowerShell | Latest | Site provisioning | Creates site, groups, columns, pages, navigation, sample data. Community standard for SharePoint provisioning. | HIGH |

---

## Critical Compatibility Notes

### SPFx 1.22.x Compatibility Matrix (VERIFIED)

Source: [Official Microsoft Compatibility Reference](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility) (updated March 11, 2026)

| Component | Required Version | Notes |
|-----------|-----------------|-------|
| Node.js | v22 LTS only | No other Node version is supported |
| TypeScript | v2.9 - v5.8 | Default scaffolding uses v5.8 |
| React | v17.0.1 (exact) | Use `--save-exact` flag. React 18 NOT supported. |
| Build toolchain | Heft (NOT Gulp) | Gulp is legacy. SPFx 1.22 defaults to Heft. |
| Generator | @microsoft/generator-sharepoint@latest | Install globally |

### Heft Toolchain (NEW in SPFx 1.22)

This is a MAJOR change from previous SPFx versions. Key facts:

1. **Heft replaces Gulp** as the build orchestrator. No more `gulpfile.js`.
2. **Webpack remains** the underlying bundler, now orchestrated through Heft.
3. **Configuration-driven**: `heft.json`, `rig.json`, `typescript.json` replace gulp tasks.
4. **SPFx rig package**: Shared configuration for all SPFx projects, reducing config duplication.
5. **Build commands**: `npm run build` / `npm run test` (not `gulp build` / `gulp serve`).
6. **Migration**: Existing Gulp customizations are NOT compatible. Must migrate to Heft plugins.
7. **Gulp `--use-gulp` fallback**: Available in 1.22 generator for legacy projects, will be removed in 1.24.
8. **Trust dev cert**: Use `heft trust-dev-cert` (not `gulp trust-dev-cert`).

Global installation:
```bash
npm install @rushstack/heft yo @microsoft/generator-sharepoint --global
```

### React 17 Constraint

SPFx 1.22.x locks React to 17.0.1. This means:
- No React 18 features (concurrent rendering, automatic batching, useId, Suspense for data fetching)
- No `createRoot` API -- must use `ReactDOM.render()`
- All third-party React libraries must be compatible with React 17
- Hooks work (introduced in React 16.8)
- React Context works
- Error Boundaries work (class component pattern only, but can wrap functional components)

### Fluent UI v8 vs v9

- **Use v8** (`@fluentui/react`): SPFx-native, fully compatible with React 17 and SPFx's TypeScript config.
- **DO NOT use v9** (`@fluentui/react-components`): Has React 17 + TypeScript compatibility issues in SPFx. v9 targets React 18+ and uses APIs not available in React 17.
- v8 is in maintenance mode (security/critical fixes only) but will be supported for the lifetime of SPFx versions that depend on it.
- Key v8 components: DetailsList, CommandBar, Panel, Dialog, Shimmer, DocumentCard, TextField, Dropdown, DatePicker, etc.

### Azure Functions .NET 10 Isolated Worker

Verified compatibility (source: [Azure Functions isolated worker docs](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide), updated March 5, 2026):

| Package | Minimum Version | Notes |
|---------|----------------|-------|
| Microsoft.Azure.Functions.Worker | 2.50.0 | Required for .NET 10 |
| Microsoft.Azure.Functions.Worker.Sdk | 2.0.5 | Required for .NET 10 |
| Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore | Latest 2.x | For HTTP triggers with ASP.NET Core integration |

**IMPORTANT**: .NET 10 on Azure Functions has a Linux Consumption plan restriction -- cannot run .NET 10 apps on Linux Consumption. Use Flex Consumption plan or App Service plan on Linux. Windows Consumption works fine.

The Functions 4.x runtime is the ONLY supported major version for new development. Functions 1.x ends support September 14, 2026. In-process model ends support November 10, 2026 -- isolated worker is the path forward.

### EF Core 10 with Azure SQL

Key new features relevant to this project:
- **Named query filters**: Multiple filters per entity with selective disabling (useful for soft-delete + tenant patterns)
- **LeftJoin/RightJoin LINQ**: First-class support replaces the complex SelectMany/GroupJoin/DefaultIfEmpty pattern
- **Improved parameterized collections**: Better default translation for `Contains()` queries (uses individual parameters instead of JSON arrays)
- **JSON type support**: Native `json` data type for Azure SQL (requires compatibility level 170 / SQL Server 2025)
- **ExecuteUpdateAsync for JSON**: Bulk update JSON properties without loading entities

**Note on JSON type**: The new native `json` data type requires Azure SQL Database or SQL Server 2025. If the Azure SQL tier does not support compatibility level 170, EF Core falls back to `nvarchar(max)` for JSON columns. For this project, standard `nvarchar(max)` JSON storage is fine since the JSON usage is limited to the TargetGroups column.

### PnPjs v4 with SPFx 1.22

PnPjs v4 is the current major version, designed for modern SPFx:
- Uses `@pnp/sp` and `@pnp/queryable` packages
- Built-in caching via `Caching` behavior (session storage or custom)
- Fluent API: `sp.web.lists.getByTitle("Site Pages").items()`
- SPFx integration via `spfi()` factory and `SPFx` behavior
- TypeScript-first with full type definitions

Key setup pattern for SPFx 1.22:
```typescript
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

// In web part onInit()
const sp = spfi().using(SPFx(this.context));
```

---

## Supporting Libraries (Detailed)

### Frontend (npm packages)

| Library | Purpose | When to Use | Notes |
|---------|---------|-------------|-------|
| @pnp/queryable | PnPjs query pipeline | Always (peer dep of @pnp/sp) | Core queryable behaviors including Caching |
| @pnp/logging | PnPjs logging | Optional but recommended | Lightweight logging for PnPjs operations |
| tslib | TypeScript runtime helpers | Always (peer dep) | Reduces bundle size by sharing helpers |
| office-ui-fabric-core | Fabric CSS classes | Only for non-React icon/CSS usage | Use @fluentui/react components instead when possible |

### Backend (NuGet packages)

| Package | Purpose | When to Use | Notes |
|---------|---------|-------------|-------|
| Microsoft.Azure.Functions.Worker | Functions SDK core | Always | >= 2.50.0 for .NET 10 |
| Microsoft.Azure.Functions.Worker.Sdk | Functions build SDK | Always | >= 2.0.5 for .NET 10 |
| Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore | HTTP trigger + ASP.NET Core | Always | Provides IActionResult, HttpRequest etc. |
| Microsoft.EntityFrameworkCore.SqlServer | EF Core SQL Server provider | Always | Matches EF Core 10 |
| Microsoft.EntityFrameworkCore.Design | EF Core migrations tooling | Dev dependency | Required for `dotnet ef migrations` commands |
| Microsoft.EntityFrameworkCore.Tools | EF Core CLI tools | Dev dependency | PMC commands for migrations |
| MediatR | CQRS mediator | Always | Pipeline behaviors, request/handler pattern |
| MediatR.Extensions.Microsoft.DependencyInjection | MediatR DI registration | Always | `AddMediatR()` extension method |
| FluentValidation | Validation rules | Always | Integrates via MediatR ValidationBehavior |
| FluentValidation.DependencyInjectionExtensions | FluentValidation DI | Always | `AddValidatorsFromAssembly()` |
| Microsoft.ApplicationInsights.WorkerService | App Insights for workers | Always | Telemetry for isolated worker |
| Microsoft.Azure.Functions.Worker.ApplicationInsights | Functions App Insights | Always | `ConfigureFunctionsApplicationInsights()` |
| Microsoft.Extensions.Caching.Memory | In-memory cache | Always | `IMemoryCache` for server-side caching |
| Microsoft.Identity.Web | Entra ID auth | Always | Validates bearer tokens from SPFx |
| Swashbuckle.AspNetCore | Swagger/OpenAPI | Dev/optional | API documentation during development |

---

## Alternatives Considered (and why NOT to use them)

| Category | Locked Choice | Alternative | Why NOT the Alternative |
|----------|---------------|-------------|------------------------|
| UI Framework | Fluent UI v8 | Fluent UI v9 | v9 requires React 18+, incompatible with SPFx 1.22's React 17.0.1. TypeScript issues in SPFx context. |
| React Version | 17.0.1 | React 18 | Locked by SPFx. Silent runtime failures with incompatible versions. No SPFx support for React 18. |
| Build Toolchain | Heft | Gulp | Gulp is legacy. Unsupported in SPFx 1.24+. Heft is the forward path. |
| .NET Hosting | Isolated Worker | In-Process Model | In-process model ends support Nov 10, 2026. Isolated worker is the only future-proof option. |
| SP API | PnPjs v4 | Raw SharePoint REST | PnPjs provides type safety, caching behaviors, fluent API. Raw REST requires manual error handling, no types. |
| Database | Azure SQL | SharePoint Lists | 5000-item threshold, no JOINs, no aggregation queries, poor indexing. Azure SQL eliminates all these limitations. |
| IaC | Bicep | ARM Templates (JSON) | Bicep compiles to ARM JSON but is significantly more readable, has IntelliSense, and supports modules. |
| IaC | Bicep | Terraform | Bicep is Azure-native, first-party supported, simpler for Azure-only projects. Terraform adds complexity for no benefit here. |
| State Management | React Context | Redux/MobX/Zustand | Overkill for this project. Context + custom hooks provide sufficient state management for per-webpart scope. No cross-tab state needed. |
| Data Fetching | Custom hooks | React Query/TanStack Query | React Query adds bundle size and complexity. Custom hooks with stale-while-revalidate pattern cover the caching needs. SPFx web parts have independent lifecycles that complicate shared query caches. |

---

## Installation

### Frontend (SPFx)

```bash
# 1. Global tooling
npm install @rushstack/heft yo @microsoft/generator-sharepoint --global

# 2. Scaffold project
yo @microsoft/generator-sharepoint
# Choose: React framework, TypeScript 5.8

# 3. Core dependencies (added by generator)
# @microsoft/sp-core-library
# @microsoft/sp-webpart-base
# @microsoft/sp-property-pane
# react@17.0.1 (--save-exact)
# react-dom@17.0.1 (--save-exact)
# @fluentui/react

# 4. Additional dependencies
npm install @pnp/sp @pnp/queryable @pnp/logging --save-exact
npm install @pnp/spfx-controls-react --save
npm install @microsoft/applicationinsights-web @microsoft/applicationinsights-react-js --save

# 5. Dev dependencies
npm install -D @types/react@17 @types/react-dom@17
```

### Backend (Azure Functions)

```bash
# 1. Create project
func init WissensHub.Api --dotnet-isolated --target-framework net10.0

# 2. Core NuGet packages
dotnet add package Microsoft.Azure.Functions.Worker --version 2.50.0
dotnet add package Microsoft.Azure.Functions.Worker.Sdk --version 2.0.5
dotnet add package Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package MediatR
dotnet add package FluentValidation.DependencyInjectionExtensions
dotnet add package Microsoft.ApplicationInsights.WorkerService
dotnet add package Microsoft.Azure.Functions.Worker.ApplicationInsights
dotnet add package Microsoft.Extensions.Caching.Memory
dotnet add package Microsoft.Identity.Web
```

### Local Development

```bash
# Docker for local database
docker compose up -d  # Starts Azure SQL Edge

# Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Start API locally
cd api && func start

# Start SPFx locally
cd spfx && npm run serve
```

---

## Known Issues and Gotchas

### SPFx 1.22.x

1. **Full-screen error overlay** (fixed in 1.22.1): SPFx 1.22.0 displayed a full-screen error overlay for runtime errors unrelated to third-party code. Fixed in 1.22.1.
2. **npm audit vulnerabilities** (addressed in 1.22.2): Monthly minor releases address npm audit findings in dev-only packages. These are NOT production runtime vulnerabilities.
3. **Class component scaffolding**: The Yeoman generator still scaffolds class components by default. Must manually convert to functional components with hooks after scaffolding.
4. **Heft learning curve**: All existing Gulp-based tutorials, blog posts, and Stack Overflow answers are now outdated for 1.22+. Refer only to Heft-based documentation.
5. **No `config.json` for externals**: External library configuration previously done via `config.json` must now use webpack-native patterns in Heft.

### React 17.0.1

1. **No automatic batching**: State updates in async handlers are not batched (React 18 feature). Multiple `setState` calls in an async function will cause multiple re-renders.
2. **Legacy ReactDOM.render**: Must use `ReactDOM.render()` not `createRoot()`. The `render` callback approach still works.
3. **useId not available**: The `useId` hook was introduced in React 18. Generate IDs manually for accessibility.

### Azure Functions (.NET 10 Isolated)

1. **Linux Consumption plan restriction**: .NET 10 cannot run on Linux Consumption plan. Use Flex Consumption, Premium, or Dedicated (App Service) plans on Linux. Windows Consumption works.
2. **2.x package versions**: .NET 10 requires the 2.x versions of `Microsoft.Azure.Functions.Worker` and `.Sdk`. The 1.x versions will NOT work.
3. **FunctionsApplication.CreateBuilder pattern**: The 2.x packages use `FunctionsApplication.CreateBuilder(args)` instead of the older `HostBuilder` pattern.

### Application Insights in SPFx

1. **CRITICAL COST ISSUE**: Auto-dependency tracking in SPFx logs every SharePoint background HTTP call. This can generate millions of telemetry rows and cost thousands of dollars per month. MUST disable `disableFetchTracking: true` and `disableAjaxTracking: true`.
2. **Only track custom events and exceptions** in the frontend. Let the backend handle operational telemetry.

---

## Version Pinning Strategy

| Component | Pin Strategy | Rationale |
|-----------|-------------|-----------|
| React | `--save-exact` 17.0.1 | SPFx requirement. Even patch differences can cause issues. |
| SPFx packages | `--save-exact` 1.22.2 | Must match across all @microsoft/sp-* packages |
| Node.js | Use `.nvmrc` with `22` | Ensures all developers use correct Node version |
| .NET | `net10.0` in .csproj | TFM locks the runtime version |
| EF Core | Match .NET version (10.x) | EF Core and .NET versions must align for LTS |

---

## Sources

- [SPFx 1.22 Release Notes](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/release-1.22) -- Released Dec 10, 2025
- [SPFx 1.22.1 Release Notes](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/release-1.22.1) -- Released Dec 15, 2025
- [SPFx 1.22.2 Release Notes](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/release-1.22.2) -- Released Jan 28, 2026
- [SPFx Compatibility Matrix](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility) -- Updated Mar 11, 2026
- [SPFx Dev Environment Setup](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-development-environment) -- Updated Dec 11, 2025
- [Heft-based Toolchain](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/sharepoint-framework-toolchain-rushstack-heft) -- Updated Dec 10, 2025
- [.NET 10 Overview](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-10/overview) -- Updated Jan 23, 2026
- [EF Core 10 What's New](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-10.0/whatsnew) -- Updated Jan 22, 2026
- [Azure Functions Isolated Worker Guide](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide) -- Updated Mar 5, 2026
- [Azure Functions Runtime Versions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-versions) -- Updated Aug 11, 2025
- [Azure Bicep Overview](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview) -- Updated Jan 8, 2026
- [Fluent UI / Office UI Fabric in SPFx](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/office-ui-fabric-integration) -- Reference documentation
