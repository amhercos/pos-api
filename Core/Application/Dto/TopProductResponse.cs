
namespace Application.Dto
{
    public record TopProductResponse
    {
        public string Name { get; init; } = string.Empty;
        public int QuantitySold { get; init; }
    }
}
