<#
.SYNOPSIS
    Registers the WissensHub API Entra ID application with exposed scope and SharePoint pre-authorization.

.DESCRIPTION
    Creates a single Entra ID app registration for the WissensHub API, exposes the
    access_as_user delegated scope, pre-authorizes the SharePoint Online Client Extensibility
    service principal, and writes the client ID and scope URI back to the config file.
    Idempotent: skips creation if an app with the same display name already exists.

.PARAMETER Config
    The configuration object loaded from config.json.

.PARAMETER ConfigPath
    Path to the JSON configuration file, used to write back clientId and scopeUri.
#>
function New-WissensHubEntraApp {
    param(
        [Parameter(Mandatory)]
        [PSObject]$Config,

        [Parameter(Mandatory)]
        [string]$ConfigPath
    )

    $displayName = $Config.entraApp.displayName

    # --- Verify Microsoft.Graph.Applications module is available ---
    if (-not (Get-Module -ListAvailable Microsoft.Graph.Applications)) {
        Write-Host "ERROR: Microsoft.Graph.Applications module is not installed." -ForegroundColor Red
        Write-Host "Install it with: Install-Module -Name Microsoft.Graph.Applications -Force" -ForegroundColor Yellow
        throw "Missing required module: Microsoft.Graph.Applications"
    }

    # --- Connect to Microsoft Graph ---
    Write-Host "Connecting to Microsoft Graph..." -ForegroundColor Cyan
    Connect-MgGraph -Scopes "Application.ReadWrite.All" -NoWelcome

    try {
        # --- Check if app already exists ---
        $existingApp = Get-MgApplication -Filter "displayName eq '$displayName'" -ErrorAction SilentlyContinue | Select-Object -First 1

        if ($existingApp) {
            Write-Host "App registration '$displayName' already exists (AppId: $($existingApp.AppId)). Verifying configuration..." -ForegroundColor Yellow

            # Verify scope is configured
            $hasScope = $existingApp.Api.Oauth2PermissionScopes | Where-Object { $_.Value -eq "access_as_user" }
            if (-not $hasScope) {
                Write-Host "WARNING: access_as_user scope is missing. Re-configuring..." -ForegroundColor Yellow
                $scopeId = [guid]::NewGuid().ToString()
                $api = @{
                    Oauth2PermissionScopes = @(
                        @{
                            AdminConsentDescription = "Allow SPFx to call WissensHub API on behalf of the signed-in user"
                            AdminConsentDisplayName = "Access WissensHub API"
                            Id                      = $scopeId
                            IsEnabled               = $true
                            Type                    = "Admin"
                            Value                   = "access_as_user"
                        }
                    )
                }
                Update-MgApplication -ApplicationId $existingApp.Id -Api $api
                Write-Host "Scope 'access_as_user' added." -ForegroundColor Green
            }
            else {
                $scopeId = $hasScope.Id
                Write-Host "Scope 'access_as_user' is configured." -ForegroundColor Green
            }

            # Verify pre-authorization
            $spClientId = "08e18876-6177-487e-b8b5-cf950c1e598c"
            $hasPreAuth = $existingApp.Api.PreAuthorizedApplications | Where-Object { $_.AppId -eq $spClientId }
            if (-not $hasPreAuth) {
                Write-Host "WARNING: SharePoint Client Extensibility pre-authorization is missing. Re-configuring..." -ForegroundColor Yellow
                $currentScopes = $existingApp.Api.Oauth2PermissionScopes
                $preAuthApp = @{
                    AppId                  = $spClientId
                    DelegatedPermissionIds = @($scopeId.ToString())
                }
                Update-MgApplication -ApplicationId $existingApp.Id -Api @{
                    Oauth2PermissionScopes    = $currentScopes
                    PreAuthorizedApplications = @($preAuthApp)
                }
                Write-Host "SharePoint Client Extensibility pre-authorized." -ForegroundColor Green
            }
            else {
                Write-Host "SharePoint Client Extensibility pre-authorization is configured." -ForegroundColor Green
            }

            $app = $existingApp
        }
        else {
            # --- Step 1: Create the application ---
            Write-Host "Creating app registration '$displayName'..." -ForegroundColor Cyan
            $app = New-MgApplication -DisplayName $displayName -SignInAudience "AzureADMyOrg"
            Write-Host "App registration created (AppId: $($app.AppId))." -ForegroundColor Green

            # --- Step 2: Set Application ID URI ---
            Write-Host "Setting Application ID URI..." -ForegroundColor Cyan
            Update-MgApplication -ApplicationId $app.Id -IdentifierUris @("api://$($app.AppId)")
            Write-Host "Application ID URI set to: api://$($app.AppId)" -ForegroundColor Green

            # --- Step 3: Expose access_as_user scope ---
            Write-Host "Exposing 'access_as_user' delegated scope..." -ForegroundColor Cyan
            $scopeId = [guid]::NewGuid().ToString()
            $scopeDef = @{
                AdminConsentDescription = "Allow SPFx to call WissensHub API on behalf of the signed-in user"
                AdminConsentDisplayName = "Access WissensHub API"
                Id                      = $scopeId
                IsEnabled               = $true
                Type                    = "Admin"
                Value                   = "access_as_user"
            }
            Update-MgApplication -ApplicationId $app.Id -Api @{
                Oauth2PermissionScopes = @($scopeDef)
            }
            Write-Host "Scope 'access_as_user' exposed." -ForegroundColor Green

            # --- Step 4: Pre-authorize SharePoint Online Client Extensibility ---
            Write-Host "Pre-authorizing SharePoint Online Client Extensibility..." -ForegroundColor Cyan
            $spClientId = "08e18876-6177-487e-b8b5-cf950c1e598c"
            $preAuthApp = @{
                AppId                  = $spClientId
                DelegatedPermissionIds = @($scopeId)
            }
            # Must include existing scopes when updating PreAuthorizedApplications
            Update-MgApplication -ApplicationId $app.Id -Api @{
                Oauth2PermissionScopes    = @($scopeDef)
                PreAuthorizedApplications = @($preAuthApp)
            }
            Write-Host "SharePoint Client Extensibility pre-authorized." -ForegroundColor Green

            # --- Step 5: Create service principal ---
            Write-Host "Creating service principal..." -ForegroundColor Cyan
            New-MgServicePrincipal -AppId $app.AppId | Out-Null
            Write-Host "Service principal created." -ForegroundColor Green
        }

        # --- Write back clientId and scopeUri to config file ---
        $clientId = $app.AppId
        $scopeUri = "api://$($app.AppId)/access_as_user"

        Write-Host "Updating config file with Entra ID values..." -ForegroundColor Cyan
        $configJson = Get-Content $ConfigPath -Raw | ConvertFrom-Json
        $configJson.entraApp.clientId = $clientId
        $configJson.entraApp.scopeUri = $scopeUri
        $configJson | ConvertTo-Json -Depth 10 | Set-Content $ConfigPath -Encoding UTF8
        Write-Host "Config file updated." -ForegroundColor Green

        # --- Output values for reference ---
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Entra ID App Registration" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Display Name: $displayName" -ForegroundColor Cyan
        Write-Host "  Client ID:    $clientId" -ForegroundColor Cyan
        Write-Host "  Scope URI:    $scopeUri" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Update DashboardWebPart.ts with the Client ID above" -ForegroundColor Yellow
        Write-Host "  2. Update local.settings.json with TenantId, ClientId, and Audience" -ForegroundColor Yellow
        Write-Host "  3. Deploy SPFx .sppkg to app catalog" -ForegroundColor Yellow
        Write-Host "  4. Approve API permission in SharePoint Admin Center" -ForegroundColor Yellow
    }
    finally {
        # --- Disconnect from Graph ---
        Write-Host "Disconnecting from Microsoft Graph..." -ForegroundColor Cyan
        Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null
    }
}
