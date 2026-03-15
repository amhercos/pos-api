using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DbMigration.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class StoreIdProperty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "StoreId",
                table: "TransactionItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "StoreId",
                table: "CreditPayments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_TransactionItems_StoreId",
                table: "TransactionItems",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditPayments_StoreId",
                table: "CreditPayments",
                column: "StoreId");

            migrationBuilder.AddForeignKey(
                name: "FK_CreditPayments_Stores_StoreId",
                table: "CreditPayments",
                column: "StoreId",
                principalTable: "Stores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TransactionItems_Stores_StoreId",
                table: "TransactionItems",
                column: "StoreId",
                principalTable: "Stores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CreditPayments_Stores_StoreId",
                table: "CreditPayments");

            migrationBuilder.DropForeignKey(
                name: "FK_TransactionItems_Stores_StoreId",
                table: "TransactionItems");

            migrationBuilder.DropIndex(
                name: "IX_TransactionItems_StoreId",
                table: "TransactionItems");

            migrationBuilder.DropIndex(
                name: "IX_CreditPayments_StoreId",
                table: "CreditPayments");

            migrationBuilder.DropColumn(
                name: "StoreId",
                table: "TransactionItems");

            migrationBuilder.DropColumn(
                name: "StoreId",
                table: "CreditPayments");
        }
    }
}
