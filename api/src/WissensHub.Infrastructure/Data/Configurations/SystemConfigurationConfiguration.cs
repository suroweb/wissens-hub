using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WissensHub.Domain.Entities;

namespace WissensHub.Infrastructure.Data.Configurations;

public class SystemConfigurationConfiguration : IEntityTypeConfiguration<SystemConfiguration>
{
    public void Configure(EntityTypeBuilder<SystemConfiguration> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Key).IsRequired().HasMaxLength(100);
        builder.Property(s => s.Value).IsRequired().HasMaxLength(500);
        builder.Property(s => s.UpdatedAt).IsRequired();

        builder.HasIndex(s => s.Key).IsUnique();

        builder.HasData(new SystemConfiguration
        {
            Id = 1,
            Key = "ReminderIntervalDays",
            Value = "7",
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}
