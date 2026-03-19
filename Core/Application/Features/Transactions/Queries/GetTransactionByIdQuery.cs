using Application.Dto;
using MediatR;


namespace Application.Features.Transactions.Queries
{
    public record GetTransactionByIdQuery(Guid Id) : IRequest<TransactionDetailsDto?>;
   
}
