using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DbMigration.PostgreSQL.Migrations
{
    /// <inheritdoc />
    public partial class LocalSync : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsOfflineSync",
                table: "Transactions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "LocalId",
                table: "Transactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Transactions",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "TransactionItems",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "StoreSettings",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Stores",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Products",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "CustomerCredits",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<bool>(
                name: "IsOfflineSync",
                table: "CreditPayments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "LocalId",
                table: "CreditPayments",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "CreditPayments",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Categories",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsOfflineSync",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "TransactionItems");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "CustomerCredits");

            migrationBuilder.DropColumn(
                name: "IsOfflineSync",
                table: "CreditPayments");

            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "CreditPayments");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "CreditPayments");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Categories");
        }
    }
}
