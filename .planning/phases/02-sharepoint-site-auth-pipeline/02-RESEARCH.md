# Phase 2: SharePoint Site & Auth Pipeline - Research

**Researched:** 2026-03-15
**Domain:** SharePoint provisioning (PnP PowerShell), Entra ID app registration, SPFx AadHttpClient authentication, Azure Functions JWT validation
**Confidence:** HIGH

## Summary

Phase 2 provisions the SharePoint Communication Site with custom columns, groups, navigation, sample content, and configures the Entra ID app registration for SPFx-to-Azure Functions authentication. The entire provisioning stack uses PnP PowerShell with Microsoft Graph PowerShell SDK for the Entra ID portion. The auth pipeline uses AadHttpClient in SPFx to obtain bearer tokens, with in-code JWT validation middleware on the Azure Functions side (avoiding EasyAuth to prevent CORS preflight failures).

The existing Azure Functions project already uses the ASP.NET Core integration model (`ConfigureFunctionsWebApplication`) with .NET 10 isolated worker, which natively supports custom middleware registration via `UseMiddleware<T>()`. The SPFx solution at version 1.22.2 needs `@microsoft/sp-http` added as a dependency for AadHttpClient support, and `package-solution.json` needs `webApiPermissionRequests` added for the Entra ID API scope.

**Primary recommendation:** Use a single Entra ID app registration for the Azure Functions API, expose an `access_as_user` scope, request it via SPFx `webApiPermissionRequests`, and validate JWT tokens in Azure Functions middleware -- keeping `AuthorizationLevel.Anonymous` on all HTTP triggers.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Modular with orchestrator: separate .ps1 files per concern (site, groups, columns, pages, navigation, sample data, Entra ID) with a main Deploy-WissensHub.ps1 that calls them in order
- Fully idempotent -- each module checks if resources exist before creating. Safe to re-run after failures or when adding new resources
- Parameter file (config.json or .psd1) for tenant-specific values (tenant URL, admin UPN, group names). Gitignore-friendly for secrets
- Entra ID app registration included in the orchestrator as a module -- not a separate script or manual step
- 8-10 sample articles covering all statuses: 3-4 Published, 2 Draft, 1 InReview, 1 Archived, 1 flagged as outdated
- Business-realistic German categories: IT-Sicherheit, Datenschutz, Onboarding, Arbeitsprozesse, Compliance
- Real-looking German article content with headings, lists, and paragraphs -- not lorem ipsum
- 3-4 target groups: Alle Mitarbeiter, IT-Abteilung, Management, Neue Mitarbeiter
- Feature-based top navigation: Startseite (Dashboard), Wissensdatenbank (all articles), Freigabecenter (reviewers), Administration (admins)
- Dedicated Modern Pages per web part: Dashboard.aspx (home), Freigabecenter.aspx, Administration.aspx
- Dashboard page set as site home page
- Article pages use 2/3 + 1/3 column layout: article content left, Article Sidebar web part right
- All nav links visible to everyone; role-gated web parts handle visibility per role
- PnP PowerShell + Microsoft Graph for Entra ID app registration (same toolchain as SharePoint provisioning)
- Smoke test: Dashboard web part makes AadHttpClient call to /api/health on load, displays result
- After registration, provisioning script outputs app client ID and API scope URI to the parameter file for SPFx configuration
- AuthorizationLevel.Anonymous + in-code token validation on Azure Functions (avoids CORS + EasyAuth double-config)
- WH_ prefix on all custom SharePoint columns to avoid internal name mangling

