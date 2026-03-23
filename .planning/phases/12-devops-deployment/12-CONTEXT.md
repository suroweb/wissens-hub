# Phase 12: DevOps & Deployment - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Infrastructure-as-code with Azure Bicep, CI/CD pipelines with GitHub Actions, SPFx deployment to tenant app catalog via CLI for Microsoft 365, EF Core migration execution in the CD pipeline, OIDC federated identity (no stored secrets), and comprehensive README documentation. No new features — deployment and documentation only.

</domain>

<decisions>
## Implementation Decisions

### Bicep organization
- **D-01:** Modular structure with `infra/main.bicep` orchestrating child modules in `infra/modules/` (sql.bicep, function-app.bicep, app-insights.bicep, key-vault.bicep, storage.bicep)
- **D-02:** Environment-based parameter files: `infra/parameters/dev.bicepparam` and `infra/parameters/prod.bicepparam` with environment-prefixed resource names (e.g., wh-dev-func, wh-prod-func)
- **D-03:** Key Vault stores connection strings and secrets. Functions App uses `@Microsoft.KeyVault()` references to access SQL connection string and App Insights instrumentation key — no direct secrets in app settings

### Pipeline design
- **D-04:** Split CI + CD workflows: `.github/workflows/ci.yml` (triggers on PR to main — build + test both SPFx and API, failures block merge) and `.github/workflows/cd.yml` (triggers on push to main — build, test, deploy infra, run migrations, deploy Functions, deploy SPFx)
- **D-05:** CD deploys Bicep infrastructure on every merge (idempotent — unchanged resources are no-ops, guarantees infra stays in sync)
- **D-06:** Auto-deploy on merge to main — no manual approval gates. Branch protection on PRs is the quality gate. Solo portfolio project doesn't need environment approval.

### SPFx deployment
- **D-07:** CLI for Microsoft 365 (m365) for SPFx package deployment in the CD pipeline — `m365 spo app add` / `m365 spo app deploy` commands with certificate-based auth via OIDC
- **D-08:** Tenant-wide app catalog — deploy once, available across the entire tenant. Standard approach for organization-wide hub solutions.

### README documentation
- **D-09:** Architecture diagram in Mermaid format — renders natively on GitHub, versioned with the code. Shows SPFx → Azure Functions → Azure SQL flow plus SharePoint Site Pages data source.
- **D-10:** API documentation as endpoint table (method, path, description, auth) plus 2-3 curl/request examples for key flows (mark-as-read, dashboard stats)
- **D-11:** Both local dev setup guide (prerequisites, Docker Compose, npm scripts, workbench URL) AND production deployment guide (Bicep provisioning, SPFx deployment, Entra ID consent, environment variables)
- **D-12:** Root README.md already exists with badges and problem/solution sections — enhance it with architecture diagram, setup guides, and API docs. Do NOT start from scratch.
- **D-13:** Replace SPFx boilerplate README at `spfx/README.md` with WissensHub-specific content: web parts list, property pane options, local serve instructions. Keep it focused on the SPFx solution only — root README covers the full project.

### Claude's Discretion
- Exact Bicep resource configuration details (SKUs, scaling settings, firewall rules)
- GitHub Actions job dependency ordering and caching strategy
- CLI for Microsoft 365 authentication configuration specifics
- OIDC federated credential setup details (subject claims, issuer)
- EF Core migration execution strategy in CD (before or during deployment)
- README section ordering and wording

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing project files
- `README.md` — Current root README (enhance, do not replace)
- `spfx/README.md` — SPFx boilerplate README (replace with project-specific content)
- `package.json` — Root package.json with existing dev and test scripts
- `scripts/Deploy-WissensHub.ps1` — Existing provisioning orchestrator (reference for deployment patterns)
- `scripts/config.template.json` — Template for tenant-specific configuration values

### Requirements
- `.planning/REQUIREMENTS.md` §DevOps & Deployment — DEVP-02 through DEVP-08
- `.planning/ROADMAP.md` §Phase 12 — Success criteria and plan breakdown

### Prior phase decisions
- `.planning/phases/01-project-scaffolding-local-dev/01-CONTEXT.md` — Repository layout (/infra for Bicep, /.github for Actions), .NET Clean Architecture structure, Docker Compose setup
- `.planning/phases/02-sharepoint-site-auth-pipeline/02-CONTEXT.md` — Entra ID app registration, AadHttpClient auth pattern, PnP PowerShell provisioning
- `.planning/phases/11-testing/11-CONTEXT.md` — Test infrastructure (Jest via Heft, .NET integration tests, Playwright E2E)

### Spec
- `wissens-hub-spec.md` — Source of truth for the entire project

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Root README.md** — Already has badges (SPFx, React, TypeScript, .NET, Azure Functions, Azure SQL, Node.js), problem/solution sections. Needs architecture diagram, setup guides, API docs added.
- **Root package.json** — Has `dev`, `spfx:serve`, `api:start`, `db:up`, `db:down`, `db:migrate`, `test:frontend`, `test:backend`, `test:e2e`, `test:all` scripts
- **scripts/ directory** — PnP PowerShell provisioning with modular structure (Deploy-WissensHub.ps1 + modules/)
- **docker/docker-compose.yml** — SQL Server 2022 with Rosetta 2 via Colima
- **e2e/ directory** — Playwright E2E tests with Edge SSO auth

### Established Patterns
- Side-by-side top-level folders: /spfx, /api, /docker, /scripts — /infra and /.github are the new additions
- SQL Server 2022 via Docker Compose (not Azure SQL Edge — Phase 1 decision)
- .NET 10 with Clean Architecture: Functions, Application, Domain, Infrastructure projects
- SPFx 1.22.2 with Heft toolchain (no Gulp) — `npm start` to serve
- EF Core code-first migrations: `dotnet ef database update`

### Integration Points
- `/infra/` — New directory for all Bicep files
- `/.github/workflows/` — New directory for CI/CD pipelines
- `spfx/config/package-solution.json` — SPFx package config (used by `m365 spo app add`)
- `api/src/WissensHub.Functions/` — Azure Functions entry point for deployment
- `api/src/WissensHub.Infrastructure/` — EF Core migrations project

</code_context>

<specifics>
## Specific Ideas

- Root README.md already has the right direction — enhance it, don't start from scratch. This is critical.
- SPFx README.md at `spfx/README.md` is auto-generated boilerplate — replace with project-specific content focused on the SPFx solution only
- This is a portfolio project — README quality and IaC organization directly impact portfolio presentation

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 12-devops-deployment*
*Context gathered: 2026-03-24*
