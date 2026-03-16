---
phase: 03-frontend-architecture-service-layer
plan: 02
subsystem: ui
tags: [spfx, pnpjs, aad-http-client, mock-services, mappers, dependency-inversion, react-context]

requires:
  - phase: 03-frontend-architecture-service-layer
    provides: Result<T> type system, 6 service interfaces, IServiceContainer, WissensHubContext, PnPjs singleton

provides:
  - 5 DTO-to-domain mappers with type coercion (dates, booleans, German locale)
  - AzureApiClient wrapping AadHttpClient with Result<T> error handling
  - SharePointPageService querying SitePages via PnPjs with WH_ column expansion
  - 4 API-dependent production services (ReadConfirmation, Favorite, Flag, Approval)
  - createProductionServices factory wiring all production services
  - 6 mock services with German data and configurable latency
  - Mock data module with 10 articles, 5 categories, 4 target groups
  - createMockServices factory for workbench development
  - WissensHubContext auto-detecting production vs mock mode

affects: [03-03, 05, 06, 07, 08, 09, 10]

tech-stack:
  added: []
  patterns: [DTO-to-domain mappers, AadHttpClient wrapper with Result<T>, mock service factory with session state, environment-based service selection]

key-files:
  created:
    - spfx/src/shared/mappers/articleMapper.ts
    - spfx/src/shared/mappers/readConfirmationMapper.ts
    - spfx/src/shared/mappers/favoriteMapper.ts
    - spfx/src/shared/mappers/flagMapper.ts
    - spfx/src/shared/mappers/approvalMapper.ts
    - spfx/src/shared/mappers/index.ts
    - spfx/src/shared/services/AzureApiClient.ts
    - spfx/src/shared/services/SharePointPageService.ts
    - spfx/src/shared/services/ReadConfirmationService.ts
    - spfx/src/shared/services/FavoriteService.ts
    - spfx/src/shared/services/FlagService.ts
    - spfx/src/shared/services/ApprovalService.ts
    - spfx/src/shared/services/index.ts
    - spfx/src/shared/services/__mocks__/mockData.ts
    - spfx/src/shared/services/__mocks__/MockPageService.ts
    - spfx/src/shared/services/__mocks__/MockApiClient.ts
    - spfx/src/shared/services/__mocks__/MockReadConfirmationService.ts
    - spfx/src/shared/services/__mocks__/MockFavoriteService.ts
    - spfx/src/shared/services/__mocks__/MockFlagService.ts
    - spfx/src/shared/services/__mocks__/MockApprovalService.ts
    - spfx/src/shared/services/__mocks__/index.ts
  modified:
    - spfx/src/shared/context/WissensHubContext.tsx

key-decisions:
  - "Used undefined instead of null in ReadConfirmationService.getReadStatus to match Plan 01 lint decision"
  - "Mock services store mutable state via shallow copies so mutations persist within session but reset on reload"
  - "Mock mode uses MOCK_CURRENT_USER constant instead of spContext.pageContext.user for consistent workbench identity"
  - "apiBaseUrl uses non-null assertion (!) in production path since aadClient presence guarantees config availability"

patterns-established:
  - "DTO-to-domain mappers: Pure functions converting API/SharePoint DTOs to domain models with type coercion"
  - "parseBooleanField: Handles German (Ja/Nein), English (Yes/No), and raw (true/false, 1/0) boolean strings"
  - "AzureApiClient: Wraps AadHttpClient with Result<T>, maps HTTP status codes to AppError codes"
  - "Mock latency: All mock services use delay() with configurable MOCK_DELAY (300ms default, 0ms in test)"
  - "Environment detection: aadClient !== undefined means production, undefined means workbench/mock"

requirements-completed: [ARCH-03, ARCH-04, ARCH-06]

duration: 3min
completed: 2026-03-16
---

# Phase 3 Plan 02: Service Implementations Summary

**6 production services with PnPjs/AadHttpClient, 6 mock services with German data and configurable latency, 5 DTO-to-domain mappers, and auto-detecting WissensHubContext**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-16T00:20:39Z
- **Completed:** 2026-03-16T00:24:26Z
- **Tasks:** 2
- **Files modified:** 22

