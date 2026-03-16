---
phase: 07-approval-workflow-freigabecenter
plan: 01
subsystem: api, ui
tags: [cqrs, mediatr, ef-core, spfx, react-hooks, state-machine]

# Dependency graph
requires:
  - phase: 04-backend-api-functions
    provides: MediatR handlers, repository interfaces, FunctionHelper, pipeline behaviors
  - phase: 06-article-sidebar-read-confirmations
    provides: Flag/Approval service interfaces, mock data, existing hooks
provides:
  - Real ApproveArticleHandler with state transition validation
  - IUnitOfWork interface for clean architecture SaveChangesAsync
  - GET /api/articles/flagged endpoint
  - GET /api/articles/{pageId}/history endpoint
  - Extended IApprovalService (7 methods) and IFlagService (2 methods)
  - VALID_TRANSITIONS map and isValidTransition utility
  - 5 new React hooks (2 queries + 3 commands)
  - MOCK_APPROVAL_HISTORY data for workbench mode
affects: [07-02-freigabecenter-webpart, 07-03-verification]

# Tech tracking
tech-stack:
  added: []
  patterns: [IUnitOfWork abstraction for EF Core SaveChangesAsync in clean architecture]

key-files:
  created:
    - api/src/WissensHub.Application/Interfaces/IUnitOfWork.cs
    - api/src/WissensHub.Application/Queries/GetFlaggedArticles/GetFlaggedArticlesQuery.cs
    - api/src/WissensHub.Application/Queries/GetFlaggedArticles/GetFlaggedArticlesHandler.cs
    - api/src/WissensHub.Application/Queries/GetFlaggedArticles/FlaggedArticleDto.cs
    - api/src/WissensHub.Application/Queries/GetApprovalHistory/GetApprovalHistoryQuery.cs
    - api/src/WissensHub.Application/Queries/GetApprovalHistory/GetApprovalHistoryHandler.cs
    - spfx/src/shared/models/domain/statusTransitions.ts
    - spfx/src/shared/hooks/queries/useFlaggedArticlesQuery.ts
    - spfx/src/shared/hooks/queries/useApprovalHistoryQuery.ts
    - spfx/src/shared/hooks/commands/useSubmitForReviewCommand.ts
    - spfx/src/shared/hooks/commands/useArchiveArticleCommand.ts
    - spfx/src/shared/hooks/commands/useRestoreArticleCommand.ts
  modified:
    - api/src/WissensHub.Application/Commands/ApproveArticle/ApproveArticleHandler.cs
    - api/src/WissensHub.Application/Commands/ApproveArticle/ApproveArticleValidator.cs
    - api/src/WissensHub.Functions/Functions/ArticleFunctions.cs
    - api/src/WissensHub.Functions/Functions/ApprovalFunctions.cs
    - api/src/WissensHub.Functions/Program.cs
    - api/src/WissensHub.Infrastructure/Data/WissensHubDbContext.cs
    - spfx/src/shared/interfaces/IApprovalService.ts
    - spfx/src/shared/interfaces/IFlagService.ts
    - spfx/src/shared/services/ApprovalService.ts
    - spfx/src/shared/services/FlagService.ts
    - spfx/src/shared/services/__mocks__/MockApprovalService.ts
    - spfx/src/shared/services/__mocks__/MockFlagService.ts
    - spfx/src/shared/services/__mocks__/mockData.ts
    - spfx/src/shared/hooks/queries/index.ts
    - spfx/src/shared/hooks/commands/index.ts
    - spfx/src/shared/models/domain/index.ts

key-decisions:
  - "IUnitOfWork interface instead of direct WissensHubDbContext in Application layer to maintain clean architecture (Application cannot reference Infrastructure)"
  - "ApprovalService sends capitalized action values (Approved/Rejected) matching backend FluentValidation rules"

patterns-established:
  - "IUnitOfWork pattern: Application layer defines interface, Infrastructure DbContext implements it, DI resolves via sp.GetRequiredService<WissensHubDbContext>()"
  - "State transition map: both backend (C# Dictionary) and frontend (TypeScript Record) define identical allowed transitions"

requirements-completed: [APPR-01, APPR-02, APPR-03, FREI-04]

# Metrics
duration: 7min
completed: 2026-03-16
---

# Phase 7 Plan 01: Backend & Frontend Shared Infrastructure Summary

**Real ApproveArticleHandler with 5-action state machine, flagged articles and approval history endpoints, extended frontend services with 5 new hooks and status transition utility**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-16T20:09:41Z
- **Completed:** 2026-03-16T20:16:54Z
- **Tasks:** 2
- **Files modified:** 28

