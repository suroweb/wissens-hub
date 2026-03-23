# Phase 12: DevOps & Deployment - Research

**Researched:** 2026-03-24
**Domain:** Azure Bicep IaC, GitHub Actions CI/CD, OIDC federated identity, SPFx deployment, EF Core migrations
**Confidence:** HIGH

## Summary

Phase 12 provisions all Azure infrastructure via Bicep, builds CI/CD pipelines with GitHub Actions, and deploys the entire WissensHub solution (SPFx + Azure Functions + database migrations) on merge to main. The project already has a fully functional codebase across 11 completed phases with established test suites (161 frontend + 49 backend + 4 E2E tests), npm scripts, and a Docker Compose local dev setup. This phase adds `/infra/` and `/.github/workflows/` directories as the only new structural additions.

The key technologies are well-documented and stable: Azure Bicep for infrastructure-as-code, GitHub Actions with OIDC workload identity federation for secret-less authentication, CLI for Microsoft 365 v10.5+ with federated identity for SPFx tenant app catalog deployment, and EF Core migration bundles for database schema updates in CD. The SPFx 1.22.2 Heft toolchain replaces Gulp with `heft test --clean --production` and `heft package-solution --production` commands for CI builds.

**Primary recommendation:** Use modular Bicep under `infra/` with child modules for each resource, split CI/CD into two GitHub Actions workflows (ci.yml on PR, cd.yml on push to main), authenticate via OIDC federated identity for both Azure and M365, run EF Core migration bundles before code deployment in CD, and enhance the existing README.md with Mermaid architecture diagram and setup guides.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Modular structure with `infra/main.bicep` orchestrating child modules in `infra/modules/` (sql.bicep, function-app.bicep, app-insights.bicep, key-vault.bicep, storage.bicep)
- **D-02:** Environment-based parameter files: `infra/parameters/dev.bicepparam` and `infra/parameters/prod.bicepparam` with environment-prefixed resource names (e.g., wh-dev-func, wh-prod-func)
- **D-03:** Key Vault stores connection strings and secrets. Functions App uses `@Microsoft.KeyVault()` references to access SQL connection string and App Insights instrumentation key -- no direct secrets in app settings
- **D-04:** Split CI + CD workflows: `.github/workflows/ci.yml` (triggers on PR to main -- build + test both SPFx and API, failures block merge) and `.github/workflows/cd.yml` (triggers on push to main -- build, test, deploy infra, run migrations, deploy Functions, deploy SPFx)
- **D-05:** CD deploys Bicep infrastructure on every merge (idempotent -- unchanged resources are no-ops, guarantees infra stays in sync)
- **D-06:** Auto-deploy on merge to main -- no manual approval gates. Branch protection on PRs is the quality gate. Solo portfolio project doesn't need environment approval.
- **D-07:** CLI for Microsoft 365 (m365) for SPFx package deployment in the CD pipeline -- `m365 spo app add` / `m365 spo app deploy` commands with certificate-based auth via OIDC
- **D-08:** Tenant-wide app catalog -- deploy once, available across the entire tenant
- **D-09:** Architecture diagram in Mermaid format -- renders natively on GitHub, versioned with the code
- **D-10:** API documentation as endpoint table plus 2-3 curl/request examples
- **D-11:** Both local dev setup guide AND production deployment guide
- **D-12:** Root README.md already exists -- enhance it, do NOT start from scratch
- **D-13:** Replace SPFx boilerplate README at `spfx/README.md` with WissensHub-specific content

### Claude's Discretion
- Exact Bicep resource configuration details (SKUs, scaling settings, firewall rules)
- GitHub Actions job dependency ordering and caching strategy
- CLI for Microsoft 365 authentication configuration specifics
- OIDC federated credential setup details (subject claims, issuer)
- EF Core migration execution strategy in CD (before or during deployment)
- README section ordering and wording

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEVP-02 | Azure Bicep modules (Functions App, SQL Server, App Insights, Key Vault, Storage Account) | Bicep modular architecture patterns, official MS Learn templates, resource configuration details |
| DEVP-03 | GitHub Actions CI pipeline (build + test on PR) | SPFx 1.22 Heft build commands, .NET test commands, GitHub Actions YAML patterns |
| DEVP-04 | GitHub Actions CD pipeline (build + test + deploy on merge to main) | CD workflow structure, Azure deployment actions, artifact passing between jobs |
| DEVP-05 | SPFx deployment via CLI for Microsoft 365 | m365 federated identity auth, spo app add/deploy commands, tenant app catalog |
| DEVP-06 | EF Core migration execution in CD pipeline | Migration bundles (dotnet ef migrations bundle), connection string parameter, pre-deployment execution |
| DEVP-07 | Federated identity (OIDC) for Azure and M365 -- no stored secrets | GitHub OIDC provider, Entra ID federated credentials, azure/login action, m365 login --authType federated |
| DEVP-08 | README.md with architecture diagram, setup guide, API documentation | Mermaid diagrams, existing README enhancement, SPFx README replacement |
</phase_requirements>