## Accomplishments
- Created 5 pure DTO-to-domain mappers handling type coercion (string dates to Date, German boolean strings)
- Built AzureApiClient wrapping AadHttpClient with Result<T> error handling for GET/POST
- Built SharePointPageService querying SitePages via PnPjs with WH_ column expansion and FieldValuesAsText
- Implemented 4 API-dependent production services delegating to IApiClient with proper mapper application
- Created comprehensive mock data module: 10 German articles across all statuses, 5 categories, 4 target groups, read confirmations, favorites, flags
- Built 6 mock services with configurable latency and mutable session state
- Wired WissensHubContext to auto-detect environment and create production or mock services

## Task Commits

Each task was committed atomically:

1. **Task 1: Create mappers, production services, and AzureApiClient** - `5a201ef` (feat)
2. **Task 2: Create mock services, mock data, and wire into WissensHubContext** - `a4098a8` (feat)

## Files Created/Modified
- `spfx/src/shared/mappers/articleMapper.ts` - Converts ArticlePageDto to IArticlePage with German boolean parsing
- `spfx/src/shared/mappers/readConfirmationMapper.ts` - Converts ReadConfirmationDto to IReadConfirmation
- `spfx/src/shared/mappers/favoriteMapper.ts` - Converts FavoriteDto to IFavorite
- `spfx/src/shared/mappers/flagMapper.ts` - Converts FlagDto to IFlag
- `spfx/src/shared/mappers/approvalMapper.ts` - Converts ApprovalDto to IApprovalAction
- `spfx/src/shared/mappers/index.ts` - Barrel exports for all mappers
- `spfx/src/shared/services/AzureApiClient.ts` - Production IApiClient wrapping AadHttpClient
- `spfx/src/shared/services/SharePointPageService.ts` - Production IPageService using PnPjs
- `spfx/src/shared/services/ReadConfirmationService.ts` - Production read confirmation service
- `spfx/src/shared/services/FavoriteService.ts` - Production favorite service
- `spfx/src/shared/services/FlagService.ts` - Production flag service
- `spfx/src/shared/services/ApprovalService.ts` - Production approval service
- `spfx/src/shared/services/index.ts` - Barrel exports and createProductionServices factory
- `spfx/src/shared/services/__mocks__/mockData.ts` - German mock data: 10 articles, categories, target groups, confirmations, favorites, flags
- `spfx/src/shared/services/__mocks__/MockPageService.ts` - Mock page service filtering by status
- `spfx/src/shared/services/__mocks__/MockApiClient.ts` - Stub API client for completeness
- `spfx/src/shared/services/__mocks__/MockReadConfirmationService.ts` - Mock with mutable read state
- `spfx/src/shared/services/__mocks__/MockFavoriteService.ts` - Mock with toggle support
- `spfx/src/shared/services/__mocks__/MockFlagService.ts` - Mock with flag accumulation
- `spfx/src/shared/services/__mocks__/MockApprovalService.ts` - Mock filtering InReview articles
- `spfx/src/shared/services/__mocks__/index.ts` - Barrel exports and createMockServices factory
- `spfx/src/shared/context/WissensHubContext.tsx` - Updated to use real service factories, removed placeholders

## Decisions Made
- Used `undefined` instead of `null` in ReadConfirmationService.getReadStatus return type to match Plan 01's lint compliance decision (no-new-null rule)
- Mock services maintain mutable session state via shallow copies of mock data arrays, resetting on page reload
- Mock mode uses MOCK_CURRENT_USER constant (Max Mustermann) for consistent workbench identity rather than trying to access spContext.pageContext.user
- Non-null assertion on apiBaseUrl in production path since aadClient presence guarantees configuration availability

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All service implementations complete, ready for Plan 03 (CQRS-lite hooks consuming services)
- Mock services enable immediate workbench development with realistic German data
- Production services structurally complete, awaiting API deployment (Phase 4) for end-to-end testing
- WissensHubContext composition root fully wired, each web part gets real services automatically

## Self-Check: PASSED

All 22 created/modified files verified on disk. Both task commits (5a201ef, a4098a8) verified in git log.

---
*Phase: 03-frontend-architecture-service-layer*
*Completed: 2026-03-16*
