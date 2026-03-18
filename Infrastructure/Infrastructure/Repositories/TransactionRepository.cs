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
            .Include(t => t.Items)
            .FirstOrDefaultAsync(t => t.Id == id, ct);
    }

    public async Task<IEnumerable<Transaction>> GetAllAsync(CancellationToken ct)
    {
        return await context.Transactions
            .Include(t => t.Items)
            .OrderByDescending(t => t.TransactionDate)
            .ToListAsync(ct);
    }
}