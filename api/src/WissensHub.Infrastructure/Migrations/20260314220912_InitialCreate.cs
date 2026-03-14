using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WissensHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TargetGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SharePointGroupName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TargetGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ArticleMetadata",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PageId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: true),
                    IsMandatory = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ReviewById = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: true),
                    ReviewByDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ContentVersion = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArticleMetadata", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ArticleMetadata_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ApprovalHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ArticleMetadataId = table.Column<int>(type: "int", nullable: false),
                    PageId = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ActionBy = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    ActionByDisplayName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ActionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalHistory_ArticleMetadata_ArticleMetadataId",
                        column: x => x.ArticleMetadataId,
                        principalTable: "ArticleMetadata",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ArticleFlags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ArticleMetadataId = table.Column<int>(type: "int", nullable: false),
                    PageId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    UserDisplayName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    FlaggedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsResolved = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArticleFlags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ArticleFlags_ArticleMetadata_ArticleMetadataId",
                        column: x => x.ArticleMetadataId,
                        principalTable: "ArticleMetadata",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ArticleTargetGroups",
                columns: table => new
                {
                    ArticleMetadataId = table.Column<int>(type: "int", nullable: false),
                    TargetGroupId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArticleTargetGroups", x => new { x.ArticleMetadataId, x.TargetGroupId });
                    table.ForeignKey(
                        name: "FK_ArticleTargetGroups_ArticleMetadata_ArticleMetadataId",
                        column: x => x.ArticleMetadataId,
                        principalTable: "ArticleMetadata",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ArticleTargetGroups_TargetGroups_TargetGroupId",
                        column: x => x.TargetGroupId,
                        principalTable: "TargetGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Favorites",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ArticleMetadataId = table.Column<int>(type: "int", nullable: false),
                    PageId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Favorites", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Favorites_ArticleMetadata_ArticleMetadataId",
                        column: x => x.ArticleMetadataId,
                        principalTable: "ArticleMetadata",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReadConfirmations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ArticleMetadataId = table.Column<int>(type: "int", nullable: false),
                    PageId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    UserDisplayName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ReadDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ContentVersion = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReadConfirmations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReadConfirmations_ArticleMetadata_ArticleMetadataId",
                        column: x => x.ArticleMetadataId,
                        principalTable: "ArticleMetadata",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalHistory_ArticleMetadataId",
                table: "ApprovalHistory",
                column: "ArticleMetadataId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalHistory_PageId",
                table: "ApprovalHistory",
                column: "PageId");

            migrationBuilder.CreateIndex(
                name: "IX_ArticleFlags_ArticleMetadataId",
                table: "ArticleFlags",
                column: "ArticleMetadataId");

            migrationBuilder.CreateIndex(
                name: "IX_ArticleFlags_PageId",
                table: "ArticleFlags",
                column: "PageId");

            migrationBuilder.CreateIndex(
                name: "IX_ArticleMetadata_CategoryId",
                table: "ArticleMetadata",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ArticleMetadata_PageId",
                table: "ArticleMetadata",
                column: "PageId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ArticleTargetGroups_TargetGroupId",
                table: "ArticleTargetGroups",
                column: "TargetGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Name",
                table: "Categories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_ArticleMetadataId_UserId",
                table: "Favorites",
                columns: new[] { "ArticleMetadataId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReadConfirmations_ArticleMetadataId",
                table: "ReadConfirmations",
                column: "ArticleMetadataId");

            migrationBuilder.CreateIndex(
                name: "IX_ReadConfirmations_PageId_UserId",
                table: "ReadConfirmations",
                columns: new[] { "PageId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_TargetGroups_Name",
                table: "TargetGroups",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApprovalHistory");

            migrationBuilder.DropTable(
                name: "ArticleFlags");

            migrationBuilder.DropTable(
                name: "ArticleTargetGroups");

            migrationBuilder.DropTable(
                name: "Favorites");

            migrationBuilder.DropTable(
                name: "ReadConfirmations");

            migrationBuilder.DropTable(
                name: "TargetGroups");

            migrationBuilder.DropTable(
                name: "ArticleMetadata");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
