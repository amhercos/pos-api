using Application.Interfaces;
using Domain.Entities.Common;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace DbMigration.PostgreSQL
{
    public class PostgresPosDbContext : PosDbContext
    {
        public PostgresPosDbContext(
            DbContextOptions options,
            ICurrentUserService currentUserService)
            : base(options, currentUserService)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType) && !entityType.ClrType.IsAbstract)
                {
                    builder.Entity(entityType.ClrType)
                        .Property(nameof(BaseEntity.RowVersion))
                        .IsRowVersion();
                }
            }
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                return await base.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateException dbEx) when (dbEx.InnerException is PostgresException pg && pg.SqlState == PostgresErrorCodes.UniqueViolation)
            {
                var message = pg.ConstraintName switch
                {
                    "IX_AspNetUsers_UserName" => "The username is already taken.",
                    "IX_Categories_CategoryName" => "This category name already exists.",
                    "IX_Products_Name" => "A product with this name already exists in this store.",
                    _ => "A record with this information already exists."
                };

                throw new InvalidOperationException($"A unique constraint violation occurred: {message}", dbEx);
            }
        }
    }
}