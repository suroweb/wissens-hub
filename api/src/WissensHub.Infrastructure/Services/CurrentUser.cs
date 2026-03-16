using System.Security.Claims;
using WissensHub.Application.Interfaces;

namespace WissensHub.Infrastructure.Services;

public class CurrentUser : ICurrentUser
{
    public string UserId { get; private set; } = string.Empty;
    public string DisplayName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public IReadOnlyList<string> Groups { get; private set; } = [];

    public bool IsInGroup(string groupName)
        => Groups.Any(g => string.Equals(g, groupName, StringComparison.OrdinalIgnoreCase));

    public void SetFromClaimsPrincipal(ClaimsPrincipal principal)
    {
        UserId = principal.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value
              ?? principal.FindFirst("oid")?.Value
              ?? string.Empty;
        DisplayName = principal.FindFirst("name")?.Value ?? string.Empty;
        Email = principal.FindFirst("preferred_username")?.Value ?? string.Empty;
        Groups = principal.FindAll("groups").Select(c => c.Value).ToList();
    }
}