## Standard Stack

### Core
| Tool/Service | Version | Purpose | Why Standard |
|---|---|---|---|
| Azure Bicep | Latest (via az CLI) | Infrastructure-as-code for all Azure resources | First-party Azure IaC, declarative, modular, type-safe |
| GitHub Actions | v2 (workflows) | CI/CD pipeline orchestration | Native to GitHub repos, free for public repos, OIDC support |
| azure/login | v2 | Azure authentication in GitHub Actions | Official MS action, OIDC/federated identity support |
| Azure/functions-action | v1 | Azure Functions deployment | Official MS action for zip deploy to Functions |
| CLI for Microsoft 365 | v10.5+ | SPFx package deployment to tenant app catalog | Federated identity support (v10.5+), PnP community standard |
| EF Core CLI | 10.x | Migration bundle generation | Self-contained migration executables for CI/CD |

### Supporting
| Tool | Version | Purpose | When to Use |
|---|---|---|---|
| actions/checkout | v4 | Repository checkout in workflows | Every job that needs source code |
| actions/setup-node | v4 | Node.js setup for SPFx builds | CI/CD jobs building SPFx |
| actions/setup-dotnet | v4 | .NET SDK setup for API builds | CI/CD jobs building/testing .NET |
| actions/upload-artifact / download-artifact | v4 | Pass build artifacts between jobs | SPFx .sppkg and Functions publish output |
| pnp/action-cli-login | v3.0.1 | CLI for Microsoft 365 authentication | CD job deploying SPFx package |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|---|---|---|
| Migration bundles | `dotnet ef database update` in pipeline | Bundles don't need SDK/EF tools at runtime, but require extra build step |
| Flex Consumption plan | Linux Consumption plan | Flex is newer with managed identity for storage, but Consumption is simpler and cheaper for portfolio |
| azure/functions-action | az functionapp deployment | Action is simpler but less flexible; az CLI gives more control |

**Recommendations:**
- Use **Linux Consumption plan** (not Flex Consumption) for simplicity and cost. This is a portfolio project, not production-scale. Consumption plan is free for the first 1M executions/month.
- Use **migration bundles** for EF Core -- they are self-contained and don't require the .NET SDK on the deployment target.
- Use **`@Microsoft.KeyVault()` references** in Function App settings per D-03, with system-assigned managed identity + Key Vault Secrets User RBAC role.

## Architecture Patterns

### Recommended Project Structure (New Additions)
```
wissens-hub/
+-- infra/
|   +-- main.bicep              # Orchestrator -- deploys all modules
|   +-- modules/
|   |   +-- sql.bicep            # Azure SQL Server + Database + firewall rules
|   |   +-- function-app.bicep   # App Service Plan + Function App + managed identity
|   |   +-- app-insights.bicep   # Log Analytics workspace + Application Insights
|   |   +-- key-vault.bicep      # Key Vault + secrets + RBAC assignments
|   |   +-- storage.bicep        # Storage Account for Functions runtime
|   +-- parameters/
|       +-- dev.bicepparam       # Dev environment parameters
|       +-- prod.bicepparam      # Production environment parameters
+-- .github/
    +-- workflows/
        +-- ci.yml               # PR validation (build + test)
        +-- cd.yml               # Deploy on merge to main
```