## Accomplishments
- Replaced mock ApproveArticleHandler with real SQL operations validating 5 state transitions (Draft->InReview, InReview->Published/Draft, Published->Archived, Archived->Published)
- Added GET /api/articles/flagged and GET /api/articles/{pageId}/history query endpoints with MediatR
- Extended frontend IApprovalService to 7 methods and IFlagService to 2 methods with production + mock implementations
- Created 5 new React hooks (useFlaggedArticlesQuery, useApprovalHistoryQuery, useSubmitForReviewCommand, useArchiveArticleCommand, useRestoreArticleCommand)
- Created VALID_TRANSITIONS map and isValidTransition utility (ES5-safe with indexOf)

## Task Commits

Each task was committed atomically:

1. **Task 1: Backend - real ApproveArticleHandler + new query endpoints** - `b3425f6` (feat)
2. **Task 2: Frontend shared - extend services, hooks, status transitions** - `f57cfc6` (feat)

## Files Created/Modified
- `api/src/WissensHub.Application/Interfaces/IUnitOfWork.cs` - Clean architecture SaveChangesAsync abstraction
- `api/src/WissensHub.Application/Commands/ApproveArticle/ApproveArticleHandler.cs` - Real handler with state machine validation
- `api/src/WissensHub.Application/Commands/ApproveArticle/ApproveArticleValidator.cs` - Extended to accept 5 action types
- `api/src/WissensHub.Application/Queries/GetFlaggedArticles/*` - Query for unresolved flagged articles
- `api/src/WissensHub.Application/Queries/GetApprovalHistory/*` - Query for approval history by pageId
- `api/src/WissensHub.Functions/Functions/ArticleFunctions.cs` - Added GetFlaggedArticles endpoint
- `api/src/WissensHub.Functions/Functions/ApprovalFunctions.cs` - Added GetApprovalHistory endpoint
- `api/src/WissensHub.Functions/Program.cs` - Registered IUnitOfWork in DI
- `api/src/WissensHub.Infrastructure/Data/WissensHubDbContext.cs` - Implements IUnitOfWork
- `spfx/src/shared/models/domain/statusTransitions.ts` - VALID_TRANSITIONS and isValidTransition
- `spfx/src/shared/interfaces/IApprovalService.ts` - Extended with 4 new methods
- `spfx/src/shared/interfaces/IFlagService.ts` - Extended with getFlaggedArticles
- `spfx/src/shared/services/ApprovalService.ts` - 4 new methods, capitalized action values
- `spfx/src/shared/services/FlagService.ts` - Added getFlaggedArticles
- `spfx/src/shared/services/__mocks__/MockApprovalService.ts` - Full rewrite with state mutation + history
- `spfx/src/shared/services/__mocks__/MockFlagService.ts` - Added getFlaggedArticles
- `spfx/src/shared/services/__mocks__/mockData.ts` - Added MOCK_APPROVAL_HISTORY
- `spfx/src/shared/hooks/queries/useFlaggedArticlesQuery.ts` - Query hook for flagged articles
- `spfx/src/shared/hooks/queries/useApprovalHistoryQuery.ts` - Query hook for approval history
- `spfx/src/shared/hooks/commands/useSubmitForReviewCommand.ts` - Submit for review command
- `spfx/src/shared/hooks/commands/useArchiveArticleCommand.ts` - Archive article command
- `spfx/src/shared/hooks/commands/useRestoreArticleCommand.ts` - Restore article command

## Decisions Made
- **IUnitOfWork instead of WissensHubDbContext**: Application layer cannot reference Infrastructure (clean architecture). Created IUnitOfWork interface in Application, implemented on WissensHubDbContext, registered via DI factory.
- **Capitalized action values**: ApprovalService now sends 'Approved'/'Rejected' (not lowercase) to match backend FluentValidation rules.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created IUnitOfWork interface for clean architecture**
- **Found during:** Task 1 (ApproveArticleHandler implementation)
- **Issue:** Plan specified injecting WissensHubDbContext directly into handler, but Application project only references Domain (clean architecture) -- cannot reference Infrastructure.Data
- **Fix:** Created IUnitOfWork interface in Application.Interfaces, implemented on WissensHubDbContext, registered in DI container
- **Files modified:** api/src/WissensHub.Application/Interfaces/IUnitOfWork.cs (new), api/src/WissensHub.Infrastructure/Data/WissensHubDbContext.cs, api/src/WissensHub.Functions/Program.cs
- **Verification:** dotnet build succeeds with 0 errors
- **Committed in:** b3425f6 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential architectural fix. IUnitOfWork is the standard clean architecture pattern for this scenario. No scope creep.

## Issues Encountered
None beyond the IUnitOfWork deviation documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All backend endpoints ready for Freigabecenter web part (Plan 02) to consume
- All frontend hooks and services ready for Freigabecenter UI components
- VALID_TRANSITIONS utility available for Article Sidebar status display extensions
- Mock services provide realistic data for all new operations in workbench mode
- 56 existing tests continue to pass

## Self-Check: PASSED

All 12 created files verified present. Both task commits (b3425f6, f57cfc6) verified in git log.

---
*Phase: 07-approval-workflow-freigabecenter*
*Completed: 2026-03-16*
