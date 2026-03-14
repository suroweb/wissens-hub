using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WissensHub.Domain.Entities;

namespace WissensHub.Infrastructure.Data.Configurations;

public class ArticleTargetGroupConfiguration : IEntityTypeConfiguration<ArticleTargetGroup>
{
    public void Configure(EntityTypeBuilder<ArticleTargetGroup> builder)
    {
        builder.HasKey(atg => new { atg.ArticleMetadataId, atg.TargetGroupId });

        builder.HasOne(atg => atg.ArticleMetadata)
            .WithMany(a => a.ArticleTargetGroups)
            .HasForeignKey(atg => atg.ArticleMetadataId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(atg => atg.TargetGroup)
            .WithMany(tg => tg.ArticleTargetGroups)
            .HasForeignKey(atg => atg.TargetGroupId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
