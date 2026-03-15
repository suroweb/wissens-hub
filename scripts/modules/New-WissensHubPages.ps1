<#
.SYNOPSIS
    Creates the WissensHub core pages (Dashboard, Freigabecenter, Administration).

.DESCRIPTION
    Idempotent: checks if each page already exists before creating.
    Sets the Dashboard page as the site home page.
    Article pages are created separately by New-WissensHubSampleData.
#>

function New-WissensHubPages {
    param(
        [Parameter(Mandatory)]
        [PSCustomObject]$Config
    )

    # --- Dashboard page (Home layout, set as site home page) ---
    $dashboardPage = Get-PnPPage -Identity "Dashboard" -ErrorAction SilentlyContinue
    if ($dashboardPage) {
        Write-Host "Page 'Dashboard' already exists. Skipping." -ForegroundColor Yellow
    }
    else {
        Write-Host "Creating page 'Dashboard'..." -ForegroundColor Cyan
        Add-PnPPage -Name "Dashboard" -LayoutType Home -Title "WissensHub Dashboard"
        Write-Host "Page 'Dashboard' created." -ForegroundColor Green
    }

    # --- Freigabecenter page ---
    $freigabePage = Get-PnPPage -Identity "Freigabecenter" -ErrorAction SilentlyContinue
    if ($freigabePage) {
        Write-Host "Page 'Freigabecenter' already exists. Skipping." -ForegroundColor Yellow
    }
    else {
        Write-Host "Creating page 'Freigabecenter'..." -ForegroundColor Cyan
        Add-PnPPage -Name "Freigabecenter" -LayoutType Article -Title "Freigabecenter"
        Write-Host "Page 'Freigabecenter' created." -ForegroundColor Green
    }

    # --- Administration page ---
    $adminPage = Get-PnPPage -Identity "Administration" -ErrorAction SilentlyContinue
    if ($adminPage) {
        Write-Host "Page 'Administration' already exists. Skipping." -ForegroundColor Yellow
    }
    else {
        Write-Host "Creating page 'Administration'..." -ForegroundColor Cyan
        Add-PnPPage -Name "Administration" -LayoutType Article -Title "Administration"
        Write-Host "Page 'Administration' created." -ForegroundColor Green
    }

    # --- Publish all pages before setting home page ---
    Write-Host "Publishing pages..." -ForegroundColor Cyan
    Set-PnPPage -Identity "Dashboard" -Publish
    Set-PnPPage -Identity "Freigabecenter" -Publish
    Set-PnPPage -Identity "Administration" -Publish
    Write-Host "Pages published." -ForegroundColor Green

    # --- Set Dashboard as home page ---
    Write-Host "Setting Dashboard as site home page..." -ForegroundColor Cyan
    Set-PnPHomePage -RootFolderRelativeUrl "SitePages/Dashboard.aspx"
    Write-Host "Dashboard set as home page." -ForegroundColor Green
}