### Pattern 1: Modular Bicep with Output Chaining
**What:** Main orchestrator deploys child modules in dependency order, passing outputs as inputs to dependent modules.
**When to use:** Always -- this is the locked decision (D-01).
**Example:**
```bicep
// infra/main.bicep
targetScope = 'resourceGroup'

@description('Environment name (dev or prod)')
@allowed(['dev', 'prod'])
param environment string

@description('Azure region for all resources')
param location string = resourceGroup().location

// Deploy storage account first (Functions runtime dependency)
module storage 'modules/storage.bicep' = {
  name: 'storage-${environment}'
  params: {
    environment: environment
    location: location
  }
}

// Deploy Application Insights (needed by Function App)
module appInsights 'modules/app-insights.bicep' = {
  name: 'appinsights-${environment}'
  params: {
    environment: environment
    location: location
  }
}

// Deploy SQL Server + Database
module sql 'modules/sql.bicep' = {
  name: 'sql-${environment}'
  params: {
    environment: environment
    location: location
    sqlAdminPassword: sqlAdminPassword // from Key Vault or parameter
  }
}

// Deploy Key Vault with secrets from other modules
module keyVault 'modules/key-vault.bicep' = {
  name: 'keyvault-${environment}'
  params: {
    environment: environment
    location: location
    sqlConnectionString: sql.outputs.connectionString
    appInsightsInstrumentationKey: appInsights.outputs.instrumentationKey
    functionAppPrincipalId: functionApp.outputs.principalId
  }
}

// Deploy Function App last (depends on storage, app insights)
module functionApp 'modules/function-app.bicep' = {
  name: 'functionapp-${environment}'
  params: {
    environment: environment
    location: location
    storageAccountName: storage.outputs.storageAccountName
    appInsightsConnectionString: appInsights.outputs.connectionString
    keyVaultName: keyVault.outputs.keyVaultName
  }
}
```
**Source:** [Microsoft Learn - Bicep modules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/modules)

