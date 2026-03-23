# Phase 12: DevOps & Deployment - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 12-devops-deployment
**Areas discussed:** Bicep organization, Pipeline design, SPFx deployment, README depth

---

## Bicep Organization

| Option | Description | Selected |
|--------|-------------|----------|
| Modular with main.bicep | infra/main.bicep orchestrates child modules (sql.bicep, function-app.bicep, app-insights.bicep, key-vault.bicep, storage.bicep). Parameter files per environment. | ✓ |
| Flat single file | One infra/main.bicep with all resources inline. Simpler but harder to maintain. | |
| You decide | Claude picks the best approach | |

**User's choice:** Modular with main.bicep (Recommended)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Dev + Prod | Two parameter files with environment-prefixed resource names | ✓ |
| Single environment | One parameter file, deploy once to production | |
| You decide | Claude picks based on portfolio impact | |

**User's choice:** Dev + Prod (Recommended)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Key Vault references | SQL connection string and App Insights key in Key Vault, Functions uses @Microsoft.KeyVault() | ✓ |
| Direct app settings | Connection strings set directly on Functions App configuration | |
| You decide | Claude picks the appropriate pattern | |

**User's choice:** Key Vault references (Recommended)
**Notes:** None

---

## Pipeline Design

| Option | Description | Selected |
|--------|-------------|----------|
| Split CI + CD | ci.yml on PR (build + test), cd.yml on push to main (build + test + deploy) | ✓ |
| Single workflow with stages | One pipeline.yml with conditional stages | |
| You decide | Claude picks based on best practices | |

**User's choice:** Split CI + CD (Recommended)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Every merge | Always runs az deployment group create — Bicep is idempotent | ✓ |
| Only on infra changes | Path filter to skip infra deployment on code-only changes | |
| You decide | Claude picks the appropriate strategy | |

**User's choice:** Every merge (Recommended)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-deploy on merge | Merge to main triggers immediate deployment, no manual gates | ✓ |
| Environment with approval | GitHub Environment 'production' with required reviewer | |
| You decide | Claude picks based on portfolio context | |

**User's choice:** Auto-deploy on merge (Recommended)
**Notes:** None

---

## SPFx Deployment

| Option | Description | Selected |
|--------|-------------|----------|
| CLI for Microsoft 365 | m365 spo app add/deploy commands, certificate-based auth with OIDC | ✓ |
| PnP PowerShell | Add-PnPApp/Publish-PnPApp, consistent with existing provisioning tooling | |
| You decide | Claude picks the best CI/CD-friendly option | |

**User's choice:** CLI for Microsoft 365 (Recommended)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Tenant app catalog | Deploy once, available across entire tenant | ✓ |
| Site collection app catalog | Scoped to WissensHub site only, more isolated | |
| You decide | Claude picks based on hub site architecture | |

**User's choice:** Tenant app catalog (Recommended)
**Notes:** None

---

## README Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Mermaid in markdown | Renders natively on GitHub, easy to maintain as code | ✓ |
| Static image (PNG/SVG) | More design flexibility, harder to update | |
| Both | Mermaid for README + polished image for presentations | |
| You decide | Claude picks the most portfolio-appropriate format | |

**User's choice:** Mermaid in markdown (Recommended)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Endpoint table with examples | All 10 endpoints in table + 2-3 curl examples | ✓ |
| Brief endpoint list | Simple table with method + path + one-line description | |
| Full OpenAPI/Swagger | Generate or hand-write OpenAPI spec | |
| You decide | Claude picks the right depth | |

**User's choice:** Endpoint table with examples (Recommended)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Both local + production | Local dev setup AND production deployment guide | ✓ |
| Local only | Focus on developer onboarding only | |
| You decide | Claude picks based on portfolio impact | |

**User's choice:** Both local + production (Recommended)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Replace with project-specific content | WissensHub-specific info: web parts list, property pane options, local serve instructions | ✓ |
| Delete it | One README at root is enough | |
| Leave as-is | Keep the SPFx template README | |

**User's choice:** Replace with project-specific content (Recommended)
**Notes:** User emphasized that the root README already has the right direction — enhance it, don't start from scratch. This is critical.

---

## Claude's Discretion

- Exact Bicep resource configuration details (SKUs, scaling, firewall rules)
- GitHub Actions job ordering and caching strategy
- CLI for M365 auth configuration specifics
- OIDC federated credential setup details
- EF Core migration execution strategy in CD pipeline
- README section ordering and wording

## Deferred Ideas

None — discussion stayed within phase scope
