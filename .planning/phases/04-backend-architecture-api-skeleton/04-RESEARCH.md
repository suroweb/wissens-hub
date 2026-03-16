# Phase 4: Backend Architecture & API Skeleton - Research

**Researched:** 2026-03-16
**Domain:** .NET 10 Azure Functions CQRS backend with MediatR, FluentValidation, EF Core repositories
**Confidence:** HIGH

## Summary

Phase 4 builds the complete CQRS backend skeleton inside an existing Clean Architecture .NET 10 Azure Functions project. The project already has: 8 domain entities, 8 EF Core entity configurations, a `WissensHubDbContext` with all DbSets, JWT `AuthenticationMiddleware` storing `ClaimsPrincipal` in `context.Items["User"]`, a `HealthFunction` template, and empty `WissensHub.Application` project with MediatR 14.1.0 and FluentValidation 12.1.1 already referenced. The Application project already references the Domain project.

The work is pure architecture wiring: MediatR pipeline behaviors, FluentValidation integration, 6 repository interfaces + implementations, an `ICurrentUser` DI service, an `AuthorizationBehavior` for group-claim gating, all 10 API endpoint functions, and stub handlers returning mock data. Every endpoint flows through the full pipeline: routing -> auth middleware -> MediatR dispatch -> validation -> authorization -> handler -> envelope response. Feature phases later replace stub handlers with real DB logic.

