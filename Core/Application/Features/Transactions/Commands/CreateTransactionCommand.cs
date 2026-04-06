using Application.Dto;
using Domain.Entities.Enums;
using MediatR;

namespace Application.Features.Transactions.Commands
{
    public record CreateTransactionCommand(
        //Guid? LocalId,
        //bool IsOfflineSync,
        //DateTime? OfflineCreatedAt,
        List<BasketItemDto> Items,
        PaymentType PaymentType,
        decimal TotalAmount,
        decimal CashReceived,
        decimal ChangeAmount,
        Guid? CustomerCreditId = null,
        //new customer credit
        string? NewCustomerName = null,
        string? NewCustomerContact = null
    ) : IRequest<Guid>;
}