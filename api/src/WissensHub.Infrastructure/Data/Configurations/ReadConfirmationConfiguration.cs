using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WissensHub.Domain.Entities;

namespace WissensHub.Infrastructure.Data.Configurations;

public class ReadConfirmationConfiguration : IEntityTypeConfiguration<ReadConfirmation>
{
    public void Configure(EntityTypeBuilder<ReadConfirmation> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.UserId).IsRequired().HasMaxLength(36);
        builder.Property(r => r.UserDisplayName).IsRequired().HasMaxLength(256);
        builder.Property(r => r.PageId).IsRequired();
        builder.Property(r => r.ReadDate).IsRequired();
        builder.Property(r => r.ContentVersion).IsRequired();

        builder.HasOne(r => r.ArticleMetadata)
            .WithMany(a => a.ReadConfirmations)
            .HasForeignKey(r => r.ArticleMetadataId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(r => new { r.PageId, r.UserId });
    }
}
