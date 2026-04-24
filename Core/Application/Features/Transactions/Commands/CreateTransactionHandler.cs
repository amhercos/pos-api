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
    IPosDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<CreateTransactionCommand, Guid>
{
    public async Task<Guid> Handle(CreateTransactionCommand request, CancellationToken ct)
    {
        var storeId = currentUserService.StoreId;
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();

        // Batch fetch products + promotions
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
                var product = productMap[itemReq.ProductId];
                if (product.Stock < itemReq.Quantity) throw new Exception($"Out of stock: {product.Name}");

                product.Stock -= itemReq.Quantity;
                var unitPrice = ResolvePrice(product, itemReq.Quantity);

                transaction.Items.Add(new TransactionItem
                {
                    ProductId = product.Id,
                    Quantity = itemReq.Quantity,
                    UnitPrice = unitPrice,
                    StoreId = storeId
                });
            }

            transaction.TotalAmount = transaction.Items.Sum(x => x.UnitPrice * x.Quantity);

            // CREDIT 
            if (transaction.PaymentType == PaymentType.Credit)
            {
                var account = await ResolveCreditAccount(request, storeId, ct);
                transaction.CustomerCreditId = account.Id;
                account.CreditAmount += transaction.TotalAmount;
                account.Status = CreditStatus.Active;
            }
            else
            {
                if (transaction.CashReceived < transaction.TotalAmount) throw new Exception("Insufficient cash.");
                transaction.ChangeAmount = transaction.CashReceived - transaction.TotalAmount;
            }

            transactionRepository.Add(transaction);
            await context.SaveChangesAsync(ct);
            await dbTransaction.CommitAsync(ct);

            return transaction.Id;
        }
        catch { await dbTransaction.RollbackAsync(ct); throw; }
    }

    private decimal ResolvePrice(Product product, int quantity)
    {
        var bestPromo = product.Promotions
            .Where(p => p.IsActive && p.Type == PromotionType.Bulk && p.PromoQuantity <= quantity)
            .OrderByDescending(p => p.PromoQuantity)
            .FirstOrDefault();

        return bestPromo?.PromoPrice ?? product.Price;
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