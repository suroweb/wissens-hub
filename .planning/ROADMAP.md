# Roadmap: WissensHub

## Overview

WissensHub delivers a SharePoint Framework knowledge management hub in 12 phases, progressing from project scaffolding through authentication, architecture layers, feature web parts, and finishing with quality/testing/deployment. The first four phases establish all infrastructure and architecture — SPFx scaffold, Azure Functions skeleton, SharePoint site provisioning, Entra ID auth pipeline, and shared service layer on both frontend and backend. Phases 5-9 build the five UI surfaces (Dashboard, Article Sidebar, Freigabecenter, Unread Badge Customizer, Admin Panel) with their supporting API endpoints. Phases 10-12 add production quality (caching, telemetry, UX polish, i18n), comprehensive testing, and deployment infrastructure. Frontend and backend architecture (Phases 3-4) can be developed in parallel once Phase 2 establishes the auth pipeline.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Project Scaffolding & Local Dev** - SPFx solution, Azure Functions project, Docker Compose, EF Core initial schema
- [ ] **Phase 2: SharePoint Site & Auth Pipeline** - Provisioning script, Entra ID app registration, AadHttpClient smoke test, SharePoint groups and columns
- [ ] **Phase 3: Frontend Architecture & Service Layer** - WissensHubContext, service interfaces, mock implementations, Result pattern, domain models, role detection
- [ ] **Phase 4: Backend Architecture & API Skeleton** - MediatR CQRS, FluentValidation, pipeline behaviors, repositories, EF Core entity configs, bearer token auth
- [ ] **Phase 5: Dashboard Web Part** - Article browsing with card/list views, search, filters, stats bar, unread badges, role-specific sections
- [ ] **Phase 6: Article Sidebar & Read Confirmations** - Article metadata display, mark-as-read, flag, favorite, TOC, read confirmation tracking and reset
- [ ] **Phase 7: Approval Workflow & Freigabecenter** - Status transitions, approve/reject actions, approval history, Freigabecenter web part with freshness alerts
- [ ] **Phase 8: Unread Badge Application Customizer** - Header notification icon, flyout panel with unread summaries, cross-web-part event bus
- [ ] **Phase 9: Admin Panel & Reporting** - Category/target group configuration, reminder intervals, read confirmation reports with CSV/Excel export
- [ ] **Phase 10: Caching, Telemetry, UX Polish & i18n** - Multi-layer caching, Application Insights, error boundaries, toasts, optimistic UI, shimmer, responsive, accessibility, internationalization
- [ ] **Phase 11: Testing** - Jest unit tests, .NET integration tests, Playwright E2E tests
- [ ] **Phase 12: DevOps & Deployment** - Azure Bicep IaC, GitHub Actions CI/CD, SPFx deployment, migration pipeline, OIDC, README documentation

## Phase Details

### Phase 1: Project Scaffolding & Local Dev
**Goal**: Developer can run the SPFx solution and Azure Functions API locally with a working database
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05
**Success Criteria** (what must be TRUE):
  1. SPFx solution builds and serves to the local workbench with Heft toolchain (no Gulp)
  2. All scaffolded class components are converted to functional components with hooks
  3. Azure Functions project starts locally and responds to a /api/health endpoint
  4. Docker Compose brings up Azure SQL Edge and EF Core migrations apply successfully
  5. Database contains all five tables (ArticleMetadata, ReadConfirmations, ArticleFlags, Favorites, ApprovalHistory)
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — SPFx solution scaffold with all 5 components, functional component conversion
- [ ] 01-02-PLAN.md — .NET Clean Architecture backend, EF Core schema, Docker Compose, dev scripts

### Phase 2: SharePoint Site & Auth Pipeline
**Goal**: SPFx web parts can authenticate to Azure Functions via AadHttpClient against a real SharePoint tenant
**Depends on**: Phase 1
**Requirements**: INFRA-06, INFRA-07, INFRA-08, DEVP-01
**Success Criteria** (what must be TRUE):
  1. SharePoint Communication Site exists with all custom columns (WH_ prefixed) on Site Pages library
  2. SharePoint Groups (Members, Editors, Reviewers, Owners) are created and assignable
  3. Entra ID app registration is configured and AadHttpClient gets a valid bearer token
  4. A smoke test from SPFx successfully calls Azure Functions /api/health with CORS and auth working
  5. PnP PowerShell provisioning script creates the site, groups, columns, sample pages, and navigation in one run
