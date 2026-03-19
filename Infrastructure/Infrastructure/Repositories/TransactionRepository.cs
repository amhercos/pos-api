using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class TransactionRepository(PosDbContext context) : ITransactionRepository
{
    public void Add(Transaction transaction) => context.Transactions.Add(transaction);

    public async Task<Transaction?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await context.Transactions
            .Include(x => x.User)
            .Include(t => t.Items)
            .ThenInclude(ti => ti.Product)
            .FirstOrDefaultAsync(t => t.Id == id, ct);
    }

    public async Task<IEnumerable<Transaction>> GetAllAsync(CancellationToken ct)
    {
        return await context.Transactions
            .Include(t => t.Items)
            .OrderByDescending(t => t.TransactionDate)
            .ToListAsync(ct);
    }

    public async Task<decimal> GetTotalRevenueTodayAsync(Guid storeId, CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        return await context.Transactions
            .Where(t => t.StoreId == storeId && t.TransactionDate.Date == today)
            .SumAsync(t => (decimal?)t.TotalAmount, ct) ?? 0;
    }

    public async Task<int> GetTotalTransactionsTodayAsync(Guid storeId, CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        return await context.Transactions
            .CountAsync(t => t.StoreId == storeId && t.TransactionDate.Date == today, ct);
    }

    public async Task<List<Transaction>> GetRecentTransactionsAsync(Guid storeId, int count, CancellationToken ct)
    {
        return await context.Transactions
            .Include(t => t.Items)
            .Where(t => t.StoreId == storeId)
            .OrderByDescending(t => t.TransactionDate)
            .Take(count)
            .ToListAsync(ct);
    }
}