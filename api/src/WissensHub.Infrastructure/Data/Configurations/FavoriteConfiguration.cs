using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WissensHub.Domain.Entities;

namespace WissensHub.Infrastructure.Data.Configurations;

public class FavoriteConfiguration : IEntityTypeConfiguration<Favorite>
{
    public void Configure(EntityTypeBuilder<Favorite> builder)
    {
        builder.HasKey(f => f.Id);

        builder.Property(f => f.UserId).IsRequired().HasMaxLength(36);
        builder.Property(f => f.PageId).IsRequired();
        builder.Property(f => f.CreatedAt).IsRequired();

        builder.HasOne(f => f.ArticleMetadata)
            .WithMany(a => a.Favorites)
            .HasForeignKey(f => f.ArticleMetadataId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(f => new { f.ArticleMetadataId, f.UserId }).IsUnique();
    }
}
