# Requirements: WissensHub

**Defined:** 2026-03-14
**Core Value:** Employees can find, read, and confirm mandatory knowledge articles through a central hub with role-based workflows

## v1 Requirements

### Infrastructure & Foundation

- [ ] **INFRA-01**: SPFx 1.22.2 solution scaffolded with Heft toolchain, Node.js 22 LTS, React 17, TypeScript 5.8
- [ ] **INFRA-02**: All scaffolded class components converted to functional components with hooks
- [ ] **INFRA-03**: Azure Functions project (.NET 10, Isolated Worker, C# 14) with EF Core 10
- [ ] **INFRA-04**: Azure SQL database schema created via EF Core code-first migrations (ArticleMetadata, ReadConfirmations, ArticleFlags, Favorites, ApprovalHistory tables)
- [ ] **INFRA-05**: Docker Compose with Azure SQL Edge for local development
- [ ] **INFRA-06**: Entra ID app registration with AadHttpClient for SPFx-to-Azure Functions authentication
- [ ] **INFRA-07**: SharePoint Communication Site provisioned with custom columns on Site Pages (Category, Status, TargetGroups, IsMandatory, Reviewer, ReviewByDate)
- [ ] **INFRA-08**: SharePoint Groups created (WissensHub Members, WissensHub Editors, WissensHub Reviewers, WissensHub Owners)

### Shared Architecture

- [ ] **ARCH-01**: WissensHubContext providing current user info, role, and service container to all web parts
- [ ] **ARCH-02**: Service container with dependency-inverted interfaces (IPageService, IApiClient, IReadConfirmationService, IFavoriteService, IFlagService, IApprovalService)
- [ ] **ARCH-03**: Production service implementations (SharePointPageService, AzureApiClient, ReadConfirmationService, FavoriteService, FlagService, ApprovalService)
- [ ] **ARCH-04**: Mock service implementations for testing and local dev
- [ ] **ARCH-05**: Result<T> pattern for all service calls — no thrown exceptions for expected failures
- [ ] **ARCH-06**: Domain models separate from DTOs with mapper layer (dto → domain transformers)
- [ ] **ARCH-07**: CQRS-lite hooks — separate query hooks (read operations) from command hooks (write operations)
- [ ] **ARCH-08**: QueryState<T> and CommandState types for consistent async state handling
- [ ] **ARCH-09**: RoleGate wrapper component for role-based UI visibility
- [ ] **ARCH-10**: Role detection via sp.web.currentUser.groups() — highest applicable role stored in context

### Roles & Permissions

- [ ] **ROLE-01**: Reader can browse dashboard, read articles, mark as read, flag outdated, manage favorites
- [ ] **ROLE-02**: Editor can do everything Reader can + create/edit pages, set metadata, assign target groups, submit for review
- [ ] **ROLE-03**: Reviewer can do everything Reader can + approve/reject articles, view read confirmation reports
- [ ] **ROLE-04**: Admin can do everything above + access admin panel, configure categories/target groups/reminders, export reports

### Dashboard Web Part

- [ ] **DASH-01**: User can view all published articles in a card grid or compact list view (toggle)
- [ ] **DASH-02**: User can see unread mandatory articles with reminder badges
- [ ] **DASH-03**: User can see recently updated articles
- [ ] **DASH-04**: User can toggle favorites (star/unstar) from the dashboard
- [ ] **DASH-05**: User can see stats bar showing unread count, favorites count, pending reviews count
- [ ] **DASH-06**: User can filter articles by category, status, and target group
- [ ] **DASH-07**: User can search across article titles and page body content via SharePoint Search API
- [ ] **DASH-08**: User can click an article to navigate to the actual SharePoint page
- [ ] **DASH-09**: Editor can see "New Article" button on dashboard
- [ ] **DASH-10**: Reviewer can see "Pending Reviews" section on dashboard

### Article Sidebar Web Part

- [ ] **SIDE-01**: User can see article metadata (author, category, version, last updated, status, target groups)
- [ ] **SIDE-02**: User can mark article as read via button — saves to Azure SQL via API
- [ ] **SIDE-03**: User can see their read status ("You confirmed this on [date]" or unread badge)
- [ ] **SIDE-04**: User can flag article as outdated with reason — saves to Azure SQL via API
- [ ] **SIDE-05**: User can toggle favorite from sidebar
- [ ] **SIDE-06**: User can see dynamic table of contents generated from page headings
- [ ] **SIDE-07**: User can access version history link
- [ ] **SIDE-08**: Editor can see "Edit Metadata" button on sidebar

### Freigabecenter Web Part

- [ ] **FREI-01**: Reviewer can see list of articles pending approval with status
- [ ] **FREI-02**: Reviewer can approve an article with optional comment
- [ ] **FREI-03**: Reviewer can reject an article with comment
- [ ] **FREI-04**: Reviewer can see list of articles flagged as outdated
- [ ] **FREI-05**: Reviewer can see content freshness alerts (articles not reviewed in X days)
- [ ] **FREI-06**: Reviewer can filter by assigned reviewer

### Unread Badge Application Customizer

- [ ] **BADGE-01**: User can see notification icon with unread count in header on every page in the hub
- [ ] **BADGE-02**: User can click notification icon to open flyout panel with unread article summaries
- [ ] **BADGE-03**: User can click article in flyout to navigate directly to the article page

### Admin Panel Web Part

- [ ] **ADMIN-01**: Admin can add, edit, and remove article categories
- [ ] **ADMIN-02**: Admin can configure target groups (select from SharePoint groups)
- [ ] **ADMIN-03**: Admin can configure reminder intervals
- [ ] **ADMIN-04**: Admin can view read confirmation report per article (who read, who didn't, when)
- [ ] **ADMIN-05**: Admin can export read confirmation reports (CSV/Excel)
- [ ] **ADMIN-06**: Admin can see overview of all articles by status, freshness, and flag count

### Read Confirmations

- [ ] **READ-01**: Read confirmation saved to Azure SQL with PageId, UserId, UserDisplayName, ReadDate
- [ ] **READ-02**: Read confirmations reset when an article is significantly updated (forces re-read for compliance)
- [ ] **READ-03**: Unread count cross-referenced between Site Pages and ReadConfirmations table

### Approval Workflow

- [ ] **APPR-01**: Article status transitions: Draft → InReview → Published → Archived
- [ ] **APPR-02**: Approval/rejection action saved to ApprovalHistory with ActionBy, ActionDate, Comment
- [ ] **APPR-03**: Status change updates both SharePoint page column and Azure SQL ArticleMetadata

### Reminders

- [ ] **RMND-01**: Dashboard shows badges for unread mandatory articles
- [ ] **RMND-02**: Email notifications sent for overdue mandatory articles (configurable intervals)

### Azure Functions API

- [ ] **API-01**: GET /api/articles/{pageId}/status — metadata + read status for current user
- [ ] **API-02**: GET /api/articles/unread — all unread articles for current user
- [ ] **API-03**: POST /api/articles/{pageId}/read — mark as read
- [ ] **API-04**: POST /api/articles/{pageId}/flag — flag as outdated
- [ ] **API-05**: GET /api/articles/{pageId}/readstats — who read, who didn't (reviewer/admin)
- [ ] **API-06**: POST /api/articles/{pageId}/approve — approve/reject
- [ ] **API-07**: GET /api/favorites — user's favorites
- [ ] **API-08**: POST /api/favorites/{pageId} — toggle favorite
- [ ] **API-09**: GET /api/dashboard/stats — unread count, favorites count, pending reviews count
- [ ] **API-10**: GET /api/admin/reports — exportable read confirmation reports

### Backend Architecture

- [ ] **BACK-01**: MediatR CQRS pattern — commands and queries separated with handlers
- [ ] **BACK-02**: FluentValidation for request validation
- [ ] **BACK-03**: MediatR pipeline behaviors: ValidationBehavior, LoggingBehavior, ExceptionBehavior
- [ ] **BACK-04**: Repository pattern (IReadConfirmationRepository, IFavoriteRepository, IFlagRepository, IApprovalRepository)
- [ ] **BACK-05**: EF Core entity configurations for all tables
- [ ] **BACK-06**: Entra ID bearer token authentication on all endpoints

### Caching

- [ ] **CACH-01**: PnPjs session cache for SharePoint page queries (5 min TTL)
- [ ] **CACH-02**: In-memory API cache with TTL for Azure Functions responses
- [ ] **CACH-03**: Stale-while-revalidate pattern in query hooks
- [ ] **CACH-04**: Cache invalidation on write commands (mark-as-read invalidates articles/unread caches)

### Telemetry & Error Handling

- [ ] **TELE-01**: Application Insights single instance for frontend + backend
- [ ] **TELE-02**: Cost-safe configuration — disableFetchTracking, disableAjaxTracking enabled
- [ ] **TELE-03**: Custom events tracked: article_read, article_flagged, article_favorited, article_approved, article_rejected, dashboard_loaded, search_executed, error_api_call, error_sharepoint
- [ ] **TELE-04**: ConsoleTelemetryService for local dev, AppInsightsTelemetryService for production
- [ ] **TELE-05**: React Error Boundary wrapping each web part root
- [ ] **TELE-06**: Toast notifications via Fluent UI MessageBar for user-facing messages

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

- [ ] **DEVP-01**: PnP PowerShell provisioning script (site, groups, columns, pages, navigation, sample data)
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

<!-- Populated during roadmap creation -->

| Requirement | Phase | Status |
|-------------|-------|--------|
| (To be filled by roadmapper) | | |

**Coverage:**
- v1 requirements: 82 total
- Mapped to phases: 0
- Unmapped: 82

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 after initial definition*
