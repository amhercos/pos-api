using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DbMigration.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class newadmincred : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Products_Name",
                table: "Products");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Name_StoreId",
                table: "Products",
                columns: new[] { "Name", "StoreId" },
                unique: true,
                filter: "\"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Products_Name_StoreId",
                table: "Products");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Name",
                table: "Products",
                column: "Name");
        }
    }
}
