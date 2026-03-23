using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class TransactionRepository(PosDbContext context) : ITransactionRepository
{
    public void Add(Transaction transaction) => context.Transactions.Add(transaction);

    public async Task<Transaction?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await context.Transactions
            .AsNoTracking()
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
            .AsNoTracking()
            .Where(t => t.StoreId == storeId && t.TransactionDate.Date >= today)
            .SumAsync(t => (decimal?)t.TotalAmount, ct) ?? 0;
    }

    public async Task<int> GetTotalTransactionsTodayAsync(Guid storeId, CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        return await context.Transactions
            .CountAsync(t => t.StoreId == storeId && t.TransactionDate.Date == today, ct);
    }

    public async Task<(List<Transaction> Items, int TotalCount)> GetRecentTransactionsAsync(
     Guid storeId,
     int page,
     int pageSize,
     CancellationToken ct)
    {
        var query = context.Transactions
            .AsNoTracking()
            .Where(t => t.StoreId == storeId);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .Include(t => t.Items)
            .OrderByDescending(t => t.TransactionDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task<List<Transaction>> GetByCustomerIdAsync(Guid customerCreditId, CancellationToken ct)
    {
        return await context.Transactions
            .AsNoTracking()
            .Include(t => t.Items)
            .Where(t => t.CustomerCreditId == customerCreditId)
            .OrderByDescending(t => t.TransactionDate)
            .ToListAsync(ct);
    }
}