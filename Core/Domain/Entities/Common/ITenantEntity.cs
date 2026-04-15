namespace Domain.Entities.Common;

public interface ITenantEntity
{
    Guid StoreId { get; set; }
}