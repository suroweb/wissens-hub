using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Identity.Web;
using WissensHub.Functions.Middleware;
using WissensHub.Infrastructure.Data;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

// Configure Entra ID authentication options from AzureAd config section
builder.Services.Configure<MicrosoftIdentityOptions>(
    builder.Configuration.GetSection("AzureAd"));

// Register JWT authentication middleware
builder.UseMiddleware<AuthenticationMiddleware>();

// Register EF Core DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<WissensHubDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Build().Run();