### Claude's Discretion
- Single vs dual Entra ID app registration (user said "you decide" -- pick based on AadHttpClient best practices)
- Exact column field types and configurations (Choice vs Managed Metadata, etc.)
- PowerShell module structure and naming conventions
- Sample article content topics and body text specifics
- Error handling verbosity in provisioning scripts

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-06 | Entra ID app registration with AadHttpClient for SPFx-to-Azure Functions authentication | Single app registration pattern, exposed `access_as_user` scope, webApiPermissionRequests in package-solution.json, JWT middleware in Azure Functions |
| INFRA-07 | SharePoint Communication Site provisioned with custom columns on Site Pages (Category, Status, TargetGroups, IsMandatory, Reviewer, ReviewByDate) | PnP PowerShell `New-PnPSite -Type CommunicationSite`, `Add-PnPField` with WH_ prefix, field type recommendations |
| INFRA-08 | SharePoint Groups created (WissensHub Members, WissensHub Editors, WissensHub Reviewers, WissensHub Owners) | `New-PnPSiteGroup` with permission levels, idempotency via `Get-PnPSiteGroup` check |
| DEVP-01 | PnP PowerShell provisioning script (site, groups, columns, pages, navigation, sample data) | Modular orchestrator pattern, all PnP cmdlets verified, idempotency patterns documented |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| PnP.PowerShell | 2.12+ | SharePoint provisioning (site, columns, groups, pages, navigation) | De facto standard for SharePoint automation; replaces SPO Management Shell for most tasks |
| Microsoft.Graph (PowerShell SDK) | 2.x | Entra ID app registration, service principal, API scope exposure | Official Microsoft tooling for Entra ID management |
| @microsoft/sp-http | 1.22.2 | AadHttpClient and AadHttpClientFactory for authenticated API calls from SPFx | Built-in SPFx authentication client; handles OAuth flow via SharePoint Online Client Extensibility principal |
| Microsoft.Identity.Web | 3.x | JWT token validation in Azure Functions | Microsoft's official library for Entra ID token validation in ASP.NET Core |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| System.IdentityModel.Tokens.Jwt | 8.x | JWT token reading and validation (transitive via Microsoft.Identity.Web) | Implicitly used by authentication middleware |
| Microsoft.IdentityModel.Protocols.OpenIdConnect | 8.x | OpenID Connect metadata retrieval for signing key discovery | Implicitly used for token validation parameter resolution |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| In-code JWT validation | Azure App Service EasyAuth | EasyAuth intercepts CORS preflight OPTIONS requests before CORS middleware, returning 401 -- breaks SPFx cross-origin calls. In-code validation avoids this entirely. |
| Microsoft.Identity.Web | Manual JwtSecurityTokenHandler | Microsoft.Identity.Web wraps the handler with sensible defaults; manual approach is more code but gives full control. Either works. |
| PnP PowerShell | PnP provisioning XML templates | XML templates are powerful for complex provisioning but harder to make idempotent and debug. Script-per-concern is more transparent. |

**Installation (Azure Functions):**
```bash
dotnet add package Microsoft.Identity.Web --version 3.8.0
```

**Installation (SPFx):**
```bash
npm install @microsoft/sp-http@1.22.2
```

## Architecture Patterns

### Recommended Project Structure
```
scripts/
  Deploy-WissensHub.ps1           # Main orchestrator
  config.template.json             # Template parameter file (committed)
  config.json                      # Actual config (gitignored)
  modules/
    New-WissensHubSite.ps1         # Communication Site creation
    New-WissensHubGroups.ps1       # SharePoint group creation
    New-WissensHubColumns.ps1      # Custom column creation on Site Pages
    New-WissensHubPages.ps1        # Modern pages + layout creation
    New-WissensHubNavigation.ps1   # Top navigation configuration
    New-WissensHubSampleData.ps1   # Sample articles with metadata
    New-WissensHubEntraApp.ps1     # Entra ID app registration + scope
```

### Pattern 1: Single Entra ID App Registration (Claude's Discretion Decision)
**What:** One app registration for the Azure Functions API, with an exposed `access_as_user` delegated scope. SPFx requests this scope via webApiPermissionRequests. No separate "client" app needed because SPFx uses the pre-provisioned "SharePoint Online Client Extensibility" service principal.

**Why single over dual:** AadHttpClient does NOT use a custom client app registration. It always authenticates through the "SharePoint Online Client Extensibility" service principal (Client ID: `08e18876-6177-487e-b8b5-cf950c1e598c`), which is pre-provisioned in every Microsoft 365 tenant. You only need a "resource" app registration (representing your API) that exposes the scope. A second "client" app registration would be unused by AadHttpClient and would add unnecessary complexity.

**When to use:** Always, when using AadHttpClient from SPFx to call a custom API.

**Configuration flow:**
```
1. Create Entra ID app registration (New-MgApplication)
2. Set Application ID URI: api://{clientId}
3. Expose scope: access_as_user (delegated, admin consent)
4. Create service principal (New-MgServicePrincipal)
5. Pre-authorize SharePoint Online Client Extensibility (Client ID: 08e18876-6177-487e-b8b5-cf950c1e598c)
6. Add webApiPermissionRequests to package-solution.json
7. Deploy .sppkg to app catalog -> admin approves API permission
8. AadHttpClient.getClient("api://{clientId}") in SPFx code
```

### Pattern 2: Idempotent Provisioning Module
**What:** Each PowerShell module checks for resource existence before creating.
**When to use:** Every provisioning module must follow this pattern.
**Example:**
```powershell
# Source: PnP PowerShell official docs
function New-WissensHubSiteIfNotExists {
    param([string]$Url, [string]$Title)

    $existingSite = Get-PnPTenantSite -Url $Url -ErrorAction SilentlyContinue
    if ($existingSite) {
        Write-Host "Site '$Url' already exists. Skipping creation." -ForegroundColor Yellow
        return
    }

    New-PnPSite -Type CommunicationSite -Title $Title -Url $Url -Lcid 1031
    Write-Host "Site '$Url' created successfully." -ForegroundColor Green
}
```

