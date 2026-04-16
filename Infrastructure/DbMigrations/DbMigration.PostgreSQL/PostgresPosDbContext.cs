using Application.Interfaces;
using Domain.Entities.Common;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DbMigration.PostgreSQL;

public class PostgresPosDbContext : PosDbContext
{
    private readonly ICurrentUserService _currentUserService;

    public PostgresPosDbContext(
        DbContextOptions<PostgresPosDbContext> options,
        ICurrentUserService currentUserService)
        : base(options, currentUserService)
    {
        _currentUserService = currentUserService;
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {

        base.OnModelCreating(builder);

        builder.Ignore<User>();
        builder.Ignore<Store>();

        if (!string.IsNullOrWhiteSpace(_currentUserService.SchemaName))
        {
            builder.HasDefaultSchema(_currentUserService.SchemaName);
        }
        else
        {
            builder.HasDefaultSchema(null);
            foreach (var entity in builder.Model.GetEntityTypes())
            {
                entity.SetSchema(null);
            }
        }

        ApplyPostgresConcurrencyTokens(builder);
    }

    private static void ApplyPostgresConcurrencyTokens(ModelBuilder builder)
    {
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType) && !entityType.ClrType.IsAbstract)
            {
                builder.Entity(entityType.ClrType)
                    .Property(nameof(BaseEntity.RowVersion))
                    .HasColumnName("xmin")
                    .HasColumnType("xid")
                    .ValueGeneratedOnAddOrUpdate()
                    .IsConcurrencyToken();
            }
        }
    }
}