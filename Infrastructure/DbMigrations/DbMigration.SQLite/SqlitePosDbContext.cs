using Application.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata;

namespace DbMigration.SQLite
{
    public class SqlitePosDbContext : PosDbContext
    {
        public SqlitePosDbContext(
            DbContextOptions options,
            ICurrentUserService currentUserService)
            : base(options, currentUserService)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                var rowVersionProp = entity.FindProperty("RowVersion");
                if (rowVersionProp != null && rowVersionProp.ClrType == typeof(byte[]))
                {

                    rowVersionProp.ValueGenerated = ValueGenerated.Never;
                    rowVersionProp.IsConcurrencyToken = true;
                }
            }
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateRowVersions();

            try
            {
                return await base.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException?.Message.Contains("UNIQUE constraint failed") == true)
                {
                    throw new InvalidOperationException("A unique record already exists in the local database.", ex);
                }

                if (ex.InnerException?.Message.Contains("NOT NULL constraint failed") == true)
                {
                    throw new InvalidOperationException("SQLite NOT NULL constraint failed. Ensure RowVersion is being set.", ex);
                }
                throw;
            }
        }

        private void UpdateRowVersions()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

            foreach (var entry in entries)
            {
                var prop = entry.Metadata.FindProperty("RowVersion");
                if (prop != null && prop.ClrType == typeof(byte[]))
                {
                    entry.Property("RowVersion").CurrentValue = Guid.NewGuid().ToByteArray();
                }
            }
        }
    }
}