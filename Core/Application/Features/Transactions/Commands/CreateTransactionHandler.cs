using Application.Features.Transactions.Commands;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Entities.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Transactions.Handlers;

public class CreateTransactionHandler(
    ITransactionRepository transactionRepository,
    IProductRepository productRepository,
    ICustomerCreditRepository creditRepository,
    IPromotionEngine promotionEngine,
    IPosDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<CreateTransactionCommand, Guid>
{
    public async Task<Guid> Handle(CreateTransactionCommand request, CancellationToken ct)
    {
        var storeId = currentUserService.StoreId;
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();

        // 1. Batch fetch products + promotions
        var products = await productRepository.GetByIdsWithPromotionsAsync(productIds, storeId, ct);
        var productMap = products.ToDictionary(p => p.Id);

        using var dbTransaction = await context.Database.BeginTransactionAsync(ct);
        try
        {
            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                StoreId = storeId,
                UserId = currentUserService.UserId ?? Guid.Empty,
                TransactionDate = DateTime.UtcNow,
                PaymentType = request.PaymentType,
                CashReceived = request.CashReceived,
                Items = new List<TransactionItem>()
            };

            foreach (var itemReq in request.Items)
            {
                if (!productMap.TryGetValue(itemReq.ProductId, out var product))
                    throw new Exception($"Product not found: {itemReq.ProductId}");

                if (product.Stock < itemReq.Quantity)
                    throw new Exception($"Out of stock: {product.Name}");

                product.Stock -= itemReq.Quantity;

                transaction.Items.Add(new TransactionItem
                {
                    ProductId = product.Id,
                    Quantity = itemReq.Quantity,
                    UnitPrice = product.Price,
                    StoreId = storeId
                });
            }

            foreach (var item in transaction.Items)
            {
                var product = productMap[item.ProductId];
                item.UnitPrice = promotionEngine.CalculateUnitPrice(
                    product,
                    item.Quantity,
                    transaction.Items);
            }

            transaction.TotalAmount = transaction.Items.Sum(x => x.UnitPrice * x.Quantity);

           // credit
            if (transaction.PaymentType == PaymentType.Credit)
            {
                var account = await ResolveCreditAccount(request, storeId, ct);
                transaction.CustomerCreditId = account.Id;
                account.CreditAmount += transaction.TotalAmount;
                account.Status = CreditStatus.Active;
                creditRepository.Update(account);
            }
            else
            {
                if (transaction.CashReceived < transaction.TotalAmount)
                    throw new Exception($"Insufficient cash. Total: {transaction.TotalAmount}, Received: {transaction.CashReceived}");

                transaction.ChangeAmount = transaction.CashReceived - transaction.TotalAmount;
            }

            
            transactionRepository.Add(transaction);
            await context.SaveChangesAsync(ct);
            await dbTransaction.CommitAsync(ct);

            return transaction.Id;
        }
        catch
        {
            await dbTransaction.RollbackAsync(ct);
            throw;
        }
    }

    private async Task<CustomerCredit> ResolveCreditAccount(CreateTransactionCommand request, Guid storeId, CancellationToken ct)
    {
        if (request.CustomerCreditId.HasValue)
            return await creditRepository.GetByIdAsync(request.CustomerCreditId.Value, ct)
                   ?? throw new Exception("Credit account not found.");

        var newAccount = new CustomerCredit
        {
            Id = Guid.NewGuid(),
            CustomerName = request.NewCustomerName!,
            ContactInfo = request.NewCustomerContact,
            CreditAmount = 0,
            Status = CreditStatus.Active,
            StoreId = storeId
        };

        creditRepository.Add(newAccount);
        return newAccount;
    }
}