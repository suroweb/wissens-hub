using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WissensHub.Domain.Entities;

namespace WissensHub.Infrastructure.Data.Configurations;

public class ArticleMetadataConfiguration : IEntityTypeConfiguration<ArticleMetadata>
{
    public void Configure(EntityTypeBuilder<ArticleMetadata> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.PageId).IsRequired();
        builder.Property(a => a.Status).IsRequired().HasMaxLength(50);
        builder.Property(a => a.IsMandatory).HasDefaultValue(false);
        builder.Property(a => a.ReviewById).HasMaxLength(36);
        builder.Property(a => a.ContentVersion).HasDefaultValue(1);
        builder.Property(a => a.CreatedAt).IsRequired();
        builder.Property(a => a.UpdatedAt).IsRequired();

        builder.HasOne(a => a.Category)
            .WithMany(c => c.Articles)
            .HasForeignKey(a => a.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(a => a.ArticleTargetGroups)
            .WithOne(atg => atg.ArticleMetadata)
            .HasForeignKey(atg => atg.ArticleMetadataId);

        builder.HasIndex(a => a.PageId).IsUnique();
    }
}
