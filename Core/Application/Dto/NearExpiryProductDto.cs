namespace Application.Dto
{
    public record NearExpiryProductDto(
        Guid Id,
        string Name,
        int Stock,
        DateOnly? ExpiryDate,
        int DaysUntilExpiry
    );
}
