
namespace Application.Dto;

public record StaffDto(
    string Id,
    string FullName,
    string Email,
    string Role,
    DateTime CreatedAt);