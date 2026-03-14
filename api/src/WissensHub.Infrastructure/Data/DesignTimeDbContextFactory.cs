using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace WissensHub.Infrastructure.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<WissensHubDbContext>
{
    public WissensHubDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<WissensHubDbContext>();
        optionsBuilder.UseSqlServer(
            "Server=localhost,1433;Database=WissensHub;User Id=sa;Password=WissensHub_Dev2026!;TrustServerCertificate=True;");

        return new WissensHubDbContext(optionsBuilder.Options);
    }
}
