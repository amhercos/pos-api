
namespace Application.Dto
{
    public record CategoryDto(
        Guid Id,
        string Name,
        int ProductCount = 0);

}
