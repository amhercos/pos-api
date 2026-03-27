using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Dto
{
    public record StoreSettingsResponseDto(
    string StoreName,
    string Location,
    int LowStockThreshold,
    int NearExpiryAlertDays
);

    public record UserProfileResponseDto(
        string FullName,
        string UserName
    );
}
