using System.Net;
using System.Security.Claims;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker.Middleware;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace WissensHub.Functions.Middleware;

/// <summary>
/// Validates Entra ID JWT bearer tokens on all HTTP-triggered functions except /api/health.
/// Uses Microsoft.IdentityModel.JsonWebTokens.JsonWebTokenHandler for token validation
/// with automatic signing key rotation via ConfigurationManager.
/// </summary>
internal sealed class AuthenticationMiddleware : IFunctionsWorkerMiddleware
{
    private static ConfigurationManager<OpenIdConnectConfiguration>? _configurationManager;
    private static readonly object _lock = new();

    private readonly MicrosoftIdentityOptions _identityOptions;
    private readonly IHostEnvironment _environment;

    public AuthenticationMiddleware(
        IOptions<MicrosoftIdentityOptions> identityOptions,
        IHostEnvironment environment)
    {
        _identityOptions = identityOptions.Value;
        _environment = environment;
    }

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

        // Skip auth for the Health endpoint (keeps /api/health open during development)
        if (string.Equals(context.FunctionDefinition.Name, "Health", StringComparison.OrdinalIgnoreCase))
        {
            await next(context);
            return;
        }

        var httpReqData = await context.GetHttpRequestDataAsync();
        if (httpReqData is null)
        {
            await next(context);
            return;
        }

        // In Development mode, skip token validation and seed a synthetic identity
        // so endpoints can be tested locally via curl without Entra ID tokens.
        if (_environment.IsDevelopment())
        {
            var devClaims = new ClaimsIdentity(new[]
            {
                new Claim("oid", "00000000-0000-0000-0000-000000000001"),
                new Claim("name", "Dev User"),
                new Claim("preferred_username", "dev@localhost"),
                new Claim("groups", "WissensHub Members"),
                new Claim("groups", "WissensHub Editors"),
                new Claim("groups", "WissensHub Reviewers"),
                new Claim("groups", "WissensHub Owners"),
            }, "Development");

            context.Items["User"] = new ClaimsPrincipal(devClaims);
            await next(context);
            return;
        }

        // Extract Authorization header
        string? authHeader = null;
        if (httpReqData.Headers.TryGetValues("Authorization", out var values))
        {
            authHeader = values.FirstOrDefault();
        }

        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var response = httpReqData.CreateResponse();
            response.StatusCode = HttpStatusCode.Unauthorized;
            await response.WriteStringAsync("Missing or invalid Authorization header.");
            context.GetInvocationResult().Value = response;
            return;
        }

        var token = authHeader["Bearer ".Length..];

        try
        {
            var claimsPrincipal = await ValidateTokenAsync(token);
            context.Items["User"] = claimsPrincipal;
            await next(context);
        }
        catch (SecurityTokenException ex)
        {
            var response = httpReqData.CreateResponse();
            response.StatusCode = HttpStatusCode.Unauthorized;
            await response.WriteStringAsync($"Token validation failed: {ex.Message}");
            context.GetInvocationResult().Value = response;
        }
    }

    private async Task<ClaimsPrincipal> ValidateTokenAsync(string token)
    {
        var tenantId = _identityOptions.TenantId;
        var audience = _identityOptions.ClientId;

        // Build audience as api://{clientId} if it looks like a raw GUID
        var validAudience = audience != null && !audience.StartsWith("api://")
            ? $"api://{audience}"
            : audience;

        var configManager = GetConfigurationManager(tenantId!);
        var openIdConfig = await configManager.GetConfigurationAsync(CancellationToken.None);

        var validationParameters = new TokenValidationParameters
        {
            ValidAudience = validAudience,
            ValidIssuer = $"https://login.microsoftonline.com/{tenantId}/v2.0",
            IssuerSigningKeys = openIdConfig.SigningKeys,
            ValidateLifetime = true,
            ValidateAudience = true,
            ValidateIssuer = true,
            ValidateIssuerSigningKey = true
        };

        var tokenHandler = new JsonWebTokenHandler();
        var result = await tokenHandler.ValidateTokenAsync(token, validationParameters);

        if (!result.IsValid)
        {
            throw new SecurityTokenException(
                result.Exception?.Message ?? "Token validation failed.");
        }

        return new ClaimsPrincipal(result.ClaimsIdentity);
    }

    private static ConfigurationManager<OpenIdConnectConfiguration> GetConfigurationManager(string tenantId)
    {
        if (_configurationManager is not null)
            return _configurationManager;

        lock (_lock)
        {
            _configurationManager ??= new ConfigurationManager<OpenIdConnectConfiguration>(
                $"https://login.microsoftonline.com/{tenantId}/v2.0/.well-known/openid-configuration",
                new OpenIdConnectConfigurationRetriever());
        }

        return _configurationManager;
    }
}