**Primary recommendation:** Follow the spec's folder structure exactly. Use `AddOpenBehavior` (MediatR 12+ API) for pipeline behavior registration. Use `FluentValidation.DependencyInjectionExtensions` for `AddValidatorsFromAssembly`. Wrap all responses in `ApiResponse<T>` envelope. Register `ICurrentUser` as Scoped, reading claims from `FunctionContext.Items["User"]`.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **API response format**: All endpoints return `{ success: bool, data: T?, errors: ...? }` envelope. Validation errors include field-level detail: `{ field: "pageId", message: "PageId must be > 0" }`. Semantic HTTP status codes: 200/400/401/403/404/500. Write endpoints (POST) return created/updated entity in `data` field.
- **Endpoint stub depth**: All 10 endpoints exist as Azure Functions triggers with full MediatR pipeline (routing -> auth -> MediatR -> validation -> handler -> envelope response). Handlers return static mock data matching German sample content from Phase 2. When feature phases replace stubs, mock data is removed (no dev fallback mode).
- **User identity access**: `ICurrentUser` DI service reads `ClaimsPrincipal` from `FunctionContext.Items["User"]` (set by existing `AuthenticationMiddleware`). Exposes `UserId` (oid claim), `DisplayName` (name claim), `Email` (preferred_username claim), and group membership. No WissensHub role enum on backend. Inject via constructor.
- **Authorization**: Role-gated endpoints use group claims from JWT. MediatR `AuthorizationBehavior` checks `ICurrentUser.Groups` against a `[RequireGroup("Reviewers")]` attribute on requests. No SharePoint API calls from backend for role resolution.
- **Repository boundaries**: 6 repositories (spec's 4 + 2 additional): `IReadConfirmationRepository`, `IFavoriteRepository`, `IFlagRepository`, `IApprovalRepository`, `IArticleMetadataRepository`, `ICategoryRepository`. Smart repositories with encapsulated EF Core queries (not thin CRUD wrappers). Full EF Core implementations. Handler orchestrates cross-entity operations, single `SaveChangesAsync` via shared DbContext (implicit unit of work) -- repos don't call `SaveChanges` themselves.

### Claude's Discretion
- Exact MediatR pipeline behavior registration order
- FluentValidation rule specifics for each request type
- LoggingBehavior log levels and format
- ExceptionBehavior error mapping details
- Mock data content specifics (exact article IDs, dates, counts) as long as German categories and realistic content are used
- ICurrentUser implementation details (scoped lifetime, claim extraction logic)
- Envelope response generic type implementation (`ApiResponse<T>`)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BACK-01 | MediatR CQRS pattern -- commands and queries separated with handlers | MediatR 14.1.0 already referenced in Application.csproj. Use `AddMediatR` with `RegisterServicesFromAssembly` + `AddOpenBehavior` for pipeline. Each operation gets its own folder under Commands/ or Queries/. |
| BACK-02 | FluentValidation for request validation | FluentValidation 12.1.1 already referenced in Application.csproj. Need `FluentValidation.DependencyInjectionExtensions` NuGet in Functions project for `AddValidatorsFromAssembly`. Validators live next to their commands. |
| BACK-03 | MediatR pipeline behaviors: ValidationBehavior, LoggingBehavior, ExceptionBehavior | Three behaviors in `Application/Common/Behaviors/`. Plus `AuthorizationBehavior` from CONTEXT decisions. Registration order: Exception -> Logging -> Authorization -> Validation (outermost to innermost). |
| BACK-04 | Repository pattern (IReadConfirmationRepo, IFavoriteRepo, IFlagRepo, IApprovalRepo) | 6 repositories total per CONTEXT (adds IArticleMetadataRepository, ICategoryRepository). Interfaces in Application/Interfaces/, implementations in Infrastructure/Repositories/. Smart query methods. |
| BACK-05 | EF Core entity configurations for all tables | Already complete from Phase 1 -- all 8 configurations exist in Infrastructure/Data/Configurations/. No new work needed. |
| BACK-06 | Entra ID bearer token authentication on all endpoints | Already complete from Phase 1 -- AuthenticationMiddleware validates JWT and stores ClaimsPrincipal in context.Items["User"]. Phase 4 adds ICurrentUser service that reads from this. |
| API-01 | GET /api/articles/{pageId}/status -- metadata + read status for current user | Query: GetArticleStatusQuery(PageId). Returns mock ArticleMetadata + read status for current user. |
| API-02 | GET /api/articles/unread -- all unread articles for current user | Query: GetUnreadArticlesQuery(). Uses ICurrentUser for user context. Returns mock list of unread articles. |
| API-03 | POST /api/articles/{pageId}/read -- mark as read | Command: MarkAsReadCommand(PageId). Validator: PageId > 0. Returns created ReadConfirmation in data field. |
| API-04 | POST /api/articles/{pageId}/flag -- flag as outdated | Command: FlagArticleCommand(PageId, Reason). Validator: PageId > 0, Reason not empty. Returns created ArticleFlag. |
| API-05 | GET /api/articles/{pageId}/readstats -- who read, who didn't (reviewer/admin) | Query: GetReadStatsQuery(PageId). Requires [RequireGroup("Reviewers")] attribute. Returns mock read stats. |
| API-06 | POST /api/articles/{pageId}/approve -- approve/reject | Command: ApproveArticleCommand(PageId, Action, Comment). Requires [RequireGroup("Reviewers")]. Validator: Action in [Approved, Rejected]. |
| API-07 | GET /api/favorites -- user's favorites | Query: GetFavoritesQuery(). Uses ICurrentUser. Returns mock favorites list. |
| API-08 | POST /api/favorites/{pageId} -- toggle favorite | Command: ToggleFavoriteCommand(PageId). Validator: PageId > 0. Returns toggled state. |
| API-09 | GET /api/dashboard/stats -- unread count, favorites count, pending reviews count | Query: GetDashboardStatsQuery(). Uses ICurrentUser. Returns mock stats object. |
| API-10 | GET /api/admin/reports -- exportable read confirmation reports | Query: GetAdminReportsQuery(). Requires [RequireGroup("Owners")]. Returns mock report data. |

</phase_requirements>

## Standard Stack

### Core (Already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| MediatR | 14.1.0 | CQRS command/query dispatch + pipeline behaviors | Industry standard for CQRS in .NET. Already in Application.csproj. MediatR 14 targets .NET 10 natively. |
| FluentValidation | 12.1.1 | Request validation rules | Industry standard for .NET validation. Already in Application.csproj. |
| EF Core | 10.0.3 | ORM for repository implementations | Already configured with SqlServer provider in Infrastructure.csproj. All entities and configurations exist. |
| Microsoft.Identity.Web | 3.8.0 | Entra ID token validation options | Already in Functions.csproj. Used by AuthenticationMiddleware. |

### Needs Adding
| Library | Version | Purpose | Where to Install |
|---------|---------|---------|------------------|
| FluentValidation.DependencyInjectionExtensions | 12.1.1 | `AddValidatorsFromAssembly` registration | WissensHub.Functions.csproj (composition root) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MediatR pipeline behaviors | Manual middleware chain | MediatR behaviors are the standard CQRS cross-cutting pattern; manual approach loses automatic handler dispatch |
| FluentValidation | DataAnnotations | FluentValidation separates validation from model, supports complex rules, better testability |
| Smart repositories | Generic repository | Smart repos with domain-specific query methods produce cleaner handler code and encapsulate EF Core query complexity |

**Installation:**
```bash
cd api/src/WissensHub.Functions
dotnet add package FluentValidation.DependencyInjectionExtensions --version 12.1.1
```

## Architecture Patterns

### Recommended Project Structure (Application Layer -- currently empty)
```
api/src/WissensHub.Application/
├── Commands/
│   ├── MarkAsRead/
│   │   ├── MarkAsReadCommand.cs
│   │   ├── MarkAsReadHandler.cs
│   │   └── MarkAsReadValidator.cs
│   ├── FlagArticle/
│   │   ├── FlagArticleCommand.cs
│   │   ├── FlagArticleHandler.cs
│   │   └── FlagArticleValidator.cs
│   ├── ToggleFavorite/
│   │   ├── ToggleFavoriteCommand.cs
│   │   ├── ToggleFavoriteHandler.cs
│   │   └── ToggleFavoriteValidator.cs
│   └── ApproveArticle/
│       ├── ApproveArticleCommand.cs
│       ├── ApproveArticleHandler.cs
│       └── ApproveArticleValidator.cs
├── Queries/
│   ├── GetArticleStatus/
│   │   ├── GetArticleStatusQuery.cs
│   │   ├── GetArticleStatusHandler.cs
│   │   └── ArticleStatusDto.cs
│   ├── GetUnreadArticles/
│   │   ├── GetUnreadArticlesQuery.cs
│   │   ├── GetUnreadArticlesHandler.cs
│   │   └── UnreadArticleDto.cs
│   ├── GetReadStats/
│   │   ├── GetReadStatsQuery.cs
│   │   ├── GetReadStatsHandler.cs
│   │   └── ReadStatsDto.cs
│   ├── GetFavorites/
│   │   ├── GetFavoritesQuery.cs
│   │   ├── GetFavoritesHandler.cs
│   │   └── FavoriteDto.cs
│   ├── GetDashboardStats/
│   │   ├── GetDashboardStatsQuery.cs
│   │   ├── GetDashboardStatsHandler.cs
│   │   └── DashboardStatsDto.cs
│   └── GetAdminReports/
│       ├── GetAdminReportsQuery.cs
│       ├── GetAdminReportsHandler.cs
│       └── AdminReportDto.cs
├── Common/
│   ├── ApiResponse.cs                    # Envelope response type
│   ├── Behaviors/
│   │   ├── ValidationBehavior.cs
│   │   ├── LoggingBehavior.cs
│   │   ├── ExceptionBehavior.cs
│   │   └── AuthorizationBehavior.cs
│   └── Attributes/
│       └── RequireGroupAttribute.cs       # Marks requests needing group auth
├── Interfaces/
│   ├── ICurrentUser.cs
│   ├── IReadConfirmationRepository.cs
│   ├── IFavoriteRepository.cs
│   ├── IFlagRepository.cs
│   ├── IApprovalRepository.cs
│   ├── IArticleMetadataRepository.cs
│   └── ICategoryRepository.cs
└── WissensHub.Application.csproj
```

### Infrastructure additions
```
api/src/WissensHub.Infrastructure/
├── Data/                                  # (exists)
├── Repositories/                          # NEW
│   ├── ReadConfirmationRepository.cs
│   ├── FavoriteRepository.cs
│   ├── FlagRepository.cs
│   ├── ApprovalRepository.cs
│   ├── ArticleMetadataRepository.cs
│   └── CategoryRepository.cs
└── Services/                              # NEW
    └── CurrentUser.cs                     # ICurrentUser implementation
```

### Functions additions
```
api/src/WissensHub.Functions/
├── Functions/
│   ├── HealthFunction.cs                  # (exists)
│   ├── ArticleFunctions.cs                # API-01, API-02, API-03, API-04
│   ├── ReadStatsFunctions.cs              # API-05
│   ├── ApprovalFunctions.cs               # API-06
│   ├── FavoriteFunctions.cs               # API-07, API-08
│   ├── DashboardFunctions.cs              # API-09
│   └── AdminFunctions.cs                  # API-10
└── Program.cs                             # Updated with all DI registrations
```

### Pattern 1: MediatR CQRS with Pipeline Behaviors
**What:** Every API request dispatches through MediatR. Commands mutate state, queries read state. Pipeline behaviors execute cross-cutting concerns automatically.
**When to use:** Every endpoint -- no exceptions.
**Example:**
```csharp
// Source: wissens-hub-spec.md + MediatR 14.1 API

// Command with authorization attribute
[RequireGroup("Reviewers")]
public record ApproveArticleCommand(int PageId, string Action, string? Comment)
    : IRequest<ApiResponse<ApprovalHistoryDto>>;

// Handler returns envelope response
public class ApproveArticleHandler(
    IApprovalRepository approvalRepo,
    ICurrentUser currentUser)
    : IRequestHandler<ApproveArticleCommand, ApiResponse<ApprovalHistoryDto>>
{
    public Task<ApiResponse<ApprovalHistoryDto>> Handle(
        ApproveArticleCommand request, CancellationToken ct)
    {
        // Phase 4: return static mock data
        var mockApproval = new ApprovalHistoryDto(
            Id: 1,
            PageId: request.PageId,
            Action: request.Action,
            ActionBy: currentUser.DisplayName,
            ActionDate: DateTime.UtcNow,
            Comment: request.Comment);

        return Task.FromResult(ApiResponse<ApprovalHistoryDto>.Ok(mockApproval));
    }
}
```

### Pattern 2: Envelope Response
**What:** All API responses wrapped in `ApiResponse<T>` for consistent frontend consumption.
**When to use:** Every handler return type and every function response.
**Example:**
```csharp
// Application/Common/ApiResponse.cs
public class ApiResponse<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public List<ApiError>? Errors { get; init; }

    public static ApiResponse<T> Ok(T data) => new() { Success = true, Data = data };
    public static ApiResponse<T> Fail(List<ApiError> errors) => new() { Success = false, Errors = errors };
    public static ApiResponse<T> Fail(string message) => new() { Success = false, Errors = [new(null, message)] };
}

public record ApiError(string? Field, string Message);
```

### Pattern 3: ICurrentUser Service
**What:** Scoped service that extracts user identity from the `FunctionContext.Items["User"]` ClaimsPrincipal set by the existing AuthenticationMiddleware.
**When to use:** Any handler needing user context (most handlers).
**Example:**
```csharp
// Application/Interfaces/ICurrentUser.cs
public interface ICurrentUser
{
    string UserId { get; }         // oid claim
    string DisplayName { get; }    // name claim
    string Email { get; }          // preferred_username claim
    IReadOnlyList<string> Groups { get; }  // groups claim
    bool IsInGroup(string groupName);
}

// Infrastructure/Services/CurrentUser.cs
public class CurrentUser : ICurrentUser
{
    public string UserId { get; private set; } = string.Empty;
    public string DisplayName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public IReadOnlyList<string> Groups { get; private set; } = [];

    // Called from middleware or a FunctionContext accessor
    public void SetFromClaimsPrincipal(ClaimsPrincipal principal)
    {
        UserId = principal.FindFirstValue("http://schemas.microsoft.com/identity/claims/objectidentifier")
            ?? principal.FindFirstValue("oid") ?? string.Empty;
        DisplayName = principal.FindFirstValue("name") ?? string.Empty;
        Email = principal.FindFirstValue("preferred_username") ?? string.Empty;
        Groups = principal.FindAll("groups").Select(c => c.Value).ToList();
    }
}
```

### Pattern 4: AuthorizationBehavior with RequireGroupAttribute
**What:** MediatR behavior that inspects the request type for `[RequireGroup]` attribute and checks `ICurrentUser.Groups`.
**When to use:** Automatically applied to all requests; only acts when attribute is present.
**Example:**
```csharp
// Application/Common/Attributes/RequireGroupAttribute.cs
[AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
public class RequireGroupAttribute(string groupName) : Attribute
{
    public string GroupName { get; } = groupName;
}

// Application/Common/Behaviors/AuthorizationBehavior.cs
public class AuthorizationBehavior<TRequest, TResponse>(ICurrentUser currentUser)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        var requiredGroups = typeof(TRequest)
            .GetCustomAttributes<RequireGroupAttribute>();

        foreach (var attr in requiredGroups)
        {
            if (!currentUser.IsInGroup(attr.GroupName))
                throw new UnauthorizedAccessException(
                    $"User is not a member of required group: {attr.GroupName}");
        }

        return await next();
    }
}
```

### Pattern 5: Smart Repository with Encapsulated Queries
**What:** Repository methods represent domain-meaningful queries, not generic CRUD. EF Core query logic stays in Infrastructure.
**When to use:** All 6 repositories follow this pattern.
**Example:**
```csharp
// Application/Interfaces/IReadConfirmationRepository.cs
public interface IReadConfirmationRepository
{
    Task<ReadConfirmation?> GetByPageAndUserAsync(int pageId, string userId, CancellationToken ct);
    Task<List<ReadConfirmation>> GetByPageIdAsync(int pageId, CancellationToken ct);
    Task<List<ReadConfirmation>> GetByUserIdAsync(string userId, CancellationToken ct);
    Task<int> GetUnreadCountAsync(string userId, CancellationToken ct);
    Task<bool> ExistsAsync(int pageId, string userId, CancellationToken ct);
    Task AddAsync(ReadConfirmation entity, CancellationToken ct);
}

// Infrastructure/Repositories/ReadConfirmationRepository.cs
public class ReadConfirmationRepository(WissensHubDbContext db) : IReadConfirmationRepository
{
    public async Task<bool> ExistsAsync(int pageId, string userId, CancellationToken ct)
        => await db.ReadConfirmations.AnyAsync(
            r => r.PageId == pageId && r.UserId == userId, ct);

    public async Task AddAsync(ReadConfirmation entity, CancellationToken ct)
        => await db.ReadConfirmations.AddAsync(entity, ct);
    // ... other methods
}
```

### Pattern 6: Function Layer -- Thin Entry Points
**What:** Azure Functions classes are thin wrappers: extract route params, dispatch to MediatR, return IActionResult with envelope.
**When to use:** All 10 endpoint functions.
**Example:**
```csharp
// Functions/ArticleFunctions.cs
public class ArticleFunctions(IMediator mediator)
{
    [Function("GetArticleStatus")]
    public async Task<IActionResult> GetArticleStatus(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "articles/{pageId:int}/status")]
        HttpRequest req, int pageId)
    {
        var result = await mediator.Send(new GetArticleStatusQuery(pageId));
        return new OkObjectResult(result);
    }

    [Function("MarkAsRead")]
    public async Task<IActionResult> MarkAsRead(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "articles/{pageId:int}/read")]
        HttpRequest req, int pageId)
    {
        var result = await mediator.Send(new MarkAsReadCommand(pageId));
        return new OkObjectResult(result);
    }
}
```

### Anti-Patterns to Avoid
- **Business logic in Functions layer:** Functions only extract params and dispatch. All logic in handlers.
- **Repository calling SaveChangesAsync:** Handler orchestrates cross-repo operations, then calls `db.SaveChangesAsync()` once via the shared DbContext. Repos add/modify entities but don't persist.
- **Generic repository base class:** Use domain-specific interfaces with meaningful query methods. A `Repository<T>` base adds no value when each entity has different query patterns.
- **Throwing exceptions for flow control:** Use `ApiResponse<T>` envelope for expected failures (validation, not-found). Reserve exceptions for unexpected errors.
- **Leaking ICurrentUser claims logic into handlers:** Handlers access `ICurrentUser.UserId`, `ICurrentUser.Groups` -- never raw claim names.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CQRS dispatch | Custom command bus | MediatR `IMediator.Send()` | Pipeline behaviors, automatic handler discovery, battle-tested |
| Request validation | Manual if-checks in handlers | FluentValidation + ValidationBehavior | Declarative rules, field-level errors, consistent error format |
| Validator DI registration | Manual `services.AddScoped<IValidator<T>, ...>()` per type | `AddValidatorsFromAssembly` | Automatic discovery of all validators in assembly |
| Behavior registration | `services.AddTransient(typeof(IPipelineBehavior<,>), ...)` | `cfg.AddOpenBehavior(typeof(...))` inside `AddMediatR` | Correct MediatR 12+ API; ensures behaviors are discovered by MediatR's internal pipeline |
| JWT claim extraction | Inline claim string parsing in each handler | `ICurrentUser` scoped DI service | Single place to map claim names to typed properties; mockable in tests |
| Unit of Work | Explicit `IUnitOfWork` interface | Shared `WissensHubDbContext` (EF Core's built-in UoW) | DbContext IS a unit of work. Single `SaveChangesAsync()` at handler boundary. |

**Key insight:** The Application project already references MediatR 14.1.0 and FluentValidation 12.1.1. The composition root (`Program.cs`) needs only the `FluentValidation.DependencyInjectionExtensions` package for `AddValidatorsFromAssembly`. All other wiring uses existing NuGet packages.

## Common Pitfalls

### Pitfall 1: MediatR Behavior Registration Order
**What goes wrong:** Behaviors execute in registration order (first registered = outermost). Wrong order means validation runs before exception handling catches it, or logging misses authorization failures.
**Why it happens:** MediatR wraps each behavior around the next in registration order.
**How to avoid:** Register as: ExceptionBehavior (outermost, catches everything) -> LoggingBehavior (logs timing) -> AuthorizationBehavior (rejects before validation) -> ValidationBehavior (innermost before handler). This means:
```csharp
cfg.AddOpenBehavior(typeof(ExceptionBehavior<,>));
cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
cfg.AddOpenBehavior(typeof(AuthorizationBehavior<,>));
cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
```
**Warning signs:** Authorization exceptions not logged; validation running on unauthorized requests.

### Pitfall 2: FluentValidation.DependencyInjectionExtensions Missing
**What goes wrong:** `AddValidatorsFromAssembly` method doesn't exist at compile time.
**Why it happens:** The main `FluentValidation` package does NOT include the DI extensions. You need the separate `FluentValidation.DependencyInjectionExtensions` NuGet package.
**How to avoid:** Install `FluentValidation.DependencyInjectionExtensions` version 12.1.1 in the Functions project (composition root).
**Warning signs:** `CS1061: 'IServiceCollection' does not contain a definition for 'AddValidatorsFromAssembly'`.

### Pitfall 3: ICurrentUser Not Populated for Health Endpoint
**What goes wrong:** `ICurrentUser` throws NullReferenceException on `/api/health` because AuthenticationMiddleware skips it.
**Why it happens:** Health endpoint bypasses auth. If `ICurrentUser` is injected into health function, it has no ClaimsPrincipal to read from.
**How to avoid:** `ICurrentUser` should have safe defaults (empty strings, empty groups list). Health endpoint should NOT inject `ICurrentUser`. The `CurrentUser.SetFromClaimsPrincipal` call should be in a separate middleware or at the point where `FunctionContext.Items["User"]` is accessed.
**Warning signs:** App crash when hitting `/api/health`.

### Pitfall 4: FunctionContext.Items["User"] Access Pattern
**What goes wrong:** `ICurrentUser` can't access `FunctionContext` because it's not directly injectable.
**Why it happens:** In Azure Functions isolated worker, `FunctionContext` is not a DI-injectable service. It's passed to the function method and middleware.
**How to avoid:** Two approaches: (A) Add a second middleware after `AuthenticationMiddleware` that resolves `ICurrentUser` from DI and calls `SetFromClaimsPrincipal`; or (B) Use `IHttpContextAccessor` via ASP.NET Core HTTP integration to access `HttpContext.User`. Since the project uses `ConfigureFunctionsWebApplication()` with `Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore`, approach (B) works: inject `IHttpContextAccessor`, read `HttpContext.User`. But approach (A) is more explicit and aligned with existing middleware pattern.
**Warning signs:** `ICurrentUser.UserId` always returns empty string.

### Pitfall 5: Route Parameter Type Constraints
**What goes wrong:** `pageId` arrives as string "abc" and causes unhandled exception.
**Why it happens:** Azure Functions route parameters are strings by default unless constrained.
**How to avoid:** Use `{pageId:int}` route constraint in `HttpTrigger` attribute: `Route = "articles/{pageId:int}/status"`. This returns 404 for non-integer pageId before handler is invoked.
**Warning signs:** Unhandled `FormatException` in logs for malformed URLs.

### Pitfall 6: SaveChangesAsync Not Called in Stub Handlers
**What goes wrong:** Future feature phases add real DB operations but forget to call `SaveChangesAsync`.
**Why it happens:** Stub handlers return mock data without touching DbContext. When converting to real implementations, developers must remember that repos only stage changes.
**How to avoid:** Add a comment in every command handler stub: `// Feature phase: add db.SaveChangesAsync(ct) after real repo operations`. Alternatively, create a `SaveChangesBehavior` that auto-commits after successful command execution (but this adds complexity -- simpler to call explicitly in handlers).
**Warning signs:** POST endpoints succeed (200) but no data persisted in database.

### Pitfall 7: Groups Claim Not in JWT by Default
**What goes wrong:** `ICurrentUser.Groups` is always empty even though user is in Entra ID groups.
**Why it happens:** Entra ID does not include group claims in JWT tokens by default. The app registration must have `groupMembershipClaims` set to `"SecurityGroup"` or `"All"` in its manifest.
**How to avoid:** This is a Phase 2 / deployment concern, not Phase 4. In Phase 4, stub handlers work with mock data regardless. Document that the Entra ID app registration manifest must include `"groupMembershipClaims": "SecurityGroup"` for production.
**Warning signs:** Authorization behavior always rejects requests requiring group membership.

## Code Examples

### MediatR Registration in Program.cs
```csharp
// Source: MediatR 14.1 API + wissens-hub-spec.md

// MediatR + pipeline behaviors
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(MarkAsReadCommand).Assembly);
    cfg.AddOpenBehavior(typeof(ExceptionBehavior<,>));
    cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
    cfg.AddOpenBehavior(typeof(AuthorizationBehavior<,>));
    cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
});

// FluentValidation -- auto-discover all validators in Application assembly
builder.Services.AddValidatorsFromAssembly(typeof(MarkAsReadCommand).Assembly);

// Repositories
builder.Services.AddScoped<IReadConfirmationRepository, ReadConfirmationRepository>();
builder.Services.AddScoped<IFavoriteRepository, FavoriteRepository>();
builder.Services.AddScoped<IFlagRepository, FlagRepository>();
builder.Services.AddScoped<IApprovalRepository, ApprovalRepository>();
builder.Services.AddScoped<IArticleMetadataRepository, ArticleMetadataRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();

// ICurrentUser
builder.Services.AddScoped<ICurrentUser, CurrentUser>();
```

### ValidationBehavior Throwing Structured Errors
```csharp
// Source: wissens-hub-spec.md + FluentValidation 12 API

public class ValidationBehavior<TRequest, TResponse>(
    IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (!validators.Any())
            return await next();

        var context = new ValidationContext<TRequest>(request);
        var failures = (await Task.WhenAll(
                validators.Select(v => v.ValidateAsync(context, ct))))
            .SelectMany(r => r.Errors)
            .Where(f => f is not null)
            .ToList();

        if (failures.Count > 0)
            throw new ValidationException(failures);

        return await next();
    }
}
```

### ExceptionBehavior Mapping to ApiResponse
```csharp
// Source: wissens-hub-spec.md

public class ExceptionBehavior<TRequest, TResponse>(
    ILogger<ExceptionBehavior<TRequest, TResponse>> logger)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        try
        {
            return await next();
        }
        catch (ValidationException ex)
        {
            logger.LogWarning(ex, "Validation failed for {RequestName}", typeof(TRequest).Name);
            throw; // Let the Function layer catch and return 400 with field-level errors
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogWarning(ex, "Authorization failed for {RequestName}", typeof(TRequest).Name);
            throw; // Let the Function layer catch and return 403
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception in {RequestName} {@Request}",
                typeof(TRequest).Name, request);
            throw; // Let Azure Functions return 500
        }
    }
}
```

### Stub Handler with German Mock Data
```csharp
// Source: Phase 2 CONTEXT.md sample content categories

public class GetDashboardStatsHandler(ICurrentUser currentUser)
    : IRequestHandler<GetDashboardStatsQuery, ApiResponse<DashboardStatsDto>>
{
    public Task<ApiResponse<DashboardStatsDto>> Handle(
        GetDashboardStatsQuery request, CancellationToken ct)
    {
        // Static mock data -- feature phases replace with real DB queries
        var stats = new DashboardStatsDto(
            UnreadCount: 3,
            FavoritesCount: 2,
            PendingReviewsCount: 1);

        return Task.FromResult(ApiResponse<DashboardStatsDto>.Ok(stats));
    }
}
```

### Function Exception-to-Status-Code Mapping
```csharp
// Helper method or base class for all Function classes

private static IActionResult HandleException(Exception ex)
{
    return ex switch
    {
        ValidationException ve => new BadRequestObjectResult(
            ApiResponse<object>.Fail(
                ve.Errors.Select(e => new ApiError(e.PropertyName, e.ErrorMessage)).ToList())),
        UnauthorizedAccessException => new ObjectResult(
            ApiResponse<object>.Fail("Insufficient permissions")) { StatusCode = 403 },
        KeyNotFoundException => new NotFoundObjectResult(
            ApiResponse<object>.Fail("Resource not found")),
        _ => new ObjectResult(
            ApiResponse<object>.Fail("An unexpected error occurred")) { StatusCode = 500 }
    };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `services.AddMediatR(typeof(T))` | `services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(...))` | MediatR 12 (2023) | Configuration-based registration is now required |
| `cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(T))` | `cfg.AddOpenBehavior(typeof(T))` | MediatR 12 (2023) | Simpler API, same effect. Both still work but `AddOpenBehavior` is preferred. |
| `FluentValidation.AspNetCore` auto-validation | Manual validation via MediatR pipeline | FluentValidation 12 (2024) | FluentValidation.AspNetCore is deprecated. Validators are triggered manually via pipeline behavior. |
| Azure Functions in-process model | Isolated worker model | .NET 7+ | Project already uses isolated worker. No migration needed. |
| `MicrosoftIdentityWebAppAuthentication` | Custom middleware for Azure Functions isolated | .NET 8+ | Azure Functions isolated doesn't support ASP.NET Core auth middleware directly. Custom middleware pattern (already implemented) is the correct approach. |

**Deprecated/outdated:**
- `FluentValidation.AspNetCore`: Deprecated in FluentValidation 12. Do NOT install it. Use `FluentValidation.DependencyInjectionExtensions` + MediatR `ValidationBehavior` instead.
- `MediatR.Extensions.Microsoft.DependencyInjection`: Merged into main `MediatR` package in v12. Do NOT install separately.

## Open Questions

1. **ICurrentUser hydration mechanism**
   - What we know: `AuthenticationMiddleware` stores `ClaimsPrincipal` in `context.Items["User"]`. The project uses `ConfigureFunctionsWebApplication()` with ASP.NET Core HTTP integration.
   - What's unclear: Best approach to hydrate `ICurrentUser` from `FunctionContext.Items["User"]` -- whether to use a second middleware, `IHttpContextAccessor`, or a `FunctionContext` accessor service.
   - Recommendation: Add a second middleware (registered after `AuthenticationMiddleware`) that resolves `ICurrentUser` from DI and calls `SetFromClaimsPrincipal(context.Items["User"])`. This keeps the pattern consistent with existing code. Since `ConfigureFunctionsWebApplication()` maps `FunctionContext.Items["User"]` to `HttpContext.User`, `IHttpContextAccessor` is also viable but adds ASP.NET Core coupling to Infrastructure layer.

2. **Entra ID group claim mapping**
   - What we know: Authorization uses group claims. CONTEXT says `ICurrentUser.Groups` maps to JWT groups claim.
   - What's unclear: Whether Entra ID returns group GUIDs or group names in the `groups` claim. Default is GUIDs.
   - Recommendation: Use GUIDs in `[RequireGroup]` attribute values (e.g., `[RequireGroup("guid-of-reviewers-group")]`). Or add `optionalClaims` to app manifest to get group names. For Phase 4 stubs, this is moot since authorization is tested with mock data. Document for feature phases.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | xUnit 2.9.3 + Microsoft.NET.Test.Sdk 17.14.1 |
| Config file | `api/tests/WissensHub.Tests/WissensHub.Tests.csproj` |
| Quick run command | `dotnet test api/tests/WissensHub.Tests/ --filter "Category=Phase4" -x` |
| Full suite command | `dotnet test api/tests/WissensHub.Tests/` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BACK-01 | MediatR dispatches commands and queries to correct handlers | unit | `dotnet test --filter "FullyQualifiedName~MediatR"` | No - Wave 0 |
| BACK-02 | FluentValidation rejects invalid requests before handler | unit | `dotnet test --filter "FullyQualifiedName~Validation"` | No - Wave 0 |
| BACK-03 | Pipeline behaviors execute in correct order | unit | `dotnet test --filter "FullyQualifiedName~Pipeline"` | No - Wave 0 |
| BACK-04 | Repository interfaces resolvable from DI container | unit | `dotnet test --filter "FullyQualifiedName~Repository"` | No - Wave 0 |
| BACK-05 | EF Core entity configurations exist for all tables | unit | `dotnet test --filter "FullyQualifiedName~Schema"` | Yes - `Infrastructure/DatabaseSchemaTests.cs` |
| BACK-06 | Unauthenticated requests rejected with 401 | manual-only | Manual -- middleware already tested in Phase 1 | N/A |
| API-01 | GET /api/articles/{pageId}/status returns envelope | integration | `dotnet test --filter "FullyQualifiedName~ArticleStatus"` | No - Wave 0 |
| API-02 | GET /api/articles/unread returns envelope | integration | `dotnet test --filter "FullyQualifiedName~UnreadArticles"` | No - Wave 0 |
| API-03 | POST /api/articles/{pageId}/read returns envelope | integration | `dotnet test --filter "FullyQualifiedName~MarkAsRead"` | No - Wave 0 |
| API-04 | POST /api/articles/{pageId}/flag returns envelope | integration | `dotnet test --filter "FullyQualifiedName~FlagArticle"` | No - Wave 0 |
| API-05 | GET /api/articles/{pageId}/readstats requires group auth | integration | `dotnet test --filter "FullyQualifiedName~ReadStats"` | No - Wave 0 |
| API-06 | POST /api/articles/{pageId}/approve requires group auth | integration | `dotnet test --filter "FullyQualifiedName~Approve"` | No - Wave 0 |
| API-07 | GET /api/favorites returns envelope | integration | `dotnet test --filter "FullyQualifiedName~Favorites"` | No - Wave 0 |
| API-08 | POST /api/favorites/{pageId} returns envelope | integration | `dotnet test --filter "FullyQualifiedName~ToggleFavorite"` | No - Wave 0 |
| API-09 | GET /api/dashboard/stats returns envelope | integration | `dotnet test --filter "FullyQualifiedName~DashboardStats"` | No - Wave 0 |
| API-10 | GET /api/admin/reports requires group auth | integration | `dotnet test --filter "FullyQualifiedName~AdminReports"` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `dotnet test api/tests/WissensHub.Tests/ --filter "Category=Phase4" -x`
- **Per wave merge:** `dotnet test api/tests/WissensHub.Tests/`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `api/tests/WissensHub.Tests/Application/Behaviors/ValidationBehaviorTests.cs` -- covers BACK-02, BACK-03
- [ ] `api/tests/WissensHub.Tests/Application/Behaviors/AuthorizationBehaviorTests.cs` -- covers API-05, API-06, API-10 authorization
- [ ] `api/tests/WissensHub.Tests/Application/Handlers/` -- handler tests per command/query, covers BACK-01 + API-01 through API-10
- [ ] `api/tests/WissensHub.Tests/DependencyInjectionTests.cs` -- covers BACK-04 (all repositories resolvable)
- [ ] Test project needs references to `WissensHub.Application` and `WissensHub.Infrastructure` (already present in csproj)
- [ ] Add `Moq` or `NSubstitute` package for mocking ICurrentUser, repositories in unit tests

## Sources

### Primary (HIGH confidence)
- `wissens-hub-spec.md` sections: "Clean Architecture & Clean Code Principles", "Azure Functions API", "Data Architecture" -- folder structure, code examples, pipeline behavior patterns
- `api/src/WissensHub.Application/WissensHub.Application.csproj` -- confirms MediatR 14.1.0 and FluentValidation 12.1.1 already referenced
- `api/src/WissensHub.Functions/Program.cs` -- existing DI and middleware setup
- `api/src/WissensHub.Functions/Middleware/AuthenticationMiddleware.cs` -- existing JWT validation, `context.Items["User"]` pattern
- All 8 entity files in `WissensHub.Domain/Entities/` -- exact property types and navigation properties
- All 8 EF Core configurations in `WissensHub.Infrastructure/Data/Configurations/` -- indexes, constraints, relationships
- `04-CONTEXT.md` -- locked decisions on envelope format, stub depth, repositories, ICurrentUser, authorization

### Secondary (MEDIUM confidence)
- [FluentValidation DI docs](https://docs.fluentvalidation.net/en/latest/di.html) -- `AddValidatorsFromAssembly` API, default Scoped lifetime
- [MediatR 14.0 release](https://www.jimmybogard.com/automapper-16-0-0-and-mediatr-14-0-0-released-with-net-10-support/) -- confirms no API changes from previous minor, .NET 10 targeting
- [NuGet FluentValidation.DependencyInjectionExtensions 12.1.1](https://www.nuget.org/packages/fluentvalidation.dependencyinjectionextensions/) -- package version confirmation
- [Azure Functions isolated worker guide](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide) -- FunctionContext middleware pattern

### Tertiary (LOW confidence)
- [Joonas W's blog on Azure AD JWT in isolated Functions](https://joonasw.net/view/azure-ad-jwt-authentication-in-net-isolated-process-azure-functions) -- ICurrentUser hydration pattern options (community source, verified against existing codebase)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages already in project, versions confirmed from .csproj files
- Architecture: HIGH -- spec provides exact folder structure and code examples; CONTEXT decisions are unambiguous
- Pitfalls: HIGH -- verified against actual project code (e.g., HealthFunction auth skip, existing middleware pattern)
- ICurrentUser hydration: MEDIUM -- two viable approaches identified, recommendation given, but exact implementation depends on ASP.NET Core HTTP integration behavior with FunctionContext

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable stack, no fast-moving dependencies)
