<#
.SYNOPSIS
    Creates the WissensHub SharePoint Communication Site with German locale.

.DESCRIPTION
    Idempotent: checks if the site already exists before creating.
    After creation, reconnects to the new site URL for subsequent modules.
#>

function New-WissensHubSite {
    param(
        [Parameter(Mandatory)]
        [PSCustomObject]$Config
    )

    $siteUrl = $Config.siteUrl

    # Check if site already exists
    $existingSite = Get-PnPTenantSite -Url $siteUrl -ErrorAction SilentlyContinue
    if ($existingSite) {
        Write-Host "Site '$siteUrl' already exists. Skipping creation." -ForegroundColor Yellow
    }
    else {
        Write-Host "Creating Communication Site at '$siteUrl'..." -ForegroundColor Cyan
        New-PnPSite -Type CommunicationSite `
            -Title "WissensHub" `
            -Url $siteUrl `
            -Lcid 1031 `
            -Description "Zentrale Wissensdatenbank"
        Write-Host "Site '$siteUrl' created successfully." -ForegroundColor Green
    }

    # Reconnect to the site URL for subsequent modules
    Write-Host "Connecting to site '$siteUrl'..." -ForegroundColor Cyan
    Connect-PnPOnline -Url $siteUrl -Interactive
}
