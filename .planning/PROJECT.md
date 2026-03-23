# WissensHub

## What This Is

A SharePoint Framework (SPFx) knowledge management solution — a central hub site where knowledge articles are SharePoint Modern Pages with full rich authoring, and SPFx web parts + extensions provide the management layer: dashboards, approval workflows, read confirmations, and target group distribution. Azure SQL handles tracking/management data via an Azure Functions API. This is a full production-grade portfolio project demonstrating senior-level SharePoint developer skills.

## Core Value

Employees can find, read, and confirm mandatory knowledge articles through a central hub with role-based workflows — editors create content, reviewers approve it, and admins track who has read what.

## Requirements

### Validated

All v1.0 requirements validated across 12 phases:

- [x] SPFx 1.22.2 solution with 4 web parts (Dashboard, Article Sidebar, Freigabecenter, Admin Panel) and 1 Application Customizer (Unread Badge Header) — Phase 1
- [x] Role-based access (Reader, Editor, Reviewer, Admin) via SharePoint Groups with runtime group membership checks — Phase 3
- [x] Two-layer data architecture: SharePoint Site Pages for content, Azure SQL for tracking/management — Phase 1
- [x] Azure Functions C# API (.NET 10, EF Core 10, MediatR CQRS) between SPFx and Azure SQL — Phase 4
- [x] Clean Architecture on both frontend (interfaces, services, hooks, components) and backend (Functions, Application, Domain, Infrastructure) — Phases 3-4
- [x] Read confirmations — users mark articles as read, reviewers/admins see who read what — Phase 6
- [x] Approval workflow — Draft → InReview → Published → Archived with approve/reject actions — Phase 7
- [x] Flagging — users flag outdated articles, reviewers see flagged articles in Freigabecenter — Phase 7
- [x] Favorites — users star/unstar articles, stored in Azure SQL — Phase 6
- [x] Dashboard with unread badges, filters, search, card/list view toggle — Phase 5
- [x] Article Sidebar with metadata display, mark-as-read, flag, favorite, table of contents — Phase 6
- [x] Unread Badge Application Customizer in header across the hub — Phase 8
- [x] Admin Panel — configure categories and target groups, exportable read confirmation reports — Phase 9
- [x] Admin-configurable article categories (not hardcoded) — Phase 9
- [x] Target groups mapped to SharePoint groups — admin selects which groups — Phase 9
- [x] Multi-layer caching: PnPjs session cache, in-memory API cache with TTL, stale-while-revalidate in hooks — Phase 10
- [x] Application Insights telemetry (single instance for frontend + backend) with cost-safe configuration (no auto-dependency tracking) — Phase 10
- [x] Error handling: Result<T> pattern, React Error Boundaries, toast notifications — Phase 10
- [x] Internationalization (i18n) — German default, English available — Phase 10
- [x] Optimistic UI updates for mark-as-read, favorite toggle — Phase 10
- [x] Responsive design for full-width, 2/3, and 1/3 column zones — Phase 10
- [x] Accessibility — ARIA labels, keyboard navigation, focus management — Phase 10
- [x] Loading skeletons with Fluent UI Shimmer — Phase 10
- [x] Debounced search — Phase 10
- [x] Full test coverage: Jest unit tests (frontend), .NET integration tests (API), E2E tests (Playwright) — Phase 11
- [x] Docker Compose with Azure SQL Edge for local development — Phase 1
- [x] PnP PowerShell provisioning script (site, groups, columns, pages, navigation, sample data) — Phase 2
- [x] Azure Bicep infrastructure as code (Functions App, SQL Server, App Insights, Key Vault) — Phase 12
- [x] CI/CD with GitHub Actions (CI on PR, CD on merge to main) — Phase 12
- [x] README.md with architecture diagram, setup guide, API documentation — Phase 12

### Active

(None — all v1.0 requirements validated)

### Out of Scope

- Real-time chat — not relevant to knowledge management
- Video posts — storage/bandwidth complexity, not needed for portfolio demo
- Mobile app — web-first, SharePoint responsive design is sufficient
- React 18 — locked to React 17 by SPFx 1.22.2
- Fluent UI v9 — TypeScript/React 17 compatibility issues in SPFx, using v8

## Context

- **Portfolio project** — demonstrates senior SharePoint developer skills across the full stack (SPFx, Azure Functions, Azure SQL, Bicep, CI/CD)
- **SPFx 1.22.2** — latest stable, uses Heft-based toolchain (no Gulp), scaffolds class components by default but all components will be converted to functional components with hooks
- **React 17 + TypeScript 5.8** — locked by SPFx version
- **@pnp/sp v4** (PnPjs) for SharePoint API, **@fluentui/react v8** for UI, **@pnp/spfx-controls-react** for SharePoint-specific controls
- **Azure Functions Isolated Worker** with .NET 10, C# 14, EF Core 10, MediatR, FluentValidation
- **Target environment** — real SharePoint Online tenant + Azure subscription available for deployment
- **German-first i18n** — UI labels in German by default, English as secondary language
- **CRITICAL: The spec (wissens-hub-spec.md) is the source of truth** — research informs understanding but must not change requirements without user approval

## Constraints

- **SPFx version**: 1.22.2 — dictates React 17, TypeScript 5.8, Fluent UI v8
- **Node.js**: 22 LTS — required by SPFx 1.22.2
- **No Gulp**: SPFx 1.22 uses Heft-based toolchain
- **SharePoint 5000-item threshold**: Azure SQL handles tracking data to avoid list view threshold issues
- **Application Insights cost**: Must disable auto-dependency tracking in SPFx to prevent cost explosion from SharePoint background HTTP calls
- **Spec is immutable**: Any proposed changes to the spec require explicit user approval

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Azure SQL over SharePoint lists for tracking data | Efficient JOINs, aggregations, no 5000-item threshold, proper indexing | — Pending |
| MediatR CQRS in Azure Functions | Clean separation of commands/queries, pipeline behaviors for cross-cutting concerns | — Pending |
| PnPjs v4 over raw SharePoint REST | Type-safe, built-in caching, community standard | — Pending |
| Fluent UI v8 over v9 | v9 has compatibility issues with SPFx's React 17 | — Pending |
| Admin-configurable categories | More flexible than hardcoded, demonstrates admin panel capabilities | — Pending |
| Target groups via SharePoint groups | Leverages existing identity infrastructure, no custom group management needed | — Pending |
| i18n (German + English) | Portfolio demonstrates localization capability | — Pending |
| Full content search via SharePoint Search API | Users expect to search page body content, not just titles | — Pending |
| Read confirmation reset on article update | Major edits invalidate existing read confirmations — ensures compliance | — Pending |
| Reminders via dashboard badges + email | Dashboard badges for in-app visibility, email notifications for overdue mandatory articles | — Pending |

---
*Last updated: 2026-03-24 after Phase 12 completion (all v1.0 phases complete)*
