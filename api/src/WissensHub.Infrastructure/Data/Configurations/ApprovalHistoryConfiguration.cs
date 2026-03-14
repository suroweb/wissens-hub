using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WissensHub.Domain.Entities;

namespace WissensHub.Infrastructure.Data.Configurations;

public class ApprovalHistoryConfiguration : IEntityTypeConfiguration<ApprovalHistory>
{
    public void Configure(EntityTypeBuilder<ApprovalHistory> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Action).IsRequired().HasMaxLength(50);
        builder.Property(a => a.ActionBy).IsRequired().HasMaxLength(36);
        builder.Property(a => a.ActionByDisplayName).IsRequired().HasMaxLength(256);
        builder.Property(a => a.PageId).IsRequired();
        builder.Property(a => a.ActionDate).IsRequired();
        builder.Property(a => a.Comment).HasMaxLength(2000);

        builder.HasOne(a => a.ArticleMetadata)
            .WithMany(am => am.ApprovalHistories)
            .HasForeignKey(a => a.ArticleMetadataId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(a => a.PageId);
    }
}
