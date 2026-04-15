using Domain.Entities;

namespace Application.Interfaces
{
    public interface IJwtService
    {
        Task<string> GenerateToken(User user);
    }
}