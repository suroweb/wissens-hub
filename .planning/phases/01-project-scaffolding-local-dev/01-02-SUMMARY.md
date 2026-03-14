---
phase: 01-project-scaffolding-local-dev
plan: 02
subsystem: api, database, infra
tags: [dotnet-10, azure-functions, ef-core-10, sql-server-2022, docker-compose, clean-architecture]

# Dependency graph
requires:
  - phase: none
    provides: greenfield project
provides:
  - ".NET 10 Azure Functions Isolated Worker project with Clean Architecture (4 source + 1 test)"
  - "8 domain entities with EF Core configurations and code-first migrations"
  - "WissensHubDbContext with DbSets for all entities"
  - "DesignTimeDbContextFactory for EF Core migration tooling"
  - "GET /api/health endpoint returning JSON status"
  - "Docker Compose with SQL Server 2022 for local dev"
  - "Root package.json with dev workflow scripts"
  - "Database schema tests verifying all 8 tables"
affects: [phase-2-auth, phase-4-backend-architecture, phase-6-read-confirmations, phase-7-approval-workflow]

# Tech tracking
tech-stack:
  added:
    - "Microsoft.EntityFrameworkCore.SqlServer 10.0.3"
    - "Microsoft.EntityFrameworkCore.Design 10.0.3"
    - "Microsoft.EntityFrameworkCore.InMemory 10.0.3"
    - "MediatR 14.1.0"
    - "FluentValidation 12.1.1"
    - "concurrently 9.x"
    - "mcr.microsoft.com/mssql/server:2022-latest"
  patterns:
    - "Clean Architecture: Functions -> Application -> Domain, Functions -> Infrastructure -> Domain"
    - "EF Core Fluent API configuration via IEntityTypeConfiguration<T>"
    - "DesignTimeDbContextFactory for Azure Functions + EF Core migration tooling"
    - "ASP.NET Core HTTP integration pattern for Azure Functions (IActionResult, HttpRequest)"

key-files:
  created:
    - "api/src/WissensHub.Domain/Entities/*.cs (8 entities)"
    - "api/src/WissensHub.Infrastructure/Data/WissensHubDbContext.cs"
    - "api/src/WissensHub.Infrastructure/Data/DesignTimeDbContextFactory.cs"
    - "api/src/WissensHub.Infrastructure/Data/Configurations/*.cs (8 configurations)"
    - "api/src/WissensHub.Infrastructure/Migrations/InitialCreate"
    - "api/src/WissensHub.Functions/Functions/HealthFunction.cs"
    - "api/tests/WissensHub.Tests/Infrastructure/DatabaseSchemaTests.cs"
    - "docker/docker-compose.yml"
    - "package.json"
    - ".gitignore"
  modified:
    - "api/src/WissensHub.Functions/Program.cs (added DbContext DI registration)"
    - "api/src/WissensHub.Functions/WissensHub.Functions.csproj (added EF Core Design package)"
    - "api/src/WissensHub.Functions/host.json (simplified logging config)"

key-decisions:
  - "Used SQL Server 2022 instead of retired Azure SQL Edge, with Colima Rosetta 2 for Apple Silicon"
  - "Used ASP.NET Core HTTP integration (IActionResult/HttpRequest) instead of HttpResponseData for health endpoint"
  - "Solution file uses .slnx format (XML-based, .NET 10 default) instead of legacy .sln"
  - "docker-compose command used instead of docker compose (Colima compatibility)"

patterns-established:
  - "Clean Architecture reference chain: Functions -> Application -> Domain, Functions -> Infrastructure -> Domain"
  - "Entity configuration via IEntityTypeConfiguration<T> in Infrastructure/Data/Configurations/"
  - "DesignTimeDbContextFactory pattern for EF Core CLI with Azure Functions"
  - "Composite PK for junction tables (ArticleTargetGroup)"
  - "Entra Object ID stored as nvarchar(36) for UserId fields"

requirements-completed: [INFRA-03, INFRA-04, INFRA-05]

# Metrics
duration: 26min
completed: 2026-03-14
---

# Phase 1 Plan 2: .NET Clean Architecture Backend Summary

**.NET 10 Azure Functions with EF Core 10, 8-table schema via code-first migrations, Docker SQL Server 2022, and root dev workflow scripts**

## Performance

- **Duration:** 26 min
- **Started:** 2026-03-14T21:54:44Z
- **Completed:** 2026-03-14T22:20:44Z
- **Tasks:** 4
- **Files modified:** 32

## Accomplishments
- .NET 10 solution with Clean Architecture (4 source projects + 1 test project), all NuGet packages, and correct reference chain
- 8 domain entities with EF Core Fluent API configurations, unique indexes, composite PKs, and cascade delete behaviors
- EF Core InitialCreate migration successfully applied to Docker SQL Server 2022 -- all 8 tables + __EFMigrationsHistory created
- GET /api/health endpoint verified at runtime returning JSON with status and timestamp
- 13 database schema tests passing (DbSets, entity types, unique indexes, composite keys)
- Root package.json with dev scripts (dev, spfx:serve, api:start, db:up, db:down, db:migrate)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create .NET solution shell** - `0a7c021` (feat) -- already completed during plan 01-01
2. **Task 2: Create domain entities, EF Core configurations, DbContext** - `62f2bad` (feat)
3. **Task 3: Create Program.cs, health endpoint, Docker Compose** - `9db4546` (feat) -- partially committed during plan 01-01 docs
4. **Task 4: Generate migration, schema tests, package.json, .gitignore** - `e757047` (feat)