### Pattern 2: Key Vault References in App Settings
**What:** Function App reads secrets via `@Microsoft.KeyVault()` URI syntax instead of storing secrets directly in app settings.
**When to use:** Always -- locked decision D-03.
**Example:**
```bicep
// In function-app.bicep
resource functionApp 'Microsoft.Web/sites@2024-04-01' = {
  name: 'wh-${environment}-func'
  location: location
  kind: 'functionapp,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOTNET-ISOLATED|10.0'
      appSettings: [
        { name: 'FUNCTIONS_EXTENSION_VERSION', value: '~4' }
        { name: 'FUNCTIONS_WORKER_RUNTIME', value: 'dotnet-isolated' }
        { name: 'AzureWebJobsStorage', value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccountName};...' }
        {
          name: 'ConnectionStrings__DefaultConnection'
          value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=SqlConnectionString)'
        }
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=AppInsightsKey)'
        }
      ]
    }
  }
}
```
**Source:** [DEV Community - Azure Bicep Function Apps with KeyVault references](https://dev.to/dazfuller/azure-bicep-deploy-function-apps-with-keyvault-references-36o1)

### Pattern 3: OIDC Federated Identity (No Stored Secrets)
**What:** GitHub Actions authenticates to Azure and M365 via OIDC tokens -- no client secrets, certificates, or publish profiles stored in the repository.
**When to use:** All CI/CD workflows -- locked decision D-07.
**Example:**
```yaml
# .github/workflows/cd.yml
permissions:
  id-token: write   # Required for OIDC token
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # Azure login via OIDC
      - uses: azure/login@v2
        with:
          client-id: ${{ vars.AZURE_CLIENT_ID }}
          tenant-id: ${{ vars.AZURE_TENANT_ID }}
          subscription-id: ${{ vars.AZURE_SUBSCRIPTION_ID }}

      # M365 login via federated identity
      - name: Login to M365
        run: |
          npm install @pnp/cli-microsoft365@latest -g
          m365 login --authType federated \
            --clientId ${{ vars.M365_CLIENT_ID }} \
            --tenantId ${{ vars.AZURE_TENANT_ID }}
```
**Source:** [GitHub Docs - Configuring OIDC in Azure](https://docs.github.com/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-azure), [Voitanos - SPFx CI/CD with Federated Identity](https://www.voitanos.io/blog/sharepoint-framework-cicd-github-federated-identity/)

### Pattern 4: SPFx Heft Build for CI/CD
**What:** SPFx 1.22 uses Heft instead of Gulp. The `--production` flag replaces `--ship`. Build and bundle are combined into a single `heft test` command.
**When to use:** All SPFx build steps in CI/CD.
**Example:**
```yaml
- name: Build SPFx (production)
  working-directory: spfx
  run: |
    npm ci
    npx heft test --clean --production
    npx heft package-solution --production

- name: Upload SPFx package
  uses: actions/upload-artifact@v4
  with:
    name: spfx-package
    path: spfx/sharepoint/solution/wissens-hub.sppkg
```
**Source:** [petkir.at - SPFx 1.22 CI/CD with Heft](https://www.petkir.at/blog/spfx-1-22-ci-cd-npm-heft), verified against project's `spfx/package.json` build script

### Pattern 5: EF Core Migration Bundle in CD
**What:** Generate a self-contained migration bundle during build, then execute it with a connection string parameter before deploying application code.
**When to use:** CD pipeline, after Bicep infra deployment but before Functions code deployment.
**Example:**
```yaml
- name: Build migration bundle
  working-directory: api
  run: |
    dotnet tool install --global dotnet-ef
    dotnet ef migrations bundle \
      --project src/WissensHub.Infrastructure \
      --startup-project src/WissensHub.Functions \
      --output efbundle \
      --self-contained

- name: Run migrations
  run: |
    ./api/efbundle --connection "${{ secrets.SQL_CONNECTION_STRING }}"
```
**Source:** [Microsoft .NET Blog - EF Core Migration Bundles](https://devblogs.microsoft.com/dotnet/introducing-devops-friendly-ef-core-migration-bundles/), [Microsoft Learn - Applying Migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying)

### Anti-Patterns to Avoid
- **Direct Gulp calls in CI:** SPFx 1.22 uses Heft. Calling `gulp bundle --ship` directly bypasses Heft prebuild hooks and may produce inconsistent builds. Use `npm run build -- --production` or `npx heft test --clean --production`.
- **Storing secrets in GitHub repository secrets:** Use OIDC federated identity instead. No client secrets, certificates, or publish profiles should be stored. Only store non-secret configuration as GitHub Variables (client IDs, tenant IDs, subscription IDs).
- **Running `dotnet ef database update` in production CD:** Requires the .NET SDK and EF tools on the runner. Use migration bundles instead -- they are self-contained executables.
- **Hardcoded connection strings in Bicep:** Use Key Vault references (`@Microsoft.KeyVault()`) in Function App settings. The actual secret is stored in Key Vault and referenced by URI.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Azure authentication in GitHub Actions | Custom token exchange scripts | `azure/login@v2` with OIDC | Handles OIDC token negotiation, token caching, session management |
| SPFx package deployment | Custom REST API calls to SharePoint | `m365 spo app add` + `m365 spo app deploy` | Handles authentication, error codes, tenant catalog URLs |
| Functions deployment | Custom zip + REST deploy | `Azure/functions-action@v1` | Handles zip packaging, slot swaps, health checks |
| Migration execution in CI/CD | Custom SQL scripts | `dotnet ef migrations bundle` | Tracks migration history, handles idempotency, rollback |
| OIDC token exchange | Custom JWT generation | GitHub's built-in OIDC provider + Entra ID federated credentials | Security-critical -- hand-rolling introduces vulnerability surface |
| Bicep deployment | ARM templates or Terraform | Azure Bicep | First-party Azure support, type-safe, module system, parameter files |

**Key insight:** Every component in this phase has an official, well-maintained tool or action. The value of this phase is wiring them together correctly, not building custom solutions.

## Common Pitfalls

### Pitfall 1: OIDC Permission Block Missing
**What goes wrong:** GitHub Actions workflow fails with "Error: Unable to get OIDC token" because the `permissions` block is missing or incomplete.
**Why it happens:** The `id-token: write` permission must be explicitly declared. Default permissions don't include it.
**How to avoid:** Always include at the job or workflow level:
```yaml
permissions:
  id-token: write
  contents: read
```
**Warning signs:** "OIDC token request failed" error in GitHub Actions logs.

### Pitfall 2: Federated Credential Subject Claim Mismatch
**What goes wrong:** Azure rejects the OIDC token because the federated credential's subject claim doesn't match the workflow context.
**Why it happens:** Subject claims differ between branch pushes (`repo:org/repo:ref:refs/heads/main`) and pull requests (`repo:org/repo:pull_request`). Each needs a separate federated credential on the Entra ID app registration.
**How to avoid:** Create two federated credentials on the Entra ID app:
1. For CD (push to main): subject = `repo:<owner>/<repo>:ref:refs/heads/main`
2. For CI (PRs): subject = `repo:<owner>/<repo>:pull_request` (only if CI needs Azure access)
**Warning signs:** "AADSTS700024: Client assertion is not within its valid time range" or subject mismatch errors.

### Pitfall 3: SPFx Heft Build Flags
**What goes wrong:** SPFx package is built in debug mode instead of production, resulting in unminified bundles or missing assets.
**Why it happens:** Using `--ship` (Gulp flag) instead of `--production` (Heft flag), or omitting the flag entirely.
**How to avoid:** Use `--production` flag: `npx heft test --clean --production && npx heft package-solution --production`. The existing `spfx/package.json` "build" script already has this correct.
**Warning signs:** Large .sppkg file size, non-minified JavaScript in package.

### Pitfall 4: Key Vault Reference Timing
**What goes wrong:** Function App fails to start because Key Vault references resolve before Key Vault secrets are populated, or the Function App's managed identity doesn't have access yet.
**Why it happens:** Bicep deploys resources in dependency order, but role assignments can take several minutes to propagate in Entra ID.
**How to avoid:** Ensure the Key Vault module creates both the secrets AND the RBAC role assignment for the Function App's managed identity. Accept that first deployment may need a retry or a brief wait for RBAC propagation.
**Warning signs:** "Key Vault reference not found" or "Access denied" errors in Function App logs after first deployment.

### Pitfall 5: Azure SQL Firewall for GitHub Actions Runners
**What goes wrong:** EF Core migration bundle cannot connect to Azure SQL because GitHub Actions runners use dynamic IP addresses that are blocked by the SQL Server firewall.
**Why it happens:** Azure SQL Server has a firewall that blocks all external connections by default.
**How to avoid:** Add a Bicep firewall rule named `AllowAllWindowsAzureIps` with start/end IP `0.0.0.0` to allow Azure service connections. For GitHub Actions runners (which are NOT Azure services), either temporarily add the runner IP or use the `azure/sql-action` which handles this.
**Warning signs:** "Cannot open server requested by the login" timeout errors during migration step.

### Pitfall 6: EF Core Migration Bundle Target Framework
**What goes wrong:** Migration bundle fails to build because it can't resolve the startup project's target framework.
**Why it happens:** The `--startup-project` and `--project` paths must be relative to the working directory, and the startup project must be buildable.
**How to avoid:** Always specify both `--project` (Infrastructure, where migrations live) and `--startup-project` (Functions, where DbContext is configured) with correct relative paths.
**Warning signs:** "Unable to create a 'DbContext' of type 'WissensHubDbContext'" build error.

### Pitfall 7: Two Separate OIDC Apps for Azure and M365
**What goes wrong:** Single Entra ID app registration is used for both Azure deployment and M365 SPFx deployment, causing permission conflicts.
**Why it happens:** Azure deployment needs Contributor role on the resource group, while M365 SPFx deployment needs Sites.Selected or equivalent SharePoint permissions. These are different permission scopes.
**How to avoid:** Create two separate Entra ID app registrations:
1. **Azure Deployment App** -- with federated credential for GitHub, Contributor role on resource group
2. **M365 CI/CD App** -- with federated credential for GitHub, Sites.Selected permission for app catalog
**Warning signs:** Insufficient permissions errors when deploying to either Azure or SharePoint.

## Code Examples

### CI Workflow (ci.yml)
```yaml
# Source: Verified against project structure and SPFx 1.22 Heft toolchain
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  build-and-test-spfx:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: spfx/package-lock.json

      - name: Install and test SPFx
        working-directory: spfx
        run: |
          npm ci
          npx heft test --clean --production

  build-and-test-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'

      - name: Restore, build, and test API
        working-directory: api
        run: |
          dotnet restore
          dotnet build --no-restore --configuration Release
          dotnet test tests/WissensHub.Tests --no-build --configuration Release -e AZURE_FUNCTIONS_ENVIRONMENT=Development
```

### CD Workflow (cd.yml) - Key Steps
```yaml
# Source: Composite of official patterns for azure/login, Azure/functions-action, m365 CLI
name: CD

on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Build SPFx
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: spfx/package-lock.json
      - working-directory: spfx
        run: |
          npm ci
          npx heft test --clean --production
          npx heft package-solution --production

      # Build API
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'
      - working-directory: api
        run: |
          dotnet restore
          dotnet build --configuration Release
          dotnet test tests/WissensHub.Tests --no-build --configuration Release -e AZURE_FUNCTIONS_ENVIRONMENT=Development
          dotnet publish src/WissensHub.Functions --configuration Release --output ./publish

      # Build migration bundle
      - run: |
          dotnet tool install --global dotnet-ef
          cd api && dotnet ef migrations bundle \
            --project src/WissensHub.Infrastructure \
            --startup-project src/WissensHub.Functions \
            --output ../efbundle \
            --self-contained

      # Upload artifacts
      - uses: actions/upload-artifact@v4
        with:
          name: spfx-package
          path: spfx/sharepoint/solution/wissens-hub.sppkg
      - uses: actions/upload-artifact@v4
        with:
          name: api-publish
          path: api/publish/
      - uses: actions/upload-artifact@v4
        with:
          name: migration-bundle
          path: efbundle

  deploy-infra:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: azure/login@v2
        with:
          client-id: ${{ vars.AZURE_CLIENT_ID }}
          tenant-id: ${{ vars.AZURE_TENANT_ID }}
          subscription-id: ${{ vars.AZURE_SUBSCRIPTION_ID }}
      - name: Deploy Bicep
        run: |
          az deployment group create \
            --resource-group ${{ vars.AZURE_RESOURCE_GROUP }} \
            --template-file infra/main.bicep \
            --parameters infra/parameters/prod.bicepparam

  deploy-migrations:
    needs: [build, deploy-infra]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: migration-bundle
      - uses: azure/login@v2
        with:
          client-id: ${{ vars.AZURE_CLIENT_ID }}
          tenant-id: ${{ vars.AZURE_TENANT_ID }}
          subscription-id: ${{ vars.AZURE_SUBSCRIPTION_ID }}
      - name: Run migrations
        run: |
          chmod +x ./efbundle
          ./efbundle --connection "${{ secrets.SQL_CONNECTION_STRING }}"

  deploy-functions:
    needs: deploy-migrations
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: api-publish
          path: ./publish
      - uses: azure/login@v2
        with:
          client-id: ${{ vars.AZURE_CLIENT_ID }}
          tenant-id: ${{ vars.AZURE_TENANT_ID }}
          subscription-id: ${{ vars.AZURE_SUBSCRIPTION_ID }}
      - uses: Azure/functions-action@v1
        with:
          app-name: ${{ vars.AZURE_FUNCTION_APP_NAME }}
          package: ./publish

  deploy-spfx:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: spfx-package
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Deploy to tenant app catalog
        run: |
          npm install @pnp/cli-microsoft365@latest -g
          m365 login --authType federated \
            --clientId ${{ vars.M365_CLIENT_ID }} \
            --tenantId ${{ vars.AZURE_TENANT_ID }}
          m365 spo app add \
            --filePath ./wissens-hub.sppkg \
            --appCatalogUrl ${{ vars.SPO_APP_CATALOG_URL }} \
            --overwrite
          m365 spo app deploy \
            --name wissens-hub.sppkg \
            --appCatalogUrl ${{ vars.SPO_APP_CATALOG_URL }}
```

### Bicep SQL Module
```bicep
// infra/modules/sql.bicep
// Source: Microsoft Learn - Azure SQL Bicep templates

@description('Environment prefix')
param environment string

@description('Azure region')
param location string

@secure()
@description('SQL Server admin password')
param sqlAdminPassword string

var serverName = 'wh-${environment}-sql'
var databaseName = 'WissensHub'

resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: serverName
  location: location
  properties: {
    administratorLogin: 'whadmin'
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-08-01-preview' = {
  parent: sqlServer
  name: databaseName
  location: location
  sku: {
    name: 'Basic'
    tier: 'Basic'
  }
}

// Allow Azure services to access (needed for Functions + GitHub Actions migrations)
resource allowAzureServices 'Microsoft.Sql/servers/firewallRules@2023-08-01-preview' = {
  parent: sqlServer
  name: 'AllowAllWindowsAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

output connectionString string = 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Initial Catalog=${databaseName};Persist Security Info=False;User ID=whadmin;Password=${sqlAdminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
output serverName string = sqlServer.name
```

### Key Vault with RBAC
```bicep
// infra/modules/key-vault.bicep

@description('Environment prefix')
param environment string
param location string
param sqlConnectionString string
param appInsightsInstrumentationKey string
param functionAppPrincipalId string

var vaultName = 'wh-${environment}-kv'
var keyVaultSecretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e6'

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: vaultName
  location: location
  properties: {
    sku: { family: 'A', name: 'standard' }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
  }
}

resource sqlSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'SqlConnectionString'
  properties: { value: sqlConnectionString }
}

resource aiSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'AppInsightsKey'
  properties: { value: appInsightsInstrumentationKey }
}

// Grant Function App managed identity access to read secrets
resource kvRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, functionAppPrincipalId, keyVaultSecretsUserRoleId)
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', keyVaultSecretsUserRoleId)
    principalId: functionAppPrincipalId
    principalType: 'ServicePrincipal'
  }
}

output keyVaultName string = keyVault.name
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| Gulp build/bundle/package (SPFx) | Heft build with `--production` flag | SPFx 1.22 (2025) | CI/CD scripts must use `heft` commands, not `gulp` |
| Certificate-based M365 CLI auth | Federated identity auth (OIDC) | CLI for M365 v10.5 (2025) | No credentials stored in repository |
| `dotnet ef database update` in CD | Migration bundles (`dotnet ef migrations bundle`) | EF Core 6+ (stable) | Self-contained executables, no SDK needed at runtime |
| Publish profiles / client secrets | OIDC workload identity federation | GitHub + Azure (2023+, now standard) | Zero stored secrets, short-lived tokens |
| ARM templates | Azure Bicep | Mature (2023+) | Simpler syntax, modules, type safety |
| Azure SQL Edge for local dev | SQL Server 2022 via Rosetta 2 | Project Phase 1 decision | Consistent with production SQL Server |

**Deprecated/outdated:**
- **Gulp toolchain**: Replaced by Heft in SPFx 1.22. Direct `gulp` calls in CI/CD will fail.
- **Linux Consumption plan retirement**: After September 2028, Linux Consumption plan is retired. Flex Consumption plan is the successor. For this portfolio project, Consumption plan is fine for now.
- **Certificate-based M365 auth in CI/CD**: Still works but federated identity is the modern approach with zero secret management overhead.

## Open Questions

1. **SQL Connection String for Migration Bundle**
   - What we know: The migration bundle needs a connection string passed via `--connection` parameter. Azure SQL has firewall rules that must allow the GitHub Actions runner IP.
   - What's unclear: Whether the `AllowAllWindowsAzureIps` firewall rule (`0.0.0.0`) is sufficient for GitHub Actions runners (they are NOT Azure services -- they're Microsoft-hosted but not technically in the Azure service fabric). May need to temporarily add the runner's IP.
   - Recommendation: Start with `AllowAllWindowsAzureIps`. If that fails, add a step to dynamically allow the runner IP via `az sql server firewall-rule create` and remove it after migration. The SQL connection string itself should be stored as a GitHub Actions secret (this is the ONE exception to the "no secrets" rule -- OIDC provides Azure auth, but the SQL connection string is still needed for the migration bundle which runs outside Azure).

2. **Circular Dependency: Key Vault and Function App**
   - What we know: Function App needs Key Vault name for `@Microsoft.KeyVault()` references. Key Vault needs Function App's managed identity principal ID for RBAC.
   - What's unclear: How to handle this circular dependency in Bicep.
   - Recommendation: Deploy Function App first (without Key Vault references in settings), then Key Vault with RBAC for the Function App's identity, then update Function App settings with Key Vault references in a second pass. Alternatively, use a two-module approach within function-app.bicep: create the app, then create a nested `config` resource for app settings that depends on Key Vault.

3. **M365 Federated Identity App Permissions**
   - What we know: The M365 CI/CD app needs `Sites.Selected` permission and a federated credential for the main branch.
   - What's unclear: Whether the user has already created this Entra ID app or needs guidance to do so manually (this is a one-time portal setup, not automatable in the pipeline).
   - Recommendation: Include clear setup instructions in the README production deployment guide. This is a one-time manual prerequisite.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|---|---|---|---|---|
| Node.js | SPFx build | Yes | 22.22.1 | -- |
| .NET SDK | API build | Yes | 10.0.201 | -- |
| GitHub CLI (gh) | PR creation, workflow management | Yes | 2.88.1 | -- |
| Azure Functions Core Tools | Local dev (existing) | Yes | 4.8.0 | -- |
| Azure CLI (az) | Bicep deployment in CD | No (local) | -- | Only needed in GitHub Actions runners (pre-installed on ubuntu-latest) |
| Bicep CLI | IaC authoring/validation | No (local) | -- | Bicep is built into `az` CLI; for local validation use `az bicep build` |
| CLI for Microsoft 365 (m365) | SPFx deployment in CD | No (local) | -- | Only needed in GitHub Actions runners (installed via npm in workflow) |

**Missing dependencies with no fallback:**
- None -- all missing tools are only needed in GitHub Actions runners where they are either pre-installed (az CLI) or installed during the workflow (m365 CLI, dotnet-ef).

**Missing dependencies with fallback:**
- Azure CLI and Bicep are not installed locally, but this is expected. Bicep files can be authored with VS Code Bicep extension for validation. Actual deployment happens in GitHub Actions where az CLI is pre-installed on ubuntu-latest runners.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest via Heft (frontend), xUnit (backend), Playwright (E2E) |
| Config file | `spfx/config/jest.config.json`, `api/tests/WissensHub.Tests/WissensHub.Tests.csproj`, `e2e/playwright.config.ts` |
| Quick run command | `cd spfx && npx heft test --clean` (frontend) / `cd api && dotnet test tests/WissensHub.Tests -e AZURE_FUNCTIONS_ENVIRONMENT=Development` (backend) |
| Full suite command | `npm run test:all` (frontend + backend) |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DEVP-02 | Bicep modules are valid and deployable | manual | `az bicep build --file infra/main.bicep` (requires az CLI) | N/A -- Bicep validation, no unit test |
| DEVP-03 | CI pipeline builds and tests on PR | manual | Trigger via PR creation; verify in GitHub Actions UI | N/A -- workflow file validation |
| DEVP-04 | CD pipeline deploys on merge to main | manual | Trigger via merge; verify in GitHub Actions UI | N/A -- workflow file validation |
| DEVP-05 | SPFx deploys to tenant app catalog | manual | Verify app appears in tenant app catalog after CD run | N/A -- integration validation |
| DEVP-06 | EF Core migrations run before code deployment | manual | Verify migration bundle runs successfully in CD logs | N/A -- CD pipeline step validation |
| DEVP-07 | OIDC federated identity -- no stored secrets | manual | Verify no client secrets in GitHub secrets; OIDC login succeeds in CD | N/A -- security audit |
| DEVP-08 | README contains all required sections | manual-only | Visual inspection of README.md content | N/A -- documentation review |

### Sampling Rate
- **Per task commit:** `npm run test:all` (ensure existing tests still pass after any code changes)
- **Per wave merge:** Full suite + Bicep validation (`az bicep build --file infra/main.bicep` if az CLI available)
- **Phase gate:** All existing tests green + successful CD pipeline run deploying to Azure

### Wave 0 Gaps
None -- this phase creates infrastructure and documentation files, not application code. Existing test suites (161 frontend + 49 backend + 4 E2E) serve as regression validation. Bicep validation is done via `az bicep build` which is a linting/compilation check, not a unit test. Pipeline validation is inherently manual (requires GitHub + Azure + M365 tenant).

## Sources

### Primary (HIGH confidence)
- [Microsoft Learn - Bicep modules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/modules) - Module structure, output chaining
- [Microsoft Learn - Function App Bicep quickstart](https://learn.microsoft.com/en-us/azure/azure-functions/functions-create-first-function-bicep) - Complete Bicep template with Flex Consumption
- [GitHub Docs - OIDC in Azure](https://docs.github.com/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-azure) - OIDC configuration, permissions, subject claims
- [Microsoft Learn - OIDC Azure authentication](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure-openid-connect) - azure/login action setup
- [Microsoft .NET Blog - Migration Bundles](https://devblogs.microsoft.com/dotnet/introducing-devops-friendly-ef-core-migration-bundles/) - Bundle creation and execution
- [Microsoft Learn - Applying Migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying) - Bundle CLI options, --self-contained flag
- [Microsoft Learn - SQL firewall rules Bicep](https://learn.microsoft.com/en-us/azure/templates/microsoft.sql/servers/firewallrules) - AllowAllWindowsAzureIps pattern

### Secondary (MEDIUM confidence)
- [Voitanos - SPFx CI/CD with Federated Identity](https://www.voitanos.io/blog/sharepoint-framework-cicd-github-federated-identity/) - Complete SPFx deployment workflow with OIDC
- [petkir.at - SPFx 1.22 CI/CD with Heft](https://www.petkir.at/blog/spfx-1-22-ci-cd-npm-heft) - Heft build commands replacing Gulp
- [DEV Community - Bicep Function Apps with KeyVault](https://dev.to/dazfuller/azure-bicep-deploy-function-apps-with-keyvault-references-36o1) - @Microsoft.KeyVault() reference pattern
- [PnP CLI for M365 - GitHub Actions guide](https://pnp.github.io/cli-microsoft365/user-guide/github-actions/) - CLI auth and deployment commands
- [dandoescode.com - Azure SQL with EF Core and GitHub](https://www.dandoescode.com/blog/azure-sql-databases-deploying-updates-with-ef-core-and-github) - Migration deployment patterns

### Tertiary (LOW confidence)
- Flex Consumption plan regional availability may have expanded since research date -- verify with `az functionapp list-flexconsumption-locations` before choosing plan type

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All tools are first-party Microsoft or well-established community (PnP) tools with official documentation
- Architecture: HIGH - Modular Bicep, split CI/CD workflows, and OIDC federated identity are well-documented standard patterns
- Pitfalls: HIGH - Based on official documentation warnings, community blog experiences, and known Azure service behaviors
- SPFx Heft build commands: MEDIUM - Verified against project's package.json and community blog posts, but Heft CI/CD documentation is still sparse compared to the old Gulp approach

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (30 days -- stable technologies, unlikely to change significantly)
