---
phase: 04-backend-architecture-api-skeleton
plan: 03
subsystem: api
tags: [mediatr, cqrs, fluentvalidation, dotnet, mock-data]

# Dependency graph
requires:
  - phase: 04-backend-architecture-api-skeleton (plan 01)
    provides: ApiResponse envelope, RequireGroupAttribute, ICurrentUser interface, pipeline behaviors
provides:
  - 4 MediatR command feature folders (MarkAsRead, FlagArticle, ToggleFavorite, ApproveArticle)
  - 6 MediatR query feature folders (GetArticleStatus, GetUnreadArticles, GetReadStats, GetFavorites, GetDashboardStats, GetAdminReports)
  - 10 IRequestHandler implementations with static German mock data
  - 4 FluentValidation validators with meaningful rules
  - Role-gated commands/queries via RequireGroup attribute
affects: [04-backend-architecture-api-skeleton (plan 04), 05-database-layer]

# Tech tracking
tech-stack:
  added: []
  patterns: [CQRS feature folder (Command/Handler/Validator triplet), Query feature folder (Query/Handler/DTO triplet), co-located DTOs in command files, file-scoped namespaces with primary constructors]

key-files:
  created:
    - api/src/WissensHub.Application/Commands/MarkAsRead/MarkAsReadCommand.cs
    - api/src/WissensHub.Application/Commands/MarkAsRead/MarkAsReadHandler.cs
    - api/src/WissensHub.Application/Commands/MarkAsRead/MarkAsReadValidator.cs
    - api/src/WissensHub.Application/Commands/FlagArticle/FlagArticleCommand.cs
    - api/src/WissensHub.Application/Commands/FlagArticle/FlagArticleHandler.cs
    - api/src/WissensHub.Application/Commands/FlagArticle/FlagArticleValidator.cs
    - api/src/WissensHub.Application/Commands/ToggleFavorite/ToggleFavoriteCommand.cs
    - api/src/WissensHub.Application/Commands/ToggleFavorite/ToggleFavoriteHandler.cs
    - api/src/WissensHub.Application/Commands/ToggleFavorite/ToggleFavoriteValidator.cs
    - api/src/WissensHub.Application/Commands/ApproveArticle/ApproveArticleCommand.cs
    - api/src/WissensHub.Application/Commands/ApproveArticle/ApproveArticleHandler.cs
    - api/src/WissensHub.Application/Commands/ApproveArticle/ApproveArticleValidator.cs
    - api/src/WissensHub.Application/Queries/GetArticleStatus/ArticleStatusDto.cs
    - api/src/WissensHub.Application/Queries/GetArticleStatus/GetArticleStatusQuery.cs
    - api/src/WissensHub.Application/Queries/GetArticleStatus/GetArticleStatusHandler.cs
    - api/src/WissensHub.Application/Queries/GetUnreadArticles/UnreadArticleDto.cs
    - api/src/WissensHub.Application/Queries/GetUnreadArticles/GetUnreadArticlesQuery.cs
    - api/src/WissensHub.Application/Queries/GetUnreadArticles/GetUnreadArticlesHandler.cs
    - api/src/WissensHub.Application/Queries/GetReadStats/ReadStatsDto.cs
    - api/src/WissensHub.Application/Queries/GetReadStats/GetReadStatsQuery.cs
    - api/src/WissensHub.Application/Queries/GetReadStats/GetReadStatsHandler.cs
    - api/src/WissensHub.Application/Queries/GetFavorites/FavoriteDto.cs
    - api/src/WissensHub.Application/Queries/GetFavorites/GetFavoritesQuery.cs
    - api/src/WissensHub.Application/Queries/GetFavorites/GetFavoritesHandler.cs
    - api/src/WissensHub.Application/Queries/GetDashboardStats/DashboardStatsDto.cs
    - api/src/WissensHub.Application/Queries/GetDashboardStats/GetDashboardStatsQuery.cs
    - api/src/WissensHub.Application/Queries/GetDashboardStats/GetDashboardStatsHandler.cs
    - api/src/WissensHub.Application/Queries/GetAdminReports/AdminReportDto.cs
    - api/src/WissensHub.Application/Queries/GetAdminReports/GetAdminReportsQuery.cs
    - api/src/WissensHub.Application/Queries/GetAdminReports/GetAdminReportsHandler.cs
  modified: []

