# Phase 1: Project Scaffolding & Local Dev - Research

**Researched:** 2026-03-14
**Domain:** SPFx 1.22.2 + .NET 10 Azure Functions + EF Core 10 + Docker SQL local dev
**Confidence:** HIGH

## Summary

Phase 1 is a greenfield scaffolding phase that establishes the full-stack local development environment. The three technology pillars are: (1) SPFx 1.22.2 with the new Heft-based build toolchain (replacing Gulp), React 17.0.1, TypeScript 5.8, and Node.js 22 LTS; (2) .NET 10 Azure Functions Isolated Worker with Clean Architecture (4 projects) and EF Core 10 for data access; (3) Docker Compose with a SQL Server container for local database development.

A critical discovery is that Azure SQL Edge was **retired on September 30, 2025** and has **dropped ARM64 platform support**. Since the developer is on macOS (Darwin/Apple Silicon), the Docker Compose configuration should use `mcr.microsoft.com/mssql/server:2022-latest` with Rosetta 2 emulation via Docker Desktop instead. This is functionally equivalent for EF Core development and avoids depending on a retired product. The CONTEXT.md decision says "Azure SQL Edge" but the planner should use the SQL Server 2022 image as the practical implementation, noting the retirement.

SPFx 1.22.2 uses Heft (not Gulp) for all build operations. The key commands are `heft start` (dev serve), `heft build` (compile+bundle), `heft test` (run tests), and `heft package-solution` (create .sppkg). The Yeoman generator still scaffolds class components by default, so each web part and the Application Customizer must be manually converted to functional components with hooks after scaffolding.

**Primary recommendation:** Scaffold the SPFx solution first (all 5 components), convert to functional components, then scaffold the .NET Clean Architecture backend, then wire up Docker Compose and EF Core migrations last.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Side-by-side top-level folders: /spfx, /api, /docker, /scripts, /infra, /.github, /.planning
- No shared types folder -- SPFx defines its own TypeScript interfaces, API defines its own C# DTOs. HTTP interface is the contract.
- .NET backend Clean Architecture: 4 projects (WissensHub.Functions, WissensHub.Application, WissensHub.Domain, WissensHub.Infrastructure) + WissensHub.Tests
- Solution file at /api/WissensHub.sln
- Scaffold ALL 4 web parts + 1 Application Customizer as empty shells: Dashboard, ArticleSidebar, Freigabecenter, AdminPanel, UnreadBadge
- Each component converted to functional component with hooks immediately
- No prefix on class names: DashboardWebPart, ArticleSidebarWebPart (not WissensHubDashboardWebPart)
- Minimal placeholder content: component name, Fluent UI icon, property pane title config -- no feature code
- Empty common folder skeleton: spfx/src/common/{models,services,hooks,components}/
- 7 tables + 1 junction table: ArticleMetadata, ReadConfirmations, ArticleFlags, Favorites, ApprovalHistory, Categories, TargetGroups, ArticleTargetGroups
- User identity: Entra Object ID (GUID string, nvarchar(36)) as UserId
- Docker Compose runs SQL ONLY -- SPFx and Azure Functions run natively on host
- Root package.json with concurrently: npm run dev, db:up, db:migrate, spfx:serve, api:start
- EF Core migrations are manual (not auto-applied on startup)
- First-time setup: docker compose up -> db:migrate -> dev

