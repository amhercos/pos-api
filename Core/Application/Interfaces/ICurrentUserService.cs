namespace Application.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    Guid StoreId { get; }
    string? Role { get; }
    string? SchemaName { get; }
}