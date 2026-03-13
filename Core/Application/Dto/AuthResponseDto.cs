namespace Application.Dto
{
    public record AuthResponseDTO(
        string Token, 
        string FullName, 
        string Username);
}