**Plans**: TBD

Plans:
- [ ] 02-01: PnP PowerShell provisioning script (site, groups, columns, pages, navigation)
- [ ] 02-02: Entra ID app registration and AadHttpClient auth pipeline with CORS smoke test

### Phase 3: Frontend Architecture & Service Layer
**Goal**: All frontend web parts share a consistent architecture with dependency-inverted services that work in both mock and production modes
**Depends on**: Phase 1
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, ARCH-06, ARCH-07, ARCH-08, ARCH-09, ARCH-10, ROLE-01, ROLE-02, ROLE-03, ROLE-04
**Success Criteria** (what must be TRUE):
  1. WissensHubContext provides current user info, resolved role, and service container to any web part that consumes it
  2. Service interfaces (IPageService, IApiClient, IReadConfirmationService, IFavoriteService, IFlagService, IApprovalService) are defined and mock implementations return realistic test data
  3. Role detection resolves the highest applicable role (Reader/Editor/Reviewer/Admin) from SharePoint group membership
  4. RoleGate component conditionally renders children based on the user's resolved role
  5. All service calls return Result<T> with typed success/failure — no thrown exceptions for expected failures
**Plans**: TBD

Plans:
- [ ] 03-01: WissensHubContext, role detection, and RoleGate component
- [ ] 03-02: Service interfaces, domain models, DTOs, and mapper layer
- [ ] 03-03: Mock service implementations and CQRS-lite hooks (QueryState, CommandState)

### Phase 4: Backend Architecture & API Skeleton
**Goal**: Azure Functions API has a complete architectural foundation with CQRS, validation, auth, and all endpoint stubs ready for feature implementation
**Depends on**: Phase 1
**Requirements**: BACK-01, BACK-02, BACK-03, BACK-04, BACK-05, BACK-06, API-01, API-02, API-03, API-04, API-05, API-06, API-07, API-08, API-09, API-10
**Success Criteria** (what must be TRUE):
  1. All 10 API endpoints exist as Azure Functions triggers and return structured responses (even if stubbed)
  2. MediatR dispatches commands and queries through ValidationBehavior, LoggingBehavior, and ExceptionBehavior pipeline
  3. FluentValidation validates all incoming requests before handler execution
  4. Repository interfaces and EF Core implementations exist for all four repositories (ReadConfirmation, Favorite, Flag, Approval)
  5. Entra ID bearer token is validated in middleware — unauthenticated requests are rejected with 401
**Plans**: TBD

Plans:
- [ ] 04-01: MediatR CQRS setup, pipeline behaviors, and FluentValidation
- [ ] 04-02: Repository pattern, EF Core entity configurations, and domain entities
- [ ] 04-03: API endpoint functions with Entra ID bearer token middleware

### Phase 5: Dashboard Web Part
**Goal**: Users can browse, search, and filter knowledge articles from a central dashboard with role-appropriate views
**Depends on**: Phase 3, Phase 4
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07, DASH-08, DASH-09, DASH-10, RMND-01
**Success Criteria** (what must be TRUE):
  1. User can view published articles in both card grid and compact list view, and toggle between them
  2. User can search across article titles and page body content and see matching results
  3. User can filter articles by category, status, and target group — filters combine correctly
  4. User can see a stats bar showing their unread count, favorites count, and pending reviews count
  5. Unread mandatory articles display reminder badges and appear prominently
**Plans**: TBD

Plans:
- [ ] 05-01: Article card and list view components with SharePoint page data integration
- [ ] 05-02: Search (SharePoint Search API), filters, and stats bar
- [ ] 05-03: Role-specific sections (Editor new article, Reviewer pending reviews) and navigation

