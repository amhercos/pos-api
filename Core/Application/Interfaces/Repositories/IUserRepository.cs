using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<bool> IsEmailUniqueAsync(string email);
        Task<IEnumerable<User>> GetStaffByStoreIdAsync(Guid storeId, CancellationToken ct);
        Task<User?> GetByIdAsync(Guid Id, CancellationToken ct = default);
    }
}
