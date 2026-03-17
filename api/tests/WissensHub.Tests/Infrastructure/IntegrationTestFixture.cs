using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using FluentValidation;
using MediatR;
using WissensHub.Application.Commands.MarkAsRead;
using WissensHub.Application.Common.Behaviors;
using WissensHub.Application.Interfaces;
using WissensHub.Infrastructure.Data;
using WissensHub.Infrastructure.Repositories;
using WissensHub.Infrastructure.Services;

namespace WissensHub.Tests.Infrastructure;

public class IntegrationTestFixture : IAsyncLifetime
{
    private const string ConnectionString =
        "Server=localhost,1433;Database=WissensHub_Test;User Id=sa;Password=WissensHub_Dev2026!;TrustServerCertificate=true";

    public IServiceProvider ServiceProvider { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        var services = new ServiceCollection();

        // EF Core with real SQL Server
        services.AddDbContext<WissensHubDbContext>(options =>
            options.UseSqlServer(ConnectionString));

        // MediatR + pipeline behaviors (order: outermost to innermost)
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(MarkAsReadCommand).Assembly);
            cfg.AddOpenBehavior(typeof(ExceptionBehavior<,>));
            cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
            cfg.AddOpenBehavior(typeof(AuthorizationBehavior<,>));
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        // FluentValidation
        services.AddValidatorsFromAssembly(typeof(MarkAsReadCommand).Assembly);

        // Repositories
        services.AddScoped<IReadConfirmationRepository, ReadConfirmationRepository>();
        services.AddScoped<IFavoriteRepository, FavoriteRepository>();
        services.AddScoped<IFlagRepository, FlagRepository>();
        services.AddScoped<IApprovalRepository, ApprovalRepository>();
        services.AddScoped<IArticleMetadataRepository, ArticleMetadataRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<ITargetGroupRepository, TargetGroupRepository>();
        services.AddScoped<ISystemConfigurationRepository, SystemConfigurationRepository>();
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<WissensHubDbContext>());

        // User identity with dev principal (all 4 groups for full endpoint coverage)
        services.AddScoped<ICurrentUser>(_ =>
        {
            var user = new CurrentUser();
            user.SetFromClaimsPrincipal(CreateDevPrincipal());
            return user;
        });

        // Logging for ILogger injection in pipeline behaviors
        services.AddLogging();

        ServiceProvider = services.BuildServiceProvider();

        // Create the test database schema
        using var scope = ServiceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<WissensHubDbContext>();
        await db.Database.EnsureCreatedAsync();
    }

    public async Task DisposeAsync()
    {
        // Drop the test database to clean up
        using var scope = ServiceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<WissensHubDbContext>();
        await db.Database.EnsureDeletedAsync();

        if (ServiceProvider is IDisposable disposable)
        {
            disposable.Dispose();
        }
    }

    private static ClaimsPrincipal CreateDevPrincipal()
    {
        return new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("oid", "test-user-oid"),
            new Claim("name", "Test User"),
            new Claim("preferred_username", "test@contoso.de"),
            new Claim("groups", "WissensHub Owners"),
            new Claim("groups", "WissensHub Reviewers"),
            new Claim("groups", "WissensHub Editors"),
            new Claim("groups", "WissensHub Members"),
        ], "TestAuth"));
    }
}