### Phase 6: Article Sidebar & Read Confirmations
**Goal**: Users can interact with individual articles — confirming reads, flagging problems, and managing favorites — with full tracking in Azure SQL
**Depends on**: Phase 5
**Requirements**: SIDE-01, SIDE-02, SIDE-03, SIDE-04, SIDE-05, SIDE-06, SIDE-07, SIDE-08, READ-01, READ-02, READ-03
**Success Criteria** (what must be TRUE):
  1. User can see complete article metadata (author, category, version, last updated, status, target groups) in the sidebar
  2. User can mark an article as read and immediately see their confirmation date — data persists in Azure SQL
  3. User can flag an article as outdated with a reason — flag appears in the system for reviewers
  4. Read confirmations are reset when an article is significantly updated, requiring re-confirmation
  5. Dynamic table of contents generates from page headings and scrolls to sections on click
**Plans**: TBD

Plans:
- [ ] 06-01: Article Sidebar UI (metadata display, TOC, version history link)
- [ ] 06-02: Read confirmation flow (mark-as-read, status display, reset on update)
- [ ] 06-03: Flag and favorite actions with Azure SQL persistence

### Phase 7: Approval Workflow & Freigabecenter
**Goal**: Reviewers can manage article lifecycle through a dedicated approval center — approving, rejecting, and monitoring content quality
**Depends on**: Phase 6
**Requirements**: APPR-01, APPR-02, APPR-03, FREI-01, FREI-02, FREI-03, FREI-04, FREI-05, FREI-06
**Success Criteria** (what must be TRUE):
  1. Articles transition through Draft, InReview, Published, and Archived states with both SharePoint column and Azure SQL updated atomically
  2. Reviewer can approve an article with optional comment or reject with required comment — action recorded in ApprovalHistory
  3. Reviewer can see all pending approvals, flagged articles, and content freshness alerts in the Freigabecenter
  4. Reviewer can filter the Freigabecenter by assigned reviewer
  5. Approval and rejection actions are visible in the article's history
**Plans**: TBD

Plans:
- [ ] 07-01: Approval workflow state machine and dual-store update pattern
- [ ] 07-02: Freigabecenter Web Part (pending approvals, flagged articles, freshness alerts)

### Phase 8: Unread Badge Application Customizer
**Goal**: Users see a persistent unread article count in the site header across every page in the hub, with quick access to unread summaries
**Depends on**: Phase 6
**Requirements**: BADGE-01, BADGE-02, BADGE-03
**Success Criteria** (what must be TRUE):
  1. Notification icon with unread count appears in the header on every page within the hub site
  2. Clicking the notification icon opens a flyout panel listing unread article summaries
  3. Clicking an article in the flyout navigates directly to that article page
**Plans**: TBD

Plans:
- [ ] 08-01: Application Customizer with header placeholder, unread badge, and flyout panel

### Phase 9: Admin Panel & Reporting
**Goal**: Administrators can configure the system (categories, target groups, reminders) and generate compliance reports without developer intervention
**Depends on**: Phase 7
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06, RMND-02
**Success Criteria** (what must be TRUE):
  1. Admin can add, edit, and remove article categories — changes are immediately reflected in dashboard filters and article metadata options
  2. Admin can configure target groups by selecting from existing SharePoint groups
  3. Admin can view a per-article read confirmation report showing who read, who has not, and when
  4. Admin can export read confirmation reports as CSV or Excel files
  5. Admin can see an overview of all articles by status, content freshness, and flag count
**Plans**: TBD

Plans:
- [ ] 09-01: Admin Panel categories and target groups CRUD
- [ ] 09-02: Read confirmation reports, export (CSV/Excel), and article overview dashboard

### Phase 10: Caching, Telemetry, UX Polish & i18n
**Goal**: The application performs well under load, provides production observability, handles errors gracefully, and supports German and English UI
**Depends on**: Phase 9
**Requirements**: CACH-01, CACH-02, CACH-03, CACH-04, TELE-01, TELE-02, TELE-03, TELE-04, TELE-05, TELE-06, UX-01, UX-02, UX-03, UX-04, UX-05, I18N-01, I18N-02, I18N-03
**Success Criteria** (what must be TRUE):
  1. SharePoint page queries use PnPjs session cache (5 min TTL) and API responses use in-memory cache — repeat loads are visibly faster
  2. Application Insights receives custom events (article_read, article_flagged, etc.) without auto-dependency tracking inflating costs
  3. Every web part is wrapped in an Error Boundary that shows a recovery UI instead of crashing the page
  4. All UI labels, messages, and tooltips are available in both German (default) and English
  5. Mark-as-read and favorite toggle respond instantly via optimistic UI, with rollback on failure
