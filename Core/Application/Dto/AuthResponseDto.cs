namespace Application.Dto
{
    public record AuthResponseDto(
        string Token, 
        string FullName, 
        string Username,
        string Role);
}
