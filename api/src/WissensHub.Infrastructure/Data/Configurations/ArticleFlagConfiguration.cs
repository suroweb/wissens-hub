using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WissensHub.Domain.Entities;

namespace WissensHub.Infrastructure.Data.Configurations;

public class ArticleFlagConfiguration : IEntityTypeConfiguration<ArticleFlag>
{
    public void Configure(EntityTypeBuilder<ArticleFlag> builder)
    {
        builder.HasKey(f => f.Id);

        builder.Property(f => f.UserId).IsRequired().HasMaxLength(36);
        builder.Property(f => f.UserDisplayName).IsRequired().HasMaxLength(256);
        builder.Property(f => f.PageId).IsRequired();
        builder.Property(f => f.Reason).IsRequired().HasMaxLength(1000);
        builder.Property(f => f.FlaggedDate).IsRequired();
        builder.Property(f => f.IsResolved).HasDefaultValue(false);

        builder.HasOne(f => f.ArticleMetadata)
            .WithMany(a => a.ArticleFlags)
            .HasForeignKey(f => f.ArticleMetadataId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(f => f.PageId);
    }
}
