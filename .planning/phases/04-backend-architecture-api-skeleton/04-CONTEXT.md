# Phase 4: Backend Architecture & API Skeleton - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the complete Azure Functions CQRS backend architecture: MediatR command/query dispatch, FluentValidation pipeline, logging and exception pipeline behaviors, 6 repository interfaces with full EF Core implementations, ICurrentUser DI service for identity, group-claim authorization behavior, and all 10 API endpoint functions returning static mock data through the full pipeline. Feature phases replace mock data with real handler logic. Auth middleware and EF Core entity configs already exist from Phase 1-2.

</domain>

<decisions>
## Implementation Decisions

### API response format
- All endpoints return a consistent envelope: `{ success: bool, data: T?, errors: ...? }`
- Validation errors include field-level detail: `{ field: "pageId", message: "PageId must be > 0" }`
- Semantic HTTP status codes: 200 success, 400 validation, 401 auth, 403 role insufficient, 404 not found, 500 server error. Envelope body always present regardless of status code.
- Write endpoints (POST) return the created/updated entity in the `data` field — frontend can update UI without a follow-up GET

### Endpoint stub depth
- All 10 endpoints exist as Azure Functions triggers with full MediatR pipeline (routing → auth → MediatR → validation → handler → envelope response)
- Handlers return static mock data matching German sample content from Phase 2 (IT-Sicherheit, Datenschutz, Passwort-Richtlinie, etc.) — consistent with frontend mocks
- Stubs prove the full architectural pipeline works end-to-end
- When feature phases replace stubs with real DB queries, mock data is removed (no dev fallback mode)

### User identity access
- ICurrentUser DI service reads ClaimsPrincipal from FunctionContext.Items["User"] (set by existing AuthenticationMiddleware)
- Exposes UserId (oid claim), DisplayName (name claim), Email (preferred_username claim), and group membership
- No WissensHub role enum on backend — authorization via group claims, not role hierarchy
- Inject ICurrentUser into any MediatR handler via constructor — clean, testable, mockable

### Authorization
- Role-gated endpoints (readstats, approve, admin/reports) use group claims from the JWT
- MediatR AuthorizationBehavior checks ICurrentUser.Groups against a [RequireGroup("Reviewers")] attribute on requests
- No SharePoint API calls from backend for role resolution

### Repository boundaries
- 6 repositories (spec's 4 + 2 additional):
  - IReadConfirmationRepository — ReadConfirmation entity
  - IFavoriteRepository — Favorite entity
  - IFlagRepository — ArticleFlag entity
  - IApprovalRepository — ApprovalHistory entity
  - IArticleMetadataRepository — ArticleMetadata + ArticleTargetGroup (navigation)
  - ICategoryRepository — Category + TargetGroup (admin config entities)
- Smart repositories with encapsulated EF Core queries (GetUnreadForUser, GetByPageId, etc.) — not thin CRUD wrappers
- Full EF Core implementations in Phase 4 — interfaces in Application layer, implementations in Infrastructure layer
- Handler orchestrates cross-entity operations, single SaveChangesAsync via shared DbContext (implicit unit of work) — repos don't call SaveChanges themselves

### Claude's Discretion
- Exact MediatR pipeline behavior registration order
- FluentValidation rule specifics for each request type
- LoggingBehavior log levels and format
- ExceptionBehavior error mapping details
- Mock data content specifics (exact article IDs, dates, counts) as long as German categories and realistic content are used
- ICurrentUser implementation details (scoped lifetime, claim extraction logic)
- Envelope response generic type implementation (ApiResponse<T>)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Backend Architecture
- `wissens-hub-spec.md` §"Clean Architecture & Clean Code Principles" — Backend layer structure, MediatR CQRS pattern, pipeline behaviors, repository pattern, dependency inversion
- `wissens-hub-spec.md` §"Data Architecture" — Two-layer data model, API endpoints list, table schemas, Azure SQL tracking data

### API Endpoints
- `wissens-hub-spec.md` §"Azure Functions API" — All 10 endpoints with routes, HTTP methods, request/response contracts
- `.planning/REQUIREMENTS.md` §"Azure Functions API" (API-01 through API-10) — Endpoint requirements
- `.planning/REQUIREMENTS.md` §"Backend Architecture" (BACK-01 through BACK-06) — Architecture requirements

### Auth Pipeline (already implemented)
- `api/src/WissensHub.Functions/Middleware/AuthenticationMiddleware.cs` — Existing JWT validation, ClaimsPrincipal stored in context.Items["User"]
- `api/src/WissensHub.Functions/Program.cs` — Existing DI setup, EF Core registration, middleware registration

### Domain & Data Layer (already implemented)
- `api/src/WissensHub.Domain/Entities/` — All 8 entity classes
- `api/src/WissensHub.Infrastructure/Data/Configurations/` — All 8 EF Core entity configurations
- `api/src/WissensHub.Infrastructure/Data/WissensHubDbContext.cs` — DbContext with all DbSets

### Sample Data (for mock alignment)
- `.planning/phases/02-sharepoint-site-auth-pipeline/02-CONTEXT.md` §"Sample content & demo data" — German categories, article titles, target groups

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 8 domain entities in `WissensHub.Domain/Entities/` — all with navigation properties, ready for repository queries
- 8 EF Core configurations in `WissensHub.Infrastructure/Data/Configurations/` — indexes, constraints, relationships all defined
- `WissensHubDbContext` with all DbSets registered
- `AuthenticationMiddleware` — JWT validation already working, stores ClaimsPrincipal in `context.Items["User"]`
- `HealthFunction` — template for new Azure Functions (IActionResult + HttpRequest pattern)
- `Program.cs` — DI container and middleware pipeline already wired

### Established Patterns
- Clean Architecture: Functions → Application → Domain ← Infrastructure
- ASP.NET Core HTTP integration: `IActionResult` return type, `HttpRequest` parameter
- `AuthorizationLevel.Anonymous` on all triggers (in-code token validation, not Azure Functions auth)
- File-scoped namespaces, primary constructors (C# 14)
- EF Core code-first with explicit configurations (not data annotations)

### Integration Points
- `Program.cs` needs: MediatR registration, FluentValidation registration, repository DI, ICurrentUser registration
- `WissensHub.Application` project is currently empty — receives all MediatR handlers, commands, queries, validators, pipeline behaviors, and interfaces
- New function files go in `WissensHub.Functions/Functions/` alongside HealthFunction
- Repository interfaces in Application, implementations in Infrastructure (Clean Architecture)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — user consistently chose the recommended/conventional option across all areas, indicating a preference for well-established patterns and Clean Architecture best practices.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-backend-architecture-api-skeleton*
*Context gathered: 2026-03-16*
