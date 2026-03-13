using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DbMigration.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class Initial_BizFlow_Fixed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TransactionItems_Transactions_TransactionId1",
                table: "TransactionItems");

            migrationBuilder.DropIndex(
                name: "IX_TransactionItems_TransactionId1",
                table: "TransactionItems");

            migrationBuilder.DropColumn(
                name: "TransactionId1",
                table: "TransactionItems");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CustomerCreditId",
                table: "Transactions",
                column: "CustomerCreditId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_CustomerCredits_CustomerCreditId",
                table: "Transactions",
                column: "CustomerCreditId",
                principalTable: "CustomerCredits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_CustomerCredits_CustomerCreditId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_CustomerCreditId",
                table: "Transactions");

            migrationBuilder.AddColumn<Guid>(
                name: "TransactionId1",
                table: "TransactionItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_TransactionItems_TransactionId1",
                table: "TransactionItems",
                column: "TransactionId1");

            migrationBuilder.AddForeignKey(
                name: "FK_TransactionItems_Transactions_TransactionId1",
                table: "TransactionItems",
                column: "TransactionId1",
                principalTable: "Transactions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
