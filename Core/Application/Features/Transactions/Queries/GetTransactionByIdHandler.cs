using Application.Dto;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Transactions.Queries
{
    public class GetTransactionByIdHandler(ITransactionRepository transactionRepository) : IRequestHandler<GetTransactionByIdQuery, TransactionDetailsDto?>
    {
        public async Task<TransactionDetailsDto?> Handle(GetTransactionByIdQuery request, CancellationToken ct)
        {
            var transaction = await transactionRepository.GetByIdAsync(request.Id, ct);

            if (transaction == null) return null;

            return new TransactionDetailsDto(
                transaction.Id,
                transaction.TransactionDate,
                transaction.TotalAmount,
                transaction.CashReceived,
                transaction.ChangeAmount,
                transaction.PaymentType.ToString(),
                transaction.User?.FullName ?? "Unknown",
                transaction.Items.Select(item => new TransactionItemDto(
                    item.Product?.Name ?? "Deleted Product",
                    item.Quantity,
                    item.UnitPrice,
                    item.Quantity * item.UnitPrice
                )).ToList()
            );
        }
    }
}