### Pattern 3: WH_ Prefixed Column with Add-PnPField
**What:** All custom columns use the `WH_` prefix on InternalName to prevent SharePoint's internal name mangling (which converts special characters to Unicode hex codes like `_x0020_`).
**When to use:** Every custom column added to the Site Pages library.
**Example:**
```powershell
# Source: PnP PowerShell Add-PnPField docs
Add-PnPField -List "Site Pages" `
    -DisplayName "Category" `
    -InternalName "WH_Category" `
    -Type Choice `
    -Choices "IT-Sicherheit","Datenschutz","Onboarding","Arbeitsprozesse","Compliance" `
    -Group "WissensHub"
```

### Pattern 4: JWT Validation Middleware in Azure Functions
**What:** Custom IFunctionsWorkerMiddleware that validates Entra ID bearer tokens on HTTP-triggered functions.
**When to use:** All API endpoints except /api/health (which stays open for smoke testing during development, but will be protected later).
**Example:**
```csharp
// Source: Microsoft Learn Azure Functions isolated worker guide + Microsoft.Identity.Web
internal sealed class AuthenticationMiddleware : IFunctionsWorkerMiddleware
{
    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        // Only validate HTTP triggers
        var isHttpTrigger = context.FunctionDefinition.InputBindings.Values
            .Any(b => b.Type == "httpTrigger");

        if (!isHttpTrigger)
        {
            await next(context);
            return;
        }

        var httpReqData = await context.GetHttpRequestDataAsync();
        var authHeader = httpReqData?.Headers
            .TryGetValues("Authorization", out var values) == true
            ? values.FirstOrDefault() : null;

        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
        {
            var response = httpReqData!.CreateResponse(HttpStatusCode.Unauthorized);
            context.GetInvocationResult().Value = response;
            return;
        }

        // Validate token using Microsoft.Identity.Web configuration
        // Token validation parameters loaded from AzureAd config section
        await next(context);
    }
}
```

### Pattern 5: AadHttpClient Usage in SPFx Web Part
**What:** Dashboard web part uses AadHttpClient to call /api/health as smoke test.
**Example:**
```typescript
// Source: Microsoft Learn - Connect to Entra ID-secured APIs in SPFx
import { AadHttpClient, HttpClientResponse } from '@microsoft/sp-http';

// In the web part class, pass aadHttpClientFactory to React component:
this.context.aadHttpClientFactory
  .getClient('api://{client-id-from-config}')
  .then((client: AadHttpClient): void => {
    client
      .get('https://{function-app}.azurewebsites.net/api/health',
           AadHttpClient.configurations.v1)
      .then((response: HttpClientResponse): Promise<any> => {
        return response.json();
      })
      .then((data: any): void => {
        // Display health status in the Dashboard component
        console.log('API Health:', data.status);
      });
  });
