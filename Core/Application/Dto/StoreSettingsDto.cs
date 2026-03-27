

namespace Application.Dto
{
    public record UpdateStoreSettingsDto(
       string StoreName,
       string Location,
       int LowStockThreshold, 
       int NearExpiryAlertDays
   )   
    {

    };
   public record UpdateProfileDto(
    string FullName,
    string UserName
);

    // Password Change DTO
    public record ChangePasswordDto(
        string CurrentPassword,
        string NewPassword
    );
}
