using Domain.Entities;

namespace Application.Interfaces.Repositories;

public interface ITransactionRepository
{
    void Add(Transaction transaction);
    Task<Transaction?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IEnumerable<Transaction>> GetAllAsync(CancellationToken ct);
}