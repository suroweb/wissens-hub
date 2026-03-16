---
phase: 04-backend-architecture-api-skeleton
plan: 01
subsystem: api
tags: [cqrs, mediatr, fluentvalidation, pipeline-behaviors, repository-pattern, dotnet]

# Dependency graph
requires:
  - phase: 01-project-scaffolding
    provides: WissensHub.Application project with MediatR and FluentValidation packages
  - phase: 01-project-scaffolding
    provides: WissensHub.Domain entities (ArticleMetadata, ReadConfirmation, Favorite, ArticleFlag, ApprovalHistory, Category, TargetGroup)
provides:
  - ApiResponse<T> envelope type with Ok/Fail factory methods and ApiError record
  - RequireGroupAttribute for declarative group-based authorization on CQRS commands/queries
  - ICurrentUser interface abstracting Entra ID claims (UserId, DisplayName, Email, Groups)
  - 4 MediatR pipeline behaviors (Exception, Logging, Authorization, Validation)
  - 6 domain-specific repository interfaces for all aggregate roots
affects: [04-02-infrastructure-implementations, 04-03-commands-queries-handlers, 04-04-azure-functions-endpoints]

# Tech tracking
tech-stack:
  added: [Microsoft.Extensions.Logging.Abstractions (transitive)]
  patterns: [CQRS pipeline behaviors, contracts-first design, domain-specific repository interfaces]

key-files:
  created:
    - api/src/WissensHub.Application/Common/ApiResponse.cs
    - api/src/WissensHub.Application/Common/Attributes/RequireGroupAttribute.cs
    - api/src/WissensHub.Application/Common/Behaviors/ExceptionBehavior.cs
    - api/src/WissensHub.Application/Common/Behaviors/LoggingBehavior.cs
    - api/src/WissensHub.Application/Common/Behaviors/AuthorizationBehavior.cs
    - api/src/WissensHub.Application/Common/Behaviors/ValidationBehavior.cs
    - api/src/WissensHub.Application/Interfaces/ICurrentUser.cs
    - api/src/WissensHub.Application/Interfaces/IReadConfirmationRepository.cs
    - api/src/WissensHub.Application/Interfaces/IFavoriteRepository.cs
    - api/src/WissensHub.Application/Interfaces/IFlagRepository.cs
    - api/src/WissensHub.Application/Interfaces/IApprovalRepository.cs
    - api/src/WissensHub.Application/Interfaces/IArticleMetadataRepository.cs
    - api/src/WissensHub.Application/Interfaces/ICategoryRepository.cs
  modified: []

key-decisions:
  - "No explicit Microsoft.Extensions.Logging.Abstractions package added -- available transitively via MediatR"
  - "Pipeline behavior order: Exception > Logging > Authorization > Validation (outermost to innermost)"
  - "Repository interfaces use domain-specific query methods, not generic CRUD -- no SaveChangesAsync in repos"

patterns-established:
  - "File-scoped namespaces and primary constructors for all Application layer types"
  - "ApiResponse<T> envelope with static Ok/Fail factories as standard handler return type"
  - "RequireGroupAttribute + AuthorizationBehavior for declarative group authorization via reflection"
  - "ICurrentUser as DI-injectable identity abstraction for Entra ID claims"

requirements-completed: [BACK-01, BACK-02, BACK-03, BACK-04, BACK-05, BACK-06]

# Metrics
duration: 2min
completed: 2026-03-16
---

# Phase 4 Plan 01: Application Layer Contracts Summary

**CQRS contracts layer with ApiResponse<T> envelope, 4 MediatR pipeline behaviors (exception/logging/auth/validation), and 6 domain-specific repository interfaces**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-16T08:42:39Z
- **Completed:** 2026-03-16T08:44:45Z
- **Tasks:** 3
- **Files created:** 13

## Accomplishments
- ApiResponse<T> envelope type with Ok/Fail factory methods providing consistent API response wrapping
- 4 MediatR pipeline behaviors in correct execution order: Exception > Logging > Authorization > Validation
- RequireGroupAttribute enabling declarative group-based authorization on command/query records
- ICurrentUser interface abstracting Entra ID identity with UserId, DisplayName, Email, Groups, IsInGroup
- 6 repository interfaces with domain-specific query methods matching all aggregate root entities

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ApiResponse envelope, RequireGroupAttribute, and ICurrentUser interface** - `9b2e547` (feat)
2. **Task 2: Create all 4 MediatR pipeline behaviors** - `9217054` (feat)
3. **Task 3: Create all 6 repository interfaces** - `3cb40dd` (feat)

## Files Created/Modified
- `api/src/WissensHub.Application/Common/ApiResponse.cs` - Generic response envelope with Ok/Fail factories and ApiError record
- `api/src/WissensHub.Application/Common/Attributes/RequireGroupAttribute.cs` - Class-level attribute for group-based auth gating
- `api/src/WissensHub.Application/Common/Behaviors/ExceptionBehavior.cs` - Outermost pipeline behavior catching and logging all exceptions
- `api/src/WissensHub.Application/Common/Behaviors/LoggingBehavior.cs` - Request timing and structured logging behavior
- `api/src/WissensHub.Application/Common/Behaviors/AuthorizationBehavior.cs` - Reflects RequireGroupAttribute, checks ICurrentUser groups
- `api/src/WissensHub.Application/Common/Behaviors/ValidationBehavior.cs` - Runs FluentValidation validators in parallel before handler
- `api/src/WissensHub.Application/Interfaces/ICurrentUser.cs` - User identity abstraction for DI (oid, name, email, groups)
- `api/src/WissensHub.Application/Interfaces/IReadConfirmationRepository.cs` - Read confirmation queries (page/user lookup, unread count)
- `api/src/WissensHub.Application/Interfaces/IFavoriteRepository.cs` - Favorite toggle operations (add/remove by page+user)
- `api/src/WissensHub.Application/Interfaces/IFlagRepository.cs` - Flag queries (unresolved listing, page-scoped)
- `api/src/WissensHub.Application/Interfaces/IApprovalRepository.cs` - Approval history (latest-by-page for workflow state)
- `api/src/WissensHub.Application/Interfaces/IArticleMetadataRepository.cs` - Article metadata (status filter, target group eager load, pending count)
- `api/src/WissensHub.Application/Interfaces/ICategoryRepository.cs` - Category and TargetGroup admin queries

## Decisions Made
- No explicit Microsoft.Extensions.Logging.Abstractions package needed -- available transitively via MediatR dependency chain
- Pipeline behavior order follows clean architecture convention: Exception wraps everything, Validation is innermost before handler
- Repository interfaces define domain-specific queries (not generic CRUD) and omit SaveChangesAsync -- handlers call DbContext.SaveChangesAsync directly

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Application layer contracts are defined and compile cleanly
- Plan 02 (Infrastructure implementations) can implement all 6 repository interfaces and ICurrentUser
- Plan 03 (Commands/Queries/Handlers) can reference ApiResponse<T>, pipeline behaviors, and repository interfaces
- Plan 04 (Azure Functions endpoints) can wire DI registration for behaviors and inject ICurrentUser

## Self-Check: PASSED

- All 13 files exist on disk
- All 3 task commits verified (9b2e547, 9217054, 3cb40dd)
- dotnet build succeeds with 0 errors, 0 warnings

---
*Phase: 04-backend-architecture-api-skeleton*
*Completed: 2026-03-16*
