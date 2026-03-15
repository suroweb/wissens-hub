<#
.SYNOPSIS
    Configures the WissensHub top navigation with feature-based German labels.

.DESCRIPTION
    Idempotent by clearing existing top navigation first, then re-adding all nodes.
    Navigation nodes use site-relative URLs derived from the config siteUrl.
#>

function New-WissensHubNavigation {
    param(
        [Parameter(Mandatory)]
        [PSCustomObject]$Config
    )

    # Extract site-relative path from siteUrl (e.g., /sites/WissensHub)
    $uri = [System.Uri]$Config.siteUrl
    $sitePath = $uri.AbsolutePath.TrimEnd("/")

    # --- Clear existing top navigation ---
    Write-Host "Clearing existing top navigation..." -ForegroundColor Cyan
    $existingNodes = Get-PnPNavigationNode -Location TopNavigationBar -ErrorAction SilentlyContinue
    if ($existingNodes) {
        foreach ($node in $existingNodes) {
            Remove-PnPNavigationNode -Identity $node.Id -Force
        }
        Write-Host "Existing navigation cleared." -ForegroundColor Yellow
    }

    # --- Add feature-based navigation nodes ---
    $navNodes = @(
        @{ Title = "Startseite";       Url = "$sitePath/SitePages/Dashboard.aspx" },
        @{ Title = "Wissensdatenbank"; Url = "$sitePath/SitePages" },
        @{ Title = "Freigabecenter";   Url = "$sitePath/SitePages/Freigabecenter.aspx" },
        @{ Title = "Administration";   Url = "$sitePath/SitePages/Administration.aspx" }
    )

    foreach ($nav in $navNodes) {
        Write-Host "Adding navigation node '$($nav.Title)'..." -ForegroundColor Cyan
        Add-PnPNavigationNode -Title $nav.Title -Url $nav.Url -Location TopNavigationBar
        Write-Host "Navigation node '$($nav.Title)' added." -ForegroundColor Green
    }
}
