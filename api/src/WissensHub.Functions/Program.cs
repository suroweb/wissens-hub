using FluentValidation;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Identity.Web;
using WissensHub.Application.Common.Behaviors;
using WissensHub.Application.Interfaces;
using WissensHub.Application.Commands.MarkAsRead;
using WissensHub.Functions.Middleware;
using WissensHub.Infrastructure.Data;
using WissensHub.Infrastructure.Repositories;
using WissensHub.Infrastructure.Services;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

// Configure Entra ID authentication options from AzureAd config section
builder.Services.Configure<MicrosoftIdentityOptions>(
    builder.Configuration.GetSection("AzureAd"));

// Register middleware pipeline (order matters: auth first, then identity hydration)
builder.UseMiddleware<AuthenticationMiddleware>();
builder.UseMiddleware<UserIdentityMiddleware>();

// Register EF Core DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<WissensHubDbContext>(options =>
    options.UseSqlServer(connectionString));

// MediatR + pipeline behaviors (order: outermost to innermost)
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(MarkAsReadCommand).Assembly);
    cfg.AddOpenBehavior(typeof(ExceptionBehavior<,>));
    cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
    cfg.AddOpenBehavior(typeof(AuthorizationBehavior<,>));
    cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
});

// FluentValidation -- auto-discover all validators in Application assembly
builder.Services.AddValidatorsFromAssembly(typeof(MarkAsReadCommand).Assembly);

// Repositories
builder.Services.AddScoped<IReadConfirmationRepository, ReadConfirmationRepository>();
builder.Services.AddScoped<IFavoriteRepository, FavoriteRepository>();
builder.Services.AddScoped<IFlagRepository, FlagRepository>();
builder.Services.AddScoped<IApprovalRepository, ApprovalRepository>();
builder.Services.AddScoped<IArticleMetadataRepository, ArticleMetadataRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ITargetGroupRepository, TargetGroupRepository>();
builder.Services.AddScoped<ISystemConfigurationRepository, SystemConfigurationRepository>();
builder.Services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<WissensHubDbContext>());

// User identity
builder.Services.AddScoped<ICurrentUser, CurrentUser>();

builder.Build().Run();
