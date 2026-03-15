<#
.SYNOPSIS
    Creates the WissensHub custom columns on the Site Pages library.

.DESCRIPTION
    Idempotent: checks if each column already exists before creating.
    All columns use the WH_ prefix to avoid SharePoint internal name mangling.
    Columns are grouped under "WissensHub" in the Site Pages library.
#>

function New-WissensHubColumns {
    param(
        [Parameter(Mandatory)]
        [PSCustomObject]$Config
    )

    $listName = "Site Pages"

    # --- WH_Category (Choice) ---
    $existing = Get-PnPField -List $listName -Identity "WH_Category" -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "Column 'WH_Category' already exists. Skipping." -ForegroundColor Yellow
    }
    else {
        Write-Host "Creating column 'WH_Category'..." -ForegroundColor Cyan
        Add-PnPField -List $listName `
            -DisplayName "Category" `
            -InternalName "WH_Category" `
            -Type Choice `
            -Choices $Config.categories `
            -Group "WissensHub"
        Write-Host "Column 'WH_Category' created." -ForegroundColor Green
    }

    # --- WH_Status (Choice) ---
    $existing = Get-PnPField -List $listName -Identity "WH_Status" -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "Column 'WH_Status' already exists. Skipping." -ForegroundColor Yellow
    }
    else {
        Write-Host "Creating column 'WH_Status'..." -ForegroundColor Cyan
        Add-PnPField -List $listName `
            -DisplayName "Status" `
            -InternalName "WH_Status" `
            -Type Choice `
            -Choices "Draft", "InReview", "Published", "Archived" `
            -Group "WissensHub"
        Write-Host "Column 'WH_Status' created." -ForegroundColor Green
    }

    # --- WH_TargetGroups (Note / multi-line text) ---
    $existing = Get-PnPField -List $listName -Identity "WH_TargetGroups" -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "Column 'WH_TargetGroups' already exists. Skipping." -ForegroundColor Yellow
    }
    else {
        Write-Host "Creating column 'WH_TargetGroups'..." -ForegroundColor Cyan
        Add-PnPField -List $listName `
            -DisplayName "Target Groups" `
            -InternalName "WH_TargetGroups" `
            -Type Note `
            -Group "WissensHub"
        Write-Host "Column 'WH_TargetGroups' created." -ForegroundColor Green
    }

    # --- WH_IsMandatory (Boolean) ---
    $existing = Get-PnPField -List $listName -Identity "WH_IsMandatory" -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "Column 'WH_IsMandatory' already exists. Skipping." -ForegroundColor Yellow
    }
    else {
        Write-Host "Creating column 'WH_IsMandatory'..." -ForegroundColor Cyan
        Add-PnPField -List $listName `
            -DisplayName "Is Mandatory" `
            -InternalName "WH_IsMandatory" `
            -Type Boolean `
            -Group "WissensHub"
        Write-Host "Column 'WH_IsMandatory' created." -ForegroundColor Green
    }

    # --- WH_Reviewer (User) ---
    $existing = Get-PnPField -List $listName -Identity "WH_Reviewer" -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "Column 'WH_Reviewer' already exists. Skipping." -ForegroundColor Yellow
    }
    else {
        Write-Host "Creating column 'WH_Reviewer'..." -ForegroundColor Cyan
        Add-PnPField -List $listName `
            -DisplayName "Reviewer" `
            -InternalName "WH_Reviewer" `
            -Type User `
            -Group "WissensHub"
        Write-Host "Column 'WH_Reviewer' created." -ForegroundColor Green
    }

    # --- WH_ReviewByDate (DateTime) ---
    $existing = Get-PnPField -List $listName -Identity "WH_ReviewByDate" -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "Column 'WH_ReviewByDate' already exists. Skipping." -ForegroundColor Yellow
    }
    else {
        Write-Host "Creating column 'WH_ReviewByDate'..." -ForegroundColor Cyan
        Add-PnPField -List $listName `
            -DisplayName "Review By Date" `
            -InternalName "WH_ReviewByDate" `
            -Type DateTime `
            -Group "WissensHub"
        Write-Host "Column 'WH_ReviewByDate' created." -ForegroundColor Green
    }
}
