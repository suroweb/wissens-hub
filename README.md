# WissensHub

**Internal Knowledge Management Hub for Microsoft 365**

> :construction: **Work in Progress** — Active development. Phases 11-12 remaining.

![SPFx 1.22.2](https://img.shields.io/badge/SPFx-1.22.2-green)
![React 17](https://img.shields.io/badge/React-17-blue)
![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-blue)
![PnPjs 4.18](https://img.shields.io/badge/PnPjs-4.18-orange)
![.NET 10](https://img.shields.io/badge/.NET-10-purple)
![Azure Functions v4](https://img.shields.io/badge/Azure%20Functions-v4-yellow)
![Azure SQL](https://img.shields.io/badge/Azure%20SQL-2022-red)
![Node.js 22](https://img.shields.io/badge/Node.js-22-green)

## Problem

Organizations with mandatory knowledge articles rely on emails, shared drives, and manual tracking to ensure employees read critical content. This leads to:

- **No read accountability** — no way to verify who read what
- **Outdated content** — stale articles circulate without review cycles
- **Manual compliance reporting** — HR and compliance teams build reports by hand
- **Scattered information** — knowledge lives across SharePoint, Teams, email, and file shares

## Solution

WissensHub is a SharePoint Framework solution that turns SharePoint Communication Sites into a structured knowledge management hub. Articles are authored as native SharePoint pages — WissensHub adds read tracking, approval workflows, freshness monitoring, and compliance reporting on top.

Employees browse articles from a central dashboard, confirm reads, and receive reminders for mandatory content. Reviewers manage approval workflows. Admins configure categories, target groups, and generate read confirmation reports.

## Key Features

- **Dashboard with search & filters** — card/list views, category and target group filtering, full-text search
- **Read confirmation tracking** — per-article read status saved to Azure SQL, auto-reset on major updates
- **Approval workflow** — Draft → InReview → Published → Archived with audit trail
- **Freigabecenter** — reviewer hub for pending approvals, flagged content, and freshness alerts
- **Unread badge** — site-wide header notification with flyout panel
- **Admin panel** — category/target group config, read reports with CSV/Excel export
- **Caching & telemetry** — PnPjs session cache, stale-while-revalidate hooks, Application Insights
- **i18n** — German (default) and English, fully localized UI

## Architecture

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Browser["Browser / SharePoint Online"]
    end

    subgraph SPFx["SPFx Solution — React 17 + TypeScript 5.8"]
        Dashboard["Dashboard\nWeb Part"]
        Sidebar["Article Sidebar\nWeb Part"]
        Freigabe["Freigabecenter\nWeb Part"]
        Admin["Admin Panel\nWeb Part"]
        Badge["Unread Badge\nApp Customizer"]

        subgraph Shared["Shared Architecture"]
            Context["WissensHubContext\n+ ServiceContainer"]
            Hooks["CQRS Hooks\nQuery | Command"]
            Services["Service Layer\nIPageService | IApiClient\nIReadConfirmation | IFavorite\nIFlag | IApproval"]
            Cache["CacheService\nSWR + TTL"]
            Telemetry["TelemetryService\nApp Insights"]
            ErrorBoundary["ErrorBoundary\n+ ToastProvider"]
        end
    end

    subgraph Azure["Azure Functions v4 — .NET 10 Isolated"]
        Endpoints["10 API Endpoints\nREST + Bearer Auth"]
        MediatR["MediatR CQRS\nValidation | Logging\nException Pipeline"]
        Repos["Repository Layer\nEF Core 10"]
    end

    subgraph Data["Data Layer"]
        SQL["Azure SQL\n8 Tables\nEF Core Migrations"]
        SP["SharePoint\nSite Pages + Columns\nPnP PowerShell Provisioned"]
        AI["Application Insights\n9 Custom Events"]
    end

    subgraph Auth["Authentication"]
        Entra["Entra ID\nAadHttpClient\nBearer Token"]
    end

    Browser --> SPFx
    Dashboard & Sidebar & Freigabe & Admin & Badge --> Shared
    Context --> Services
    Services -->|"PnPjs + Cache"| SP
    Services -->|"AadHttpClient"| Endpoints
    Hooks --> Cache
    Hooks --> Telemetry
    Endpoints --> MediatR --> Repos --> SQL
    Endpoints -.->|"JWT Validation"| Entra
    Services -.->|"OAuth 2.0"| Entra
    Telemetry --> AI
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | SPFx 1.22.2, React 17, TypeScript 5.8, Fluent UI 8, PnPjs 4.18 |
| **Backend** | .NET 10, Azure Functions v4 (Isolated Worker), MediatR, FluentValidation |
| **Data** | Azure SQL (EF Core 10 code-first), SharePoint Site Pages |
| **Auth** | Entra ID, AadHttpClient, Bearer Token (JWT) |
| **Caching** | PnPjs session cache (5 min), in-memory SWR with TTL |
| **Telemetry** | Application Insights (9 custom events), Error Boundaries, Toast notifications |
| **i18n** | SPFx localization framework (German default, English) |
| **Toolchain** | Heft (no Gulp), ESLint, Jest, Docker Compose |
| **DevOps** | GitHub Actions, Azure Bicep, PnP PowerShell |

## Project Scope

**12 development phases** producing **342 source files** across **15,600+ lines** of TypeScript, SCSS, and C#.

| Phase | Description | Status |
|-------|-------------|--------|
| 1. Project Scaffolding | SPFx + Azure Functions + Docker + EF Core schema | :white_check_mark: Complete |
| 2. SharePoint Site & Auth | Provisioning, Entra ID, AadHttpClient | :wrench: In Progress |
| 3. Frontend Architecture | Context, services, Result pattern, role detection | :wrench: In Progress |
| 4. Backend Architecture | MediatR CQRS, repositories, API endpoints, JWT auth | :wrench: In Progress |
| 5. Dashboard Web Part | Card/list views, search, filters, stats bar | :white_check_mark: Complete |
| 6. Article Sidebar | Metadata, read confirmations, flags, favorites, TOC | :white_check_mark: Complete |
| 7. Freigabecenter | Approval workflow, flagged articles, freshness alerts | :white_check_mark: Complete |
| 8. Unread Badge | Header notification icon, flyout panel | :white_check_mark: Complete |
| 9. Admin Panel | Categories, target groups, reports, CSV/Excel export | :wrench: In Progress |
| 10. Caching & Telemetry | SWR caching, App Insights, error boundaries, i18n | :white_check_mark: Complete |
| 11. Testing | Jest unit, .NET integration, Playwright E2E | :hourglass: Planned |
| 12. DevOps & Deployment | Azure Bicep, GitHub Actions CI/CD, OIDC | :hourglass: Planned |

## Screenshots

> Screenshots will be added as development progresses.

## Getting Started

### Prerequisites

- [Node.js 22 LTS](https://nodejs.org/)
- [.NET 10 SDK](https://dotnet.microsoft.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local)
- [PnP PowerShell](https://pnp.github.io/powershell/) (for SharePoint provisioning)
- A Microsoft 365 developer tenant

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/AYMNArchive/wissens-hub.git
   cd wissens-hub
   ```

2. **Start the database**
   ```bash
   npm run db:up
   ```

3. **Apply EF Core migrations**
   ```bash
   npm run db:migrate
   ```

4. **Configure the API**
   ```bash
   cp scripts/config.template.json scripts/config.json
   # Edit scripts/config.json with your tenant details
   ```

5. **Start the Azure Functions API**
   ```bash
   npm run api:start
   ```

6. **Install SPFx dependencies and serve**
   ```bash
   cd spfx && npm install && npm start
   ```

7. **Open the workbench**
   ```
   https://<your-tenant>.sharepoint.com/_layouts/15/workbench.aspx
   ```

8. **Run everything at once** (after initial setup)
   ```bash
   npm run dev
   ```

### SharePoint Provisioning

Provision the site, groups, columns, sample pages, and navigation:

```powershell
cd scripts
./Deploy-WissensHub.ps1 -SiteUrl "https://<tenant>.sharepoint.com/sites/WissensHub"
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/articles/{pageId}/status` | Article metadata + read status |
| `GET` | `/api/articles/unread` | Unread articles for current user |
| `POST` | `/api/articles/{pageId}/read` | Mark article as read |
| `POST` | `/api/articles/{pageId}/flag` | Flag article as outdated |
| `GET` | `/api/articles/{pageId}/readstats` | Read confirmation stats (reviewer/admin) |
| `POST` | `/api/articles/{pageId}/approve` | Approve or reject article |
| `GET` | `/api/favorites` | User's favorite articles |
| `POST` | `/api/favorites/{pageId}` | Toggle favorite |
| `GET` | `/api/dashboard/stats` | Dashboard statistics |
| `GET` | `/api/admin/reports` | Read confirmation reports |

## Project Structure

```
wissens-hub/
├── spfx/                          # SharePoint Framework solution
│   └── src/
│       ├── webparts/
│       │   ├── dashboard/         # Dashboard Web Part
│       │   ├── articleSidebar/    # Article Sidebar Web Part
│       │   ├── freigabecenter/    # Freigabecenter Web Part
│       │   └── adminPanel/        # Admin Panel Web Part
│       ├── extensions/
│       │   └── unreadBadge/       # Unread Badge Application Customizer
│       └── shared/                # Shared architecture
│           ├── context/           # WissensHubContext, ServiceContainer
│           ├── services/          # Production + mock service implementations
│           ├── hooks/             # CQRS query and command hooks
│           ├── components/        # ErrorBoundary, ToastProvider, Shimmer
│           ├── models/            # Domain models and DTOs
│           └── loc/               # Shared localization strings
├── api/                           # Azure Functions backend
│   └── src/
│       ├── WissensHub.Functions/  # Azure Function endpoints
│       ├── WissensHub.Application/# MediatR handlers, validators, DTOs
│       ├── WissensHub.Domain/     # Entities, interfaces
│       └── WissensHub.Infrastructure/ # EF Core, repository implementations
├── docker/                        # Docker Compose (SQL Server 2022)
└── scripts/                       # PnP PowerShell provisioning
```

## License

[MIT](LICENSE)
