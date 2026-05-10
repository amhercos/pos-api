using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DbMigration.PostgreSQL.Migrations.PostgresPosDb
{
    /// <inheritdoc />
    public partial class AddUniquePromotionIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
        UPDATE ""Promotions""
        SET ""IsDeleted"" = true
        WHERE ""Id"" NOT IN (
            SELECT DISTINCT ON (""MainProductId"") ""Id""
            FROM ""Promotions""
            WHERE ""IsDeleted"" = false
            ORDER BY ""MainProductId"", ""CreatedAt"" ASC
        );");

            migrationBuilder.DropIndex(
                name: "IX_Promotions_MainProductId",
                table: "Promotions");

            migrationBuilder.CreateIndex(
                name: "IX_Promotions_MainProductId_IsDeleted",
                table: "Promotions",
                columns: new[] { "MainProductId", "IsDeleted" },
                unique: true,
                filter: "\"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Promotions_MainProductId_IsDeleted",
                table: "Promotions");

            migrationBuilder.CreateIndex(
                name: "IX_Promotions_MainProductId",
                table: "Promotions",
                column: "MainProductId");
        }
    }
}
