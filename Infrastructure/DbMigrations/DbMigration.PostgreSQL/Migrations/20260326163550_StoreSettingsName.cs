using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DbMigration.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class StoreSettingsName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StoresSettings_Stores_StoreId",
                table: "StoresSettings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_StoresSettings",
                table: "StoresSettings");

            migrationBuilder.RenameTable(
                name: "StoresSettings",
                newName: "StoreSettings");

            migrationBuilder.RenameIndex(
                name: "IX_StoresSettings_StoreId",
                table: "StoreSettings",
                newName: "IX_StoreSettings_StoreId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_StoreSettings",
                table: "StoreSettings",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StoreSettings_Stores_StoreId",
                table: "StoreSettings",
                column: "StoreId",
                principalTable: "Stores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StoreSettings_Stores_StoreId",
                table: "StoreSettings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_StoreSettings",
                table: "StoreSettings");

            migrationBuilder.RenameTable(
                name: "StoreSettings",
                newName: "StoresSettings");

            migrationBuilder.RenameIndex(
                name: "IX_StoreSettings_StoreId",
                table: "StoresSettings",
                newName: "IX_StoresSettings_StoreId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_StoresSettings",
                table: "StoresSettings",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StoresSettings_Stores_StoreId",
                table: "StoresSettings",
                column: "StoreId",
                principalTable: "Stores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
