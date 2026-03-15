<#
.SYNOPSIS
    Orchestrates the full WissensHub SharePoint Communication Site provisioning.

.DESCRIPTION
    Loads configuration from a JSON parameter file, connects to SharePoint via PnP Online,
    and calls each provisioning module in order: Site, Groups, Columns, Pages, Navigation,
    and Sample Data. Each module is idempotent -- safe to re-run.

.PARAMETER ConfigPath
    Path to the JSON configuration file. Defaults to ./scripts/config.json.

.EXAMPLE
    ./scripts/Deploy-WissensHub.ps1
    ./scripts/Deploy-WissensHub.ps1 -ConfigPath ./scripts/config.json
#>

param(
    [string]$ConfigPath = (Join-Path $PSScriptRoot "config.json")
)

$ErrorActionPreference = "Stop"

# --- Load configuration ---
if (-not (Test-Path $ConfigPath)) {
    Write-Host "ERROR: Configuration file not found at '$ConfigPath'." -ForegroundColor Red
    Write-Host "Copy scripts/config.template.json to scripts/config.json and fill in your tenant values." -ForegroundColor Yellow
    exit 1
}

$config = Get-Content $ConfigPath -Raw | ConvertFrom-Json

# --- Validate required fields ---
$requiredFields = @("tenantName", "siteUrl", "adminUpn")
foreach ($field in $requiredFields) {
    if (-not $config.$field -or $config.$field -eq "") {
        Write-Host "ERROR: Required config field '$field' is missing or empty." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WissensHub Provisioning" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Tenant:  $($config.tenantName)" -ForegroundColor Cyan
Write-Host "  Site:    $($config.siteUrl)" -ForegroundColor Cyan
Write-Host "  Admin:   $($config.adminUpn)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- Dot-source modules ---
$modulesPath = Join-Path $PSScriptRoot "modules"
. (Join-Path $modulesPath "New-WissensHubSite.ps1")
. (Join-Path $modulesPath "New-WissensHubGroups.ps1")
. (Join-Path $modulesPath "New-WissensHubColumns.ps1")
. (Join-Path $modulesPath "New-WissensHubPages.ps1")
. (Join-Path $modulesPath "New-WissensHubNavigation.ps1")
. (Join-Path $modulesPath "New-WissensHubSampleData.ps1")
. (Join-Path $modulesPath "New-WissensHubEntraApp.ps1")

# --- Connect to SharePoint admin ---
Write-Host "Connecting to SharePoint Online..." -ForegroundColor Cyan
$adminUrl = "https://$($config.tenantName)-admin.sharepoint.com"
Connect-PnPOnline -Url $adminUrl -Interactive

# --- Track results ---
$results = @{
    Created = [System.Collections.ArrayList]::new()
    Skipped = [System.Collections.ArrayList]::new()
    Failed  = [System.Collections.ArrayList]::new()
}

# --- Execute modules in order ---
$modules = @(
    @{ Name = "Site";         Function = "New-WissensHubSite" },
    @{ Name = "Groups";       Function = "New-WissensHubGroups" },
    @{ Name = "Columns";      Function = "New-WissensHubColumns" },
    @{ Name = "Entra ID App"; Function = "New-WissensHubEntraApp" },
    @{ Name = "Pages";        Function = "New-WissensHubPages" },
    @{ Name = "Navigation";   Function = "New-WissensHubNavigation" },
    @{ Name = "Sample Data";  Function = "New-WissensHubSampleData" }
)

foreach ($module in $modules) {
    Write-Host ""
    Write-Host "--- $($module.Name) ---" -ForegroundColor Cyan
    try {
        if ($module.Function -eq "New-WissensHubEntraApp") {
            & $module.Function -Config $config -ConfigPath $ConfigPath
        }
        else {
            & $module.Function -Config $config
        }
        [void]$results.Created.Add($module.Name)
        Write-Host "$($module.Name): completed successfully." -ForegroundColor Green
    }
    catch {
        [void]$results.Failed.Add($module.Name)
        Write-Host "$($module.Name): FAILED - $_" -ForegroundColor Red
        Write-Host "Continuing with remaining modules..." -ForegroundColor Yellow
    }
}

# --- Disconnect ---
Write-Host ""
Write-Host "Disconnecting from SharePoint Online..." -ForegroundColor Cyan
Disconnect-PnPOnline

# --- Summary ---
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Provisioning Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($results.Created.Count -gt 0) {
    Write-Host "  Completed: $($results.Created -join ', ')" -ForegroundColor Green
}
if ($results.Skipped.Count -gt 0) {
    Write-Host "  Skipped:   $($results.Skipped -join ', ')" -ForegroundColor Yellow
}
if ($results.Failed.Count -gt 0) {
    Write-Host "  Failed:    $($results.Failed -join ', ')" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($results.Failed.Count -gt 0) {
    Write-Host "Some modules failed. Review the output above and re-run the script to retry." -ForegroundColor Yellow
    exit 1
}

Write-Host "WissensHub provisioning complete!" -ForegroundColor Green
