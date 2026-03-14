using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WissensHub.Domain.Entities;

namespace WissensHub.Infrastructure.Data.Configurations;

public class TargetGroupConfiguration : IEntityTypeConfiguration<TargetGroup>
{
    public void Configure(EntityTypeBuilder<TargetGroup> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name).IsRequired().HasMaxLength(100);
        builder.Property(t => t.SharePointGroupName).IsRequired().HasMaxLength(256);
        builder.Property(t => t.IsActive).HasDefaultValue(true);
        builder.Property(t => t.CreatedAt).IsRequired();

        builder.HasIndex(t => t.Name).IsUnique();
    }
}
