using Application.Dto;
using MediatR;
using System.Text.Json.Serialization;

namespace Application.Features.Products.Commands;

public class UpdateProductCommand : IRequest<ProductDto>
{
    [JsonIgnore]
    public Guid Id { get; set; }

    public required string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int LowStockThreshold { get; set; }
    public DateOnly? ExpiryDate { get; set; }
    public Guid CategoryId { get; set; }
}