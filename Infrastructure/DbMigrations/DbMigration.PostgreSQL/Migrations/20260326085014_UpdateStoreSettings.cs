using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DbMigration.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class UpdateStoreSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContactInfo",
                table: "StoresSettings");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "StoresSettings");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "StoresSettings",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "StoresSettings");

            migrationBuilder.AddColumn<string>(
                name: "ContactInfo",
                table: "StoresSettings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "StoresSettings",
                type: "text",
                nullable: true);
        }
    }
}
