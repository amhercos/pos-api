namespace Application.Dto
{
    public record BasketItemDto(
    Guid ProductId,
    int Quantity,
    decimal UnitPrice);
}
