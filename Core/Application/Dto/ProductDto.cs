
namespace Application.Dto
{
    public record ProductDto(
    Guid Id,
    string Name,
    string? Description,
    decimal Price,
    int StockQuantity,
    int LowStockThreshold,
    string CategoryName,
    DateOnly? ExpiryDate,
    Guid? CategoryId);
}
