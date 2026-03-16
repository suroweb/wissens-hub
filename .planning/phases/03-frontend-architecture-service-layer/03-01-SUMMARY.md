---
phase: 03-frontend-architecture-service-layer
plan: 01
subsystem: ui
tags: [spfx, pnpjs, react-context, typescript, role-detection, dependency-inversion]

requires:
  - phase: 01-project-scaffolding-local-dev
    provides: SPFx project scaffold with Heft toolchain, 4 web parts, React 17

provides:
  - Result<T> discriminated union with ok()/fail() helpers and AppError type
  - QueryState<T> and CommandState async state types
  - 6 domain model interfaces (IArticlePage, IUser, IReadConfirmation, IFlag, IFavorite, IApprovalAction)
  - 6 DTO types (ArticlePageDto, ReadConfirmationDto, FavoriteDto, FlagDto, ApprovalDto, DashboardStatsDto)
  - 6 service interfaces with Result<T> returns (IPageService, IApiClient, IReadConfirmationService, IFavoriteService, IFlagService, IApprovalService)
  - IServiceContainer interface with createServiceContainer factory
  - WissensHubContext with WissensHubProvider and useWissensHub hook
  - Role detection via resolveRole() mapping SharePoint groups to UserRole hierarchy
  - PnPjs v4 singleton via getSP()
  - RoleGate component with minimumRole threshold
  - ArticleStatus and UserRole type unions with ROLE_HIERARCHY constant
  - Complete shared/ folder structure with barrel exports

affects: [03-02, 03-03, 05, 06, 07, 08, 09, 10]

tech-stack:
  added: ["@pnp/sp@4.18.0", "@pnp/queryable@4.18.0", "@pnp/logging@4.18.0"]
  patterns: [Result<T> discriminated union, CQRS-lite state types, dependency-inverted service interfaces, React Context composition root, role hierarchy resolution, PnPjs singleton]

key-files:
  created:
    - spfx/src/shared/models/Result.ts
    - spfx/src/shared/models/AsyncState.ts
    - spfx/src/shared/models/domain/types.ts
    - spfx/src/shared/models/domain/IArticlePage.ts
    - spfx/src/shared/models/domain/IUser.ts
    - spfx/src/shared/models/domain/IReadConfirmation.ts
    - spfx/src/shared/models/domain/IFlag.ts
    - spfx/src/shared/models/domain/IFavorite.ts
    - spfx/src/shared/models/domain/IApprovalAction.ts
    - spfx/src/shared/models/dto/ArticlePageDto.ts
    - spfx/src/shared/models/dto/ReadConfirmationDto.ts
    - spfx/src/shared/models/dto/FavoriteDto.ts
    - spfx/src/shared/models/dto/FlagDto.ts
    - spfx/src/shared/models/dto/ApprovalDto.ts
    - spfx/src/shared/models/dto/DashboardStatsDto.ts
    - spfx/src/shared/interfaces/IPageService.ts
    - spfx/src/shared/interfaces/IApiClient.ts
    - spfx/src/shared/interfaces/IReadConfirmationService.ts
    - spfx/src/shared/interfaces/IFavoriteService.ts
    - spfx/src/shared/interfaces/IFlagService.ts
    - spfx/src/shared/interfaces/IApprovalService.ts
    - spfx/src/shared/context/pnpSetup.ts
    - spfx/src/shared/context/ServiceContainer.ts
    - spfx/src/shared/context/WissensHubContext.tsx
    - spfx/src/shared/components/RoleGate.tsx
  modified:
    - spfx/package.json

key-decisions:
  - "Used undefined instead of null for optional returns to comply with @rushstack/no-new-null lint rule"
  - "createPlaceholderServices() returns stub IServiceContainer where every method returns fail() -- replaced by real implementations in Plan 02"
  - "createServiceContainer is a pass-through factory -- Plan 02 will provide createMockServices() and createProductionServices()"
  - "PnPjs singleton uses undefined instead of null for module-level variable to match lint rules"
  - "RoleGate uses React.createElement instead of JSX fragments for null returns to avoid lint issues"

patterns-established:
  - "Result<T>: All service methods return Promise<Result<T>> -- no thrown exceptions for expected failures"
  - "ROLE_HIERARCHY: Array-indexed role comparison via indexOf() for readable hierarchy checks"
  - "getSP(): Module-level PnPjs singleton, initialized once per page from onInit()"
  - "WissensHubProvider: Composition root wrapping each web part's React tree"
  - "resolveRole(): Maps SharePoint group titles to highest applicable UserRole"
  - "RoleGate: Declarative role-based rendering with minimumRole threshold"
  - "Barrel exports: index.ts in every shared/ subfolder for clean imports"

requirements-completed: [ARCH-01, ARCH-02, ARCH-05, ARCH-06, ARCH-08, ARCH-09, ARCH-10, ROLE-01, ROLE-02, ROLE-03, ROLE-04]

duration: 5min
completed: 2026-03-16
---

# Phase 3 Plan 01: Shared Architecture Foundation Summary

**Result<T> type system, 6 service interfaces, WissensHubContext with SharePoint group-based role detection, PnPjs v4 singleton, and RoleGate component -- all with zero-warning Heft build**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-16T00:11:56Z
- **Completed:** 2026-03-16T00:16:43Z
- **Tasks:** 2
- **Files modified:** 31