key-decisions:
  - "Co-located DTOs in command files rather than separate DTO files for commands (queries keep separate DTO files per plan)"
  - "Primary constructor pattern for DI injection in all handlers (ICurrentUser)"
  - "Task.FromResult wrapper for sync mock handlers preserving async IRequestHandler signature"

patterns-established:
  - "CQRS feature folder: Commands/{Name}/{Name}Command.cs + Handler + Validator"
  - "CQRS feature folder: Queries/{Name}/{Name}Query.cs + Handler + {Name}Dto.cs"
  - "Role gating via [RequireGroup] attribute on command/query record class"
  - "German mock data pattern: IT-Sicherheit, Datenschutz, Personalwesen categories"

requirements-completed: [BACK-01, BACK-02, API-01, API-02, API-03, API-04, API-05, API-06, API-07, API-08, API-09, API-10]

# Metrics
duration: 2min
completed: 2026-03-16
---

# Phase 4 Plan 3: Commands & Queries Summary

**10 MediatR CQRS handlers with FluentValidation and role-gated operations returning German mock data through ApiResponse envelope**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-16T08:47:33Z
- **Completed:** 2026-03-16T08:50:12Z
- **Tasks:** 2
- **Files created:** 30

## Accomplishments
- 4 command feature folders (MarkAsRead, FlagArticle, ToggleFavorite, ApproveArticle) with Command/Handler/Validator triplets
- 6 query feature folders (GetArticleStatus, GetUnreadArticles, GetReadStats, GetFavorites, GetDashboardStats, GetAdminReports) with Query/Handler/DTO triplets
- Role gating via RequireGroup on ApproveArticle (Reviewers), GetReadStats (Reviewers), GetAdminReports (Owners)
- All handlers return static German mock data (IT-Sicherheit, Datenschutz, Personalwesen content) through ApiResponse envelope
- WissensHub.Application compiles with 0 errors, 10 IRequestHandler implementations confirmed

## Task Commits

Each task was committed atomically:

1. **Task 1: Create all 4 command feature folders** - `98484b0` (feat)
2. **Task 2: Create all 6 query feature folders** - `5abf524` (feat)

**Plan metadata:** (pending) (docs: complete plan)

## Files Created/Modified

### Commands (12 files)
- `api/src/WissensHub.Application/Commands/MarkAsRead/MarkAsReadCommand.cs` - Command record + ReadConfirmationDto
- `api/src/WissensHub.Application/Commands/MarkAsRead/MarkAsReadHandler.cs` - Mock handler returning read confirmation
- `api/src/WissensHub.Application/Commands/MarkAsRead/MarkAsReadValidator.cs` - PageId > 0 validation
- `api/src/WissensHub.Application/Commands/FlagArticle/FlagArticleCommand.cs` - Command record + ArticleFlagDto
- `api/src/WissensHub.Application/Commands/FlagArticle/FlagArticleHandler.cs` - Mock handler returning flag confirmation
- `api/src/WissensHub.Application/Commands/FlagArticle/FlagArticleValidator.cs` - PageId > 0, Reason required + max 500 chars
- `api/src/WissensHub.Application/Commands/ToggleFavorite/ToggleFavoriteCommand.cs` - Command record + ToggleFavoriteDto
- `api/src/WissensHub.Application/Commands/ToggleFavorite/ToggleFavoriteHandler.cs` - Mock handler returning toggle state
- `api/src/WissensHub.Application/Commands/ToggleFavorite/ToggleFavoriteValidator.cs` - PageId > 0 validation
- `api/src/WissensHub.Application/Commands/ApproveArticle/ApproveArticleCommand.cs` - Role-gated command + ApprovalHistoryDto
- `api/src/WissensHub.Application/Commands/ApproveArticle/ApproveArticleHandler.cs` - Mock handler returning approval history
- `api/src/WissensHub.Application/Commands/ApproveArticle/ApproveArticleValidator.cs` - Action must be Approved/Rejected, comment required on rejection

