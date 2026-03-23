# WissensHub SPFx Solution

SharePoint Framework 1.22.2 solution providing 4 web parts and 1 application customizer for the WissensHub knowledge management hub.

## Web Parts

| Web Part | Description | Internal Name |
|----------|-------------|---------------|
| **Dashboard** | Article browsing with card/list views, search, filters, stats bar | `DashboardWebPart` |
| **Article Sidebar** | Article metadata, read confirmation, flag, favorite, TOC | `ArticleSidebarWebPart` |
| **Freigabecenter** | Reviewer hub for pending approvals, flagged content, freshness alerts | `FreigabecenterWebPart` |
| **Admin Panel** | Category/target group config, read reports, CSV/Excel export | `AdminPanelWebPart` |

## Application Customizer

| Extension | Description | Internal Name |
|-----------|-------------|---------------|
| **Unread Badge** | Site-wide header notification with unread count and flyout panel | `UnreadBadgeApplicationCustomizer` |

## Shared Architecture

All components share a common architecture under `src/shared/`:

- **WissensHubContext** -- React context providing user info, role, and service container
- **Service Layer** -- Dependency-inverted interfaces with production and mock implementations
- **CQRS Hooks** -- Separate query (read) and command (write) hooks
- **Caching** -- PnPjs session cache + stale-while-revalidate in hooks
- **Telemetry** -- Application Insights with 9 custom events
- **Error Boundary** -- Per-web-part error isolation with recovery UI
- **i18n** -- German (default) and English localization

## Local Development

### Prerequisites

- Node.js 22 LTS
- SPFx development environment ([setup guide](https://learn.microsoft.com/sharepoint/dev/spfx/set-up-your-development-environment))

### Install and serve

```bash
npm install
npm start
```

This serves the solution to the SharePoint workbench at:
```
https://<your-tenant>.sharepoint.com/_layouts/15/workbench.aspx
```

### Build for production

```bash
npx heft test --clean --production
npx heft package-solution --production
```

The `.sppkg` package is output to `sharepoint/solution/wissens-hub.sppkg`.

### Run tests

```bash
npx heft test --clean
```

161 Jest tests covering services, hooks, and components.

## Property Pane Options

All web parts support a **Mock Mode** toggle in the property pane for workbench development. When enabled, the web part uses mock data instead of live SharePoint/API connections.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `useMockData` | boolean | `true` | Toggle between mock and production data |

## Deployment

Deploy to the tenant-wide app catalog:

```bash
# Using CLI for Microsoft 365
m365 spo app add --filePath sharepoint/solution/wissens-hub.sppkg --appCatalogUrl <catalog-url> --overwrite
m365 spo app deploy --name wissens-hub.sppkg --appCatalogUrl <catalog-url>
```

Or via the CD pipeline (automatic on merge to main).

## API Permission

This solution requires API permission consent for the WissensHub API (configured in `config/package-solution.json`):

| Resource | Scope |
|----------|-------|
| WissensHub API | `access_as_user` |

After deploying the `.sppkg`, grant the API permission in the SharePoint Admin Center under **API access**.
