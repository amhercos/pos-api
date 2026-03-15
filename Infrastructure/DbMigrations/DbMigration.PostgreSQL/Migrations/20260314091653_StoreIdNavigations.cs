using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DbMigration.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class StoreIdNavigations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "StoreId",
                table: "Transactions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<string>(
                name: "ContactInfo",
                table: "StoresSettings",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<Guid>(
                name: "StoreId",
                table: "CustomerCredits",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_StoreId",
                table: "Transactions",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerCredits_StoreId",
                table: "CustomerCredits",
                column: "StoreId");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerCredits_Stores_StoreId",
                table: "CustomerCredits",
                column: "StoreId",
                principalTable: "Stores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Stores_StoreId",
                table: "Transactions",
                column: "StoreId",
                principalTable: "Stores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomerCredits_Stores_StoreId",
                table: "CustomerCredits");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Stores_StoreId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_StoreId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_CustomerCredits_StoreId",
                table: "CustomerCredits");

            migrationBuilder.DropColumn(
                name: "StoreId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "StoreId",
                table: "CustomerCredits");

            migrationBuilder.AlterColumn<string>(
                name: "ContactInfo",
                table: "StoresSettings",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
