using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DbMigration.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class Initial_BizFlow_FixCustomerCredit1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CreditPayments_CustomerCredits_CustomerCreditId1",
                table: "CreditPayments");

            migrationBuilder.DropIndex(
                name: "IX_CreditPayments_CustomerCreditId1",
                table: "CreditPayments");

            migrationBuilder.DropColumn(
                name: "CustomerCreditId1",
                table: "CreditPayments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CustomerCreditId1",
                table: "CreditPayments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_CreditPayments_CustomerCreditId1",
                table: "CreditPayments",
                column: "CustomerCreditId1");

            migrationBuilder.AddForeignKey(
                name: "FK_CreditPayments_CustomerCredits_CustomerCreditId1",
                table: "CreditPayments",
                column: "CustomerCreditId1",
                principalTable: "CustomerCredits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