### Claude's Discretion
- Azure Functions local port assignment (likely 7071 default)
- SQL container configuration details (SA password, container name)
- Exact EF Core entity configuration specifics (index strategies, cascade behaviors)
- SPFx solution name and package metadata
- .gitignore contents
- Root package.json exact concurrently configuration

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | SPFx 1.22.2 solution scaffolded with Heft toolchain, Node.js 22 LTS, React 17, TypeScript 5.8 | Compatibility matrix confirmed: SPFx 1.22.2 = Node.js 22, React 17.0.1, TS 5.8, Heft default. Yeoman generator `@microsoft/generator-sharepoint@latest` scaffolds Heft projects by default. |
| INFRA-02 | All scaffolded class components converted to functional components with hooks | Yeoman still generates class components. Conversion pattern documented: remove class syntax, use `React.FunctionComponent<IProps>`, replace lifecycle methods with `useState`/`useEffect` hooks. |
| INFRA-03 | Azure Functions project (.NET 10, Isolated Worker, C# 14) with EF Core 10 | .NET 10 GA (Nov 2025), SDK 10.0.201. Isolated Worker requires `Microsoft.Azure.Functions.Worker` v2.50.0+. EF Core 10.0.3 stable. `FunctionsApplication.CreateBuilder(args)` pattern in Program.cs. |
| INFRA-04 | Azure SQL database schema via EF Core code-first migrations (7 tables + junction table) | EF Core 10 code-first with `dotnet ef migrations add` / `dotnet ef database update`. Connection string targets localhost:1433 Docker container. Entity configurations in Infrastructure project. |
| INFRA-05 | Docker Compose with SQL for local development | Azure SQL Edge retired Sep 2025, ARM64 dropped. Use `mcr.microsoft.com/mssql/server:2022-latest` with Rosetta 2 on Docker Desktop for macOS Apple Silicon. Functionally equivalent for EF Core. |
</phase_requirements>

## Standard Stack

### Core

| Library/Tool | Version | Purpose | Why Standard |
|-------------|---------|---------|--------------|
| @microsoft/generator-sharepoint | 1.22.2 | SPFx Yeoman generator | Official Microsoft generator, scaffolds Heft projects by default |
| Node.js | 22 LTS | JavaScript runtime for SPFx | Required by SPFx 1.22.2 compatibility matrix |
| React | 17.0.1 | UI library (SPFx-locked) | Exact version required by SPFx 1.22.2 -- must use `--save-exact` |
| TypeScript | 5.8 | Type system (SPFx default) | Scaffolded default in SPFx 1.22.2 |
| Heft | (bundled via SPFx rig) | Build orchestrator | Replaced Gulp in SPFx 1.22, config-driven, zero npm audit issues |
| .NET SDK | 10.0.201 | Backend runtime | .NET 10 GA LTS (Nov 2025), required for EF Core 10 |
| Microsoft.Azure.Functions.Worker | 2.50.0+ | Azure Functions isolated worker | Required minimum for .NET 10 target |
| Microsoft.Azure.Functions.Worker.Sdk | 2.0.5+ | Functions SDK tooling | Required minimum for .NET 10 target |
| Microsoft.EntityFrameworkCore.SqlServer | 10.0.3 | SQL Server EF Core provider | Latest stable, matches .NET 10 TFM |
| Microsoft.EntityFrameworkCore.Design | 10.0.3 | EF Core migration tooling | Required for `dotnet ef` commands |
| Microsoft.EntityFrameworkCore.Tools | 10.0.3+ | CLI migration tools | `dotnet tool install --global dotnet-ef` |
| Docker Desktop | latest | Container runtime | Required for SQL Server container on macOS |
| mcr.microsoft.com/mssql/server | 2022-latest | SQL Server Docker image | Replaces retired Azure SQL Edge; works via Rosetta 2 on Apple Silicon |
| Azure Functions Core Tools | v4 | Local Functions runtime | `func start` to run Functions locally on port 7071 |

### Supporting

| Library/Tool | Version | Purpose | When to Use |
|-------------|---------|---------|-------------|
| concurrently | 9.x | Run multiple npm scripts in parallel | Root package.json `dev` script to start SPFx + API simultaneously |
| @fluentui/react | 8.x (bundled with SPFx) | UI components | Placeholder content (icons) in scaffolded web parts |
| @microsoft/sp-application-base | 1.22.2 | Application Customizer base | UnreadBadge extension scaffold |
| MediatR | 12.x | CQRS mediator | Installed now in Application project, actual handlers in Phase 4 |
| FluentValidation | 11.x | Request validation | Installed now, actual validators in Phase 4 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SQL Server 2022 Docker | Azure SQL Edge Docker | SQL Edge retired Sep 2025, ARM64 dropped. SQL Server 2022 via Rosetta is the current standard. |
| SQL Server 2022 Docker | SQL Server 2025 Docker | SQL Server 2025 has AVX instruction issues on Apple Silicon Docker Desktop; OrbStack works but adds dependency. Stick with 2022 for widest compatibility. |
| Heft toolchain | Gulp toolchain (--use-gulp) | Gulp is legacy, unsupported from SPFx 1.24. Heft is the future. |
| concurrently | npm-run-all2 | concurrently has better output prefixing and is more widely used (1956 dependents). |

**Installation (SPFx):**
```bash
# Global tools (one-time)
npm install -g yo @microsoft/generator-sharepoint@latest

# Scaffold SPFx solution
cd spfx
yo @microsoft/sharepoint
# Follow prompts: solution name, web part name, React framework
```

**Installation (.NET):**
```bash
# Global tools (one-time)
dotnet tool install --global dotnet-ef

# Create solution and projects
cd api
dotnet new sln -n WissensHub
dotnet new func -n WissensHub.Functions --framework net10.0 --worker-runtime dotnet-isolated
dotnet new classlib -n WissensHub.Application --framework net10.0
dotnet new classlib -n WissensHub.Domain --framework net10.0
dotnet new classlib -n WissensHub.Infrastructure --framework net10.0
dotnet new xunit -n WissensHub.Tests --framework net10.0
```

## Architecture Patterns

### Recommended Project Structure
```
wissens-hub/
├── .github/                   # GitHub Actions (Phase 12)
├── .planning/                 # GSD planning files
├── spfx/                      # SPFx solution root
│   ├── config/                # SPFx config files
│   ├── src/
│   │   ├── webparts/
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardWebPart.ts
│   │   │   │   ├── components/
│   │   │   │   │   └── Dashboard.tsx        # Functional component
│   │   │   │   ├── loc/
│   │   │   │   └── DashboardWebPart.manifest.json
│   │   │   ├── articleSidebar/
│   │   │   ├── freigabecenter/
│   │   │   └── adminPanel/
│   │   ├── extensions/
│   │   │   └── unreadBadge/
│   │   │       ├── UnreadBadgeApplicationCustomizer.ts
│   │   │       ├── components/              # React component for badge UI
│   │   │       └── loc/
│   │   └── common/
│   │       ├── models/                      # Empty skeleton for Phase 3
│   │       ├── services/                    # Empty skeleton for Phase 3
│   │       ├── hooks/                       # Empty skeleton for Phase 3
│   │       └── components/                  # Empty skeleton for Phase 3
│   ├── heft.json                            # Heft config (auto-generated)
│   ├── rig.json                             # SPFx rig reference
│   ├── tsconfig.json
│   └── package.json
├── api/                       # .NET backend
│   ├── WissensHub.sln
│   ├── src/
│   │   ├── WissensHub.Functions/            # Entry point, DI config
│   │   │   ├── Program.cs
│   │   │   ├── host.json
│   │   │   ├── local.settings.json
│   │   │   ├── Functions/
│   │   │   │   └── HealthFunction.cs
│   │   │   └── WissensHub.Functions.csproj
│   │   ├── WissensHub.Application/          # MediatR, CQRS (Phase 4)
│   │   │   └── WissensHub.Application.csproj
│   │   ├── WissensHub.Domain/               # Entities, enums
│   │   │   ├── Entities/
│   │   │   │   ├── ArticleMetadata.cs
│   │   │   │   ├── ReadConfirmation.cs
│   │   │   │   ├── ArticleFlag.cs
│   │   │   │   ├── Favorite.cs
│   │   │   │   ├── ApprovalHistory.cs
│   │   │   │   ├── Category.cs
│   │   │   │   ├── TargetGroup.cs
│   │   │   │   └── ArticleTargetGroup.cs
│   │   │   └── WissensHub.Domain.csproj
│   │   └── WissensHub.Infrastructure/       # EF Core, repositories
│   │       ├── Data/
│   │       │   ├── WissensHubDbContext.cs
│   │       │   └── Configurations/
│   │       │       ├── ArticleMetadataConfiguration.cs
│   │       │       ├── ReadConfirmationConfiguration.cs
│   │       │       └── ...
│   │       ├── Migrations/                  # EF Core auto-generated
│   │       └── WissensHub.Infrastructure.csproj
│   └── tests/
│       └── WissensHub.Tests/
│           └── WissensHub.Tests.csproj
├── docker/
│   └── docker-compose.yml
├── scripts/                   # PowerShell provisioning (Phase 2)
├── infra/                     # Bicep IaC (Phase 12)
├── package.json               # Root orchestration with concurrently
├── .gitignore
└── wissens-hub-spec.md        # Existing spec file
```

### Pattern 1: SPFx Functional Component with Hooks
**What:** Convert Yeoman-scaffolded class components to functional components
**When to use:** All web part React components (INFRA-02)
**Example:**
```typescript
// Source: PnP community pattern, Microsoft Learn SPFx docs
// File: spfx/src/webparts/dashboard/components/Dashboard.tsx

import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';

export interface IDashboardProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}

const Dashboard: React.FunctionComponent<IDashboardProps> = (props) => {
  const { description, hasTeamsContext, userDisplayName } = props;

  return (
    <section>
      <Icon iconName="ViewDashboard" />
      <h2>Dashboard</h2>
      <p>{description}</p>
    </section>
  );
};

export default Dashboard;
```

```typescript
// File: spfx/src/webparts/dashboard/DashboardWebPart.ts
// The WebPart class itself stays as a class (SPFx requirement)
// but renders a functional component

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import Dashboard, { IDashboardProps } from './components/Dashboard';

export default class DashboardWebPart extends BaseClientSideWebPart<IDashboardWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IDashboardProps> = React.createElement(
      Dashboard,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
      }
    );
    ReactDom.render(element, this.domElement);
  }
}
```

### Pattern 2: .NET Isolated Worker Azure Functions with DI
**What:** Azure Functions Program.cs with EF Core dependency injection
**When to use:** WissensHub.Functions entry point (INFRA-03)
**Example:**
```csharp
// Source: Microsoft Learn - Azure Functions isolated worker guide
// File: api/src/WissensHub.Functions/Program.cs

using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using WissensHub.Infrastructure.Data;

var builder = FunctionsApplication.CreateBuilder(args);

// Register EF Core DbContext
builder.Services.AddDbContext<WissensHubDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

var host = builder.Build();
host.Run();
```

### Pattern 3: EF Core Entity Configuration (Fluent API)
**What:** Separate configuration classes for each entity
**When to use:** All 7+1 tables in Infrastructure project (INFRA-04)
**Example:**
```csharp
// Source: Microsoft Learn - EF Core entity configuration
// File: api/src/WissensHub.Infrastructure/Data/Configurations/ArticleMetadataConfiguration.cs

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WissensHub.Domain.Entities;

public class ArticleMetadataConfiguration : IEntityTypeConfiguration<ArticleMetadata>
{
    public void Configure(EntityTypeBuilder<ArticleMetadata> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.PageId).IsRequired();
        builder.Property(a => a.Status).IsRequired().HasMaxLength(50);
        builder.Property(a => a.IsMandatory).HasDefaultValue(false);

        builder.HasOne(a => a.Category)
            .WithMany(c => c.Articles)
            .HasForeignKey(a => a.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(a => a.ArticleTargetGroups)
            .WithOne(atg => atg.ArticleMetadata)
            .HasForeignKey(atg => atg.ArticleMetadataId);

        builder.HasIndex(a => a.PageId).IsUnique();
    }
}
```

### Pattern 4: Docker Compose for Local SQL
**What:** SQL Server 2022 container for local EF Core development
**When to use:** Local development environment (INFRA-05)
**Example:**
```yaml
# Source: Microsoft Learn - SQL Server containers on macOS
# File: docker/docker-compose.yml

services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: wissenshub-sql
    platform: linux/amd64
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=WissensHub_Dev2026!
      - MSSQL_PID=Developer
    ports:
      - "1433:1433"
    volumes:
      - sqldata:/var/opt/mssql

volumes:
  sqldata:
```

### Anti-Patterns to Avoid
- **Using Gulp commands with SPFx 1.22:** Gulp is legacy. Always use `heft start`, `heft build`, `heft test`, `heft package-solution`. Never install gulp or reference gulpfile.js in a new 1.22 project.
- **Auto-applying EF Core migrations on startup:** The user explicitly decided migrations are manual. Do NOT put `context.Database.Migrate()` in Program.cs or startup code.
- **Putting entities in the Infrastructure project:** Domain entities belong in WissensHub.Domain. Infrastructure depends on Domain, not the other way around.
- **Using React 18 or Fluent UI v9:** SPFx 1.22.2 is locked to React 17.0.1. Using incompatible versions causes silent runtime failures.
- **Running SPFx/Functions inside Docker:** The user decided these run natively on the host. Only SQL runs in Docker.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SPFx build system | Custom webpack config | Heft + SPFx rig | SPFx rig handles manifest generation, localization, bundling. Ejecting webpack is escape hatch only. |
| SQL Server for local dev | Install SQL Server natively on macOS | Docker Compose + SQL Server 2022 image | Zero-install, disposable, matches production Azure SQL. |
| EF Core migration runner | Custom SQL scripts | `dotnet ef migrations add` / `dotnet ef database update` | EF Core handles schema diffing, rollbacks, idempotent scripts. |
| Parallel process runner | Custom shell scripts | `concurrently` npm package | Handles process lifecycle, output prefixing, color coding, error propagation. |
| SPFx project scaffold | Manual file creation | Yeoman `yo @microsoft/sharepoint` | Generates correct heft.json, rig.json, manifest files, config structure. Adding web parts to existing solution is fast via re-running Yeoman. |
| Functions project scaffold | Manual csproj creation | `dotnet new func --worker-runtime dotnet-isolated` | Generates correct Program.cs, host.json, local.settings.json with proper package references. |

**Key insight:** Phase 1 is about scaffolding -- let the generators do the heavy lifting. Manual intervention is only needed for: (1) converting class to functional components, (2) creating the Clean Architecture project structure, and (3) writing EF Core entity configurations.

## Common Pitfalls

### Pitfall 1: Azure SQL Edge Retirement
**What goes wrong:** Developer uses `mcr.microsoft.com/azure-sql-edge` in Docker Compose. Image may stop being available, has dropped ARM64 support, and is unsupported.
**Why it happens:** Many tutorials and older SPFx+Azure guides reference SQL Edge for Apple Silicon development.
**How to avoid:** Use `mcr.microsoft.com/mssql/server:2022-latest` with `platform: linux/amd64`. Docker Desktop on macOS uses Rosetta 2 for x86 emulation. Performance is comparable (under 6 seconds for typical operations on M1).
**Warning signs:** Docker pull failures, container crash on Apple Silicon, deprecation warnings.

### Pitfall 2: React Version Mismatch in SPFx
**What goes wrong:** Installing React 18 or a different patch version causes silent runtime failures with no clear build errors.
**Why it happens:** npm resolves to latest compatible version unless pinned.
**How to avoid:** Use `--save-exact` flag: `npm install react@17.0.1 react-dom@17.0.1 --save-exact`. The Yeoman generator handles this, but verify after any manual package changes.
**Warning signs:** Components not rendering, cryptic "hooks can only be called inside the body of a function component" errors.

### Pitfall 3: SPFx WebPart Class Must Stay as Class
**What goes wrong:** Developer tries to convert the WebPart class itself (e.g., DashboardWebPart.ts) to a functional component.
**Why it happens:** INFRA-02 says "convert to functional components" -- easy to misinterpret.
**How to avoid:** The WebPart class that extends `BaseClientSideWebPart` MUST remain a class. Only the React UI component (e.g., Dashboard.tsx) is converted to functional. The WebPart class acts as the mounting point.
**Warning signs:** TypeScript errors about missing lifecycle methods, SPFx runtime failures.

### Pitfall 4: EF Core Design-Time DbContext Issues with Azure Functions
**What goes wrong:** `dotnet ef migrations add` fails because it cannot find or instantiate the DbContext.
**Why it happens:** Azure Functions isolated worker uses `FunctionsApplication.CreateBuilder()` instead of the standard `WebApplication.CreateBuilder()` that EF Core tools expect.
**How to avoid:** Add an `IDesignTimeDbContextFactory<WissensHubDbContext>` implementation in the Infrastructure project. This tells EF Core tools how to create the context at design time independently of the Functions runtime.
**Warning signs:** "Unable to create a 'DbContext' of type 'WissensHubDbContext'" error when running migration commands.

### Pitfall 5: Clean Architecture Project Reference Direction
**What goes wrong:** Circular dependencies or incorrect dependency flow between the 4 projects.
**Why it happens:** Easy to accidentally reference Functions from Domain, or Infrastructure from Application.
**How to avoid:** Strict reference chain: Functions -> Application -> Domain; Functions -> Infrastructure -> Domain. Application NEVER references Infrastructure. Infrastructure implements interfaces defined in Application/Domain.
**Warning signs:** Build errors, circular reference warnings, "onion" violations.

### Pitfall 6: Docker Volume Mounting on macOS
**What goes wrong:** SQL Server data is lost when container restarts, or volume mounting causes permission issues.
**Why it happens:** Docker Desktop for Mac has known volume performance and permission differences from Linux.
**How to avoid:** Use named Docker volumes (not bind mounts) for SQL data: `volumes: sqldata:/var/opt/mssql`. Named volumes are managed by Docker and avoid macOS file system permission issues.
**Warning signs:** Database resets on restart, permission denied errors in container logs.

### Pitfall 7: Missing --startup-project for EF Core Commands
**What goes wrong:** `dotnet ef` commands fail or target the wrong project.
**Why it happens:** In a multi-project solution, EF Core tools need to know both the project with migrations AND the startup project.
**How to avoid:** Always specify both: `dotnet ef migrations add InitialCreate --project src/WissensHub.Infrastructure --startup-project src/WissensHub.Functions`
**Warning signs:** "No DbContext was found" or migrations generated in wrong project.

## Code Examples

### Health Check Function (.NET 10 Isolated Worker)
```csharp
// Source: Microsoft Learn - Azure Functions HTTP trigger
// File: api/src/WissensHub.Functions/Functions/HealthFunction.cs

using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;

namespace WissensHub.Functions.Functions;

public class HealthFunction
{
    [Function("Health")]
    public HttpResponseData Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "health")] HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);
        response.Headers.Add("Content-Type", "application/json");
        response.WriteString("""{"status":"healthy","timestamp":""" + $"\"{DateTime.UtcNow:O}\"" + "}");
        return response;
    }
}
```

### Design-Time DbContext Factory (Critical for EF Core + Functions)
```csharp
// Source: EF Core docs - Design-time DbContext creation
// File: api/src/WissensHub.Infrastructure/Data/DesignTimeDbContextFactory.cs

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace WissensHub.Infrastructure.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<WissensHubDbContext>
{
    public WissensHubDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<WissensHubDbContext>();
        optionsBuilder.UseSqlServer(
            "Server=localhost,1433;Database=WissensHub;User Id=sa;Password=WissensHub_Dev2026!;TrustServerCertificate=True;");

        return new WissensHubDbContext(optionsBuilder.Options);
    }
}
```

### WissensHubDbContext with Entity Configurations
```csharp
// Source: EF Core docs - DbContext configuration
// File: api/src/WissensHub.Infrastructure/Data/WissensHubDbContext.cs

using Microsoft.EntityFrameworkCore;
using WissensHub.Domain.Entities;

namespace WissensHub.Infrastructure.Data;

public class WissensHubDbContext : DbContext
{
    public WissensHubDbContext(DbContextOptions<WissensHubDbContext> options)
        : base(options) { }

    public DbSet<ArticleMetadata> ArticleMetadata => Set<ArticleMetadata>();
    public DbSet<ReadConfirmation> ReadConfirmations => Set<ReadConfirmation>();
    public DbSet<ArticleFlag> ArticleFlags => Set<ArticleFlag>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<ApprovalHistory> ApprovalHistory => Set<ApprovalHistory>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<TargetGroup> TargetGroups => Set<TargetGroup>();
    public DbSet<ArticleTargetGroup> ArticleTargetGroups => Set<ArticleTargetGroup>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(WissensHubDbContext).Assembly);
    }
}
```

### Domain Entity Example
```csharp
// File: api/src/WissensHub.Domain/Entities/ArticleMetadata.cs

namespace WissensHub.Domain.Entities;

public class ArticleMetadata
{
    public int Id { get; set; }
    public int PageId { get; set; }
    public string Status { get; set; } = "Draft";
    public int? CategoryId { get; set; }
    public bool IsMandatory { get; set; }
    public string? ReviewById { get; set; }         // Entra Object ID
    public DateTime? ReviewByDate { get; set; }
    public int ContentVersion { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Category? Category { get; set; }
    public ICollection<ArticleTargetGroup> ArticleTargetGroups { get; set; } = [];
    public ICollection<ReadConfirmation> ReadConfirmations { get; set; } = [];
    public ICollection<ArticleFlag> ArticleFlags { get; set; } = [];
    public ICollection<Favorite> Favorites { get; set; } = [];
    public ICollection<ApprovalHistory> ApprovalHistories { get; set; } = [];
}
```

### Root package.json with Concurrently
```json
{
  "name": "wissens-hub",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently -n spfx,api -c blue,green \"npm run spfx:serve\" \"npm run api:start\"",
    "spfx:serve": "cd spfx && npm run start",
    "api:start": "cd api/src/WissensHub.Functions && func start",
    "db:up": "docker compose -f docker/docker-compose.yml up -d",
    "db:down": "docker compose -f docker/docker-compose.yml down",
    "db:migrate": "cd api && dotnet ef database update --project src/WissensHub.Infrastructure --startup-project src/WissensHub.Functions"
  },
  "devDependencies": {
    "concurrently": "^9.2.1"
  }
}
```

### SPFx Heft Package.json Scripts (Auto-Generated)
```json
{
  "scripts": {
    "build": "heft test --clean --production && heft package-solution --production",
    "start": "heft start --clean",
    "clean": "heft clean",
    "test": "heft test --clean",
    "eject-webpack": "heft eject-webpack"
  }
}
```

### local.settings.json for Azure Functions
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=WissensHub;User Id=sa;Password=WissensHub_Dev2026!;TrustServerCertificate=True;"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Gulp-based SPFx build | Heft-based SPFx build | SPFx 1.22 (Dec 2025) | All `gulp` commands replaced with `heft` commands. No gulpfile.js in new projects. |
| Azure SQL Edge for macOS ARM | SQL Server 2022 via Rosetta 2 | SQL Edge retired Sep 2025 | Must use `mcr.microsoft.com/mssql/server:2022-latest` with `platform: linux/amd64` |
| Azure Functions in-process model | Isolated worker model | Mandatory by Nov 2026 | `FunctionsApplication.CreateBuilder(args)` replaces `FunctionsStartup`. Standard DI patterns. |
| .NET 8 LTS | .NET 10 LTS | Nov 2025 GA | C# 14 features, EF Core 10, supported until Nov 2028 |
| EF Core 8 | EF Core 10 | Nov 2025 | JSON column type changes (nvarchar(max) -> json with UseAzureSql), new `--add` flag for migrations |

**Deprecated/outdated:**
- **Azure SQL Edge:** Retired Sep 2025, ARM64 dropped. Do not use for new projects.
- **Gulp-based SPFx toolchain:** Will be unsupported from SPFx 1.24. Already legacy in 1.22.
- **Azure Functions in-process model:** End of support Nov 10, 2026. Isolated worker is the only path forward.
- **SPFx `config.json` for externals:** Eliminated in Heft toolchain. Use webpack-native configuration instead.

## Open Questions

1. **Exact Yeoman prompts for SPFx 1.22.2 solution name**
   - What we know: Generator asks for solution name, component name, framework choice (React), template type
   - What's unclear: Whether the generator prompts have changed in 1.22.2 vs earlier versions (new template options?)
   - Recommendation: Use defaults and follow the locked naming convention (no prefix). Solution name could be "wissens-hub" or "wissens-hub-spfx".

2. **MediatR and FluentValidation exact versions for .NET 10**
   - What we know: MediatR 12.x and FluentValidation 11.x are the current major versions
   - What's unclear: Whether latest patches are fully compatible with .NET 10 (likely yes, but unverified)
   - Recommendation: Install latest stable versions. These are only placeholders in Phase 1 -- actual usage starts in Phase 4.

3. **Docker Desktop Rosetta 2 performance on specific Apple Silicon generation**
   - What we know: Performance is comparable on M1 (under 6 seconds for typical DB operations per Azure SQL Dev Corner blog)
   - What's unclear: Developer's specific Mac model and whether Docker Desktop Rosetta is already enabled
   - Recommendation: Document Rosetta 2 enablement in Docker Desktop settings as a prerequisite step.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (SPFx, bundled with Heft) + xUnit (API, WissensHub.Tests) |
| Config file | SPFx: auto-configured via Heft rig; API: none yet (Wave 0) |
| Quick run command | SPFx: `cd spfx && heft test --clean`; API: `cd api && dotnet test` |
| Full suite command | `cd spfx && heft test --clean && cd ../api && dotnet test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | SPFx solution builds with Heft | smoke | `cd spfx && heft build --clean` | N/A -- build command itself is the test |
| INFRA-01 | SPFx serves to local workbench | manual-only | `cd spfx && heft start --clean` then visit localhost:4321 | Manual verification |
| INFRA-02 | Components are functional (no class components in .tsx) | smoke | Grep for `extends React.Component` in src/ -- should find zero matches | Wave 0 script |
| INFRA-03 | Azure Functions starts and /api/health responds | smoke | `cd api/src/WissensHub.Functions && func start & sleep 5 && curl http://localhost:7071/api/health` | Wave 0 script |
| INFRA-04 | EF Core migrations apply successfully | smoke | `npm run db:migrate` (after db:up) | Wave 0 script |
| INFRA-04 | All 5 core + 2 config tables exist | unit | `cd api && dotnet test --filter "DatabaseSchema"` | Wave 0: tests/WissensHub.Tests/Infrastructure/DatabaseSchemaTests.cs |
| INFRA-05 | Docker Compose starts SQL Server | smoke | `docker compose -f docker/docker-compose.yml up -d && docker compose -f docker/docker-compose.yml ps` | N/A -- docker command itself is the test |

### Sampling Rate
- **Per task commit:** `cd spfx && heft build --clean` + `cd api && dotnet build`
- **Per wave merge:** Full suite: SPFx build + API build + dotnet test + db:migrate
- **Phase gate:** All success criteria verified before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `api/tests/WissensHub.Tests/Infrastructure/DatabaseSchemaTests.cs` -- verify all 8 tables exist after migration
- [ ] Smoke script: verify /api/health returns 200
- [ ] Smoke script: grep for `extends React.Component` in spfx/src/**/*.tsx to confirm functional conversion

## Sources

### Primary (HIGH confidence)
- [SPFx v1.22 release notes - Microsoft Learn](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/release-1.22) - Release date, TypeScript 5.8, Heft default, npm audit clean
- [SPFx Compatibility Reference - Microsoft Learn](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility) - Confirmed: SPFx 1.22.2 = Node.js 22, React 17.0.1, TS v2.9-v5.8
- [SPFx Heft-based Toolchain - Microsoft Learn](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/sharepoint-framework-toolchain-rushstack-heft) - Heft commands, rig concept, config files, migration timeline
- [Azure Functions Isolated Worker Guide - Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide) - .NET 10 min packages (Worker 2.50.0+, Sdk 2.0.5+), Program.cs pattern, DI
- [Azure SQL Edge Retirement - Microsoft Azure](https://azure.microsoft.com/en-us/updates/?id=azure-sql-edge-retirement) - Retired Sep 30, 2025
- [Azure SQL Edge Docker Deployment - Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-sql-edge/disconnected-deployment) - "Azure SQL Edge no longer supports the ARM64 platform"
- [EF Core 10 What's New - Microsoft Learn](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-10.0/whatsnew) - EF Core 10 requires .NET 10 runtime
- [NuGet: Microsoft.EntityFrameworkCore.SqlServer 10.0.3](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.sqlserver/) - Latest stable version
- [.NET 10 GA Announcement - Microsoft .NET Blog](https://devblogs.microsoft.com/dotnet/announcing-dotnet-10/) - GA Nov 11, 2025, LTS until Nov 2028
- [SQL Server containers on macOS - Azure SQL Dev Corner](https://devblogs.microsoft.com/azure-sql/development-with-sql-in-containers-on-macos/) - Docker Desktop Rosetta 2 emulation, SQL Server 2022 image, performance benchmarks

### Secondary (MEDIUM confidence)
- [SPFx 1.22 Heft Build Commands - n8d.at](https://n8d.at/npm-scripts-for-spfx-stop-memorizing-heft-flags/) - package.json script patterns
- [SPFx Heft Transition - Nanddeep Nachan Blogs](https://nanddeepnachanblogs.com/posts/2025-11-13-spfx-heft-transition/) - Heft command details, --production flag
- [Clean Architecture Azure Functions - Medium](https://medium.com/@yusufsarikaya023/clean-architecture-in-serverless-azure-function-713582c7dc9b) - 4-layer pattern validation
- [PnP Blog: SPFx Functional Components](https://pnp.github.io/blog/post/spfx-webpart-using-react-functional-components-and-hooks/) - Conversion pattern from class to functional
- [Voitanos: React Hooks in SPFx](https://www.voitanos.io/blog/how-to-use-react-hooks-with-sharepoint-framework-spfx-projects/) - Hook patterns in SPFx context

### Tertiary (LOW confidence)
- MediatR 12.x / FluentValidation 11.x compatibility with .NET 10 -- assumed based on general .NET compatibility, not explicitly verified

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions confirmed via official Microsoft docs and NuGet
- Architecture: HIGH - Clean Architecture pattern well-documented, SPFx structure follows official generator output
- Pitfalls: HIGH - Azure SQL Edge retirement confirmed via official Microsoft retirement notice; EF Core + Functions design-time issue is well-documented
- Docker setup: HIGH - SQL Server 2022 on macOS validated via Azure SQL Dev Corner blog with benchmarks

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (30 days -- stable technologies, no anticipated breaking changes)