### Queries (18 files)
- `api/src/WissensHub.Application/Queries/GetArticleStatus/ArticleStatusDto.cs` - Full article status with read state and target groups
- `api/src/WissensHub.Application/Queries/GetArticleStatus/GetArticleStatusQuery.cs` - Query by PageId
- `api/src/WissensHub.Application/Queries/GetArticleStatus/GetArticleStatusHandler.cs` - Mock with IT-Sicherheit category
- `api/src/WissensHub.Application/Queries/GetUnreadArticles/UnreadArticleDto.cs` - Unread article summary
- `api/src/WissensHub.Application/Queries/GetUnreadArticles/GetUnreadArticlesQuery.cs` - Parameterless query
- `api/src/WissensHub.Application/Queries/GetUnreadArticles/GetUnreadArticlesHandler.cs` - Mock with 3 German articles
- `api/src/WissensHub.Application/Queries/GetReadStats/ReadStatsDto.cs` - Read stats with UserReadStatusDto
- `api/src/WissensHub.Application/Queries/GetReadStats/GetReadStatsQuery.cs` - Role-gated query (WissensHub Reviewers)
- `api/src/WissensHub.Application/Queries/GetReadStats/GetReadStatsHandler.cs` - Mock with 3 users, 2 read / 1 unread
- `api/src/WissensHub.Application/Queries/GetFavorites/FavoriteDto.cs` - Favorite with title and category
- `api/src/WissensHub.Application/Queries/GetFavorites/GetFavoritesQuery.cs` - Parameterless query
- `api/src/WissensHub.Application/Queries/GetFavorites/GetFavoritesHandler.cs` - Mock with German titles
- `api/src/WissensHub.Application/Queries/GetDashboardStats/DashboardStatsDto.cs` - UnreadCount, FavoritesCount, PendingReviewsCount
- `api/src/WissensHub.Application/Queries/GetDashboardStats/GetDashboardStatsQuery.cs` - Parameterless query
- `api/src/WissensHub.Application/Queries/GetDashboardStats/GetDashboardStatsHandler.cs` - Mock with 3/2/1 counts
- `api/src/WissensHub.Application/Queries/GetAdminReports/AdminReportDto.cs` - Admin report with ArticleReportDto list
- `api/src/WissensHub.Application/Queries/GetAdminReports/GetAdminReportsQuery.cs` - Role-gated query (WissensHub Owners)
- `api/src/WissensHub.Application/Queries/GetAdminReports/GetAdminReportsHandler.cs` - Mock with 3 articles, aggregate counts

## Decisions Made
- Co-located DTOs in command files (ReadConfirmationDto alongside MarkAsReadCommand) rather than separate files, keeping commands self-contained; queries use separate DTO files per plan specification
- Primary constructor DI pattern for all handlers injects ICurrentUser even when not yet used by mock implementation, ensuring the dependency is wired for the feature phase
- Used Task.FromResult wrapper for synchronous mock logic to preserve the async IRequestHandler contract

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 10 CQRS handlers ready for Plan 04 Azure Functions triggers to dispatch to
- Commands/ and Queries/ directories fully populated with feature folders
- Role-gated operations marked with RequireGroup attributes for pipeline authorization behavior

## Self-Check: PASSED

- 30/30 files found
- 2/2 commits verified (98484b0, 5abf524)
- Build: 0 errors

---
*Phase: 04-backend-architecture-api-skeleton*
*Completed: 2026-03-16*
