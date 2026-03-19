using Application.Features.Transactions.Commands;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Entities.Enums;
using MediatR;

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
        var userId = currentUserService.UserId ?? Guid.Empty;

       // db transaction
        using var dbTransaction = await context.Database.BeginTransactionAsync(ct);

        try
        {
            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                StoreId = storeId,
                UserId = userId,
                TransactionDate = DateTime.UtcNow,
                TotalAmount = request.TotalAmount,
                PaymentType = request.PaymentType,
                Items = new List<TransactionItem>()
            };

       //credit
            if (transaction.PaymentType == PaymentType.Credit)
            {
                CustomerCredit? creditAccount = null;

                if (request.CustomerCreditId.HasValue)
                {
                    creditAccount = await creditRepository.GetByIdAsync(request.CustomerCreditId.Value, ct);
                }
                else if (!string.IsNullOrWhiteSpace(request.NewCustomerName))
                {
                    creditAccount = new CustomerCredit
                    {
                        Id = Guid.NewGuid(),
                        CustomerName = request.NewCustomerName,
                        ContactInfo = request.NewCustomerContact,
                        CreditAmount = 0,
                        Status = CreditStatus.Settled,
                        StoreId = storeId
                    };

                    creditRepository.Add(creditAccount);

                    await context.SaveChangesAsync(ct);
                }

                if (creditAccount == null)
                    throw new Exception("Credit transactions require a valid account.");

                creditAccount.CreditAmount += transaction.TotalAmount;
                creditAccount.Status = CreditStatus.Active;

                transaction.CustomerCreditId = creditAccount.Id;
                transaction.CashReceived = 0;
                transaction.ChangeAmount = 0;

                creditRepository.Update(creditAccount);
            }
            else // Cash
            {
                if (request.CashReceived < transaction.TotalAmount)
                    throw new Exception("Insufficient cash received.");

                transaction.CashReceived = request.CashReceived;
                transaction.ChangeAmount = request.CashReceived - transaction.TotalAmount;
            }

            //deduct stock
            foreach (var item in request.Items)
            {
                var product = await productRepository.GetByIdAsync(item.ProductId, ct);

                if (product == null || product.Stock < item.Quantity)
                    throw new Exception($"Stock insufficient for {product?.Name ?? "Unknown Product"}.");

                product.Stock -= item.Quantity;
                productRepository.Update(product);

                transaction.Items.Add(new TransactionItem
                {
                    Id = Guid.NewGuid(),
                    TransactionId = transaction.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    StoreId = storeId
                });
            }

      
            transactionRepository.Add(transaction);
            await context.SaveChangesAsync(ct);

            await dbTransaction.CommitAsync(ct);

            return transaction.Id;
        }
        catch (Exception)
        {
            await dbTransaction.RollbackAsync(ct);
            throw;
        }
    }
}