## Accomplishments
- Installed PnPjs v4.18.0 (@pnp/sp, @pnp/queryable, @pnp/logging) and deleted old common/ skeleton
- Created complete type system: Result<T> with AppError, QueryState<T>, CommandState, 6 domain models, 6 DTOs
- Defined 6 service interfaces (IPageService, IApiClient, IReadConfirmationService, IFavoriteService, IFlagService, IApprovalService) with Result<T> returns
- Built WissensHubContext with role detection resolving SharePoint group membership to UserRole hierarchy
- Created RoleGate component for declarative role-based UI rendering

## Task Commits

Each task was committed atomically:

1. **Task 1: Install PnPjs, create shared/ types and service interfaces** - `69360fc` (feat)
2. **Task 2: Create WissensHubContext, role detection, PnPjs singleton, RoleGate** - `26f9252` (feat)

## Files Created/Modified
- `spfx/package.json` - Added @pnp/sp, @pnp/queryable, @pnp/logging v4.18.0
- `spfx/src/shared/models/Result.ts` - Result<T> discriminated union, AppError type, ok()/fail() helpers
- `spfx/src/shared/models/AsyncState.ts` - QueryState<T> and CommandState discriminated unions
- `spfx/src/shared/models/domain/types.ts` - ArticleStatus, UserRole, ROLE_HIERARCHY
- `spfx/src/shared/models/domain/IArticlePage.ts` - Article page domain model
- `spfx/src/shared/models/domain/IUser.ts` - IUser and ICurrentUser interfaces
- `spfx/src/shared/models/domain/IReadConfirmation.ts` - Read confirmation domain model
- `spfx/src/shared/models/domain/IFlag.ts` - Flag domain model
- `spfx/src/shared/models/domain/IFavorite.ts` - Favorite domain model
- `spfx/src/shared/models/domain/IApprovalAction.ts` - Approval action domain model
- `spfx/src/shared/models/dto/ArticlePageDto.ts` - SharePoint page DTO with WH_ prefixed fields
- `spfx/src/shared/models/dto/ReadConfirmationDto.ts` - API read confirmation DTO
- `spfx/src/shared/models/dto/FavoriteDto.ts` - API favorite DTO
- `spfx/src/shared/models/dto/FlagDto.ts` - API flag DTO
- `spfx/src/shared/models/dto/ApprovalDto.ts` - API approval DTO
- `spfx/src/shared/models/dto/DashboardStatsDto.ts` - Dashboard stats DTO
- `spfx/src/shared/interfaces/IPageService.ts` - Page service contract
- `spfx/src/shared/interfaces/IApiClient.ts` - HTTP client contract
- `spfx/src/shared/interfaces/IReadConfirmationService.ts` - Read confirmation service contract
- `spfx/src/shared/interfaces/IFavoriteService.ts` - Favorite service contract
- `spfx/src/shared/interfaces/IFlagService.ts` - Flag service contract
- `spfx/src/shared/interfaces/IApprovalService.ts` - Approval service contract
- `spfx/src/shared/context/pnpSetup.ts` - PnPjs v4 singleton with getSP()
- `spfx/src/shared/context/ServiceContainer.ts` - IServiceContainer interface and pass-through factory
- `spfx/src/shared/context/WissensHubContext.tsx` - WissensHubProvider, useWissensHub hook, resolveRole()
- `spfx/src/shared/components/RoleGate.tsx` - Role-based conditional rendering component

## Decisions Made
- Used `undefined` instead of `null` for optional returns to comply with @rushstack/no-new-null ESLint rule
- createServiceContainer is a simple pass-through factory -- Plan 02 will add createMockServices() and createProductionServices()
- createPlaceholderServices() provides stub IServiceContainer where every method returns fail({ code: 'UNKNOWN', message: 'Service not yet implemented' }) -- keeps build green before Plan 02
- PnPjs module-level singleton uses `undefined` instead of `null` for consistency with lint rules

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Changed null to undefined for Rushstack lint compliance**
- **Found during:** Task 1 (Type definitions)
- **Issue:** Plan specified `null` in IReadConfirmationService.getReadStatus return type and ApprovalDto.comment, but @rushstack/no-new-null lint rule forbids null in new code
- **Fix:** Changed `IReadConfirmation | null` to `IReadConfirmation | undefined` and `string | null` to optional `string?`
- **Files modified:** spfx/src/shared/interfaces/IReadConfirmationService.ts, spfx/src/shared/models/dto/ApprovalDto.ts
- **Verification:** Heft build passes with 0 warnings
- **Committed in:** 69360fc (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Minor type change for lint compliance. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All type contracts and service interfaces ready for Plan 02 (service implementations) and Plan 03 (hooks)
- WissensHubContext with placeholder services compiles and will be hot-swapped with real services in Plan 02
- RoleGate component ready for use in any web part starting Phase 5
- PnPjs installed and getSP() singleton ready for SharePointPageService implementation

## Self-Check: PASSED

All 32 created files verified on disk. Both task commits (69360fc, 26f9252) verified in git log.

---
*Phase: 03-frontend-architecture-service-layer*
*Completed: 2026-03-16*