**Plans**: TBD

Plans:
- [ ] 10-01: Multi-layer caching (PnPjs session, in-memory TTL, stale-while-revalidate, cache invalidation)
- [ ] 10-02: Application Insights integration (cost-safe config, custom events, console fallback for dev)
- [ ] 10-03: Error boundaries, toast notifications, optimistic UI, shimmer loading states
- [ ] 10-04: Responsive design, accessibility (ARIA, keyboard, focus), debounced search
- [ ] 10-05: Internationalization framework (German default, English secondary, all strings localized)

### Phase 11: Testing
**Goal**: The application has comprehensive automated test coverage across all layers — frontend unit, backend integration, and end-to-end user flows
**Depends on**: Phase 10
**Requirements**: TEST-01, TEST-02, TEST-03
**Success Criteria** (what must be TRUE):
  1. Jest unit tests cover frontend services, hooks, and key components — tests pass in Heft pipeline
  2. .NET integration tests verify all API endpoints against Azure SQL Edge in Docker
  3. Playwright E2E tests execute critical user flows (browse dashboard, mark as read, approve article, admin config)
**Plans**: TBD

Plans:
- [ ] 11-01: Jest unit tests for frontend (services, hooks, components)
- [ ] 11-02: .NET integration tests for Azure Functions API
- [ ] 11-03: Playwright E2E tests for critical user flows

### Phase 12: DevOps & Deployment
**Goal**: The entire solution can be deployed to production via a single merge to main, with all Azure infrastructure provisioned as code
**Depends on**: Phase 11
**Requirements**: DEVP-02, DEVP-03, DEVP-04, DEVP-05, DEVP-06, DEVP-07, DEVP-08
**Success Criteria** (what must be TRUE):
  1. Azure Bicep provisions all resources (Functions App, SQL Server, App Insights, Key Vault, Storage Account) in a single deployment
  2. GitHub Actions CI pipeline builds and tests on every PR — failures block merge
  3. GitHub Actions CD pipeline deploys SPFx package and Azure Functions on merge to main, with EF Core migrations running before code deployment
  4. Federated identity (OIDC) connects GitHub Actions to Azure and M365 — no stored secrets in the repository
  5. README.md contains architecture diagram, local setup guide, production deployment guide, and API documentation
**Plans**: TBD

Plans:
- [ ] 12-01: Azure Bicep modules for all infrastructure
- [ ] 12-02: GitHub Actions CI/CD pipelines with SPFx and Azure Functions deployment
- [ ] 12-03: OIDC federated identity, migration pipeline, and README documentation

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12
Note: Phases 3 and 4 can be executed in parallel after Phase 1 completes. Phase 2 can also proceed in parallel with 3-4 once Phase 1 is done.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Scaffolding & Local Dev | 0/2 | Not started | - |
| 2. SharePoint Site & Auth Pipeline | 0/2 | Not started | - |
| 3. Frontend Architecture & Service Layer | 0/3 | Not started | - |
| 4. Backend Architecture & API Skeleton | 0/3 | Not started | - |
| 5. Dashboard Web Part | 0/3 | Not started | - |
| 6. Article Sidebar & Read Confirmations | 0/3 | Not started | - |
| 7. Approval Workflow & Freigabecenter | 0/2 | Not started | - |
| 8. Unread Badge Application Customizer | 0/1 | Not started | - |
| 9. Admin Panel & Reporting | 0/2 | Not started | - |
| 10. Caching, Telemetry, UX Polish & i18n | 0/5 | Not started | - |
| 11. Testing | 0/3 | Not started | - |
| 12. DevOps & Deployment | 0/3 | Not started | - |
