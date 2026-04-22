using Domain.Entities;

namespace Application.Interfaces.Repositories;

public interface ITransactionRepository
{
    DateTime GetPhStartOfTodayUtc();
    void Add(Transaction transaction);
    Task<Transaction?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IEnumerable<Transaction>> GetAllAsync(CancellationToken ct);

    Task<decimal> GetTotalRevenueAsync(Guid storeId, DateTime startUtc, CancellationToken ct);
    Task<int> GetTotalTransactionsAsync(Guid storeId, DateTime startUtc, CancellationToken ct);
    Task<(List<Transaction> Items, int TotalCount)> GetRecentTransactionsAsync(
    Guid storeId,
    int page,
    int pageSize,
    DateTime? startUtc,
    CancellationToken ct);

    Task<List<Transaction>> GetByCustomerIdAsync(Guid customerCreditId, CancellationToken ct);

}