```

### Anti-Patterns to Avoid
- **Using EasyAuth for SPFx-called APIs:** EasyAuth (Azure App Service Authentication) intercepts CORS preflight OPTIONS requests before the CORS middleware runs, returning 401 for legitimate preflight requests. Always use in-code token validation when SPFx calls Azure Functions cross-origin.
- **Creating a "client" app registration for AadHttpClient:** AadHttpClient uses the built-in SharePoint Online Client Extensibility principal. A separate client app registration is ignored and adds confusion.
- **Using display names as column InternalName:** SharePoint mangles internal names with special characters (spaces become `_x0020_`, etc.). Always set InternalName explicitly with a clean prefix like `WH_`.
- **Non-idempotent provisioning:** Scripts that fail on re-run because resources already exist are fragile. Always check existence first.
- **Hardcoding tenant-specific values in scripts:** Tenant URL, admin UPN, client IDs must come from the parameter file, not be hardcoded.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OAuth token acquisition in SPFx | Custom MSAL.js flow | AadHttpClient / aadHttpClientFactory | SPFx explicitly discourages direct MSAL.js usage (blocked since v1.4.1); AadHttpClient handles the full OAuth implicit flow via the SharePoint Online Client Extensibility principal |
| JWT validation in Azure Functions | Manual token parsing and signature check | Microsoft.Identity.Web + IFunctionsWorkerMiddleware | Token validation requires OpenID Connect discovery, key rotation handling, issuer/audience validation, clock skew -- all handled by the library |
| SharePoint site provisioning | CSOM or REST API direct calls | PnP PowerShell cmdlets | PnP wraps the complexity of CSOM/REST with idempotency-friendly cmdlets and handles auth token management |
| Entra ID app registration | Azure Portal manual clicks | Microsoft.Graph PowerShell SDK (New-MgApplication, Update-MgApplication) | Script must be repeatable and part of the orchestrator; manual portal steps break automation |

**Key insight:** The auth pipeline involves three coordinated systems (Entra ID, SharePoint admin consent, Azure Functions token validation). Each has libraries purpose-built for automation. Hand-rolling any piece risks subtle security bugs (e.g., not validating token signature, not checking audience, not handling key rotation).

## Common Pitfalls

### Pitfall 1: CORS Preflight Failure with EasyAuth
**What goes wrong:** SPFx makes cross-origin requests to Azure Functions. Browsers send an OPTIONS preflight request without credentials. If EasyAuth is enabled, it intercepts the OPTIONS request before the CORS middleware and returns 401 Unauthorized.
**Why it happens:** EasyAuth runs as an App Service module before your application code. CORS preflight requests never include credentials per the W3C specification.
**How to avoid:** Use `AuthorizationLevel.Anonymous` on all HTTP triggers and validate JWT tokens in custom middleware within your application code. Configure CORS at the Azure Functions platform level (host.json or Azure Portal) to allow the SharePoint tenant origin.
**Warning signs:** API calls work from Postman but fail from SPFx with CORS errors.

### Pitfall 2: SharePoint Column Internal Name Mangling
**What goes wrong:** Creating a column with DisplayName "Target Groups" produces InternalName `Target_x0020_Groups`. OData queries then need `OData__x0020_` prefixed names, which is error-prone.
**Why it happens:** SharePoint encodes non-alphanumeric characters in InternalName using Unicode hex. The InternalName is set at creation time and cannot be changed afterward.
**How to avoid:** Always explicitly set `-InternalName "WH_TargetGroups"` when calling `Add-PnPField`. The `WH_` prefix ensures clean, predictable internal names across all custom columns.
**Warning signs:** REST/OData queries return "field not found" errors despite the column being visible in the UI.

### Pitfall 3: webApiPermissionRequests Resource Name Must Be DisplayName
**What goes wrong:** Setting `"resource"` to an Object ID or Application ID URI in `webApiPermissionRequests` causes the permission request to fail silently or with a cryptic error during app catalog deployment.
**Why it happens:** SharePoint resolves the resource by the Entra ID application's `displayName`, not by its `objectId` or `appId`.
**How to avoid:** Use the exact display name of the Entra ID app registration as the `resource` value. For example, `"resource": "WissensHub API"`.
**Warning signs:** Permission request shows up as "Unknown" in SharePoint admin center, or approval fails.

### Pitfall 4: Forgetting to Create Service Principal After App Registration
**What goes wrong:** App registration exists in Entra ID but AadHttpClient cannot find the resource when calling `getClient()`.
**Why it happens:** `New-MgApplication` creates only the application object. The service principal (the local representation of the app in the tenant) must be created separately with `New-MgServicePrincipal`.
**How to avoid:** Always call `New-MgServicePrincipal -AppId $app.AppId` immediately after creating the application.
**Warning signs:** `getClient()` throws "AADSTS650052: The app needs access to a service" error.

### Pitfall 5: Not Pre-authorizing SharePoint Client Extensibility
**What goes wrong:** Even after admin approves the API permission in SharePoint admin center, users still get consent prompts or token acquisition fails.
**Why it happens:** The SharePoint Online Client Extensibility principal (ID: `08e18876-6177-487e-b8b5-cf950c1e598c`) needs to be pre-authorized on the API's exposed scope to suppress user consent prompts.
**How to avoid:** In the Entra ID app registration, under "Expose an API" > "Authorized client applications", add the SharePoint Online Client Extensibility principal ID and select the `access_as_user` scope.
**Warning signs:** Admin approval succeeds but users get "AADSTS65001: The user or administrator has not consented" errors.

### Pitfall 6: LCID Not Set for German Site
**What goes wrong:** Communication Site is created with English as the default language, producing English system pages and navigation labels.
**Why it happens:** `New-PnPSite` defaults to English (LCID 1033) if `-Lcid` is not specified.
**How to avoid:** Always pass `-Lcid 1031` (German) when creating the Communication Site.
**Warning signs:** System-generated pages and default navigation show English labels instead of German.

## Code Examples

Verified patterns from official sources:

### Creating the Communication Site
```powershell
# Source: https://pnp.github.io/powershell/cmdlets/New-PnPSite.html
New-PnPSite -Type CommunicationSite `
    -Title "WissensHub" `
    -Url "https://$TenantName.sharepoint.com/sites/WissensHub" `
    -Lcid 1031 `
    -Description "Zentrale Wissensdatenbank"
