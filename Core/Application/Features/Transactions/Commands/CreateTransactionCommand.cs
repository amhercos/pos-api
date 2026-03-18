using Application.Dto;
using Domain.Entities.Enums;
using MediatR;


namespace Application.Features.Transactions.Commands
{
    public record CreateTransactionCommand (
            List<BasketItemDto> Items,
            PaymentType PaymentType,
            decimal TotalAmount,
            decimal CashReceived,
            decimal ChangeAmount,
            Guid? CustomerCreditId = null) : IRequest<Guid>;
    
}
