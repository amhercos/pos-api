using Application.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Reflection;
using System.Text.Json.Serialization;

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

        //protected override void OnModelCreating(ModelBuilder modelBuilder)
        //{
        //    base.OnModelCreating(modelBuilder);

        //    foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        //    {
        //        var clrType = entityType.ClrType;
        //        if (clrType == null) continue;

        //        foreach (var property in clrType.GetProperties())
        //        {
        //            var jsonAttribute = property.GetCustomAttribute<JsonPropertyNameAttribute>();
        //            if (jsonAttribute != null)
        //            {
        //                modelBuilder.Entity(clrType)
        //                    .Property(property.Name)
        //                    .HasColumnName(jsonAttribute.Name);
        //            }
        //        }
        //    }
        //}
    }
}