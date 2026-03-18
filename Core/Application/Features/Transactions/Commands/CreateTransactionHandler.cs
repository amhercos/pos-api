using Application.Features.Transactions.Commands;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Entities.Enums;
using MediatR;

public class CreateTransactionHandler(
    ITransactionRepository transactionRepository,
    IProductRepository productRepository,
    IPosDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<CreateTransactionCommand, Guid>
{
    public async Task<Guid> Handle(CreateTransactionCommand request, CancellationToken ct)
    {
        if (request.PaymentType == PaymentType.Cash && request.CashReceived < request.TotalAmount)
        {
            throw new Exception("Cash received is less than the total amount.");
        }
        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            StoreId = currentUserService.StoreId,
            UserId = currentUserService.UserId ?? Guid.Empty,
            TransactionDate = DateTime.UtcNow,
            TotalAmount = request.TotalAmount,
            PaymentType = request.PaymentType,
            CashReceived = request.CashReceived,
            ChangeAmount = request.CashReceived - request.TotalAmount,
            Items = new List<TransactionItem>()
        };

        // Process items
        foreach (var item in request.Items)
        {
            var product = await productRepository.GetByIdAsync(item.ProductId, ct);

            if (product == null) throw new Exception("Product not found.");
            if (product.Stock < item.Quantity) throw new Exception($"Low stock: {product.Name}");
        // deduct stock
            product.Stock -= item.Quantity;

            transaction.Items.Add(new TransactionItem
            {
                Id = Guid.NewGuid(),
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                StoreId = currentUserService.StoreId
            });
        }

        transactionRepository.Add(transaction);
        await context.SaveChangesAsync(ct);
        return transaction.Id;
    }
}