## Files Created/Modified
- `api/src/WissensHub.Domain/Entities/*.cs` - 8 domain entities (ArticleMetadata, ReadConfirmation, ArticleFlag, Favorite, ApprovalHistory, Category, TargetGroup, ArticleTargetGroup)
- `api/src/WissensHub.Infrastructure/Data/WissensHubDbContext.cs` - DbContext with 8 DbSets
- `api/src/WissensHub.Infrastructure/Data/DesignTimeDbContextFactory.cs` - Design-time factory for EF Core CLI
- `api/src/WissensHub.Infrastructure/Data/Configurations/*.cs` - 8 entity configurations
- `api/src/WissensHub.Infrastructure/Migrations/` - InitialCreate migration files
- `api/src/WissensHub.Functions/Program.cs` - Entry point with EF Core DI registration
- `api/src/WissensHub.Functions/Functions/HealthFunction.cs` - GET /api/health endpoint
- `api/src/WissensHub.Functions/host.json` - Azure Functions host configuration
- `api/tests/WissensHub.Tests/Infrastructure/DatabaseSchemaTests.cs` - 13 schema verification tests
- `docker/docker-compose.yml` - SQL Server 2022 container configuration
- `package.json` - Root dev workflow scripts with concurrently
- `.gitignore` - Node.js, .NET, SPFx, secrets patterns

## Decisions Made
- **SQL Server 2022 via Rosetta 2:** Azure SQL Edge was retired Sep 2025. Used `mcr.microsoft.com/mssql/server:2022-latest` with Colima `--vz-rosetta` for Apple Silicon compatibility.
- **ASP.NET Core HTTP integration:** The Azure Functions template uses `ConfigureFunctionsWebApplication()` which requires ASP.NET Core pattern (IActionResult, HttpRequest) instead of HttpResponseData. Switched HealthFunction to match.
- **.slnx format:** .NET 10 SDK generates `.slnx` (XML-based) by default instead of legacy `.sln`. Kept the modern format as all `dotnet` CLI commands support it.
- **docker-compose command:** Used `docker-compose` (hyphenated) instead of `docker compose` (space) for Colima compatibility.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Azure Functions template not installed**
- **Found during:** Task 1 (solution creation)
- **Issue:** `dotnet new func` template not available, needed `Microsoft.Azure.Functions.Worker.ProjectTemplates`
- **Fix:** Installed template package via `dotnet new install`
- **Verification:** Template installed, project created successfully

**2. [Rule 1 - Bug] GetConnectionString requires Microsoft.Extensions.Configuration using**
- **Found during:** Task 3 (Program.cs)
- **Issue:** `builder.Configuration.GetConnectionString()` compilation error -- extension method not found without proper using
- **Fix:** Added `using Microsoft.Extensions.Configuration;` and extracted connection string to local variable
- **Verification:** Build succeeds with 0 errors

**3. [Rule 1 - Bug] HealthFunction used synchronous WriteString with ASP.NET Core integration**
- **Found during:** Task 4 (runtime verification)
- **Issue:** `HttpResponseData.WriteString()` throws `Synchronous operations are disallowed` with `ConfigureFunctionsWebApplication()`
- **Fix:** Rewrote HealthFunction to use ASP.NET Core pattern (IActionResult, HttpRequest) instead of HttpResponseData
- **Verification:** `curl http://localhost:7071/api/health` returns `{"status":"healthy","timestamp":"..."}`

**4. [Rule 3 - Blocking] EF Core Design package needed in startup project**
- **Found during:** Task 4 (migration generation)
- **Issue:** `dotnet ef migrations add` requires `Microsoft.EntityFrameworkCore.Design` in the startup project
- **Fix:** Added the package to WissensHub.Functions.csproj
- **Verification:** Migration generated and applied successfully

**5. [Rule 3 - Blocking] Docker SQL Server failed with QEMU emulation**
- **Found during:** Task 4 (Docker container startup)
- **Issue:** SQL Server 2022 crashed on Colima with default QEMU x86 emulation (invalid memory mapping)
- **Fix:** Restarted Colima with `--vz-rosetta` flag for native Rosetta 2 emulation
- **Verification:** Container starts and accepts connections, all 9 tables created after migration

---

**Total deviations:** 5 auto-fixed (2 bugs, 3 blocking)
**Impact on plan:** All auto-fixes necessary for correctness and environment compatibility. No scope creep.

## Issues Encountered
- Colima Docker runtime was stopped and had a stuck disk lock -- resolved by deleting and recreating the instance
- Previous Docker volumes from old SQL Edge containers conflicted with port 1433 -- cleaned up by removing old containers
- `sqlcmd` password containing `!` caused shell expansion issues in zsh -- worked around by using `$MSSQL_SA_PASSWORD` env var inside container

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Backend API foundation is complete and ready for Phase 2 (auth pipeline) and Phase 4 (backend architecture)
- Docker SQL Server requires Colima with `--vz-rosetta` flag on Apple Silicon (already configured)
- EF Core migration tooling verified end-to-end: generate -> apply -> verify
- Health endpoint verified at runtime -- ready for AadHttpClient smoke test in Phase 2

## Self-Check: PASSED

- All 16 key files verified present
- Both plan commits (62f2bad, e757047) exist in git history
- Solution builds with 0 errors, 0 warnings
- 13 database schema tests pass
- Health endpoint returns 200 with JSON at runtime

---
*Phase: 01-project-scaffolding-local-dev*
*Completed: 2026-03-14*