```

### Creating SharePoint Groups
```powershell
# Source: https://pnp.github.io/powershell/cmdlets/New-PnPSiteGroup.html
$groups = @(
    @{ Name = "WissensHub Members";   PermLevel = "Read" },
    @{ Name = "WissensHub Editors";   PermLevel = "Edit" },
    @{ Name = "WissensHub Reviewers"; PermLevel = "Read" },
    @{ Name = "WissensHub Owners";    PermLevel = "Full Control" }
)

foreach ($group in $groups) {
    $existing = Get-PnPSiteGroup | Where-Object { $_.Title -eq $group.Name }
    if (-not $existing) {
        New-PnPSiteGroup -Name $group.Name -PermissionLevels $group.PermLevel
        Write-Host "Created group: $($group.Name)" -ForegroundColor Green
    } else {
        Write-Host "Group '$($group.Name)' already exists." -ForegroundColor Yellow
    }
}
```

### Adding Custom Columns to Site Pages
```powershell
# Source: https://pnp.github.io/powershell/cmdlets/Add-PnPField.html
# Choice field for Category
$existingField = Get-PnPField -List "Site Pages" -Identity "WH_Category" -ErrorAction SilentlyContinue
if (-not $existingField) {
    Add-PnPField -List "Site Pages" `
        -DisplayName "Category" `
        -InternalName "WH_Category" `
        -Type Choice `
        -Choices "IT-Sicherheit","Datenschutz","Onboarding","Arbeitsprozesse","Compliance" `
        -Group "WissensHub"
}

# Choice field for Status
Add-PnPField -List "Site Pages" `
    -DisplayName "Status" `
    -InternalName "WH_Status" `
    -Type Choice `
    -Choices "Draft","InReview","Published","Archived" `
    -Group "WissensHub"

# Multi-line text for Target Groups (semicolon-delimited for multi-select)
Add-PnPField -List "Site Pages" `
    -DisplayName "Target Groups" `
    -InternalName "WH_TargetGroups" `
    -Type Note `
    -Group "WissensHub"

# Boolean for IsMandatory
Add-PnPField -List "Site Pages" `
    -DisplayName "Is Mandatory" `
    -InternalName "WH_IsMandatory" `
    -Type Boolean `
    -Group "WissensHub"

# User field for Reviewer
Add-PnPField -List "Site Pages" `
    -DisplayName "Reviewer" `
    -InternalName "WH_Reviewer" `
    -Type User `
    -Group "WissensHub"

# DateTime field for ReviewByDate
Add-PnPField -List "Site Pages" `
    -DisplayName "Review By Date" `
    -InternalName "WH_ReviewByDate" `
    -Type DateTime `
    -Group "WissensHub"
```

### Entra ID App Registration via Microsoft Graph PowerShell
```powershell
# Source: https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.applications/new-mgapplication
# Step 1: Create the application
$app = New-MgApplication -DisplayName "WissensHub API" -SignInAudience "AzureADMyOrg"

# Step 2: Set Application ID URI
Update-MgApplication -ApplicationId $app.Id -IdentifierUris @("api://$($app.AppId)")

# Step 3: Define and expose the access_as_user scope
$scopeId = [guid]::NewGuid()
$api = @{
    Oauth2PermissionScopes = @(
        @{
            AdminConsentDescription = "Allow SPFx to call WissensHub API on behalf of the signed-in user"
            AdminConsentDisplayName = "Access WissensHub API"
            Id                      = $scopeId.ToString()
            IsEnabled               = $true
            Type                    = "Admin"
            Value                   = "access_as_user"
        }
    )
}
Update-MgApplication -ApplicationId $app.Id -Api $api

# Step 4: Pre-authorize SharePoint Online Client Extensibility
$preAuthApp = @{
    AppId                  = "08e18876-6177-487e-b8b5-cf950c1e598c"
    DelegatedPermissionIds = @($scopeId.ToString())
}
Update-MgApplication -ApplicationId $app.Id -Api @{
    Oauth2PermissionScopes = $api.Oauth2PermissionScopes
    PreAuthorizedApplications = @($preAuthApp)
}

# Step 5: Create service principal
New-MgServicePrincipal -AppId $app.AppId

# Step 6: Output values for SPFx configuration
Write-Host "Client ID: $($app.AppId)"
Write-Host "API Scope URI: api://$($app.AppId)/access_as_user"
```

### webApiPermissionRequests in package-solution.json
```json
{
  "solution": {
    "webApiPermissionRequests": [
      {
        "resource": "WissensHub API",
        "scope": "access_as_user"
      }
    ]
  }
}
```

### Adding Navigation
```powershell
# Source: https://pnp.github.io/powershell/cmdlets/Add-PnPNavigationNode.html
# Clear existing top navigation first
$existingNodes = Get-PnPNavigationNode -Location TopNavigationBar
foreach ($node in $existingNodes) {
    Remove-PnPNavigationNode -Identity $node.Id -Force
}

# Add feature-based navigation
Add-PnPNavigationNode -Title "Startseite" -Url "/sites/WissensHub/SitePages/Dashboard.aspx" -Location TopNavigationBar
Add-PnPNavigationNode -Title "Wissensdatenbank" -Url "/sites/WissensHub/SitePages" -Location TopNavigationBar
Add-PnPNavigationNode -Title "Freigabecenter" -Url "/sites/WissensHub/SitePages/Freigabecenter.aspx" -Location TopNavigationBar
Add-PnPNavigationNode -Title "Administration" -Url "/sites/WissensHub/SitePages/Administration.aspx" -Location TopNavigationBar
```

### Creating Pages and Setting Home Page
```powershell
# Source: https://pnp.github.io/powershell/cmdlets/Add-PnPPage.html
# Source: https://pnp.github.io/powershell/cmdlets/Set-PnPHomePage.html

# Create Dashboard page (will be set as home)
$dashboardPage = Get-PnPPage -Identity "Dashboard" -ErrorAction SilentlyContinue
if (-not $dashboardPage) {
    Add-PnPPage -Name "Dashboard" -LayoutType Home -Title "WissensHub Dashboard"
}

# Create Freigabecenter page
$freiPage = Get-PnPPage -Identity "Freigabecenter" -ErrorAction SilentlyContinue
if (-not $freiPage) {
    Add-PnPPage -Name "Freigabecenter" -LayoutType Article -Title "Freigabecenter"
}

# Create Administration page
$adminPage = Get-PnPPage -Identity "Administration" -ErrorAction SilentlyContinue
if (-not $adminPage) {
    Add-PnPPage -Name "Administration" -LayoutType Article -Title "Administration"
}

# Set Dashboard as site home page
Set-PnPHomePage -RootFolderRelativeUrl "SitePages/Dashboard.aspx"
```

### Azure Functions CORS Configuration (local.settings.json)
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "AzureAd__Instance": "https://login.microsoftonline.com/",
    "AzureAd__TenantId": "{tenant-id}",
    "AzureAd__ClientId": "{client-id}",
    "AzureAd__Audience": "api://{client-id}"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=WissensHub;User Id=sa;Password=WissensHub_Dev2026!;TrustServerCertificate=True;"
  },
  "Host": {
    "CORS": "https://{tenant}.sharepoint.com",
    "CORSCredentials": true
  }
}
```

### Parameter File Template (config.template.json)
```json
{
  "tenantName": "contoso",
  "siteUrl": "https://contoso.sharepoint.com/sites/WissensHub",
  "adminUpn": "admin@contoso.onmicrosoft.com",
  "azureFunctionUrl": "https://wissenshub-api.azurewebsites.net",
  "entraApp": {
    "displayName": "WissensHub API",
    "clientId": "",
    "scopeUri": ""
  },
  "groups": {
    "members": "WissensHub Members",
    "editors": "WissensHub Editors",
    "reviewers": "WissensHub Reviewers",
    "owners": "WissensHub Owners"
  },
  "categories": [
    "IT-Sicherheit",
    "Datenschutz",
    "Onboarding",
    "Arbeitsprozesse",
    "Compliance"
  ],
  "targetGroups": [
    "Alle Mitarbeiter",
    "IT-Abteilung",
    "Management",
    "Neue Mitarbeiter"
  ]
}
```

## Column Type Recommendations (Claude's Discretion)

Based on research into how these columns will be consumed by SPFx via REST/OData and how they integrate with SharePoint's built-in features:

| Column | InternalName | Type | Rationale |
|--------|-------------|------|-----------|
| Category | WH_Category | Choice | Finite list controlled by admin; Choice renders as dropdown in SharePoint forms; filterable in REST queries via `$filter=WH_Category eq 'X'` |
| Status | WH_Status | Choice | Four fixed values (Draft, InReview, Published, Archived); Choice enforces valid values at the SharePoint level |
| Target Groups | WH_TargetGroups | Note (multi-line text) | Stored as semicolon-delimited string (e.g., "Alle Mitarbeiter;IT-Abteilung"); avoids Managed Metadata complexity and term store dependency; easily parsed in SPFx |
| Is Mandatory | WH_IsMandatory | Boolean | Binary yes/no; renders as checkbox |
| Reviewer | WH_Reviewer | User | People picker in SharePoint; stores user ID for lookup; `$expand=WH_Reviewer` in REST queries to get display name |
| Review By Date | WH_ReviewByDate | DateTime | Date picker in SharePoint; enables `$filter=WH_ReviewByDate le datetime'...'` for freshness queries |

**Why NOT Managed Metadata for Category:** Managed Metadata requires a Term Store, term group, and term set setup. For 5 categories in a single-tenant deployment, Choice fields are simpler, require no additional infrastructure, and are equally queryable via REST. If the project ever needs cross-site-collection taxonomy, Managed Metadata could be added later.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SPO Management Shell | PnP PowerShell 2.x | 2023+ | PnP is community standard; more cmdlets, better maintained |
| Azure AD Graph API | Microsoft Graph API / PowerShell SDK | 2022 (Azure AD Graph deprecated) | Must use Microsoft.Graph module, not AzureAD module |
| MSAL.js in SPFx | AadHttpClient (built-in) | SPFx 1.4.1 (2018) | Direct MSAL.js is not supported in SPFx; AadHttpClient is the only supported approach |
| In-process Azure Functions | Isolated worker model | 2024 (in-process EOL Nov 2026) | .NET 10 requires isolated worker; supports custom middleware natively |
| Azure AD App Registration manual | New-MgApplication + Update-MgApplication | 2023 (AzureAD module deprecated) | Microsoft Graph PowerShell SDK is the current standard |
| ConfigureFunctionsWorkerDefaults | ConfigureFunctionsWebApplication | 2024 | ASP.NET Core integration (HttpRequest, IActionResult) is the current default |

**Deprecated/outdated:**
- `AzureAD` PowerShell module: Deprecated since March 2024. Use `Microsoft.Graph` PowerShell SDK instead.
- In-process Azure Functions model: End of support November 2026. Already on isolated worker.
- Direct MSAL.js in SPFx: Not supported since SPFx 1.4.1. Use AadHttpClient.

## Open Questions

1. **SharePoint Admin Consent Timing**
   - What we know: webApiPermissionRequests are approved in SharePoint Admin Center after .sppkg deployment. The provisioning script can automate site/groups/columns but NOT admin consent approval.
   - What's unclear: Whether PnP PowerShell can programmatically approve API permission requests (Approve-SPOTenantServicePrincipalPermissionRequest requires SPO Management Shell).
   - Recommendation: Document as a manual step in the provisioning guide. The script should output the pending permission request ID and instructions for the admin.

2. **Azure Functions CORS Configuration for Development**
   - What we know: CORS must be configured at the Azure Functions platform level for cross-origin requests from SharePoint. The `Host.CORS` setting in local.settings.json handles local development.
   - What's unclear: Whether the workbench (localhost:4321) can be used for smoke testing or if a deployed SharePoint site is required for AadHttpClient to work.
   - Recommendation: AadHttpClient requires a real SharePoint context. The smoke test will need to be validated on the deployed SharePoint site, not the local workbench. Plan the smoke test task accordingly.

3. **Pre-authorization via Microsoft Graph API**
   - What we know: The PreAuthorizedApplications property on the API object needs to include the SharePoint Online Client Extensibility principal ID.
   - What's unclear: Exact Microsoft Graph PowerShell syntax for setting PreAuthorizedApplications in a single Update-MgApplication call (some versions require separate calls).
   - Recommendation: Test with the approach shown in Code Examples; if it fails, split into two Update-MgApplication calls (one for scopes, one for pre-authorization).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Pester 5.x (PowerShell) + manual smoke test (SPFx/Azure Functions) |
| Config file | None -- Pester tests will be in scripts/tests/ |
| Quick run command | `Invoke-Pester scripts/tests/ -Tag Unit` |
| Full suite command | `Invoke-Pester scripts/tests/` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-06 | Entra ID app registration exists with correct scope | smoke (PowerShell) | `Get-MgApplication -Filter "displayName eq 'WissensHub API'"` | No -- Wave 0 |
| INFRA-07 | Custom columns exist on Site Pages library | smoke (PowerShell) | `Get-PnPField -List "Site Pages" -Identity "WH_Category"` | No -- Wave 0 |
| INFRA-08 | SharePoint groups exist | smoke (PowerShell) | `Get-PnPSiteGroup \| Where-Object { $_.Title -like "WissensHub*" }` | No -- Wave 0 |
| DEVP-01 | Full provisioning script runs without errors | integration | `./scripts/Deploy-WissensHub.ps1 -ConfigPath ./scripts/config.json` | No -- Wave 0 |
| INFRA-06 | AadHttpClient smoke test from Dashboard web part | manual | Deploy .sppkg, navigate to Dashboard page, verify /api/health response displayed | N/A |

### Sampling Rate
- **Per task commit:** PowerShell syntax check (`pwsh -c "Get-Command -Syntax"` for each .ps1 file)
- **Per wave merge:** Full provisioning script dry-run where possible
- **Phase gate:** Full suite green + manual smoke test (AadHttpClient call to /api/health) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `scripts/tests/New-WissensHubSite.Tests.ps1` -- covers INFRA-07 site creation verification
- [ ] `scripts/tests/New-WissensHubColumns.Tests.ps1` -- covers INFRA-07 column verification
- [ ] `scripts/tests/New-WissensHubGroups.Tests.ps1` -- covers INFRA-08 group verification
- [ ] `scripts/tests/New-WissensHubEntraApp.Tests.ps1` -- covers INFRA-06 app registration verification
- [ ] Pester module installation: `Install-Module -Name Pester -MinimumVersion 5.0.0 -Force`

## Sources

### Primary (HIGH confidence)
- [Microsoft Learn - Connect to Entra ID-secured APIs in SPFx](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient) - AadHttpClient configuration, webApiPermissionRequests format, SharePoint Online Client Extensibility principal, admin consent flow (updated Oct 2025)
- [Microsoft Learn - Azure Functions .NET isolated worker guide](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide) - Middleware registration, ConfigureFunctionsWebApplication, ASP.NET Core integration (updated Mar 2026)
- [PnP PowerShell - Add-PnPField](https://pnp.github.io/powershell/cmdlets/Add-PnPField.html) - Field creation syntax, parameters, types
- [PnP PowerShell - New-PnPSite](https://pnp.github.io/powershell/cmdlets/New-PnPSite.html) - Communication Site creation
- [PnP PowerShell - New-PnPSiteGroup](https://pnp.github.io/powershell/cmdlets/New-PnPSiteGroup.html) - SharePoint group creation
- [PnP PowerShell - Set-PnPHomePage](https://pnp.github.io/powershell/cmdlets/Set-PnPHomePage.html) - Home page configuration
- [PnP PowerShell - Add-PnPNavigationNode](https://pnp.github.io/powershell/cmdlets/Add-PnPNavigationNode.html) - Navigation management
- [Microsoft Learn - New-MgApplication](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.applications/new-mgapplication) - Entra ID app registration via Graph SDK
- [Microsoft Learn - Update-MgApplication](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.applications/update-mgapplication) - API scope exposure via Graph SDK

### Secondary (MEDIUM confidence)
- [Microsoft Q&A - Adding Scopes to Azure AD Application with PowerShell](https://learn.microsoft.com/en-us/answers/questions/1160687/adding-scopes-to-azure-ad-application-with-powersh) - Verified oauth2PermissionScopes syntax on Application object (not ServicePrincipal)
- [RLV Blog - Securing Azure Function with Entra ID from SPFx](https://www.rlvision.com/blog/securing-an-azure-function-with-entra-id-and-calling-it-from-spfx/) - End-to-end walkthrough confirming single app pattern
- [Dan Toft Blog - Protecting Azure Functions AAD](https://blog.dan-toft.dk/2023/03/protecting-azure-functions-aad/) - Confirmed EasyAuth approach and its CORS limitations
- [Joonas W Blog - Azure AD JWT authentication in .NET isolated Functions](https://joonasw.net/view/azure-ad-jwt-authentication-in-net-isolated-process-azure-functions) - Custom middleware pattern for JWT validation
- [OneUptime Blog - Authenticate Azure Functions with Azure AD](https://oneuptime.com/blog/post/2026-02-16-how-to-authenticate-azure-functions-with-azure-active-directory/view) - 2026 guide confirming Microsoft.Identity.Web with isolated worker

### Tertiary (LOW confidence)
- SharePoint column OData prefix behavior (`OData__x0020_` mangling) - confirmed by multiple community sources but not official docs; the WH_ prefix strategy avoids this entirely

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All tools verified against current official documentation
- Architecture: HIGH - Single app registration pattern confirmed by Microsoft Learn docs and multiple verified community sources
- Pitfalls: HIGH - CORS/EasyAuth conflict is well-documented; column mangling is a known SharePoint behavior; webApiPermissionRequests resource name requirement is in official docs
- Provisioning cmdlets: HIGH - All PnP PowerShell cmdlets verified against official documentation
- JWT middleware: MEDIUM - Pattern is well-established but exact Microsoft.Identity.Web integration with .NET 10 isolated worker may require minor adjustments during implementation

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (30 days -- stable technology stack, no major releases expected)
