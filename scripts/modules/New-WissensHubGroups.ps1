<#
.SYNOPSIS
    Creates the WissensHub SharePoint groups with appropriate permission levels.

.DESCRIPTION
    Idempotent: checks if each group already exists before creating.
    Creates 4 groups: Members (Read), Editors (Edit), Reviewers (Read), Owners (Full Control).
#>

function New-WissensHubGroups {
    param(
        [Parameter(Mandatory)]
        [PSCustomObject]$Config
    )

    $groups = @(
        @{ Name = $Config.groups.members;   PermLevel = "Read" },
        @{ Name = $Config.groups.editors;   PermLevel = "Edit" },
        @{ Name = $Config.groups.reviewers; PermLevel = "Read" },
        @{ Name = $Config.groups.owners;    PermLevel = "Full Control" }
    )

    $existingGroups = Get-PnPSiteGroup

    foreach ($group in $groups) {
        $existing = $existingGroups | Where-Object { $_.Title -eq $group.Name }
        if ($existing) {
            Write-Host "Group '$($group.Name)' already exists. Skipping." -ForegroundColor Yellow
        }
        else {
            Write-Host "Creating group '$($group.Name)' with permission level '$($group.PermLevel)'..." -ForegroundColor Cyan
            New-PnPSiteGroup -Name $group.Name -PermissionLevels $group.PermLevel
            Write-Host "Group '$($group.Name)' created." -ForegroundColor Green
        }
    }
}
