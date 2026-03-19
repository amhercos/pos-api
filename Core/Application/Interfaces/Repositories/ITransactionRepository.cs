using Domain.Entities;

namespace Application.Interfaces.Repositories;

public interface ITransactionRepository
{
    void Add(Transaction transaction);
    Task<Transaction?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IEnumerable<Transaction>> GetAllAsync(CancellationToken ct);

    Task<decimal> GetTotalRevenueTodayAsync(Guid storeId, CancellationToken ct);
    Task<int> GetTotalTransactionsTodayAsync(Guid storeId, CancellationToken ct);
    Task<List<Transaction>> GetRecentTransactionsAsync(Guid storeId, int count, CancellationToken ct);

}