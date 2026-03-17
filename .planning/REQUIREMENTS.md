# Requirements: WissensHub

**Defined:** 2026-03-14
**Core Value:** Employees can find, read, and confirm mandatory knowledge articles through a central hub with role-based workflows

## v1 Requirements

### Infrastructure & Foundation

- [x] **INFRA-01**: SPFx 1.22.2 solution scaffolded with Heft toolchain, Node.js 22 LTS, React 17, TypeScript 5.8
- [x] **INFRA-02**: All scaffolded class components converted to functional components with hooks
- [x] **INFRA-03**: Azure Functions project (.NET 10, Isolated Worker, C# 14) with EF Core 10
- [x] **INFRA-04**: Azure SQL database schema created via EF Core code-first migrations (ArticleMetadata, ReadConfirmations, ArticleFlags, Favorites, ApprovalHistory tables)
- [x] **INFRA-05**: Docker Compose with SQL Server 2022 for local development
- [ ] **INFRA-06**: Entra ID app registration with AadHttpClient for SPFx-to-Azure Functions authentication
- [x] **INFRA-07**: SharePoint Communication Site provisioned with custom columns on Site Pages (Category, Status, TargetGroups, IsMandatory, Reviewer, ReviewByDate)
- [x] **INFRA-08**: SharePoint Groups created (WissensHub Members, WissensHub Editors, WissensHub Reviewers, WissensHub Owners)

### Shared Architecture

- [x] **ARCH-01**: WissensHubContext providing current user info, role, and service container to all web parts
- [x] **ARCH-02**: Service container with dependency-inverted interfaces (IPageService, IApiClient, IReadConfirmationService, IFavoriteService, IFlagService, IApprovalService)
- [x] **ARCH-03**: Production service implementations (SharePointPageService, AzureApiClient, ReadConfirmationService, FavoriteService, FlagService, ApprovalService)
- [x] **ARCH-04**: Mock service implementations for testing and local dev
- [x] **ARCH-05**: Result<T> pattern for all service calls — no thrown exceptions for expected failures
- [x] **ARCH-06**: Domain models separate from DTOs with mapper layer (dto → domain transformers)
- [x] **ARCH-07**: CQRS-lite hooks — separate query hooks (read operations) from command hooks (write operations)
- [x] **ARCH-08**: QueryState<T> and CommandState types for consistent async state handling
- [x] **ARCH-09**: RoleGate wrapper component for role-based UI visibility
- [x] **ARCH-10**: Role detection via sp.web.currentUser.groups() — highest applicable role stored in context

### Roles & Permissions

- [x] **ROLE-01**: Reader can browse dashboard, read articles, mark as read, flag outdated, manage favorites
- [x] **ROLE-02**: Editor can do everything Reader can + create/edit pages, set metadata, assign target groups, submit for review
- [x] **ROLE-03**: Reviewer can do everything Reader can + approve/reject articles, view read confirmation reports
- [x] **ROLE-04**: Admin can do everything above + access admin panel, configure categories/target groups/reminders, export reports

### Dashboard Web Part

- [x] **DASH-01**: User can view all published articles in a card grid or compact list view (toggle)
- [x] **DASH-02**: User can see unread mandatory articles with reminder badges
- [x] **DASH-03**: User can see recently updated articles
- [x] **DASH-04**: User can toggle favorites (star/unstar) from the dashboard
- [x] **DASH-05**: User can see stats bar showing unread count, favorites count, pending reviews count
- [x] **DASH-06**: User can filter articles by category, status, and target group
- [x] **DASH-07**: User can search across article titles and page body content via SharePoint Search API
- [x] **DASH-08**: User can click an article to navigate to the actual SharePoint page
- [x] **DASH-09**: Editor can see "New Article" button on dashboard
- [x] **DASH-10**: Reviewer can see "Pending Reviews" section on dashboard

### Article Sidebar Web Part

- [x] **SIDE-01**: User can see article metadata (author, category, version, last updated, status, target groups)
- [x] **SIDE-02**: User can mark article as read via button — saves to Azure SQL via API
- [x] **SIDE-03**: User can see their read status ("You confirmed this on [date]" or unread badge)
- [x] **SIDE-04**: User can flag article as outdated with reason — saves to Azure SQL via API
- [x] **SIDE-05**: User can toggle favorite from sidebar
- [x] **SIDE-06**: User can see dynamic table of contents generated from page headings
- [x] **SIDE-07**: User can access version history link
- [x] **SIDE-08**: Editor can see "Edit Metadata" button on sidebar

### Freigabecenter Web Part

- [x] **FREI-01**: Reviewer can see list of articles pending approval with status
- [x] **FREI-02**: Reviewer can approve an article with optional comment
- [x] **FREI-03**: Reviewer can reject an article with comment
- [x] **FREI-04**: Reviewer can see list of articles flagged as outdated
- [x] **FREI-05**: Reviewer can see content freshness alerts (articles not reviewed in X days)
- [x] **FREI-06**: Reviewer can filter by assigned reviewer

### Unread Badge Application Customizer

- [x] **BADGE-01**: User can see notification icon with unread count in header on every page in the hub
- [x] **BADGE-02**: User can click notification icon to open flyout panel with unread article summaries
- [x] **BADGE-03**: User can click article in flyout to navigate directly to the article page

### Admin Panel Web Part

- [x] **ADMIN-01**: Admin can add, edit, and remove article categories
- [x] **ADMIN-02**: Admin can configure target groups (select from SharePoint groups)
- [x] **ADMIN-03**: Admin can configure reminder intervals
- [x] **ADMIN-04**: Admin can view read confirmation report per article (who read, who didn't, when)
- [x] **ADMIN-05**: Admin can export read confirmation reports (CSV/Excel)
- [x] **ADMIN-06**: Admin can see overview of all articles by status, freshness, and flag count

### Read Confirmations

- [x] **READ-01**: Read confirmation saved to Azure SQL with PageId, UserId, UserDisplayName, ReadDate
- [x] **READ-02**: Read confirmations reset when an article is significantly updated (forces re-read for compliance)
- [x] **READ-03**: Unread count cross-referenced between Site Pages and ReadConfirmations table

### Approval Workflow

- [x] **APPR-01**: Article status transitions: Draft → InReview → Published → Archived
- [x] **APPR-02**: Approval/rejection action saved to ApprovalHistory with ActionBy, ActionDate, Comment
- [x] **APPR-03**: Status change updates both SharePoint page column and Azure SQL ArticleMetadata

### Reminders

- [x] **RMND-01**: Dashboard shows badges for unread mandatory articles
- [x] **RMND-02**: Email notifications sent for overdue mandatory articles (configurable intervals)

### Azure Functions API

- [x] **API-01**: GET /api/articles/{pageId}/status — metadata + read status for current user
- [x] **API-02**: GET /api/articles/unread — all unread articles for current user
- [x] **API-03**: POST /api/articles/{pageId}/read — mark as read
- [x] **API-04**: POST /api/articles/{pageId}/flag — flag as outdated
- [x] **API-05**: GET /api/articles/{pageId}/readstats — who read, who didn't (reviewer/admin)
- [x] **API-06**: POST /api/articles/{pageId}/approve — approve/reject
- [x] **API-07**: GET /api/favorites — user's favorites
- [x] **API-08**: POST /api/favorites/{pageId} — toggle favorite
- [x] **API-09**: GET /api/dashboard/stats — unread count, favorites count, pending reviews count
- [x] **API-10**: GET /api/admin/reports — exportable read confirmation reports

### Backend Architecture

- [x] **BACK-01**: MediatR CQRS pattern — commands and queries separated with handlers
- [x] **BACK-02**: FluentValidation for request validation
- [x] **BACK-03**: MediatR pipeline behaviors: ValidationBehavior, LoggingBehavior, ExceptionBehavior
- [x] **BACK-04**: Repository pattern (IReadConfirmationRepository, IFavoriteRepository, IFlagRepository, IApprovalRepository)
- [x] **BACK-05**: EF Core entity configurations for all tables
- [x] **BACK-06**: Entra ID bearer token authentication on all endpoints

### Caching

- [ ] **CACH-01**: PnPjs session cache for SharePoint page queries (5 min TTL)
- [x] **CACH-02**: In-memory API cache with TTL for Azure Functions responses
- [ ] **CACH-03**: Stale-while-revalidate pattern in query hooks
- [ ] **CACH-04**: Cache invalidation on write commands (mark-as-read invalidates articles/unread caches)

### Telemetry & Error Handling

- [x] **TELE-01**: Application Insights single instance for frontend + backend
- [x] **TELE-02**: Cost-safe configuration — disableFetchTracking, disableAjaxTracking enabled
- [ ] **TELE-03**: Custom events tracked: article_read, article_flagged, article_favorited, article_approved, article_rejected, dashboard_loaded, search_executed, error_api_call, error_sharepoint
- [x] **TELE-04**: ConsoleTelemetryService for local dev, AppInsightsTelemetryService for production
- [x] **TELE-05**: React Error Boundary wrapping each web part root
- [x] **TELE-06**: Toast notifications via Fluent UI MessageBar for user-facing messages

### UX Quality

- [ ] **UX-01**: Optimistic UI updates for mark-as-read and favorite toggle
- [ ] **UX-02**: Loading skeletons with Fluent UI Shimmer (not spinners)
- [ ] **UX-03**: Debounced search input
- [ ] **UX-04**: Responsive design for full-width, 2/3, and 1/3 column zones
- [ ] **UX-05**: Accessibility — ARIA labels, keyboard navigation, focus management

### Internationalization

- [ ] **I18N-01**: i18n framework with German as default language
- [ ] **I18N-02**: English as secondary language
- [ ] **I18N-03**: All UI labels, messages, and tooltips localized

### Testing

- [ ] **TEST-01**: Jest unit tests for frontend services, hooks, and components
- [ ] **TEST-02**: .NET integration tests for Azure Functions API layer
- [ ] **TEST-03**: Playwright E2E tests for critical user flows

### DevOps & Deployment

- [x] **DEVP-01**: PnP PowerShell provisioning script (site, groups, columns, pages, navigation, sample data)
- [ ] **DEVP-02**: Azure Bicep modules (Functions App, SQL Server, App Insights, Key Vault, Storage Account)
- [ ] **DEVP-03**: GitHub Actions CI pipeline (build + test on PR)
- [ ] **DEVP-04**: GitHub Actions CD pipeline (build + test + deploy on merge to main)
- [ ] **DEVP-05**: SPFx deployment via CLI for Microsoft 365
- [ ] **DEVP-06**: EF Core migration execution in CD pipeline
- [ ] **DEVP-07**: Federated identity (OIDC) for Azure and M365 — no stored secrets
- [ ] **DEVP-08**: README.md with architecture diagram, setup guide (local + production), API documentation

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Search

- **SRCH-01**: AI-powered search recommendations
- **SRCH-02**: Search analytics (popular queries, zero-result queries)

### Notifications

- **NOTF-01**: Power Automate integration for advanced notification workflows
- **NOTF-02**: Microsoft Teams notifications for article assignments

### Analytics

- **ANLY-01**: Knowledge engagement analytics dashboard
- **ANLY-02**: Category popularity trends

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chat | Not relevant to knowledge management |
| Video hosting | Storage/bandwidth complexity, not needed for text-focused KM |
| Mobile app | SharePoint responsive design is sufficient |
| React 18 | Locked to React 17 by SPFx 1.22.2 |
| Fluent UI v9 | TypeScript/React 17 compatibility issues in SPFx |
| Custom rich text editor | SharePoint Modern Pages already provide world-class editing |
| AI-powered search | Massive scope increase, not the point of this portfolio project |
| Multi-tenant support | Single-tenant deployment, each org deploys their own instance |
| Offline mode / PWA | SharePoint is inherently online |
| Workflow engine/designer | Hardcoded 4-state workflow is sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 | Complete |
| INFRA-05 | Phase 1 | Complete |
| INFRA-06 | Phase 2 | Pending |
| INFRA-07 | Phase 2 | Complete |
| INFRA-08 | Phase 2 | Complete |
| ARCH-01 | Phase 3 | Complete |
| ARCH-02 | Phase 3 | Complete |
| ARCH-03 | Phase 3 | Complete |
| ARCH-04 | Phase 3 | Complete |
| ARCH-05 | Phase 3 | Complete |
| ARCH-06 | Phase 3 | Complete |
| ARCH-07 | Phase 3 | Complete |
| ARCH-08 | Phase 3 | Complete |
| ARCH-09 | Phase 3 | Complete |
| ARCH-10 | Phase 3 | Complete |
| ROLE-01 | Phase 3 | Complete |
| ROLE-02 | Phase 3 | Complete |
| ROLE-03 | Phase 3 | Complete |
| ROLE-04 | Phase 3 | Complete |
| DASH-01 | Phase 5 | Complete |
| DASH-02 | Phase 5 | Complete |
| DASH-03 | Phase 5 | Complete |
| DASH-04 | Phase 5 | Complete |
| DASH-05 | Phase 5 | Complete |
| DASH-06 | Phase 5 | Complete |
| DASH-07 | Phase 5 | Complete |
| DASH-08 | Phase 5 | Complete |
| DASH-09 | Phase 5 | Complete |
| DASH-10 | Phase 5 | Complete |
| SIDE-01 | Phase 6 | Complete |
| SIDE-02 | Phase 6 | Complete |
| SIDE-03 | Phase 6 | Complete |
| SIDE-04 | Phase 6 | Complete |
| SIDE-05 | Phase 6 | Complete |
| SIDE-06 | Phase 6 | Complete |
| SIDE-07 | Phase 6 | Complete |
| SIDE-08 | Phase 6 | Complete |
| FREI-01 | Phase 7 | Complete |
| FREI-02 | Phase 7 | Complete |
| FREI-03 | Phase 7 | Complete |
| FREI-04 | Phase 7 | Complete |
| FREI-05 | Phase 7 | Complete |
| FREI-06 | Phase 7 | Complete |
| BADGE-01 | Phase 8 | Complete |
| BADGE-02 | Phase 8 | Complete |
| BADGE-03 | Phase 8 | Complete |
| ADMIN-01 | Phase 9 | Complete |
| ADMIN-02 | Phase 9 | Complete |
| ADMIN-03 | Phase 9 | Complete |
| ADMIN-04 | Phase 9 | Complete |
| ADMIN-05 | Phase 9 | Complete |
| ADMIN-06 | Phase 9 | Complete |
| READ-01 | Phase 6 | Complete |
| READ-02 | Phase 6 | Complete |
| READ-03 | Phase 6 | Complete |
| APPR-01 | Phase 7 | Complete |
| APPR-02 | Phase 7 | Complete |
| APPR-03 | Phase 7 | Complete |
| RMND-01 | Phase 5 | Complete |
| RMND-02 | Phase 9 | Complete |
| API-01 | Phase 4 | Complete |
| API-02 | Phase 4 | Complete |
| API-03 | Phase 4 | Complete |
| API-04 | Phase 4 | Complete |
| API-05 | Phase 4 | Complete |
| API-06 | Phase 4 | Complete |
| API-07 | Phase 4 | Complete |
| API-08 | Phase 4 | Complete |
| API-09 | Phase 4 | Complete |
| API-10 | Phase 4 | Complete |
| BACK-01 | Phase 4 | Complete |
| BACK-02 | Phase 4 | Complete |
| BACK-03 | Phase 4 | Complete |
| BACK-04 | Phase 4 | Complete |
| BACK-05 | Phase 4 | Complete |
| BACK-06 | Phase 4 | Complete |
| CACH-01 | Phase 10 | Pending |
| CACH-02 | Phase 10 | Complete |
| CACH-03 | Phase 10 | Pending |
| CACH-04 | Phase 10 | Pending |
| TELE-01 | Phase 10 | Complete |
| TELE-02 | Phase 10 | Complete |
| TELE-03 | Phase 10 | Pending |
| TELE-04 | Phase 10 | Complete |
| TELE-05 | Phase 10 | Complete |
| TELE-06 | Phase 10 | Complete |
| UX-01 | Phase 10 | Pending |
| UX-02 | Phase 10 | Pending |
| UX-03 | Phase 10 | Pending |
| UX-04 | Phase 10 | Pending |
| UX-05 | Phase 10 | Pending |
| I18N-01 | Phase 10 | Pending |
| I18N-02 | Phase 10 | Pending |
| I18N-03 | Phase 10 | Pending |
| TEST-01 | Phase 11 | Pending |
| TEST-02 | Phase 11 | Pending |
| TEST-03 | Phase 11 | Pending |
| DEVP-01 | Phase 2 | Complete |
| DEVP-02 | Phase 12 | Pending |
| DEVP-03 | Phase 12 | Pending |
| DEVP-04 | Phase 12 | Pending |
| DEVP-05 | Phase 12 | Pending |
| DEVP-06 | Phase 12 | Pending |
| DEVP-07 | Phase 12 | Pending |
| DEVP-08 | Phase 12 | Pending |

**Coverage:**
- v1 requirements: 108 total
- Mapped to phases: 108
- Unmapped: 0

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 after roadmap creation (traceability populated)*
