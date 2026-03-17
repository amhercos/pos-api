using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Dto
{
    public record ProductDto(
    Guid Id,
    string Name,
    string? Description,
    decimal Price,
    int StockQuantity,
    string CategoryName,
    Guid CategoryId);
}
