using Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace Infrastructure.Persistence;

public class TenantModelCacheKeyFactory : IModelCacheKeyFactory
{
    public object Create(DbContext context, bool designTime)
    {
        if (context is PosDbContext posContext)
        {
            return (context.GetType(), posContext.GetCurrentSchema(), designTime);
        }

        return (context.GetType(), designTime);
    }
}